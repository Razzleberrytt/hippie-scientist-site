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
    <div className='mx-auto max-w-3xl py-10'>
      <div className='rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          Something went wrong
        </p>

        <h1 className='mt-3 text-4xl font-bold tracking-tight sm:text-5xl'>
          We hit an unexpected error
        </h1>

        <p className='mt-4 max-w-2xl text-base leading-7 text-white/75'>
          Try the page again. If the problem keeps happening, go back to a main
          section of the site and continue browsing from there.
        </p>

        {error.digest ? (
          <p className='mt-4 text-sm text-white/50'>Reference: {error.digest}</p>
        ) : null}

        <div className='mt-6 flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={reset}
            className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90'
          >
            Try again
          </button>

          <Link
            href='/'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Go home
          </Link>

          <Link
            href='/herbs'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Herbs
          </Link>

          <Link
            href='/compounds'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Compounds
          </Link>
        </div>
      </div>
    </div>
  )
}
