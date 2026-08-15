import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/src/lib/seo'
import { evidenceDatasetChangelog } from '@/data/research/evidence-dataset-changelog'

export const metadata: Metadata = buildPageMetadata({
  title: 'Evidence Dataset Changelog',
  description: 'Version history for The Hippie Scientist public supplement evidence dataset and Evidence Report.',
  path: '/evidence/evidence-report/changelog/',
  openGraphType: 'article',
})

export default function EvidenceDatasetChangelogPage() {
  return (
    <main className="container-page mx-auto max-w-4xl space-y-8 py-10">
      <section className="hero-shell rounded-[2rem] border p-6 sm:p-8">
        <p className="eyebrow-label">Version history</p>
        <h1 className="heading-premium mt-3">Evidence dataset changelog</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Public releases are versioned so researchers, writers, and readers can identify which dataset structure
          and evidence state they referenced. Evidence-grade changes live in a separate append-only change tracker.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/evidence/evidence-report/" className="chip-readable">Evidence Report</Link>
          <a href="/evidence/evidence-report/dataset.csv" download className="chip-readable">CSV</a>
          <a href="/evidence/evidence-report/dataset.json" download className="chip-readable">JSON</a>
        </div>
      </section>

      <section className="space-y-4">
        {evidenceDatasetChangelog.map(release => (
          <article key={release.version} className="card-premium p-6">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <h2 className="text-xl font-semibold text-ink">Version {release.version}</h2>
              <time dateTime={release.date} className="text-sm text-muted">{release.date}</time>
            </div>
            <p className="mt-2 text-xs font-semibold uppercase tracking-[0.12em] text-brand-700">Schema v{release.schemaVersion}</p>
            <p className="mt-3 text-sm leading-7 text-muted">{release.summary}</p>
          </article>
        ))}
      </section>
    </main>
  )
}
