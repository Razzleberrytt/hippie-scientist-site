import { buildDecisionVisualProfile } from '../lib/decision-visuals'
import { getAffiliateSourcingContext } from '../lib/monetization-context'

type EvidenceAwareCTAProps = {
  title?: string
  description?: string
  readiness: {
    level: 'high' | 'moderate' | 'review' | 'hold'
    reasons: string[]
    cautions: string[]
  }
  sourcingNotes?: string[]
  record?: any
}

function levelLabel(level: EvidenceAwareCTAProps['readiness']['level']) {
  switch (level) {
    case 'high':
      return 'Good sourcing context'
    case 'moderate':
      return 'Moderate context'
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
  title = 'Sourcing checkpoint',
  description = 'Compare form, dose, label transparency, and safety fit before buying.',
  readiness,
  sourcingNotes = [],
  record,
}: EvidenceAwareCTAProps) {
  const visuals = buildDecisionVisualProfile(record || {})
  const affiliate = getAffiliateSourcingContext(record || {})
  const showAffiliateButton = Boolean(affiliate.affiliateUrl)
  const recommendationCards = [
    {
      label: 'Formulation Notes',
      value: sourcingNotes[0] || 'Prefer transparent labels, conservative serving context, and forms that match the profile goal.',
    },
    {
      label: 'Beginner Fit',
      value: visuals.difficulty,
    },
    {
      label: 'Stimulation Profile',
      value: visuals.stimulation,
    },
    {
      label: 'Timeline Profile',
      value: visuals.timeline,
    },
  ]
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


      {showAffiliateButton ? (
        <div className="rounded-[0.9rem] border border-brand-900/10 bg-white/85 p-3 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="max-w-2xl">
              <p className="eyebrow-label">Optional sourcing link</p>
              <p className="mt-1 text-sm leading-5 text-[#46574d]">
                Compare labels, ingredient form, serving context, and seller transparency.
              </p>
            </div>
            <a
              href={affiliate.affiliateUrl}
              target="_blank"
              rel="nofollow sponsored noopener noreferrer"
              className="inline-flex items-center justify-center rounded-full border border-brand-900/15 bg-brand-950 px-4 py-2 text-sm font-bold text-white shadow-sm transition hover:-translate-y-0.5 hover:bg-brand-900 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand-700"
            >
              {affiliate.affiliateLabel}
            </a>
          </div>
        </div>
      ) : null}
      </div>

      <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-4">
        {recommendationCards.map((card) => (
          <article key={card.label} className="rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-3 shadow-sm">
            <p className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-brand-900/55">{card.label}</p>
            <p className="mt-1 text-sm font-semibold leading-5 text-[#33443a]">{card.value}</p>
          </article>
        ))}
      </div>

      <div className="grid gap-3 lg:grid-cols-[1fr_0.9fr]">
        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Why it may fit</p>

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
          <p className="eyebrow-label">Sourcing notes</p>

          <ul className="space-y-1.5 text-sm leading-6 text-[#46574d]">
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
