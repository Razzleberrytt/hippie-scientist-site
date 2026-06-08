import { buildAdaptiveHomepageClusters } from './adaptive-homepage'
import { buildAIAnswerRoutes } from './ai-answer-routing'
import { buildAuthoritySupernodes } from './authority-supernodes'
import { buildMultiHopTraversal } from './multi-hop-traversal'
import { buildProtocolOrchestration } from './protocol-orchestration'
import { buildRetrievalPriorities } from './retrieval-prioritization'
import { buildSemanticMemoryStates } from './semantic-memory'
import { buildSemanticRouteDecision } from './semantic-routing'

export type RuntimeSemanticSnapshot = {
  slug: string
  routing: ReturnType<typeof buildSemanticRouteDecision>
  retrieval: ReturnType<typeof buildRetrievalPriorities>
  aiAnswer: ReturnType<typeof buildAIAnswerRoutes>
  traversal: ReturnType<typeof buildMultiHopTraversal>
  protocols: ReturnType<typeof buildProtocolOrchestration>
  homepageClusters: ReturnType<typeof buildAdaptiveHomepageClusters>
  memory: ReturnType<typeof buildSemanticMemoryStates>
  supernodes: ReturnType<typeof buildAuthoritySupernodes>
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim()
    : ''
}

export function buildRuntimeSemanticSnapshot(
  source: any,
  candidates: any[],
): RuntimeSemanticSnapshot {
  const retrieval = buildRetrievalPriorities(source, candidates)
  const aiAnswer = buildAIAnswerRoutes(source, candidates)
  const traversal = buildMultiHopTraversal(source, candidates)
  const protocols = buildProtocolOrchestration(source, candidates)
  const homepageClusters = buildAdaptiveHomepageClusters(candidates)
  const memory = buildSemanticMemoryStates(candidates)
  const supernodes = buildAuthoritySupernodes(candidates)

  return {
    slug: normalizeText(source?.slug || 'discovery'),
    routing: buildSemanticRouteDecision(source),
    retrieval,
    aiAnswer,
    traversal,
    protocols,
    homepageClusters,
    memory,
    supernodes,
  }
}
