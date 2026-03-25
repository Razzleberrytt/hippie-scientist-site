import Skeleton from '@/components/ui/Skeleton'

function SkeletonPill({ className = '' }: { className?: string }) {
  return <Skeleton className={`h-7 rounded-full ${className}`.trim()} />
}

export function HerbDetailSkeleton() {
  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white' aria-busy='true'>
      <Skeleton className='h-10 w-40 rounded-xl' />

      <article className='ds-card-lg mt-4 space-y-6'>
        <header className='space-y-4'>
          <div className='space-y-3'>
            <Skeleton className='h-10 w-2/3' />
            <Skeleton className='h-4 w-1/3' />
          </div>
          <Skeleton className='h-16 rounded-2xl' />
        </header>

        <div className='flex flex-wrap gap-2'>
          <SkeletonPill className='w-24' />
          <SkeletonPill className='w-28' />
          <SkeletonPill className='w-20' />
        </div>

        <div className='space-y-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-11/12' />
          <Skeleton className='h-4 w-10/12' />
        </div>

        <div className='space-y-3 border-t border-white/10 pt-5'>
          <Skeleton className='h-4 w-32' />
          <div className='flex flex-wrap gap-2'>
            <SkeletonPill className='w-28' />
            <SkeletonPill className='w-32' />
            <SkeletonPill className='w-24' />
          </div>
        </div>
      </article>
    </main>
  )
}

export function CompoundDetailSkeleton() {
  return (
    <main className='container mx-auto max-w-4xl px-4 py-8 text-white' aria-busy='true'>
      <Skeleton className='h-10 w-44 rounded-xl' />

      <article className='ds-card-lg mt-4 space-y-6'>
        <header className='space-y-4'>
          <div className='flex items-start justify-between gap-3'>
            <Skeleton className='h-10 w-2/3' />
            <SkeletonPill className='w-28' />
          </div>
          <Skeleton className='h-14 rounded-2xl' />
        </header>

        <div className='flex flex-wrap gap-2'>
          <SkeletonPill className='w-24' />
          <SkeletonPill className='w-20' />
          <SkeletonPill className='w-24' />
        </div>

        <div className='space-y-3'>
          <Skeleton className='h-4 w-24' />
          <Skeleton className='h-4 w-full' />
          <Skeleton className='h-4 w-11/12' />
        </div>

        <div className='space-y-3 border-t border-white/10 pt-5'>
          <Skeleton className='h-4 w-32' />
          <Skeleton className='h-10 w-full rounded-xl' />
          <Skeleton className='h-10 w-5/6 rounded-xl' />
        </div>
      </article>
    </main>
  )
}

export function InteractionReportSkeleton() {
  return (
    <section
      className='space-y-4 rounded-2xl border border-white/10 bg-black/25 p-5'
      aria-busy='true'
      aria-live='polite'
    >
      <Skeleton className='h-7 w-56' />
      <Skeleton className='h-4 w-11/12' />
      <div className='space-y-2'>
        <Skeleton className='h-14 rounded-xl' />
        <Skeleton className='h-14 rounded-xl' />
      </div>
    </section>
  )
}

export function LearningPanelSkeleton() {
  return (
    <div className='space-y-4' aria-busy='true' aria-live='polite'>
      <div className='flex flex-wrap gap-2'>
        <SkeletonPill className='w-28' />
        <SkeletonPill className='w-24' />
        <SkeletonPill className='w-32' />
      </div>
      <Skeleton className='h-48 rounded-2xl' />
      <div className='space-y-2'>
        <Skeleton className='h-4 w-full' />
        <Skeleton className='h-4 w-10/12' />
      </div>
    </div>
  )
}
