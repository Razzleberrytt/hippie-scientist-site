import { Link } from 'react-router-dom'
import { useEffect } from 'react'
import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import { trackGovernedEvent, type GovernedPageType } from '@/lib/governedAnalytics'

type IntroLink = {
  label: string
  to: string
  variant?: 'primary' | 'secondary'
}

type StructuredDetailIntroProps = {
  confidence: ConfidenceLevel
  whatItIs: string
  commonUse: string
  evidenceContext: string
  cautionNote?: string
  quickFacts?: string[]
  nextSteps: IntroLink[]
  onStepClick?: (step: IntroLink) => void
  analyticsContext?: {
    pageType: GovernedPageType
    entityType: 'herb' | 'compound'
    entitySlug: string
    profile?: string
  }
}

function confidenceLabel(confidence: ConfidenceLevel) {
  if (confidence === 'high') return 'Higher-confidence profile'
  if (confidence === 'medium') return 'Mixed-confidence profile'
  return 'Lower-confidence profile'
}

function confidenceClass(confidence: ConfidenceLevel) {
  if (confidence === 'high') return 'border-emerald-300/40 bg-emerald-500/10 text-emerald-100'
  if (confidence === 'medium') return 'border-amber-300/40 bg-amber-500/10 text-amber-100'
  return 'border-rose-300/40 bg-rose-500/10 text-rose-100'
}

export default function StructuredDetailIntro({
  confidence,
  whatItIs,
  commonUse,
  evidenceContext,
  cautionNote,
  quickFacts = [],
  nextSteps,
  onStepClick,
  analyticsContext,
}: StructuredDetailIntroProps) {
  useEffect(() => {
    if (!analyticsContext) return
    trackGovernedEvent({
      type: 'governed_intro_visible',
      eventAction: 'visible',
      pageType: analyticsContext.pageType,
      entityType: analyticsContext.entityType,
      entitySlug: analyticsContext.entitySlug,
      surfaceId: 'structured_detail_intro',
      componentType: 'intro_summary',
      profile: analyticsContext.profile,
      reviewedStatus: 'reviewed',
      freshnessState: 'not_applicable',
    })
  }, [analyticsContext])

  return (
    <section className='mt-4 rounded-xl border border-sky-300/25 bg-sky-500/10 p-4 text-sm text-sky-50'>
      <div className='flex flex-wrap items-center gap-2'>
        <p className='text-xs font-semibold uppercase tracking-[0.12em] text-sky-100/90'>Quick intro</p>
        <span
          className={`rounded-full border px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.08em] ${confidenceClass(confidence)}`}
        >
          {confidenceLabel(confidence)}
        </span>
      </div>

      <div className='mt-3 space-y-2 leading-7 text-sky-50/95'>
        <p>
          <span className='font-semibold text-white'>What it is:</span> {whatItIs}
        </p>
        <p>
          <span className='font-semibold text-white'>Common use:</span> {commonUse}
        </p>
        <p>
          <span className='font-semibold text-white'>Evidence context:</span> {evidenceContext}
        </p>
        {cautionNote && (
          <p className='rounded-lg border border-rose-300/35 bg-rose-500/15 px-3 py-2 text-rose-50'>
            <span className='font-semibold'>Caution:</span> {cautionNote}
          </p>
        )}
      </div>

      {quickFacts.length > 0 && <p className='mt-2 text-xs text-sky-100/85'>{quickFacts.join(' · ')}</p>}

      <div className='mt-3 flex flex-wrap gap-2'>
        {nextSteps.map(step => (
          <Link
            key={`${step.to}-${step.label}`}
            to={step.to}
            onClick={() => {
              if (analyticsContext) {
                trackGovernedEvent({
                  type: 'governed_intro_step_click',
                  eventAction: 'click',
                  pageType: analyticsContext.pageType,
                  entityType: analyticsContext.entityType,
                  entitySlug: analyticsContext.entitySlug,
                  surfaceId: 'structured_detail_intro',
                  componentType: 'intro_next_step',
                  item: step.label,
                  profile: analyticsContext.profile,
                  reviewedStatus: 'reviewed',
                  freshnessState: 'not_applicable',
                })
              }
              onStepClick?.(step)
            }}
            className={step.variant === 'secondary' ? 'btn-secondary text-xs' : 'btn-primary text-xs'}
          >
            {step.label}
          </Link>
        ))}
      </div>
    </section>
  )
}
