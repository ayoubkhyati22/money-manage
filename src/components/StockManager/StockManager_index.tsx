import { useState, useEffect } from 'react'
import { TrendingUp, TrendingDown, Plus, BarChart3, DollarSign, ShoppingCart } from 'lucide-react'
import { Bank } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useSweetAlert } from '../../hooks/useSweetAlert'
import { stockService } from '../../services/stockService'
import { StockTransactionWithDetails, StockProfitLoss } from '../../types/stock'
import { StockForm } from './StockForm'
import { StockSellForm } from './StockSellForm'
import { StockTransactionList } from './StockTransactionList'
import { StockProfitSummary } from './StockProfitSummary'
import { StockPortfolioView } from './StockPortfolioView'

interface StockManagerProps {
  banks: Bank[]
}

type ActiveTab = 'portfolio' | 'transactions' | 'profit'
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
    { id: 'transactions' as const, label: 'Transactions', icon: TrendingUp },
    { id: 'profit' as const, label: 'Profit/Loss', icon: DollarSign }
  ]

  return (
    <div className="space-y-6">
      {/* Header with Stats */}
      <div className="bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl p-6 text-white shadow-xl">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-2xl font-bold">Stock Investments</h2>
            <p className="text-blue-100 text-sm">Moroccan Market Portfolio</p>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setShowForm('buy')}
              className="flex items-center space-x-2 bg-green-500/90 hover:bg-green-500 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300"
            >
              <Plus className="w-5 h-5" />
              <span className="hidden sm:inline">Buy</span>
            </button>
            <button
              onClick={() => setShowForm('sell')}
              className="flex items-center space-x-2 bg-red-500/90 hover:bg-red-500 backdrop-blur-sm px-4 py-2 rounded-lg transition-all duration-300"
            >
              <TrendingDown className="w-5 h-5" />
              <span className="hidden sm:inline">Sell</span>
            </button>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-xs mb-1">Total Invested</p>
            <p className="text-2xl font-bold">{totalGains.totalInvested.toFixed(2)} MAD</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <p className="text-blue-100 text-xs mb-1">Total Revenue</p>
            <p className="text-2xl font-bold">{totalGains.totalRevenue.toFixed(2)} MAD</p>
          </div>
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-xs mb-1">Net Gains</p>
                <p className={`text-2xl font-bold ${totalGains.totalGains >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {totalGains.totalGains >= 0 ? '+' : ''}{totalGains.totalGains.toFixed(2)} MAD
                </p>
                <p className={`text-sm ${totalGains.totalGains >= 0 ? 'text-green-300' : 'text-red-300'}`}>
                  {totalGains.totalGainsPercent >= 0 ? '+' : ''}{totalGains.totalGainsPercent.toFixed(2)}%
                </p>
              </div>
              {totalGains.totalGains >= 0 ? (
                <TrendingUp className="w-8 h-8 text-green-300" />
              ) : (
                <TrendingDown className="w-8 h-8 text-red-300" />
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
        <StockSellForm
          banks={banks}
          onSubmit={async () => {
            await loadData()
            setShowForm(null)
          }}
          onCancel={() => setShowForm(null)}
        />
      )}

      {/* Tabs */}
      <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-200 dark:border-dark-600">
        <div className="border-b border-gray-200 dark:border-dark-600">
          <div className="flex space-x-2 p-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-lg font-medium text-sm transition-all duration-300 ${
                    activeTab === tab.id
                      ? 'bg-gradient-to-r from-blue-500 to-purple-600 text-white shadow-md'
                      : 'text-gray-600 dark:text-dark-300 hover:bg-gray-100 dark:hover:bg-dark-700'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
            </div>
          ) : (
            <>
              {activeTab === 'portfolio' && (
                <StockPortfolioView userId={user?.id || ''} />
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