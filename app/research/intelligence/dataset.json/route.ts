import { getResearchSourceRegister } from '@/lib/research-source-register'
import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import { buildResearchSemanticNetwork } from '@/lib/research-semantic-network'
import { buildResearchIntelligenceSuite } from '@/lib/research-intelligence-suite'

/** Built once during the static export, never a dynamic server API. */
export const dynamic = 'force-static'

export async function GET() {
  const register = getResearchSourceRegister()
  const publicIndex = await getPublicEvidenceDataset()
  const graph = buildResearchSemanticNetwork(
    register.records,
    publicIndex.ingredients.map(i => ({ name: i.name, href: i.path })),
    publicIndex.studies.map(s => ({ pmid: s.pmid, id: s.id })),
  )
  const suite = buildResearchIntelligenceSuite(register.records, graph)
  if (suite.summary.inspected !== 500 || suite.summary.automaticallyApprovedClaims !== 0 ||
      suite.graph.summary.sourcePapers !== suite.studies.length ||
      suite.admission !== 'none' || suite.research_only !== true) {
    throw new Error('Research Intelligence Suite provenance or clinical admission boundary failed')
  }
  return new Response(JSON.stringify(suite), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': 'public, max-age=3600',
      'x-robots-tag': 'noindex, nofollow',
    },
  })
}
