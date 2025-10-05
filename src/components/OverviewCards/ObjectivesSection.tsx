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
    <div>
      {/* Summary Header */}
      {totalCount > 0 && (
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-lg sm:text-xl font-semibold text-dark-500 dark:text-dark-100">
            Your Financial Goals
          </h3>
          <div className="text-right">
            <p className="text-xs sm:text-sm font-medium text-dark-500 dark:text-dark-200">
              {totalCount} objective{totalCount !== 1 ? 's' : ''}
            </p>
            <p className="text-[10px] sm:text-xs text-dark-400 dark:text-dark-300">
              Showing {startIndex + 1}-{Math.min(endIndex, totalCount)}
            </p>
          </div>
        </div>
      )}

      {objectives.length === 0 ? (
        <div className="text-center py-8 sm:py-12">
          <div className="flex items-center justify-center w-16 h-16 sm:w-20 sm:h-20 bg-gradient-to-br from-primary-100 to-primary-200 dark:from-primary-900/30 dark:to-primary-800/30 rounded-full mx-auto mb-4 sm:mb-6">
            <Target className="w-8 h-8 sm:w-10 sm:h-10 text-primary-600 dark:text-primary-400" />
          </div>
          <p className="text-dark-500 dark:text-dark-200 text-base sm:text-lg font-medium">No objectives created yet</p>
          <p className="text-xs sm:text-sm text-dark-400 dark:text-dark-300 mt-2">Start by creating your first financial goal</p>
        </div>
      ) : (
        <>
          {/* Mobile Compact List */}
          <div className="sm:hidden space-y-2">
            {currentObjectives.map((objective) => {
              const progress = objective.target_amount
                ? (objective.total_amount / objective.target_amount) * 100
                : 0

              return (
                <div
                  key={objective.id}
                  className="bg-gradient-to-br from-primary-50 to-mint-50 dark:from-primary-900/20 dark:to-mint-900/20 border border-primary-200 dark:border-dark-600 rounded-lg p-3 hover:shadow-md transition-all duration-300"
                >
                  <div className="flex items-start justify-between mb-2">
                    <div className="flex items-center space-x-2 flex-1 min-w-0">
                      <div className="flex items-center justify-center w-8 h-8 bg-gradient-to-br from-primary-400 to-primary-600 rounded-lg shadow-sm flex-shrink-0">
                        <Target className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-semibold text-dark-600 dark:text-dark-100 text-sm truncate">
                          {objective.name}
                        </h4>
                        {objective.category && (
                          <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[9px] font-medium bg-primary-100 dark:bg-primary-900/40 text-primary-800 dark:text-primary-200">
                            {objective.category}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="text-right flex-shrink-0 ml-2">
                      <p className="text-sm font-semibold text-dark-600 dark:text-dark-100">
                        {objective.total_amount.toFixed(2)}
                      </p>
                      <p className="text-[10px] text-dark-400 dark:text-dark-300">MAD</p>
                    </div>
                  </div>

                  {objective.target_amount && (
                    <div className="mt-2">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] text-dark-500 dark:text-dark-300">
                          Target: {Number(objective.target_amount).toFixed(2)} MAD
                        </span>
                        <span className="text-[10px] font-semibold text-primary-600 dark:text-primary-400">
                          {progress.toFixed(0)}%
                        </span>
                      </div>
                      <div className="w-full bg-primary-100 dark:bg-dark-700 rounded-full h-1.5 overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-primary-400 to-primary-600 rounded-full transition-all duration-500 ease-out"
                          style={{
                            width: `${Math.min(100, progress)}%`
                          }}
                        ></div>
                      </div>
                    </div>
                  )}

                  {objective.target_date && (
                    <div className="flex items-center space-x-1 text-[10px] text-dark-400 dark:text-dark-300 mt-2">
                      <div className="w-1 h-1 rounded-full bg-primary-400 dark:bg-primary-500"></div>
                      <span>Due: {format(new Date(objective.target_date), 'MMM dd, yyyy')}</span>
                    </div>
                  )}
                </div>
              )
            })}
          </div>

          {/* Desktop Larger Cards */}
          <div className="hidden sm:block">
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
  )
}