import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { History, Calendar, Building2, ArrowDownCircle, Target, RotateCcw, Filter } from 'lucide-react'
import { format } from 'date-fns'

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

const PAGE_SIZE = 10

export function TransactionHistory({ onUpdate }: TransactionHistoryProps) {
  const { user } = useAuth()
  const { showConfirm, showSuccess, showError } = useSweetAlert()
  const [transactions, setTransactions] = useState<ObjectiveTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [showWithdrawnOnly, setShowWithdrawnOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  useEffect(() => {
    setPage(1) // reset page when filter changes
    loadTransactions(1, true)
  }, [user, showWithdrawnOnly])

  const loadTransactions = async (pageNumber = 1, reset = false) => {
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
        .range((pageNumber - 1) * PAGE_SIZE, pageNumber * PAGE_SIZE - 1)

      if (showWithdrawnOnly) {
        query = query.lt('amount', 0)
      }

      const { data, error } = await query
      if (error) throw error

      const formatted: ObjectiveTransaction[] = data?.map((t) => ({
        id: t.id,
        objective_id: t.objective_id,
        bank_id: t.bank_id,
        amount: Number(t.amount),
        description: t.description || '',
        created_at: t.created_at,
        bank_name: (t.banks as any)?.name || 'Unknown Bank',
        objective_name: (t.goals as any)?.name || 'Unknown Objective'
      })) || []

      if (reset) {
        setTransactions(formatted)
      } else {
        setTransactions((prev) => [...prev, ...formatted])
      }
      setHasMore(formatted.length === PAGE_SIZE)
    } catch (err: any) {
      await showError('Loading Failed', err.message)
    } finally {
      setLoading(false)
    }
  }

  const handleReturnMoney = async (transaction: ObjectiveTransaction) => {
    if (transaction.amount >= 0) {
      await showError('Invalid Operation', 'Can only return withdrawal transactions')
      return
    }

    const returnAmount = Math.abs(transaction.amount)
    const result = await showConfirm(
      'Return Money?',
      `Are you sure you want to return ${returnAmount.toFixed(2)} MAD to ${transaction.bank_name}?`
    )
    if (!result.isConfirmed) return

    try {
      const { error: deleteError } = await supabase
        .from('objectives_transactions')
        .delete()
        .eq('id', transaction.id)
      if (deleteError) throw deleteError

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

      await showSuccess('Money Returned!', `${returnAmount.toFixed(2)} MAD has been returned`)
      loadTransactions(page, true)
      if (onUpdate) onUpdate()
    } catch (err: any) {
      await showError('Return Failed', err.message)
    }
  }

  const toggleWithdrawnFilter = () => {
    setShowWithdrawnOnly((prev) => !prev)
  }

  const handleLoadMore = () => {
    const next = page + 1
    setPage(next)
    loadTransactions(next)
  }

  return (
    <div className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
        <h2 className="text-xl sm:text-2xl font-bold text-gray-900 dark:text-dark-100">
          Transaction History
        </h2>
        <div className="flex items-center gap-3">
          <button
            onClick={toggleWithdrawnFilter}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors
            ${showWithdrawnOnly
              ? 'bg-red-100 text-red-700 hover:bg-red-200 dark:bg-red-900/30 dark:text-red-300'
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-dark-700 dark:text-dark-200'
            }`}
          >
            <Filter className="w-4 h-4" />
            {showWithdrawnOnly ? 'Withdrawn Only' : 'All'}
          </button>
          <button
            onClick={() => loadTransactions(1, true)}
            className="p-2 rounded-lg hover:bg-gray-200 dark:hover:bg-dark-600 text-emerald-600 dark:text-emerald-400"
            title="Refresh"
          >
            <RotateCcw className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Transactions */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600">
        <div className="p-4 sm:p-6 border-b border-gray-200 dark:border-dark-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">
            {showWithdrawnOnly ? 'Withdrawn Transactions' : 'All Transactions'}
          </h3>
          <p className="text-sm text-gray-500 dark:text-dark-300 mt-1">
            {showWithdrawnOnly ? 'Only withdrawals from objectives.' : 'Recent financial activities.'}
          </p>
        </div>

        <div className="p-3 sm:p-6">
          {transactions.length === 0 && !loading ? (
            <div className="text-center py-12">
              <History className="mx-auto w-12 h-12 text-gray-400 dark:text-dark-500 mb-4" />
              <p className="text-gray-500 dark:text-dark-300">
                {showWithdrawnOnly ? 'No withdrawn transactions.' : 'No transactions yet.'}
              </p>
              <p className="text-sm text-gray-400 mt-1">
                Your transaction history will appear here
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {transactions.map((t) => (
                <div
                  key={t.id}
                  className="flex flex-col sm:flex-row sm:items-center sm:justify-between border border-gray-200 dark:border-dark-600 rounded-lg p-4 bg-white dark:bg-dark-800 hover:shadow-md transition"
                >
                  {/* Left */}
                  <div className="flex items-start gap-3">
                    <div className={`flex items-center justify-center w-10 h-10 rounded-lg ${
                      t.amount >= 0 ? 'bg-green-100 dark:bg-green-900/30' : 'bg-red-100 dark:bg-red-900/30'
                    }`}>
                      {t.amount >= 0 ? (
                        <Target className="w-5 h-5 text-green-600 dark:text-green-400" />
                      ) : (
                        <ArrowDownCircle className="w-5 h-5 text-red-600 dark:text-red-400" />
                      )}
                    </div>
                    <div className="text-sm">
                      <div className="flex items-center gap-1 text-gray-600 dark:text-dark-300">
                        <Calendar className="w-4 h-4 text-gray-400" />
                        {format(new Date(t.created_at), 'MMM dd, yyyy HH:mm')}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-gray-600 dark:text-dark-300">
                        <Building2 className="w-4 h-4 text-gray-400" /> {t.bank_name}
                      </div>
                      <div className="flex items-center gap-1 mt-1 text-gray-600 dark:text-dark-300">
                        <Target className="w-4 h-4 text-gray-400" /> {t.objective_name}
                      </div>
                      {t.description && (
                        <p className="italic text-gray-500 dark:text-dark-400 mt-1">
                          "{t.description}"
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Right */}
                  <div className="flex items-center justify-between sm:justify-end gap-3 mt-3 sm:mt-0">
                    <div className="text-right">
                      <p className={`text-lg font-bold ${t.amount >= 0 ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                        {t.amount >= 0 ? '+' : ''}{t.amount.toFixed(2)} MAD
                      </p>
                      <p className="text-xs text-gray-500 dark:text-dark-400">
                        {t.amount >= 0 ? 'Added' : 'Withdrawn'}
                      </p>
                    </div>
                    {t.amount < 0 && (
                      <button
                        onClick={() => handleReturnMoney(t)}
                        className="p-2 rounded-lg text-gray-400 dark:text-dark-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/20"
                        title="Return Money"
                      >
                        <RotateCcw className="w-4 h-4" />
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Load More */}
          {hasMore && !loading && (
            <div className="mt-4 flex justify-center">
              <button
                onClick={handleLoadMore}
                className="px-4 py-2 rounded-lg bg-gray-100 dark:bg-dark-700 hover:bg-gray-200 dark:hover:bg-dark-600 text-gray-700 dark:text-dark-200 text-sm font-medium"
              >
                Load more
              </button>
            </div>
          )}

          {loading && (
            <div className="mt-4 text-center text-sm text-gray-500 dark:text-dark-400">
              Loading...
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
