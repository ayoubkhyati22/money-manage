import { useState, useEffect } from 'react'
import { fetchTransactions, returnMoney, PAGE_SIZE } from '../services/transactionService'
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

  return {
    transactions,
    loading,
    showWithdrawnOnly,
    page,
    totalCount,
    hasMore,
    isDesktop,
    handleReturnMoney,
    toggleFilter,
    loadMore,
    goToPage,
    refresh: () => loadTransactions(1, true)
  }
}
