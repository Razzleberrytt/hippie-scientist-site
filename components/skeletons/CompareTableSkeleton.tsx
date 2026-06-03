import Skeleton from '@/components/ui/Skeleton'

export default function CompareTableSkeleton() {
  return (
    <div
      aria-label="Loading comparison table"
      className="space-y-4 rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm"
    >
      <div className="flex flex-wrap gap-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="line" className="h-9 w-24" />
        ))}
      </div>
      <Skeleton variant="line" className="h-10 w-full max-w-md" />
      <div className="space-y-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} variant="block" className="h-14 w-full" />
        ))}
      </div>
    </div>
  )
}