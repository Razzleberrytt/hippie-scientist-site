import Link from 'next/link'

export default function Page() {
  return (
    <div className='space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8'>
      <h1 className='text-4xl font-black text-white'>Best Supplements for Sleep</h1>
      <p className='max-w-2xl text-white/80'>Compare science-backed sleep supplements with practical dosage, timing, and safety context. Start with the full sleep goal guide, then drill into the stack and individual compounds.</p>
      <Link href='/goals/sleep' className='inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black transition hover:bg-emerald-200 active:scale-[0.99]'>Explore Sleep Supplements</Link>
    </div>
  )
}
