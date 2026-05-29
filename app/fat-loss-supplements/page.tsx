import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Supplements for Fat Loss | The Hippie Scientist',
  description: 'Science-backed supplements for fat loss. Dosage, effects, and safety.',
}

const comparisons = [
  { href: '/compare/caffeine-vs-l-theanine', label: 'Caffeine vs L-Theanine' },
  { href: '/compare/creatine-vs-beta-alanine', label: 'Creatine vs Beta-Alanine' },
]

export default function Page() {
  return (
    <div className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Category</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Supplements for Fat Loss</h1>
        <p className='mt-4 max-w-2xl text-muted'>Compare fat loss supplements with real-world dosing, timing, and safety considerations. This page helps you move from individual compounds into a complete fat-loss stack strategy.</p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/best-supplements-for-fat-loss' className='inline-flex min-h-11 items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm'>Explore Fat Loss Supplements</Link>
          <Link href='/stacks/fat-loss' className='inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-white/50 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'>View Fat Loss Stack</Link>
        </div>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related Comparisons</h2>
        <div className='mt-4 flex flex-wrap gap-3'>
          {comparisons.map(link => (
            <Link key={link.href} href={link.href} className='rounded-xl border border-brand-900/10 px-3 py-2 text-sm text-emerald-700 hover:bg-stone-50/50 hover:border-brand-900/20 transition'>
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

