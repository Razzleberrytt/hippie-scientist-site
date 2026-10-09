import Link from 'next/link'

type EvidenceScopeGuideProps = {
  context: 'profile' | 'report'
}

/**
 * Reader-facing vocabulary only. This never grades a substance, alters a claim,
 * derives study independence, or authorizes product eligibility/publication.
 */
export default function EvidenceScopeGuide({ context }: EvidenceScopeGuideProps) {
  const isProfile = context === 'profile'

  return (
    <aside
      aria-label="How evidence grades and safety labels differ"
      className="rounded-2xl border border-brand-900/10 bg-[var(--surface-elevated)] p-4 text-sm leading-6 text-[var(--text-primary)]"
    >
      <p className="font-semibold">
        {isProfile ? 'Why can two evidence grades differ?' : 'What do the evidence report grades measure?'}
      </p>
      <p className="mt-1 text-muted">
        {isProfile
          ? 'A profile-wide grade summarizes an ingredient record. It does not establish the strength of every outcome-specific claim. Safety cautions are a separate assessment.'
          : 'These grade percentages use indexable ingredient profiles as their denominator—not every tracked compound or every PubMed reference. A profile grade does not certify all claims about that ingredient.'}
      </p>
      <details className="mt-2 rounded-xl border border-brand-900/10 px-3 py-2">
        <summary className="min-h-11 cursor-pointer py-2 font-semibold text-ink focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700">
          See the evidence levels explained
        </summary>
        <dl className="mt-2 space-y-2 border-t border-brand-900/10 pt-3">
          <div>
            <dt className="font-semibold">Ingredient / profile grade</dt>
            <dd className="text-muted">An overall profile-level evidence summary, not a guarantee of benefit for every use or product.</dd>
          </div>
          <div>
            <dt className="font-semibold">Outcome-specific claim</dt>
            <dd className="text-muted">Evidence for one stated effect, population, and studied preparation. It may be weaker or stronger than the profile grade.</dd>
          </div>
          <div>
            <dt className="font-semibold">Individual study quality</dt>
            <dd className="text-muted">Design and limitations of one source; multiple papers do not necessarily represent independent trials.</dd>
          </div>
          <div>
            <dt className="font-semibold">Safety / caution level</dt>
            <dd className="text-muted">Separate safety and interaction context, not an effectiveness score or a prediction of individual risk.</dd>
          </div>
          <div>
            <dt className="font-semibold">Research review and product eligibility</dt>
            <dd className="text-muted">Source discovery, editorial review, clinical interpretation, and any commercial product eligibility require distinct checks. An evidence grade does not confer approval.</dd>
          </div>
        </dl>
      </details>
      <p className="mt-2 text-xs leading-5 text-muted">
        <Link href="/info/methodology/" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
          Read the grading methodology
        </Link>
        {' · '}
        <Link href="/safety-checker/" className="font-semibold text-brand-700 underline-offset-2 hover:underline">
          Check safety separately
        </Link>
      </p>
    </aside>
  )
}
