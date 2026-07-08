import Link from 'next/link'

type CitationReadySummaryProps = {
  answer: string
  bestFor?: string[]
  evidenceLevel?: string
  safetyNote?: string
  notClaiming?: string
  referencesHref?: string
}

export default function CitationReadySummary({
  answer,
  bestFor = [],
  evidenceLevel,
  safetyNote,
  notClaiming,
  referencesHref,
}: CitationReadySummaryProps) {
  return (
    <section
      aria-label="Citation-ready summary"
      className="max-w-4xl rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm dark:border-white/10 dark:bg-zinc-950"
    >
      <div className="space-y-4">
        <div className="space-y-2">
          <p className="eyebrow-label">Quick answer</p>
          <p className="text-base leading-7 text-ink">{answer}</p>
        </div>

        {bestFor.length > 0 ? (
          <div>
            <h2 className="text-base font-semibold text-ink">Best fit</h2>
            <ul className="mt-2 list-disc space-y-1 pl-5 text-sm leading-6 text-muted">
              {bestFor.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        ) : null}

        <dl className="grid gap-3 text-sm leading-6 sm:grid-cols-2">
          {evidenceLevel ? (
            <div>
              <dt className="font-semibold text-ink">Evidence level</dt>
              <dd className="text-muted">{evidenceLevel}</dd>
            </div>
          ) : null}
          {safetyNote ? (
            <div>
              <dt className="font-semibold text-ink">Safety note</dt>
              <dd className="text-muted">{safetyNote}</dd>
            </div>
          ) : null}
          {notClaiming ? (
            <div className="sm:col-span-2">
              <dt className="font-semibold text-ink">What this page is not claiming</dt>
              <dd className="text-muted">{notClaiming}</dd>
            </div>
          ) : null}
        </dl>

        {referencesHref ? (
          <Link href={referencesHref} className="inline-flex text-sm font-semibold text-brand-700 underline hover:text-brand-900">
            Jump to references
          </Link>
        ) : null}
      </div>
    </section>
  )
}
