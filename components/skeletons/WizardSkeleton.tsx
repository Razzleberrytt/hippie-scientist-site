import Skeleton from '../../src/components/ui/Skeleton'

export default function WizardSkeleton() {
  return (
    <div
      aria-label="Loading tool"
      className="grid gap-6 rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm md:grid-cols-2"
    >
      <div className="space-y-4">
        <Skeleton variant="line" className="h-4 w-32" />
        <Skeleton variant="block" className="h-12 w-full" />
        <Skeleton variant="block" className="h-12 w-full" />
        <Skeleton variant="block" className="h-12 w-full" />
        <Skeleton variant="line" className="h-10 w-40 rounded-full" />
      </div>
      <div className="space-y-3">
        <Skeleton variant="line" className="h-4 w-40" />
        <Skeleton variant="block" className="h-24 w-full" />
        <Skeleton variant="block" className="h-24 w-full" />
        <Skeleton variant="block" className="h-16 w-full" />
      </div>
    </div>
  )
}