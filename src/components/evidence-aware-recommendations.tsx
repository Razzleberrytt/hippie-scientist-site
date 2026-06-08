import Link from 'next/link'
import { cleanSummary, formatDisplayLabel, isClean, list, text, unique } from '@/lib/display-utils'

type RecommendationItem = {
  title: string
  description: string
  confidence?: 'stronger' | 'moderate' | 'traditional' | 'exploratory'
  href?: string
  label?: string
}

type EvidenceAwareRecommendationsProps = {
  record: any
  entityType: 'herb' | 'compound'
  sourcingLinks?: RecommendationItem[]
  stackIdeas?: RecommendationItem[]
}

function confidenceClass(confidence: RecommendationItem['confidence']) {
  switch (confidence) {
    case 'stronger':
      return 'evidence-pill-strong'
    case 'moderate':
      return 'evidence-pill-moderate'
    case 'traditional':
      return 'chip-readable'
    default:
      return 'identity-kicker'
  }
}

function sourcingContext(record: any) {
  return unique([
    ...list(record?.formulations),
    ...list(record?.delivery_forms),
    ...list(record?.preparation_methods),
    ...list(record?.extract_types),
    text(record?.standardization_notes),
    text(record?.bioavailability_notes),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 5)
}

function trustSignals(record: any) {
  return unique([
    text(record?.evidence_tier),
    text(record?.summary_quality),
    text(record?.profile_status),
    text(record?.human_evidence_summary),
  ].map(formatDisplayLabel).filter(isClean)).slice(0, 4)
}

function RecommendationCard({ item }: { item: RecommendationItem }) {
  return (
    <article className="compact-card section-rhythm-compact">
      <div className="flex flex-wrap gap-2">
        <span className={confidenceClass(item.confidence)}>
          {item.label || formatDisplayLabel(item.confidence || 'Context')}
        </span>
      </div>

      <div className="space-y-2">
        <h3 className="max-w-none text-base font-semibold leading-snug tracking-tight text-ink">
          {item.title}
        </h3>

        <p className="text-sm leading-6 text-[#46574d]">
          {item.description}
        </p>
      </div>

      {item.href ? (
        <Link
          href={item.href}
          className="inline-flex items-center text-sm font-semibold text-brand-800 hover:text-brand-700"
        >
          Explore carefully →
        </Link>
      ) : null}
    </article>
  )
}

export default function EvidenceAwareRecommendations({
  record,
  entityType,
  sourcingLinks = [],
  stackIdeas = [],
}: EvidenceAwareRecommendationsProps) {
  const sourcing = sourcingContext(record)
  const trust = trustSignals(record)

  const defaultRecommendations: RecommendationItem[] = [
    {
      title: entityType === 'herb' ? 'Whole herb vs extract context' : 'Delivery form considerations',
      description:
        'Preparation methods, extraction ratios, and formulation styles can substantially change the experience and evidence interpretation.',
      confidence: 'moderate',
      label: 'Preparation Context',
    },
    {
      title: 'Evidence-informed sourcing signals',
      description:
        'Standardization transparency, third-party testing, and ingredient clarity matter more than aggressive marketing claims.',
      confidence: 'stronger',
      label: 'Quality Signals',
    },
    {
      title: 'Traditional and exploratory context',
      description:
        'Historical use and mechanistic plausibility can guide exploration, but they should remain distinct from stronger clinical outcomes.',
      confidence: 'traditional',
      label: 'Traditional Context',
    },
  ]

  const visibleRecommendations = sourcingLinks.length > 0
    ? sourcingLinks.slice(0, 3)
    : defaultRecommendations

  return (
    <section className="compact-section section-rhythm-balanced">
      <div className="space-y-3">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Evidence-Aware Recommendations</p>
          <span className="chip-readable">Educational context only</span>
        </div>

        <h2 className="compact-heading">
          Explore sourcing and preparation carefully.
        </h2>

        <p className="compact-copy">
          Recommendations are framed around evidence maturity, formulation context, and sourcing transparency rather than aggressive optimization claims.
        </p>
      </div>

      {sourcing.length > 0 ? (
        <div className="flex flex-wrap gap-2">
          {sourcing.map((item) => (
            <span key={item} className="chip-readable">
              {item}
            </span>
          ))}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-3">
        {visibleRecommendations.map((item) => (
          <RecommendationCard key={item.title} item={item} />
        ))}
      </div>

      {stackIdeas.length > 0 ? (
        <div className="compact-section border border-brand-900/10 bg-white/70">
          <div className="space-y-2">
            <p className="eyebrow-label">Adjacent Exploration</p>
            <h3 className="text-lg font-semibold tracking-tight text-ink">
              Commonly explored supporting pathways
            </h3>
            <p className="compact-copy">
              These relationships are surfaced as semantic exploration context rather than prescriptive stack guidance.
            </p>
          </div>

          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {stackIdeas.slice(0, 6).map((item) => (
              <RecommendationCard key={item.title} item={item} />
            ))}
          </div>
        </div>
      ) : null}

      <div className="rounded-[1.4rem] border border-brand-900/10 bg-paper-50/80 p-4 text-sm leading-6 text-[#46574d]">
        <p>
          Some pages may contain affiliate relationships. Recommendation placement does not change evidence interpretation, safety framing, or editorial restraint standards.
        </p>

        {trust.length > 0 ? (
          <div className="mt-3 flex flex-wrap gap-2">
            {trust.map((item) => (
              <span key={item} className="chip-readable">
                {item}
              </span>
            ))}
          </div>
        ) : null}
      </div>
    </section>
  )
}
