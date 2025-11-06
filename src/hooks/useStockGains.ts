// src/hooks/useStockGains.ts
import { useState, useEffect, useCallback } from 'react'
import { useAuth } from './useAuth'
import { stockPriceService } from '../services/stockPriceService'
import { stockService } from '../services/stockService'

interface StockGainsData {
  totalInvested: number
  currentValue: number
  totalGain: number
  totalGainPercent: number
  realizedGains: number // Gains des ventes effectuées
  unrealizedGains: number // Gains potentiels (positions ouvertes)
  loading: boolean
  error: string | null
}

export function useStockGains(autoRefresh: boolean = false, refreshInterval: number = 60000) {
  const { user } = useAuth()
  const [data, setData] = useState<StockGainsData>({
    totalInvested: 0,
    currentValue: 0,
    totalGain: 0,
    totalGainPercent: 0,
    realizedGains: 0,
    unrealizedGains: 0,
    loading: true,
    error: null
  })

  const fetchStockGains = useCallback(async () => {
    if (!user) {
      setData(prev => ({ ...prev, loading: false }))
      return
    }

    try {
      console.log('📊 [useStockGains] Fetching stock gains...')
      
      // 1. Récupérer les gains/pertes réalisés (ventes effectuées)
      const profitLoss = await stockService.fetchProfitLoss(user.id)
      const realizedGains = profitLoss.reduce((sum, pl) => sum + pl.net_profit_loss, 0)
      
      // 2. Calculer la valeur actuelle du portfolio avec prix en temps réel
      const portfolioValue = await stockPriceService.calculatePortfolioValue(user.id)
      
      // 3. Gains non réalisés = valeur actuelle - investi
      const unrealizedGains = portfolioValue.totalGain
      
      // 4. Total gains = réalisés + non réalisés
      const totalGain = realizedGains + unrealizedGains
      const totalInvested = portfolioValue.totalInvested
      const totalGainPercent = totalInvested > 0 ? (totalGain / totalInvested) * 100 : 0

      console.log('✅ [useStockGains] Gains calculated:', {
        realized: realizedGains.toFixed(2),
        unrealized: unrealizedGains.toFixed(2),
        total: totalGain.toFixed(2)
      })

      setData({
        totalInvested: portfolioValue.totalInvested,
        currentValue: portfolioValue.currentValue,
        totalGain,
        totalGainPercent,
        realizedGains,
        unrealizedGains,
        loading: false,
        error: null
      })
    } catch (error: any) {
      console.error('❌ [useStockGains] Error:', error)
      setData(prev => ({
        ...prev,
        loading: false,
        error: error.message || 'Failed to fetch stock gains'
      }))
    }
  }, [user])

  // Initial fetch
  useEffect(() => {
    fetchStockGains()
  }, [fetchStockGains])

  // Auto-refresh
  useEffect(() => {
    if (!autoRefresh || refreshInterval <= 0) return

    const interval = setInterval(() => {
      console.log('🔄 [useStockGains] Auto-refresh triggered')
      fetchStockGains()
    }, refreshInterval)

    return () => clearInterval(interval)
  }, [autoRefresh, refreshInterval, fetchStockGains])

  return {
    ...data,
    refresh: fetchStockGains
  }
}