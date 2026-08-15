import type { Metadata } from 'next'
import Link from 'next/link'
import EvidenceReportClient from '../EvidenceReportClient'
import CategoryEvidenceMixPanel from '../CategoryEvidenceMixPanel'
import { evidenceGradeHistory } from '@/data/editorial/evidence-grade-history'
import { evidenceReportEdition } from '@/data/editorial/evidence-report-editions'
import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import { buildPageMetadata } from '@/src/lib/seo'

const edition = evidenceReportEdition(2026)!

export const metadata: Metadata = buildPageMetadata({
  title: `${edition.title} — Archived Edition`,
  description: `Permanent ${edition.year} edition of The Hippie Scientist Evidence Report, pinned to dataset ${edition.datasetVersion}.`,
  path: edition.permalink,
  openGraphType: 'article',
})

export default async function EvidenceReport2026Page() {
  const dataset = await getPublicEvidenceDataset()
  const versionMatches = dataset.datasetVersion === edition.datasetVersion

  if (!versionMatches) {
    return (
      <main className='container-page space-y-6 py-10'>
        <p className='eyebrow-label'>Permanent archive · {edition.year}</p>
        <h1 className='text-4xl font-semibold tracking-tight text-ink'>{edition.title}</h1>
        <div className='rounded-2xl border border-amber-900/15 bg-amber-50/70 p-6 text-sm leading-7 text-amber-950'>
          This annual edition is pinned to dataset <strong>{edition.datasetVersion}</strong>. The active dataset is now <strong>{dataset.datasetVersion}</strong>, so this route refuses to substitute newer calculations for the historical edition. This fail-closed guard prevents a 2027+ rebuild from silently rewriting the 2026 report.
        </div>
        <div className='flex flex-wrap gap-3 text-sm font-bold'>
          <Link href='/evidence/evidence-report/' className='text-brand-800 hover:underline'>Open the current report →</Link>
          <Link href='/evidence/evidence-report/compare/' className='text-brand-800 hover:underline'>Compare annual editions →</Link>
        </div>
      </main>
    )
  }

  return (
    <>
      <div className='container-page pt-8'>
        <div className='rounded-xl border border-brand-900/10 bg-brand-50/60 px-4 py-3 text-sm text-muted'>
          <strong className='text-ink'>Archived annual edition:</strong> {edition.year} · pinned to dataset {edition.datasetVersion} · published {edition.publishedAt}. <Link href='/evidence/evidence-report/compare/' className='font-bold text-brand-800 underline'>Compare years</Link>
        </div>
      </div>
      <EvidenceReportClient datasetVersion={dataset.datasetVersion} citationText={dataset.citationText} metrics={dataset.metrics} changeHistory={evidenceGradeHistory} />
      <CategoryEvidenceMixPanel dataset={dataset} />
    </>
  )
}
