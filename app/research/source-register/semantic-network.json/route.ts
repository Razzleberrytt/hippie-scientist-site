/**
 * Static-exported source-only semantic graph.
 * The visual interface loads this only when a visitor explores connections.
 */
import { getResearchSourceRegister } from '@/lib/research-source-register'
import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import { buildResearchSemanticNetwork } from '@/lib/research-semantic-network'

export const dynamic = 'force-static'

export async function GET() {
  const data = getResearchSourceRegister()
  const published = await getPublicEvidenceDataset()
  const network = buildResearchSemanticNetwork(
    data.records,
    published.ingredients.map(item => ({ name: item.name, href: item.path })),
    published.studies.map(study => ({ pmid: study.pmid, id: study.id })),
  )
  if (network.summary.sourcePapers !== data.latestSourceVerified ||
      Object.keys(network.entries).length !== data.latestSourceVerified) {
    throw new Error('Semantic graph diverged from verified source inventory')
  }
  return new Response(JSON.stringify({
    schema_version: 1,
    through_wave: data.throughWave,
    research_only: true,
    ...network,
  }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
