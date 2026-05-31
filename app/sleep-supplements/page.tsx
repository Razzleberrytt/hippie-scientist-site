import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Supplements for Sleep | The Hippie Scientist',
  description: 'Science-backed supplements for sleep. Dosage, effects, and safety.',
  alternates: { canonical: '/guides/best-supplements-for-sleep' },
  robots: {
    index: false,
    follow: true,
  },
}

const comparisonLinks = [
  { href: '/compare/glycine-vs-magnesium', label: 'Magnesium vs Glycine' },
  { href: '/compare/caffeine-vs-l-theanine', label: 'Caffeine vs L-Theanine' },
]

export default function Page() {
  return (
    <div className='container-page py-10 space-y-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Category</p>
        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>Best Supplements for Sleep</h1>
        <p className='mt-4 max-w-2xl text-muted'>Compare science-backed sleep supplements with practical dosage, timing, and safety context. Start with the full sleep goal guide, then drill into the stack and individual compounds.</p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/goals/sleep' className='inline-flex min-h-11 items-center rounded-full bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm'>Explore Sleep Supplements</Link>
          <Link href='/stacks/sleep' className='inline-flex min-h-11 items-center rounded-full border border-stone-200 bg-white/50 px-5 py-2.5 text-sm font-medium text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'>View Sleep Stack</Link>
        </div>
      </section>

      <section className='card-premium p-6'>
        <h2 className='text-xl font-semibold text-ink'>Related Comparisons</h2>
        <div className='mt-4 flex flex-wrap gap-3'>
          {comparisonLinks.map(link => (
            <Link key={link.href} href={link.href} className='rounded-xl border border-brand-900/10 px-3 py-2 text-sm text-emerald-700 hover:bg-stone-50/50 hover:border-brand-900/20 transition'>
              {link.label}
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}

