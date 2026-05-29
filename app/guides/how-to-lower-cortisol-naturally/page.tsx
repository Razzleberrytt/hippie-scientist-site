import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'How to Lower Cortisol Naturally | Guide',
  description: 'Educational guide on stress-load reduction strategies and herbs often discussed for cortisol-context support.',
}

export default function Page() {
  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Stress education</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">How to Lower Cortisol Naturally</h1>
        <p className="detail-reading mt-4 text-muted">Cortisol follows daily rhythms. Use this as a decision guide for sleep, routine stressors, and evidence-informed supplement exploration.</p>
      </section>
      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {['Ashwagandha', 'Rhodiola', 'Holy Basil'].map((item) => (
          <article key={item} className="card-premium p-5">
            <h2 className="text-xl font-semibold text-ink">{item}</h2>
            <p className="mt-2 text-sm text-muted">Commonly discussed in stress adaptation contexts. Educational only; response and tolerability vary by person.</p>
          </article>
        ))}
      </section>
      <p className="text-sm text-muted">Safety note: do not use supplement content as a substitute for medical evaluation, especially with endocrine conditions, medications, pregnancy, or mental health crises.</p>
      <div className="flex gap-4">
        <Link href="/top/best-herbs-for-cortisol" className="text-sm font-medium text-emerald-700 hover:underline">Best cortisol herbs</Link>
        <Link href="/top/stress" className="text-sm font-medium text-emerald-700 hover:underline">Stress guides</Link>
      </div>
    </main>
  )
}
