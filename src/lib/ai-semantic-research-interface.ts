import { text, unique } from '@/lib/display-utils'
import { buildAdaptiveSemanticFeed } from '@/lib/adaptive-semantic-feed'
import { buildConversationalSemanticPrompts } from '@/lib/conversational-semantic-prompts'
import { buildSemanticIntelligenceReport } from '@/lib/semantic-intelligence-layer'
import { buildResearchKnowledgeReport } from '@/lib/research-knowledge-layer'

export type SemanticResearchResponse = {
  query: string
  interpretation: string
  explorationMode: 'compare' | 'pathway' | 'ecosystem' | 'research' | 'stack'
  reasoning: string[]
  prompts: {
    question: string
    intent: string
    href?: string
  }[]
  feed: {
    title: string
    href?: string
    priority: string
  }[]
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function inferMode(query: string): SemanticResearchResponse['explorationMode'] {
  const normalized = normalize(query)

  if (/compare|vs|better|difference/.test(normalized)) return 'compare'
  if (/stack|combine|routine/.test(normalized)) return 'stack'
  if (/pathway|mechanism|dopamine|serotonin|gaba|mitochondria/.test(normalized)) return 'pathway'
  if (/ecosystem|category|cluster/.test(normalized)) return 'ecosystem'

  return 'research'
}

export function buildSemanticResearchResponse(
  query: string,
  source: any,
  candidates: any[] = [],
): SemanticResearchResponse {
  const mode = inferMode(query)
  const semantic = buildSemanticIntelligenceReport(source, candidates)
  const research = buildResearchKnowledgeReport(source)
  const prompts = buildConversationalSemanticPrompts(source, candidates, 5)
  const feed = buildAdaptiveSemanticFeed(source, candidates, 6)

  const reasoning = unique([
    semantic.signals[0]?.reason,
    semantic.signals[1]?.reason,
    research.summary,
  ].filter(Boolean))

  return {
    query,
    interpretation: `This query is being routed through ${mode} exploration using semantic continuity, evidence hierarchy, and ecosystem-aware traversal.`,
    explorationMode: mode,
    reasoning,
    prompts: prompts.map((prompt) => ({
      question: prompt.question,
      intent: prompt.intent,
      href: prompt.href,
    })),
    feed: feed.map((item) => ({
      title: item.title,
      href: item.href,
      priority: item.priority,
    })),
  }
}
