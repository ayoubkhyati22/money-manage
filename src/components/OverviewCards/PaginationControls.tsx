export function PaginationControls({
  currentPage,
  totalPages,
  onPageChange
}: PaginationControlsProps) {
  if (totalPages <= 1) return null

  return (
    <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-200 dark:border-dark-600">
      <div className="text-xs text-dark-400 dark:text-dark-300">
        {currentPage}/{totalPages}
      </div>
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage === 1}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-dark-600 rounded disabled:opacity-50 transition-colors"
        >
          ‹
        </button>

        <div className="flex space-x-1">
          {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
            <button
              key={page}
              onClick={() => onPageChange(page)}
              className={`px-2 py-1 text-xs rounded transition-colors ${
                page === currentPage
                  ? 'bg-primary-500 text-white'
                  : 'border border-gray-300 dark:border-dark-600 hover:bg-gray-50 dark:hover:bg-dark-600'
              }`}
            >
              {page}
            </button>
          ))}
        </div>

        <button
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage === totalPages}
          className="px-2 py-1 text-xs border border-gray-300 dark:border-dark-600 rounded disabled:opacity-50 transition-colors"
        >
          ›
        </button>
      </div>
    </div>
  )
}