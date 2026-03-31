import Collapse from '@/components/ui/Collapse'
import { useEffect } from 'react'
import type { GovernedReviewFreshnessDecision } from '@/lib/governedReviewFreshness'
import { trackGovernedEvent, type GovernedPageType } from '@/lib/governedAnalytics'

function toneClass(tone: GovernedReviewFreshnessDecision['statusTone']) {
  if (tone === 'positive') return 'border-emerald-300/35 bg-emerald-500/10 text-emerald-100'
  if (tone === 'caution') return 'border-amber-300/35 bg-amber-500/10 text-amber-100'
  return 'border-rose-300/35 bg-rose-500/10 text-rose-100'
}

export default function GovernedReviewFreshnessPanel({
  decision,
  analyticsContext,
}: {
  decision: GovernedReviewFreshnessDecision
  analyticsContext?: {
    pageType: GovernedPageType
    entityType: 'herb' | 'compound'
    entitySlug: string
  }
}) {
  useEffect(() => {
    if (!analyticsContext || decision.mode !== 'governed') return
    trackGovernedEvent({
      type: 'governed_review_freshness_visible',
      eventAction: 'visible',
      pageType: analyticsContext.pageType,
      entityType: analyticsContext.entityType,
      entitySlug: analyticsContext.entitySlug,
      surfaceId: 'governed_review_freshness',
      componentType: 'review_freshness_panel',
      safetySignalPresent: decision.uncertaintyVisible,
      reviewedStatus: 'reviewed',
      freshnessState: decision.statusTone === 'positive' ? 'fresh' : decision.statusTone === 'caution' ? 'aging' : 'stale',
    })
  }, [analyticsContext, decision.statusTone, decision.uncertaintyVisible])
  if (decision.mode !== 'governed') return null

  return (
    <section className='mt-4 rounded-2xl border border-white/15 bg-white/[0.03] p-4'>
      <div className='flex flex-wrap items-center gap-2'>
        <span className='rounded-full border border-white/20 bg-black/25 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-white/85'>
          {decision.reviewedLabel}
        </span>
        <span className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${toneClass(decision.statusTone)}`}>
          {decision.statusLabel}
        </span>
        {decision.uncertaintyVisible && (
          <span className='rounded-full border border-rose-300/30 bg-rose-500/10 px-3 py-1 text-xs font-semibold uppercase tracking-wide text-rose-100'>
            Uncertainty noted
          </span>
        )}
      </div>

      <div className='mt-3'>
        <Collapse
          title='What changed recently'
          onToggle={open => {
            if (!open || !analyticsContext) return
            trackGovernedEvent({
              type: 'governed_review_freshness_toggle',
              eventAction: 'toggle',
              pageType: analyticsContext.pageType,
              entityType: analyticsContext.entityType,
              entitySlug: analyticsContext.entitySlug,
              surfaceId: 'governed_review_freshness',
              componentType: 'review_freshness_panel',
              reviewedStatus: 'reviewed',
              freshnessState:
                decision.statusTone === 'positive'
                  ? 'fresh'
                  : decision.statusTone === 'caution'
                    ? 'aging'
                    : 'stale',
            })
          }}
        >
          <ul className='list-disc space-y-1 pl-5 text-sm leading-relaxed text-white/80'>
            {decision.whatChangedRecently.map(item => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </Collapse>
      </div>
    </section>
  )
}
