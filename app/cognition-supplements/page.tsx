import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Supplements for Cognition | The Hippie Scientist',
  description: 'Science-backed supplements for cognition. Dosage, effects, and safety.',
}

export default function Page() {
  return (
    <div className='space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8'>
      <h1 className='text-4xl font-black text-white'>Best Supplements for Cognition</h1>
      <p className='max-w-2xl text-white/80'>Explore cognitive support supplements for focus, memory, and mental performance. This page connects core compounds with a structured cognition stack.</p>
      <Link href='/goals/cognition' className='inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black transition hover:bg-emerald-200 active:scale-[0.99]'>Explore Cognition Supplements</Link>
    </div>
  )
}
