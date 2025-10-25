import { Building2, CreditCard, Edit2, Trash2, Eye, EyeOff } from 'lucide-react'
import { Bank } from '../../types/bank'

interface BankCardProps {
  bank: Bank
  index: number
  isBalanceHidden: boolean
  onEdit: (bank: Bank) => void
  onDelete: (bank: Bank) => void
  onToggleVisibility: (bankId: string) => void
}

const gradients = [
  'from-indigo-500 via-blue-500 to-cyan-400',
  'from-purple-500 via-pink-500 to-rose-400',
  'from-emerald-500 via-teal-500 to-lime-400',
  'from-amber-500 via-orange-500 to-red-400',
  'from-slate-600 via-gray-700 to-gray-900'
]

export function BankCard({
  bank,
  index,
  isBalanceHidden,
  onEdit,
  onDelete,
  onToggleVisibility
}: BankCardProps) {
  const gradient = gradients[index % gradients.length]

  return (
    <div className="group relative transition-all duration-500 hover:scale-[1.02]">
      <div
        className={`relative w-full h-36 sm:h-44 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-lg overflow-hidden backdrop-blur-md border border-white/20`}
      >
        {/* Background lighting effect */}
        <div className="absolute inset-0">
          <div className="absolute top-0 left-0 w-full h-full bg-white/10 opacity-10 blur-3xl group-hover:opacity-20 transition-all duration-500"></div>
        </div>

        {/* Top section */}
        <div className="flex items-center justify-between px-4 sm:px-6 pt-3 sm:pt-4">
          <div className="flex items-center gap-2 sm:gap-3">
            {bank.logo ? (
              <img
                src={bank.logo}
                alt={bank.name}
                className="w-7 h-7 sm:w-9 sm:h-9 object-contain rounded-md bg-white/20 p-1"
              />
            ) : (
              <div className="w-7 h-7 sm:w-9 sm:h-9 rounded-md bg-white/20 flex items-center justify-center">
                <Building2 className="w-4 h-4 text-white/80" />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm sm:text-base">{bank.name}</p>
              <p className="text-[10px] sm:text-xs text-white/70">FinanceFlow</p>
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(bank.id)
              }}
              className="p-1 sm:p-1.5 hover:bg-white/15 rounded-lg transition"
            >
              {isBalanceHidden ? (
                <EyeOff className="w-4 h-4 text-white/80" />
              ) : (
                <Eye className="w-4 h-4 text-white/80" />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onEdit(bank)
              }}
              className="p-1 sm:p-1.5 hover:bg-white/15 rounded-lg transition"
            >
              <Edit2 className="w-4 h-4 text-white/80" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(bank)
              }}
              className="p-1 sm:p-1.5 hover:bg-white/15 rounded-lg transition"
            >
              <Trash2 className="w-4 h-4 text-white/80 hover:text-red-300" />
            </button>
          </div>
        </div>

        {/* Balance Section */}
        <div className="px-4 sm:px-6 mt-4">
          <p className="text-[11px] sm:text-xs uppercase tracking-wider text-white/70">
            Available Balance
          </p>
          <div className="mt-1 relative">
            {isBalanceHidden ? (
              <h3 className="text-xl sm:text-2xl font-bold tracking-wide">
                ••••••• <span className="text-sm font-medium text-white/80">MAD</span>
              </h3>
            ) : (
              <h3 className="text-xl sm:text-2xl font-bold tracking-wide">
                {Number(bank.balance).toLocaleString('en-US', {
                  minimumFractionDigits: 2,
                  maximumFractionDigits: 2
                })}{' '}
                <span className="text-sm font-medium text-white/80">MAD</span>
              </h3>
            )}
            {/* Shimmer effect */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent skew-x-12 translate-x-full group-hover:-translate-x-[200%] transition-transform duration-1000 ease-in-out"></div>
          </div>
        </div>
      </div>
    </div>
  )
}
