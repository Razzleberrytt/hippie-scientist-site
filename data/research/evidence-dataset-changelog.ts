export type EvidenceDatasetRelease = {
  version: string
  date: string
  summary: string
  schemaVersion: number
}

export const evidenceDatasetChangelog: EvidenceDatasetRelease[] = [
  {
    version: '2026.08.15',
    date: '2026-08-15',
    schemaVersion: 1,
    summary: 'Initial normalized public dataset release with stable study IDs, study classes, ingredient relationships, evidence direction labels, study-level metadata, aggregate report metrics, and CSV/JSON exports.',
  },
]
