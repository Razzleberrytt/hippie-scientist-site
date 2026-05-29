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
      <div className='rounded-3xl border border-stone-200 bg-stone-50/50 p-8 sm:p-10 shadow-sm'>
        <p className='text-sm font-semibold uppercase tracking-[0.2em] text-stone-500'>
          Something went wrong
        </p>

        <h1 className='mt-3 text-4xl font-bold tracking-tight text-stone-900 sm:text-5xl'>
          We hit an unexpected error
        </h1>

        <p className='mt-4 max-w-2xl text-base leading-7 text-stone-600'>
          Try the page again. If the problem keeps happening, go back to a main
          section of the site and continue browsing from there.
        </p>

        {error.digest ? (
          <p className='mt-4 text-sm text-stone-500'>Reference: {error.digest}</p>
        ) : null}

        <div className='mt-6 flex flex-wrap gap-3'>
          <button
            type='button'
            onClick={reset}
            className='rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm'
          >
            Try again
          </button>

          <Link
            href='/'
            className='rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            Go home
          </Link>

          <Link
            href='/herbs'
            className='rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            Herbs
          </Link>

          <Link
            href='/compounds'
            className='rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            Compounds
          </Link>
        </div>
      </div>
    </div>
  )
}
