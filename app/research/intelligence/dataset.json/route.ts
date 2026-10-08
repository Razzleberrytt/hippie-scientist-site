/**
 * Build-time static export. No runtime API, premium service or medical reasoning.
 * The large provenance-bound payload is loaded only by user interaction.
 */
import { getResearchSourceRegister } from '@/lib/research-source-register'
import { buildResearchSemanticNetwork } from '@/lib/research-semantic-network'
import { buildResearchIntelligenceStudio } from '@/lib/research-intelligence-studio'
import { getEvidenceChangeUpdates } from '@/lib/research-updates'

export const dynamic = 'force-static'

export async function GET() {
  const source = getResearchSourceRegister()
  // This route MUST be cheap enough for a static-export worker's 60s timeout.
  // The reviewed study dataset is ALREADY exported at /evidence/evidence-report/dataset.json.
  // The client joins that independent published source after user activation.
  const graph = buildResearchSemanticNetwork(source.records)
  const studio = buildResearchIntelligenceStudio(source.records,graph,[],getEvidenceChangeUpdates(40))
  if(source.latestSourceVerified!==500||studio.sourceCount!==500||studio.metrics.automaticallyPromotedClaims!==0){
    throw new Error('Research intelligence source admission boundary mismatch')
  }
  // Don't serialize raw abstracts or private generated analysis into the visitor payload.
  // Each fingerprint retains exact PMID and the public PubMed URL.
  return new Response(JSON.stringify({
    ...studio,
    graph:{...graph,bridges:graph.bridges.slice(0,40)},
  }),{
    headers:{
      'content-type':'application/json; charset=utf-8',
      'cache-control':'public, max-age=3600',
      'x-robots-tag':'noindex, nofollow',
    },
  })
}
