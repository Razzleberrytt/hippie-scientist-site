import { useEffect, useMemo, useState } from 'react'
import { buildAtlasRecoveryPerformance, buildAtlasSourcePerformance } from '@/lib/atlasAnalyticsReport'
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
  const byHerb = useMemo(() => groupCounts(clickEvents, event => event.slug || 'unknown'), [clickEvents])
  const byProduct = useMemo(() => groupCounts(clickEvents, event => event.item || 'unknown'), [clickEvents])
  const byPosition = useMemo(() => groupCounts(clickEvents, event => event.productPosition || 'unknown'), [clickEvents])
  const byUseCaseAnchor = useMemo(() => groupCounts(clickEvents, event => event.useCaseAnchor || 'none'), [clickEvents])

  return <aside className='fixed bottom-3 right-3 z-[100] max-h-[80vh] w-[min(44rem,96vw)] overflow-auto rounded-lg border border-white/15 bg-black/85 p-3 text-white shadow-lg backdrop-blur'>
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

    <p className='mt-3 text-xs text-white/75'>Total affiliate clicks: {clickEvents.length}</p>
    <div className='mt-3 space-y-3'><Table title='Clicks by herb' rows={byHerb} /><Table title='Clicks by product' rows={byProduct} /><Table title='Clicks by position' rows={byPosition} /><Table title='Clicks by use-case anchor' rows={byUseCaseAnchor} /></div>
  </aside>
}
