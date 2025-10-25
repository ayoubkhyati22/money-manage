import { useState, useEffect } from 'react'
import { Bank } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useSweetAlert } from '../../hooks/useSweetAlert'
import { stockService } from '../../services/stockService'
import { MoroccanCompany, StockFormData } from '../../types/stock'
import { ShoppingCart, DollarSign, Hash, Calendar, FileText } from 'lucide-react'

interface StockFormProps {
  banks: Bank[]
  onSubmit: () => void
  onCancel: () => void
}

export function StockForm({ banks, onSubmit, onCancel }: StockFormProps) {
  const { user } = useAuth()
  const { showSuccess, showError } = useSweetAlert()
  const [loading, setLoading] = useState(false)
  const [companies, setCompanies] = useState<MoroccanCompany[]>([])
  const [formData, setFormData] = useState<StockFormData>({
    bank_id: '',
    company_name: '',
    symbol: '',
    transaction_type: 'BUY',
    quantity: '',
    price_per_share: '',
    fees: '0',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })

  useEffect(() => {
    loadCompanies()
  }, [])

  const loadCompanies = async () => {
    try {
      const data = await stockService.fetchCompanies()
      setCompanies(data)
    } catch (error) {
      console.error('Error loading companies:', error)
    }
  }

  const handleCompanySelect = (companyId: string) => {
    const company = companies.find(c => c.id === companyId)
    if (company) {
      setFormData({
        ...formData,
        company_name: company.name,
        symbol: company.symbol
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.bank_id || !formData.company_name || !formData.symbol || !formData.quantity || !formData.price_per_share) {
      await showError('Missing Fields', 'Please fill in all required fields')
      return
    }

    const quantity = parseFloat(formData.quantity)
    const price = parseFloat(formData.price_per_share)

    if (quantity <= 0 || price <= 0) {
      await showError('Invalid Values', 'Quantity and price must be greater than 0')
      return
    }

    setLoading(true)
    try {
      await stockService.createTransaction(user.id, formData)
      await showSuccess(
        'Transaction Added!',
        `${formData.transaction_type} transaction for ${formData.company_name} has been recorded.`
      )
      onSubmit()
    } catch (error: any) {
      await showError('Transaction Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price_per_share) || 0)
  const totalWithFees = totalAmount + (parseFloat(formData.fees) || 0)

  return (
    <div className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-dark-600">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">
          New Stock Transaction
        </h3>
        <p className="text-sm text-gray-600 dark:text-dark-300 mt-1">
          Record your stock purchase or sale
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Transaction Type */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
            Transaction Type *
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData({ ...formData, transaction_type: 'BUY' })}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                formData.transaction_type === 'BUY'
                  ? 'border-green-500 bg-green-50 dark:bg-green-900/20 text-green-700 dark:text-green-400'
                  : 'border-gray-300 dark:border-dark-600 hover:border-green-300'
              }`}
            >
              <ShoppingCart className="w-6 h-6 mx-auto mb-2" />
              <span className="font-semibold">BUY</span>
            </button>
            <button
              type="button"
              onClick={() => setFormData({ ...formData, transaction_type: 'SELL' })}
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${
                formData.transaction_type === 'SELL'
                  ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                  : 'border-gray-300 dark:border-dark-600 hover:border-red-300'
              }`}
            >
              <DollarSign className="w-6 h-6 mx-auto mb-2" />
              <span className="font-semibold">SELL</span>
            </button>
          </div>
        </div>

        {/* Bank and Company */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Bank Account *
            </label>
            <select
              value={formData.bank_id}
              onChange={(e) => setFormData({ ...formData, bank_id: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              required
            >
              <option value="">Select a bank...</option>
              {banks.map((bank) => (
                <option key={bank.id} value={bank.id}>
                  {bank.name}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Company
            </label>
            <select
              onChange={(e) => handleCompanySelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
            >
              <option value="">Select or enter manually...</option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name} ({company.symbol})
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Company Name and Symbol (Manual Entry) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Company Name *
            </label>
            <input
              type="text"
              value={formData.company_name}
              onChange={(e) => setFormData({ ...formData, company_name: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              placeholder="e.g., Attijariwafa Bank"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Symbol *
            </label>
            <div className="relative">
              <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.symbol}
                onChange={(e) => setFormData({ ...formData, symbol: e.target.value.toUpperCase() })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100 uppercase"
                placeholder="ATW"
                required
              />
            </div>
          </div>
        </div>

        {/* Quantity and Price */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Quantity *
            </label>
            <input
              type="number"
              step="1"
              min="1"
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              placeholder="100"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Price per Share (MAD) *
            </label>
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price_per_share}
              onChange={(e) => setFormData({ ...formData, price_per_share: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              placeholder="450.00"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Fees (MAD)
            </label>
            <input
              type="number"
              step="0.01"
              min="0"
              value={formData.fees}
              onChange={(e) => setFormData({ ...formData, fees: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              placeholder="0.00"
            />
          </div>
        </div>

        {/* Date and Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Transaction Date *
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="date"
                value={formData.transaction_date}
                onChange={(e) => setFormData({ ...formData, transaction_date: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
              Notes
            </label>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input
                type="text"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
                placeholder="Optional notes..."
              />
            </div>
          </div>
        </div>

        {/* Summary */}
        {formData.quantity && formData.price_per_share && (
          <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700">
            <h4 className="text-sm font-semibold text-gray-900 dark:text-dark-100 mb-3">
              Transaction Summary
            </h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-300">Subtotal:</span>
                <span className="font-semibold text-gray-900 dark:text-dark-100">
                  {totalAmount.toFixed(2)} MAD
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600 dark:text-dark-300">Fees:</span>
                <span className="font-semibold text-gray-900 dark:text-dark-100">
                  {(parseFloat(formData.fees) || 0).toFixed(2)} MAD
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                <span className="text-gray-900 dark:text-dark-100 font-semibold">Total:</span>
                <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                  {totalWithFees.toFixed(2)} MAD
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className="flex-1 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Processing...' : 'Add Transaction'}
          </button>
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 text-gray-600 dark:text-dark-300 hover:text-gray-900 dark:hover:text-dark-100 font-medium transition-colors"
          >
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}
