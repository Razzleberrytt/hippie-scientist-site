import {
  getPublicEvidenceDataset,
  publicEvidenceDatasetToCsv,
} from '@/lib/public-evidence-dataset'

export const dynamic = 'force-static'

export async function GET() {
  const dataset = await getPublicEvidenceDataset()
  return new Response(publicEvidenceDatasetToCsv(dataset), {
    headers: {
      'content-type': 'text/csv; charset=utf-8',
      'content-disposition': `attachment; filename="hippie-scientist-evidence-${dataset.datasetVersion}.csv"`,
      'cache-control': 'public, max-age=3600',
    },
  })
}
