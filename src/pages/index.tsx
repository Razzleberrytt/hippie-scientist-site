import Head from 'next/head'
import Link from 'next/link'

export default function Home() {
  return (
    <>
      <Head>
        <title>The Hippie Scientist</title>
        <meta name='description' content='Science-first harm reduction for psychoactive botany.' />
      </Head>
      <main className='mx-auto max-w-4xl px-4 py-12 text-center'>
        <h1 className='text-4xl font-extrabold text-slate-900'>The Hippie Scientist</h1>
        <p className='mt-4 text-lg text-slate-600'>
          Evidence-aware profiles for herbs, compounds, mechanisms, and safety.
        </p>
        <div className='mt-8 flex justify-center gap-4'>
          {/* Explicit next/link prefetching to reduce latency */}
          <Link
            href='/compounds/thca'
            prefetch={true}
            className='rounded-full bg-emerald-600 px-6 py-2 text-sm font-semibold text-white hover:bg-emerald-700 transition'
          >
            Test Compound Details
          </Link>
        </div>
      </main>
    </>
  )
}
