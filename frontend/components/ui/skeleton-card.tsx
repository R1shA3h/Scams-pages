export function SkeletonCard() {
  return (
    <div className="rounded-xl border bg-card p-6 shadow animate-pulse">
      <div className="h-6 w-1/3 bg-gray-200 rounded mb-4"></div>
      <div className="h-8 w-2/3 bg-gray-200 rounded mb-2"></div>
      <div className="h-4 w-1/2 bg-gray-200 rounded"></div>
    </div>
  )
} 