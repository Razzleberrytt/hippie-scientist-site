import Link from 'next/link'

export default function NotFound() {
  return (
    <div className='mx-auto max-w-3xl py-10'>
      <div className='rounded-3xl border border-white/10 bg-white/[0.03] p-8 sm:p-10'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          404
        </p>

        <h1 className='mt-3 text-4xl font-bold tracking-tight sm:text-5xl'>
          Page not found
        </h1>

        <p className='mt-4 max-w-2xl text-base leading-7 text-white/75'>
          The page you tried to open does not exist, may have moved, or has not
          been generated yet.
        </p>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link
            href='/'
            className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90'
          >
            Go home
          </Link>

          <Link
            href='/herbs'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Browse herbs
          </Link>

          <Link
            href='/compounds'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Browse compounds
          </Link>

          <Link
            href='/blog'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Read the blog
          </Link>
        </div>
      </div>
    </div>
  )
}
