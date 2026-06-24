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
  const isHuman = ['RCT', 'Cohort', 'Meta-analysis', 'Systematic Review'].includes(designType)

  const borderClass = isHuman
    ? 'border-brand-900/10 bg-brand-50/30 dark:border-white/10 dark:bg-white/5'
    : 'border-amber-900/10 bg-amber-50/40 dark:border-amber-200/20 dark:bg-amber-300/10'

  const headerBadgeClass = isHuman
    ? 'border-brand-200 bg-brand-100 text-brand-900 dark:border-brand-200/20 dark:bg-brand-200/10 dark:text-brand-100'
    : 'border-amber-200 bg-amber-100 text-amber-900 dark:border-amber-200/20 dark:bg-amber-300/10 dark:text-amber-100'
  const headingId = `trial-design-${String(title || designType).toLowerCase().replace(/[^a-z0-9]+/g, '-')}`

  return (
    <section
      className={`my-6 rounded-[1rem] border p-5 shadow-sm transition-all ${borderClass}`}
      aria-labelledby={title ? headingId : undefined}
      aria-label={title ? undefined : `Trial Design Insight: ${designType}`}
    >
      <div className="flex flex-col gap-3">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className={`rounded-full border px-2.5 py-0.5 font-bold uppercase tracking-wider ${headerBadgeClass}`}>
            {designType}
          </span>

          {sampleSize !== undefined && (
            <span className="rounded-full border border-brand-900/10 bg-white/75 px-2.5 py-0.5 font-semibold text-muted dark:border-white/10 dark:bg-white/5">
              n = {sampleSize} participants
            </span>
          )}

          {duration && (
            <span className="rounded-full border border-brand-900/10 bg-white/75 px-2.5 py-0.5 font-semibold text-muted dark:border-white/10 dark:bg-white/5">
              {duration}
            </span>
          )}

          {blinding && blinding !== 'None' && (
            <span className="rounded-full border border-brand-900/10 bg-white/75 px-2.5 py-0.5 font-semibold text-muted dark:border-white/10 dark:bg-white/5">
              {blinding}
            </span>
          )}

          {control && control !== 'Uncontrolled' && (
            <span className="rounded-full border border-brand-900/10 bg-white/75 px-2.5 py-0.5 font-semibold text-muted dark:border-white/10 dark:bg-white/5">
              {control}
            </span>
          )}
        </div>

        {title && (
          <h3 id={headingId} className="mt-1 font-display text-lg font-bold tracking-tight text-ink">
            {title}
          </h3>
        )}

        <div className="text-sm leading-6 text-muted prose-sm">
          {children}
        </div>

        {!isHuman && (
          <div className="mt-2 rounded-lg border border-amber-900/10 bg-amber-50/60 p-2.5 text-[0.7rem] leading-4 text-amber-900/90 dark:border-amber-200/20 dark:bg-amber-300/10 dark:text-amber-100/90">
            <strong>Preclinical Model:</strong> Cell cultures (in vitro) and animal models explore biological pathways, receptors, and mechanisms. They establish plausibility but do not prove clinical safety or efficacy in living humans.
          </div>
        )}
      </div>
    </section>
  )
}
