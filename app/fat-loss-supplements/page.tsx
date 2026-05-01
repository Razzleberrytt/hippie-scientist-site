import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Supplements for Fat Loss | The Hippie Scientist',
  description: 'Science-backed supplements for fat loss. Dosage, effects, and safety.',
}

export default function Page() {
  return (
    <div className='space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8'>
      <h1 className='text-4xl font-black text-white'>Best Supplements for Fat Loss</h1>
      <p className='max-w-2xl text-white/80'>Compare fat loss supplements with real-world dosing, timing, and safety considerations. This page helps you move from individual compounds into a complete fat-loss stack strategy.</p>
      <Link href='/goals/fat-loss' className='inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black transition hover:bg-emerald-200 active:scale-[0.99]'>Explore Fat Loss Supplements</Link>
    </div>
  )
}
