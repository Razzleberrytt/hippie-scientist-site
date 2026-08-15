import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/src/lib/seo'
import { evidenceGradeHistory } from '@/data/editorial/evidence-grade-history'

export const metadata: Metadata = buildPageMetadata({
  title: 'Evidence Change Tracker',
  description: 'Quarterly public history of supplement evidence-grade upgrades, downgrades, and conclusion-changing research recorded by The Hippie Scientist.',
  path: '/evidence/evidence-report/changes/',
  openGraphType: 'article',
})

export default function EvidenceChangeTrackerPage() {
  const events = [...evidenceGradeHistory].sort((a, b) => Date.parse(b.changedAt) - Date.parse(a.changedAt))
  const quarters = [...new Set(events.map(event => event.quarter))]

  return (
    <main className="container-page mx-auto max-w-5xl space-y-10 py-10">
      <section className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Original research monitoring</p>
        <h1 className="heading-premium mt-3">Evidence Change Tracker</h1>
        <p className="text-reading mt-4 max-w-3xl">
          A public, append-only record of evidence-grade changes. Each event records what moved, when it moved,
          why the conclusion changed, and the triggering source IDs when they are available.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/evidence/evidence-report/" className="chip-readable">State of Supplement Evidence 2026</Link>
          <Link href="/learn/citation-explorer/" className="chip-readable">Human Trial Explorer</Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3">
        <div className="card-premium p-5"><p className="eyebrow-label">Recorded changes</p><p className="mt-2 text-3xl font-bold text-ink">{events.length}</p></div>
        <div className="card-premium p-5"><p className="eyebrow-label">Evidence upgrades</p><p className="mt-2 text-3xl font-bold text-ink">{events.filter(event => ['A','B'].includes(event.toGrade) && !['A','B'].includes(event.fromGrade)).length}</p></div>
        <div className="card-premium p-5"><p className="eyebrow-label">Evidence downgrades</p><p className="mt-2 text-3xl font-bold text-ink">{events.filter(event => ['C','D','Avoid/Insufficient'].includes(event.toGrade) && ['A','B'].includes(event.fromGrade)).length}</p></div>
      </section>

      {events.length === 0 ? (
        <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-6 text-sm leading-7 text-muted">
          The append-only tracker is live, but no historical grade-change events have been recorded under this
          new provenance system yet. The site will not backfill invented C→B or B→A histories from the current
          database snapshot. The first real reviewed change becomes the first public event.
        </section>
      ) : quarters.map(quarter => (
        <section key={quarter} className="space-y-4">
          <h2 className="text-2xl font-semibold text-ink">{quarter}</h2>
          {events.filter(event => event.quarter === quarter).map(event => (
            <article key={event.id} id={event.id} className="card-premium p-6">
              <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                <time dateTime={event.changedAt}>{event.changedAt}</time>
                <span aria-hidden="true">•</span>
                <Link href={event.ingredientPath} className="font-semibold text-brand-700 hover:underline">{event.ingredientName}</Link>
              </div>
              <h3 className="mt-3 text-xl font-semibold text-ink">{event.fromGrade} → {event.toGrade}</h3>
              <p className="mt-3 text-sm leading-7 text-muted">{event.reason}</p>
              {event.sourceIds?.length ? (
                <p className="mt-3 text-xs text-muted"><strong className="text-ink">Triggering sources:</strong> {event.sourceIds.join(', ')}</p>
              ) : null}
            </article>
          ))}
        </section>
      ))}

      <section className="rounded-2xl border border-brand-900/10 bg-white p-6 shadow-sm">
        <h2 className="text-xl font-semibold text-ink">Quarterly report model</h2>
        <p className="mt-3 text-sm leading-7 text-muted">
          Quarterly editions are generated from this ledger: supplements whose rating changed, new upgrades,
          downgrades, and claims whose conclusion changed. New human trials that do not change a grade remain
          discoverable in the Citation Explorer rather than being mislabeled as a grade-change event.
        </p>
      </section>
    </main>
  )
}
