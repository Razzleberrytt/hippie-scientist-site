import Link from 'next/link'

export type CitationSourceLink = {
  label: string
  href: string
}

type CitationReadySummaryProps = {
  answer: string
  bestFor?: string[]
  evidenceLevel?: string
  safetyNote?: string
  notClaiming?: string
  referencesHref?: string
  /** Stable deep-link ID. Prefer a claim ID when the summary represents one canonical claim. */
  id?: string
  entityName?: string
  definition?: string
  limitation?: string
  sources?: CitationSourceLink[]
  publishedAt?: string
  reviewedAt?: string
  authorName?: string
  editorName?: string
}

function dateLabel(value: string) {
  const date = new Date(value)
  return Number.isNaN(date.getTime())
    ? value
    : new Intl.DateTimeFormat('en-US', { year: 'numeric', month: 'short', day: 'numeric', timeZone: 'UTC' }).format(date)
}

export default function CitationReadySummary({
  answer,
  bestFor = [],
  evidenceLevel,
  safetyNote,
  notClaiming,
  referencesHref,
  id = 'quick-answer',
  entityName,
  definition,
  limitation,
  sources = [],
  publishedAt,
  reviewedAt,
  authorName,
  editorName,
}: CitationReadySummaryProps) {
  const limitationText = limitation || notClaiming
  const headingId = `${id}-heading`

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-answer-engine-summary="true"
      className="scroll-mt-24 max-w-4xl rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 id={headingId} className="eyebrow-label">
            {entityName ? `${entityName}: quick answer` : 'Quick answer'}
          </h2>
          {definition ? <p className="text-sm leading-6 text-muted"><strong>Definition:</strong> {definition}</p> : null}
          <p data-claim="true" className="text-base leading-7 text-ink">{answer}</p>
        </div>

        {bestFor.length > 0 ? (
          <div>
            <h3 className="text-base font-semibold text-ink">Best fit</h3>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
              {bestFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <dl className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
          {evidenceLevel ? (
            <div data-evidence="true">
              <dt className="font-semibold text-ink">Evidence</dt>
              <dd className="text-muted">{evidenceLevel}</dd>
            </div>
          ) : null}
          {safetyNote ? (
            <div>
              <dt className="font-semibold text-ink">Safety context</dt>
              <dd className="text-muted">{safetyNote}</dd>
            </div>
          ) : null}
          {limitationText ? (
            <div data-limitation="true" className="sm:col-span-2">
              <dt className="font-semibold text-ink">Limitation</dt>
              <dd className="text-muted">{limitationText}</dd>
            </div>
          ) : null}
        </dl>

        {sources.length > 0 ? (
          <div data-nearby-citations="true" className="border-t border-brand-900/10 pt-3 dark:border-white/10">
            <h3 className="text-sm font-semibold text-ink">Sources for this finding</h3>
            <ul className="mt-2 space-y-1 text-sm leading-6 text-muted">
              {sources.map((source) => (
                <li key={`${source.href}-${source.label}`}>
                  <a href={source.href} rel="cite" className="font-medium text-brand-700 underline decoration-dotted underline-offset-4 hover:text-brand-900">
                    {source.label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {(publishedAt || reviewedAt || authorName || editorName) ? (
          <dl data-research-metadata="true" className="grid gap-x-5 gap-y-1 border-t border-brand-900/10 pt-3 text-xs leading-5 text-muted sm:grid-cols-2 dark:border-white/10">
            {authorName ? <div><dt className="inline font-semibold text-ink">Author: </dt><dd className="inline">{authorName}</dd></div> : null}
            {editorName ? <div><dt className="inline font-semibold text-ink">Editor: </dt><dd className="inline">{editorName}</dd></div> : null}
            {publishedAt ? <div><dt className="inline font-semibold text-ink">Published: </dt><dd className="inline"><time dateTime={publishedAt}>{dateLabel(publishedAt)}</time></dd></div> : null}
            {reviewedAt ? <div><dt className="inline font-semibold text-ink">Evidence reviewed: </dt><dd className="inline"><time dateTime={reviewedAt}>{dateLabel(reviewedAt)}</time></dd></div> : null}
          </dl>
        ) : null}

        {referencesHref ? (
          <Link href={referencesHref} rel="cite" className="inline-flex text-sm font-semibold text-brand-700 underline hover:text-brand-900">
            See the full references and source context
          </Link>
        ) : null}

        <a href={`#${id}`} className="sr-only">Permanent link to this finding</a>
      </div>
    </section>
  )
}
