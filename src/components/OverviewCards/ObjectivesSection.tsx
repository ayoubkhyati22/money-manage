import { ObjectiveWithAmount } from '../../lib/supabase'
import { Target } from 'lucide-react'
import { format } from 'date-fns'
import { PaginationControls } from './PaginationControls'

interface ObjectivesSectionProps {
  objectives: ObjectiveWithAmount[]
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
  currentObjectives: ObjectiveWithAmount[]
  startIndex: number
  endIndex: number
  totalCount: number
}

export function ObjectivesSection({
  objectives,
  currentPage,
  totalPages,
  onPageChange,
  currentObjectives,
  startIndex,
  endIndex,
  totalCount
}: ObjectivesSectionProps) {
  return (
    <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 overflow-hidden">
      <div className="bg-gradient-to-r from-primary-50 to-primary-100 dark:from-primary-900/30 dark:to-primary-800/30 p-6 border-b border-primary-200 dark:border-dark-600">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-xl font-semibold text-dark-500 dark:text-dark-100">Objectives Overview</h3>
            <p className="text-sm text-dark-400 dark:text-dark-300 mt-1">Your financial goals</p>
          </div>
          {totalCount > 0 && (
            <div className="text-right">
              <p className="text-sm font-medium text-dark-500 dark:text-dark-200">
                {totalCount} objective{totalCount !== 1 ? 's' : ''}
              </p>
              <p className="text-xs text-dark-400 dark:text-dark-300">
                Showing {startIndex + 1}-{Math.min(endIndex, totalCount)}
              </p>
            </div>
          )}
        </div>
      </div>
      <div className="p-6">
        {objectives.length === 0 ? (
          <div className="text-center py-12">
            <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full mx-auto mb-6">
              <Target className="w-10 h-10 text-primary-600 dark:text-primary-400" />
            </div>
            <p className="text-dark-500 dark:text-dark-200 text-lg font-medium">No objectives created yet</p>
            <p className="text-sm text-dark-400 dark:text-dark-300 mt-2">Start by creating your first financial goal</p>
          </div>
        ) : (
          <>
            <div className="p-2">
              <div className="flex flex-wrap gap-4">
                {currentObjectives.map((objective) => {
                  const progress = objective.target_amount
                    ? (objective.total_amount / objective.target_amount) * 100
                    : 0

                  return (
                    <div
                      key={objective.id}
                      className="group relative bg-gradient-to-br from-primary-50 to-mint-50 dark:from-primary-900/20 dark:to-mint-900/20 border border-primary-200 dark:border-dark-600 rounded-xl p-5 hover:shadow-lg transition-all duration-300 hover:scale-102 w-full md:w-[calc(50%-0.5rem)]"
                    >
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center space-x-3 flex-1 min-w-0">
                          <div className="flex items-center justify-center w-12 h-12 bg-gradient-to-br from-primary-400 to-primary-600 rounded-xl shadow-md group-hover:shadow-lg transition-shadow">
                            <Target className="w-6 h-6 text-white" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="font-semibold text-dark-600 dark:text-dark-100 text-lg truncate group-hover:text-primary-700 dark:group-hover:text-primary-300 transition-colors">
                              {objective.name}
                            </h4>
                            {objective.category && (
                              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200 mt-1">
                                {objective.category}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <div className="mb-4">
                        <div className="flex items-baseline space-x-2">
                          <span className="text-2xl font-semibold text-dark-600 dark:text-dark-100">
                            {objective.total_amount.toFixed(2)}
                          </span>
                          <span className="text-sm font-medium text-dark-400 dark:text-dark-300">MAD</span>
                        </div>
                        {objective.target_amount && (
                          <p className="text-sm text-dark-400 dark:text-dark-300 mt-1">
                            of {Number(objective.target_amount).toFixed(2)} MAD target
                          </p>
                        )}
                      </div>

                      {objective.target_amount && (
                        <div className="mb-4">
                          <div className="flex justify-between items-center mb-2">
                            <span className="text-sm font-medium text-dark-500 dark:text-dark-200">Progress</span>
                            <span className="text-sm font-semibold text-primary-600 dark:text-primary-400">
                              {progress.toFixed(1)}%
                            </span>
                          </div>
                          <div className="w-full bg-primary-100 dark:bg-dark-700 rounded-full h-3 overflow-hidden">
                            <div
                              className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500 ease-out shadow-sm"
                              style={{
                                width: `${Math.min(100, progress)}%`
                              }}
                            ></div>
                          </div>
                          {progress >= 100 && (
                            <div className="flex items-center space-x-1 mt-2">
                              <div className="w-2 h-2 bg-primary-500 dark:bg-primary-400 rounded-full animate-pulse"></div>
                              <span className="text-xs font-medium text-primary-600 dark:text-primary-400">Goal Achieved!</span>
                            </div>
                          )}
                        </div>
                      )}

                      {objective.target_date && (
                        <div className="flex items-center space-x-2 text-sm text-dark-400 dark:text-dark-300">
                          <div className="w-4 h-4 rounded-full bg-primary-200 dark:bg-primary-800 flex items-center justify-center">
                            <div className="w-1.5 h-1.5 bg-primary-600 dark:bg-primary-400 rounded-full"></div>
                          </div>
                          <span>Due: {format(new Date(objective.target_date), 'MMM dd, yyyy')}</span>
                        </div>
                      )}

                      {objective.notes && (
                        <div className="mt-3 p-3 bg-white/70 dark:bg-dark-700/70 rounded-lg border border-primary-100 dark:border-dark-600">
                          <p className="text-xs text-dark-500 dark:text-dark-300 italic line-clamp-2">
                            "{objective.notes}"
                          </p>
                        </div>
                      )}

                      <div className="absolute inset-0 bg-gradient-to-br from-primary-400 to-primary-600 opacity-0 group-hover:opacity-5 rounded-xl transition-opacity duration-300 pointer-events-none"></div>
                    </div>
                  )
                })}
              </div>
            </div>

            <PaginationControls
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
              itemName="objectives"
            />
          </>
        )}
      </div>
    </div>
  )
}
