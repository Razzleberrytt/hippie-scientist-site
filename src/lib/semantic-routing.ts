import { calculateSemanticConfidence } from './semantic-confidence'
import { evaluateSemanticAuthority } from './semantic-authority'

export type SemanticRouteDecision = {
  primaryRoute: string
  secondaryRoutes: string[]
  routingMode:
    | 'authority-first'
    | 'continuity-first'
    | 'recovery-first'
    | 'comparison-first'
    | 'discovery-first'
  confidence: number
  reasons: string[]
}

function normalizeList(value: unknown) {
  return Array.isArray(value)
    ? value.filter(Boolean)
    : []
}

function normalizeText(value: unknown) {
  return typeof value === 'string'
    ? value.trim().toLowerCase()
    : ''
}

export function buildSemanticRouteDecision(record: any): SemanticRouteDecision {
  const confidence = calculateSemanticConfidence(record)
  const authority = evaluateSemanticAuthority(record)

  const ecosystems = normalizeList(record?.ecosystem_taxonomy)
  const compareGroups = normalizeList(record?.compare_groups)
  const pathways = normalizeList(record?.pathways)

  const educationalIntent = normalizeText(record?.educational_intent)
  const recoveryIntent = normalizeText(record?.recovery_intent)
  const comparisonIntent = normalizeText(record?.comparison_intent)

  const reasons: string[] = []

  let routingMode: SemanticRouteDecision['routingMode'] = 'discovery-first'

  if (authority.confidence === 'strong') {
    routingMode = 'authority-first'
    reasons.push('strong-authority')
  }

  if (ecosystems.length >= 2 || pathways.length >= 2) {
    routingMode = 'continuity-first'
    reasons.push('ecosystem-continuity')
  }

  if (recoveryIntent.includes('recovery')) {
    routingMode = 'recovery-first'
    reasons.push('recovery-intent')
  }

  if (
    comparisonIntent.includes('compare') ||
    compareGroups.length >= 2
  ) {
    routingMode = 'comparison-first'
    reasons.push('comparison-orchestration')
  }

  if (educationalIntent.includes('foundational')) {
    reasons.push('foundational-education')
  }

  const secondaryRoutes = [
    ...ecosystems.map((item: any) => `/ecosystems/${item}`),
    ...pathways.map((item: any) => `/pathways/${item}`),
  ].slice(0, 6)

  const primaryRoute =
    secondaryRoutes[0] ||
    `/topics/${record?.slug || 'discovery'}`

  return {
    primaryRoute,
    secondaryRoutes,
    routingMode,
    confidence: confidence.routingConfidence,
    reasons,
  }
}
