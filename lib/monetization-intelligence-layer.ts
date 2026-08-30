import { list, text, unique } from '@/lib/display-utils'
import { buildSemanticIntelligenceReport } from './semantic-intelligence-layer'
import { buildResearchKnowledgeReport } from './research-knowledge-layer'

export type MonetizationOpportunity = {
  slug?: string
  title: string
  intent: 'research' | 'compare' | 'stack' | 'ecosystem' | 'buyer-intent'
  monetizationScore: number
  confidence: 'high' | 'moderate' | 'exploratory'
  rationale: string[]
  affiliateReady: boolean
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function confidence(score: number): MonetizationOpportunity['confidence'] {
  if (score >= 28) return 'high'
  if (score >= 16) return 'moderate'
  return 'exploratory'
}

function affiliateSignals(record: any) {
  return unique([
    record?.affiliate_ready,
    record?.affiliateReady,
    record?.affiliate_status,
    record?.product_availability,
    record?.monetization_status,
    ...list(record?.affiliate_links),
    ...list(record?.product_links),
  ].map(normalize).filter(Boolean))
}

function buyerIntentSignals(record: any) {
  return unique([
    ...list(record?.best_for),
    ...list(record?.effects),
    ...list(record?.primary_effects),
    ...list(record?.goals),
    ...list(record?.topics),
  ].map(normalize).filter(Boolean))
}

export function buildMonetizationOpportunity(record: any): MonetizationOpportunity {
  const semantic = buildSemanticIntelligenceReport(record)
  const research = buildResearchKnowledgeReport(record)
  const affiliate = affiliateSignals(record)
  const buyerIntent = buyerIntentSignals(record)

  const affiliateReady = affiliate.length > 0 || /ready|active|live/.test(normalize(record?.affiliate_ready || record?.affiliate_status))

  const monetizationScore =
    semantic.totalScore +
    Math.min(18, research.evidenceWeight * 0.35) +
    buyerIntent.length * 2 +
    (affiliateReady ? 10 : 0)

  const rationale = [
    semantic.priority === 'high'
      ? 'High semantic continuity and ecosystem traversal potential.'
      : 'Moderate semantic continuity with exploratory expansion potential.',
    research.evidenceWeight >= 24
      ? 'Evidence hierarchy is strong enough for safer recommendation surfacing.'
      : 'Evidence context should remain cautious and education-focused.',
    buyerIntent.length >= 4
      ? 'Profile contains strong user-goal alignment signals.'
      : 'Buyer-intent signals are currently limited.',
    affiliateReady
      ? 'Affiliate/product routing infrastructure appears available.'
      : 'Affiliate routing should remain disabled until validated.',
  ]

  const intent: MonetizationOpportunity['intent'] =
    buyerIntent.length >= 5
      ? 'buyer-intent'
      : semantic.recommendedRouteType === 'compare'
        ? 'compare'
        : semantic.recommendedRouteType === 'ecosystem'
          ? 'ecosystem'
          : 'research'

  return {
    slug: record?.slug,
    title: text(record?.displayName || record?.name || record?.slug || 'Profile'),
    intent,
    monetizationScore: Math.round(monetizationScore),
    confidence: confidence(monetizationScore),
    rationale,
    affiliateReady,
  }
}

export function rankMonetizationOpportunities(records: any[] = [], limit = 16) {
  return records
    .map((record) => buildMonetizationOpportunity(record))
    .sort((a, b) => b.monetizationScore - a.monetizationScore || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export function buildMonetizationSummary(records: any[] = []) {
  const opportunities = rankMonetizationOpportunities(records, 10)

  return {
    headline: 'Monetization intelligence layer',
    description: 'Opportunities are ranked using semantic continuity, evidence hierarchy, buyer-intent alignment, and affiliate-readiness signals.',
    opportunities,
  }
}
