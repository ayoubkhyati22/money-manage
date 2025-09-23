import { useState, useEffect } from 'react'
import { Bank, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { Plus, Edit2, Trash2, Building2 } from 'lucide-react'
import toast from 'react-hot-toast'

interface BankManagerProps {
  banks: Bank[]
  onUpdate: (banks: Bank[]) => void
}

export function BankManager({ banks, onUpdate }: BankManagerProps) {
  const { user } = useAuth()
  const { showDeleteConfirm, showSuccess, showError } = useSweetAlert()
  const [showForm, setShowForm] = useState(false)
  const [editingBank, setEditingBank] = useState<Bank | null>(null)
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: '',
    logo: '',
    balance: 0
  })

  useEffect(() => {
    loadBanks()
  }, [user])

  const loadBanks = async () => {
    if (!user) return

    setLoading(true)
    try {
      const { data, error } = await supabase
        .from('banks')
        .select('*')
        .order('created_at', { ascending: false })

      if (error) throw error
      onUpdate(data || [])
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
        const { error } = await supabase
          .from('banks')
          .update({
            name: formData.name,
            logo: formData.logo || null,
            balance: formData.balance
          })
          .eq('id', editingBank.id)

        if (error) throw error
        await showSuccess('Bank Updated!', `${formData.name} has been updated successfully.`)
      } else {
        const { error } = await supabase
          .from('banks')
          .insert([{
            user_id: user.id,
            name: formData.name,
            logo: formData.logo || null,
            balance: formData.balance
          }])

        if (error) throw error
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
        const { error } = await supabase
          .from('banks')
          .delete()
          .eq('id', bank.id)

        if (error) throw error

        await showSuccess('Bank Deleted!', `${bank.name} has been removed from your account.`)
        loadBanks()
      } catch (error: any) {
        await showError('Delete Failed', error.message)
      } finally {
        setLoading(false)
      }
    }
  }

  const resetForm = () => {
    setFormData({ name: '', logo: '', balance: 0 })
    setEditingBank(null)
    setShowForm(false)
  }

  if (loading && banks.length === 0) {
    return (
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
          <div className="space-y-3">
            <div className="h-16 bg-gray-200 dark:bg-dark-600 rounded"></div>
            <div className="h-16 bg-gray-200 dark:bg-dark-600 rounded"></div>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100">Bank Management</h2>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-emerald-500 dark:bg-primary-500 hover:bg-emerald-600 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600 p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-4">
            {editingBank ? 'Edit Bank' : 'Add New Bank'}
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
                  Bank Name *
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
                  placeholder="Enter bank name"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
                  Initial Balance (MAD) *
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.balance}
                  onChange={(e) => setFormData({ ...formData, balance: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
                  placeholder="0.00"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-1">
                Logo URL (optional)
              </label>
              <input
                type="url"
                value={formData.logo}
                onChange={(e) => setFormData({ ...formData, logo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-emerald-500 dark:focus:ring-primary-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 placeholder-gray-500 dark:placeholder-dark-400"
                placeholder="https://example.com/logo.png"
              />
            </div>

            <div className="flex items-center space-x-3 pt-4">
              <button
                type="submit"
                disabled={loading}
                className="bg-emerald-500 dark:bg-primary-500 hover:bg-emerald-600 dark:hover:bg-primary-600 text-white px-4 py-2 rounded-lg transition-colors disabled:opacity-50"
              >
                {loading ? 'Saving...' : (editingBank ? 'Update Bank' : 'Add Bank')}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 px-4 py-2 rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Banks List */}
      <div className="bg-white dark:bg-dark-800 rounded-xl shadow-sm border border-gray-200 dark:border-dark-600">
        <div className="p-6 border-b border-gray-200 dark:border-dark-600">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-dark-100">Your Banks</h3>
        </div>

        <div className="p-6">
          {banks.length === 0 ? (
            <div className="text-center py-8">
              <Building2 className="mx-auto w-12 h-12 text-gray-400 dark:text-dark-500 mb-4" />
              <p className="text-gray-500 dark:text-dark-300">No banks added yet</p>
              <p className="text-sm text-gray-400 dark:text-dark-400 mt-1">Click "Add Bank" to get started</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {banks.map((bank) => (
                <div key={bank.id} className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-dark-800">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center justify-center w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        {bank.logo ? (
                          <img src={bank.logo} alt={bank.name} className="w-6 h-6 object-contain" />
                        ) : (
                          <Building2 className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                        )}
                      </div>
                      <div>
                        <h4 className="font-semibold text-gray-900 dark:text-dark-100">{bank.name}</h4>
                        <p className="text-sm text-gray-500 dark:text-dark-400">Balance</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-1">
                      <button
                        onClick={() => handleEdit(bank)}
                        className="p-1 text-gray-400 dark:text-dark-400 hover:text-blue-600 dark:hover:text-primary-400 transition-colors"
                        title="Edit Bank"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(bank)}
                        className="p-1 text-gray-400 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
                        title="Delete Bank"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{Number(bank.balance).toFixed(2)} MAD</p>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}