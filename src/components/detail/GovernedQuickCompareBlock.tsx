import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import type {
  GovernedQuickCompareDimension,
  GovernedQuickCompareSection,
} from '@/lib/governedQuickCompare'
import { trackGovernedEvent, type GovernedPageType } from '@/lib/governedAnalytics'

const DIMENSION_LABELS: Record<GovernedQuickCompareDimension, string> = {
  evidence_strength: 'Evidence strength',
  safety_caution_presence: 'Safety cautions',
  uncertainty_or_conflict: 'Uncertainty/conflict',
  relationship_context: 'Relationship context',
  supported_use_overlap: 'Use-context overlap',
}

export default function GovernedQuickCompareBlock({
  section,
  analyticsContext,
}: {
  section: GovernedQuickCompareSection | null
  analyticsContext?: {
    pageType: GovernedPageType
    entityType: 'herb' | 'compound'
    entitySlug: string
    evidenceLabel?: string
    safetySignalPresent?: boolean
  }
}) {
  useEffect(() => {
    if (!analyticsContext || !section || section.cards.length === 0) return
    trackGovernedEvent({
      type: 'governed_quick_compare_visible',
      eventAction: 'visible',
      pageType: analyticsContext.pageType,
      entityType: analyticsContext.entityType,
      entitySlug: analyticsContext.entitySlug,
      surfaceId: 'governed_quick_compare',
      componentType: 'quick_compare_block',
      evidenceLabel: analyticsContext.evidenceLabel,
      safetySignalPresent: analyticsContext.safetySignalPresent,
      reviewedStatus: 'reviewed',
      freshnessState: 'not_applicable',
    })
  }, [analyticsContext, section])

  if (!section || section.cards.length === 0) return null

  return (
    <section id='governed-quick-compare' className='border-white/8 mt-6 border-t pt-5'>
      <h2 className='mb-2 text-xs font-semibold uppercase tracking-[0.18em] text-white/50'>
        Governed quick compare
      </h2>
      <p className='text-xs text-white/65'>
        Compact comparisons across approved governed pages only. This is not a ranking and does not
        replace interaction/safety review.
      </p>

      <div className='mt-3 space-y-3'>
        {section.cards.map(card => (
          <article
            key={`${card.targetType}:${card.targetSlug}`}
            className='rounded-xl border border-white/10 bg-white/[0.02] p-3'
          >
            <p className='text-sm font-semibold text-white'>
              <Link
                className='link'
                to={card.href}
                onClick={() => {
                  if (!analyticsContext) return
                  trackGovernedEvent({
                    type: 'governed_quick_compare_click',
                    eventAction: 'click',
                    pageType: analyticsContext.pageType,
                    entityType: analyticsContext.entityType,
                    entitySlug: analyticsContext.entitySlug,
                    surfaceId: 'governed_quick_compare',
                    componentType: 'quick_compare_card',
                    item: `${card.targetType}:${card.targetSlug}`,
                    evidenceLabel: analyticsContext.evidenceLabel,
                    safetySignalPresent: analyticsContext.safetySignalPresent,
                    reviewedStatus: 'reviewed',
                    freshnessState: 'not_applicable',
                  })
                }}
              >
                {card.targetName}
              </Link>
            </p>
            <dl className='mt-2 space-y-1 text-xs text-white/80'>
              {(Object.keys(card.dimensions) as GovernedQuickCompareDimension[]).map(dimension => (
                <div key={dimension}>
                  <dt className='inline font-semibold text-white'>{DIMENSION_LABELS[dimension]}: </dt>
                  <dd className='inline'>{card.dimensions[dimension]}</dd>
                </div>
              ))}
            </dl>
          </article>
        ))}
      </div>
    </section>
  )
}
