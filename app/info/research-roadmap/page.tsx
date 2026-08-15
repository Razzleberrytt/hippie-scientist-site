import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/src/lib/seo'
import ResearchSuggestionPanel from './ResearchSuggestionPanel'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Roadmap & Topic Suggestions | The Hippie Scientist',
  description: 'See what The Hippie Scientist is improving next and suggest ingredients, comparisons, missing studies, or scientific corrections without sharing personal health information.',
  path: '/info/research-roadmap/',
  openGraphType: 'article',
})

const roadmap = [
  {
    status: 'Now',
    title: 'Verified high-traffic profiles',
    body: 'Raise evidence, citation, dose, safety, and claim-level verification on pages already receiving meaningful search demand.',
    href: '/evidence/evidence-report/',
    linkLabel: 'Evidence Report',
  },
  {
    status: 'Now',
    title: 'Safety Checker depth',
    body: 'Improve interaction provenance, uncertainty labels, and source-backed educational explanations for combinations people actually check.',
    href: '/safety-checker/',
    linkLabel: 'Safety Checker',
  },
  {
    status: 'Next',
    title: 'Evidence Database & trial exploration',
    body: 'Make structured human evidence easier to filter, verify, compare, and connect back to specific claims and outcomes.',
    href: '/evidence/evidence-checker/',
    linkLabel: 'Evidence Database',
  },
  {
    status: 'Next',
    title: 'High-demand comparisons',
    body: 'Expand only comparisons with distinct search intent, adequate evidence on both sides, and a useful decision framework.',
    href: '/guides/compare/',
    linkLabel: 'Comparison center',
  },
  {
    status: 'Later',
    title: 'Botanical relationship tools',
    body: 'Deepen the Atlas and knowledge graph around botanicals, compounds, mechanisms, outcomes, studies, and safety without presenting mechanisms as proven benefits.',
    href: '/tools/botanical-activity-atlas/',
    linkLabel: 'Botanical Activity Atlas',
  },
  {
    status: 'Ongoing',
    title: 'Corrections & new evidence',
    body: 'Review material corrections, missing primary studies, evidence-grade changes, and safety updates as the literature changes.',
    href: '/info/corrections/',
    linkLabel: 'Correction history',
  },
]

export default function ResearchRoadmapPage() {
  return (
    <main className="container-page mx-auto max-w-5xl space-y-10 py-10">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <p className="eyebrow-label">Public roadmap</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl">What gets researched next should follow evidence and demand.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          This roadmap shows the major research/database priorities. Reader suggestions are one input alongside search demand, evidence gaps, safety importance, revenue opportunity, backlink potential, page quality, confidence, and implementation effort.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/info/methodology/" className="chip-readable hover:bg-white transition">Methodology</Link>
          <Link href="/info/corrections/" className="chip-readable hover:bg-white transition">Corrections</Link>
          <Link href="/evidence/evidence-report/" className="chip-readable hover:bg-white transition">Evidence Report</Link>
        </div>
      </section>

      <section aria-labelledby="roadmap-title" className="space-y-5">
        <div>
          <p className="eyebrow-label">Priority lanes</p>
          <h2 id="roadmap-title" className="mt-2 text-3xl font-semibold tracking-tight text-ink">Major research/database work</h2>
        </div>
        <div className="grid gap-5 md:grid-cols-2">
          {roadmap.map((item) => (
            <article key={item.title} className="card-premium p-6">
              <span className="inline-flex rounded-full border border-brand-900/10 bg-brand-50 px-3 py-1 text-xs font-bold uppercase tracking-wider text-brand-800">{item.status}</span>
              <h3 className="mt-3 text-xl font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.body}</p>
              <Link href={item.href} className="mt-4 inline-flex text-sm font-semibold text-brand-800 underline-offset-4 hover:underline">
                {item.linkLabel} →
              </Link>
            </article>
          ))}
        </div>
      </section>

      <ResearchSuggestionPanel />

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">How suggestions are prioritized</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Repeated suggestions create a demand signal, not an automatic publishing order. A topic still needs adequate evidence, a useful search or research intent, acceptable safety framing, and enough unique value to justify an indexable page or tool upgrade.
        </p>
      </section>
    </main>
  )
}
