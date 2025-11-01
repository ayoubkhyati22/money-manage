// src/services/stockPriceService.ts
import { supabase } from '../lib/supabase'

const CASABLANCA_API_BASE = 'https://www.casablanca-bourse.com/api/proxy/fr/api/bourse_data'
const CACHE_DURATION = 5 * 60 * 1000 // 5 minutes en millisecondes

interface CasablancaInstrumentData {
  drupal_internal__id: number
  coursCourant: string
  closingPrice: string
  openingPrice: string
  highPrice: string
  lowPrice: string
  cumulVolumeEchange: string
  ratioConsolide: string
  created: string
}

interface StockPrice {
  symbol: string
  currentPrice: number
  closingPrice: number
  openPrice: number
  highPrice: number
  lowPrice: number
  volume: number
  lastUpdate: string
  change?: number
  changePercent?: number
}

export const stockPriceService = {
  /**
   * Récupérer le prix actuel d'une action depuis l'API Casablanca
   */
  async fetchCurrentPrice(casablancaApiId: string): Promise<StockPrice | null> {
    try {
      // Construire l'URL de l'API
      const url = new URL(`${CASABLANCA_API_BASE}/instrument_history`)
      
      // Ajouter les paramètres
      url.searchParams.append('fields[instrument_history]', 'drupal_internal__id,coursCourant,cumulVolumeEchange,created,lowPrice,highPrice,openingPrice,closingPrice,ratioConsolide')
      url.searchParams.append('sort[date-seance][path]', 'created')
      url.searchParams.append('sort[date-seance][direction]', 'DESC')
      url.searchParams.append('filter[instrument][condition][path]', 'symbol.meta.drupal_internal__target_id')
      url.searchParams.append('filter[instrument][condition][value]', casablancaApiId)
      url.searchParams.append('filter[instrument][condition][operator]', '=')
      url.searchParams.append('page[offset]', '0')
      url.searchParams.append('page[limit]', '1')

      // Faire la requête
      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/vnd.api+json',
          'Content-Type': 'application/vnd.api+json',
          'User-Agent': 'Mozilla/5.0 (iPhone; CPU iPhone OS 18_5 like Mac OS X) AppleWebKit/605.1.15'
        }
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      // Vérifier si on a des données
      if (!data.data || data.data.length === 0) {
        console.warn(`No data found for instrument ${casablancaApiId}`)
        return null
      }

      const attributes: CasablancaInstrumentData = data.data[0].attributes

      // Parser les prix
      const currentPrice = parseFloat(attributes.coursCourant || '0')
      const closingPrice = parseFloat(attributes.closingPrice || '0')
      const openPrice = parseFloat(attributes.openingPrice || '0')

      // Calculer la variation
      const change = currentPrice - closingPrice
      const changePercent = closingPrice > 0 ? (change / closingPrice) * 100 : 0

      return {
        symbol: casablancaApiId,
        currentPrice,
        closingPrice,
        openPrice,
        highPrice: parseFloat(attributes.highPrice || '0'),
        lowPrice: parseFloat(attributes.lowPrice || '0'),
        volume: parseFloat(attributes.cumulVolumeEchange || '0'),
        lastUpdate: attributes.created,
        change,
        changePercent
      }
    } catch (error) {
      console.error('Error fetching price from Casablanca API:', error)
      return null
    }
  },

  /**
   * Récupérer les prix de plusieurs actions en batch
   */
  async fetchMultiplePrices(casablancaApiIds: string[]): Promise<Map<string, StockPrice>> {
    const pricesMap = new Map<string, StockPrice>()

    // Faire les requêtes en parallèle avec un délai pour éviter le rate limiting
    const results = await Promise.allSettled(
      casablancaApiIds.map(async (id, index) => {
        // Délai progressif pour éviter de surcharger l'API
        await new Promise(resolve => setTimeout(resolve, index * 300))
        const price = await this.fetchCurrentPrice(id)
        return { id, price }
      })
    )

    // Traiter les résultats
    results.forEach((result) => {
      if (result.status === 'fulfilled' && result.value.price) {
        pricesMap.set(result.value.id, result.value.price)
      }
    })

    return pricesMap
  },

  /**
   * Récupérer le prix depuis le cache en DB (si < 5 min)
   */
  async getCachedPrice(casablancaApiId: string): Promise<StockPrice | null> {
    try {
      const { data, error } = await supabase
        .from('moroccan_companies')
        .select('last_price, last_price_updated_at, symbol, name')
        .eq('casablanca_api_id', casablancaApiId)
        .single()

      if (error || !data || !data.last_price) {
        return null
      }

      // Vérifier si le cache est encore valide (< 5 minutes)
      const cacheAge = Date.now() - new Date(data.last_price_updated_at).getTime()
      if (cacheAge > CACHE_DURATION) {
        return null // Cache expiré
      }

      return {
        symbol: data.symbol,
        currentPrice: parseFloat(data.last_price),
        closingPrice: parseFloat(data.last_price),
        openPrice: 0,
        highPrice: 0,
        lowPrice: 0,
        volume: 0,
        lastUpdate: data.last_price_updated_at
      }
    } catch (error) {
      console.error('Error getting cached price:', error)
      return null
    }
  },

  /**
   * Mettre à jour le cache en DB
   */
  async updatePriceCache(casablancaApiId: string, price: number): Promise<void> {
    try {
      await supabase
        .from('moroccan_companies')
        .update({
          last_price: price,
          last_price_updated_at: new Date().toISOString()
        })
        .eq('casablanca_api_id', casablancaApiId)
    } catch (error) {
      console.error('Error updating price cache:', error)
    }
  },

  /**
   * Récupérer un prix avec fallback sur le cache
   */
  async getPriceWithCache(casablancaApiId: string): Promise<StockPrice | null> {
    // 1. Essayer le cache d'abord
    const cachedPrice = await this.getCachedPrice(casablancaApiId)
    if (cachedPrice) {
      return cachedPrice
    }

    // 2. Sinon, fetch depuis l'API
    const freshPrice = await this.fetchCurrentPrice(casablancaApiId)
    if (freshPrice) {
      // Mettre à jour le cache
      await this.updatePriceCache(casablancaApiId, freshPrice.currentPrice)
      return freshPrice
    }

    return null
  },

  /**
   * Calculer la valeur totale du portefeuille avec prix en temps réel
   */
  async calculatePortfolioValue(userId: string): Promise<{
    totalInvested: number
    currentValue: number
    totalGain: number
    totalGainPercent: number
  }> {
    try {
      // 1. Récupérer le portefeuille de l'utilisateur
      const { data: portfolio, error } = await supabase
        .from('stock_portfolio')
        .select(`
          *,
          moroccan_companies!inner(casablanca_api_id)
        `)
        .eq('user_id', userId)

      if (error) throw error

      let totalInvested = 0
      let currentValue = 0

      // 2. Pour chaque holding, récupérer le prix actuel
      for (const holding of portfolio || []) {
        totalInvested += holding.total_invested

        const casablancaApiId = (holding.moroccan_companies as any)?.casablanca_api_id

        if (casablancaApiId) {
          const price = await this.getPriceWithCache(casablancaApiId)
          if (price) {
            currentValue += holding.total_quantity * price.currentPrice
          } else {
            // Fallback sur le prix d'achat moyen si pas de prix actuel
            currentValue += holding.total_quantity * holding.avg_buy_price
          }
        } else {
          // Pas d'API ID, utiliser le prix d'achat
          currentValue += holding.total_quantity * holding.avg_buy_price
        }
      }

      const totalGain = currentValue - totalInvested
      const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

      return {
        totalInvested,
        currentValue,
        totalGain,
        totalGainPercent
      }
    } catch (error) {
      console.error('Error calculating portfolio value:', error)
      return {
        totalInvested: 0,
        currentValue: 0,
        totalGain: 0,
        totalGainPercent: 0
      }
    }
  }
}