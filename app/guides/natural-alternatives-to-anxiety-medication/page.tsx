import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Natural Alternatives to Anxiety Medication | Educational Guide',
  description: 'Educational overview of supportive herbs and non-supplement routines for anxiety-related stress patterns.',
  alternates: { canonical: '/guides/best-herbs-for-anxiety' },
}

export default function Page() {
  return (
    <main className="container-page py-10 space-y-8">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Educational only</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Natural Alternatives to Anxiety Medication</h1>
        <p className="detail-reading mt-4 text-muted">This page does not recommend replacing prescribed treatment. It is a learning guide about supportive lifestyle and supplement options to discuss with a licensed clinician.</p>
      </section>
      <section className="card-premium p-6 space-y-3">
        <h2 className="text-2xl font-semibold text-ink">Supportive options often discussed</h2>
        <ul className="list-disc pl-5 text-muted space-y-2">
          <li>Ashwagandha and lemon balm for stress-context calming support.</li>
          <li>Sleep consistency, morning light exposure, and caffeine timing.</li>
          <li>Structured therapy, breathwork, and exercise for longer-term resilience.</li>
        </ul>
      </section>
      <div className="flex flex-wrap gap-4">
        <Link href="/guides/best-herbs-for-anxiety" className="text-sm font-medium text-emerald-700 hover:underline">Top anxiety herbs</Link>
        <Link href="/guides/natural-anxiolytics-beyond-ashwagandha" className="text-sm font-medium text-emerald-700 hover:underline">Natural anxiolytics cluster</Link>
      </div>
    </main>
  )
}
