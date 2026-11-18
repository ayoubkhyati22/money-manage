import { Goal } from '../../lib/supabase'
import { Calendar, Eye, EyeOff, Check, Target, Clock, Plus, ArrowRight } from 'lucide-react'
import { format, differenceInDays } from 'date-fns'
import { motion } from 'framer-motion'
import { useState } from 'react'

function safeFormatDate(dateStr: string | null | undefined, fmt: string = 'MMM yyyy'): string {
  if (!dateStr) return ''
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return ''
    return format(d, fmt)
  } catch {
    return ''
  }
}

function safeDaysLeft(dateStr: string | null | undefined): number | null {
  if (!dateStr) return null
  try {
    const d = new Date(dateStr)
    if (isNaN(d.getTime())) return null
    return differenceInDays(d, new Date())
  } catch {
    return null
  }
}

interface GoalCardProps {
  goal: Goal
  index: number
  currentAmount: number
  showAmounts: boolean
  onEdit: () => void
  onDelete: () => void
  onAddMoney: () => void
  onManageAllocations: () => void
  onViewDetails?: () => void
}

// Category styling metadata
function getCategoryMeta(category?: string | null) {
  const cat = (category || 'General').toLowerCase()
  if (cat.includes('invest')) {
    return {
      dot: 'bg-emerald-500',
      badge: 'bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 border-emerald-500/20',
      bar: 'bg-emerald-500',
    }
  }
  if (cat.includes('emergenc')) {
    return {
      dot: 'bg-rose-500',
      badge: 'bg-rose-500/10 text-rose-600 dark:text-rose-400 border-rose-500/20',
      bar: 'bg-rose-500',
    }
  }
  if (cat.includes('travel')) {
    return {
      dot: 'bg-sky-500',
      badge: 'bg-sky-500/10 text-sky-600 dark:text-sky-400 border-sky-500/20',
      bar: 'bg-sky-500',
    }
  }
  if (cat.includes('family')) {
    return {
      dot: 'bg-violet-500',
      badge: 'bg-violet-500/10 text-violet-600 dark:text-violet-400 border-violet-500/20',
      bar: 'bg-violet-500',
    }
  }
  if (cat.includes('health')) {
    return {
      dot: 'bg-teal-500',
      badge: 'bg-teal-500/10 text-teal-600 dark:text-teal-400 border-teal-500/20',
      bar: 'bg-teal-500',
    }
  }
  // Default Sovereign Amber
  return {
    dot: 'bg-amber-500',
    badge: 'bg-amber-500/10 text-amber-600 dark:text-amber-400 border-amber-500/20',
    bar: 'bg-amber-500',
  }
}

export function GoalCard({
  goal,
  index,
  currentAmount,
  showAmounts: globalShow,
  onAddMoney,
  onViewDetails,
}: GoalCardProps) {
  const [localShow, setLocalShow] = useState<boolean | null>(null)
  const showAmount = localShow !== null ? localShow : globalShow

  const safeCurrent = typeof currentAmount === 'number' && !isNaN(currentAmount) ? currentAmount : 0
  const target = goal.target_amount ? Number(goal.target_amount) : 0
  const progress = target > 0 ? Math.min((safeCurrent / target) * 100, 100) : 0
  const isCompleted = progress >= 100
  const remaining = target > 0 ? Math.max(target - safeCurrent, 0) : null
  const daysLeft = safeDaysLeft(goal.target_date)
  const meta = getCategoryMeta(goal.category)

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, duration: 0.25 }}
      onClick={onViewDetails}
      className="p-5 rounded-2xl bg-white dark:bg-[#121520] border border-stone-200/90 dark:border-white/[0.08] hover:border-amber-500/30 transition-all cursor-pointer group flex flex-col justify-between shadow-sm relative overflow-hidden"
    >
      {/* Subtle top indicator border for completed status */}
      {isCompleted && (
        <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
      )}

      <div>
        {/* Top Header Row: Category Badge + Status + Eye */}
        <div className="flex items-center justify-between mb-3.5">
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider uppercase font-semibold border ${meta.badge}`}>
              <span className={`w-1.5 h-1.5 rounded-full ${meta.dot}`} />
              {goal.category || 'General'}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border border-emerald-500/30">
                <Check className="w-2.5 h-2.5" /> Achieved
              </span>
            )}
          </div>

          <button
            onClick={e => {
              e.stopPropagation()
              setLocalShow(v => (v === null ? !globalShow : !v))
            }}
            className="p-1 rounded-lg text-stone-400 hover:text-stone-700 dark:hover:text-stone-200 hover:bg-stone-100 dark:hover:bg-white/[0.05] transition-colors"
            title={showAmount ? 'Hide amounts' : 'Reveal amounts'}
          >
            {showAmount ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
          </button>
        </div>

        {/* Milestone Title & Percentage */}
        <div className="flex items-start justify-between gap-3 mb-2">
          <h4 className="text-base font-display font-bold text-stone-900 dark:text-white leading-tight line-clamp-1 group-hover:text-amber-500 transition-colors">
            {goal.name}
          </h4>
          <span className={`font-mono text-sm font-bold flex-shrink-0 ${isCompleted ? 'text-emerald-500' : 'text-amber-500'}`}>
            {progress.toFixed(0)}%
          </span>
        </div>

        {/* Primary Amount */}
        <div className="mb-3">
          <div className="flex items-baseline gap-1.5">
            {showAmount ? (
              <span className="text-2xl font-mono font-bold tracking-tight text-stone-900 dark:text-white tabular-num">
                {currentAmount.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}
              </span>
            ) : (
              <span className="text-2xl font-mono font-bold tracking-widest text-stone-400">
                ••••••
              </span>
            )}
            <span className="text-xs font-mono font-semibold text-stone-400">MAD</span>
          </div>

          {target > 0 && (
            <p className="text-[11px] font-mono text-stone-400 mt-0.5">
              Target:{' '}
              {showAmount ? (
                <span className="text-stone-600 dark:text-stone-300 font-medium">
                  {target.toLocaleString('en-US')} MAD
                </span>
              ) : (
                '••••••'
              )}
              {remaining !== null && remaining > 0 && showAmount && (
                <span className="ml-1.5 text-stone-400">
                  ({remaining.toLocaleString('en-US')} left)
                </span>
              )}
            </p>
          )}
        </div>

        {/* Stepped Progress Track with 25%, 50%, 75% tick marks */}
        <div className="relative my-3">
          <div className="h-2 bg-stone-100 dark:bg-stone-800/80 rounded-full overflow-hidden relative">
            <motion.div
              className={`h-full rounded-full ${
                isCompleted
                  ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                  : 'bg-gradient-to-r from-amber-500 to-emerald-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, ease: 'easeOut', delay: index * 0.05 }}
            />
          </div>
          {/* Milestone tick marks */}
          <div className="absolute inset-0 flex justify-between pointer-events-none px-1">
            <span className="w-0.5 h-2 bg-stone-300 dark:bg-stone-700 opacity-60 ml-[25%]" />
            <span className="w-0.5 h-2 bg-stone-300 dark:bg-stone-700 opacity-60 ml-[25%]" />
            <span className="w-0.5 h-2 bg-stone-300 dark:bg-stone-700 opacity-60 ml-[25%]" />
          </div>
        </div>
      </div>

      {/* Footer Horizon & Fast Action */}
      <div className="pt-3 border-t border-stone-100 dark:border-white/[0.05] flex items-center justify-between text-xs">
        {/* Horizon Indicator */}
        <div className="flex items-center gap-1.5 text-[11px] font-mono text-stone-400">
          {daysLeft !== null ? (
            <>
              <Clock className="w-3 h-3 text-stone-400" />
              <span className={daysLeft < 0 ? 'text-rose-500 font-medium' : daysLeft < 30 ? 'text-amber-500 font-medium' : ''}>
                {daysLeft < 0 ? 'Overdue' : `${daysLeft}d left`}
              </span>
            </>
          ) : goal.target_date && safeFormatDate(goal.target_date) ? (
            <>
              <Calendar className="w-3.5 h-3.5 text-stone-400" />
              <span>{safeFormatDate(goal.target_date, 'MMM yyyy')}</span>
            </>
          ) : (
            <>
              <Target className="w-3 h-3 text-stone-400" />
              <span>Continuous</span>
            </>
          )}
        </div>

        {/* Quick Allocate Action */}
        <div className="flex items-center gap-1.5">
          <button
            onClick={e => {
              e.stopPropagation()
              onAddMoney()
            }}
            className="p-1.5 rounded-lg bg-stone-100 dark:bg-[#1a1d28] hover:bg-amber-500/10 text-stone-600 dark:text-stone-300 hover:text-amber-500 transition-colors"
            title="Allocate money directly to this goal"
          >
            <Plus className="w-3.5 h-3.5" />
          </button>
          <div className="p-1.5 text-stone-300 dark:text-stone-600 group-hover:text-amber-500 transition-colors">
            <ArrowRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>
    </motion.div>
  )
}
