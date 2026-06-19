import Skeleton from '../../src/components/ui/Skeleton'

export default function EvidenceCardSkeleton() {
  return (
    <article
      aria-label="Loading evidence card"
      className="space-y-3 rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm"
    >
      <div className="flex items-center gap-2">
        <Skeleton variant="line" className="h-5 w-24 rounded-full" />
        <Skeleton variant="line" className="h-4 w-16" />
      </div>
      <Skeleton variant="line" className="h-5 w-3/4 max-w-sm" />
      <Skeleton variant="line" className="h-3 w-full" />
      <Skeleton variant="line" className="h-3 w-11/12" />
      <Skeleton variant="line" className="h-8 w-32 rounded-full" />
    </article>
  )
}