'use client'

import Link from 'next/link'
import { useEffect } from 'react'

type ErrorPageProps = {
  error: Error & { digest?: string }
  reset: () => void
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className='mx-auto max-w-3xl py-10 px-4'>
      <div className='card-premium p-8 sm:p-10'>
        <p className='eyebrow-label'>
          Something went wrong
        </p>

        <h1 className='mt-3 font-display text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          We hit an unexpected error
        </h1>

        <p className='mt-4 max-w-2xl text-base leading-7 text-muted'>
          Try the page again. If the problem keeps happening, go back to a main
          section of the site and continue browsing from there.
        </p>

        {error.digest ? (
          <p className='mt-4 text-sm text-muted'>Reference: {error.digest}</p>
        ) : null}

        <div className='mt-6 flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={reset}
            className='button-primary px-5 py-3 text-sm'
          >
            Try again
          </button>

          <Link
            href='/'
            className='button-secondary px-5 py-3 text-sm'
          >
            Go home
          </Link>

          <Link
            href='/herbs/'
            className='button-secondary px-5 py-3 text-sm'
          >
            Herbs
          </Link>

          <Link
            href='/articles/'
            className='button-secondary px-5 py-3 text-sm'
          >
            Articles
          </Link>

          <Link
            href='/compounds/'
            className='button-secondary px-5 py-3 text-sm'
          >
            Compounds
          </Link>
        </div>
      </div>
    </div>
  )
}
