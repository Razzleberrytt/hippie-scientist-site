import type { ReactNode } from 'react'

type LegacyGuideQuickAnswerProps = {
  children: ReactNode
  referencesHref?: string
}

/**
 * Compatibility answer surface for older hand-authored guides.
 *
 * Keep this structural only: it exposes a stable answer-engine target and an
 * optional source-ledger jump without inferring evidence grades or asserting
 * claim-to-source relationships that the legacy content model does not encode.
 */
export default function LegacyGuideQuickAnswer({
  children,
  referencesHref,
}: LegacyGuideQuickAnswerProps) {
  return (
    <section
      id="quick-answer"
      className="card-premium scroll-mt-24 space-y-4 p-6"
      aria-labelledby="quick-answer-heading"
      data-answer-engine-summary="true"
      data-claim="true"
    >
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 id="quick-answer-heading" className="text-2xl font-semibold">
          Quick answer
        </h2>
        <a
          href="#quick-answer"
          aria-label="Permanent link to quick answer"
          className="text-xs font-semibold text-brand-700 underline-offset-4 hover:underline"
        >
          Permanent link
        </a>
      </div>

      <div className="text-sm leading-7 text-muted">{children}</div>

      {referencesHref ? (
        <a
          href={referencesHref}
          data-citation-sources="true"
          className="inline-flex text-xs font-bold text-brand-700 hover:text-brand-900 hover:underline"
        >
          Verify sources ↓
        </a>
      ) : null}
    </section>
  )
}
