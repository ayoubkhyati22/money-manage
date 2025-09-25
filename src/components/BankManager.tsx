import { useState, useEffect } from 'react'
import { Bank, supabase } from '../lib/supabase'
import { useAuth } from '../hooks/useAuth'
import { useSweetAlert } from '../hooks/useSweetAlert'
import { Plus, Edit2, Trash2, Building2, CreditCard, Wallet, Eye, EyeOff, DollarSign } from 'lucide-react'
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
  const [hiddenBalances, setHiddenBalances] = useState<Set<string>>(new Set())
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
    setFormData({ name: '', logo: '', balance: 0 })
    setEditingBank(null)
    setShowForm(false)
  }

  // Credit card color schemes for different banks
  const getCardGradient = (index: number) => {
    const gradients = [
      'from-slate-900 via-slate-800 to-slate-900', // Classic Black
      'from-blue-900 via-blue-800 to-blue-900',   // Business Blue
      'from-purple-900 via-purple-800 to-purple-900', // Premium Purple
      'from-emerald-900 via-emerald-800 to-emerald-900', // Wealth Green
      'from-rose-900 via-rose-800 to-rose-900',    // Elegant Rose
      'from-amber-900 via-amber-800 to-amber-900', // Luxury Gold
    ]
    return gradients[index % gradients.length]
  }

  const getAccentColor = (index: number) => {
    const colors = [
      'from-slate-400 to-slate-600',
      'from-blue-400 to-blue-600', 
      'from-purple-400 to-purple-600',
      'from-emerald-400 to-emerald-600',
      'from-rose-400 to-rose-600',
      'from-amber-400 to-amber-600',
    ]
    return colors[index % colors.length]
  }

  if (loading && banks.length === 0) {
    return (
      <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 p-8">
        <div className="animate-pulse space-y-4">
          <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="h-48 bg-gray-200 dark:bg-dark-600 rounded-2xl"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-blue-400 to-blue-600 rounded-xl shadow-lg">
            <CreditCard className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-2xl font-bold text-gray-900 dark:text-dark-100">Banks</h2>
            <p className="text-sm text-gray-500 dark:text-dark-300">Manage your banks</p>
          </div>
        </div>
        <button
          onClick={() => setShowForm(!showForm)}
          className="flex items-center space-x-2 bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-primary-500 dark:to-primary-600 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold px-4 py-3 rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl transform hover:scale-105"
        >
          <Plus className="w-4 h-4" />
          <span>Add Bank</span>
        </button>
      </div>

      {/* Form */}
      {showForm && (
        <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
          <div className="bg-gradient-to-r from-emerald-50 to-mint-50 dark:from-emerald-900/30 dark:to-mint-900/30 p-6 border-b border-emerald-200 dark:border-dark-600">
            <div className="flex items-center space-x-3">
              <div className="flex items-center justify-center w-10 h-10 bg-emerald-500 rounded-xl">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <div>
                <h3 className="text-lg font-semibold text-emerald-900 dark:text-emerald-100">
                  {editingBank ? 'Edit Bank' : 'Add New Bank'}
                </h3>
                <p className="text-sm text-emerald-700 dark:text-emerald-300">
                  {editingBank ? 'Update bank information' : 'Add a new financial institution'}
                </p>
              </div>
            </div>
          </div>

          <div className="p-6">
            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
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
                  <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
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
                <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
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
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 dark:from-primary-500 dark:to-primary-600 hover:from-emerald-600 hover:to-emerald-700 dark:hover:from-primary-600 dark:hover:to-primary-700 text-white font-semibold px-6 py-3 rounded-xl transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl transform hover:scale-105 disabled:hover:scale-100"
                >
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Saving...</span>
                    </div>
                  ) : (
                    <span>{editingBank ? 'Update Bank' : 'Add Bank'}</span>
                  )}
                </button>
                <button
                  type="button"
                  onClick={resetForm}
                  className="text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 px-6 py-3 rounded-xl transition-colors font-medium"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Credit Cards Grid */}
      <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/30 dark:to-indigo-900/30 p-6 border-b border-blue-200 dark:border-dark-600">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-semibold text-blue-900 dark:text-blue-100">Your Bank Cards</h3>
              <p className="text-sm text-blue-700 dark:text-blue-300 mt-1">
                {banks.length} {banks.length === 1 ? 'card' : 'cards'} • Total: {banks.reduce((sum, bank) => sum + Number(bank.balance), 0).toFixed(2)} MAD
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <CreditCard className="w-5 h-5 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
        </div>

        <div className="p-6">
          {banks.length === 0 ? (
            <div className="text-center py-12">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-100 to-blue-200 dark:from-blue-900/30 dark:to-blue-800/30 rounded-full mx-auto mb-6">
                <CreditCard className="w-10 h-10 text-blue-600 dark:text-blue-400" />
              </div>
              <h4 className="text-lg font-semibold text-gray-900 dark:text-dark-100 mb-2">No bank cards yet</h4>
              <p className="text-gray-500 dark:text-dark-300">Add your first bank to get started with beautiful card management</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {banks.map((bank, index) => {
                const isBalanceHidden = hiddenBalances.has(bank.id)
                const gradient = getCardGradient(index)
                const accent = getAccentColor(index)

                return (
                  <div key={bank.id} className="group relative">
                    {/* Credit Card */}
                    <div className={`relative w-full h-48 bg-gradient-to-br ${gradient} dark:${gradient} rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-rotate-1 border border-white/10 overflow-hidden`}>
                      
                      {/* Background Pattern */}
                      <div className="absolute inset-0 opacity-10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white to-transparent rounded-full -translate-y-16 translate-x-16"></div>
                        <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-12 -translate-x-12"></div>
                        <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-white to-transparent rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"></div>
                      </div>

                      {/* Card Header */}
                      <div className="absolute top-4 left-6 right-6 flex items-center justify-between">
                        <div className="flex items-center space-x-2">
                          {bank.logo ? (
                            <div className="w-8 h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center p-1">
                              <img src={bank.logo} alt={bank.name} className="w-full h-full object-contain" />
                            </div>
                          ) : (
                            <div className={`w-8 h-8 bg-gradient-to-br ${accent} rounded-lg flex items-center justify-center shadow-lg`}>
                              <Building2 className="w-4 h-4 text-white" />
                            </div>
                          )}
                          <div>
                            <p className="text-white/90 text-sm font-medium">{bank.name}</p>
                            <p className="text-white/60 text-xs">FinanceFlow</p>
                          </div>
                        </div>
                        
                        {/* Action Buttons */}
                        <div className="flex items-center space-x-1">
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              toggleBalanceVisibility(bank.id)
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors z-10"
                            title={isBalanceHidden ? 'Show balance' : 'Hide balance'}
                          >
                            {isBalanceHidden ? (
                              <EyeOff className="w-4 h-4 text-white/70 hover:text-white" />
                            ) : (
                              <Eye className="w-4 h-4 text-white/70 hover:text-white" />
                            )}
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleEdit(bank)
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors z-10"
                            title="Edit Bank"
                          >
                            <Edit2 className="w-4 h-4 text-white/70 hover:text-white" />
                          </button>
                          <button
                            onClick={(e) => {
                              e.stopPropagation()
                              handleDelete(bank)
                            }}
                            className="p-1.5 hover:bg-white/10 rounded-lg transition-colors z-10"
                            title="Delete Bank"
                          >
                            <Trash2 className="w-4 h-4 text-white/70 hover:text-red-300" />
                          </button>
                        </div>
                      </div>

                      {/* Balance Display */}
                      <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2">
                        <div>
                          <p className="text-white/60 text-xs uppercase tracking-wider mb-1">Available Balance</p>
                          <div className="relative">
                            {isBalanceHidden ? (
                              <h3 className="text-2xl font-bold text-white tracking-wide">
                                ••••••• <span className="text-sm font-medium text-white/80">MAD</span>
                              </h3>
                            ) : (
                              <h3 className="text-2xl font-bold text-white tracking-wide">
                                {Number(bank.balance).toLocaleString('en-US', { 
                                  minimumFractionDigits: 2, 
                                  maximumFractionDigits: 2 
                                })} <span className="text-sm font-medium text-white/80">MAD</span>
                              </h3>
                            )}
                            
                            {/* Animated shine effect */}
                            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 ease-in-out"></div>
                          </div>
                        </div>
                      </div>

                      {/* Card Footer */}
                      <div className="absolute bottom-4 left-6 right-6 flex items-center justify-between">
                        {/* <div>
                          <p className="text-white/60 text-xs">Card Number</p>
                          <p className="text-white/90 text-sm font-mono">•••• •••• •••• {String(index + 1).padStart(4, '0')}</p>
                        </div> */}
                        {/* <div className="text-right">
                          <p className="text-white/60 text-xs">Valid</p>
                          <p className="text-white/90 text-sm font-mono">12/28</p>
                        </div> */}
                      </div>

                      {/* Holographic effect overlay */}
                      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                      
                      {/* Card chip simulation */}
                      <div className="absolute top-16 left-6 w-8 h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm shadow-inner opacity-80"></div>

                      {/* Card network logo */}
                      <div className="absolute bottom-4 right-6">
                        <div className="flex items-center space-x-1">
                          <div className="w-6 h-4 bg-white/20 rounded-sm flex items-center justify-center">
                            <CreditCard className="w-3 h-3 text-white/60" />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Card shadow effect */}
                    <div className={`absolute inset-0 bg-gradient-to-br from-gray-800/50 to-transparent rounded-2xl blur-xl scale-105 -z-10 opacity-50 group-hover:opacity-75 transition-opacity duration-500`}></div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}