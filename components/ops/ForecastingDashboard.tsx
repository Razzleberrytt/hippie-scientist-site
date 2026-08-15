import type { ForecastDashboard as ForecastDashboardData } from '@/src/lib/forecasting-dashboard'

function percent(value: number): string {
  return `${(value * 100).toFixed(1)}%`
}

function money(value: number): string {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value)
}

export default function ForecastingDashboard({ dashboard }: { dashboard: ForecastDashboardData }) {
  return (
    <section className="space-y-4" aria-labelledby="forecasting-dashboard-title">
      <div>
        <h2 id="forecasting-dashboard-title" className="text-2xl font-bold text-ink">
          Content-cluster forecasting dashboard
        </h2>
        <p className="mt-1 text-sm text-muted">
          Search, indexation, conversion, revenue, backlink, and AI-citation signals in one view.
        </p>
      </div>

      <div className="overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/80">
        <table className="min-w-[1200px] w-full text-left text-sm">
          <thead className="bg-brand-50/70 text-xs uppercase tracking-wide text-brand-900">
            <tr>
              <th scope="col" className="px-3 py-3">Cluster</th>
              <th scope="col" className="px-3 py-3">Impressions</th>
              <th scope="col" className="px-3 py-3">Clicks</th>
              <th scope="col" className="px-3 py-3">Avg position</th>
              <th scope="col" className="px-3 py-3">Indexed URLs</th>
              <th scope="col" className="px-3 py-3">Crawled / not indexed</th>
              <th scope="col" className="px-3 py-3">Affiliate clicks</th>
              <th scope="col" className="px-3 py-3">Email signups</th>
              <th scope="col" className="px-3 py-3">Revenue</th>
              <th scope="col" className="px-3 py-3">Referring domains</th>
              <th scope="col" className="px-3 py-3">AI citations</th>
              <th scope="col" className="px-3 py-3">Conversion rate</th>
              <th scope="col" className="px-3 py-3">Momentum</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-900/10">
            {dashboard.clusters.map((row) => (
              <tr key={row.cluster}>
                <th scope="row" className="px-3 py-3 font-semibold text-ink">{row.cluster}</th>
                <td className="px-3 py-3">{row.impressions.toLocaleString()}</td>
                <td className="px-3 py-3">{row.clicks.toLocaleString()}</td>
                <td className="px-3 py-3">{row.averagePosition.toFixed(1)}</td>
                <td className="px-3 py-3">{row.indexedUrls.toLocaleString()}</td>
                <td className="px-3 py-3">{row.crawledNotIndexedUrls.toLocaleString()}</td>
                <td className="px-3 py-3">{row.affiliateClicks.toLocaleString()}</td>
                <td className="px-3 py-3">{row.emailSignups.toLocaleString()}</td>
                <td className="px-3 py-3">{money(row.revenue)}</td>
                <td className="px-3 py-3">{row.referringDomains.toLocaleString()}</td>
                <td className="px-3 py-3">{row.aiCitations.toLocaleString()}</td>
                <td className="px-3 py-3">{percent(row.conversionRate)}</td>
                <td className="px-3 py-3">{row.momentumScore.toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </section>
  )
}
