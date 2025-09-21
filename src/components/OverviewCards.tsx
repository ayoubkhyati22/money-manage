import { useState, useEffect } from 'react'
import { Bank, Goal, TransactionWithDetails, ObjectiveWithAmount } from '../lib/supabase'
import { supabase } from '../lib/supabase'
import { Building2, Target, TrendingUp, DollarSign } from 'lucide-react'
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

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-white/80 backdrop-blur rounded-2xl p-6 shadow-lg border border-mint-200/50 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-4"></div>
            <div className="h-8 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400">Total Balance</p>
              <p className="text-2xl font-semibold text-dark-500 mt-1">{totalBalance.toFixed(2)} MAD</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-primary-400 to-primary-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <DollarSign className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400">Active Banks</p>
              <p className="text-2xl font-semibold text-dark-500 mt-1">{banks.length}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Building2 className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400">Objectives</p>
              <p className="text-2xl font-semibold text-dark-500 mt-1">{goals.length}</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-mint-400 to-mint-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <Target className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>

        <div className="group bg-white/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-dark-400">Total Objectives</p>
              <p className="text-2xl font-semibold text-dark-500 mt-1">{totalObjectives.toFixed(2)} MAD</p>
            </div>
            <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-dark-400 to-dark-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
              <TrendingUp className="w-7 h-7 text-white" />
            </div>
          </div>
        </div>
      </div>

      {/* Banks and Objectives Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Banks Overview */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-accent-50 to-accent-100 p-6 border-b border-accent-200">
            <h3 className="text-xl font-semibold text-dark-500">Banks Overview</h3>
            <p className="text-sm text-dark-400 mt-1">Your financial institutions</p>
          </div>
          <div className="p-6">
            {banks.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent-100 to-accent-200 rounded-full mx-auto mb-6">
                  <Building2 className="w-10 h-10 text-accent-600" />
                </div>
                <p className="text-dark-500 text-lg font-medium">No banks added yet</p>
                <p className="text-sm text-dark-400 mt-2">Add your first bank to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banks.map((bank) => (
                  <div key={bank.id} className="group flex items-center justify-between p-5 bg-gradient-to-r from-accent-50 to-accent-100 border border-accent-200 rounded-xl hover:shadow-lg transition-all duration-300 hover:scale-102">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center justify-center w-14 h-14 bg-white border-2 border-accent-300 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                        {bank.logo ? (
                          <img src={bank.logo} alt={bank.name} className="w-7 h-7 object-contain" />
                        ) : (
                          <Building2 className="w-7 h-7 text-accent-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-dark-600 text-sm">{bank.name}</p>
                        <p className="text-sm text-dark-400">Current Balance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-semibold text-dark-600">{Number(bank.balance).toFixed(2)}</p>
                      <p className="text-sm text-dark-400 font-medium">MAD</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Objectives Overview */}
        <div className="bg-white/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 overflow-hidden">
          <div className="bg-gradient-to-r from-primary-50 to-primary-100 p-6 border-b border-primary-200">
            <h3 className="text-xl font-semibold text-dark-500">Objectives Overview</h3>
            <p className="text-sm text-dark-400 mt-1">Your financial goals</p>
          </div>
          <div className="p-6">
            {objectivesWithAmounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-6">
                  <Target className="w-10 h-10 text-primary-600" />
                </div>
                <p className="text-dark-500 text-lg font-medium">No objectives created yet</p>
                <p className="text-sm text-dark-400 mt-2">Start by creating your first financial goal</p>
              </div>
            ) : (
              <div className="p-2 ">
                {objectivesWithAmounts.length === 0 ? (
                  <div className="text-center py-12">
                    <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 rounded-full mx-auto mb-6">
                      <Target className="w-10 h-10 text-primary-600" />
                    </div>
                    <p className="text-dark-500 text-lg font-medium">No objectives created yet</p>
                    <p className="text-sm text-dark-400 mt-2">Start by creating your first financial goal</p>
                  </div>
                ) : (
                  <div className="flex flex-wrap gap-4">
                    {objectivesWithAmounts.map((objective) => {
                      const progress = objective.target_amount
                        ? (objective.total_amount / objective.target_amount) * 100
                        : 0

                      return (
                        <div
                          key={objective.id}
                          className="group relative bg-gradient-to-br from-primary-50 to-mint-50 border border-primary-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-102 w-full md:w-[calc(50%-0.5rem)]"
                        >
                          {/* Header */}
                          <div className="flex items-start justify-between mb-4">
                            <div className="flex items-center space-x-3 flex-1 min-w-0">
                              <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                                <Target className="w-6 h-6 text-white" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-semibold text-dark-600 text-lg truncate group-hover:text-primary-700 transition-colors">
                                  {objective.name}
                                </h4>
                                {objective.category && (
                                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 text-primary-800 mt-1">
                                    {objective.category}
                                  </span>
                                )}
                              </div>
                            </div>
                          </div>

                          {/* Amount Display */}
                          <div className="mb-4">
                            <div className="flex items-baseline space-x-2">
                              <span className="text-2xl font-semibold text-dark-600">
                                {objective.total_amount.toFixed(2)}
                              </span>
                              <span className="text-sm font-medium text-dark-400">MAD</span>
                            </div>
                            {objective.target_amount && (
                              <p className="text-sm text-dark-400 mt-1">
                                of {Number(objective.target_amount).toFixed(2)} MAD target
                              </p>
                            )}
                          </div>

                          {/* Progress Bar */}
                          {objective.target_amount && (
                            <div className="mb-4">
                              <div className="flex justify-between items-center mb-2">
                                <span className="text-sm font-medium text-dark-500">Progress</span>
                                <span className="text-sm font-semibold text-primary-600">
                                  {progress.toFixed(1)}%
                                </span>
                              </div>
                              <div className="w-full bg-primary-100 rounded-full h-3 overflow-hidden">
                                <div
                                  className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                                  style={{
                                    width: `${Math.min(100, progress)}%`
                                  }}
                                ></div>
                              </div>
                              {progress >= 100 && (
                                <div className="flex items-center space-x-1 mt-2">
                                  <div className="w-2 h-2 bg-primary-500 rounded-full animate-pulse"></div>
                                  <span className="text-xs font-medium text-primary-600">Goal Achieved!</span>
                                </div>
                              )}
                            </div>
                          )}

                          {/* Target Date */}
                          {objective.target_date && (
                            <div className="flex items-center space-x-2 text-sm text-dark-400">
                              <div className="w-4 h-4 rounded-full bg-primary-200 flex items-center justify-center">
                                <div className="w-1.5 h-1.5 bg-primary-600 rounded-full"></div>
                              </div>
                              <span>Due: {format(new Date(objective.target_date), 'MMM dd, yyyy')}</span>
                            </div>
                          )}

                          {/* Notes Preview */}
                          {objective.notes && (
                            <div className="mt-3 p-3 bg-white/70 rounded-lg border border-primary-100">
                              <p className="text-xs text-dark-500 italic line-clamp-2">
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
                )}
              </div>

            )}
          </div>
        </div>
      </div>
    </div>
  )
}