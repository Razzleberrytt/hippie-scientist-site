import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import { normalizePublicEvidenceDatasetForExport } from '@/lib/public-evidence-export'

export const dynamic = 'force-static'

export async function GET() {
  const dataset = normalizePublicEvidenceDatasetForExport(await getPublicEvidenceDataset())
  return new Response(`${JSON.stringify(dataset, null, 2)}\n`, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="hippie-scientist-evidence-${dataset.datasetVersion}.json"`,
      'cache-control': 'public, max-age=3600',
    },
  })
}
