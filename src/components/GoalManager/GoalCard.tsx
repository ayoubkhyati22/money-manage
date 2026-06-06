import { Goal } from '../../lib/supabase'
import { Calendar, Edit2, Trash2, Plus, Eye, EyeOff, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface GoalCardProps {
  goal: Goal
  index: number
  currentAmount: number
  showAmounts: boolean
  onEdit: () => void
  onDelete: () => void
  onAddMoney: () => void
  onManageAllocations: () => void
}

const categoryColors: Record<string, { bg: string; text: string; dot: string }> = {
  Personal:   { bg: 'bg-violet-100 dark:bg-violet-900/30',  text: 'text-violet-600 dark:text-violet-400',  dot: 'bg-violet-500' },
  Family:     { bg: 'bg-pink-100 dark:bg-pink-900/30',      text: 'text-pink-600 dark:text-pink-400',      dot: 'bg-pink-500' },
  Investment: { bg: 'bg-amber-100 dark:bg-amber-900/30',    text: 'text-amber-600 dark:text-amber-400',    dot: 'bg-amber-500' },
  Emergency:  { bg: 'bg-red-100 dark:bg-red-900/30',        text: 'text-red-600 dark:text-red-400',        dot: 'bg-red-500' },
  Travel:     { bg: 'bg-sky-100 dark:bg-sky-900/30',        text: 'text-sky-600 dark:text-sky-400',        dot: 'bg-sky-500' },
  Education:  { bg: 'bg-indigo-100 dark:bg-indigo-900/30',  text: 'text-indigo-600 dark:text-indigo-400',  dot: 'bg-indigo-500' },
  Health:     { bg: 'bg-emerald-100 dark:bg-emerald-900/30',text: 'text-emerald-600 dark:text-emerald-400',dot: 'bg-emerald-500' },
  Other:      { bg: 'bg-slate-100 dark:bg-slate-700',       text: 'text-slate-600 dark:text-slate-400',    dot: 'bg-slate-400' },
}
const defaultColor = { bg: 'bg-primary-100 dark:bg-primary-900/30', text: 'text-primary-600 dark:text-primary-400', dot: 'bg-primary-500' }

export function GoalCard({ goal, index, currentAmount, showAmounts: globalShow, onEdit, onDelete, onAddMoney, onManageAllocations }: GoalCardProps) {
  const [localShow, setLocalShow] = useState<boolean | null>(null)

  const showAmount = localShow !== null ? localShow : globalShow

  const progress = goal.target_amount ? Math.min((currentAmount / goal.target_amount) * 100, 100) : 0
  const isCompleted = progress >= 100
  const catColor = goal.category ? (categoryColors[goal.category] ?? defaultColor) : defaultColor

  const barGradient = isCompleted
    ? 'from-success-500 to-success-400'
    : progress >= 70
      ? 'from-primary-500 to-accent-400'
      : progress >= 30
        ? 'from-primary-500 to-primary-400'
        : 'from-slate-300 to-slate-200'

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05, ease: 'easeOut' }}
      className="group rounded-2xl border border-slate-200 dark:border-slate-700/60 overflow-hidden transition-colors hover:border-slate-300 dark:hover:border-slate-600"
    >
      {/* Accent top bar */}
      <div className={`h-0.5 w-full bg-gradient-to-r ${barGradient}`} />

      <div className="p-3">
        {/* Top row: category + eye */}
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center gap-1">
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${catColor.bg} ${catColor.text}`}>
              <span className={`w-1 h-1 rounded-full ${catColor.dot}`} />
              {goal.category || 'General'}
            </span>
            {isCompleted && (
              <span className="inline-flex items-center gap-0.5 px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-success-100 dark:bg-success-900/30 text-success-600 dark:text-success-400">
                <Sparkles className="w-2.5 h-2.5" />
              </span>
            )}
          </div>
          <button
            onClick={() => setLocalShow(v => v === null ? !globalShow : !v)}
            className="p-1 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors text-slate-400"
          >
            {showAmount ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
          </button>
        </div>

        {/* Goal name */}
        <p className="font-semibold text-slate-800 dark:text-white text-xs mb-2 line-clamp-1">{goal.name}</p>

        {/* Amount + progress */}
        <div className="mb-2">
          <div className="flex items-center justify-between mb-1">
            {showAmount ? (
              <span className="text-sm font-bold text-slate-800 dark:text-white">
                {currentAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })}
                <span className="text-[10px] font-normal text-slate-400 ml-1">MAD</span>
              </span>
            ) : (
              <div className="flex items-center gap-1 h-5">
                {[...Array(4)].map((_, i) => <span key={i} className="w-1.5 h-1.5 bg-slate-200 dark:bg-slate-600 rounded-full" />)}
              </div>
            )}
            {goal.target_amount && (
              <span className={`text-[10px] font-bold ${isCompleted ? 'text-success-500' : 'text-primary-500'}`}>
                {progress.toFixed(0)}%
              </span>
            )}
          </div>
          {goal.target_amount && (
            <div className="h-1 bg-slate-100 dark:bg-slate-700/80 rounded-full overflow-hidden">
              <motion.div
                className={`h-full rounded-full bg-gradient-to-r ${barGradient}`}
                initial={{ width: 0 }}
                animate={{ width: `${progress}%` }}
                transition={{ duration: 0.9, delay: index * 0.06, ease: 'easeOut' }}
              />
            </div>
          )}
        </div>

        {/* Deadline */}
        {goal.target_date && (
          <div className="flex items-center gap-1 text-[10px] text-slate-400 mb-2">
            <Calendar className="w-2.5 h-2.5" />
            {format(new Date(goal.target_date), 'MMM dd, yyyy')}
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-around pt-2 border-t border-slate-100 dark:border-slate-700/50">
          {[
            { icon: Plus,  onClick: onAddMoney,          cls: 'bg-primary-500 hover:bg-primary-600',                          iconCls: 'text-white' },
            { icon: Eye,   onClick: onManageAllocations, cls: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600', iconCls: 'text-slate-500 dark:text-slate-400' },
            { icon: Edit2, onClick: onEdit,              cls: 'bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600', iconCls: 'text-slate-500 dark:text-slate-400' },
            { icon: Trash2,onClick: onDelete,            cls: 'bg-red-100 dark:bg-red-900/30 hover:bg-red-200 dark:hover:bg-red-900/50',  iconCls: 'text-red-500 dark:text-red-400' },
          ].map(({ icon: Icon, onClick, cls, iconCls }) => (
            <div
              key={iconCls + cls}
              onClick={onClick}
              className={`w-7 h-7 rounded-full flex items-center justify-center transition-colors cursor-pointer flex-shrink-0 ${cls}`}
              style={{ minHeight: 28, minWidth: 28 }}
            >
              <Icon className={`w-3.5 h-3.5 ${iconCls}`} />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  )
}
