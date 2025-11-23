import { useState, useEffect } from 'react'
import { fetchTransactions, returnMoney, returnMultipleTransactions, PAGE_SIZE } from '../services/transactionService'
import { ObjectiveTransaction } from '../types/transaction'
import { useAuth } from './useAuth'
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

    const returnAmount = Math.abs(transaction.amount)
    const result = await showConfirm(
      'Return Money?',
      `Are you sure you want to return ${returnAmount.toFixed(2)} MAD to ${transaction.bank_name}?`
    )
    if (!result.isConfirmed) return

    try {
      await returnMoney(transaction)
      await showSuccess('Money Returned!', `${returnAmount.toFixed(2)} MAD has been returned`)
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