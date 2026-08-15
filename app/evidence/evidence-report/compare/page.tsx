import type { Metadata } from 'next'
import Link from 'next/link'
import { evidenceReportEditions } from '@/data/editorial/evidence-report-editions'
import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Evidence Report — Year-over-Year Comparison',
  description: 'Compare annual State of Supplement Evidence editions and track how the underlying dataset changes over time.',
  path: '/evidence/evidence-report/compare/',
})

export default async function EvidenceReportComparePage() {
  const current = await getPublicEvidenceDataset()
  const editions = [...evidenceReportEditions].sort((a, b) => b.year - a.year)
  const latestEdition = editions[0]
  const hasMultipleYears = new Set(editions.map(edition => edition.year)).size > 1

  return (
    <main className='container-page space-y-8 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>Longitudinal original research</p>
        <h1 className='mt-2 text-4xl font-semibold tracking-tight text-ink'>Evidence Report — year over year</h1>
        <p className='mt-4 max-w-3xl text-lg leading-8 text-muted'>Each annual edition gets a stable permalink and a pinned dataset version. New years are added; old years are never repointed to the latest data.</p>
      </section>

      <section aria-labelledby='annual-editions'>
        <h2 id='annual-editions' className='text-2xl font-bold text-ink'>Annual editions</h2>
        <div className='mt-4 overflow-x-auto rounded-2xl border border-brand-900/10 bg-white'>
          <table className='w-full min-w-[620px] text-left text-sm'>
            <caption className='sr-only'>Annual Evidence Report editions and pinned dataset versions</caption>
            <thead className='border-b border-brand-900/10 bg-brand-50/70 text-xs uppercase tracking-[0.08em] text-muted'><tr><th scope='col' className='px-4 py-3'>Year</th><th scope='col' className='px-4 py-3'>Dataset</th><th scope='col' className='px-4 py-3'>Published</th><th scope='col' className='px-4 py-3'>Status</th><th scope='col' className='px-4 py-3'>Report</th></tr></thead>
            <tbody>{editions.map(edition => <tr key={edition.year} className='border-b border-brand-900/5 last:border-0'><td className='px-4 py-3 font-bold text-ink'>{edition.year}</td><td className='px-4 py-3 font-mono text-xs'>{edition.datasetVersion}</td><td className='px-4 py-3'>{edition.publishedAt}</td><td className='px-4 py-3 capitalize'>{edition.status}</td><td className='px-4 py-3'><Link href={edition.permalink} className='font-bold text-brand-800 hover:underline'>Open →</Link></td></tr>)}</tbody>
          </table>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <article className='card-premium p-6'><p className='eyebrow-label'>Current dataset</p><p className='mt-2 text-2xl font-bold text-ink'>{current.datasetVersion}</p><p className='mt-2 text-sm leading-6 text-muted'>{current.metrics.ingredientCount.toLocaleString()} indexable ingredients · {current.metrics.studyCount.toLocaleString()} deduplicated structured study entities.</p></article>
        <article className='card-premium p-6'><p className='eyebrow-label'>Comparison state</p><p className='mt-2 text-2xl font-bold text-ink'>{hasMultipleYears ? `${editions.length} annual editions` : `${latestEdition.year} baseline established`}</p><p className='mt-2 text-sm leading-6 text-muted'>{hasMultipleYears ? 'Use the stable annual editions above to compare published years without rewriting earlier results.' : '2026 is the first permanent baseline. When the 2027 edition is added, this page becomes the year-over-year comparison index without changing the 2026 URL.'}</p></article>
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5 text-sm leading-7 text-muted'><strong className='text-ink'>Archive rule:</strong> an annual route may render calculated report metrics only while the active dataset version matches the version pinned to that edition. If it does not match, the archive fails closed instead of substituting newer data.</section>
    </main>
  )
}
