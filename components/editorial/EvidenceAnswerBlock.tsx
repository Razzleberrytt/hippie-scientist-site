import Link from 'next/link'

export type EvidenceAnswerBlockProps = {
  answer: string
  evidenceType: string
  limitation: string
  population?: string
  doseContext?: string
  referencesHref?: string
  title?: string
}

/**
 * Compact claim → evidence → limitation structure for major informational pages.
 * Keep the conclusion narrower than the evidence and put the limitation beside
 * the claim rather than burying it at the end of the page.
 */
export default function EvidenceAnswerBlock({
  answer,
  evidenceType,
  limitation,
  population,
  doseContext,
  referencesHref,
  title = 'What the evidence actually shows',
}: EvidenceAnswerBlockProps) {
  return (
    <section
      aria-label={title}
      className="max-w-4xl rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950 sm:p-6"
    >
      <p className="eyebrow-label">Evidence answer</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">{title}</h2>
      <p className="mt-3 text-base leading-7 text-ink">{answer}</p>

      <dl className="mt-5 grid gap-4 text-sm leading-6 sm:grid-cols-2">
        <div>
          <dt className="font-semibold text-ink">Evidence type</dt>
          <dd className="text-muted">{evidenceType}</dd>
        </div>
        <div>
          <dt className="font-semibold text-ink">Key limitation</dt>
          <dd className="text-muted">{limitation}</dd>
        </div>
        {population ? (
          <div>
            <dt className="font-semibold text-ink">Population</dt>
            <dd className="text-muted">{population}</dd>
          </div>
        ) : null}
        {doseContext ? (
          <div>
            <dt className="font-semibold text-ink">Dose / form context</dt>
            <dd className="text-muted">{doseContext}</dd>
          </div>
        ) : null}
      </dl>

      {referencesHref ? (
        <Link
          href={referencesHref}
          className="mt-5 inline-flex text-sm font-semibold text-brand-700 underline hover:text-brand-900"
        >
          See the supporting studies
        </Link>
      ) : null}
    </section>
  )
}
