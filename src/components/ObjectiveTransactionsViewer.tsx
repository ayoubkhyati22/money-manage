import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { History, Calendar, Building2, ArrowUpCircle, ArrowDownCircle, RotateCcw } from 'lucide-react'
import { format } from 'date-fns'
import Swal from 'sweetalert2'

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
  const { showError } = useSweetAlert()
  const [transactions, setTransactions] = useState<ObjectiveTransaction[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (objectiveId) {
      loadTransactions()

      // Set up real-time subscription - Fixed to not use updated_at
      const channel = supabase
        .channel(`objective_transactions_${objectiveId}`)
        .on(
          'postgres_changes',
          {
            event: '*',
            schema: 'public',
            table: 'objectives_transactions',
            filter: `objective_id=eq.${objectiveId}`
          },
          (payload) => {
            console.log('Transaction change detected:', payload)
            loadTransactions()
          }
        )
        .subscribe()

      return () => {
        supabase.removeChannel(channel)
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
    // Only allow returning money for withdrawal transactions (negative amounts)
    if (transaction.amount >= 0) {
      await showError('Invalid Operation', 'Can only return withdrawal transactions')
      return
    }

    const maxReturnAmount = Math.abs(transaction.amount)
    
    // Step 1: Ask user to choose between full or partial return
    const result = await Swal.fire({
      title: 'Return Money',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f3f4f6; padding: 15px; border-radius: 8px; margin-bottom: 20px;">
            <p style="margin: 0; color: #6b7280; font-size: 14px;">Transaction Amount</p>
            <p style="margin: 5px 0 0 0; color: #111827; font-size: 24px; font-weight: bold;">
              ${maxReturnAmount.toFixed(2)} MAD
            </p>
          </div>
          <p style="color: #374151; font-size: 15px; margin-bottom: 10px;">
            How much would you like to return?
          </p>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '💰 Full Amount',
      denyButtonText: '✏️ Partial Amount',
      cancelButtonText: '❌ Cancel',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#3b82f6',
      cancelButtonColor: '#6b7280',
      width: '450px',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-6 py-2.5 rounded-lg font-semibold',
        denyButton: 'px-6 py-2.5 rounded-lg font-semibold',
        cancelButton: 'px-6 py-2.5 rounded-lg font-semibold'
      }
    })

    if (result.dismiss) return // User cancelled

    let returnAmount = maxReturnAmount

    // Step 2: If partial, ask for amount
    if (result.isDenied) {
      const inputResult = await Swal.fire({
        title: 'Specify Amount',
        html: `
          <div style="text-align: left; padding: 10px;">
            <div style="background: #eff6ff; padding: 15px; border-radius: 8px; margin-bottom: 20px; border: 2px solid #3b82f6;">
              <p style="margin: 0; color: #1e40af; font-size: 13px;">Maximum Available</p>
              <p style="margin: 5px 0 0 0; color: #1e3a8a; font-size: 22px; font-weight: bold;">
                ${maxReturnAmount.toFixed(2)} MAD
              </p>
            </div>
            <label style="display: block; color: #374151; font-size: 14px; font-weight: 500; margin-bottom: 8px;">
              Amount to Return (MAD)
            </label>
          </div>
        `,
        input: 'number',
        inputValue: maxReturnAmount.toFixed(2),
        inputAttributes: {
          min: '0.01',
          max: maxReturnAmount.toString(),
          step: '0.01',
          style: 'text-align: center; font-size: 18px; font-weight: bold; padding: 12px;'
        },
        showCancelButton: true,
        confirmButtonText: '✓ Confirm',
        cancelButtonText: '← Back',
        confirmButtonColor: '#3b82f6',
        cancelButtonColor: '#6b7280',
        width: '450px',
        inputValidator: (value) => {
          const num = parseFloat(value)
          if (!value || isNaN(num)) {
            return 'Please enter a valid amount'
          }
          if (num <= 0) {
            return 'Amount must be greater than 0'
          }
          if (num > maxReturnAmount) {
            return `Amount cannot exceed ${maxReturnAmount.toFixed(2)} MAD`
          }
          return null
        },
        customClass: {
          popup: 'rounded-xl',
          input: 'rounded-lg border-2 border-blue-300',
          confirmButton: 'px-6 py-2.5 rounded-lg font-semibold',
          cancelButton: 'px-6 py-2.5 rounded-lg font-semibold'
        }
      })

      if (!inputResult.isConfirmed || !inputResult.value) return // User cancelled
      returnAmount = parseFloat(inputResult.value)
    }

    // Step 3: Final confirmation
    const confirmResult = await Swal.fire({
      title: 'Confirm Return',
      html: `
        <div style="text-align: left; padding: 10px;">
          <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin-bottom: 15px; border: 2px solid #10b981;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #065f46; font-size: 14px;">Bank:</span>
              <span style="color: #064e3b; font-weight: 600; font-size: 14px;">${transaction.bank_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 10px;">
              <span style="color: #065f46; font-size: 14px;">Objective:</span>
              <span style="color: #064e3b; font-weight: 600; font-size: 14px;">${transaction.objective_name}</span>
            </div>
            <div style="border-top: 1px solid #86efac; margin: 15px 0; padding-top: 15px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: #065f46; font-size: 15px; font-weight: 500;">Return Amount:</span>
                <span style="color: #10b981; font-weight: bold; font-size: 24px;">
                  +${returnAmount.toFixed(2)} MAD
                </span>
              </div>
            </div>
          </div>
          ${returnAmount < maxReturnAmount ? `
            <div style="background: #fef3c7; padding: 12px; border-radius: 8px; border: 1px solid #fbbf24;">
              <p style="margin: 0; color: #92400e; font-size: 13px;">
                ℹ️ Partial return: ${(maxReturnAmount - returnAmount).toFixed(2)} MAD will remain withdrawn
              </p>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: '✓ Yes, Return Money',
      cancelButtonText: '❌ Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: '#6b7280',
      width: '500px',
      customClass: {
        popup: 'rounded-xl',
        confirmButton: 'px-6 py-2.5 rounded-lg font-semibold',
        cancelButton: 'px-6 py-2.5 rounded-lg font-semibold'
      }
    })
    
    if (!confirmResult.isConfirmed) return

    try {
      // If partial return, update the transaction amount instead of deleting
      if (returnAmount < maxReturnAmount) {
        const newTransactionAmount = transaction.amount + returnAmount
        
        const { error: updateError } = await supabase
          .from('objectives_transactions')
          .update({ 
            amount: newTransactionAmount,
            description: `${transaction.description} (Partial return: ${returnAmount.toFixed(2)} MAD)`
          })
          .eq('id', transaction.id)
        
        if (updateError) throw updateError
      } else {
        // Full return - delete the transaction
        const { error: deleteError } = await supabase
          .from('objectives_transactions')
          .delete()
          .eq('id', transaction.id)

        if (deleteError) throw deleteError
      }

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

      await Swal.fire({
        title: 'Success!',
        html: `
          <div style="text-align: center; padding: 10px;">
            <div style="font-size: 48px; margin-bottom: 15px;">✅</div>
            <p style="color: #374151; font-size: 16px; margin-bottom: 10px;">
              Money has been returned successfully
            </p>
            <div style="background: #ecfdf5; padding: 15px; border-radius: 8px; display: inline-block;">
              <p style="margin: 0; color: #065f46; font-size: 14px;">Returned Amount</p>
              <p style="margin: 5px 0 0 0; color: #10b981; font-size: 28px; font-weight: bold;">
                +${returnAmount.toFixed(2)} MAD
              </p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Done',
        confirmButtonColor: '#10b981',
        timer: 3000,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-xl',
          confirmButton: 'px-6 py-2.5 rounded-lg font-semibold'
        }
      })

      // Refresh data
      loadTransactions()
      if (onUpdate) onUpdate()
    } catch (error: any) {
      await showError('Return Failed', error.message)
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