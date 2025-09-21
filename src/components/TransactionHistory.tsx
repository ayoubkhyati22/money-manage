import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { History, Calendar, Building2, ArrowDownCircle, Target, RotateCcw, Filter } from 'lucide-react' // Import Filter icon
import { format } from 'date-fns'
import toast from 'react-hot-toast'

interface ObjectiveTransaction {
  id: string
  objective_id: string
  bank_id: string
  amount: number
  description: string
  created_at: string
  bank_name: string
  objective_name: string
}

interface TransactionHistoryProps {
  onUpdate?: () => void
}

export function TransactionHistory({ onUpdate }: TransactionHistoryProps) {
  const { user } = useAuth()
  const { showConfirm, showSuccess, showError } = useSweetAlert()
  const [transactions, setTransactions] = useState<ObjectiveTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [showWithdrawnOnly, setShowWithdrawnOnly] = useState(false) // New state for filter

  useEffect(() => {
    loadTransactions()
  }, [user, showWithdrawnOnly]) // Add showWithdrawnOnly to dependencies

  const loadTransactions = async () => {
    if (!user) return

    setLoading(true)
    try {
      let query = supabase
        .from('objectives_transactions')
        .select(`
          *,
          banks:bank_id(name),
          goals:objective_id(name)
        `)
        .order('created_at', { ascending: false })
        .limit(50)

      // Apply filter if showWithdrawnOnly is true
      if (showWithdrawnOnly) {
        query = query.lt('amount', 0) // Filter where amount is less than 0 (withdrawals)
      }

      const { data, error } = await query

      if (error) throw error

      const transactionsWithDetails: ObjectiveTransaction[] = data?.map(transaction => ({
        id: transaction.id,
        objective_id: transaction.objective_id,
        bank_id: transaction.bank_id,
        amount: Number(transaction.amount),
        description: transaction.description || '',
        created_at: transaction.created_at,
        bank_name: (transaction.banks as any)?.name || 'Unknown Bank',
        objective_name: (transaction.goals as any)?.name || 'Unknown Objective'
      })) || []

      setTransactions(transactionsWithDetails)
    } catch (error: any) {
      await showError('Loading Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnMoney = async (transaction: ObjectiveTransaction) => {
    // Only allow returning money for withdrawal transactions (negative amounts)
    if (transaction.amount >= 0) {
      await showError('Invalid Operation', 'Can only return withdrawal transactions')
      return
    }

    const returnAmount = Math.abs(transaction.amount)

    const result = await showConfirm(
      'Return Money?',
      `Are you sure you want to return ${returnAmount.toFixed(2)} MAD to ${transaction.bank_name}? This will reverse the withdrawal transaction.`
    )

    if (!result.isConfirmed) return

    try {
      // 1. Delete the original transaction
      const { error: deleteError } = await supabase
        .from('objectives_transactions')
        .delete()
        .eq('id', transaction.id)

      if (deleteError) throw deleteError

      // 2. Return money to bank balance
      const { data: bankData, error: bankFetchError } = await supabase
        .from('banks')
        .select('balance')
        .eq('id', transaction.bank_id)
        .single()

      if (bankFetchError) throw bankFetchError

      const newBankBalance = Number(bankData.balance) + returnAmount
      const { error: bankUpdateError } = await supabase
        .from('banks')
        .update({ balance: newBankBalance })
        .eq('id', transaction.bank_id)

      if (bankUpdateError) throw bankUpdateError

      // 3. Return money to allocation
      const { data: allocationData, error: allocationFetchError } = await supabase
        .from('allocations')
        .select('amount')
        .eq('goal_id', transaction.objective_id)
        .eq('bank_id', transaction.bank_id)
        .single()

      if (allocationFetchError) throw allocationFetchError

      const newAllocationAmount = Number(allocationData.amount) + returnAmount
      const { error: allocationUpdateError } = await supabase
        .from('allocations')
        .update({ amount: newAllocationAmount })
        .eq('goal_id', transaction.objective_id)
        .eq('bank_id', transaction.bank_id)

      if (allocationUpdateError) throw allocationUpdateError

      await showSuccess(
        'Money Returned!',
        `${returnAmount.toFixed(2)} MAD has been returned to ${transaction.bank_name}`
      )

      // Refresh data
      loadTransactions()
      if (onUpdate) onUpdate()
    } catch (error: any) {
      await showError('Return Failed', error.message)
    }
  }

  const toggleWithdrawnFilter = () => {
    setShowWithdrawnOnly(prev => !prev)
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
        <div className="flex items-center space-x-4">
          <button
            onClick={toggleWithdrawnFilter}
            className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors duration-200
              ${showWithdrawnOnly
                ? 'bg-red-100 text-red-700 hover:bg-red-200'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
          >
            <Filter className="w-4 h-4" />
            <span>{showWithdrawnOnly ? 'Withdrawals' : 'Withdrawals'}</span>
          </button>
          <button
            onClick={loadTransactions}
            className="flex items-center space-x-2 text-emerald-600 hover:text-emerald-700 font-medium"
          >
            <RotateCcw className="w-4 h-4" />
            {/* <span>Refresh</span> */}
          </button>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200">
        <div className="p-6 border-b border-gray-200">
          <h3 className="text-lg font-semibold text-gray-900">
            {showWithdrawnOnly ? 'Withdrawn Transactions' : 'All Transactions'}
          </h3>
          <p className="text-sm text-gray-500 mt-1">
            {showWithdrawnOnly ? 'Only transactions where money was withdrawn from objectives.' : 'Recent financial activities across all objectives.'}
          </p>
        </div>

        <div className="p-6">
          {transactions.length === 0 ? (
            <div className="text-center py-12">
              <History className="mx-auto w-12 h-12 text-gray-400 mb-4" />
              <p className="text-gray-500">
                {showWithdrawnOnly ? 'No withdrawn transactions found.' : 'No transactions yet.'}
              </p>
              <p className="text-sm text-gray-400 mt-1">Your transaction history will appear here</p>
            </div>
          ) : (
            <div className="space-y-4">
              {transactions.map((transaction) => (
                <div key={transaction.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                        transaction.amount >= 0
                          ? 'bg-green-100'
                          : 'bg-red-100'
                      }`}>
                        {transaction.amount >= 0 ? (
                          <Target className="w-5 h-5 text-green-600" />
                        ) : (
                          <ArrowDownCircle className="w-5 h-5 text-red-600" />
                        )}
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
                        <div className="flex items-center space-x-2 mt-1">
                          <Target className="w-4 h-4 text-gray-400" />
                          <span className="text-sm text-gray-600">{transaction.objective_name}</span>
                        </div>
                        {transaction.description && (
                          <p className="text-sm text-gray-500 mt-1 italic">
                            "{transaction.description}"
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className={`text-lg font-bold ${
                          transaction.amount >= 0
                            ? 'text-green-600'
                            : 'text-red-600'
                        }`}>
                          {transaction.amount >= 0 ? '+' : ''}{transaction.amount.toFixed(2)} MAD
                        </p>
                        <p className="text-xs text-gray-500">
                          {transaction.amount >= 0 ? 'Added to Objective' : 'Withdrawn'}
                        </p>
                      </div>

                      {/* Return Money Button (only for withdrawals) */}
                      {transaction.amount < 0 && (
                        <button
                          onClick={() => handleReturnMoney(transaction)}
                          className="p-2 text-gray-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50"
                          title="Return Money"
                        >
                          <RotateCcw className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}