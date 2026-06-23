import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='mx-auto max-w-4xl px-6 py-16'>
      <div className='card-premium p-8 sm:p-10'>
        <div className='identity-kicker'>
          The Hippie Scientist
        </div>

        <p className='eyebrow-label mt-6'>
          404
        </p>

        <h1 className='mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          Page not found
        </h1>

        <p className='mt-4 max-w-2xl text-base leading-7 text-muted'>
          The page you tried to open may have moved, may still be generating,
          or may no longer exist in the current scientific index.
        </p>

        <div className='mt-8 flex flex-wrap gap-3'>
          <Link
            href='/'
            className='button-primary px-5 py-3 text-sm'
          >
            Return home
          </Link>

          <Link
            href='/herbs'
            className='button-secondary px-5 py-3 text-sm'
          >
            Explore herbs
          </Link>

          <Link
            href='/compounds'
            className='button-secondary px-5 py-3 text-sm'
          >
            Explore compounds
          </Link>

          <Link
            href='/goals'
            className='button-secondary px-5 py-3 text-sm'
          >
            Browse goals
          </Link>
        </div>
      </div>
    </div>
  )
}
