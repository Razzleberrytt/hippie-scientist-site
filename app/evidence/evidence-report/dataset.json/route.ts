import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'

export const dynamic = 'force-static'

export async function GET() {
  const dataset = await getPublicEvidenceDataset()
  return new Response(`${JSON.stringify(dataset, null, 2)}\n`, {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'content-disposition': `attachment; filename="hippie-scientist-evidence-${dataset.datasetVersion}.json"`,
      'cache-control': 'public, max-age=3600',
    },
  })
}
