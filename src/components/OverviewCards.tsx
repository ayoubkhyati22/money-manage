import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, ObjectiveWithAmount } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { Building2, Target, TrendingUp, DollarSign, CreditCard, Wallet, Eye, EyeOff, ArrowDownCircle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface OverviewCardsProps {
  banks: Bank[]
  goals: Goal[]
  transactions: TransactionWithDetails[]
}

export function OverviewCards({ banks, goals, transactions }: OverviewCardsProps) {
  const [objectivesWithAmounts, setObjectivesWithAmounts] = useState<ObjectiveWithAmount[]>([])
  const [loading, setLoading] = useState(true)
  const [showBalance, setShowBalance] = useState(true)
  
  // Pagination states
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
  
  // Calculate total withdrawn (negative amounts from objectives_transactions)
  const totalWithdrawn = objectivesWithAmounts.reduce((sum, obj) => {
    const withdrawnAmount = obj.transactions
      .filter(trans => trans.amount < 0)
      .reduce((transSum, trans) => transSum + Math.abs(trans.amount), 0)
    return sum + withdrawnAmount
  }, 0)

  // Pagination calculations
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

  // Pagination handlers
  const handleBanksPageChange = (page: number) => {
    setBanksCurrentPage(page)
  }

  const handleObjectivesPageChange = (page: number) => {
    setObjectivesCurrentPage(page)
  }

  // Pagination component
  const PaginationControls = ({ 
    currentPage, 
    totalPages, 
    onPageChange, 
    itemName 
  }: { 
    currentPage: number
    totalPages: number
    onPageChange: (page: number) => void
    itemName: string
  }) => {
    if (totalPages <= 1) return null

    return (
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-200 dark:border-dark-600">
        <div className="text-sm text-dark-400 dark:text-dark-300">
          Page {currentPage} of {totalPages}
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="px-3 py-2 text-sm font-medium text-dark-500 dark:text-dark-300 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Previous
          </button>
          
          {/* Page numbers */}
          <div className="flex space-x-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => onPageChange(page)}
                className={`px-3 py-2 text-sm font-medium rounded-lg transition-colors ${
                  page === currentPage
                    ? 'bg-primary-500 text-white'
                    : 'text-dark-500 dark:text-dark-300 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600'
                }`}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="px-3 py-2 text-sm font-medium text-dark-500 dark:text-dark-300 bg-white dark:bg-dark-700 border border-gray-300 dark:border-dark-600 rounded-lg hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            Next
          </button>
        </div>
      </div>
    )
  }

  if (loading) {
    return (
      <div className="space-y-8">
        {/* Loading Credit Card */}
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
      {/* CREDIT CARD - TOTAL BALANCE */}
      <div className="w-full">
        <div className="w-full max-w-md mx-auto relative group">
          
          {/* Main Credit Card */}
          <div className="relative w-full h-48 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 dark:from-dark-900 dark:via-dark-800 dark:to-dark-900 rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:rotate-1 border border-slate-700/50 dark:border-dark-600/50 overflow-hidden">
            
            {/* Background Pattern */}
            <div className="absolute inset-0 opacity-10">
              <div className="absolute top-0 left-0 w-32 h-32 bg-gradient-to-br from-primary-400 to-primary-600 rounded-full -translate-x-16 -translate-y-16"></div>
              <div className="absolute bottom-0 right-0 w-24 h-24 bg-gradient-to-tl from-accent-400 to-accent-600 rounded-full translate-x-12 translate-y-12"></div>
              <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-mint-400 to-mint-600 rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"></div>
            </div>

            {/* Card Header */}
            <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-lg">
                  <Wallet className="w-4 h-4 text-white" />
                </div>
                <div>
                  <p className="text-white/90 text-sm font-medium">FinanceFlow</p>
                  <p className="text-white/60 text-xs">Total Balance</p>
                </div>
              </div>
              <button
                onClick={() => setShowBalance(!showBalance)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                title={showBalance ? 'Hide balance' : 'Show balance'}
              >
                {showBalance ? (
                  <Eye className="w-4 h-4 text-white/70 hover:text-white" />
                ) : (
                  <EyeOff className="w-4 h-4 text-white/70 hover:text-white" />
                )}
              </button>
            </div>

            {/* Balance Display */}
            <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2">
              <div className="text-center">
                <p className="text-white/60 text-xs uppercase tracking-wider mb-2">Available Balance</p>
                <div className="relative">
                  {showBalance ? (
                    <h2 className="text-3xl font-bold text-white mb-1 tracking-wide">
                      {totalBalance.toLocaleString('en-US', { 
                        minimumFractionDigits: 2, 
                        maximumFractionDigits: 2 
                      })} <span className="text-lg font-medium text-white/80">MAD</span>
                    </h2>
                  ) : (
                    <h2 className="text-3xl font-bold text-white mb-1 tracking-wide">
                      ••••••• <span className="text-lg font-medium text-white/80">MAD</span>
                    </h2>
                  )}
                  
                  {/* Animated shine effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 ease-in-out"></div>
                </div>
              </div>
            </div>

            {/* Card Footer */}
            <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between">
              <div>
                <p className="text-white/60 text-xs">Last updated</p>
                <p className="text-white/90 text-sm font-medium">{format(new Date(), 'MMM dd, yyyy')}</p>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center">
                  <Building2 className="w-3 h-3 text-white/70" />
                </div>
                <span className="text-white/60 text-xs">{banks.length} Banks</span>
              </div>
            </div>

            {/* Holographic effect overlay */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
            
            {/* Card chip simulation */}
            <div className="absolute top-16 left-6 w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm shadow-inner opacity-80"></div>
          </div>

          {/* Card shadow effect */}
          <div className="absolute inset-0 bg-gradient-to-br from-slate-800/50 to-transparent rounded-2xl blur-xl scale-105 -z-10 opacity-50 group-hover:opacity-75 transition-opacity duration-500"></div>
        </div>
      </div>

      {/* Stats Cards Row */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {/* Combined Summary Card (Mobile Only) - includes Banks, Objectives, and Withdrawn */}
        <div className="sm:hidden group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-4 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between mb-3">
            <div>
              <p className="text-sm font-medium text-dark-400 dark:text-dark-300">Summary</p>
            </div>
            <div className="flex items-center space-x-1">
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-accent-400 to-accent-600 rounded-md shadow-sm">
                <Building2 className="w-3 h-3 text-white" />
              </div>
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-mint-400 to-mint-600 rounded-md shadow-sm">
                <Target className="w-3 h-3 text-white" />
              </div>
              <div className="flex items-center justify-center w-6 h-6 bg-gradient-to-br from-red-400 to-red-600 rounded-md shadow-sm">
                <ArrowDownCircle className="w-3 h-3 text-white" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-3 gap-2">
            <div className="text-center">
              <p className="text-lg font-semibold text-dark-500 dark:text-dark-100">{banks.length}</p>
              <p className="text-xs text-dark-400 dark:text-dark-300">Banks</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-dark-500 dark:text-dark-100">{goals.length}</p>
              <p className="text-xs text-dark-400 dark:text-dark-300">Goals</p>
            </div>
            <div className="text-center">
              <p className="text-lg font-semibold text-red-600 dark:text-red-400">{totalWithdrawn.toFixed(0)}</p>
              <p className="text-xs text-dark-400 dark:text-dark-300">Withdrawn</p>
            </div>
          </div>
        </div>

        {/* Active Banks Card (Desktop Only) */}
        <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400 dark:text-dark-300">Active Banks</p>
              <p className="text-2xl font-semibold text-dark-500 dark:text-dark-100 mt-1">{banks.length}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Objectives Card (Desktop Only) */}
        <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400 dark:text-dark-300">Objectives</p>
              <p className="text-2xl font-semibold text-dark-500 dark:text-dark-100 mt-1">{goals.length}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-mint-400 to-mint-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Objectives Amount Card */}
        <div className="group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-4 sm:p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400 dark:text-dark-300">Total Objectives</p>
              <p className="text-xl sm:text-2xl font-semibold text-dark-500 dark:text-dark-100 mt-1">{totalObjectives.toFixed(2)} MAD</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-dark-400 to-dark-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <TrendingUp className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
          </div>
        </div>

        {/* Total Withdrawn Card (Desktop Only) */}
        <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400 dark:text-dark-300">Total Withdrawn</p>
              <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">{totalWithdrawn.toFixed(2)} MAD</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <ArrowDownCircle className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Banks and Objectives Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Banks Overview */}
        <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
          <div className="bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/30 dark:to-accent-800/30 p-6 border-b border-accent-200 dark:border-dark-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-dark-500 dark:text-dark-100">Banks Overview</h3>
                <p className="text-sm text-dark-400 dark:text-dark-300 mt-1">Your financial institutions</p>
              </div>
              {totalBanks > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium text-dark-500 dark:text-dark-200">
                    {totalBanks} bank{totalBanks !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-dark-400 dark:text-dark-300">
                    Showing {banksStartIndex + 1}-{Math.min(banksEndIndex, totalBanks)}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {banks.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 dark:from-accent-900/30 dark:to-accent-800/30 rounded-full mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-accent-600 dark:text-accent-400" />
                </div>
                <p className="text-dark-500 dark:text-dark-200 text-lg font-medium">No banks added yet</p>
                <p className="text-sm text-dark-400 dark:text-dark-300 mt-2">Add your first bank to get started</p>
              </div>
            ) : (
              <>
                <div className="space-y-4">
                  {currentBanks.map((bank) => (
                    <div key={bank.id} className="group flex items-center justify-between p-5 bg-gradient-to-r from-accent-50 to-accent-100 dark:from-accent-900/20 dark:to-accent-800/20 border border-accent-200 dark:border-dark-600 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-102">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center justify-center w-14 h-14 bg-white dark:bg-dark-700 border-2 border-accent-300 dark:border-accent-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                          {bank.logo ? (
                            <img src={bank.logo} alt={bank.name} className="w-7 h-7 object-contain" />
                          ) : (
                            <Building2 className="w-7 h-7 text-accent-600 dark:text-accent-400" />
                          )}
                        </div>
                        <div>
                          <p className="font-semibold text-dark-600 dark:text-dark-100 text-sm">{bank.name}</p>
                          <p className="text-sm text-dark-400 dark:text-dark-300">Current Balance</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-md font-semibold text-dark-600 dark:text-dark-100">{Number(bank.balance).toFixed(2)}</p>
                        <p className="text-sm text-dark-400 dark:text-dark-300 font-medium">MAD</p>
                      </div>
                    </div>
                  ))}
                </div>
                
                <PaginationControls
                  currentPage={banksCurrentPage}
                  totalPages={totalBanksPages}
                  onPageChange={handleBanksPageChange}
                  itemName="banks"
                />
              </>
            )}
          </div>
        </div>

        {/* Objectives Overview */}
        <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 p-6 border-b border-primary-200 dark:border-dark-600">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-xl font-semibold text-dark-500 dark:text-dark-100">Objectives Overview</h3>
                <p className="text-sm text-dark-400 dark:text-dark-300 mt-1">Your financial goals</p>
              </div>
              {totalObjectivesCount > 0 && (
                <div className="text-right">
                  <p className="text-sm font-medium text-dark-500 dark:text-dark-200">
                    {totalObjectivesCount} objective{totalObjectivesCount !== 1 ? 's' : ''}
                  </p>
                  <p className="text-xs text-dark-400 dark:text-dark-300">
                    Showing {objectivesStartIndex + 1}-{Math.min(objectivesEndIndex, totalObjectivesCount)}
                  </p>
                </div>
              )}
            </div>
          </div>
          <div className="p-6">
            {objectivesWithAmounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full mx-auto mb-6">
                  <Target className="w-10 h-10 text-primary-600 dark:text-primary-400" />
                </div>
                <p className="text-dark-500 dark:text-dark-200 text-lg font-medium">No objectives created yet</p>
                <p className="text-sm text-dark-400 dark:text-dark-300 mt-2">Start by creating your first financial goal</p>
              </div>
            ) : (
              <>
                <div className="p-2">
                  <div className="flex flex-wrap gap-4">
                    {currentObjectives.map((objective) => {
                      const progress = objective.target_amount
                        ? (objective.total_amount / objective.target_amount) * 100
                        : 0

                      return (
                        <div
                          key={objective.id}
                          className="group relative bg-gradient-to-br from-primary-50 to-mint-50 dark:from-primary-900/20 dark:to-mint-900/20 border border-primary-200 dark:border-dark-600 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-102 w-full md:w-[calc(50%-0.5rem)]"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-dark-600 dark:text-dark-100 text-lg truncate group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                                  {objective.name}
                                </h4>
                                {objective.category && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200 mt-1">
                                    {objective.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Amount Display */}
                          <div className="mb-4">
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-semibold text-dark-600 dark:text-dark-100">
                                {objective.total_amount.toFixed(2)}
                              </span>
                              <span className="text-sm font-medium text-dark-400 dark:text-dark-300">MAD</span>
                            </div>
                            {objective.target_amount && (
                              <p className="text-sm text-dark-400 dark:text-dark-300 mt-1">
                                of {Number(objective.target_amount).toFixed(2)} MAD target
                              </p>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {objective.target_amount && (
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-dark-500 dark:text-dark-200">Progress</span>
                                <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                                  {progress.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-primary-100 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                                  style={{
                                    width: `${Math.min(100, progress)}%`
                                  }}
                                ></div>
                              </div>
                              {progress >= 100 && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Goal Achieved!</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Target Date */}
                          {objective.target_date && (
                            <div className="flex items-center space-x-2 text-sm text-dark-400 dark:text-dark-300">
                              <div className="w-4 h-4 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                              </div>
                              <span>Due: {format(new Date(objective.target_date), 'MMM dd, yyyy')}</span>
                            </div>
                          )}

                          {/* Notes Preview */}
                          {objective.notes && (
                            <div className="mt-3 p-3 bg-white/70 dark:bg-dark-700/70 rounded-lg border border-primary-100 dark:border-dark-600">
                              <p className="text-xs text-dark-500 dark:text-dark-300 italic line-clamp-2">
                                "{objective.notes}"
                              </p>
                            </div>
                          )}

                          {/* Hover Effect Overlay */}
                          <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
                        </div>
                      )
                    })}
                  </div>
                </div>

                <PaginationControls
                  currentPage={objectivesCurrentPage}
                  totalPages={totalObjectivesPages}
                  onPageChange={handleObjectivesPageChange}
                  itemName="objectives"
                />
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}