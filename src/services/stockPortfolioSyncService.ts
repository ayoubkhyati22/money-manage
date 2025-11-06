// src/services/stockPortfolioSyncService.ts
import { supabase } from '../lib/supabase'
import { stockPriceService } from './stockPriceService'

/**
 * Service de synchronisation du portfolio avec les prix en temps réel
 * Mettre à jour les prix en cache et recalculer les valeurs du portfolio
 */
export const stockPortfolioSyncService = {
  /**
   * Synchroniser tous les prix du portfolio d'un utilisateur
   */
  async syncPortfolioPrices(userId: string): Promise<{
    success: boolean
    updated: number
    failed: number
    errors: string[]
  }> {
    console.log(`🔄 [Sync] Starting portfolio sync for user ${userId}`)
    
    try {
      // 1. Récupérer le portfolio
      const { data: portfolio, error: portfolioError } = await supabase
        .from('stock_portfolio')
        .select(`
          symbol,
          moroccan_companies!inner(casablanca_api_id)
        `)
        .eq('user_id', userId)

      if (portfolioError) throw portfolioError

      if (!portfolio || portfolio.length === 0) {
        console.log('ℹ️ [Sync] No stocks in portfolio')
        return { success: true, updated: 0, failed: 0, errors: [] }
      }

      // 2. Récupérer les API IDs
      const apiIds = portfolio
        .map(p => (p.moroccan_companies as any)?.casablanca_api_id)
        .filter(id => id !== null && id !== undefined)
        .map(id => id.toString())

      console.log(`📊 [Sync] Syncing ${apiIds.length} stocks`)

      // 3. Mettre à jour les prix en batch
      let updated = 0
      let failed = 0
      const errors: string[] = []

      for (const apiId of apiIds) {
        try {
          // Utiliser fetchCurrentPrice qui met à jour le cache automatiquement
          const price = await stockPriceService.fetchCurrentPrice(apiId)
          
          if (price) {
            updated++
            console.log(`✅ [Sync] Updated ${apiId}: ${price.currentPrice} MAD`)
          } else {
            failed++
            console.warn(`⚠️ [Sync] Failed to fetch price for ${apiId}`)
            errors.push(`No price data for API ID ${apiId}`)
          }

          // Délai pour éviter de surcharger l'API
          await new Promise(resolve => setTimeout(resolve, 300))
        } catch (error: any) {
          failed++
          console.error(`❌ [Sync] Error for ${apiId}:`, error)
          errors.push(`${apiId}: ${error.message}`)
        }
      }

      console.log(`✅ [Sync] Complete: ${updated} updated, ${failed} failed`)

      return {
        success: failed === 0,
        updated,
        failed,
        errors
      }
    } catch (error: any) {
      console.error('❌ [Sync] Fatal error:', error)
      return {
        success: false,
        updated: 0,
        failed: 0,
        errors: [error.message]
      }
    }
  },

  /**
   * Synchroniser un seul stock
   */
  async syncSingleStock(casablancaApiId: number): Promise<boolean> {
    console.log(`🔄 [Sync] Syncing single stock: ${casablancaApiId}`)
    
    try {
      const price = await stockPriceService.fetchCurrentPrice(casablancaApiId.toString())
      
      if (price) {
        console.log(`✅ [Sync] Updated: ${price.currentPrice} MAD`)
        return true
      } else {
        console.warn(`⚠️ [Sync] No price data available`)
        return false
      }
    } catch (error: any) {
      console.error(`❌ [Sync] Error:`, error)
      return false
    }
  },

  /**
   * Calculer le résumé du portfolio avec les derniers prix
   */
  async getPortfolioSummary(userId: string): Promise<{
    totalHoldings: number
    totalInvested: number
    currentValue: number
    totalGain: number
    totalGainPercent: number
    topGainer: { symbol: string; gainPercent: number } | null
    topLoser: { symbol: string; lossPercent: number } | null
  }> {
    console.log(`📊 [Summary] Calculating portfolio summary for user ${userId}`)

    try {
      // Récupérer le portfolio
      const { data: portfolio, error } = await supabase
        .from('stock_portfolio')
        .select(`
          symbol,
          company_name,
          total_quantity,
          total_invested,
          avg_buy_price,
          moroccan_companies!inner(casablanca_api_id)
        `)
        .eq('user_id', userId)

      if (error) throw error

      if (!portfolio || portfolio.length === 0) {
        return {
          totalHoldings: 0,
          totalInvested: 0,
          currentValue: 0,
          totalGain: 0,
          totalGainPercent: 0,
          topGainer: null,
          topLoser: null
        }
      }

      let totalInvested = 0
      let currentValue = 0
      const holdings: Array<{ symbol: string; gainPercent: number }> = []

      // Calculer pour chaque holding
      for (const holding of portfolio) {
        totalInvested += holding.total_invested

        const apiId = (holding.moroccan_companies as any)?.casablanca_api_id

        if (apiId) {
          // Récupérer le prix avec cache
          const price = await stockPriceService.getPriceWithCache(apiId.toString())
          
          if (price) {
            const holdingValue = holding.total_quantity * price.currentPrice
            currentValue += holdingValue
            
            const holdingGain = holdingValue - holding.total_invested
            const holdingGainPercent = holding.total_invested > 0 
              ? (holdingGain / holding.total_invested) * 100 
              : 0

            holdings.push({
              symbol: holding.symbol,
              gainPercent: holdingGainPercent
            })
          } else {
            // Fallback sur prix d'achat
            currentValue += holding.total_quantity * holding.avg_buy_price
            holdings.push({ symbol: holding.symbol, gainPercent: 0 })
          }
        } else {
          // Pas d'API ID, utiliser prix d'achat
          currentValue += holding.total_quantity * holding.avg_buy_price
          holdings.push({ symbol: holding.symbol, gainPercent: 0 })
        }
      }

      const totalGain = currentValue - totalInvested
      const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

      // Trouver top gainer et loser
      holdings.sort((a, b) => b.gainPercent - a.gainPercent)
      const topGainer = holdings.length > 0 && holdings[0].gainPercent > 0 ? holdings[0] : null
      const topLoser = holdings.length > 0 && holdings[holdings.length - 1].gainPercent < 0 
        ? { symbol: holdings[holdings.length - 1].symbol, lossPercent: holdings[holdings.length - 1].gainPercent }
        : null

      console.log(`✅ [Summary] Complete:`, {
        holdings: portfolio.length,
        value: currentValue.toFixed(2),
        gain: totalGain.toFixed(2)
      })

      return {
        totalHoldings: portfolio.length,
        totalInvested,
        currentValue,
        totalGain,
        totalGainPercent,
        topGainer,
        topLoser
      }
    } catch (error: any) {
      console.error('❌ [Summary] Error:', error)
      throw error
    }
  }
}