import type { Metadata } from 'next'

import { buildPageMetadata } from '@/src/lib/seo'
import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import { evidenceGradeHistory } from '@/data/editorial/evidence-grade-history'
import EvidenceReportClient from './EvidenceReportClient'
import CategoryEvidenceMixPanel from './CategoryEvidenceMixPanel'
import UnassignedEvidenceStatusPanel from './UnassignedEvidenceStatusPanel'

export const metadata: Metadata = buildPageMetadata({
  title: 'State of Supplement Evidence 2026',
  description: 'Original data report on evidence grades, structured source coverage, human trials, preclinical reliance, safety cautions, disagreement, and downloadable research data from The Hippie Scientist.',
  path: '/evidence/evidence-report/',
  openGraphType: 'article',
})

export default async function EvidenceReportPage() {
  const dataset = await getPublicEvidenceDataset()

  return (
    <>
      <EvidenceReportClient
        datasetVersion={dataset.datasetVersion}
        citationText={dataset.citationText}
        metrics={dataset.metrics}
        changeHistory={evidenceGradeHistory}
      />
      <UnassignedEvidenceStatusPanel dataset={dataset} />
      <CategoryEvidenceMixPanel dataset={dataset} />
    </>
  )
}
