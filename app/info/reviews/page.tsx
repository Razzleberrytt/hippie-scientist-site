import type { Metadata } from 'next'
import Link from 'next/link'
import { editorialReviewEvents } from '@/data/editorial/reviews'
import { validateReviewLedger } from '@/lib/editorial-provenance'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Editorial Review History',
  description: 'Append-only history of recorded page-specific editorial and external review events on The Hippie Scientist.',
  path: '/info/reviews/',
  openGraphType: 'article',
})

function formatDate(value: string) {
  return new Date(value).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  })
}

export default function EditorialReviewHistoryPage() {
  const errors = validateReviewLedger(editorialReviewEvents)
  if (errors.length > 0) {
    throw new Error(`Invalid editorial review ledger:\n${errors.join('\n')}`)
  }

  const reviews = [...editorialReviewEvents].sort(
    (a, b) => Date.parse(b.reviewedAt) - Date.parse(a.reviewedAt),
  )
  const reviewedPages = new Set(reviews.map(review => review.pagePath)).size

  return (
    <main className="container-page mx-auto max-w-5xl space-y-10 py-10">
      <section className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">Editorial provenance</p>
        <h1 className="heading-premium mt-4">Editorial review history</h1>
        <p className="text-reading mt-4 max-w-3xl">
          This ledger records real, page-specific review events. Deployments, template revisions, and automated
          rebuilds do not create review entries. New reviews are appended; prior events remain visible.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/info/editorial-policy/" className="rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900">
            Editorial standards
          </Link>
          <Link href="/info/corrections/" className="rounded-full border border-brand-900/15 px-5 py-2.5 text-sm font-semibold text-ink hover:bg-brand-50">
            Corrections history
          </Link>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-3" aria-label="Review ledger summary">
        <div className="card-premium p-5">
          <p className="eyebrow-label">Recorded reviews</p>
          <p className="mt-2 text-3xl font-bold text-ink">{reviews.length}</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">Reviewed pages</p>
          <p className="mt-2 text-3xl font-bold text-ink">{reviewedPages}</p>
        </div>
        <div className="card-premium p-5">
          <p className="eyebrow-label">History model</p>
          <p className="mt-2 text-lg font-bold text-ink">Append-only</p>
        </div>
      </section>

      <section className="space-y-5" aria-labelledby="review-ledger-title">
        <div>
          <p className="eyebrow-label">Recorded events</p>
          <h2 id="review-ledger-title" className="mt-2 text-3xl font-semibold tracking-tight text-ink">
            Page-specific review history
          </h2>
        </div>

        {reviews.length === 0 ? (
          <div className="rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 text-sm leading-7 text-muted">
            No substantiated review events have been entered in the registry yet. This empty state is intentional:
            the site does not convert update dates, builds, or unverified reviewer claims into review history.
          </div>
        ) : (
          <div className="space-y-4">
            {reviews.map(review => (
              <article key={review.id} id={review.id} className="card-premium p-6">
                <div className="flex flex-wrap items-center gap-2 text-xs text-muted">
                  <time dateTime={review.reviewedAt}>{formatDate(review.reviewedAt)}</time>
                  <span aria-hidden="true">•</span>
                  <span>{review.kind} review</span>
                  <span aria-hidden="true">•</span>
                  <Link href={review.pagePath} className="font-semibold text-brand-700 hover:underline">
                    {review.pagePath}
                  </Link>
                </div>
                <h3 className="mt-3 text-xl font-semibold text-ink">{review.reviewerName}</h3>
                {review.reviewerRole || review.qualifications ? (
                  <p className="mt-1 text-sm text-muted">
                    {[review.reviewerRole, review.qualifications].filter(Boolean).join(' · ')}
                  </p>
                ) : null}
                {review.summary ? <p className="mt-3 text-sm leading-7 text-muted">{review.summary}</p> : null}
                {review.evidenceSearchDate ? (
                  <p className="mt-3 text-xs font-semibold text-muted">Evidence search: {review.evidenceSearchDate}</p>
                ) : null}
              </article>
            ))}
          </div>
        )}
      </section>
    </main>
  )
}
