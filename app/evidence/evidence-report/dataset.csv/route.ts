import {
  getPublicEvidenceDataset,
  publicEvidenceDatasetToCsv,
} from '@/lib/public-evidence-dataset'
import { normalizePublicEvidenceDatasetForExport } from '@/lib/public-evidence-export'

export const dynamic = 'force-static'

export async function GET() {
  const dataset = normalizePublicEvidenceDatasetForExport(await getPublicEvidenceDataset())
  return new Response(publicEvidenceDatasetToCsv(dataset), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="hippie-scientist-evidence-${dataset.datasetVersion}.csv"`,
      'cache-control': 'public, max-age=3600',
    },
  })
}
