import Link from 'next/link'

type WhatEvidenceShowsProps = {
  summary: string
  evidenceGrade?: string | null
  sourceCount?: number
  keyPoints?: string[]
  limitation?: string | null
  id?: string
  referencesHref?: string
}

export default function WhatEvidenceShows({
  summary,
  evidenceGrade,
  sourceCount = 0,
  keyPoints = [],
  limitation,
  id = 'what-the-evidence-shows',
  referencesHref,
}: WhatEvidenceShowsProps) {
  const visiblePoints = keyPoints.filter(Boolean).slice(0, 3)

  return (
    <section
      id={id}
      aria-labelledby={`${id}-title`}
      data-answer-engine-summary="true"
      className="scroll-mt-24 rounded-2xl border border-[color:var(--hs-hairline)] bg-white/70 p-5 shadow-sm dark:bg-white/5 sm:p-6"
    >
      <div className="flex flex-wrap items-center gap-2">
        <p className="section-label">What the evidence actually shows</p>
        {evidenceGrade ? (
          <span data-evidence="true" data-evidence-grade={evidenceGrade} className="identity-kicker">
            Evidence {evidenceGrade}
          </span>
        ) : null}
        {sourceCount > 0 ? (
          <span className="identity-meta">{sourceCount} cited source{sourceCount === 1 ? '' : 's'}</span>
        ) : null}
      </div>

      <h2 id={`${id}-title`} className="mt-3 text-xl font-semibold tracking-tight text-ink">
        Direct answer
      </h2>
      <p
        className="mt-2 text-base leading-7 text-[color:var(--hs-body)]"
        data-citation-ready-summary="true"
        data-claim="true"
        itemProp="abstract"
      >
        {summary}
      </p>

      {visiblePoints.length > 0 ? (
        <ul className="mt-4 space-y-2 text-sm leading-6 text-[color:var(--hs-body)]">
          {visiblePoints.map((point) => (
            <li key={point} className="flex gap-2">
              <span aria-hidden="true" className="font-bold text-brand-700">•</span>
              <span>{point}</span>
            </li>
          ))}
        </ul>
      ) : null}

      {limitation ? (
        <p data-limitation="true" className="mt-4 border-t border-[color:var(--hs-hairline)] pt-3 text-sm leading-6 text-muted">
          <strong className="text-ink">Important limitation:</strong> {limitation}
        </p>
      ) : null}

      {referencesHref && sourceCount > 0 ? (
        <div data-citation-sources="true" className="mt-4 border-t border-[color:var(--hs-hairline)] pt-3 text-sm">
          <Link href={referencesHref} className="font-semibold text-brand-700 underline underline-offset-4 hover:text-brand-900">
            Review the {sourceCount} cited source{sourceCount === 1 ? '' : 's'}
          </Link>
        </div>
      ) : null}
    </section>
  )
}
