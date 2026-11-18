import { useState, useEffect } from 'react'
import Swal from 'sweetalert2'
import { fetchTransactions, fetchTotals, returnMoney, returnMultipleTransactions, PAGE_SIZE } from '../services/transactionService'
import { ObjectiveTransaction } from '../types/transaction'
import { useAuth } from './useAuth'
import { alert as _alert } from '../lib/alert'
import { useSweetAlert } from './useSweetAlert'

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
  const [totalIn, setTotalIn] = useState(0)
  const [totalOut, setTotalOut] = useState(0)

  useEffect(() => {
    const handleResize = () => {
      setIsDesktop(window.innerWidth >= 768)
    }

    window.addEventListener('resize', handleResize)
    return () => window.removeEventListener('resize', handleResize)
  }, [])

  useEffect(() => {
    loadTotals()
  }, [user])

  useEffect(() => {
    setPage(1)
    loadTransactions(1, true)
    // Reset selection when filter changes
    setSelectedIds(new Set())
    setIsSelectionMode(false)
  }, [user, showWithdrawnOnly, isDesktop])

  const loadTotals = async () => {
    try {
      const { totalIn: tin, totalOut: tout } = await fetchTotals()
      setTotalIn(tin)
      setTotalOut(tout)
    } catch { /* silent */ }
  }

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
    const isDark = document.documentElement.classList.contains('dark')
    
    // Step 1: Ask user to choose between total amount or part of amount
    const result = await Swal.fire({
      title: 'Return Money',
      background: isDark ? '#161a26' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#0f172a',
      html: `
        <div style="text-align: left; padding: 4px;">
          <div style="background: ${isDark ? 'rgba(255,255,255,0.05)' : '#f8fafc'}; border: 1px solid ${isDark ? 'rgba(255,255,255,0.1)' : '#e2e8f0'}; padding: 16px; border-radius: 12px; margin-bottom: 16px;">
            <p style="margin: 0; color: ${isDark ? '#94a3b8' : '#64748b'}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Withdrawn Amount</p>
            <p style="margin: 6px 0 0 0; color: ${isDark ? '#f1f5f9' : '#0f172a'}; font-size: 24px; font-weight: 700;">
              ${maxReturnAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style="font-size: 15px; font-weight: 500; color: ${isDark ? '#94a3b8' : '#64748b'};">MAD</span>
            </p>
          </div>
          <p style="color: ${isDark ? '#cbd5e1' : '#334155'}; font-size: 14px; margin-bottom: 4px; font-weight: 500;">
            Would you like to return the total amount or only a part?
          </p>
        </div>
      `,
      showCancelButton: true,
      showDenyButton: true,
      confirmButtonText: '💰 Total Amount',
      denyButtonText: '✏️ Part of Amount',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      denyButtonColor: '#4f46e5',
      cancelButtonColor: isDark ? '#334155' : '#94a3b8',
      width: '460px',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm',
        denyButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm'
      }
    })

    if (result.dismiss) return // User cancelled

    let returnAmount = maxReturnAmount

    // Step 2: If user chose part, ask for specific amount
    if (result.isDenied) {
      const inputResult = await Swal.fire({
        title: 'Specify Part Amount',
        background: isDark ? '#161a26' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
        html: `
          <div style="text-align: left; padding: 4px;">
            <div style="background: ${isDark ? 'rgba(79,70,229,0.12)' : '#eef2ff'}; border: 1px solid ${isDark ? 'rgba(79,70,229,0.3)' : '#c7d2fe'}; padding: 14px 16px; border-radius: 12px; margin-bottom: 16px;">
              <p style="margin: 0; color: ${isDark ? '#a5b4fc' : '#4338ca'}; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em;">Maximum Available</p>
              <p style="margin: 4px 0 0 0; color: ${isDark ? '#e0e7ff' : '#312e81'}; font-size: 22px; font-weight: 700;">
                ${maxReturnAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
              </p>
            </div>
            <label style="display: block; color: ${isDark ? '#cbd5e1' : '#334155'}; font-size: 13px; font-weight: 600; margin-bottom: 8px;">
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
          style: `text-align: center; font-size: 20px; font-weight: bold; padding: 10px; background: ${isDark ? '#0b0d14' : '#ffffff'}; color: ${isDark ? '#f1f5f9' : '#0f172a'}; border: 1.5px solid ${isDark ? '#334155' : '#cbd5e1'}; border-radius: 10px; width: 85%; margin: 0 auto;`
        },
        showCancelButton: true,
        confirmButtonText: 'Next →',
        cancelButtonText: '← Back',
        confirmButtonColor: '#4f46e5',
        cancelButtonColor: isDark ? '#334155' : '#94a3b8',
        width: '460px',
        inputValidator: (value: string) => {
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
          popup: 'rounded-2xl shadow-2xl',
          confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm',
          cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm'
        }
      })

      if (!inputResult.isConfirmed || !inputResult.value) return // User cancelled
      returnAmount = parseFloat(inputResult.value)
    }

    // Step 3: Final confirmation
    const confirmResult = await Swal.fire({
      title: 'Confirm Return',
      background: isDark ? '#161a26' : '#ffffff',
      color: isDark ? '#f1f5f9' : '#0f172a',
      html: `
        <div style="text-align: left; padding: 4px;">
          <div style="background: ${isDark ? 'rgba(16,185,129,0.1)' : '#ecfdf5'}; border: 1px solid ${isDark ? 'rgba(16,185,129,0.25)' : '#a7f3d0'}; padding: 16px; border-radius: 12px; margin-bottom: 14px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 8px;">
              <span style="color: ${isDark ? '#6ee7b7' : '#065f46'}; font-size: 13px;">Bank:</span>
              <span style="color: ${isDark ? '#f1f5f9' : '#064e3b'}; font-weight: 600; font-size: 13px;">${transaction.bank_name}</span>
            </div>
            <div style="display: flex; justify-content: space-between; margin-bottom: 12px;">
              <span style="color: ${isDark ? '#6ee7b7' : '#065f46'}; font-size: 13px;">Objective:</span>
              <span style="color: ${isDark ? '#f1f5f9' : '#064e3b'}; font-weight: 600; font-size: 13px;">${transaction.objective_name}</span>
            </div>
            <div style="border-top: 1px solid ${isDark ? 'rgba(16,185,129,0.2)' : '#a7f3d0'}; margin: 10px 0; padding-top: 10px;">
              <div style="display: flex; justify-content: space-between; align-items: center;">
                <span style="color: ${isDark ? '#6ee7b7' : '#065f46'}; font-size: 14px; font-weight: 600;">Return Amount:</span>
                <span style="color: #10b981; font-weight: 800; font-size: 22px;">
                  +${returnAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span style="font-size: 14px; font-weight: 600;">MAD</span>
                </span>
              </div>
            </div>
          </div>
          ${returnAmount < maxReturnAmount ? `
            <div style="background: ${isDark ? 'rgba(245,158,11,0.12)' : '#fef3c7'}; padding: 12px 14px; border-radius: 10px; border: 1px solid ${isDark ? 'rgba(245,158,11,0.3)' : '#fde68a'};">
              <p style="margin: 0; color: ${isDark ? '#fcd34d' : '#92400e'}; font-size: 12px; font-weight: 500;">
                ℹ️ Partial return: ${(maxReturnAmount - returnAmount).toFixed(2)} MAD will remain recorded as withdrawn.
              </p>
            </div>
          ` : ''}
        </div>
      `,
      icon: 'question',
      iconColor: '#10b981',
      showCancelButton: true,
      confirmButtonText: '✓ Yes, Return Money',
      cancelButtonText: 'Cancel',
      confirmButtonColor: '#10b981',
      cancelButtonColor: isDark ? '#334155' : '#94a3b8',
      width: '480px',
      customClass: {
        popup: 'rounded-2xl shadow-2xl',
        confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm',
        cancelButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm'
      }
    })
    
    if (!confirmResult.isConfirmed) return

    try {
      await returnMoney(transaction, returnAmount)
      
      await Swal.fire({
        title: 'Success!',
        background: isDark ? '#161a26' : '#ffffff',
        color: isDark ? '#f1f5f9' : '#0f172a',
        html: `
          <div style="text-align: center; padding: 8px;">
            <p style="color: ${isDark ? '#94a3b8' : '#475569'}; font-size: 14px; margin-bottom: 14px;">
              Money has been returned to <strong>${transaction.bank_name}</strong> successfully.
            </p>
            <div style="background: ${isDark ? 'rgba(16,185,129,0.12)' : '#ecfdf5'}; border: 1px solid ${isDark ? 'rgba(16,185,129,0.3)' : '#a7f3d0'}; padding: 14px 20px; border-radius: 12px; display: inline-block;">
              <p style="margin: 0; color: ${isDark ? '#6ee7b7' : '#065f46'}; font-size: 12px; font-weight: 600; text-transform: uppercase;">Returned Amount</p>
              <p style="margin: 4px 0 0 0; color: #10b981; font-size: 24px; font-weight: 800;">
                +${returnAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} MAD
              </p>
            </div>
          </div>
        `,
        icon: 'success',
        confirmButtonText: 'Done',
        confirmButtonColor: '#10b981',
        timer: 2500,
        timerProgressBar: true,
        customClass: {
          popup: 'rounded-2xl shadow-2xl',
          confirmButton: 'px-5 py-2.5 rounded-xl font-semibold text-sm'
        }
      })
      
      loadTransactions(page, true)
      loadTotals()
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
      loadTotals()
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
    totalIn,
    totalOut,
    handleReturnMoney,
    handleReturnSelected,
    toggleSelection,
    toggleSelectAll,
    toggleFilter,
    loadMore,
    goToPage,
    toggleSelectionMode,
    getSelectedTotal,
    refresh: () => { loadTransactions(1, true); loadTotals() }
  }
}