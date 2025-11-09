// src/services/stockPriceManager.ts
import { stockPriceService } from './stockPriceService'
import { stockPriceEventBus } from '../utils/stockPriceEventBus'

interface PriceCache {
  price: number
  timestamp: number
  symbol: string
}

class StockPriceManager {
  private priceCache: Map<string, PriceCache> = new Map()
  private isFetching = false
  private lastFetchTime = 0
  private readonly CACHE_DURATION = 5 * 60 * 1000 // 5 minutes
  private readonly MIN_FETCH_INTERVAL = 10000 // 10 secondes minimum entre chaque fetch global

  /**
   * Récupérer les prix pour plusieurs actions (avec contrôle strict)
   */
  async fetchPrices(casablancaApiIds: string[], forceRefresh = false): Promise<Map<string, any>> {
    console.log(`🎯 [PriceManager] Fetch requested for ${casablancaApiIds.length} stocks`)
    
    // Éviter les appels trop rapprochés
    const now = Date.now()
    if (!forceRefresh && this.isFetching) {
      console.log(`⏸️ [PriceManager] Already fetching, returning cached data`)
      return this.getCachedPrices(casablancaApiIds)
    }

    if (!forceRefresh && (now - this.lastFetchTime) < this.MIN_FETCH_INTERVAL) {
      console.log(`⏸️ [PriceManager] Too soon since last fetch, returning cached data`)
      return this.getCachedPrices(casablancaApiIds)
    }

    this.isFetching = true
    this.lastFetchTime = now

    try {
      const results = new Map<string, any>()
      
      // Filtrer les IDs qui ont besoin d'un refresh
      const idsToFetch = casablancaApiIds.filter(id => {
        if (forceRefresh) return true
        const cached = this.priceCache.get(id)
        if (!cached) return true
        return (now - cached.timestamp) > this.CACHE_DURATION
      })

      console.log(`🔄 [PriceManager] Fetching ${idsToFetch.length}/${casablancaApiIds.length} prices (others cached)`)

      // Récupérer les prix manquants ou expirés
      if (idsToFetch.length > 0) {
        const fetchedPrices = await stockPriceService.fetchMultiplePricesWithCache(idsToFetch)
        
        // Mettre à jour le cache
        fetchedPrices.forEach((priceData, id) => {
          this.priceCache.set(id, {
            price: priceData.currentPrice,
            timestamp: now,
            symbol: priceData.symbol
          })
          results.set(id, priceData)
        })
      }

      // Ajouter les prix en cache pour les autres IDs
      casablancaApiIds.forEach(id => {
        if (!results.has(id)) {
          const cached = this.priceCache.get(id)
          if (cached) {
            results.set(id, {
              symbol: cached.symbol,
              currentPrice: cached.price,
              lastUpdate: new Date(cached.timestamp).toISOString(),
              change: 0,
              changePercent: 0
            })
          }
        }
      })

      console.log(`✅ [PriceManager] Returned ${results.size} prices`)
      return results

    } catch (error) {
      console.error('❌ [PriceManager] Error:', error)
      // En cas d'erreur, retourner les données en cache
      return this.getCachedPrices(casablancaApiIds)
    } finally {
      this.isFetching = false
    }
  }

  /**
   * Récupérer un prix unique avec cache
   */
  async fetchSinglePrice(casablancaApiId: string, forceRefresh = false): Promise<any | null> {
    const now = Date.now()
    const cached = this.priceCache.get(casablancaApiId)

    // Retourner le cache si valide
    if (!forceRefresh && cached && (now - cached.timestamp) < this.CACHE_DURATION) {
      console.log(`💾 [PriceManager] Cache hit for ${casablancaApiId}`)
      return {
        symbol: cached.symbol,
        currentPrice: cached.price,
        lastUpdate: new Date(cached.timestamp).toISOString()
      }
    }

    // Sinon, fetch depuis l'API
    try {
      const priceData = await stockPriceService.getPriceWithCache(casablancaApiId)
      
      if (priceData) {
        this.priceCache.set(casablancaApiId, {
          price: priceData.currentPrice,
          timestamp: now,
          symbol: priceData.symbol
        })
      }

      return priceData
    } catch (error) {
      console.error(`❌ [PriceManager] Error fetching ${casablancaApiId}:`, error)
      return cached ? {
        symbol: cached.symbol,
        currentPrice: cached.price,
        lastUpdate: new Date(cached.timestamp).toISOString()
      } : null
    }
  }

  /**
   * Récupérer les prix en cache
   */
  private getCachedPrices(casablancaApiIds: string[]): Map<string, any> {
    const results = new Map<string, any>()
    
    casablancaApiIds.forEach(id => {
      const cached = this.priceCache.get(id)
      if (cached) {
        results.set(id, {
          symbol: cached.symbol,
          currentPrice: cached.price,
          lastUpdate: new Date(cached.timestamp).toISOString(),
          change: 0,
          changePercent: 0
        })
      }
    })

    return results
  }

  /**
   * Vider le cache
   */
  clearCache() {
    console.log('🗑️ [PriceManager] Clearing cache')
    this.priceCache.clear()
  }

  /**
   * Forcer un refresh complet
   */
  async forceRefresh(casablancaApiIds: string[]): Promise<Map<string, any>> {
    console.log('🔄 [PriceManager] Force refresh requested')
    this.clearCache()
    return this.fetchPrices(casablancaApiIds, true)
  }

  /**
   * Obtenir l'état du cache
   */
  getCacheStatus() {
    return {
      size: this.priceCache.size,
      isFetching: this.isFetching,
      lastFetchTime: this.lastFetchTime
    }
  }
}

// Export singleton
export const stockPriceManager = new StockPriceManager()