// src/components/Dashboard/StockSaleBalanceCard.tsx
import { useState, useEffect } from 'react'
import { TrendingUp, Wallet, RefreshCw, Sparkles } from 'lucide-react'
import { useAuth } from '../../hooks/useAuth'
import { stockPriceService } from '../../services/stockPriceService'

interface StockSaleBalanceCardProps {
  totalBalance: number // Solde actuel des comptes bancaires
}

export function StockSaleBalanceCard({ totalBalance }: StockSaleBalanceCardProps) {
  const { user } = useAuth()
  const [stockValue, setStockValue] = useState(0)
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)

  useEffect(() => {
    if (user) {
      loadStockValue()
    }
  }, [user])

  const loadStockValue = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      // Récupérer la valeur actuelle du portfolio avec les prix en temps réel
      const portfolioValue = await stockPriceService.calculatePortfolioValue(user.id)
      setStockValue(portfolioValue.currentValue)
    } catch (error) {
      console.error('Error loading stock value:', error)
      setStockValue(0)
    } finally {
      setLoading(false)
    }
  }

  const handleRefresh = async () => {
    setRefreshing(true)
    await loadStockValue()
    setTimeout(() => setRefreshing(false), 500)
  }

  const balanceWithStockSale = totalBalance + stockValue
  const hasStocks = stockValue > 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount)
  }

  if (loading) {
    return (
      <div className="bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden">
        <div className="flex items-center justify-center h-full">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
        </div>
      </div>
    )
  }

  // Ne rien afficher si pas d'actions
  if (!hasStocks) {
    return null
  }

  return (
    <div className="group bg-gradient-to-br from-green-500 to-green-600 rounded-xl shadow-lg p-6 text-white relative overflow-hidden hover:shadow-2xl transition-all duration-300">
      {/* Background decoration */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      <div className="absolute -bottom-10 -left-10 w-32 h-32 bg-white/10 rounded-full blur-2xl"></div>
      
      {/* Sparkle decoration */}
      <div className="absolute top-3 right-3 opacity-30 group-hover:opacity-60 transition-opacity duration-300">
        <Sparkles className="w-5 h-5 text-yellow-300" />
      </div>

      <div className="relative">
        <div className="flex items-center justify-between mb-4">
          <div className="p-3 bg-white/20 backdrop-blur-sm rounded-xl border border-white/30">
            <Wallet className="w-6 h-6" />
          </div>
          <button
            onClick={handleRefresh}
            disabled={refreshing}
            className="p-2 hover:bg-white/20 rounded-lg transition-colors disabled:opacity-50"
            title="Actualiser"
          >
            <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
          </button>
        </div>

        <p className="text-sm text-white/90 mb-1 font-medium">Si Vente Totale</p>
        <p className="text-3xl font-bold mb-1">{formatCurrency(balanceWithStockSale)}</p>
        <p className="text-xs text-white/70 mb-3">MAD</p>

        {/* Breakdown */}
        <div className="space-y-1 pt-3 border-t border-white/20">
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/80">Solde actuel</span>
            <span className="font-medium">{formatCurrency(totalBalance)}</span>
          </div>
          <div className="flex items-center justify-between text-xs">
            <span className="text-white/80 flex items-center space-x-1">
              <TrendingUp className="w-3 h-3" />
              <span>Valeur stocks</span>
            </span>
            <span className="font-medium text-green-200">+{formatCurrency(stockValue)}</span>
          </div>
        </div>

        {/* Hover indicator */}
        <div className="absolute bottom-2 right-2 opacity-0 group-hover:opacity-40 transition-opacity duration-300">
          <div className="flex items-center space-x-1 text-xs text-white/60">
            <TrendingUp className="w-3 h-3" />
            <span>Potentiel</span>
          </div>
        </div>
      </div>
    </div>
  )
}