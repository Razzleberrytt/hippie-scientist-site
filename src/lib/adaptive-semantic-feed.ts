import { text, unique } from '@/lib/display-utils'
import { buildAdaptiveTraversal } from '@/lib/adaptive-semantic-traversal'
import { buildSemanticIntelligenceReport, rankSemanticCandidates } from '@/lib/semantic-intelligence-layer'

export type AdaptiveSemanticFeedItem = {
  title: string
  description: string
  href?: string
  type: 'continue' | 'compare' | 'ecosystem' | 'stack' | 'profile' | 'best-for' | 'research'
  priority: 'high' | 'moderate' | 'exploratory'
  score: number
  signals: string[]
}

function title(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function hrefForRecord(record: any) {
  if (!record?.slug) return undefined
  if (record.entityType === 'herb') return `/herbs/${record.slug}`
  if (record.entityType === 'compound') return `/compounds/${record.slug}`
  if (record.entityType === 'stack') return `/stacks/${record.slug}`
  if (record.entityType === 'compare') return `/compare/${record.slug}`
  return undefined
}

export function buildAdaptiveSemanticFeed(
  source: any,
  candidates: any[] = [],
  limit = 12,
): AdaptiveSemanticFeedItem[] {
  const traversal = buildAdaptiveTraversal(source, candidates, limit)
  const ranked = rankSemanticCandidates(source, candidates, limit)

  const traversalItems: AdaptiveSemanticFeedItem[] = traversal.map((item) => ({
    title: item.title,
    description: item.description,
    href: item.href,
    type: item.type === 'ecosystem' ? 'ecosystem' : item.type === 'profile' ? 'profile' : 'continue',
    priority: item.score >= 8 ? 'high' : item.score >= 4 ? 'moderate' : 'exploratory',
    score: item.score,
    signals: item.signals,
  }))

  const intelligenceItems: AdaptiveSemanticFeedItem[] = ranked.map(({ candidate, report, traversalScore }) => ({
    title: `Research ${title(text(candidate?.displayName || candidate?.name || candidate?.slug || 'this profile'))}`,
    description: `Ranked by semantic intelligence: ${report.signals.slice(0, 2).map((signal) => signal.reason).join(' ')}`,
    href: hrefForRecord(candidate),
    type: candidate?.entityType === 'stack' ? 'stack' : 'research',
    priority: report.priority,
    score: report.totalScore + traversalScore,
    signals: unique(report.signals.flatMap((signal) => [signal.label, signal.type])).slice(0, 5),
  }))

  return [...traversalItems, ...intelligenceItems]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .filter((item, index, arr) => arr.findIndex((candidate) => candidate.href === item.href && candidate.title === item.title) === index)
    .slice(0, limit)
}

export function buildFeedSummary(source: any, candidates: any[] = []) {
  const report = buildSemanticIntelligenceReport(source, candidates)
  const feed = buildAdaptiveSemanticFeed(source, candidates, 8)

  return {
    headline: 'Adaptive semantic feed',
    description: `This feed prioritizes ${report.recommendedRouteType} exploration using evidence maturity, mechanism density, ecosystem alignment, and traversal diversity.`,
    priority: report.priority,
    score: report.totalScore,
    items: feed,
  }
}
