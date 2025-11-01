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

  const fetchPrices = useCallback(async () => {
    if (casablancaApiIds.length === 0) {
      setLoading(false)
      return
    }

    try {
      setError(null)
      const pricesMap = await stockPriceService.fetchMultiplePrices(casablancaApiIds)
      setPrices(pricesMap)
      setLastRefresh(new Date())
    } catch (err: any) {
      setError(err.message || 'Failed to fetch stock prices')
      console.error('Error in useStockPrices:', err)
    } finally {
      setLoading(false)
    }
  }, [casablancaApiIds])

  // Fetch initial
  useEffect(() => {
    fetchPrices()
  }, [fetchPrices])

  // Auto-refresh
  useEffect(() => {
    if (refreshInterval <= 0) return

    const interval = setInterval(() => {
      fetchPrices()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [refreshInterval, fetchPrices])

  return {
    prices,
    loading,
    error,
    lastRefresh,
    refresh: fetchPrices
  }
}