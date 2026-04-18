const skeletonBaseClass =
  'rounded bg-white/6 animate-[shimmer_1.8s_ease-in-out_infinite] [background-size:200%_100%] [background-image:linear-gradient(90deg,transparent_25%,rgba(255,255,255,0.06)_50%,transparent_75%)]'

function ShimmerStyles() {
  return (
    <style>
      {`@keyframes shimmer { from { background-position: -200% 0 } to { background-position: 200% 0 } }`}
    </style>
  )
}

function SkeletonBlock({ className = '' }: { className?: string }) {
  return <div className={`${skeletonBaseClass} ${className}`.trim()} />
}

function SkeletonPill({ className = '' }: { className?: string }) {
  return <SkeletonBlock className={`h-7 rounded-full ${className}`.trim()} />
}

export function HerbDetailSkeleton() {
  return (
    <>
      <ShimmerStyles />
      <main className='container mx-auto max-w-4xl px-4 py-8 text-white' aria-busy='true'>
        <article className='ds-card-lg space-y-8'>
          <header className='space-y-3'>
            <SkeletonBlock className='h-10 w-2/3' />
            <SkeletonBlock className='h-4 w-1/3' />
          </header>

          <section className='space-y-4'>
            <SkeletonBlock className='h-5 w-24' />
            <SkeletonBlock className='h-24 w-full rounded-xl' />
          </section>

          <section className='space-y-4'>
            <SkeletonBlock className='h-5 w-28' />
            <SkeletonBlock className='h-20 w-full rounded-xl' />
          </section>

          <section className='space-y-4'>
            <SkeletonBlock className='h-5 w-20' />
            <SkeletonBlock className='h-28 w-full rounded-xl' />
          </section>
        </article>
      </main>
    </>
  )
}

export function CardSkeleton() {
  return <SkeletonBlock className='h-32 w-full rounded-xl' />
}

export function CompoundDetailSkeleton() {
  return (
    <>
      <ShimmerStyles />
      <main className='container mx-auto max-w-4xl px-4 py-8 text-white' aria-busy='true'>
        <article className='ds-card-lg space-y-6'>
          <header className='space-y-4'>
            <div className='flex items-start justify-between gap-3'>
              <SkeletonBlock className='h-10 w-2/3' />
              <SkeletonPill className='w-28' />
            </div>
            <SkeletonBlock className='h-14 rounded-2xl' />
          </header>

          <div className='flex flex-wrap gap-2'>
            <SkeletonPill className='w-24' />
            <SkeletonPill className='w-20' />
            <SkeletonPill className='w-24' />
          </div>

          <div className='space-y-3'>
            <SkeletonBlock className='h-4 w-24' />
            <SkeletonBlock className='h-4 w-full' />
            <SkeletonBlock className='h-4 w-11/12' />
          </div>

          <div className='space-y-3 border-t border-white/10 pt-5'>
            <SkeletonBlock className='h-4 w-32' />
            <SkeletonBlock className='h-10 w-full rounded-xl' />
            <SkeletonBlock className='h-10 w-5/6 rounded-xl' />
          </div>
        </article>
      </main>
    </>
  )
}

export function InteractionReportSkeleton() {
  return (
    <>
      <ShimmerStyles />
      <section
        className='space-y-4 rounded-2xl border border-white/10 bg-black/25 p-5'
        aria-busy='true'
        aria-live='polite'
      >
        <SkeletonBlock className='h-7 w-56' />
        <SkeletonBlock className='h-4 w-11/12' />
        <div className='space-y-2'>
          <SkeletonBlock className='h-14 rounded-xl' />
          <SkeletonBlock className='h-14 rounded-xl' />
        </div>
      </section>
    </>
  )
}

export function LearningPanelSkeleton() {
  return (
    <>
      <ShimmerStyles />
      <div className='space-y-4' aria-busy='true' aria-live='polite'>
        <div className='flex flex-wrap gap-2'>
          <SkeletonPill className='w-28' />
          <SkeletonPill className='w-24' />
          <SkeletonPill className='w-32' />
        </div>
        <SkeletonBlock className='h-48 rounded-2xl' />
        <div className='space-y-2'>
          <SkeletonBlock className='h-4 w-full' />
          <SkeletonBlock className='h-4 w-10/12' />
        </div>
      </div>
    </>
  )
}
