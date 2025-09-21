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
          <div key={i} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 animate-pulse">
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
        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Balance</p>
              <p className="text-2xl font-bold text-gray-900">{totalBalance.toFixed(2)} MAD</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-emerald-100 rounded-lg">
              <DollarSign className="w-6 h-6 text-emerald-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Active Banks</p>
              <p className="text-2xl font-bold text-gray-900">{banks.length}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-blue-100 rounded-lg">
              <Building2 className="w-6 h-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Objectives</p>
              <p className="text-2xl font-bold text-gray-900">{goals.length}</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-orange-100 rounded-lg">
              <Target className="w-6 h-6 text-orange-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl p-6 shadow-sm border border-gray-200 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total Objectives</p>
              <p className="text-2xl font-bold text-gray-900">{totalObjectives.toFixed(2)} MAD</p>
            </div>
            <div className="flex items-center justify-center w-12 h-12 bg-purple-100 rounded-lg">
              <TrendingUp className="w-6 h-6 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Banks and Objectives Overview */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Banks Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Banks Overview</h3>
          </div>
          <div className="p-6">
            {banks.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-blue-100 rounded-full mx-auto mb-4">
                  <Building2 className="w-8 h-8 text-blue-600" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No banks added yet</p>
                <p className="text-sm text-gray-400 mt-1">Add your first bank to get started</p>
              </div>
            ) : (
              <div className="space-y-4">
                {banks.map((bank) => (
                  <div key={bank.id} className="flex items-center justify-between p-4 bg-gradient-to-r from-blue-50 to-indigo-50 border border-blue-200 rounded-lg hover:shadow-md transition-all duration-200">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-12 h-12 bg-white border-2 border-blue-200 rounded-lg shadow-md">
                        {bank.logo ? (
                          <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <Building2 className="w-6 h-6 text-blue-600" />
                        )}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{bank.name}</p>
                        <p className="text-sm text-gray-600">Current Balance</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-xl font-bold text-gray-900">{Number(bank.balance).toFixed(2)}</p>
                      <p className="text-sm text-gray-600">MAD</p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Objectives Overview */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-200">
          <div className="p-6 border-b border-gray-200">
            <h3 className="text-lg font-semibold text-gray-900">Objectives Overview</h3>
          </div>
          <div className="p-6">
            {objectivesWithAmounts.length === 0 ? (
              <div className="text-center py-12">
                <div className="flex items-center justify-center w-16 h-16 bg-orange-100 rounded-full mx-auto mb-4">
                  <Target className="w-8 h-8 text-orange-600" />
                </div>
                <p className="text-gray-500 text-lg font-medium">No objectives created yet</p>
                <p className="text-sm text-gray-400 mt-1">Start by creating your first financial goal</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {objectivesWithAmounts.map((objective) => {
                  const progress = objective.target_amount
                    ? (objective.total_amount / objective.target_amount) * 100
                    : 0

                  return (
                    <div key={objective.id} className="relative bg-gradient-to-br from-orange-50 to-amber-50 border border-orange-200 rounded-xl p-5 hover:shadow-lg transition-all duration-300 group">
                      {/* Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-orange-500 to-amber-500 rounded-xl shadow-md">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-bold text-gray-900 text-lg truncate group-hover:text-orange-700 transition-colors">
                              {objective.name}
                            </h4>
                            {objective.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800 mt-1">
                                {objective.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Amount Display */}
                      <div className="mb-4">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-bold text-gray-900">
                            {objective.total_amount.toFixed(2)}
                          </span>
                          <span className="text-sm font-medium text-gray-600">MAD</span>
                        </div>
                        {objective.target_amount && (
                          <p className="text-sm text-gray-600 mt-1">
                            of {Number(objective.target_amount).toFixed(2)} MAD target
                          </p>
                        )}
                      </div>

                      {/* Progress Bar */}
                      {objective.target_amount && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-gray-700">Progress</span>
                            <span className="text-sm font-bold text-orange-600">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-orange-100 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500 ease-out shadow-sm"
                              style={{
                                width: `${Math.min(100, progress)}%`
                              }}
                            ></div>
                          </div>
                          {progress >= 100 && (
                            <div className="flex items-center space-x-1 mt-2">
                              <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-green-600">Goal Achieved!</span>
                            </div>
                          )}
                        </div>
                      )}

                      {/* Target Date */}
                      {objective.target_date && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                          <div className="w-4 h-4 rounded-full bg-orange-200 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-orange-600 rounded-full"></div>
                          </div>
                          <span>Due: {format(new Date(objective.target_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}

                      {/* Notes Preview */}
                      {objective.notes && (
                        <div className="mt-3 p-3 bg-white bg-opacity-50 rounded-lg">
                          <p className="text-xs text-gray-600 italic line-clamp-2">
                            "{objective.notes}"
                          </p>
                        </div>
                      )}

                      {/* Hover Effect Overlay */}
                      <div className="absolute inset-0 bg-gradient-to-br from-orange-500 to-amber-500 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}