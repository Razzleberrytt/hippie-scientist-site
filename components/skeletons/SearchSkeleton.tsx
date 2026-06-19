import Skeleton from '../../src/components/ui/Skeleton'

export default function SearchSkeleton() {
  return (
    <div aria-label="Loading search" className="space-y-4">
      <Skeleton variant="block" className="h-12 w-full max-w-xl" />
      <div className="grid gap-3 sm:grid-cols-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} variant="block" className="h-20 w-full" />
        ))}
      </div>
    </div>
  )
}