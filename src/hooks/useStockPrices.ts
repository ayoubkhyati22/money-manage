// src/hooks/useStockPrices.ts
import { useState, useEffect, useCallback } from 'react'
import { stockPriceManager } from '../services/stockPriceManager'

interface StockPrice {
  symbol: string
  currentPrice: number
  change?: number
  changePercent?: number
  lastUpdate: string
}

export function useStockPrices(
  casablancaApiIds: string[],
  autoRefresh: boolean = false // Désactivé par défaut
) {
  const [prices, setPrices] = useState<Map<string, StockPrice>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [fetchCount, setFetchCount] = useState(0)

  const fetchPrices = useCallback(async (forceRefresh = false) => {
    console.log(`🔄 [Hook] Fetching prices for ${casablancaApiIds.length} stocks (force: ${forceRefresh})`)
    
    if (casablancaApiIds.length === 0) {
      console.log(`⚠️ [Hook] No API IDs provided, skipping fetch`)
      setLoading(false)
      return
    }

    try {
      setError(null)
      setLoading(true)
      
      // Utiliser le manager centralisé
      const pricesMap = await stockPriceManager.fetchPrices(casablancaApiIds, forceRefresh)
      
      console.log(`✅ [Hook] Fetched ${pricesMap.size}/${casablancaApiIds.length} prices`)
      
      setPrices(pricesMap)
      setLastRefresh(new Date())
      setFetchCount(prev => prev + 1)
      
      // Avertir si certains prix n'ont pas été récupérés
      if (pricesMap.size < casablancaApiIds.length) {
        const missingCount = casablancaApiIds.length - pricesMap.size
        console.warn(`⚠️ [Hook] ${missingCount} prices could not be fetched`)
        setError(`${missingCount} prix n'ont pas pu être récupérés`)
      }
    } catch (err: any) {
      const errorMessage = err.message || 'Failed to fetch stock prices'
      console.error(`❌ [Hook Error]`, errorMessage, err)
      setError(errorMessage)
    } finally {
      setLoading(false)
    }
  }, [casablancaApiIds])

  // Fetch initial UNIQUEMENT
  useEffect(() => {
    console.log(`🚀 [Hook] Initial fetch for ${casablancaApiIds.length} stocks`)
    fetchPrices(false)
  }, []) // Dépendances vides pour ne déclencher qu'une fois

  // PAS de auto-refresh automatique - uniquement manuel via le bouton

  return {
    prices,
    loading,
    error,
    lastRefresh,
    refresh: () => fetchPrices(true), // Force refresh quand appelé manuellement
    fetchCount
  }
}