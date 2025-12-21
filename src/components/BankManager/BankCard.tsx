import { Building2, CreditCard, Edit2, Trash2, Eye, EyeOff, Crown, Sparkles } from 'lucide-react'
import { Bank } from '../../types/bank'

interface BankCardProps {
  bank: Bank
  index: number
  isBalanceHidden: boolean
  onEdit: (bank: Bank) => void
  onDelete: (bank: Bank) => void
  onToggleVisibility: (bankId: string) => void
}

// Dark glassmorphism themes - keeping original dark color scheme
const glassThemes = [
  // Deep Navy & Gold
  'from-slate-900 via-blue-900 to-slate-800',
  // Burgundy & Rose Gold
  'from-rose-900 via-rose-800 to-rose-700',
  // Forest Green & Bronze
  'from-emerald-900 via-emerald-800 to-emerald-700',
  // Purple & Platinum
  'from-purple-900 via-purple-800 to-purple-700',
  // Charcoal & Silver
  'from-gray-900 via-gray-800 to-gray-700'
]

export function BankCard({
  bank,
  index,
  isBalanceHidden,
  onEdit,
  onDelete,
  onToggleVisibility
}: BankCardProps) {
  const gradient = glassThemes[index % glassThemes.length]

  return (
    <div className="group relative transition-all duration-300">
      {/* Main Glass Card */}
      <div
        className={`relative w-full h-40 sm:h-48 rounded-2xl bg-gradient-to-br ${gradient} text-white shadow-xl overflow-hidden backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300`}
      >
        {/* Glass overlay effect */}
        <div className="absolute inset-0 bg-white/5 backdrop-blur-md"></div>
        
        {/* Subtle texture overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1000&auto=format&fit=crop')] opacity-5 mix-blend-overlay"></div>
        
        {/* Top shine effect - glassmorphism */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>

        {/* Content */}
        <div className="relative z-10 h-full flex flex-col">
          {/* Top section */}
          <div className="flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5">
            <div className="flex items-center gap-3 sm:gap-4">
              {bank.logo ? (
                <div className="relative">
                  {/* Glass effect behind logo */}
                  <div className="absolute inset-0 bg-white/10 blur-md rounded-lg"></div>
                  <img
                    src={bank.logo}
                    alt={bank.name}
                    className="relative w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg bg-white/10 backdrop-blur-sm p-1.5 border border-white/20"
                  />
                  <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border border-white shadow-sm"></div>
                </div>
              ) : (
                <div className="relative">
                  <div className="absolute inset-0 bg-white/10 blur-md rounded-lg"></div>
                  <div className="relative w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 backdrop-blur-sm flex items-center justify-center border border-white/20">
                    <Building2 className="w-5 h-5 text-white/80" />
                  </div>
                </div>
              )}
              <div>
                <p className="font-semibold text-sm sm:text-base text-white/95 tracking-tight">
                  {bank.name}
                </p>
              </div>
            </div>

            {/* Action buttons with glass effect */}
            <div className="flex items-center gap-1 sm:gap-2">
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onToggleVisibility(bank.id)
                }}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                {isBalanceHidden ? (
                  <EyeOff className="w-4 h-4 text-white/70" />
                ) : (
                  <Eye className="w-4 h-4 text-white/70" />
                )}
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onEdit(bank)
                }}
                className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <Edit2 className="w-4 h-4 text-white/70" />
              </button>
              <button
                onClick={(e) => {
                  e.stopPropagation()
                  onDelete(bank)
                }}
                className="p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 backdrop-blur-sm"
              >
                <Trash2 className="w-4 h-4 text-white/70" />
              </button>
            </div>
          </div>

          {/* Balance Section - Glass container */}
          <div className="flex-1 flex flex-col justify-end px-5 sm:px-6 pb-4 sm:pb-5">
            <div className="bg-white/10 backdrop-blur-xl rounded-xl px-4 py-3 border border-white/20 shadow-lg">
              <p className="text-[11px] sm:text-xs uppercase tracking-widest text-white/60 font-medium mb-2">
                Available Balance
              </p>
              
              <div className="relative">
                {isBalanceHidden ? (
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white/95 tracking-tight">
                      •••••••
                    </h3>
                    <span className="text-sm font-medium text-white/60">MAD</span>
                  </div>
                ) : (
                  <div className="flex items-baseline gap-2">
                    <h3 className="text-2xl sm:text-3xl font-bold text-white/95 tracking-tight">
                      {Number(bank.balance).toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}
                    </h3>
                    <span className="text-sm font-medium text-white/60">MAD</span>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Subtle corner accent */}
          <div className="absolute bottom-3 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-xl"></div>
        </div>

        {/* Glassmorphic shine on hover */}
        <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/0 to-white/10 opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>
      </div>
    </div>
  )
}