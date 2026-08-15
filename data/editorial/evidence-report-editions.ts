export type EvidenceReportEdition = {
  year: number
  title: string
  datasetVersion: string
  publishedAt: string
  permalink: string
  status: 'baseline' | 'archived'
}

/**
 * Stable annual Evidence Report registry.
 *
 * Never repoint an existing year to a later dataset version. Add a new year as
 * a new entry. The year-specific route verifies its dataset version before it
 * will render live calculations, preventing a future dataset from silently
 * masquerading as the historical edition.
 */
export const evidenceReportEditions: EvidenceReportEdition[] = [
  {
    year: 2026,
    title: 'State of Supplement Evidence 2026',
    datasetVersion: '2026.08.15',
    publishedAt: '2026-08-15',
    permalink: '/evidence/evidence-report/2026/',
    status: 'baseline',
  },
]

export function evidenceReportEdition(year: number) {
  return evidenceReportEditions.find(edition => edition.year === year)
}
