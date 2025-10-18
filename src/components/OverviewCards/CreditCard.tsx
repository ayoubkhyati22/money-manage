import { useState } from 'react'
import { Wallet, Eye, EyeOff, Building2 } from 'lucide-react'
import { format } from 'date-fns'

interface CreditCardProps {
  totalBalance: number
  banksCount: number
}

export function CreditCard({ totalBalance, banksCount }: CreditCardProps) {
  const [showBalance, setShowBalance] = useState(false)

  return (
    <div className="w-full flex justify-center py-10">
      <div className="relative w-full max-w-md group">
        {/* Outer glowing ring */}
        <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-blue-500/20 via-purple-500/20 to-pink-500/20 blur-2xl opacity-70 group-hover:opacity-100 transition-opacity duration-700 pointer-events-none" />

        {/* Card container */}
        <div
          className="
            relative w-full h-52 
            rounded-2xl shadow-2xl overflow-hidden
            border border-white/10 backdrop-blur-xl
            bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 
            dark:from-[#0b0b0f] dark:via-[#12121a] dark:to-[#1a1a24]
            transition-all duration-500
          "
        >
          {/* Dynamic gradient lights */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-gradient-to-br from-blue-400/40 via-cyan-400/30 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute top-24 -right-24 w-72 h-72 bg-gradient-to-tl from-fuchsia-500/30 via-purple-400/20 to-transparent rounded-full blur-3xl animate-pulse"></div>
            <div className="absolute bottom-0 left-1/2 w-72 h-72 -translate-x-1/2 bg-gradient-to-t from-emerald-400/10 to-transparent rounded-full blur-2xl opacity-40"></div>
          </div>

          {/* Animated light reflection */}
          <div className="absolute inset-0 bg-[linear-gradient(120deg,transparent_0%,rgba(255,255,255,0.05)_50%,transparent_100%)] bg-[length:200%_100%] animate-[shine_4s_infinite] pointer-events-none" />

          {/* Top section */}
          <div className="absolute top-6 left-6 right-6 flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg flex items-center justify-center shadow-lg shadow-primary-500/30">
                <Wallet className="w-4 h-4 text-white" />
              </div>
              <div>
                <p className="text-white/95 text-sm font-medium">FinanceFlow</p>
                <p className="text-white/60 text-xs">Total Balance</p>
              </div>
            </div>

            <button
              onClick={() => setShowBalance(!showBalance)}
              className="p-2 hover:bg-white/10 dark:hover:bg-white/5 rounded-lg transition-colors z-10 relative"
              title={showBalance ? 'Hide balance' : 'Show balance'}
            >
              {showBalance ? (
                <EyeOff className="w-4 h-4 text-white/70 hover:text-white" />
              ) : (
                <Eye className="w-4 h-4 text-white/70 hover:text-white" />
              )}
            </button>
          </div>

          {/* Balance section */}
          <div className="absolute top-1/2 left-6 right-6 -translate-y-1/2">
            <div className="text-center">
              <p className="text-white/60 text-xs uppercase tracking-wider mb-2">
                Available Balance
              </p>
              <div className="relative">
                <h2
                  className={`text-3xl font-bold text-white mb-1 tracking-wide drop-shadow-[0_0_6px_rgba(255,255,255,0.15)] transition-all duration-500 ${
                    showBalance
                      ? 'blur-0 opacity-100'
                      : 'blur-md opacity-60 select-none'
                  }`}
                >
                  {showBalance ? (
                    <>
                      {totalBalance.toLocaleString('en-US', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2
                      })}{' '}
                      <span className="text-lg font-medium text-white/80">
                        MAD
                      </span>
                    </>
                  ) : (
                    <>
                      •••••••{' '}
                      <span className="text-lg font-medium text-white/80">
                        MAD
                      </span>
                    </>
                  )}
                </h2>
              </div>
            </div>
          </div>

          {/* Footer info */}
          <div className="absolute bottom-6 left-6 right-6 flex items-center justify-between text-white/80">
            <div>
              <p className="text-white/60 text-xs">Last updated</p>
              <p className="text-white/90 text-sm font-medium">
                {format(new Date(), 'MMM dd, yyyy')}
              </p>
            </div>
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-sm border border-white/10">
                <Building2 className="w-3 h-3 text-white/70" />
              </div>
              <span className="text-white/70 text-xs">{banksCount} Banks</span>
            </div>
          </div>
        </div>
      </div>

      {/* Shine keyframes */}
      <style jsx>{`
        @keyframes shine {
          0% {
            background-position: 200% 0;
          }
          100% {
            background-position: -200% 0;
          }
        }
      `}</style>
    </div>
  )
}
