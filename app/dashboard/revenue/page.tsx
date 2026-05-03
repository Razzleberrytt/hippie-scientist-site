import Link from 'next/link'
import { revenueDashboardMetrics, revenueDashboardStarterRows } from '@/data/revenue-dashboard'

export default function RevenueDashboardPage() {
  return (
    <main className="space-y-8">
      <section className="soft-section">
        <h1 className="text-4xl font-black text-slate-950">Revenue Dashboard</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-600">
          This dashboard shows how your compound pages convert into product clicks. Use it to decide what to expand, what to fix, and what to double down on.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        {revenueDashboardMetrics.map(metric => (
          <div key={metric.label} className="rounded-2xl border p-4">
            <p className="text-xs font-black uppercase text-slate-500">{metric.label}</p>
            <p className="mt-2 text-lg font-bold text-slate-900">{metric.value}</p>
            <p className="mt-2 text-sm text-slate-600">{metric.description}</p>
          </div>
        ))}
      </section>

      <section className="soft-section">
        <h2 className="text-2xl font-black text-slate-950">Starter optimization table</h2>

        <div className="mt-4 overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b">
                <th className="py-2 font-black">Compound</th>
                <th className="py-2 font-black">Clicks</th>
                <th className="py-2 font-black">Top intent</th>
                <th className="py-2 font-black">Next move</th>
              </tr>
            </thead>
            <tbody>
              {revenueDashboardStarterRows.map(row => (
                <tr key={row.slug} className="border-b">
                  <td className="py-3 font-semibold">
                    <Link href={`/compounds/${row.slug}`} className="text-emerald-700">
                      {row.compound}
                    </Link>
                  </td>
                  <td className="py-3">{row.productClicks}</td>
                  <td className="py-3">{row.topIntent}</td>
                  <td className="py-3 text-slate-600">{row.nextAction}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="soft-section">
        <h2 className="text-2xl font-black text-slate-950">How to use this</h2>

        <ul className="mt-4 space-y-2 text-sm text-slate-600">
          <li>1. Look at which compound pages get the most affiliate clicks.</li>
          <li>2. Expand those compounds into more detailed guides and comparisons.</li>
          <li>3. Adjust product picks based on which intent gets the most clicks.</li>
          <li>4. Remove or improve pages that get traffic but no clicks.</li>
        </ul>
      </section>
    </main>
  )
}
