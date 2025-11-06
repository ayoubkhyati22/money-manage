// src/hooks/useStockPrices.ts
import { useState, useEffect, useCallback } from 'react'
import { stockPriceService } from '../services/stockPriceService'

interface StockPrice {
  symbol: string
  currentPrice: number
  change?: number
  changePercent?: number
  lastUpdate: string
}

export function useStockPrices(
  casablancaApiIds: string[],
  refreshInterval: number = 30000 // 30 secondes par défaut
) {
  const [prices, setPrices] = useState<Map<string, StockPrice>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date())
  const [fetchCount, setFetchCount] = useState(0)

  const fetchPrices = useCallback(async () => {
    console.log(`🔄 [Hook] Fetching prices for ${casablancaApiIds.length} stocks`)
    
    if (casablancaApiIds.length === 0) {
      console.log(`⚠️ [Hook] No API IDs provided, skipping fetch`)
      setLoading(false)
      return
    }

    try {
      setError(null)
      
      // Utiliser la version avec cache pour de meilleures performances
      const pricesMap = await stockPriceService.fetchMultiplePricesWithCache(casablancaApiIds)
      
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

  // Fetch initial
  useEffect(() => {
    console.log(`🚀 [Hook] Initial fetch for ${casablancaApiIds.length} stocks`)
    fetchPrices()
  }, [fetchPrices])

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) {
      console.log(`⏸️ [Hook] Auto-refresh disabled (interval: ${refreshInterval}ms)`)
      return
    }

    console.log(`⏰ [Hook] Setting up auto-refresh every ${refreshInterval / 1000}s`)
    
    const interval = setInterval(() => {
      console.log(`🔄 [Hook] Auto-refresh triggered (fetch #${fetchCount + 1})`)
      fetchPrices()
    }, refreshInterval)

    return () => {
      console.log(`🛑 [Hook] Cleaning up auto-refresh interval`)
      clearInterval(interval)
    }
  }, [refreshInterval, fetchPrices, fetchCount])

  // Log des changements de prix
  useEffect(() => {
    if (prices.size > 0) {
      console.log(`📊 [Hook] Current prices:`, Array.from(prices.entries()).map(([id, price]) => ({
        id,
        price: price.currentPrice,
        change: price.changePercent?.toFixed(2) + '%'
      })))
    }
  }, [prices])

  return {
    prices,
    loading,
    error,
    lastRefresh,
    refresh: fetchPrices,
    fetchCount // Nouveau: nombre de fois que les prix ont été récupérés
  }
}