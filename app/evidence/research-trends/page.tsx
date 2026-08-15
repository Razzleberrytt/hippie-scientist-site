import type { Metadata } from 'next'
import { buildPageMetadata } from '@/src/lib/seo'
import published from '@/data/distribution/published-research-trends.json'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Trends | What Readers Are Exploring',
  description: 'Monthly, privacy-preserving aggregate trends from Hippie Scientist research activity: commonly explored supplements, comparisons, interactions, and evidence changes.',
  path: '/evidence/research-trends/',
  openGraphType: 'article',
})

type TrendRow = { key: string; count: number; type?: string; absoluteGrowth?: number; growthPct?: number | null }
type TrendReport = {
  period: string
  publishedAt: string
  minimumPublishedCount: number
  mostSearched: TrendRow[]
  mostCompared: TrendRow[]
  mostCheckedInteractions: TrendRow[]
  fastestGrowingResearchTopics: TrendRow[]
  mostImprovedEvidence: TrendRow[]
  mostControversialEvidence: TrendRow[]
}

function displayKey(value: string) {
  return value
    .split('|')
    .map((part) => part.replace(/[-_]+/g, ' ').replace(/\b\w/g, (letter) => letter.toUpperCase()))
    .join(' vs ')
}

function TrendList({ title, rows }: { title: string; rows: TrendRow[] }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
      {rows.length ? (
        <ol className="mt-4 space-y-3">
          {rows.map((row, index) => (
            <li key={`${row.type || ''}:${row.key}`} className="flex items-baseline justify-between gap-4 border-b border-slate-100 pb-2 last:border-0">
              <span className="text-slate-800"><span className="mr-2 font-semibold text-slate-500">{index + 1}.</span>{displayKey(row.key)}</span>
              <span className="shrink-0 text-sm font-medium text-slate-600">{row.count} aggregate events</span>
            </li>
          ))}
        </ol>
      ) : <p className="mt-3 text-slate-600">No publishable aggregate data in this category.</p>}
    </section>
  )
}

export default function ResearchTrendsPage() {
  const reports = (published.reports as TrendReport[]).slice().sort((a, b) => b.period.localeCompare(a.period))
  const latest = reports[0]

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">First-party research trends</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">What readers are researching</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          A monthly view of aggregate research activity on The Hippie Scientist. These reports intentionally exclude user identifiers and raw health or medication queries.
        </p>
      </header>

      {!latest ? (
        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50 p-7">
          <h2 className="text-2xl font-semibold text-slate-950">No public monthly report yet</h2>
          <p className="mt-3 text-slate-700">Reports appear here only after the aggregate privacy threshold is met and an editorial review explicitly approves publication.</p>
        </section>
      ) : (
        <>
          <section className="mt-10 rounded-3xl bg-slate-950 p-7 text-white sm:p-9">
            <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-300">Latest report · {latest.period}</p>
            <h2 className="mt-2 text-3xl font-semibold">Monthly research activity snapshot</h2>
            <p className="mt-3 max-w-3xl text-slate-200">Only aggregate rows with at least {latest.minimumPublishedCount} events were eligible for publication. Counts describe site research activity, not prevalence, medical need, or population-level supplement use.</p>
          </section>

          <div className="mt-8 grid gap-5 lg:grid-cols-2">
            <TrendList title="Most searched supplements / topics" rows={latest.mostSearched} />
            <TrendList title="Most compared supplements" rows={latest.mostCompared} />
            <TrendList title="Most checked ingredient interactions" rows={latest.mostCheckedInteractions} />
            <TrendList title="Fastest-growing research topics" rows={latest.fastestGrowingResearchTopics} />
            <TrendList title="Most improved evidence" rows={latest.mostImprovedEvidence} />
            <TrendList title="Most controversial evidence" rows={latest.mostControversialEvidence} />
          </div>
        </>
      )}

      {reports.length > 1 && (
        <section className="mt-12" aria-labelledby="archive-heading">
          <h2 id="archive-heading" className="text-2xl font-semibold text-slate-950">Archive</h2>
          <ul className="mt-4 flex flex-wrap gap-2">
            {reports.map((report) => <li key={report.period} className="rounded-full border border-slate-200 bg-white px-4 py-2 text-sm text-slate-700">{report.period}</li>)}
          </ul>
        </section>
      )}
    </main>
  )
}
