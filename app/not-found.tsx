import Link from 'next/link'

export default function NotFound() {
  return (
    <main className='mx-auto max-w-4xl px-6 py-16'>
      <div className='rounded-3xl border border-neutral-200 bg-white/[0.92] p-8 text-ink shadow-sm dark:border-white/10 dark:bg-white/[0.03] dark:text-white sm:p-10'>
        <div className='inline-flex rounded-full border border-neutral-200 bg-neutral-100 px-4 py-1 text-xs uppercase tracking-[0.2em] text-stone-600 dark:border-white/10 dark:bg-white/[0.04] dark:text-stone-400'>
          The Hippie Scientist
        </div>

        <p className='mt-6 text-sm font-medium uppercase tracking-[0.2em] text-neutral-500 dark:text-white/50'>
          404
        </p>

        <h1 className='mt-3 text-4xl font-bold tracking-tight sm:text-5xl'>
          Page not found
        </h1>

        <p className='mt-4 max-w-2xl text-base leading-7 text-neutral-700 dark:text-white/75'>
          The page you tried to open may have moved, may still be generating,
          or may no longer exist in the current scientific index.
        </p>

        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            href='/'
            className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90 dark:bg-white'
          >
            Return home
          </Link>

          <Link
            href='/herbs'
            className='rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-black/[0.03] dark:border-white/15 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/5'
          >
            Explore herbs
          </Link>

          <Link
            href='/compounds'
            className='rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-black/[0.03] dark:border-white/15 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/5'
          >
            Explore compounds
          </Link>

          <Link
            href='/topics'
            className='rounded-full border border-neutral-300 px-5 py-3 text-sm font-semibold text-ink transition hover:bg-black/[0.03] dark:border-white/15 dark:text-white dark:hover:border-white/30 dark:hover:bg-white/5'
          >
            Browse topics
          </Link>
        </div>
      </div>
    </main>
  )
}
