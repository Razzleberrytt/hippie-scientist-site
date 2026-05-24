export default function Loading() {
  return (
    <main role='status' aria-live='polite' aria-busy='true' className='min-h-screen bg-stone-950 px-6 py-16 text-stone-100'>
      <div className='mx-auto max-w-5xl space-y-8'>
        <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
          <div aria-hidden='true' className='h-4 w-28 animate-pulse rounded-full bg-white/10' />
          <div aria-hidden='true' className='mt-4 h-10 w-72 animate-pulse rounded-2xl bg-white/10 sm:w-96' />
          <div aria-hidden='true' className='mt-4 h-4 w-full max-w-2xl animate-pulse rounded-full bg-white/10' />
          <div aria-hidden='true' className='mt-3 h-4 w-full max-w-xl animate-pulse rounded-full bg-white/10' />

          <p className='mt-6 text-sm tracking-wide text-stone-400'>
            Loading evidence-driven research…
          </p>
        </section>

        <section className='grid gap-4 sm:grid-cols-2 xl:grid-cols-3'>
          {Array.from({ length: 6 }).map((_, index) => (
            <div
              key={index}
              aria-hidden='true' className='rounded-3xl border border-white/10 bg-white/[0.03] p-6'
            >
              <div className='h-3 w-24 animate-pulse rounded-full bg-white/10' />
              <div className='mt-4 h-7 w-2/3 animate-pulse rounded-2xl bg-white/10' />
              <div className='mt-4 h-4 w-full animate-pulse rounded-full bg-white/10' />
              <div className='mt-3 h-4 w-11/12 animate-pulse rounded-full bg-white/10' />
              <div className='mt-3 h-4 w-3/4 animate-pulse rounded-full bg-white/10' />
              <div className='mt-6 h-4 w-28 animate-pulse rounded-full bg-white/10' />
            </div>
          ))}
        </section>
      </div>
    </main>
  )
}
