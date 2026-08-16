import Link from 'next/link'

import { citationReadySentenceCount, toCitationReadySummary } from '@/src/lib/citation-ready-summary'

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
  /** Stable deep-link ID. Prefer a claim ID when this summary represents one canonical claim. */
  id?: string
  entityName?: string
  definition?: string
  limitation?: string
  /** Precise claim-adjacent source links when the page can map the answer to individual references. */
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
    : new Intl.DateTimeFormat('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        timeZone: 'UTC',
      }).format(date)
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
  const citationReadyAnswer = toCitationReadySummary(answer)
  const sentenceCount = citationReadySentenceCount(answer)
  const limitationText = limitation || notClaiming
  const headingId = `${id}-heading`
  const hasProvenance = publishedAt || reviewedAt || authorName || editorName
  const hasCitationProvenance = sources.length > 0 || Boolean(referencesHref)

  return (
    <section
      id={id}
      aria-labelledby={headingId}
      data-answer-engine-summary="true"
      data-citation-summary-sentences={sentenceCount}
      className="scroll-mt-24 max-w-4xl rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <h2 id={headingId} className="eyebrow-label">
            {entityName ? `${entityName}: quick answer` : 'Quick answer'}
          </h2>
          {definition ? (
            <p className="text-sm leading-6 text-muted">
              <strong>Definition:</strong> {definition}
            </p>
          ) : null}
          <p data-claim="true" className="text-base leading-7 text-ink">
            {citationReadyAnswer}
          </p>
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
            <div data-safety-context="true">
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

        {hasCitationProvenance ? (
          <div data-citation-sources="true" className="border-t border-brand-900/10 pt-3 dark:border-white/10">
            <p className="text-sm font-semibold text-ink">Sources for this answer</p>
            <ul className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-sm leading-6">
              {sources.map((source) => (
                <li key={`${source.href}:${source.label}`}>
                  <Link href={source.href} className="font-semibold text-brand-700 underline hover:text-brand-900">
                    {source.label}
                  </Link>
                </li>
              ))}
              {referencesHref ? (
                <li>
                  <Link href={referencesHref} className="font-semibold text-brand-700 underline hover:text-brand-900">
                    {sources.length > 0 ? 'Full reference ledger' : 'Full references'}
                  </Link>
                </li>
              ) : null}
            </ul>
          </div>
        ) : null}

        {hasProvenance ? (
          <dl data-editorial-provenance="true" className="grid gap-x-5 gap-y-1 border-t border-brand-900/10 pt-3 text-xs leading-5 text-muted sm:grid-cols-2 dark:border-white/10">
            {authorName ? <div><dt className="inline font-semibold text-ink">Author: </dt><dd className="inline">{authorName}</dd></div> : null}
            {editorName ? <div><dt className="inline font-semibold text-ink">Editor: </dt><dd className="inline">{editorName}</dd></div> : null}
            {publishedAt ? <div><dt className="inline font-semibold text-ink">Published: </dt><dd className="inline">{dateLabel(publishedAt)}</dd></div> : null}
            {reviewedAt ? <div><dt className="inline font-semibold text-ink">Reviewed: </dt><dd className="inline">{dateLabel(reviewedAt)}</dd></div> : null}
          </dl>
        ) : null}

        <a href={`#${id}`} className="inline-flex text-sm font-semibold text-muted underline underline-offset-4 hover:text-ink">
          Permanent link to this answer
        </a>
      </div>
    </section>
  )
}
