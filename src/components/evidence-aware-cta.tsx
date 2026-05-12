type EvidenceAwareCTAProps = {
  title?: string
  description?: string
  readiness: {
    level: 'high' | 'moderate' | 'review' | 'hold'
    reasons: string[]
    cautions: string[]
  }
  sourcingNotes?: string[]
}

function levelLabel(level: EvidenceAwareCTAProps['readiness']['level']) {
  switch (level) {
    case 'high':
      return 'Evidence-forward context'
    case 'moderate':
      return 'Moderate evidence context'
    case 'review':
      return 'Needs additional review'
    default:
      return 'Use additional caution'
  }
}

function levelClass(level: EvidenceAwareCTAProps['readiness']['level']) {
  switch (level) {
    case 'high':
      return 'evidence-pill-strong'
    case 'moderate':
      return 'evidence-pill-moderate'
    case 'review':
      return 'chip-readable'
    default:
      return 'border border-amber-200 bg-amber-50 text-amber-800'
  }
}

export default function EvidenceAwareCTA({
  title = 'Evidence-aware sourcing guidance',
  description = 'Product and sourcing context should remain secondary to evidence quality, safety considerations, and mechanism uncertainty.',
  readiness,
  sourcingNotes = [],
}: EvidenceAwareCTAProps) {
  return (
    <section className="compact-section section-rhythm-balanced overflow-hidden">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Research + Sourcing</p>
          <span className={levelClass(readiness.level)}>
            {levelLabel(readiness.level)}
          </span>
        </div>

        <h2 className="compact-heading">{title}</h2>

        <p className="compact-copy">
          {description}
        </p>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1fr_0.9fr]">
        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Why this profile may warrant deeper exploration</p>

          <div className="flex flex-wrap gap-2">
            {readiness.reasons.length > 0 ? (
              readiness.reasons.map((reason) => (
                <span key={reason} className="chip-readable bg-white/[0.92]">
                  {reason}
                </span>
              ))
            ) : (
              <span className="chip-readable">
                Additional evidence enrichment may still be needed.
              </span>
            )}
          </div>
        </article>

        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Evidence-aware sourcing notes</p>

          <ul className="space-y-2 text-sm leading-6 text-[#46574d]">
            {sourcingNotes.slice(0, 5).map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>

          {readiness.cautions.length > 0 ? (
            <div className="border-t border-brand-900/10 pt-3">
              <p className="eyebrow-label">Caution context</p>

              <div className="mt-2 flex flex-wrap gap-2">
                {readiness.cautions.map((caution) => (
                  <span key={caution} className="chip-readable">
                    {caution}
                  </span>
                ))}
              </div>
            </div>
          ) : null}
        </article>
      </div>
    </section>
  )
}
