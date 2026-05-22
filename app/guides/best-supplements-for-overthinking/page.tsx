import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Best Supplements for Overthinking | Guide',
  description: 'Educational framework for choosing calming supplements when overthinking and mental noise are the main issue.',
}

const picks = [
  {
    name: 'L-theanine',
    why: 'Often used for calm focus, especially when stress drives mental loops.',
    href: '/compounds/l-theanine',
  },
  {
    name: 'Magnesium',
    why: 'Can support evening relaxation and sleep quality routines.',
    href: '/compounds/magnesium',
  },
  {
    name: 'Lemon balm',
    why: 'Traditional calming herb commonly used at night.',
    href: '/herbs/lemon-balm',
  },
]

export default function Page() {
  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Decision guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Best Supplements for Overthinking</h1>
        <p className="detail-reading mt-4 text-muted">
          This is an educational guide, not treatment advice. Focus on daily patterns (sleep, caffeine timing, stress load) before expanding stacks.
        </p>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        {picks.map((pick) => (
          <article key={pick.name} className="card-premium p-5">
            <h2 className="text-xl font-semibold text-ink">{pick.name}</h2>
            <p className="mt-2 text-sm text-muted">{pick.why}</p>
            <Link href={pick.href} className="mt-3 inline-block text-sm font-medium text-emerald-700 hover:underline">
              Read profile
            </Link>
          </article>
        ))}
      </section>
    </main>
  )
}
