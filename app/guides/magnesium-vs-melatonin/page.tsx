import { buildPageMetadata } from '@/lib/seo'
import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = buildPageMetadata({
  title: 'Magnesium vs Melatonin | Guide',
  description: 'Educational comparison of magnesium and melatonin for sleep routines, timing, and practical selection.',
  path: '/guides/magnesium-vs-melatonin/',
})

export default function Page() {
  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Sleep comparison</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Magnesium vs Melatonin</h1>
        <p className="detail-reading mt-4 text-muted">These are different tools: magnesium is often part of nightly relaxation routines, while melatonin is usually framed around sleep timing and schedule shifts.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2">
        <article className="card-premium p-5"><h2 className="text-xl font-semibold text-ink">Magnesium</h2><p className="mt-2 text-sm text-muted">Commonly explored for relaxation support and muscle tension context.</p></article>
        <article className="card-premium p-5"><h2 className="text-xl font-semibold text-ink">Melatonin</h2><p className="mt-2 text-sm text-muted">Often used for sleep schedule alignment rather than broad stress support.</p></article>
      </section>
      <div className="flex gap-4">
        <Link href="/guides/best-supplements-for-sleep" className="text-sm font-medium text-emerald-700 hover:underline">Top sleep aids</Link>
        <Link href="/compare/magnesium-vs-melatonin" className="text-sm font-medium text-emerald-700 hover:underline">Full comparison</Link>
      </div>
    </main>
  )
}
