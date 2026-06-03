import { list, text, unique } from '@/lib/display-utils'
import {
  rankSemanticRecommendations,
  type SemanticRuntimeRecord,
  type SemanticRecommendationCandidate,
} from '@/lib/semantic-orchestration'

export type SemanticNavigationLink = {
  label: string
  href: string
  reason: string
  strength: 'primary' | 'secondary' | 'contextual'
}

export type SemanticNavigationTrail = {
  home: SemanticNavigationLink
  library: SemanticNavigationLink
  ecosystem?: SemanticNavigationLink
  profile: SemanticNavigationLink
  next: SemanticNavigationLink[]
}

function cleanSlug(value: unknown) {
  return text(value).trim().toLowerCase()
}

function displayName(record: SemanticRuntimeRecord) {
  return text(record.displayName) || text(record.name) || text(record.slug) || 'Profile'
}

function entityPath(record: SemanticRuntimeRecord, fallbackType: 'herb' | 'compound' = 'herb') {
  const entityType = text(record.entityType).toLowerCase() === 'compound' ? 'compound' : fallbackType
  const slug = cleanSlug(record.slug || record.id)
  return `/${entityType === 'compound' ? 'compounds' : 'herbs'}/${slug}`
}

function primaryEcosystem(record: SemanticRuntimeRecord) {
  return unique([
    ...list(record.topic_ecosystems),
    ...list(record.topicEcosystems),
    ...list(record.pathway_ecosystems),
    ...list(record.pathwayEcosystems),
    ...list(record.ecosystem_anchors),
    ...list(record.ecosystemAnchors),
    ...list(record.topics),
    ...list(record.pathways),
  ].map((item) => text(item)).filter(Boolean))[0]
}

function ecosystemHref(label: string) {
  const slug = label.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  return slug ? `/explore?topic=${encodeURIComponent(slug)}` : '/explore'
}

function linkStrength(candidate: SemanticRecommendationCandidate): SemanticNavigationLink['strength'] {
  if (candidate.signals.authorityScore >= 0.65 || candidate.signals.supernodeScore >= 0.5) return 'primary'
  if (candidate.signals.discoveryScore >= 0.45 || candidate.signals.propagationScore >= 0.45) return 'secondary'
  return 'contextual'
}

function candidateReason(candidate: SemanticRecommendationCandidate) {
  return candidate.reasons.slice(0, 2).join(' + ') || 'semantic continuity'
}

export function buildSemanticNavigationTrail(
  record: SemanticRuntimeRecord,
  candidates: SemanticRuntimeRecord[] = [],
  entityType: 'herb' | 'compound' = 'herb',
): SemanticNavigationTrail {
  const ecosystem = primaryEcosystem(record)
  const next = rankSemanticRecommendations(record, candidates, 6).map((candidate) => ({
    label: displayName(candidate.record),
    href: entityPath(candidate.record, entityType),
    reason: candidateReason(candidate),
    strength: linkStrength(candidate),
  }))

  return {
    home: {
      label: 'Home',
      href: '/',
      reason: 'site root',
      strength: 'contextual',
    },
    library: {
      label: entityType === 'compound' ? 'Compound Library' : 'Herb Library',
      href: entityType === 'compound' ? '/compounds' : '/herbs',
      reason: 'library continuity',
      strength: 'secondary',
    },
    ecosystem: ecosystem ? {
      label: ecosystem,
      href: ecosystemHref(ecosystem),
      reason: 'ecosystem continuity',
      strength: 'secondary',
    } : undefined,
    profile: {
      label: displayName(record),
      href: entityPath(record, entityType),
      reason: 'current profile',
      strength: 'primary',
    },
    next,
  }
}

export function buildSemanticInternalLinks(
  record: SemanticRuntimeRecord,
  candidates: SemanticRuntimeRecord[] = [],
  entityType: 'herb' | 'compound' = 'herb',
  limit = 8,
) {
  return rankSemanticRecommendations(record, candidates, limit).map((candidate) => ({
    label: displayName(candidate.record),
    href: entityPath(candidate.record, entityType),
    reason: candidateReason(candidate),
    strength: linkStrength(candidate),
    score: candidate.score,
  }))
}
