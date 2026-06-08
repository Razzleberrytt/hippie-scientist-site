import { list, text, unique } from '@/lib/display-utils'
import { buildAffiliateRoutingDecision } from '@/lib/affiliate-intelligence-routing'
import { buildResearchKnowledgeReport } from '@/lib/research-knowledge-layer'
import { buildSemanticIntelligenceReport } from '@/lib/semantic-intelligence-layer'

export type ProductRecommendationContext = {
  title: string
  readiness: 'recommend' | 'educational' | 'avoid'
  ctaLabel: string
  guidance: string[]
  qualitySignals: string[]
  cautionSignals: string[]
}

function title(value: unknown) {
  return text(value)
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, (char) => char.toUpperCase())
}

function safetyRisk(record: Record<string, unknown>) {
  const safety = text([
    record?.safety_level,
    record?.safety,
    record?.warnings,
    record?.contraindications,
    record?.avoid_if,
  ].join(' ')).toLowerCase()

  return /avoid|unsafe|contraindicat|pregnancy|bleeding|liver|seizure|bipolar|interaction/.test(safety)
}

export function buildProductRecommendationContext(record: Record<string, unknown>): ProductRecommendationContext {
  const affiliate = buildAffiliateRoutingDecision(record)
  const research = buildResearchKnowledgeReport(record)
  const semantic = buildSemanticIntelligenceReport(record)
  const name = title(record?.displayName || record?.name || record?.slug)
  const risk = safetyRisk(record)

  const readiness: ProductRecommendationContext['readiness'] = risk
    ? 'avoid'
    : affiliate.readiness === 'ready' && research.evidenceWeight >= 16 && semantic.priority !== 'exploratory'
      ? 'recommend'
      : 'educational'

  return {
    title: name,
    readiness,
    ctaLabel: readiness === 'recommend'
      ? `Compare ${name} product options`
      : readiness === 'educational'
        ? `Learn what to look for in ${name}`
        : `Review ${name} safety context first`,
    guidance: readiness === 'recommend'
      ? [
          'Prioritize transparent labeling, third-party testing, and clearly stated serving size.',
          'Match the form and dose to the outcome studied rather than relying on generic marketing claims.',
          'Use product suggestions as shopping guidance, not medical advice.',
        ]
      : readiness === 'educational'
        ? [
            'Use this page to understand forms, evidence context, and safety concerns before shopping.',
            'Prefer education-first guidance until evidence and product-readiness signals are stronger.',
          ]
        : [
            'Do not prioritize product recommendations until safety concerns are reviewed.',
            'Consult qualified medical guidance when contraindications, medications, or medical conditions apply.',
          ],
    qualitySignals: unique([
      ...list(record?.quality_signals),
      ...list(record?.forms),
      ...list(record?.formulation_notes),
      'third-party testing',
      'transparent dose',
      'clear ingredient form',
    ].map(title).filter(Boolean)).slice(0, 6),
    cautionSignals: unique([
      ...list(record?.warnings),
      ...list(record?.contraindications),
      ...list(record?.avoid_if),
      ...list(record?.safetyNotes),
    ].map(title).filter(Boolean)).slice(0, 6),
  }
}

export function buildStackProductRecommendationContext(stack: Record<string, unknown>) {
  const items = [...(stack?.compounds || stack?.stack || [])]

  return {
    title: title(stack?.title || stack?.goal || stack?.slug || 'Stack'),
    readiness: items.length >= 2 ? 'educational' as const : 'avoid' as const,
    guidance: [
      'Evaluate each component separately before combining products.',
      'Avoid duplicate mechanisms, overlapping sedation, excessive stimulation, and unclear proprietary blends.',
      'Prefer simple products with transparent doses over bundled blends when evidence context is still developing.',
    ],
    qualitySignals: ['Transparent doses', 'Few unnecessary additives', 'Clear ingredient forms', 'Third-party testing'],
    cautionSignals: ['Overlap risk', 'Medication interactions', 'Stimulation/sedation stacking', 'Proprietary blends'],
  }
}

export function buildEvidenceSafeProductCTA(record: Record<string, unknown>) {
  const context = buildProductRecommendationContext(record)

  return {
    label: context.ctaLabel,
    description: context.guidance[0],
    disabled: context.readiness === 'avoid',
    readiness: context.readiness,
  }
}

export function rankProductRecommendationOpportunities(records: Record<string, unknown>[] = [], limit = 16) {
  return records
    .map((record) => ({
      record,
      context: buildProductRecommendationContext(record),
    }))
    .sort((a, b) => {
      const order = { recommend: 3, educational: 2, avoid: 1 }
      return order[b.context.readiness] - order[a.context.readiness] || a.context.title.localeCompare(b.context.title)
    })
    .slice(0, limit)
}
