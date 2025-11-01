import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, ObjectiveWithAmount } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { CreditCard } from './CreditCard'
import { StatsCards } from './StatsCards'
import { FinancialGraphs } from './FinancialGraphs'
import { BanksSection } from './BanksSection'
import { ObjectivesSection } from './ObjectivesSection'
import { BarChart3, Building2, Target } from 'lucide-react'
import { stockService } from '../../services/stockService'
import { StockOverview } from './StockOverview'
import { useAuth } from '../../hooks/useAuth'

interface OverviewCardsProps {
  banks: Bank[]
  goals: Goal[]
  transactions: TransactionWithDetails[]
}

type OverviewTab = 'analytics' | 'banks' | 'objectives'

export function OverviewCards({ banks, goals }: OverviewCardsProps) {
  const [objectivesWithAmounts, setObjectivesWithAmounts] = useState<ObjectiveWithAmount[]>([])
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<OverviewTab>('objectives')
  const { user } = useAuth()
  const [stockGains, setStockGains] = useState(0)
  const [banksCurrentPage, setBanksCurrentPage] = useState(1)
  const [objectivesCurrentPage, setObjectivesCurrentPage] = useState(1)
  const banksPerPage = 4
  const objectivesPerPage = 4


  useEffect(() => {
    loadObjectiveAmounts()
  }, [goals])

  const loadObjectiveAmounts = async () => {
    try {
      if (goals.length === 0) {
        setObjectivesWithAmounts([])
        setLoading(false)
        return
      }

      const { data: transactions, error } = await supabase
        .from('objectives_transactions')
        .select(`
          objective_id,
          amount,
          description,
          created_at,
          banks:bank_id(name)
        `)
        .in('objective_id', goals.map(g => g.id))

      if (error) throw error

      const objectivesWithAmounts: ObjectiveWithAmount[] = goals.map(goal => {
        const goalTransactions = transactions?.filter(t => t.objective_id === goal.id) || []
        const total = goalTransactions.reduce((sum, trans) => sum + Number(trans.amount), 0)

        return {
          ...goal,
          total_amount: total,
          transactions: goalTransactions.map(trans => ({
            bank_name: (trans.banks as any)?.name || 'Unknown',
            amount: Number(trans.amount),
            description: trans.description || '',
            created_at: trans.created_at
          })),
        }
      })

      // Sort objectives by percentage (highest first)
      const sortedObjectives = objectivesWithAmounts.sort((a, b) => {
        const percentA = a.target_amount ? (a.total_amount / a.target_amount) * 100 : 0
        const percentB = b.target_amount ? (b.total_amount / b.target_amount) * 100 : 0
        return percentB - percentA
      })

      setObjectivesWithAmounts(sortedObjectives)
    } catch (error: any) {
      console.error('Error loading objective amounts:', error)
      toast.error('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }



  // const totalBalance = banks.reduce((sum, bank) => sum + Number(bank.balance), 0)
  // const totalObjectives = objectivesWithAmounts.reduce((sum, obj) => sum + obj.total_amount, 0)

  const totalBalance = banks.reduce((sum, bank) => sum + Number(bank.balance), 0)
  const totalBalanceWithStocks = totalBalance + stockGains

  const totalWithdrawn = objectivesWithAmounts.reduce((sum, obj) => {
    const withdrawnAmount = obj.transactions
      .filter(trans => trans.amount < 0)
      .reduce((transSum, trans) => transSum + Math.abs(trans.amount), 0)
    return sum + withdrawnAmount
  }, 0)

  const totalBanks = banks.length
  const totalBanksPages = Math.ceil(totalBanks / banksPerPage)
  const banksStartIndex = (banksCurrentPage - 1) * banksPerPage
  const banksEndIndex = banksStartIndex + banksPerPage
  const currentBanks = banks.slice(banksStartIndex, banksEndIndex)

  const totalObjectivesCount = objectivesWithAmounts.length
  const totalObjectivesPages = Math.ceil(totalObjectivesCount / objectivesPerPage)
  const objectivesStartIndex = (objectivesCurrentPage - 1) * objectivesPerPage
  const objectivesEndIndex = objectivesStartIndex + objectivesPerPage
  const currentObjectives = objectivesWithAmounts.slice(objectivesStartIndex, objectivesEndIndex)

  const tabs = [
    { id: 'objectives' as const, label: 'Objectives', icon: Target },
    { id: 'analytics' as const, label: 'Analytics', icon: BarChart3 },
    { id: 'banks' as const, label: 'Banks', icon: Building2 },
  ]

  // const [stockGains, setStockGains] = useState({
  //   totalInvested: 0,
  //   totalRevenue: 0,
  //   totalGains: 0,
  //   totalGainsPercent: 0
  // })

  // Ajouter dans loadData()
  const loadData = async () => {
    if (!user) return
    setLoading(true)
    try {
      const gains = await stockService.calculateTotalGains(user.id)
      setStockGains(gains)
      // ... rest of loading logic
    } catch (error) {
      // ...
    }
  }

  if (loading) {
    return (
      <div className="space-y-8">
        <div className="w-full">
          <div className="w-full max-w-md mx-auto h-48 bg-gradient-to-br from-gray-200 to-gray-300 dark:from-dark-600 dark:to-dark-700 rounded-2xl animate-pulse shadow-xl"></div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
          {Array.from({ length: 4 }).map((_, i) => (
            <div key={i} className="bg-white/80 dark:bg-dark-800/80 backdrop-blur rounded-2xl p-4 sm:p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 animate-pulse">
              <div className="h-4 bg-gray-200 dark:bg-dark-600 rounded w-3/4 mb-4"></div>
              <div className="h-6 sm:h-8 bg-gray-200 dark:bg-dark-600 rounded w-1/2"></div>
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Total Balance and Bank Cards Swiper */}
      {/* Total Balance avec gains boursiers */}

      <CreditCard
        totalBalance={totalBalanceWithStocks}
        banksCount={banks.length}
        banks={banks}
      />
      <StatsCards
        banksCount={banks.length}
        goalsCount={goals.length}
        totalObjectives={totalBalanceWithStocks}
        totalWithdrawn={totalWithdrawn}
        stockGains={stockGains}
        totalBalance={totalBalance}
      />
      {/* Stock Overview Section */}
      <StockOverview onTotalGainsChange={setStockGains} />


      {/* Tabs Navigation */}
      <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
        <div className="p-2 sm:p-3 bg-gradient-to-r from-gray-50 to-mint-50 dark:from-dark-900/30 dark:to-mint-900/20">
          <div className="flex space-x-1 sm:space-x-2">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 flex items-center justify-center space-x-1.5 sm:space-x-2 px-3 sm:px-4 py-2.5 sm:py-3 rounded-lg sm:rounded-xl font-medium text-xs sm:text-sm transition-all duration-300 transform hover:scale-105 ${activeTab === tab.id
                    ? 'bg-gradient-to-r from-primary-400 to-primary-500 text-white shadow-lg'
                    : 'text-dark-500 dark:text-dark-300 hover:bg-primary-100 dark:hover:bg-dark-700'
                    }`}
                >
                  <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span className="hidden xs:inline sm:inline">{tab.label}</span>
                </button>
              )
            })}
          </div>
        </div>

        {/* Tab Content */}
        <div className="p-4 sm:p-6">
          {activeTab === 'objectives' && (
            <div className="animate-fadeIn">
              <ObjectivesSection
                objectives={objectivesWithAmounts}
                currentPage={objectivesCurrentPage}
                totalPages={totalObjectivesPages}
                onPageChange={setObjectivesCurrentPage}
                currentObjectives={currentObjectives}
                startIndex={objectivesStartIndex}
                endIndex={objectivesEndIndex}
                totalCount={totalObjectivesCount}
              />
            </div>
          )}

          {activeTab === 'analytics' && (
            <div className="animate-fadeIn">
              <FinancialGraphs
                banks={banks}
                goals={goals}
                objectives={objectivesWithAmounts}
              />
            </div>
          )}

          {activeTab === 'banks' && (
            <div className="animate-fadeIn">
              <BanksSection
                banks={banks}
                currentPage={banksCurrentPage}
                totalPages={totalBanksPages}
                onPageChange={setBanksCurrentPage}
                currentBanks={currentBanks}
                startIndex={banksStartIndex}
                endIndex={banksEndIndex}
                totalCount={totalBanks}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  )
}