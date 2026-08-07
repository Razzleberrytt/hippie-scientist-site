import { buildComparisonOutcomePerformance, type ComparisonOutcomeAnalyticsEvent } from '@/lib/comparisonOutcomeAnalyticsReport'

const LABELS: Record<string, string> = {
  herb_profile: 'Herb profile',
  compound_profile: 'Compound profile',
  safety_checker: 'Safety checker',
  reference: 'Reference / source',
  another_comparison: 'Another comparison',
  compare_hub: 'Comparison hub',
}

export default function ComparisonOutcomeAnalyticsPanel({ events }: { events: ComparisonOutcomeAnalyticsEvent[] }) {
  const report = buildComparisonOutcomePerformance(events)

  return (
    <section className='mt-3 rounded-md border border-white/10 bg-white/5 p-2'>
      <h3 className='text-xs font-semibold uppercase tracking-wide text-white/80'>Comparison research outcomes</h3>
      <p className='mt-1 text-xs text-white/65'>
        {report.attributedViews} unique comparison views · {report.attributedOutcomes} unique continuation actions
        {report.unattributedEvents ? ` · ${report.unattributedEvents} unattributed events excluded` : ''}
      </p>

      {report.pageRows.length === 0 ? (
        <p className='mt-2 text-xs text-white/60'>No comparison outcome data yet.</p>
      ) : (
        <div className='mt-2 overflow-x-auto'>
          <table className='min-w-full text-xs'>
            <thead><tr className='text-left text-white/65'><th className='pr-3 font-medium'>Page</th><th className='pr-3 font-medium'>Views</th><th className='pr-3 font-medium'>Continued</th><th className='pr-3 font-medium'>Rate</th><th className='font-medium'>Actions</th></tr></thead>
            <tbody>{report.pageRows.slice(0, 20).map(row => (
              <tr key={row.pageSlug} className='border-t border-white/10'>
                <td className='py-1.5 pr-3 font-medium text-white/95'>{row.pageSlug}</td>
                <td className='py-1.5 pr-3 text-white/80'>{row.views}</td>
                <td className='py-1.5 pr-3 text-white/80'>{row.engagedSessions}</td>
                <td className='py-1.5 pr-3 text-white/80'>{Math.round(row.continuationRate * 100)}%</td>
                <td className='py-1.5 text-white/80'>{row.outcomes}</td>
              </tr>
            ))}</tbody>
          </table>
        </div>
      )}

      <h4 className='mt-3 text-xs font-semibold uppercase tracking-wide text-white/80'>Continuation mix</h4>
      {report.outcomeRows.length === 0 ? (
        <p className='mt-1 text-xs text-white/60'>No continuation actions yet.</p>
      ) : (
        <div className='mt-1 grid gap-1 text-xs sm:grid-cols-2'>
          {report.outcomeRows.map(row => (
            <div key={row.outcome} className='flex justify-between gap-3 border-t border-white/10 py-1.5'>
              <span className='text-white/90'>{LABELS[row.outcome] ?? row.outcome}</span>
              <span className='text-white/70'>{row.clicks}</span>
            </div>
          ))}
        </div>
      )}
    </section>
  )
}
