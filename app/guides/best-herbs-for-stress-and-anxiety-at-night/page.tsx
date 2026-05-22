import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'Best Herbs for Stress and Anxiety at Night | Guide',
  description: 'Educational night-time guide for choosing calming herbs with safety-first framing and simple next steps.',
}

export default function Page() {
  return (
    <main className="container-page py-10">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8">
        <p className="eyebrow-label">Night routine guide</p>
        <h1 className="mt-2 text-3xl font-semibold text-ink sm:text-4xl">Best Herbs for Stress and Anxiety at Night</h1>
        <p className="detail-reading mt-4 text-muted">For many people, evening stress shows up as racing thoughts. Start with gentle calming options and track sleep quality over 1–2 weeks.</p>
      </section>
    </main>
  )
}
