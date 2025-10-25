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

// Premium color gradients - Luxury financial palette
const gradients = [
  // Deep Navy & Gold - Ultra Premium
  'from-slate-900 via-blue-900 to-slate-800',
  // Burgundy & Rose Gold - Luxury
  'from-rose-900 via-rose-800 to-rose-700',
  // Forest Green & Bronze - Wealth
  'from-emerald-900 via-emerald-800 to-emerald-700',
  // Purple & Platinum - Exclusive
  'from-purple-900 via-purple-800 to-purple-700',
  // Charcoal & Silver - Premium Neutral
  'from-gray-900 via-gray-800 to-gray-700'
]

// Alternative: Solid premium colors with subtle gradients
const premiumSolidColors = [
  'bg-gradient-to-br from-slate-900 to-blue-900', // Deep Navy
  'bg-gradient-to-br from-burgundy-900 to-burgundy-700', // Burgundy
  'bg-gradient-to-br from-emerald-900 to-emerald-700', // Forest Green
  'bg-gradient-to-br from-purple-900 to-purple-700', // Royal Purple
  'bg-gradient-to-br from-gray-900 to-gray-700' // Charcoal
]

// Ultra-premium metallic gradients
const metallicGradients = [
  'bg-gradient-to-br from-gray-800 via-gray-700 to-gray-600 border border-gray-500', // Platinum
  'bg-gradient-to-br from-amber-800 via-amber-700 to-amber-600 border border-amber-500', // Gold
  'bg-gradient-to-br from-slate-700 via-slate-600 to-slate-500 border border-slate-400', // Silver
  'bg-gradient-to-br from-rose-800 via-rose-700 to-rose-600 border border-rose-500', // Rose Gold
]

export function BankCard({
  bank,
  index,
  isBalanceHidden,
  onEdit,
  onDelete,
  onToggleVisibility
}: BankCardProps) {
  const gradient = premiumSolidColors[index % gradients.length]
  // const isPrimaryBank = index === 0

  return (
    <div className="group relative transition-all duration-500 hover:scale-[1.02]">
      {/* {isPrimaryBank && (
        <div className="absolute -top-2 -right-2 z-20 flex items-center gap-1 bg-gradient-to-r from-amber-600 to-amber-700 text-white px-3 py-1 rounded-full text-xs font-semibold shadow-lg shadow-amber-500/25 border border-amber-400/30">
          <Crown className="w-3 h-3" />
          Primary
        </div>
      )} */}

      <div
        className={`relative w-full h-40 sm:h-48 rounded-2xl ${gradient} text-white shadow-xl overflow-hidden backdrop-blur-sm border border-white/10 group-hover:border-white/20 transition-all duration-300`}
      >
        {/* Premium texture overlay */}
        <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?q=80&w=1000&auto=format&fit=crop')] opacity-5 mix-blend-overlay"></div>
        
        {/* Subtle shine effect */}
        <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent"></div>

        {/* Top section */}
        <div className="relative z-10 flex items-center justify-between px-5 sm:px-6 pt-4 sm:pt-5">
          <div className="flex items-center gap-3 sm:gap-4">
            {bank.logo ? (
              <div className="relative">
                <img
                  src={bank.logo}
                  alt={bank.name}
                  className="w-8 h-8 sm:w-10 sm:h-10 object-contain rounded-lg bg-white/10 p-1.5 border border-white/20 backdrop-blur-sm"
                />
                <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full border border-white shadow-sm"></div>
              </div>
            ) : (
              <div className="w-8 h-8 sm:w-10 sm:h-10 rounded-lg bg-white/10 flex items-center justify-center border border-white/20 backdrop-blur-sm">
                <Building2 className="w-5 h-5 text-white/80" />
              </div>
            )}
            <div>
              <p className="font-semibold text-sm sm:text-base text-white/95 tracking-tight">
                {bank.name}
              </p>
              {/* <p className="text-[10px] sm:text-xs text-white/60 tracking-wide">
                PRIVATE BANKING
              </p> */}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-1 sm:gap-2">
            <button
              onClick={(e) => {
                e.stopPropagation()
                onToggleVisibility(bank.id)
              }}
              // className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
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
              // className="p-1.5 sm:p-2 hover:bg-white/10 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
            >
              <Edit2 className="w-4 h-4 text-white/70" />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation()
                onDelete(bank)
              }}
              // className="p-1.5 sm:p-2 hover:bg-red-500/20 rounded-lg transition-all duration-200 backdrop-blur-sm border border-white/10"
            >
              <Trash2 className="w-4 h-4 text-white/70" />
            </button>
          </div>
        </div>

        {/* Balance Section */}
        <div className="relative z-10 px-5 sm:px-6 mt-6 sm:mt-8">
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

        {/* Subtle corner accent */}
        <div className="absolute bottom-3 right-4 w-6 h-6 border-b-2 border-r-2 border-white/20 rounded-br-xl"></div>
      </div>
    </div>
  )
}