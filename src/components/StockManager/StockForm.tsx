import { useState, useRef, useEffect } from 'react'
import { Bank } from '../../lib/supabase'
import { useAuth } from '../../hooks/useAuth'
import { useSweetAlert } from '../../hooks/useSweetAlert'
import { stockService } from '../../services/stockService'
import { StockFormData } from '../../types/stock'
import { ShoppingCart, DollarSign, Hash, Calendar, FileText, AlertTriangle, TrendingUp } from 'lucide-react'
import { CompanySelect } from './CompanySelect'
import { MoroccanCompany } from '../../types/stock'
import { stockPriceEventBus } from '../../utils/stockPriceEventBus'

interface StockFormProps {
  banks: Bank[]
  onSubmit: () => void
  onCancel: () => void
}

export function StockForm({ banks, onSubmit, onCancel }: StockFormProps) {
  const { user } = useAuth()
  const { showSuccess, showError } = useSweetAlert()
  const [loading, setLoading] = useState(false)
  const [selectedBank, setSelectedBank] = useState<Bank | null>(null)
  const formRef = useRef<HTMLDivElement>(null)
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
  const [fetchingPrice, setFetchingPrice] = useState(false)
  const [priceSource, setPriceSource] = useState<'manual' | 'api' | 'cache'>('manual')

  // Scroll automatique vers le formulaire à l'ouverture
  useEffect(() => {
    if (formRef.current) {
      formRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }
  }, [])

  // Update selected bank when bank_id changes
  useEffect(() => {
    if (formData.bank_id) {
      const bank = banks.find(b => b.id === formData.bank_id)
      setSelectedBank(bank || null)
    } else {
      setSelectedBank(null)
    }
  }, [formData.bank_id, banks])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!user) return

    if (!formData.bank_id || !formData.company_name || !formData.symbol || !formData.quantity || !formData.price_per_share) {
      await showError('Missing Fields', 'Please fill in all required fields')
      return
    }

    const quantity = parseFloat(formData.quantity)
    const price = parseFloat(formData.price_per_share)
    const fees = parseFloat(formData.fees) || 0
    const totalAmount = (quantity * price) + fees

    if (quantity <= 0 || price <= 0) {
      await showError('Invalid Values', 'Quantity and price must be greater than 0')
      return
    }

    // Check if bank has sufficient funds
    if (selectedBank && totalAmount > selectedBank.balance) {
      await showError(
        'Insufficient Funds',
        `You need ${totalAmount.toFixed(2)} MAD but only have ${selectedBank.balance.toFixed(2)} MAD in ${selectedBank.name}.`
      )
      return
    }

    setLoading(true)
    try {
      await stockService.createTransaction(user.id, formData)
      
      // 🔥 ÉMETTRE UN SEUL ÉVÉNEMENT après la transaction
      console.log('📡 [Form] Emitting transaction:created event')
      stockPriceEventBus.emit('transaction:created', {
        symbol: formData.symbol,
        transactionType: formData.transaction_type
      })
      
      await showSuccess(
        'Transaction Added!',
        `${formData.transaction_type} transaction for ${formData.company_name} has been recorded. Bank balance and investment goal have been updated.`
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
  const insufficientFunds = selectedBank && totalWithFees > selectedBank.balance

  const handleFetchCurrentPrice = async () => {
    if (!formData.casablanca_api_id) return

    setFetchingPrice(true)
    try {
      console.log('🔍 [Form] Fetching current price for ID:', formData.casablanca_api_id)
      
      // Importer le manager
      const { stockPriceManager } = await import('../../services/stockPriceManager')
      
      const price = await stockPriceManager.fetchSinglePrice(
        formData.casablanca_api_id.toString(),
        true // Forcer le refresh pour avoir le prix le plus récent
      )

      if (price) {
        setFormData(prev => ({
          ...prev,
          price_per_share: price.currentPrice.toFixed(2)
        }))
        setPriceSource('api')
        
        await showSuccess(
          'Prix récupéré!',
          `Prix actuel: ${price.currentPrice.toFixed(2)} MAD`
        )
      } else {
        await showError(
          'Erreur',
          'Impossible de récupérer le prix actuel. Veuillez entrer le prix manuellement.'
        )
      }
    } catch (error: any) {
      await showError('Erreur', error.message)
    } finally {
      setFetchingPrice(false)
    }
  }

  return (
    <div ref={formRef} className="bg-white dark:bg-dark-800 rounded-2xl shadow-lg border border-gray-200 dark:border-dark-600 overflow-hidden">
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-6 border-b border-gray-200 dark:border-dark-600">
        <h3 className="text-xl font-semibold text-gray-900 dark:text-dark-100">
          New Stock Transaction
        </h3>
        <p className="text-sm text-gray-600 dark:text-dark-300 mt-1">
          Record your stock purchase (automatically updates bank balance and investment goal)
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
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${formData.transaction_type === 'BUY'
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
              className={`p-4 rounded-lg border-2 transition-all duration-300 ${formData.transaction_type === 'SELL'
                ? 'border-red-500 bg-red-50 dark:bg-red-900/20 text-red-700 dark:text-red-400'
                : 'border-gray-300 dark:border-dark-600 hover:border-red-300'
                }`}
            >
              <DollarSign className="w-6 h-6 mx-auto mb-2" />
              <span className="font-semibold">SELL</span>
            </button>
          </div>
        </div>

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
                {bank.name} - Balance: {bank.balance.toFixed(2)} MAD
              </option>
            ))}
          </select>
          {selectedBank && (
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
              Available balance: {selectedBank.balance.toFixed(2)} MAD
            </p>
          )}
        </div>

        {/* Company Selection */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
            Entreprise *
          </label>
          <CompanySelect
            value={formData.casablanca_api_id?.toString() || ''}
            onChange={(company: MoroccanCompany) => {
              setFormData({
                ...formData,
                company_name: company.name,
                symbol: company.symbol,
                casablanca_api_id: company.casablanca_api_id
              })
              // Pré-remplir avec le prix en cache si disponible
              if (company.last_price) {
                setFormData(prev => ({
                  ...prev,
                  price_per_share: company.last_price!.toString()
                }))
                setPriceSource('cache')
              }
            }}
            disabled={loading}
          />
          {formData.company_name && (
            <p className="text-xs text-gray-500 dark:text-dark-400 mt-1">
              {formData.company_name} ({formData.symbol})
            </p>
          )}
        </div>

        {/* Price per Share avec bouton Fetch */}
        <div>
          <label className="block text-sm font-medium text-gray-700 dark:text-dark-200 mb-2">
            Prix par Action (MAD) *
          </label>
          <div className="flex space-x-2">
            <input
              type="number"
              step="0.01"
              min="0.01"
              value={formData.price_per_share}
              onChange={(e) => {
                setFormData({ ...formData, price_per_share: e.target.value })
                setPriceSource('manual')
              }}
              className="flex-1 px-3 py-2 border border-gray-300 dark:border-dark-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-dark-700 text-gray-900 dark:text-dark-100"
              placeholder="450.00"
              required
            />
            <button
              type="button"
              onClick={handleFetchCurrentPrice}
              disabled={!formData.casablanca_api_id || fetchingPrice}
              className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center space-x-2"
              title="Récupérer le prix actuel"
            >
              {fetchingPrice ? (
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
              ) : (
                <>
                  <TrendingUp className="w-4 h-4" />
                  <span className="text-xs">Prix Actuel</span>
                </>
              )}
            </button>
          </div>
          {priceSource !== 'manual' && (
            <div className="flex items-center space-x-1 mt-1">
              <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${priceSource === 'api'
                ? 'bg-green-100 dark:bg-green-900/30 text-green-700 dark:text-green-300'
                : 'bg-yellow-100 dark:bg-yellow-900/30 text-yellow-700 dark:text-yellow-300'
                }`}>
                {priceSource === 'api' ? '🟢 Prix en direct' : '⚠️ Prix en cache'}
              </span>
            </div>
          )}
        </div>

        {/* Quantity */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

        {/* Balance Warning */}
        {insufficientFunds && (
          <div className="bg-red-50 dark:bg-red-900/20 rounded-xl p-4 border border-red-200 dark:border-red-700">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="w-5 h-5 text-red-600 dark:text-red-400 mt-0.5" />
              <div>
                <h4 className="text-sm font-semibold text-red-900 dark:text-red-300">
                  Insufficient Funds
                </h4>
                <p className="text-sm text-red-700 dark:text-red-400 mt-1">
                  You need {totalWithFees.toFixed(2)} MAD but only have {selectedBank?.balance.toFixed(2)} MAD in {selectedBank?.name}.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Summary */}
        {formData.quantity && formData.price_per_share && (
          <div className={`${insufficientFunds ? 'opacity-60' : ''} bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 rounded-xl p-4 border border-blue-200 dark:border-blue-700`}>
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
              {selectedBank && (
                <div className="flex justify-between pt-2 border-t border-blue-200 dark:border-blue-700">
                  <span className="text-gray-600 dark:text-dark-300">New Balance:</span>
                  <span className={`font-semibold ${insufficientFunds ? 'text-red-600 dark:text-red-400' : 'text-gray-900 dark:text-dark-100'
                    }`}>
                    {(selectedBank.balance - totalWithFees).toFixed(2)} MAD
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading || insufficientFunds}
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