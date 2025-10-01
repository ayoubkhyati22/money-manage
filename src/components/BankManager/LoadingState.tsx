export function LoadingState() {
  return (
    <div className="bg-white/90 dark:bg-dark-800/90 backdrop-blur-sm rounded-2xl shadow-lg border border-mint-200/50 dark:border-dark-600/50 p-8">
      <div className="animate-pulse space-y-4">
        <div className="h-6 bg-gray-200 dark:bg-dark-600 rounded w-1/4"></div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="h-48 bg-gray-200 dark:bg-dark-600 rounded-2xl"></div>
          ))}
        </div>
      </div>
    </div>
  )
}
