import { Goal } from '../../lib/supabase'
import { Target, Calendar, Tag, Edit2, Trash2, Plus, Eye, MoreVertical, Sparkles } from 'lucide-react'
import { format } from 'date-fns'
import { motion } from 'framer-motion'
import { useState } from 'react'

interface GoalCardProps {
  goal: Goal
  index: number
  currentAmount: number
  onEdit: () => void
  onDelete: () => void
  onAddMoney: () => void
  onManageAllocations: () => void
}

export function GoalCard({ goal, index, currentAmount, onEdit, onDelete, onAddMoney, onManageAllocations }: GoalCardProps) {
  const [showMenu, setShowMenu] = useState(false)
  const progress = goal.target_amount ? Math.min((currentAmount / goal.target_amount) * 100, 100) : 0
  const isCompleted = progress >= 100

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.1 }}
      className="group relative bg-white dark:bg-slate-800 rounded-2xl p-5 border border-slate-200 dark:border-slate-700 hover:shadow-lg hover:border-slate-300 dark:hover:border-slate-600 transition-all"
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${
            isCompleted
              ? 'bg-success-100 dark:bg-success-900/30'
              : 'bg-primary-100 dark:bg-primary-900/30'
          }`}>
            <Target className={`w-5 h-5 ${
              isCompleted
                ? 'text-success-600 dark:text-success-400'
                : 'text-primary-600 dark:text-primary-400'
            }`} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-semibold text-slate-800 dark:text-white truncate">{goal.name}</h4>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-medium bg-success-100 dark:bg-success-900/30 text-success-700 dark:text-success-300">
                  <Sparkles className="w-3 h-3" />
                  Done
                </span>
              )}
            </div>
            {goal.category && (
              <div className="flex items-center gap-1 mt-1">
                <Tag className="w-3 h-3 text-slate-400" />
                <span className="text-xs text-slate-500 dark:text-slate-400">{goal.category}</span>
              </div>
            )}
          </div>
        </div>

        {/* Menu */}
        <div className="relative">
          <button
            onClick={() => setShowMenu(!showMenu)}
            className="p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors"
          >
            <MoreVertical className="w-4 h-4 text-slate-400" />
          </button>

          {showMenu && (
            <>
              <div className="fixed inset-0 z-10" onClick={() => setShowMenu(false)} />
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="absolute right-0 top-full mt-1 bg-white dark:bg-slate-800 rounded-xl shadow-lg border border-slate-200 dark:border-slate-700 py-1 z-20 min-w-[140px]"
              >
                <button
                  onClick={() => { onManageAllocations(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Eye className="w-4 h-4" />
                  View Details
                </button>
                <button
                  onClick={() => { onEdit(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700"
                >
                  <Edit2 className="w-4 h-4" />
                  Edit
                </button>
                <button
                  onClick={() => { onDelete(); setShowMenu(false); }}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-danger-600 dark:text-danger-400 hover:bg-danger-50 dark:hover:bg-danger-900/20"
                >
                  <Trash2 className="w-4 h-4" />
                  Delete
                </button>
              </motion.div>
            </>
          )}
        </div>
      </div>

      {/* Amount */}
      <div className="mb-4">
        <p className="text-2xl font-bold text-slate-800 dark:text-white">
          {currentAmount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
          <span className="text-sm font-medium text-slate-500 dark:text-slate-400 ml-1">MAD</span>
        </p>
        {goal.target_amount && (
          <p className="text-sm text-slate-500 dark:text-slate-400">
            of {Number(goal.target_amount).toLocaleString('en-US', { minimumFractionDigits: 2 })} MAD
          </p>
        )}
      </div>

      {/* Progress */}
      {goal.target_amount && (
        <div className="mb-4">
          <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1.5">
            <span>Progress</span>
            <span className="font-medium">{progress.toFixed(1)}%</span>
          </div>
          <div className="h-2 bg-slate-100 dark:bg-slate-700 rounded-full overflow-hidden">
            <motion.div
              className={`h-full rounded-full ${
                isCompleted
                  ? 'bg-gradient-to-r from-success-500 to-success-400'
                  : 'bg-gradient-to-r from-primary-500 to-accent-500'
              }`}
              initial={{ width: 0 }}
              animate={{ width: `${progress}%` }}
              transition={{ duration: 0.8, delay: index * 0.1 }}
            />
          </div>
        </div>
      )}

      {/* Target Date */}
      {goal.target_date && (
        <div className="flex items-center gap-1.5 text-xs text-slate-500 dark:text-slate-400 mb-4">
          <Calendar className="w-3.5 h-3.5" />
          <span>Target: {format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
        </div>
      )}

      {/* Notes */}
      {goal.notes && (
        <p className="text-xs text-slate-500 dark:text-slate-400 italic line-clamp-2 mb-4">
          "{goal.notes}"
        </p>
      )}

      {/* Actions */}
      <div className="flex gap-2">
        <button
          onClick={onAddMoney}
          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-xl bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 hover:bg-primary-100 dark:hover:bg-primary-900/30 transition-colors text-sm font-medium"
        >
          <Plus className="w-4 h-4" />
          Add Money
        </button>
        <button
          onClick={onManageAllocations}
          className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600 transition-colors"
          title="View allocations"
        >
          <Eye className="w-4 h-4" />
        </button>
      </div>
    </motion.div>
  )
}
