import { Building2, CreditCard, CreditCard as Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Bank } from '../../types/bank'

interface BankCardProps {
  bank: Bank
  index: number
  isBalanceHidden: boolean
  onEdit: (bank: Bank) => void
  onDelete: (bank: Bank) => void
  onToggleVisibility: (bankId: string) => void
}

const getCardGradient = (index: number) => {
  const gradients = [
    'from-slate-900 via-slate-800 to-slate-900',
    'from-blue-900 via-blue-800 to-blue-900',
    'from-purple-900 via-purple-800 to-purple-900',
    'from-emerald-900 via-emerald-800 to-emerald-900',
    'from-rose-900 via-rose-800 to-rose-900',
    'from-amber-900 via-amber-800 to-amber-900',
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

export function BankCard({
  bank,
  index,
  isBalanceHidden,
  onEdit,
  onDelete,
  onToggleVisibility
}: BankCardProps) {
  const gradient = getCardGradient(index)
  const accent = getAccentColor(index)

  return (
    <div className="group relative">
      <div className={`relative w-full h-36 sm:h-48 bg-gradient-to-br ${gradient} dark:${gradient} rounded-2xl shadow-2xl transform transition-all duration-500 hover:scale-105 hover:-rotate-1 border border-white/10 overflow-hidden`}>

        <div className="absolute inset-0 opacity-10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-white to-transparent rounded-full -translate-y-16 translate-x-16"></div>
          <div className="absolute bottom-0 left-0 w-24 h-24 bg-gradient-to-tr from-white to-transparent rounded-full translate-y-12 -translate-x-12"></div>
          <div className="absolute top-1/2 left-1/2 w-40 h-40 bg-gradient-to-r from-white to-transparent rounded-full opacity-5 -translate-x-1/2 -translate-y-1/2"></div>
        </div>

        <div className="absolute top-2 sm:top-4 left-3 sm:left-6 right-3 sm:right-6 flex items-center justify-between">
          <div className="flex items-center space-x-1.5 sm:space-x-2">
            {bank.logo ? (
              <div className="w-6 h-6 sm:w-8 sm:h-8 bg-white/20 backdrop-blur-sm rounded-lg flex items-center justify-center p-1">
                <img src={bank.logo} alt={bank.name} className="w-full h-full object-contain" />
              </div>
            ) : (
              <div className={`w-6 h-6 sm:w-8 sm:h-8 bg-gradient-to-br ${accent} rounded-lg flex items-center justify-center shadow-lg`}>
                <Building2 className="w-3 h-3 sm:w-4 sm:h-4 text-white" />
              </div>
            )}
            <div>
              <p className="text-white/90 text-xs sm:text-sm font-medium">{bank.name}</p>
              <p className="text-white/60 text-[10px] sm:text-xs hidden sm:block">FinanceFlow</p>
            </div>
          </div>

          <div className="flex items-center space-x-0.5 sm:space-x-1">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(bank.id)
              }}
              className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors z-10"
              title={isBalanceHidden ? 'Show balance' : 'Hide balance'}
            >
              {isBalanceHidden ? (
                <EyeOff className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 hover:text-white" />
              ) : (
                <Eye className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 hover:text-white" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(bank)
              }}
              className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors z-10"
              title="Edit Bank"
            >
              <Edit2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 hover:text-white" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(bank)
              }}
              className="p-1 sm:p-1.5 hover:bg-white/10 rounded-lg transition-colors z-10"
              title="Delete Bank"
            >
              <Trash2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white/70 hover:text-red-300" />
            </button>
          </div>
        </div>

        <div className="absolute top-1/2 left-3 sm:left-6 right-3 sm:right-6 -translate-y-1/2">
          <div>
            <p className="text-white/60 text-[10px] sm:text-xs uppercase tracking-wider mb-0.5 sm:mb-1">Available Balance</p>
            <div className="relative">
              {isBalanceHidden ? (
                <h3 className="text-lg sm:text-2xl font-bold text-white tracking-wide">
                  ••••••• <span className="text-xs sm:text-sm font-medium text-white/80">MAD</span>
                </h3>
              ) : (
                <h3 className="text-lg sm:text-2xl font-bold text-white tracking-wide">
                  {Number(bank.balance).toLocaleString('en-US', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2
                  })} <span className="text-xs sm:text-sm font-medium text-white/80">MAD</span>
                </h3>
              )}

              <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 transform translate-x-full group-hover:translate-x-[-200%] transition-transform duration-1000 ease-in-out"></div>
            </div>
          </div>
        </div>

        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>

        <div className="absolute top-10 sm:top-16 left-3 sm:left-6 w-6 h-4 sm:w-8 sm:h-6 bg-gradient-to-br from-yellow-400 to-yellow-600 rounded-sm shadow-inner opacity-80"></div>

        <div className="absolute bottom-2 sm:bottom-4 right-3 sm:right-6">
          <div className="flex items-center space-x-1">
            <div className="w-5 h-3 sm:w-6 sm:h-4 bg-white/20 rounded-sm flex items-center justify-center">
              <CreditCard className="w-2.5 h-2.5 sm:w-3 sm:h-3 text-white/60" />
            </div>
          </div>
        </div>
      </div>

      <div className={`absolute inset-0 bg-gradient-to-br from-gray-800/50 to-transparent rounded-2xl blur-xl scale-105 -z-10 opacity-50 group-hover:opacity-75 transition-opacity duration-500`}></div>
    </div>
  )
}
