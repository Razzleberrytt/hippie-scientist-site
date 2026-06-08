'use client'

import { useMemo } from 'react'
import { getRuntimeAnalyticsEvents } from '@/lib/runtime-analytics'
import {
  getAnalyticsInsights,
  getAuthorityClusterSignals,
  getFailedSearchCandidates,
  getTraversalDepth,
} from '@/lib/analytics-intelligence'

function labelForType(type: string) {
  switch (type) {
    case 'search':
      return 'Search signal'
    case 'profile':
      return 'Profile view'
    case 'compare':
      return 'Compare interaction'
    case 'recommendation':
      return 'Recommendation signal'
    case 'rail':
      return 'Rail interaction'
    default:
      return 'Expansion signal'
  }
}

export default function AnalyticsIntelligencePanel() {
  const data = useMemo(() => {
    const events = getRuntimeAnalyticsEvents()

    return {
      events,
      insights: getAnalyticsInsights(events, 12),
      failedSearches: getFailedSearchCandidates(events).slice(0, 8),
      traversalDepth: getTraversalDepth(events),
      authoritySignals: getAuthorityClusterSignals(events).slice(0, 10),
    }
  }, [])

  return (
    <section className="compact-section section-rhythm-balanced">
      <div className="space-y-2">
        <div className="flex flex-wrap items-center gap-2">
          <p className="eyebrow-label">Analytics Intelligence</p>
          <span className="chip-readable">Local behavioral signals</span>
        </div>

        <h2 className="compact-heading">Discovery behavior snapshot.</h2>

        <p className="compact-copy">
          This panel summarizes local exploration behavior to help identify search demand, traversal depth, and authority-cluster opportunities.
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <article className="compact-card text-center">
          <p className="text-3xl font-semibold tracking-tight text-ink">{data.events.length}</p>
          <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#46574d]">Events</p>
        </article>

        <article className="compact-card text-center">
          <p className="text-3xl font-semibold tracking-tight text-ink">{data.traversalDepth}</p>
          <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#46574d]">Traversal depth</p>
        </article>

        <article className="compact-card text-center">
          <p className="text-3xl font-semibold tracking-tight text-ink">{data.failedSearches.length}</p>
          <p className="mt-2 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-[#46574d]">Failed searches</p>
        </article>
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Top behavioral signals</p>

          <div className="space-y-2">
            {data.insights.length > 0 ? (
              data.insights.map((insight) => (
                <div key={`${insight.type}-${insight.label}`} className="flex items-center justify-between gap-3 rounded-2xl border border-brand-900/10 bg-white/75 px-3 py-2">
                  <div>
                    <p className="text-sm font-semibold leading-tight text-ink">{insight.label}</p>
                    <p className="text-xs text-[#64766b]">{labelForType(insight.type)}</p>
                  </div>
                  <span className="chip-readable">{insight.value}</span>
                </div>
              ))
            ) : (
              <p className="text-sm leading-6 text-[#46574d]">No local analytics events captured yet.</p>
            )}
          </div>
        </article>

        <article className="compact-card section-rhythm-compact">
          <p className="eyebrow-label">Content opportunity signals</p>

          <div className="space-y-4">
            <div>
              <p className="text-sm font-semibold text-ink">Failed or thin searches</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.failedSearches.length > 0 ? (
                  data.failedSearches.map((query) => (
                    <span key={query} className="chip-readable">{query}</span>
                  ))
                ) : (
                  <span className="chip-readable">No failed searches yet</span>
                )}
              </div>
            </div>

            <div>
              <p className="text-sm font-semibold text-ink">Authority cluster signals</p>
              <div className="mt-2 flex flex-wrap gap-2">
                {data.authoritySignals.length > 0 ? (
                  data.authoritySignals.map((signal) => (
                    <span key={signal} className="chip-readable">{signal}</span>
                  ))
                ) : (
                  <span className="chip-readable">No cluster signals yet</span>
                )}
              </div>
            </div>
          </div>
        </article>
      </div>
    </section>
  )
}
