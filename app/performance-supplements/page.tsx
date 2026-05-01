import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Supplements for Performance | The Hippie Scientist',
  description: 'Science-backed supplements for performance. Dosage, effects, and safety.',
}

const comparisons = [
  { href: '/compare/creatine-vs-beta-alanine', label: 'Creatine vs Beta-Alanine' },
  { href: '/compare/caffeine-vs-l-theanine', label: 'Caffeine vs L-Theanine' },
]

export default function Page() {
  return (
    <div className='space-y-6 rounded-[2rem] border border-white/10 bg-white/[0.04] p-6 sm:p-8'>
      <h1 className='text-4xl font-black text-white'>Best Supplements for Performance</h1>
      <p className='max-w-2xl text-white/80'>Explore performance supplements for strength, endurance, and training output. This guide connects key compounds with a complete performance stack.</p>
      <div className='flex flex-wrap gap-3'>
        <Link href='/goals/performance' className='inline-flex min-h-11 items-center rounded-2xl bg-emerald-300 px-5 py-2 font-bold text-black transition hover:bg-emerald-200 active:scale-[0.99]'>Explore Performance Supplements</Link>
        <Link href='/stacks/performance' className='inline-flex min-h-11 items-center rounded-2xl border border-white/10 px-5 py-2 font-bold text-white/80 transition hover:bg-white/5 hover:text-white'>View Performance Stack</Link>
      </div>
      <section className='rounded-3xl border border-white/10 bg-black/15 p-5'>
        <h2 className='text-xl font-bold text-white'>Related Comparisons</h2>
        <div className='mt-3 flex flex-wrap gap-3'>
          {comparisons.map(link => <Link key={link.href} href={link.href} className='rounded-xl border border-white/10 px-3 py-2 text-sm text-white/75 hover:bg-white/5'>{link.label}</Link>)}
        </div>
      </section>
    </div>
  )
}
