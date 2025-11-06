import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Plus, BarChart3, DollarSign, ShoppingCart, Scale } from 'lucide-react'
import { Bank } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useSweetAlert } from '../../hooks/useSweetAlert'
import { stockService } from '../../services/stockService'
import { StockTransactionWithDetails, StockProfitLoss } from '../../types/stock'
import { StockForm } from './StockForm'
import { StockSellForm1 } from './StockSellForm1'
import { StockTransactionList } from './StockTransactionList'
import { StockProfitSummary } from './StockProfitSummary'
import { StockPortfolioView } from './StockPortfolioView'
import { RealTimeStockPrices } from './RealTimeStockPrices'
import { StockComparisonView } from './StockComparisonView' // 🔥 NOUVEAU

interface StockManagerProps {
  banks: Bank[]
}

type ActiveTab = 'portfolio' | 'live' | 'comparison' | 'transactions' | 'profit' // 🔥 Ajout de 'comparison'
type FormType = null | 'buy' | 'sell'

export function StockManager({ banks }: StockManagerProps) {
  const { user } = useAuth()
  const { showSuccess, showError, showDeleteConfirm } = useSweetAlert()
  const [activeTab, setActiveTab] = useState<ActiveTab>('portfolio')
  const [showForm, setShowForm] = useState<FormType>(null)
  const [loading, setLoading] = useState(false)
  const [transactions, setTransactions] = useState<StockTransactionWithDetails[]>([])
  const [profitLoss, setProfitLoss] = useState<StockProfitLoss[]>([])
  const [totalGains, setTotalGains] = useState({
    totalInvested: 0,
    totalRevenue: 0,
    totalGains: 0,
    totalGainsPercent: 0
  })

  useEffect(() => {
    if (user) {
      loadData()
    }
  }, [user])

  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const [transactionsData, profitLossData, gains] = await Promise.all([
        stockService.fetchTransactions(user.id),
        stockService.fetchProfitLoss(user.id),
        stockService.calculateTotalGains(user.id)
      ])
      setTransactions(transactionsData)
      setProfitLoss(profitLossData)
      setTotalGains(gains)
    } catch (error: any) {
      await showError('Error Loading Data', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (transactionId: string) => {
    const result = await showDeleteConfirm(
      'Delete Transaction?',
      'This action cannot be undone.'
    )

    if (result.isConfirmed) {
      try {
        await stockService.deleteTransaction(transactionId)
        await showSuccess('Transaction Deleted', 'Transaction has been removed.')
        loadData()
      } catch (error: any) {
        await showError('Delete Failed', error.message)
      }
    }
  }

  const tabs = [
    { id: 'portfolio' as const, label: 'Portfolio', icon: BarChart3 },
    { id: 'live' as const, label: 'Live Prices', icon: TrendingUp },
    { id: 'comparison' as const, label: 'Comparaison', icon: Scale }, // 🔥 NOUVEAU
    { id: 'transactions' as const, label: 'Transactions', icon: ShoppingCart },
    { id: 'profit' as const, label: 'P&L', icon: DollarSign }
  ]

  return (
    <div className="space-y-4 mt-7">
      {/* Premium Header with Compact Stats */}
      <div className="bg-gradient-to-br from-slate-900 via-blue-900 to-slate-800 rounded-xl p-4 text-white shadow-premium border border-white/10">
        <div className="flex items-center justify-between mb-3">
          <div>
            <h2 className="text-lg font-semibold text-white/95">Stock Portfolio</h2>
            <p className="text-white/60 text-xs">Moroccan Market</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowForm('buy')}
              className="flex items-center space-x-1 bg-emerald-600 hover:bg-emerald-500 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium border border-emerald-500/30"
            >
              <Plus className="w-4 h-4" />
              <span>Buy</span>
            </button>
            <button
              onClick={() => setShowForm('sell')}
              className="flex items-center space-x-1 bg-rose-600 hover:bg-rose-500 px-3 py-1.5 rounded-lg transition-all duration-200 text-sm font-medium border border-rose-500/30"
            >
              <TrendingDown className="w-4 h-4" />
              <span>Sell</span>
            </button>
          </div>
        </div>

        {/* Compact Stats Grid */}
        <div className="grid grid-cols-3 gap-2">
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Invested</p>
            <p className="text-sm font-semibold text-white/95">{totalGains.totalInvested.toFixed(0)} MAD</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
            <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Revenue</p>
            <p className="text-sm font-semibold text-white/95">{totalGains.totalRevenue.toFixed(0)} MAD</p>
          </div>
          <div className="bg-white/5 backdrop-blur-sm rounded-lg p-2 border border-white/10">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-white/60 text-[10px] uppercase tracking-wider mb-1">Net P&L</p>
                <p className={`text-sm font-semibold ${totalGains.totalGains >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {totalGains.totalGains >= 0 ? '+' : ''}{totalGains.totalGains.toFixed(0)} MAD
                </p>
                <p className={`text-xs ${totalGains.totalGains >= 0 ? 'text-emerald-300' : 'text-rose-300'}`}>
                  {totalGains.totalGainsPercent >= 0 ? '+' : ''}{totalGains.totalGainsPercent.toFixed(1)}%
                </p>
              </div>
              {totalGains.totalGains >= 0 ? (
                <TrendingUp className="w-4 h-4 text-emerald-300" />
              ) : (
                <TrendingDown className="w-4 h-4 text-rose-300" />
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Transaction Forms */}
      {showForm === 'buy' && (
        <StockForm
          banks={banks}
          onSubmit={async () => {
            await loadData()
            setShowForm(null)
          }}
          onCancel={() => setShowForm(null)}
        />
      )}

      {showForm === 'sell' && (
        <StockSellForm1
          banks={banks}
          onSubmit={async () => {
            await loadData()
            setShowForm(null)
          }}
          onCancel={() => setShowForm(null)}
        />
      )}

      {/* Premium Compact Tabs */}
      <div className="bg-white dark:bg-slate-900 rounded-xl shadow-premium border border-gray-200 dark:border-slate-700">
        <div className="border-b border-gray-200 dark:border-slate-700">
          <div className="flex space-x-1 p-1 overflow-x-auto">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-shrink-0 flex items-center justify-center space-x-1 px-3 py-2 rounded-lg font-medium text-xs transition-all duration-200 ${activeTab === tab.id
                      ? 'bg-gradient-to-r from-slate-800 to-slate-700 text-white shadow-sm border border-slate-600'
                      : 'text-gray-600 dark:text-slate-400 hover:bg-gray-50 dark:hover:bg-slate-800'
                    }`}
                >
                  <Icon className="w-3 h-3" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Compact Tab Content */}
        <div className="p-3">
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-slate-600"></div>
            </div>
          ) : (
            <>
              {activeTab === 'portfolio' && (
                <StockPortfolioView userId={user?.id || ''} />
              )}
              {activeTab === 'live' && (
                <RealTimeStockPrices />
              )}
              {activeTab === 'comparison' && (
                <StockComparisonView />
              )}
              {activeTab === 'transactions' && (
                <StockTransactionList
                  transactions={transactions}
                  onDelete={handleDelete}
                />
              )}
              {activeTab === 'profit' && (
                <StockProfitSummary profitLoss={profitLoss} />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  )
}