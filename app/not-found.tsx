import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='mx-auto max-w-4xl px-6 py-16'>
      <div className='rounded-3xl border border-stone-200 bg-stone-50/50 p-8 sm:p-10 shadow-sm'>
        <div className='inline-flex rounded-full border border-stone-200 bg-stone-100/50 px-4 py-1 text-xs uppercase tracking-[0.2em] text-stone-600 font-medium'>
          The Hippie Scientist
        </div>

        <p className='mt-6 text-sm font-semibold uppercase tracking-[0.2em] text-stone-500'>
          404
        </p>

        <h1 className='mt-3 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl'>
          Page not found
        </h1>

        <p className='mt-4 max-w-2xl text-base leading-7 text-stone-600'>
          The page you tried to open may have moved, may still be generating,
          or may no longer exist in the current scientific index.
        </p>

        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            href='/'
            className='rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm'
          >
            Return home
          </Link>

          <Link
            href='/herbs'
            className='rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            Explore herbs
          </Link>

          <Link
            href='/compounds'
            className='rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            Explore compounds
          </Link>

          <Link
            href='/goals'
            className='rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            Browse goals
          </Link>
        </div>
      </div>
    </div>
  )
}
