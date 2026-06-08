import { formatDisplayLabel, isClean, unique } from '@/lib/display-utils'
import { asList, asLowerText, asText, collectRuntimeSignals } from '@/lib/runtime-normalize'

export type PathwaySlug = 'gaba' | 'dopamine' | 'inflammation' | 'stress' | 'sleep' | 'recovery'

type PathwayDefinition = {
  label: string
  keywords: string[]
}

const PATHWAY_DEFINITIONS: Record<PathwaySlug, PathwayDefinition> = {
  gaba: {
    label: 'GABA',
    keywords: ['gaba', 'gabaergic', 'calming', 'calm', 'inhibitory', 'relaxation', 'relax', 'sleep'],
  },
  dopamine: {
    label: 'Dopamine',
    keywords: ['dopamine', 'dopaminergic', 'motivation', 'reward', 'cognition', 'cognitive', 'focus', 'attention'],
  },
  inflammation: {
    label: 'Inflammation',
    keywords: ['inflammation', 'inflammatory', 'anti inflammatory', 'cytokine', 'oxidative', 'immune', 'antioxidant'],
  },
  stress: {
    label: 'Stress',
    keywords: ['stress', 'cortisol', 'hpa', 'adaptogen', 'adaptogenic', 'anxiety', 'resilience'],
  },
  sleep: {
    label: 'Sleep',
    keywords: ['sleep', 'insomnia', 'night', 'circadian', 'sedative', 'relaxation', 'melatonin'],
  },
  recovery: {
    label: 'Recovery',
    keywords: ['recovery', 'repair', 'exercise', 'muscle', 'soreness', 'inflammation', 'oxidative'],
  },
}

const PATHWAY_ALIASES: Record<string, PathwaySlug> = {
  gaba: 'gaba',
  gabaergic: 'gaba',
  sleepgaba: 'gaba',
  sleep_gaba: 'gaba',
  dopamine: 'dopamine',
  dopaminergic: 'dopamine',
  inflammation: 'inflammation',
  inflammatory: 'inflammation',
  antiinflammatory: 'inflammation',
  anti_inflammatory: 'inflammation',
  oxidative: 'inflammation',
  antioxidant: 'inflammation',
  immune: 'inflammation',
  stress: 'stress',
  cortisol: 'stress',
  hpa: 'stress',
  sleep: 'sleep',
  recovery: 'recovery',
}

export const pathwaySlugs = Object.keys(PATHWAY_DEFINITIONS) as PathwaySlug[]

function normalizeToken(value: unknown) {
  return asLowerText(value)
    .replace(/[_/+-]+/g, ' ')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function compactToken(value: unknown) {
  return normalizeToken(value).replace(/\s+/g, '')
}

function getSignalValues(record: Record<string, unknown>) {
  if (!record || typeof record !== 'object') return []

  return unique([
    asText(record.slug),
    asText(record.name),
    asText(record.displayName),
    asText(record.pathway_bucket),
    ...asList(record.pathways),
    ...asList(record.pathwayTargets),
    ...asList(record.mechanisms),
    ...asList(record.mechanism),
    ...asList(record.primary_effects),
    ...asList(record.primaryEffects),
    ...asList(record.effects),
    ...asList(record.best_for),
    ...asList(record.bestFor),
    ...asList(record.population_tags),
    ...collectRuntimeSignals(record),
  ].filter(Boolean))
}

export function normalizePathway(pathway: unknown): PathwaySlug | '' {
  const normalized = normalizeToken(pathway)
  const compact = compactToken(pathway)

  if (!normalized && !compact) return ''

  if (PATHWAY_DEFINITIONS[normalized as PathwaySlug]) return normalized as PathwaySlug
  if (PATHWAY_DEFINITIONS[compact as PathwaySlug]) return compact as PathwaySlug

  return PATHWAY_ALIASES[normalized] || PATHWAY_ALIASES[compact] || ''
}

export function getPathwayLabel(pathway: unknown) {
  const slug = normalizePathway(pathway)

  if (slug && PATHWAY_DEFINITIONS[slug]) {
    return PATHWAY_DEFINITIONS[slug].label
  }

  return formatDisplayLabel(pathway)
}

export function getPathwaySignals(record: Record<string, unknown>) {
  return unique(
    getSignalValues(record)
      .map((value) => formatDisplayLabel(value))
      .filter(isClean)
  )
}

export function isPathwayRelated(record: Record<string, unknown>, pathway: unknown) {
  const slug = normalizePathway(pathway)
  if (!slug) return false

  const definition = PATHWAY_DEFINITIONS[slug]
  if (!definition) return false

  const signalText = getSignalValues(record).map(normalizeToken).filter(Boolean).join(' ')
  const compactSignalText = signalText.replace(/\s+/g, '')

  if (!signalText) return false

  return definition.keywords.some((keyword) => {
    const normalizedKeyword = normalizeToken(keyword)
    const compactKeyword = compactToken(keyword)

    if (!normalizedKeyword && !compactKeyword) return false

    return (
      (normalizedKeyword && signalText.includes(normalizedKeyword)) ||
      (compactKeyword && compactSignalText.includes(compactKeyword))
    )
  })
}

export function getRelatedPathwayRecords(records: Record<string, unknown>[], pathway: unknown) {
  if (!Array.isArray(records)) return []

  return records.filter((record) => isPathwayRelated(record, pathway))
}

export function getSupportedPathways(record: Record<string, unknown>) {
  return pathwaySlugs.filter((pathway) => isPathwayRelated(record, pathway))
}
