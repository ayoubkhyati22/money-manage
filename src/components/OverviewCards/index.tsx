import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, ObjectiveWithAmount } from '../../lib/supabase'
import { supabase } from '../../lib/supabase'
import toast from 'react-hot-toast'
import { CreditCard } from './CreditCard'
import { StatsCards } from './StatsCards'
import { FinancialGraphs } from './FinancialGraphs'
import { BanksSection } from './BanksSection'
import { ObjectivesSection } from './ObjectivesSection'

interface OverviewCardsProps {
  banks: Bank[]
  goals: Goal[]
  transactions: TransactionWithDetails[]
}

export function OverviewCards({ banks, goals }: OverviewCardsProps) {
  const [objectivesWithAmounts, setObjectivesWithAmounts] = useState<ObjectiveWithAmount[]>([])
  const [loading, setLoading] = useState(true)

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

      setObjectivesWithAmounts(objectivesWithAmounts)
    } catch (error: any) {
      console.error('Error loading objective amounts:', error)
      toast.error('Error loading data: ' + error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalBalance = banks.reduce((sum, bank) => sum + Number(bank.balance), 0)
  const totalObjectives = objectivesWithAmounts.reduce((sum, obj) => sum + obj.total_amount, 0)

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
    <div className="space-y-8">
      <CreditCard totalBalance={totalBalance} banksCount={banks.length} />

      <StatsCards
        banksCount={banks.length}
        goalsCount={goals.length}
        totalObjectives={totalObjectives}
        totalWithdrawn={totalWithdrawn}
      />

      {/* Financial Graphs Section */}
      <FinancialGraphs 
        banks={banks} 
        goals={goals} 
        objectives={objectivesWithAmounts} 
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
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
    </div>
  )
}