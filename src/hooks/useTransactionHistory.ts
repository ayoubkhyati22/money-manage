import { useState, useEffect } from 'react'
import { fetchTransactions, returnMoney, returnMultipleTransactions, PAGE_SIZE } from '../services/transactionService'
import { ObjectiveTransaction } from '../types/transaction'
import { useAuth } from './useAuth'
import { useSweetAlert } from './useSweetAlert'
import Swal from 'sweetalert2'

export const useTransactionHistory = (onUpdate?: () => void) => {
  const { user } = useAuth()
  const { showConfirm, showSuccess, showError } = useSweetAlert()
  const [transactions, setTransactions] = useState<ObjectiveTransaction[]>([])
  const [loading, setLoading] = useState(false)
  const [showWithdrawnOnly, setShowWithdrawnOnly] = useState(false)
  const [page, setPage] = useState(1)
  const [totalCount, setTotalCount] = useState(0)
  const [hasMore, setHasMore] = useState(true)
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [isSelectionMode, setIsSelectionMode] = useState(false)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    setPage(1)
    loadTransactions(1, true)
    // Reset selection when filter changes
    setSelectedIds(new Set())
    setIsSelectionMode(false)
  }, [user, showWithdrawnOnly, isDesktop])

  const loadTransactions = async (pageNumber = 1, reset = false) => {
    if (!user) return
    setLoading(true)
    try {
      const { transactions: newTransactions, totalCount: count } =
        await fetchTransactions(pageNumber, showWithdrawnOnly)

      setTotalCount(count)

      if (reset || isDesktop) {
        setTransactions(newTransactions)
      } else {
        setTransactions((prev) => [...prev, ...newTransactions])
      }
      setHasMore(newTransactions.length === PAGE_SIZE)
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
      await returnMoney(transaction, returnAmount)
      
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
      
      loadTransactions(page, true)
      if (onUpdate) onUpdate()
    } catch (err: any) {
      await showError('Return Failed', err.message)
    }
  }

  const handleReturnSelected = async () => {
    const selectedTransactions = transactions.filter(t => selectedIds.has(t.id))
    
    if (selectedTransactions.length === 0) {
      await showError('No Selection', 'Please select at least one transaction to return')
      return
    }

    const totalAmount = selectedTransactions.reduce((sum, t) => sum + Math.abs(t.amount), 0)
    
    const result = await showConfirm(
      'Return Selected Transactions?',
      `Are you sure you want to return ${selectedTransactions.length} transaction(s) totaling ${totalAmount.toFixed(2)} MAD?`
    )
    
    if (!result.isConfirmed) return

    try {
      await returnMultipleTransactions(selectedTransactions)
      await showSuccess(
        'Transactions Returned!',
        `${selectedTransactions.length} transaction(s) totaling ${totalAmount.toFixed(2)} MAD have been returned`
      )
      setSelectedIds(new Set())
      setIsSelectionMode(false)
      loadTransactions(page, true)
      if (onUpdate) onUpdate()
    } catch (err: any) {
      await showError('Return Failed', err.message)
    }
  }

  const toggleSelection = (transactionId: string) => {
    setSelectedIds(prev => {
      const newSet = new Set(prev)
      if (newSet.has(transactionId)) {
        newSet.delete(transactionId)
      } else {
        newSet.add(transactionId)
      }
      return newSet
    })
  }

  const toggleSelectAll = () => {
    const selectableTransactions = transactions.filter(t => t.amount < 0 && !isStockTransaction(t))
    
    if (selectedIds.size === selectableTransactions.length && selectableTransactions.length > 0) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(selectableTransactions.map(t => t.id)))
    }
  }

  const isStockTransaction = (transaction: ObjectiveTransaction) => {
    return transaction.description?.includes('Stock Purchase:') || 
           transaction.description?.includes('Stock Sale:')
  }

  const getSelectedTotal = () => {
    return transactions
      .filter(t => selectedIds.has(t.id))
      .reduce((sum, t) => sum + Math.abs(t.amount), 0)
  }

  const toggleFilter = () => {
    setShowWithdrawnOnly((prev) => !prev)
  }

  const loadMore = () => {
    const next = page + 1
    setPage(next)
    loadTransactions(next)
  }

  const goToPage = (pageNumber: number) => {
    const totalPages = Math.ceil(totalCount / PAGE_SIZE)
    if (pageNumber > 0 && pageNumber <= totalPages) {
      setPage(pageNumber)
      loadTransactions(pageNumber)
    }
  }

  const toggleSelectionMode = () => {
    setIsSelectionMode(prev => !prev)
    if (isSelectionMode) {
      setSelectedIds(new Set())
    }
  }

  return {
    transactions,
    loading,
    showWithdrawnOnly,
    page,
    totalCount,
    hasMore,
    isDesktop,
    selectedIds,
    isSelectionMode,
    handleReturnMoney,
    handleReturnSelected,
    toggleSelection,
    toggleSelectAll,
    toggleFilter,
    loadMore,
    goToPage,
    toggleSelectionMode,
    getSelectedTotal,
    refresh: () => loadTransactions(1, true)
  }
}