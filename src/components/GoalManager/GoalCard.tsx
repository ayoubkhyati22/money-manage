import { Goal } from '../../lib/supabase'
import { Target, Calendar, Tag, CreditCard as Edit2, Trash2, DollarSign, Settings, Eye } from 'lucide-react'
import { format } from 'date-fns'

interface GoalCardProps {
  goal: Goal
  currentAmount: number
  onEdit: () => void
  onDelete: () => void
  onAddMoney: () => void
  onManageAllocations: () => void
}

export function GoalCard({ goal, currentAmount, onEdit, onDelete, onAddMoney, onManageAllocations }: GoalCardProps) {
  const progress = goal.target_amount ? (currentAmount / goal.target_amount) * 100 : 0

  return (
    <div className="border border-gray-200 dark:border-dark-600 rounded-lg p-4 hover:shadow-md transition-shadow bg-white dark:bg-dark-800">
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center space-x-3">
          <div className="flex items-center justify-center w-10 h-10 bg-orange-100 dark:bg-orange-900/30 rounded-lg">
            <Target className="w-5 h-5 text-orange-600 dark:text-orange-400" />
          </div>
          <div>
            <h4 className="font-semibold text-gray-900 dark:text-dark-100">{goal.name}</h4>
            {goal.category && (
              <div className="flex items-center space-x-1 mt-1">
                <Tag className="w-3 h-3 text-gray-400 dark:text-dark-400" />
                <span className="text-xs text-gray-500 dark:text-dark-400 bg-gray-100 dark:bg-dark-600 px-2 py-1 rounded-full">
                  {goal.category}
                </span>
              </div>
            )}
            {goal.target_date && (
              <div className="flex items-center space-x-1 text-sm text-gray-500 dark:text-dark-400 mt-1">
                <Calendar className="w-3 h-3" />
                <span>{format(new Date(goal.target_date), 'MMM dd, yyyy')}</span>
              </div>
            )}
          </div>
        </div>
        <div className="flex items-center space-x-1">
          <button
            onClick={onManageAllocations}
            className="p-1 text-gray-400 dark:text-dark-400 hover:text-purple-600 dark:hover:text-primary-400 transition-colors"
            title="Manage Allocations"
          >
            <Settings className="w-4 h-4" />
          </button>
          <button
            onClick={onEdit}
            className="p-1 text-gray-400 dark:text-dark-400 hover:text-blue-600 dark:hover:text-primary-400 transition-colors"
          >
            <Edit2 className="w-4 h-4" />
          </button>
          <button
            onClick={onDelete}
            className="p-1 text-gray-400 dark:text-dark-400 hover:text-red-600 dark:hover:text-red-400 transition-colors"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-3">
        <div>
          <p className="text-2xl font-bold text-gray-900 dark:text-dark-100">{currentAmount.toFixed(2)} MAD</p>
          {goal.target_amount && (
            <p className="text-sm text-gray-500 dark:text-dark-400">of {Number(goal.target_amount).toFixed(2)} MAD</p>
          )}
        </div>

        {goal.target_amount && (
          <div>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-600 dark:text-dark-300">Progress</span>
              <span className="text-gray-600 dark:text-dark-300">{progress.toFixed(1)}%</span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-dark-600 rounded-full h-2">
              <div
                className="bg-emerald-500 dark:bg-primary-500 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, progress)}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {goal.notes && (
          <p className="text-sm text-gray-600 dark:text-dark-400 italic">"{goal.notes}"</p>
        )}

        <div className="flex space-x-2">
          <button
            onClick={onAddMoney}
            className="flex-1 flex items-center justify-center space-x-2 bg-emerald-50 dark:bg-primary-900/30 hover:bg-emerald-100 dark:hover:bg-primary-900/50 text-emerald-700 dark:text-primary-400 px-3 py-2 rounded-lg transition-colors"
          >
            <DollarSign className="w-4 h-4" />
            <span>Add Money</span>
          </button>

          <button
            onClick={onManageAllocations}
            className="flex items-center justify-center bg-purple-50 dark:bg-purple-900/30 hover:bg-purple-100 dark:hover:bg-purple-900/50 text-purple-700 dark:text-purple-400 px-3 py-2 rounded-lg transition-colors"
            title="View Allocations"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  )
}
