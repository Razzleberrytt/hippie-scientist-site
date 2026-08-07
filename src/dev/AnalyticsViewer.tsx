import { useEffect, useMemo, useState } from 'react'
import { buildAtlasRecoveryPerformance, buildAtlasSourcePerformance, buildRelatedBotanicalPerformance } from '@/lib/atlasAnalyticsReport'
import { buildCompareHubPerformance } from '@/lib/compareHubAnalyticsReport'
import ComparisonOutcomeAnalyticsPanel from '@/dev/ComparisonOutcomeAnalyticsPanel'
import { readAnalyticsEvents, type StoredAnalyticsEvent } from '@/utils/analytics/eventStorage'

type GroupRow = { label: string; count: number }

function groupCounts(events: StoredAnalyticsEvent[], selectLabel: (event: StoredAnalyticsEvent) => string) {
  const counts = new Map<string, number>()
  events.forEach(event => {
    const label = selectLabel(event)
    counts.set(label, (counts.get(label) ?? 0) + 1)
  })
  return Array.from(counts.entries())
    .map(([label, count]) => ({ label, count }))
    .sort((a, b) => b.count - a.count || a.label.localeCompare(b.label))
}

function Table({ title, rows }: { title: string; rows: GroupRow[] }) {
  return <section><h3 className='text-xs font-semibold uppercase tracking-wide text-white/80'>{title}</h3>{rows.length === 0 ? <p className='mt-1 text-xs text-white/60'>No data</p> : <table className='mt-1 w-full text-xs'><thead><tr className='text-left text-white/65'><th className='pr-2 font-medium'>Value</th><th className='font-medium'>Clicks</th></tr></thead><tbody>{rows.map(row => <tr key={`${title}-${row.label}`} className='border-t border-white/10'><td className='py-1 pr-2 text-white/90'>{row.label}</td><td className='py-1 text-white/80'>{row.count}</td></tr>)}</tbody></table>}</section>
}

export default function AnalyticsViewer() {
  const [events, setEvents] = useState<StoredAnalyticsEvent[]>(() => readAnalyticsEvents())

  useEffect(() => {
    const refresh = () => setEvents(readAnalyticsEvents())
    window.addEventListener('hs:analytics-events-updated', refresh)
    window.addEventListener('storage', refresh)
    return () => {
      window.removeEventListener('hs:analytics-events-updated', refresh)
      window.removeEventListener('storage', refresh)
    }
  }, [])

  const clickEvents = useMemo(() => events.filter(event => event.type === 'affiliate_link_click'), [events])
  const atlasReport = useMemo(() => buildAtlasSourcePerformance(events), [events])
  const recoveryReport = useMemo(() => buildAtlasRecoveryPerformance(events), [events])
  const relatedReport = useMemo(() => buildRelatedBotanicalPerformance(events), [events])
  const compareHubReport = useMemo(() => buildCompareHubPerformance(events), [events])
  const byHerb = useMemo(() => groupCounts(clickEvents, event => event.slug || 'unknown'), [clickEvents])
  const byProduct = useMemo(() => groupCounts(clickEvents, event => event.item || 'unknown'), [clickEvents])
  const byPosition = useMemo(() => groupCounts(clickEvents, event => event.productPosition || 'unknown'), [clickEvents])
  const byUseCaseAnchor = useMemo(() => groupCounts(clickEvents, event => event.useCaseAnchor || 'none'), [clickEvents])

  return <aside className='fixed bottom-3 right-3 z-[100] max-h-[80vh] w-[min(52rem,96vw)] overflow-auto rounded-lg border border-white/15 bg-black/85 p-3 text-white shadow-lg backdrop-blur'>
    <h2 className='text-sm font-semibold text-white'>Dev Analytics Viewer</h2>

    <section className='mt-3 rounded-md border border-white/10 bg-white/5 p-2'>
      <h3 className='text-xs font-semibold uppercase tracking-wide text-white/80'>Atlas source performance</h3>
      <p className='mt-1 text-xs text-white/65'>{atlasReport.attributedSessions} attributed sessions{atlasReport.unattributedEvents ? ` · ${atlasReport.unattributedEvents} legacy events excluded` : ''}</p>
      {atlasReport.rows.length === 0 ? <p className='mt-2 text-xs text-white/60'>No session-level atlas data yet.</p> : <div className='mt-2 overflow-x-auto'><table className='min-w-full text-xs'><thead><tr className='text-left text-white/65'><th className='pr-3 font-medium'>Source</th><th className='pr-3 font-medium'>Sessions</th><th className='pr-3 font-medium'>Profile rate</th><th className='pr-3 font-medium'>Avg depth</th><th className='font-medium'>Top first filter</th></tr></thead><tbody>{atlasReport.rows.map(row => <tr key={row.source} className='border-t border-white/10'><td className='py-1.5 pr-3 font-medium text-white/95'>{row.source}</td><td className='py-1.5 pr-3 text-white/80'>{row.sessions}</td><td className='py-1.5 pr-3 text-white/80'>{Math.round(row.profileOpenRate * 100)}%</td><td className='py-1.5 pr-3 text-white/80'>{row.averageFilterDepth.toFixed(1)}</td><td className='py-1.5 text-white/80'>{row.topFirstFilter}</td></tr>)}</tbody></table></div>}
    </section>

    <section className='mt-3 rounded-md border border-white/10 bg-white/5 p-2'>
      <h3 className='text-xs font-semibold uppercase tracking-wide text-white/80'>Atlas recovery performance</h3>
      <p className='mt-1 text-xs text-white/65'>{recoveryReport.recoverySessions} recovery sessions{recoveryReport.unattributedEvents ? ` · ${recoveryReport.unattributedEvents} legacy events excluded` : ''}</p>
      {recoveryReport.rows.length === 0 ? <p className='mt-2 text-xs text-white/60'>No recovery-funnel data yet.</p> : <div className='mt-2 overflow-x-auto'><table className='min-w-full text-xs'><thead><tr className='text-left text-white/65'><th className='pr-3 font-medium'>Action</th><th className='pr-3 font-medium'>Shown</th><th className='pr-3 font-medium'>Accepted</th><th className='pr-3 font-medium'>Accept rate</th><th className='pr-3 font-medium'>Profile rate</th><th className='font-medium'>Avg restored</th></tr></thead><tbody>{recoveryReport.rows.map(row => <tr key={row.action} className='border-t border-white/10'><td className='py-1.5 pr-3 font-medium text-white/95'>{row.action}</td><td className='py-1.5 pr-3 text-white/80'>{row.impressions}</td><td className='py-1.5 pr-3 text-white/80'>{row.acceptances}</td><td className='py-1.5 pr-3 text-white/80'>{Math.round(row.acceptanceRate * 100)}%</td><td className='py-1.5 pr-3 text-white/80'>{Math.round(row.postRecoveryProfileRate * 100)}%</td><td className='py-1.5 text-white/80'>{row.averageRestoredResults.toFixed(1)}</td></tr>)}</tbody></table></div>}
    </section>

    <section className='mt-3 rounded-md border border-white/10 bg-white/5 p-2'>
      <h3 className='text-xs font-semibold uppercase tracking-wide text-white/80'>Related Botanicals performance</h3>
      <p className='mt-1 text-xs text-white/65'>{relatedReport.attributedImpressions} unique card impressions · {relatedReport.attributedClicks} unique clicks{relatedReport.unattributedEvents ? ` · ${relatedReport.unattributedEvents} unattributed events excluded` : ''}</p>
      {relatedReport.cardRows.length === 0 ? <p className='mt-2 text-xs text-white/60'>No Related Botanicals data yet.</p> : <div className='mt-2 overflow-x-auto'><table className='min-w-full text-xs'><thead><tr className='text-left text-white/65'><th className='pr-3 font-medium'>Card</th><th className='pr-3 font-medium'>Pos</th><th className='pr-3 font-medium'>Shown</th><th className='pr-3 font-medium'>Clicks</th><th className='pr-3 font-medium'>CTR</th><th className='pr-3 font-medium'>Avg depth</th><th className='font-medium'>Depth 3+</th></tr></thead><tbody>{relatedReport.cardRows.slice(0, 20).map(row => <tr key={`${row.sourceSlug}:${row.targetSlug}:${row.position}`} className='border-t border-white/10'><td className='py-1.5 pr-3 font-medium text-white/95'>{row.sourceSlug} → {row.targetSlug}</td><td className='py-1.5 pr-3 text-white/80'>{row.position}</td><td className='py-1.5 pr-3 text-white/80'>{row.impressions}</td><td className='py-1.5 pr-3 text-white/80'>{row.clicks}</td><td className='py-1.5 pr-3 text-white/80'>{Math.round(row.ctr * 100)}%</td><td className='py-1.5 pr-3 text-white/80'>{row.averageClickDepth.toFixed(1)}</td><td className='py-1.5 text-white/80'>{Math.round(row.deepExplorationRate * 100)}%</td></tr>)}</tbody></table></div>}

      <h4 className='mt-3 text-xs font-semibold uppercase tracking-wide text-white/80'>Reason signal performance</h4>
      {relatedReport.reasonRows.length === 0 ? <p className='mt-1 text-xs text-white/60'>No reason-signal data yet.</p> : <div className='mt-1 overflow-x-auto'><table className='min-w-full text-xs'><thead><tr className='text-left text-white/65'><th className='pr-3 font-medium'>Reason</th><th className='pr-3 font-medium'>Shown</th><th className='pr-3 font-medium'>Clicks</th><th className='pr-3 font-medium'>CTR</th><th className='pr-3 font-medium'>Avg depth</th><th className='font-medium'>Depth 3+</th></tr></thead><tbody>{relatedReport.reasonRows.map(row => <tr key={row.reasonType} className='border-t border-white/10'><td className='py-1.5 pr-3 font-medium text-white/95'>{row.reasonType}</td><td className='py-1.5 pr-3 text-white/80'>{row.impressions}</td><td className='py-1.5 pr-3 text-white/80'>{row.clicks}</td><td className='py-1.5 pr-3 text-white/80'>{Math.round(row.ctr * 100)}%</td><td className='py-1.5 pr-3 text-white/80'>{row.averageClickDepth.toFixed(1)}</td><td className='py-1.5 text-white/80'>{Math.round(row.deepExplorationRate * 100)}%</td></tr>)}</tbody></table></div>}
    </section>

    <section className='mt-3 rounded-md border border-white/10 bg-white/5 p-2'>
      <h3 className='text-xs font-semibold uppercase tracking-wide text-white/80'>Comparison hub performance</h3>
      <p className='mt-1 text-xs text-white/65'>{compareHubReport.attributedCategoryImpressions} category impressions · {compareHubReport.attributedClicks} unique destination clicks · {compareHubReport.dynamicMatrixClicks} dynamic-matrix clicks{compareHubReport.unattributedEvents ? ` · ${compareHubReport.unattributedEvents} unattributed events excluded` : ''}</p>
      {compareHubReport.categoryRows.length === 0 ? <p className='mt-2 text-xs text-white/60'>No comparison-hub data yet.</p> : <div className='mt-2 overflow-x-auto'><table className='min-w-full text-xs'><thead><tr className='text-left text-white/65'><th className='pr-3 font-medium'>Category</th><th className='pr-3 font-medium'>Seen</th><th className='pr-3 font-medium'>Clicks</th><th className='font-medium'>CTR</th></tr></thead><tbody>{compareHubReport.categoryRows.map(row => <tr key={row.category} className='border-t border-white/10'><td className='py-1.5 pr-3 font-medium text-white/95'>{row.category}</td><td className='py-1.5 pr-3 text-white/80'>{row.impressions}</td><td className='py-1.5 pr-3 text-white/80'>{row.clicks}</td><td className='py-1.5 text-white/80'>{Math.round(row.ctr * 100)}%</td></tr>)}</tbody></table></div>}

      <h4 className='mt-3 text-xs font-semibold uppercase tracking-wide text-white/80'>Top goal starters</h4>
      {compareHubReport.goalRows.length === 0 ? <p className='mt-1 text-xs text-white/60'>No goal-starter clicks yet.</p> : <div className='mt-1 grid gap-1 text-xs sm:grid-cols-2'>{compareHubReport.goalRows.slice(0, 8).map(row => <div key={row.label} className='flex justify-between gap-3 border-t border-white/10 py-1.5'><span className='text-white/90'>{row.label}</span><span className='text-white/70'>{row.clicks}</span></div>)}</div>}

      <h4 className='mt-3 text-xs font-semibold uppercase tracking-wide text-white/80'>Top comparison destinations</h4>
      {compareHubReport.routeRows.length === 0 ? <p className='mt-1 text-xs text-white/60'>No comparison clicks yet.</p> : <div className='mt-1 overflow-x-auto'><table className='min-w-full text-xs'><thead><tr className='text-left text-white/65'><th className='pr-3 font-medium'>Destination</th><th className='font-medium'>Clicks</th></tr></thead><tbody>{compareHubReport.routeRows.slice(0, 12).map(row => <tr key={row.href} className='border-t border-white/10'><td className='py-1.5 pr-3 text-white/90'>{row.label}</td><td className='py-1.5 text-white/80'>{row.clicks}</td></tr>)}</tbody></table></div>}
    </section>

    <ComparisonOutcomeAnalyticsPanel events={events} />

    <p className='mt-3 text-xs text-white/75'>Total affiliate clicks: {clickEvents.length}</p>
    <div className='mt-3 space-y-3'><Table title='Clicks by herb' rows={byHerb} /><Table title='Clicks by product' rows={byProduct} /><Table title='Clicks by position' rows={byPosition} /><Table title='Clicks by use-case anchor' rows={byUseCaseAnchor} /></div>
  </aside>
}
