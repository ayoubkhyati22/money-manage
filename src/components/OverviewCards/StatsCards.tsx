import { Building2, Target, TrendingUp, ArrowDownCircle } from 'lucide-react'

interface StatsCardsProps {
  banksCount: number
  goalsCount: number
  totalObjectives: number
  totalWithdrawn: number
}

export function StatsCards({ banksCount, goalsCount, totalObjectives, totalWithdrawn }: StatsCardsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
      <div className="sm:hidden group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-3 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-xs font-medium text-dark-400 dark:text-dark-300">Summary</p>
          </div>
          <div className="flex items-center space-x-1">
            <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-mint-400 to-mint-600 rounded-md shadow-sm">
              <Target className="w-2.5 h-2.5 text-white" />
            </div>
            <div className="flex items-center justify-center w-5 h-5 bg-gradient-to-br from-red-400 to-red-600 rounded-md shadow-sm">
              <ArrowDownCircle className="w-2.5 h-2.5 text-white" />
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="text-center">
            <p className="text-base font-semibold text-dark-500 dark:text-dark-100">{goalsCount}</p>
            <p className="text-[10px] text-dark-400 dark:text-dark-300">Goals</p>
          </div>
          <div className="text-center">
            <p className="text-base font-semibold text-red-600 dark:text-red-400 truncate">{totalWithdrawn.toFixed(0)}</p>
            <p className="text-[10px] text-dark-400 dark:text-dark-300">Withdrawn</p>
          </div>
        </div>
      </div>

      <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-400 dark:text-dark-300">Active Banks</p>
            <p className="text-2xl font-semibold text-dark-500 dark:text-dark-100 mt-1">{banksCount}</p>
          </div>
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-accent-400 to-accent-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <Building2 className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-400 dark:text-dark-300">Objectives</p>
            <p className="text-2xl font-semibold text-dark-500 dark:text-dark-100 mt-1">{goalsCount}</p>
          </div>
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-mint-400 to-mint-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <Target className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>

      <div className="group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-3 sm:p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div className="flex-1 min-w-0">
            <p className="text-xs sm:text-sm font-medium text-dark-400 dark:text-dark-300 truncate">Total Objectives</p>
            <p className="text-base sm:text-2xl font-semibold text-dark-500 dark:text-dark-100 mt-0.5 sm:mt-1 truncate">{totalObjectives.toFixed(0)}</p>
            <p className="text-[10px] sm:text-sm text-dark-400 dark:text-dark-300 truncate">MAD</p>
          </div>
          <div className="flex items-center justify-center w-10 h-10 sm:w-14 sm:h-14 bg-gradient-to-br from-dark-400 to-dark-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300 flex-shrink-0">
            <TrendingUp className="w-5 h-5 sm:w-7 sm:h-7 text-white" />
          </div>
        </div>
      </div>

      <div className="hidden sm:block group bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-mint-200/50 dark:border-dark-600/50 hover:shadow-xl transition-all duration-300 hover:scale-105">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-dark-400 dark:text-dark-300">Total Withdrawn</p>
            <p className="text-2xl font-semibold text-red-600 dark:text-red-400 mt-1">{totalWithdrawn.toFixed(2)} MAD</p>
          </div>
          <div className="flex items-center justify-center w-14 h-14 bg-gradient-to-br from-red-400 to-red-600 rounded-2xl shadow-lg group-hover:shadow-xl transition-shadow duration-300">
            <ArrowDownCircle className="w-7 h-7 text-white" />
          </div>
        </div>
      </div>
    </div>
  )
}