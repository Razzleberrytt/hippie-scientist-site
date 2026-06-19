import { buildRuntimeComponentIntegration } from '../../lib/runtime-component-integration'

function confidenceLabel(value: number) {
  if (value >= 85) {
    return 'high confidence'
  }

  if (value >= 60) {
    return 'moderate confidence'
  }

  return 'emerging confidence'
}

type ConfidenceRenderingSectionProps = {
  source: any
  candidates: any[]
}

export function ConfidenceRenderingSection({
  source,
  candidates,
}: ConfidenceRenderingSectionProps) {
  const integration = buildRuntimeComponentIntegration(
    source,
    candidates,
  )

  const confidenceScore = Math.min(
    integration.recommendationCount * 12 +
      integration.navigationCount * 8,
    100,
  )

  return (
    <section className="space-y-6 rounded-3xl border border-emerald-100 bg-gradient-to-br from-emerald-50/70 to-white p-6 shadow-sm">
      <div className="space-y-2">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-emerald-700">
          Confidence Signals
        </p>

        <h2 className="text-2xl font-semibold tracking-tight text-ink">
          Educational confidence & continuity indicators
        </h2>

        <p className="max-w-3xl text-sm leading-7 text-muted">
          Explore freshness-aware educational indicators,
          continuity confidence systems, and adaptive semantic
          rendering governance.
        </p>
      </div>

      <div className="grid gap-5 lg:grid-cols-2">
        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-5">
          <div className="flex items-start justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-muted">
                Confidence level
              </p>

              <h3 className="mt-2 text-3xl font-semibold text-ink">
                {confidenceLabel(confidenceScore)}
              </h3>
            </div>

            <div className="rounded-2xl bg-emerald-50 px-4 py-3 text-right">
              <p className="text-[11px] uppercase tracking-[0.18em] text-muted">
                Score
              </p>

              <p className="text-2xl font-semibold text-emerald-900">
                {confidenceScore}
              </p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-2 border-t border-emerald-100 pt-4">
            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
              continuity aware
            </span>

            <span className="rounded-full bg-neutral-100 px-3 py-1 text-[11px] text-neutral-700">
              adaptive rendering
            </span>

            {integration.freshnessNoticeEnabled ? (
              <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] text-emerald-800">
                freshness monitored
              </span>
            ) : null}
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-100 bg-white/80 p-5">
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium text-muted">
                Rendering profile
              </p>

              <h3 className="mt-2 text-2xl font-semibold text-ink">
                {integration.componentMode.replace('-', ' ')}
              </h3>
            </div>

            <div className="space-y-3 text-sm text-muted">
              <div className="flex items-center justify-between">
                <span>Recommendation modules</span>
                <span className="font-medium text-ink">
                  {integration.recommendationModulesEnabled
                    ? 'Enabled'
                    : 'Limited'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Continuity systems</span>
                <span className="font-medium text-ink">
                  {integration.continuityModulesEnabled
                    ? 'Active'
                    : 'Restricted'}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span>Authority highlighting</span>
                <span className="font-medium text-ink">
                  {integration.authorityHighlightsEnabled
                    ? 'Enhanced'
                    : 'Standard'}
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
