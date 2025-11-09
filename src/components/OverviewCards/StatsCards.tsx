import { Building2, Target, TrendingUp, ArrowDownCircle, BarChart3, Sparkles } from 'lucide-react'

interface StatsCardsProps {
  banksCount: number
  goalsCount: number
  totalObjectives: number
  totalWithdrawn: number
  stockGains: number
  totalBalance: number
}

export function StatsCards({ banksCount, goalsCount, totalObjectives, totalWithdrawn, stockGains, totalBalance }: StatsCardsProps) {
  const totalBalanceWithStocks = totalBalance + stockGains
  const isStockProfit = stockGains >= 0

  return (
    <div className="grid grid-cols-1 lg:grid-cols-4 gap-2 sm:gap-4">
      {/* Mobile Summary Card (Visible only on small screens) */}
      <div className="sm:hidden group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl p-2.5 shadow-md border border-mint-200/50 dark:border-dark-600/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between mb-1.5">
          <div>
            <p className="text-xs font-medium text-dark-400 dark:text-dark-300">Summary</p>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center justify-center w-4 h-4 bg-gradient-to-br from-mint-400 to-mint-600 rounded-md shadow-sm">
              <Target className="w-2 h-2 text-white" />
            </div>
            <div className="flex items-center justify-center w-4 h-4 bg-gradient-to-br from-red-400 to-red-600 rounded-md shadow-sm">
              <ArrowDownCircle className="w-2 h-2 text-white" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div className="text-center">
            <p className="text-sm font-semibold text-dark-500 dark:text-dark-100">{goalsCount}</p>
            <p className="text-[9px] text-dark-400 dark:text-dark-300">Goals</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold text-red-600 dark:text-red-400 truncate">{totalWithdrawn.toFixed(0)}</p>
            <p className="text-[9px] text-dark-400 dark:text-dark-300">Withdrawn</p>
          </div>
        </div>
      </div>

      {/* Active Banks Card */}
      <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-mint-200/50 dark:border-dark-600/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-dark-400 dark:text-dark-300">Active Banks</p>
            <p className="text-xl font-semibold text-dark-500 dark:text-dark-100 mt-1">{banksCount}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-accent-400 to-accent-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <Building2 className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Objectives Card */}
      <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-mint-200/50 dark:border-dark-600/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-dark-400 dark:text-dark-300">Objectives</p>
            <p className="text-xl font-semibold text-dark-500 dark:text-dark-100 mt-1">{goalsCount}</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-mint-400 to-mint-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <Target className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Total Objectives Card */}
      {/* <div className="group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl p-2.5 sm:p-4 shadow-md border border-mint-200/50 dark:border-dark-600/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-dark-400 dark:text-dark-300 truncate">Total Objectives</p>
            <p className="text-base sm:text-xl font-semibold text-dark-500 dark:text-dark-100 mt-0.5 truncate">{totalObjectives.toFixed(0)}</p>
            <p className="text-[9px] sm:text-xs text-dark-400 dark:text-dark-300 truncate">MAD</p>
          </div>
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-dark-400 to-dark-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 flex-shrink-0">
            <TrendingUp className="w-4 h-4 sm:w-5 h-5 text-white" />
          </div>
        </div>
      </div> */}

      {/* Total Withdrawn Card */}
      <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl p-4 shadow-md border border-mint-200/50 dark:border-dark-600/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-dark-400 dark:text-dark-300">Total Withdrawn</p>
            <p className="text-xl font-semibold text-red-600 dark:text-red-400 mt-1">{totalWithdrawn.toFixed(2)} MAD</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 bg-gradient-to-br from-red-400 to-red-600 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300">
            <ArrowDownCircle className="w-5 h-5 text-white" />
          </div>
        </div>
      </div>

      {/* Stock Gains Card - NOUVELLE */}
      {/* <div className="group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-xl p-2.5 sm:p-4 shadow-md border border-mint-200/50 dark:border-dark-600/50 hover:shadow-lg transition-all duration-300 hover:scale-[1.02]">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs font-medium text-dark-400 dark:text-dark-300 truncate">Stock Gains</p>
            <p className={`text-base sm:text-xl font-semibold mt-0.5 truncate ${isStockProfit
                ? 'text-emerald-600 dark:text-emerald-400'
                : 'text-red-600 dark:text-red-400'
              }`}>
              {isStockProfit ? '+' : ''}{stockGains.toFixed(0)}
            </p>
            <p className="text-[9px] sm:text-xs text-dark-400 dark:text-dark-300 truncate">MAD</p>
          </div>
          <div className={`flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 rounded-lg shadow-md group-hover:shadow-lg transition-shadow duration-300 flex-shrink-0 ${isStockProfit
              ? 'bg-gradient-to-br from-emerald-400 to-emerald-600'
              : 'bg-gradient-to-br from-red-400 to-red-600'
            }`}>
            <BarChart3 className="w-4 h-4 sm:w-5 h-5 text-white" />
          </div>
        </div>
      </div> */}

      {/* Total Balance avec Stocks Card - NOUVELLE - Premium Design */}
      {/* <div className="group bg-gradient-to-br from-purple-50 to-indigo-50 dark:from-purple-900/20 dark:to-indigo-900/20 rounded-xl p-2.5 sm:p-4 shadow-md border-2 border-purple-300/50 dark:border-purple-600/50 hover:shadow-xl transition-all duration-300 hover:scale-[1.02] relative overflow-hidden">
        <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-br from-white/30 to-transparent rounded-full blur-xl group-hover:scale-150 transition-transform duration-500"></div>
        <div className="absolute -bottom-2 -left-2 w-12 h-12 bg-gradient-to-tr from-purple-400/20 to-transparent rounded-full blur-lg"></div>

        <div className="relative flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <div className="flex items-center space-x-1">
              <p className="text-xs font-medium text-purple-700 dark:text-purple-300 truncate">Total + Stocks</p>
              <Sparkles className="w-3 h-3 text-purple-500 animate-pulse" />
            </div>
            <p className="text-base sm:text-xl font-bold mt-0.5 truncate text-purple-900 dark:text-purple-100">
              {totalBalanceWithStocks.toFixed(0)}
            </p>
            <p className="text-[9px] sm:text-xs text-purple-600 dark:text-purple-400 truncate font-medium">MAD</p>
          </div>
          <div className="flex items-center justify-center w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg shadow-lg group-hover:shadow-xl transition-all duration-300 flex-shrink-0 group-hover:scale-110">
            <TrendingUp className="w-4 h-4 sm:w-5 h-5 text-white" />
          </div>
        </div>
      </div> */}
    </div >
  )
}