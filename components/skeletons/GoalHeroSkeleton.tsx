import Skeleton from '@/components/ui/Skeleton'

export default function GoalHeroSkeleton() {
  return (
    <section
      aria-label="Loading goal page"
      className="space-y-4 rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8"
    >
      <Skeleton variant="line" className="h-3 w-28" />
      <Skeleton variant="line" className="h-10 w-full max-w-xl" />
      <Skeleton variant="line" className="h-4 w-full max-w-2xl" />
      <Skeleton variant="line" className="h-4 w-4/5 max-w-xl" />
    </section>
  )
}