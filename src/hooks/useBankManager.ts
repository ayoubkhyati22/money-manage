import { useState, useEffect } from 'react'
import { Bank, BankFormData } from '../types/bank'
import { fetchBanks, createBank, updateBank, deleteBank } from '../services/bankService'
import { useAuth } from './useAuth'
import { useSweetAlert } from './useSweetAlert'

const initialFormData: BankFormData = {
  name: '',
  logo: '',
  balance: 0
}

export const useBankManager = (onUpdate: (banks: Bank[]) => void) => {
  const { user } = useAuth()
  const { showDeleteConfirm, showSuccess, showError } = useSweetAlert()
  const [showForm, setShowForm] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [loading, setLoading] = useState(false)
  const [hiddenBalances, setHiddenBalances] = useState<Set<string>>(new Set())
  const [formData, setFormData] = useState<BankFormData>(initialFormData)

  useEffect(() => {
    loadBanks()
  }, [user])

  const loadBanks = async () => {
    if (!user) return

    setLoading(true)
    try {
      const banks = await fetchBanks()
      onUpdate(banks)
    } catch (error: any) {
      await showError('Error Loading Banks', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    setLoading(true)
    try {
      if (editingBank) {
        await updateBank(editingBank.id, formData)
        await showSuccess('Bank Updated!', `${formData.name} has been updated successfully.`)
      } else {
        await createBank(user.id, formData)
        await showSuccess('Bank Added!', `${formData.name} has been added to your account.`)
      }

      resetForm()
      loadBanks()
    } catch (error: any) {
      await showError('Operation Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (bank: Bank) => {
    setEditingBank(bank)
    setFormData({
      name: bank.name,
      logo: bank.logo || '',
      balance: Number(bank.balance)
    })
    setShowForm(true)
  }

  const handleDelete = async (bank: Bank) => {
    const result = await showDeleteConfirm(
      'Delete Bank?',
      `Are you sure you want to delete "${bank.name}"? This will also delete all related transactions and cannot be undone.`
    )

    if (result.isConfirmed) {
      setLoading(true)
      try {
        await deleteBank(bank.id)
        await showSuccess('Bank Deleted!', `${bank.name} has been removed from your account.`)
        loadBanks()
      } catch (error: any) {
        await showError('Delete Failed', error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const toggleBalanceVisibility = (bankId: string) => {
    setHiddenBalances(prev => {
      const newSet = new Set(prev)
      if (newSet.has(bankId)) {
        newSet.delete(bankId)
      } else {
        newSet.add(bankId)
      }
      return newSet
    })
  }

  const resetForm = () => {
    setFormData(initialFormData)
    setEditingBank(null)
    setShowForm(false)
  }

  const toggleForm = () => setShowForm(!showForm)

  return {
    showForm,
    editingBank,
    loading,
    hiddenBalances,
    formData,
    setFormData,
    handleSubmit,
    handleEdit,
    handleDelete,
    toggleBalanceVisibility,
    resetForm,
    toggleForm
  }
}
