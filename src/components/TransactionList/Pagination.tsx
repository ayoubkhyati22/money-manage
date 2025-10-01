import { ChevronLeft, ChevronRight } from 'lucide-react'
import { PAGE_SIZE } from '../../services/transactionService'

interface PaginationProps {
  page: number
  totalCount: number
  onPageChange: (page: number) => void
}

export function Pagination({ page, totalCount, onPageChange }: PaginationProps) {
  const totalPages = Math.ceil(totalCount / PAGE_SIZE)

  return (
    <nav
      className="bg-white dark:bg-dark-800 px-4 py-3 flex items-center justify-between border-t border-gray-200 dark:border-dark-600 sm:px-6 rounded-b-xl"
      aria-label="Pagination"
    >
      <div className="hidden sm:block">
        <p className="text-sm text-gray-700 dark:text-dark-300">
          Showing <span className="font-medium">{(page - 1) * PAGE_SIZE + 1}</span> to{' '}
          <span className="font-medium">{Math.min(page * PAGE_SIZE, totalCount)}</span> of{' '}
          <span className="font-medium">{totalCount}</span> results
        </p>
      </div>
      <div className="flex-1 flex justify-between sm:justify-end">
        <button
          onClick={() => onPageChange(page - 1)}
          disabled={page === 1}
          className="relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 text-sm font-medium rounded-md text-gray-700 dark:text-dark-200 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          <ChevronLeft className="h-5 w-5 mr-2" /> Previous
        </button>
        <div className="hidden md:flex mx-2 items-center gap-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
            <button
              key={p}
              onClick={() => onPageChange(p)}
              className={`px-3 py-2 text-sm font-medium rounded-md ${
                page === p
                  ? 'bg-blue-600 text-white dark:bg-blue-500'
                  : 'text-gray-700 dark:text-dark-200 hover:bg-gray-100 dark:hover:bg-dark-700'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
        <button
          onClick={() => onPageChange(page + 1)}
          disabled={page === totalPages}
          className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 dark:border-dark-600 text-sm font-medium rounded-md text-gray-700 dark:text-dark-200 bg-white dark:bg-dark-700 hover:bg-gray-50 dark:hover:bg-dark-600 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          Next <ChevronRight className="h-5 w-5 ml-2" />
        </button>
      </div>
    </nav>
  )
}
