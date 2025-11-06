// src/components/Dashboard/StockGainsSummary.tsx
// Version compacte pour le Dashboard principal

import { TrendingUp, TrendingDown, LineChart, Sparkles } from 'lucide-react'
import { useStockGains } from '../../hooks/useStockGains'
import { Link } from 'react-router-dom' // ou votre système de routing

export function StockGainsSummary() {
  const { 
    totalGain, 
    totalGainPercent,
    currentValue,
    loading 
  } = useStockGains(true, 60000) // Auto-refresh toutes les 60 secondes

  const isProfit = totalGain >= 0

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('fr-MA', {
      minimumFractionDigits: 0,
      maximumFractionDigits: 0
    }).format(amount)
  }

  // Ne rien afficher si pas d'investissement ou en chargement
  if (loading || currentValue === 0) {
    return null
  }

  return (
    <Link 
      to="/stocks" // Adapter selon votre routing
      className="block group"
    >
      <div className="relative bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-xl shadow-lg border border-white/10 p-6 text-white overflow-hidden transition-all duration-300 hover:shadow-2xl hover:scale-[1.02]">
        {/* Background effect */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
        
        {/* Sparkles decoration */}
        <div className="absolute top-4 right-4 opacity-20 group-hover:opacity-40 transition-opacity duration-300">
          <Sparkles className="w-8 h-8 text-yellow-300" />
        </div>

        {/* Content */}
        <div className="relative">
          {/* Header */}
          <div className="flex items-center space-x-3 mb-4">
            <div className="p-2 bg-white/10 backdrop-blur-sm rounded-lg border border-white/20">
              <LineChart className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-sm font-semibold">Stock Portfolio</h3>
              <p className="text-xs text-white/60">Investment Gains</p>
            </div>
          </div>

          {/* Main Stat */}
          <div className="flex items-end justify-between">
            <div>
              <p className="text-xs text-white/60 uppercase tracking-wider mb-1">
                Total Gain/Loss
              </p>
              <div className="flex items-baseline space-x-2">
                <p className={`text-3xl font-bold ${
                  isProfit ? 'text-green-300' : 'text-red-300'
                }`}>
                  {isProfit ? '+' : ''}{formatCurrency(totalGain)}
                </p>
                <span className="text-sm text-white/60">MAD</span>
              </div>
              <div className="flex items-center space-x-1 mt-1">
                {isProfit ? (
                  <TrendingUp className="w-4 h-4 text-green-300" />
                ) : (
                  <TrendingDown className="w-4 h-4 text-red-300" />
                )}
                <span className={`text-sm font-medium ${
                  isProfit ? 'text-green-300' : 'text-red-300'
                }`}>
                  {isProfit ? '+' : ''}{totalGainPercent.toFixed(2)}%
                </span>
              </div>
            </div>

            {/* Badge */}
            <div className={`px-3 py-1 rounded-full text-xs font-semibold ${
              isProfit 
                ? 'bg-green-500/20 text-green-300 border border-green-500/30'
                : 'bg-red-500/20 text-red-300 border border-red-500/30'
            }`}>
              {isProfit ? 'PROFIT' : 'LOSS'}
            </div>
          </div>

          {/* Portfolio Value */}
          <div className="mt-4 pt-4 border-t border-white/10">
            <div className="flex items-center justify-between">
              <span className="text-xs text-white/60">Portfolio Value</span>
              <span className="text-sm font-semibold">{formatCurrency(currentValue)} MAD</span>
            </div>
          </div>

          {/* Hover indicator */}
          <div className="mt-3 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <span className="text-xs text-white/60">Click to view details →</span>
          </div>
        </div>
      </div>
    </Link>
  )
}