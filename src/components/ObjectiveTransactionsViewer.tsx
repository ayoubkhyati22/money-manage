import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { History, Calendar, Building2, ArrowUpCircle, ArrowDownCircle, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import { toast } from 'react-hot-toast'

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

interface ObjectiveTransactionsViewerProps {
  objectiveId?: string
  objectiveName?: string
  onUpdate?: () => void
}

export function ObjectiveTransactionsViewer({
  objectiveId,
  objectiveName,
  onUpdate
}: ObjectiveTransactionsViewerProps) {
  const { user } = useAuth()
  const [transactions, setTransactions] = useState<ObjectiveTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (objectiveId) {
      loadTransactions()

      // Set up real-time subscription
      const subscription = supabase
        .channel('objective_transactions_changes')
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'objectives_transactions',
            filter: `objective_id=eq.${objectiveId}`
          },
          () => {
            loadTransactions()
          }
        )
        .subscribe()

      return () => {
        subscription.unsubscribe()
      }
    }
  }, [objectiveId, user])

  const loadTransactions = async () => {
    if (!user || !objectiveId) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('objectives_transactions')
        .select(`
          *,
          banks:bank_id(name),
          goals:objective_id(name)
        `)
        .eq('objective_id', objectiveId)
        .order('created_at', { ascending: false })

      if (error) throw error

      const transactionsWithDetails: ObjectiveTransaction[] = data?.map(transaction => ({
        id: transaction.id,
        objective_id: transaction.objective_id,
        bank_id: transaction.bank_id,
        amount: Number(transaction.amount),
        description: transaction.description || '',
        created_at: transaction.created_at,
        bank_name: (transaction.banks as any)?.name || 'Unknown Bank',
        objective_name: (transaction.goals as any)?.name || objectiveName || 'Unknown Objective'
      })) || []

      setTransactions(transactionsWithDetails)
    } catch (error: any) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnMoney = async (transaction: ObjectiveTransaction) => {
    if (!confirm(`Return ${Math.abs(transaction.amount).toFixed(2)} MAD to ${transaction.bank_name}?`)) {
      return
    }

    try {
      // Only allow returning money for withdrawal transactions (negative amounts)
      if (transaction.amount >= 0) {
        toast.error('Can only return withdrawal transactions')
        return
      }

      const returnAmount = Math.abs(transaction.amount) // Make it positive

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

      toast.success(`${returnAmount.toFixed(2)} MAD returned successfully!`)

      // Refresh data
      loadTransactions()
      if (onUpdate) onUpdate()
    } catch (error: any) {
      toast.error('Error returning money: ' + error.message)
    }
  }

  if (!objectiveId) {
    return (
      <div className="bg-gray-50 rounded-lg p-4">
        <p className="text-gray-500 text-center">Select an objective to view transactions</p>
      </div>
    )
  }

  if (loading && transactions.length === 0) {
    return (
      <div className="space-y-3">
        {[...Array(3)].map((_, i) => (
          <div key={i} className="bg-white rounded-lg p-4 animate-pulse">
            <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
            <div className="h-3 bg-gray-200 rounded w-1/2"></div>
          </div>
        ))}
      </div>
    )
  }

  const totalAmount = transactions.reduce((sum, t) => sum + t.amount, 0)

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-lg p-4 border border-gray-200">
        <div className="flex items-center justify-between">
          <h4 className="text-lg font-semibold text-gray-900">
            Transaction History
          </h4>
          <div className="text-right">
            <p className="text-2xl font-bold text-gray-900">{totalAmount.toFixed(2)} MAD</p>
            <p className="text-sm text-gray-500">Total Amount</p>
          </div>
        </div>
      </div>

      {transactions.length === 0 ? (
        <div className="bg-white rounded-lg p-8 text-center border border-gray-200">
          <History className="mx-auto w-12 h-12 text-gray-400 mb-4" />
          <p className="text-gray-500">No transactions yet</p>
          <p className="text-sm text-gray-400 mt-1">Transactions will appear here in real-time</p>
        </div>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {transactions.map((transaction) => (
            <div key={transaction.id} className="bg-white rounded-lg p-4 border border-gray-200 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between">
                <div className="flex items-center space-x-3">
                  <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                    transaction.amount >= 0
                      ? 'bg-green-100'
                      : 'bg-red-100'
                  }`}>
                    {transaction.amount >= 0 ? (
                      <ArrowUpCircle className="w-5 h-5 text-green-600" />
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
                      {transaction.amount >= 0 ? 'Added' : 'Withdrawn'}
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
  )
}