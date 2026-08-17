import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
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
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info/' },
          { label: 'Corrections' },
        ]}
      />

      <section className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Scientific accountability</p>
        <h1 className="heading-premium mt-5">Corrections &amp; scientific update history</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Material corrections to evidence grades, safety conclusions, dosing context, study interpretation,
          or citation attribution belong in a public record. Small copy edits do not need a scientific
          correction entry; meaningful changes do.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/info/contact/?topic=correction"
            className="button-primary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-bold"
          >
            Submit a correction or missing study
          </Link>
          <Link
            href="/info/editorial-policy/"
            className="button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold"
          >
            Read editorial standards
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Correction ledger summary">
        <div className="card-premium p-5">
          <p className="eyebrow-label">Published corrections</p>
          <p className="mt-2 text-3xl font-bold text-[color:var(--hs-ink)]">{sorted.length}</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">Affected pages</p>
          <p className="mt-2 text-3xl font-bold text-[color:var(--hs-ink)]">{affectedPages}</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">History model</p>
          <p className="mt-2 text-lg font-bold text-[color:var(--hs-ink)]">Append-only</p>
        </div>
      </section>

      <section className="section-frame p-6 sm:p-8" aria-labelledby="corrections-policy-boundary">
        <p className="eyebrow-label">Correction threshold</p>
        <h2 id="corrections-policy-boundary" className="compact-heading mt-3">What gets a public correction?</h2>
        <div className="mt-5 grid gap-5 border-t border-[color:var(--hs-hairline)] pt-5 text-sm leading-7 text-[color:var(--hs-body)] md:grid-cols-2">
          <div>
            <h3 className="font-bold text-[color:var(--hs-ink)]">Recorded publicly</h3>
            <p className="mt-2">
              Evidence-grade changes, reversed or materially narrowed conclusions, safety-warning changes,
              incorrect study characterization, meaningful dose/form corrections, citation misattribution,
              and other changes that could alter a reader’s interpretation.
            </p>
          </div>
          <div>
            <h3 className="font-bold text-[color:var(--hs-ink)]">Usually not recorded</h3>
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
          <h2 id="correction-ledger-title" className="compact-heading mt-3">Material corrections</h2>
        </div>

        {sorted.length === 0 ? (
          <div className="rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] p-6 text-sm leading-7 text-[color:var(--hs-body)]">
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
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[color:var(--hs-body)]">
                    <time dateTime={correction.publishedAt}>{formatDate(correction.publishedAt)}</time>
                    <span aria-hidden="true">•</span>
                    <Link
                      href={correction.pagePath}
                      className="font-semibold text-[color:var(--hs-gold-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
                    >
                      {correction.pagePath}
                    </Link>
                    <span aria-hidden="true">•</span>
                    <span>Correction #{sequence} for this page</span>
                  </div>
                  <h3 className="mt-3 text-xl font-semibold text-[color:var(--hs-ink)]">{correction.summary}</h3>
                  <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)]"><strong className="text-[color:var(--hs-ink)]">Reason:</strong> {correction.reason}</p>
                  {correction.before || correction.after ? (
                    <div className="mt-4 grid gap-3 md:grid-cols-2">
                      {correction.before ? (
                        <p className="rounded-xl border border-rose-700/15 bg-rose-50 p-4 text-sm leading-6 text-rose-950 dark:border-rose-300/20 dark:bg-rose-300/10 dark:text-rose-100"><strong>Before:</strong> {correction.before}</p>
                      ) : null}
                      {correction.after ? (
                        <p className="rounded-xl border border-emerald-700/15 bg-emerald-50 p-4 text-sm leading-6 text-emerald-950 dark:border-emerald-300/20 dark:bg-emerald-300/10 dark:text-emerald-100"><strong>After:</strong> {correction.after}</p>
                      ) : null}
                    </div>
                  ) : null}
                </article>
              )
            })}
          </div>
        )}
      </section>

      <section className="section-frame p-6 sm:p-8" aria-labelledby="corrections-submit-heading">
        <p className="eyebrow-label">Reader correction path</p>
        <h2 id="corrections-submit-heading" className="compact-heading mt-3">Found a problem?</h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]">
          Please include the page URL, the exact statement you think is wrong or incomplete, and a primary
          source when possible. A correction submission does not require sharing personal health information.
        </p>
        <Link href="/info/contact/?topic=correction" className="button-primary mt-5 inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-bold">
          Flag an error →
        </Link>
      </section>
    </main>
  )
}