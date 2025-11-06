// src/services/stockPriceService.ts
import { supabase } from '../lib/supabase'
import { stockPriceEventBus } from '../utils/stockPriceEventBus'

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
   * 🔥 MÉTHODE PRINCIPALE - Récupérer le prix actuel d'une action depuis l'API Casablanca
   * ÉMET UN ÉVÉNEMENT 'price:fetched' après chaque récupération réussie
   */
  async fetchCurrentPrice(casablancaApiId: string): Promise<StockPrice | null> {
    console.log(`🔍 [fetchCurrentPrice] ID: ${casablancaApiId}`)
    
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

      console.log(`🌐 [API Request] ${url.toString().substring(0, 150)}...`)

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
        console.error(`❌ [API Error] Status ${response.status} for ID ${casablancaApiId}`)
        throw new Error(`API Error: ${response.status}`)
      }

      const data = await response.json()

      // Vérifier si on a des données
      if (!data.data || data.data.length === 0) {
        console.warn(`⚠️ [No Data] No data found for instrument ${casablancaApiId}`)
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

      console.log(`✅ [SUCCESS] ID ${casablancaApiId}: ${currentPrice} MAD (${change >= 0 ? '+' : ''}${changePercent.toFixed(2)}%)`)

      const priceData: StockPrice = {
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

      // ✅ Mettre à jour le cache en arrière-plan
      this.updatePriceCache(casablancaApiId, currentPrice).catch(err => 
        console.error(`⚠️ [Cache Update Failed] for ${casablancaApiId}:`, err)
      )

      // 🔥 ÉMETTRE UN ÉVÉNEMENT pour notifier tous les composants
      stockPriceEventBus.emit('price:fetched', {
        casablancaApiId,
        price: currentPrice,
        timestamp: attributes.created
      })

      return priceData
    } catch (error) {
      console.error(`❌ [fetchCurrentPrice Error] ID ${casablancaApiId}:`, error)
      return null
    }
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
        console.log(`⏰ [Cache Expired] ID ${casablancaApiId} (${Math.round(cacheAge / 1000)}s old)`)
        return null // Cache expiré
      }

      console.log(`💾 [Cache Hit] ID ${casablancaApiId}: ${data.last_price} MAD (${Math.round(cacheAge / 1000)}s old)`)

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
      console.error(`❌ [Cache Error] ID ${casablancaApiId}:`, error)
      return null
    }
  },

  /**
   * Mettre à jour le cache en DB
   */
  async updatePriceCache(casablancaApiId: string, price: number): Promise<void> {
    try {
      const { error } = await supabase
        .from('moroccan_companies')
        .update({
          last_price: price,
          last_price_updated_at: new Date().toISOString()
        })
        .eq('casablanca_api_id', casablancaApiId)

      if (error) {
        console.error(`❌ [Cache Update Error] ID ${casablancaApiId}:`, error)
      } else {
        console.log(`💾 [Cache Updated] ID ${casablancaApiId} -> ${price} MAD`)
      }
    } catch (error) {
      console.error(`❌ [Cache Update Error] ID ${casablancaApiId}:`, error)
    }
  },

  /**
   * 🎯 MÉTHODE UNIFIÉE - Utilisée par le formulaire ET l'affichage temps réel
   * Récupérer un prix avec fallback sur le cache
   */
  async getPriceWithCache(casablancaApiId: string): Promise<StockPrice | null> {
    console.log(`🎯 [getPriceWithCache] Starting for ID ${casablancaApiId}`)
    
    // 1. Essayer le cache d'abord (performances)
    const cachedPrice = await this.getCachedPrice(casablancaApiId)
    if (cachedPrice) {
      return cachedPrice
    }

    // 2. Sinon, fetch depuis l'API (émettra un événement 'price:fetched')
    console.log(`🌐 [Cache Miss] Fetching from API for ID ${casablancaApiId}`)
    const freshPrice = await this.fetchCurrentPrice(casablancaApiId)
    
    return freshPrice
  },

  /**
   * 🔄 Récupérer les prix de plusieurs actions en batch
   */
  async fetchMultiplePricesWithCache(casablancaApiIds: string[]): Promise<Map<string, StockPrice>> {
    console.log(`📊 [Batch] Fetching ${casablancaApiIds.length} prices`)
    const pricesMap = new Map<string, StockPrice>()

    if (casablancaApiIds.length === 0) {
      return pricesMap
    }

    // Faire les requêtes en parallèle avec délai progressif
    const results = await Promise.allSettled(
      casablancaApiIds.map(async (id, index) => {
        // Délai progressif pour éviter de surcharger l'API (300ms entre chaque)
        await new Promise(resolve => setTimeout(resolve, index * 300))
        
        // 🎯 UTILISE getPriceWithCache qui émettra des événements
        const price = await this.getPriceWithCache(id)
        return { id, price }
      })
    )

    // Traiter les résultats
    let successCount = 0
    let failureCount = 0
    
    results.forEach((result, index) => {
      if (result.status === 'fulfilled' && result.value.price) {
        pricesMap.set(result.value.id, result.value.price)
        successCount++
      } else {
        failureCount++
        console.error(`❌ [Batch Failed] ID ${casablancaApiIds[index]}`)
      }
    })

    console.log(`📊 [Batch Complete] ✅ ${successCount} | ❌ ${failureCount}`)

    return pricesMap
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
    console.log(`📊 [Portfolio] Calculating for user ${userId}`)
    
    try {
      // 1. Récupérer le portefeuille de l'utilisateur
      const { data: portfolio, error } = await supabase
        .from('stock_portfolio')
        .select(`
          *,
          moroccan_companies!inner(casablanca_api_id, symbol, name)
        `)
        .eq('user_id', userId)

      if (error) throw error

      let totalInvested = 0
      let currentValue = 0
      let pricesFetched = 0
      let pricesFallback = 0

      // 2. Pour chaque holding, récupérer le prix actuel
      for (const holding of portfolio || []) {
        totalInvested += holding.total_invested

        const casablancaApiId = (holding.moroccan_companies as any)?.casablanca_api_id

        if (casablancaApiId) {
          const price = await this.getPriceWithCache(casablancaApiId.toString())
          
          if (price) {
            currentValue += holding.total_quantity * price.currentPrice
            pricesFetched++
          } else {
            // Fallback sur le prix d'achat moyen
            currentValue += holding.total_quantity * holding.avg_buy_price
            pricesFallback++
            console.warn(`⚠️ [Fallback] Using avg_buy_price for ${holding.symbol}`)
          }
        } else {
          // Pas d'API ID, utiliser le prix d'achat
          currentValue += holding.total_quantity * holding.avg_buy_price
          pricesFallback++
          console.warn(`⚠️ [No API ID] ${holding.symbol}`)
        }
      }

      const totalGain = currentValue - totalInvested
      const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

      console.log(`✅ [Portfolio] Value: ${currentValue.toFixed(2)} MAD | Gain: ${totalGain >= 0 ? '+' : ''}${totalGainPercent.toFixed(2)}%`)
      console.log(`📊 [Portfolio] API: ${pricesFetched} | Fallback: ${pricesFallback}`)

      return {
        totalInvested,
        currentValue,
        totalGain,
        totalGainPercent
      }
    } catch (error) {
      console.error('❌ [Portfolio Error]:', error)
      return {
        totalInvested: 0,
        currentValue: 0,
        totalGain: 0,
        totalGainPercent: 0
      }
    }
  }
}