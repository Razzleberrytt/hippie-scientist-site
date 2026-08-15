import type { Metadata } from 'next'
import Link from 'next/link'
import { publicCorrections } from '@/data/editorial/corrections'
import { correctionsForPage } from '@/lib/editorial-provenance'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Corrections & Scientific Update History',
  description: 'Public correction policy and correction history for material scientific, safety, dosing, citation, and evidence-grade changes on The Hippie Scientist.',
  path: '/info/corrections/',
  openGraphType: 'article',
})

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function CorrectionsPage() {
  const sorted = [...publicCorrections].sort(
    (a, b) => Date.parse(b.publishedAt) - Date.parse(a.publishedAt),
  )
  const affectedPages = new Set(sorted.map(correction => correction.pagePath)).size

  return (
    <main className="container-page mx-auto max-w-5xl space-y-10 py-10">
      <section className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Scientific accountability</p>
        <h1 className="heading-premium mt-4">Corrections &amp; scientific update history</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Material corrections to evidence grades, safety conclusions, dosing context, study interpretation,
          or citation attribution belong in a public record. Small copy edits do not need a scientific
          correction entry; meaningful changes do.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/info/contact/?topic=correction"
            className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900"
          >
            Submit a correction or missing study
          </Link>
          <Link
            href="/info/editorial-policy/"
            className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50"
          >
            Read editorial standards
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Correction ledger summary">
        <div className="card-premium p-5">
          <p className="eyebrow-label">Published corrections</p>
          <p className="mt-2 text-3xl font-bold text-ink">{sorted.length}</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">Affected pages</p>
          <p className="mt-2 text-3xl font-bold text-ink">{affectedPages}</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">History model</p>
          <p className="mt-2 text-lg font-bold text-ink">Append-only</p>
        </div>
      </section>

      <section className="rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">What gets a public correction?</h2>
        <div className="mt-5 grid gap-5 md:grid-cols-2 text-sm leading-7 text-muted">
          <div>
            <h3 className="font-bold text-ink">Recorded publicly</h3>
            <p className="mt-2">
              Evidence-grade changes, reversed or materially narrowed conclusions, safety-warning changes,
              incorrect study characterization, meaningful dose/form corrections, citation misattribution,
              and other changes that could alter a reader’s interpretation.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-ink">Usually not recorded</h3>
            <p className="mt-2">
              Spelling, formatting, accessibility fixes, template changes, navigation changes, and other edits
              that do not materially change the scientific meaning of a page.
            </p>
          </div>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="correction-ledger-title">
        <div>
          <p className="eyebrow-label">Public ledger</p>
          <h2 id="correction-ledger-title" className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            Material corrections
          </h2>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 text-sm leading-7 text-muted">
            No material corrections have been entered in the public ledger yet. This is not a claim that the
            site has never changed; routine edits and build/template changes are intentionally separate from
            scientific correction events.
          </div>
        ) : (
          <div className="space-y-4">
            {sorted.map(correction => {
              const pageHistory = correctionsForPage(publicCorrections, correction.pagePath)
              const sequence = pageHistory.findIndex(item => item.id === correction.id) + 1
              return (
                <article key={correction.id} id={correction.id} className="card-premium p-6">
                  <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                    <time dateTime={correction.publishedAt}>{formatDate(correction.publishedAt)}</time>
                    <span aria-hidden="true">•</span>
                    <Link href={correction.pagePath} className="font-semibold text-brand-700 hover:underline">
                      {correction.pagePath}
                    </Link>
                    <span aria-hidden="true">•</span>
                    <span>Correction #{sequence} for this page</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-ink">{correction.summary}</h3>
                  <p className="mt-3 text-sm leading-7 text-muted"><strong className="text-ink">Reason:</strong> {correction.reason}</p>
                  {correction.before || correction.after ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {correction.before ? <p className="rounded-xl bg-rose-50 p-4 text-sm leading-6"><strong>Before:</strong> {correction.before}</p> : null}
                      {correction.after ? <p className="rounded-xl bg-emerald-50 p-4 text-sm leading-6"><strong>After:</strong> {correction.after}</p> : null}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 sm:p-8">
        <h2 className="text-2xl font-semibold text-ink">Found a problem?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Please include the page URL, the exact statement you think is wrong or incomplete, and a primary
          source when possible. A correction submission does not require sharing personal health information.
        </p>
        <Link href="/info/contact/?topic=correction" className="mt-5 inline-flex rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900">
          Flag an error →
        </Link>
      </section>
    </main>
  )
}
