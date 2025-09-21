import { useState, useEffect } from 'react'
import { TransactionWithDetails, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { History, Calendar, Building2, ArrowDownCircle } from 'lucide-react'
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface TransactionHistoryProps {
  transactions: TransactionWithDetails[]
  onUpdate: (transactions: TransactionWithDetails[]) => void
}

export function TransactionHistory({ transactions, onUpdate }: TransactionHistoryProps) {
  const { user } = useAuth()
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadTransactions()
  }, [user])

  const loadTransactions = async () => {
    if (!user) return
    
    setLoading(true)
    try {
      const { data: transactionsData, error: transactionsError } = await supabase
        .from('transactions')
        .select(`
          *,
          banks:bank_id(name)
        `)
        .order('created_at', { ascending: false })

      if (transactionsError) throw transactionsError

      // Load transaction goals for each transaction
      const transactionIds = transactionsData?.map(t => t.id) || []
      
      if (transactionIds.length > 0) {
        const { data: transactionGoals, error: goalsError } = await supabase
          .from('transaction_goals')
          .select(`
            transaction_id,
            amount,
            goals:goal_id(name)
          `)
          .in('transaction_id', transactionIds)

        if (goalsError) throw goalsError

        // Combine data
        const transactionsWithDetails: TransactionWithDetails[] = transactionsData?.map(transaction => ({
          ...transaction,
          bank_name: (transaction.banks as any)?.name || 'Unknown Bank',
          transaction_goals: transactionGoals
            ?.filter(tg => tg.transaction_id === transaction.id)
            ?.map(tg => ({
              goal_name: (tg.goals as any)?.name || 'Unknown Goal',
              amount: Number(tg.amount)
            })) || []
        })) || []

        onUpdate(transactionsWithDetails)
      } else {
        onUpdate([])
      }
    } catch (error: any) {
      toast.error('Error loading transaction history: ' + error.message)
      onUpdate([])
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
            <div className="h-20 bg-gray-200 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900">Transaction History</h2>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">Recent Withdrawals</h3>
        </div>
        
        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">No transactions yet</p>
              <p className="text-sm text-gray-400 mt-1">Your withdrawal history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  {/* Transaction Header */}
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-red-100 rounded-lg">
                        <ArrowDownCircle className="w-5 h-5 text-red-600" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <Calendar className="w-4 h-4 text-gray-400" />
                          <span className="text-sm font-medium text-gray-900">
                            {format(new Date(transaction.created_at), 'MMM dd, yyyy HH:mm')}
                          </span>
                        </div>
                        <div className="flex items-center space-x-2 mt-1">
                          <Building2 className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{transaction.bank_name}</span>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-lg font-bold text-red-600">
                        -{Number(transaction.total_amount).toFixed(2)} MAD
                      </p>
                      <p className="text-xs text-gray-500">Total Withdrawal</p>
                    </div>
                  </div>

                  {/* Goal Breakdown */}
                  {transaction.transaction_goals.length > 0 && (
                    <div className="bg-gray-50 rounded-lg p-3 mb-3">
                      <h4 className="text-sm font-medium text-gray-700 mb-2">Goal Breakdown:</h4>
                      <div className="space-y-1">
                        {transaction.transaction_goals.map((tg, index) => (
                          <div key={index} className="flex items-center justify-between text-sm">
                            <span className="text-gray-600">• {tg.goal_name}</span>
                            <span className="font-medium text-gray-900">
                              -{tg.amount.toFixed(2)} MAD
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Description */}
                  {transaction.description && (
                    <div className="bg-blue-50 rounded-lg p-3">
                      <p className="text-sm text-blue-800">
                        <span className="font-medium">Description:</span> {transaction.description}
                      </p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}