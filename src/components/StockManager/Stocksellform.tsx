import { useState, useRef, useEffect } from 'react'
import { Bank } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useSweetAlert } from '../../hooks/useSweetAlert'
import { stockService } from '../../services/stockService'
import { StockFormData, StockTransactionWithDetails } from '../../types/stock'
import { Calendar, FileText } from 'lucide-react'

interface StockSellFormProps {
  banks: Bank[]
  onSubmit: () => void
  onCancel: () => void
}

export function StockSellForm({ banks, onSubmit, onCancel }: StockSellFormProps) {
  const { user } = useAuth()
  const { showSuccess, showError } = useSweetAlert()
  const [loading, setLoading] = useState(false)
  const [loadingTransactions, setLoadingTransactions] = useState(true)
  const [transactions, setTransactions] = useState<StockTransactionWithDetails[]>([])
  const [filteredCompanies, setFilteredCompanies] = useState<Array<{
    company_name: string
    symbol: string
    total_quantity: number
  }>>([])
  const formRef = useRef<HTMLDivElement>(null)
  const [formData, setFormData] = useState<StockFormData>({
    bank_id: '',
    company_name: '',
    symbol: '',
    transaction_type: 'SELL',
    quantity: '',
    price_per_share: '',
    fees: '0',
    notes: '',
    transaction_date: new Date().toISOString().split('T')[0]
  })

  // Scroll automatique vers le formulaire à l'ouverture
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Charger les transactions de l'utilisateur
  useEffect(() => {
    if (user) {
      loadTransactions()
    }
  }, [user])

  const loadTransactions = async () => {
    if (!user) return
    setLoadingTransactions(true)
    try {
      const data = await stockService.fetchTransactions(user.id)
      setTransactions(data)
      
      // Calculer les quantités disponibles par compagnie
      const companiesMap = new Map<string, {
        company_name: string
        symbol: string
        total_quantity: number
      }>()

      data.forEach(transaction => {
        const key = transaction.symbol
        const existing = companiesMap.get(key)
        
        if (transaction.transaction_type === 'BUY') {
          if (existing) {
            existing.total_quantity += transaction.quantity
          } else {
            companiesMap.set(key, {
              company_name: transaction.company_name,
              symbol: transaction.symbol,
              total_quantity: transaction.quantity
            })
          }
        } else if (transaction.transaction_type === 'SELL' && existing) {
          existing.total_quantity -= transaction.quantity
        }
      })

      // Filtrer les compagnies avec des quantités > 0
      const companies = Array.from(companiesMap.values()).filter(c => c.total_quantity > 0)
      setFilteredCompanies(companies)
    } catch (error) {
      console.error('Error loading transactions:', error)
    } finally {
      setLoadingTransactions(false)
    }
  }

  const handleCompanySelect = (symbol: string) => {
    const company = filteredCompanies.find(c => c.symbol === symbol)
    if (company) {
      setFormData({
        ...formData,
        company_name: company.company_name,
        symbol: company.symbol
      })
    }
  }

  const getAvailableQuantity = () => {
    const company = filteredCompanies.find(c => c.symbol === formData.symbol)
    return company ? company.total_quantity : 0
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
    const availableQuantity = getAvailableQuantity()

    if (quantity <= 0 || price <= 0) {
      await showError('Invalid Values', 'Quantity and price must be greater than 0')
      return
    }

    if (quantity > availableQuantity) {
      await showError(
        'Insufficient Shares',
        `You only have ${availableQuantity} shares available to sell for ${formData.company_name}.`
      )
      return
    }

    setLoading(true)
    try {
      await stockService.createTransaction(user.id, formData)
      await showSuccess(
        'Sale Recorded!',
        `SELL transaction for ${formData.company_name} has been recorded.`
      )
      onSubmit()
    } catch (error: any) {
      await showError('Transaction Failed', error.message)
    } finally {
      setLoading(false)
    }
  }

  const totalAmount = (parseFloat(formData.quantity) || 0) * (parseFloat(formData.price_per_share) || 0)
  const totalWithFees = totalAmount - (parseFloat(formData.fees) || 0)

  return (
    <div ref={formRef} className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
      <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 p-6 border-b border-gray-200 dark:border-dark-600">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">
          Sell Stock
        </h3>
        <p className="text-sm text-gray-600 dark:text-dark-300 mt-1">
          Sell shares from your existing holdings
        </p>
      </div>

      <form onSubmit={handleSubmit} className="p-6 space-y-6">
        {/* Bank */}
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

        {/* Company Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
            Select Company to Sell *
          </label>
          {loadingTransactions ? (
            <div className="flex items-center justify-center py-4">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500"></div>
            </div>
          ) : filteredCompanies.length === 0 ? (
            <div className="text-center py-4 bg-gray-50 dark:bg-dark-700 rounded-lg">
              <p className="text-gray-500 dark:text-dark-300 text-sm">
                No shares available to sell. Buy some stocks first!
              </p>
            </div>
          ) : (
            <select
              value={formData.symbol}
              onChange={(e) => handleCompanySelect(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              required
            >
              <option value="">Select a company...</option>
              {filteredCompanies.map((company) => (
                <option key={company.symbol} value={company.symbol}>
                  {company.company_name} ({company.symbol}) - {company.total_quantity} shares available
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Available Quantity Display */}
        {formData.symbol && (
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4 border border-blue-200 dark:border-blue-700">
            <div className="flex items-center justify-between">
              <span className="text-sm text-gray-700 dark:text-dark-200">Available to sell:</span>
              <span className="text-lg font-bold text-blue-600 dark:text-blue-400">
                {getAvailableQuantity()} shares
              </span>
            </div>
          </div>
        )}

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
              max={getAvailableQuantity()}
              value={formData.quantity}
              onChange={(e) => setFormData({ ...formData, quantity: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              placeholder="100"
              required
              disabled={!formData.symbol}
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
          <div className="bg-gradient-to-r from-red-50 to-orange-50 dark:from-red-900/20 dark:to-orange-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700">
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
                  -{(parseFloat(formData.fees) || 0).toFixed(2)} MAD
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-red-200 dark:border-red-700">
                <span className="text-gray-900 dark:text-dark-100 font-semibold">Net Amount:</span>
                <span className="text-lg font-bold text-green-600 dark:text-green-400">
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
            disabled={loading || filteredCompanies.length === 0}
            className="flex-1 bg-gradient-to-r from-red-500 to-orange-600 hover:from-red-600 hover:to-orange-700 text-white font-semibold px-6 py-3 rounded-lg transition-all duration-300 disabled:opacity-50 shadow-lg hover:shadow-xl"
          >
            {loading ? 'Processing...' : 'Sell Shares'}
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