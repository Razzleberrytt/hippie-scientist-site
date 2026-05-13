import { list, text, unique } from '@/lib/display-utils'
import { mechanismEcosystems } from '@/lib/mechanism-ecosystems'

export type SemanticNavigationIntent =
  | 'compare'
  | 'deepen-mechanism'
  | 'find-gentler'
  | 'find-stronger-evidence'
  | 'continue-ecosystem'
  | 'build-stack'

export type SemanticNavigationSuggestion = {
  intent: SemanticNavigationIntent
  title: string
  description: string
  href?: string
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
    ...list(record?.primary_effects),
    ...list(record?.effects),
    ...list(record?.mechanisms),
    ...list(record?.pathways),
    ...list(record?.topics),
  ].map(normalize).filter(Boolean))
}

function entityHref(record: any) {
  if (!record?.slug) return undefined
  const type = record?.entityType === 'herb' ? 'herbs' : 'compounds'
  return `/${type}/${record.slug}`
}

function matchingEcosystems(signals: string[]) {
  return mechanismEcosystems
    .map((ecosystem) => {
      const ecosystemSignals = [
        ecosystem.slug,
        ecosystem.title,
        ...ecosystem.pathways,
        ...ecosystem.compounds,
      ].map(normalize)

      const matches = signals.filter((signal) =>
        ecosystemSignals.some((candidate) => candidate.includes(signal) || signal.includes(candidate)),
      )

      return { ecosystem, score: matches.length, matches }
    })
    .filter((item) => item.score > 0)
    .sort((a, b) => b.score - a.score)
}

export function buildSemanticNavigationSuggestions(
  record: any,
  relatedRecords: any[] = [],
  limit = 6,
): SemanticNavigationSuggestion[] {
  const signals = collectSignals(record)
  const ecosystems = matchingEcosystems(signals)
  const related = relatedRecords.filter((item) => item?.slug && item.slug !== record?.slug)
  const firstRelated = related[0]
  const firstEcosystem = ecosystems[0]?.ecosystem

  const suggestions: SemanticNavigationSuggestion[] = [
    firstRelated
      ? {
          intent: 'compare',
          title: `Compare with ${title(text(firstRelated.displayName || firstRelated.name || firstRelated.slug))}`,
          description: 'Use a comparison path to understand evidence maturity, mechanism overlap, and practical fit without reducing the decision to a simplistic winner.',
          href: entityHref(firstRelated),
          signals: collectSignals(firstRelated).slice(0, 4).map(title),
        }
      : null,
    firstEcosystem
      ? {
          intent: 'continue-ecosystem',
          title: `Continue into the ${firstEcosystem.title}`,
          description: firstEcosystem.summary,
          href: `/supernodes/${firstEcosystem.slug.replace('-ecosystem', '-systems')}`,
          signals: firstEcosystem.pathways.slice(0, 4).map(title),
        }
      : null,
    {
      intent: 'deepen-mechanism',
      title: 'Deepen the mechanism layer',
      description: 'Move from surface-level benefits into pathways, mechanisms, and biological context while keeping evidence limitations visible.',
      signals: signals.slice(0, 4).map(title),
    },
    {
      intent: 'find-stronger-evidence',
      title: 'Find stronger evidence alternatives',
      description: 'Look for adjacent profiles with stronger human evidence, clearer endpoint specificity, or better profile maturity.',
      signals: ['Evidence Maturity', 'Human Context', 'Endpoint Specificity'],
    },
    {
      intent: 'find-gentler',
      title: 'Find gentler pathway alternatives',
      description: 'Explore lower-intensity or better-tolerated adjacent options when stimulation, sedation, or interaction risk matters.',
      signals: ['Tolerance', 'Safety Context', 'Gentler Pathways'],
    },
    {
      intent: 'build-stack',
      title: 'Explore stack context',
      description: 'Move from single-profile exploration into routine-level context while preserving dose, overlap, and safety caution.',
      signals: ['Stack Fit', 'Overlap Caution', 'Routine Context'],
    },
  ].filter(Boolean) as SemanticNavigationSuggestion[]

  return suggestions.slice(0, limit)
}

export function buildSemanticAssistantSummary(record: any, relatedRecords: any[] = []) {
  const signals = collectSignals(record).slice(0, 5).map(title)
  const ecosystems = matchingEcosystems(collectSignals(record)).slice(0, 2).map((item) => item.ecosystem.title)

  return {
    headline: `A guided research path for ${title(text(record?.displayName || record?.name || record?.slug || 'this profile'))}`,
    body:
      ecosystems.length > 0
        ? `This profile sits near ${ecosystems.join(' and ')}. The strongest next step is to compare adjacent profiles, inspect mechanism overlap, and keep evidence maturity visible.`
        : 'This profile can be explored through adjacent mechanisms, comparison pages, and evidence-forward alternatives as the semantic graph expands.',
    signals,
  }
}
