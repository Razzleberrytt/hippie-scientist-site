import * as React from 'react'

export interface TrialDesignInsightProps {
  designType: 'RCT' | 'Cohort' | 'Meta-analysis' | 'Systematic Review' | 'Animal' | 'In Vitro' | string
  sampleSize?: number
  duration?: string
  blinding?: 'Double-blind' | 'Single-blind' | 'Open-label' | 'None' | string
  control?: 'Placebo-controlled' | 'Active comparator' | 'Uncontrolled' | string
  title?: string
  children: React.ReactNode
}

export default function TrialDesignInsight({
  designType,
  sampleSize,
  duration,
  blinding,
  control,
  title,
  children,
}: TrialDesignInsightProps) {
  // Determine if it's a human trial
  const isHuman = ['RCT', 'Cohort', 'Meta-analysis', 'Systematic Review'].includes(designType)

  // Determine color coding based on design type
  const borderClass = isHuman 
    ? 'border-brand-900/10 bg-brand-50/20' 
    : 'border-amber-900/10 bg-amber-50/10'
  
  const headerBadgeClass = isHuman
    ? 'bg-brand-100 text-brand-900 border-brand-200'
    : 'bg-amber-100 text-amber-900 border-amber-200'

  return (
    <section 
      className={`my-6 rounded-[1rem] border p-5 shadow-sm transition-all ${borderClass}`}
      aria-label={`Trial Design Insight: ${title || designType}`}
    >
      <div className="flex flex-col gap-3">
        {/* Top Header Badge Row */}
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full border px-2.5 py-0.5 font-bold uppercase tracking-wider ${headerBadgeClass}`}>
            {designType}
          </span>

          {sampleSize !== undefined && (
            <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">
              n = {sampleSize} participants
            </span>
          )}

          {duration && (
            <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">
              {duration}
            </span>
          )}

          {blinding && blinding !== 'None' && (
            <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">
              {blinding}
            </span>
          )}

          {control && control !== 'Uncontrolled' && (
            <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">
              {control}
            </span>
          )}
        </div>

        {/* Title (Optional) */}
        {title && (
          <h4 className="font-display text-lg font-bold tracking-tight text-ink mt-1">
            {title}
          </h4>
        )}

        {/* Content Block */}
        <div className="text-sm leading-6 text-[#46574d] prose-sm">
          {children}
        </div>

        {/* Preclinical warning disclaimer for non-human studies */}
        {!isHuman && (
          <div className="mt-2 rounded-lg bg-amber-50/50 p-2.5 text-[0.7rem] leading-4 text-amber-900/80 border border-amber-900/5">
            <strong>Preclinical Model:</strong> Cell cultures (in vitro) and animal models explore biological pathways, receptors, and mechanisms. They establish plausibility but do not prove clinical safety or efficacy in living humans.
          </div>
        )}
      </div>
    </section>
  )
}
