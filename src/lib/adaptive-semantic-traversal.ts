import { list, text, unique } from '@/lib/display-utils'
import { mechanismEcosystems } from '@/lib/mechanism-ecosystems'

export type AdaptiveTraversalItem = {
  title: string
  description: string
  href?: string
  type: 'profile' | 'compare' | 'stack' | 'best-for' | 'ecosystem' | 'pathway'
  score: number
  signals: string[]
}

function normalize(value: unknown) {
  return text(value).toLowerCase().trim()
}

function title(value: string) {
  return value
    .split(/[-_\s]+/)
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')
}

function collectSignals(record: any) {
  return unique([
    record?.slug,
    record?.name,
    record?.displayName,
    record?.summary,
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).filter(Boolean))
}

function recordHref(record: any) {
  if (!record?.slug) return undefined
  if (record.entityType === 'herb') return `/herbs/${record.slug}`
  if (record.entityType === 'compound') return `/compounds/${record.slug}`
  return undefined
}

function scoreCandidate(sourceSignals: string[], candidate: any) {
  const candidateSignals = collectSignals(candidate)
  const overlap = sourceSignals.filter((signal) =>
    candidateSignals.some((candidateSignal) => candidateSignal.includes(signal) || signal.includes(candidateSignal)),
  )

  let score = overlap.length * 2
  const evidence = normalize(candidate?.evidence_tier || candidate?.evidenceTier || candidate?.summary_quality || candidate?.profile_status)

  if (/strong|clinical|human|high/.test(evidence)) score += 3
  if (/complete|strong|ready/.test(evidence)) score += 2
  if (candidateSignals.length >= 8) score += 1

  return { score, overlap }
}

function adaptiveTraversalType(candidate: any): AdaptiveTraversalItem['type'] {
  if (candidate?.entityType === 'compare') return 'compare'
  if (candidate?.entityType === 'stack') return 'stack'
  if (candidate?.entityType === 'best-for') return 'best-for'
  if (candidate?.entityType === 'ecosystem') return 'ecosystem'
  if (candidate?.entityType === 'pathway') return 'pathway'
  return 'profile'
}

function getSupernodeHref(ecosystemSlug: string): string | undefined {
  const mapping: Record<string, string> = {
    'gaba-ecosystem': 'gaba-systems',
    'dopamine-ecosystem': 'dopamine-systems',
    'stress-response-ecosystem': 'adaptogen-ecosystems',
    'mitochondrial-ecosystem': 'mitochondrial-ecosystems',
    'neuroinflammation-ecosystem': 'neuroinflammation-ecosystems',
    'sleep-recovery-ecosystem': 'sleep-recovery-ecosystems',
  }
  const supernodeSlug = mapping[ecosystemSlug]
  return supernodeSlug ? `/supernodes/${supernodeSlug}` : undefined
}

export function buildAdaptiveTraversal(
  source: any,
  candidates: any[] = [],
  limit = 10,
): AdaptiveTraversalItem[] {
  const sourceSignals = collectSignals(source)
  const sourceSlug = source?.slug

  const profileItems: AdaptiveTraversalItem[] = candidates
    .filter((candidate) => candidate?.slug && candidate.slug !== sourceSlug)
    .map((candidate): AdaptiveTraversalItem => {
      const scored = scoreCandidate(sourceSignals, candidate)
      const name = title(text(candidate.displayName || candidate.name || candidate.slug))

      return {
        title: `Continue into ${name}`,
        description: 'Adjacent profile selected by pathway overlap, evidence maturity, and semantic continuity.',
        href: recordHref(candidate),
        type: adaptiveTraversalType(candidate),
        score: scored.score,
        signals: scored.overlap.slice(0, 4).map(title),
      }
    })
    .filter((item) => item.score > 0)

  const ecosystemItems: AdaptiveTraversalItem[] = mechanismEcosystems
    .map((ecosystem): AdaptiveTraversalItem => {
      const ecosystemSignals = [ecosystem.slug, ecosystem.title, ...ecosystem.pathways, ...ecosystem.compounds].map(normalize)
      const overlap = sourceSignals.filter((signal) =>
        ecosystemSignals.some((candidateSignal) => candidateSignal.includes(signal) || signal.includes(candidateSignal)),
      )

      return {
        title: `Explore the ${ecosystem.title}`,
        description: ecosystem.summary,
        href: getSupernodeHref(ecosystem.slug),
        type: 'ecosystem',
        score: overlap.length * 3,
        signals: ecosystem.pathways.slice(0, 4).map(title),
      }
    })
    .filter((item) => item.score > 0 && item.href !== undefined)

  return [...profileItems, ...ecosystemItems]
    .sort((a, b) => b.score - a.score || a.title.localeCompare(b.title))
    .slice(0, limit)
}

export function buildCuriosityLoop(source: any, candidates: any[] = []) {
  const traversal = buildAdaptiveTraversal(source, candidates, 6)
  const first = traversal[0]
  const second = traversal[1]

  return {
    headline: 'Continue the semantic thread',
    body: first
      ? `The strongest next branch is ${first.title.toLowerCase()}, then continuing into adjacent evidence, mechanism, or ecosystem context.`
      : 'Continue into adjacent evidence, mechanism, or ecosystem context as the semantic graph expands.',
    primary: first,
    secondary: second,
    items: traversal,
  }
}
