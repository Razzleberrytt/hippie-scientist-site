import { getEvidenceTier, hasHumanEvidence, hasMechanismEvidence } from '@/lib/evidence'
import { cleanSummary, formatDisplayLabel, isClean, text, unique } from '@/lib/display-utils'
import { getPathwayLabel, getSupportedPathways } from '@/lib/pathways'
import { collectRuntimeSignals, asList, asLowerText, asText } from '@/lib/runtime-normalize'
import { buildPageMetadata } from '../src/lib/seo'
import type { RuntimeRecord } from '@/src/types/content'

export type CollectionKind = 'sleep' | 'stress' | 'cholinergic' | 'inflammation' | 'gaba' | 'recovery' | 'relaxation'
export type CollectionRecordType = 'herb' | 'compound' | 'mixed'
export type CollectionEvidence = 'mechanism' | 'human' | 'moderate_or_strong'

export type ScientificCollection = {
  slug: string
  title: string
  eyebrow: string
  itemType: CollectionRecordType
  primaryType?: 'herb' | 'compound'
  kinds: CollectionKind[]
  description: string
  chips: string[]
  related: Array<{ title: string; href: string; description: string }>
  evidence?: CollectionEvidence
}

const COLLECTION_KEYWORDS: Record<CollectionKind, string[]> = {
  sleep: ['gaba', 'sleep', 'relaxation', 'calming', 'circadian'],
  stress: ['cortisol', 'adaptogen', 'stress', 'anxiety', 'resilience'],
  cholinergic: ['acetylcholine', 'cholinergic', 'cognition', 'memory', 'focus', 'neuro'],
  inflammation: ['inflammatory', 'anti inflammatory', 'antioxidant', 'cytokine', 'oxidative', 'immune'],
  gaba: ['gaba', 'gabaergic', 'relaxation', 'calming', 'inhibitory'],
  recovery: ['recovery', 'repair', 'exercise', 'muscle', 'oxidative', 'inflammation'],
  relaxation: ['relaxation', 'calming', 'calm', 'anxiety', 'sleep'],
}

export const scientificCollections: ScientificCollection[] = [
  {
    slug: 'best-studied-sleep-compounds',
    title: 'Best-Studied Sleep Compounds',
    eyebrow: 'Sleep evidence collection',
    itemType: 'mixed',
    primaryType: 'compound',
    kinds: ['sleep', 'gaba', 'relaxation'],
    evidence: 'mechanism',
    description: 'A workbook-first collection of compounds and botanicals with visible sleep, GABA, calming, relaxation, or circadian signals. Items are included only when the runtime record exposes evidence or mechanism context; this is not a ranked efficacy list.',
    chips: ['GABA signaling', 'Sleep quality', 'Relaxation', 'Circadian context', 'Nighttime recovery'],
    related: [
      { title: 'Adaptogens for Stress', href: '/guides/anxiety/best-adaptogens-for-stress', description: 'Stress and resilience records with adaptogenic or cortisol-adjacent signals.' },
      { title: 'GABA Pathways', href: '/learn/gaba', description: 'Pathway hub for GABA, inhibitory tone, relaxation, and sleep-adjacent records.' },
      { title: 'Recovery Support', href: '/guides/sleep', description: 'Recovery and repair signals that overlap with sleep quality and nighttime restoration.' },
      { title: 'Relaxation Mechanisms', href: '/guides/sleep', description: 'Broader semantic navigation for calming and sleep-support discovery.' },
    ],
  },
  {
    slug: 'adaptogens-for-stress',
    title: 'Adaptogens for Stress',
    eyebrow: 'Stress resilience collection',
    itemType: 'mixed',
    primaryType: 'herb',
    kinds: ['stress', 'relaxation'],
    evidence: 'mechanism',
    description: 'Herbs and compounds with workbook signals around stress, cortisol, adaptogenic use, anxiety, calm, or resilience. Inclusion reflects semantic and evidence-context overlap, not a promise of clinical effect.',
    chips: ['Cortisol context', 'Adaptogenic language', 'Stress resilience', 'Calming support', 'HPA-axis adjacency'],
    related: [
      { title: 'Best-Studied Sleep Compounds', href: '/guides/sleep', description: 'Sleep and relaxation records that often overlap with stress physiology.' },
      { title: 'GABA Pathways', href: '/learn/gaba', description: 'Calming pathway records related to inhibitory tone and relaxation.' },
      { title: 'Stress Goal Guide', href: '/best-supplements-for-stress', description: 'Intent-oriented stress support navigation from the goal layer.' },
      { title: 'Natural Anxiolytics', href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha', description: 'Broader harm-aware discovery for calming botanicals beyond one headline herb.' },
    ],
  },
  {
    slug: 'cholinergic-compounds',
    title: 'Cholinergic Compounds',
    eyebrow: 'Cognition mechanism collection',
    itemType: 'mixed',
    primaryType: 'compound',
    kinds: ['cholinergic'],
    evidence: 'mechanism',
    description: 'A cognition-focused collection for records with acetylcholine, cholinergic, memory, focus, or neuro-related workbook signals. The page organizes mechanism-adjacent discovery without asserting unsupported nootropic outcomes.',
    chips: ['Acetylcholine', 'Memory', 'Focus', 'Neuro signaling', 'Cognition'],
    related: [
      { title: 'Dopamine Pathways', href: '/learn/dopamine', description: 'Cognition and attention records with dopaminergic or motivation-adjacent signals.' },
      { title: 'Focus Supplements', href: '/best-supplements-for-focus', description: 'Intent entry page for focus-oriented supplement discovery.' },
      { title: 'Cognition Compounds', href: '/guides/focus', description: 'Goal-oriented discovery for cognition, attention, and memory signals.' },
      { title: 'Brain Fog Guide', href: '/guides/supplements-for-brain-fog-and-fatigue', description: 'Decision-oriented discovery for cognitive clarity intent.' },
    ],
  },
  {
    slug: 'high-evidence-anti-inflammatory-herbs',
    title: 'High-Evidence Anti-Inflammatory Herbs',
    eyebrow: 'Inflammation evidence collection',
    itemType: 'mixed',
    primaryType: 'herb',
    kinds: ['inflammation', 'recovery'],
    evidence: 'moderate_or_strong',
    description: 'Herbs and related compounds with inflammation, antioxidant, cytokine, oxidative-stress, or immune signals plus stronger evidence labeling when available in the runtime payload. This remains an evidence-organizing page, not a treatment ranking.',
    chips: ['Inflammation', 'Antioxidant systems', 'Cytokine context', 'Oxidative stress', 'Immune signaling'],
    related: [
      { title: 'Inflammation Pathways', href: '/learn/inflammation', description: 'Pathway hub for inflammatory, immune, oxidative, and antioxidant records.' },
      { title: 'Recovery Support', href: '/guides/sleep', description: 'Recovery signals that can overlap with inflammatory and oxidative-stress context.' },
      { title: 'Joint Support Supplements', href: '/best-supplements-for-joint-support', description: 'Intent entry page for joint-support discovery.' },
      { title: 'Gut Health Supplements', href: '/best-supplements-for-gut-health', description: 'Adjacent discovery for immune and inflammation-adjacent wellness intent.' },
    ],
  },
]

function asArray(records: unknown): Record<string, unknown>[] {
  return Array.isArray(records) ? records.filter(Boolean) : []
}

function safeLower(value: unknown) {
  return asLowerText(value)
}

function signalValues(record: Record<string, unknown>) {
  if (!record || typeof record !== 'object') return []

  return unique([
    asText(record.slug),
    asText(record.name),
    asText(record.displayName),
    asText(record.domain),
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

function keywordMatch(record: Record<string, unknown>, keywords: string[]) {
  const normalizedSignals = signalValues(record).map(safeLower).join(' ')
  if (!normalizedSignals) return false

  return keywords.some((keyword) => {
    const normalizedKeyword = safeLower(keyword)
    return normalizedKeyword ? normalizedSignals.includes(normalizedKeyword) : false
  })
}

function evidenceMatches(record: Record<string, unknown>, requirement?: CollectionEvidence) {
  if (!requirement) return true
  if (!record || typeof record !== 'object') return false

  if (requirement === 'human') return hasHumanEvidence(record as RuntimeRecord)
  if (requirement === 'mechanism') return hasMechanismEvidence(record as RuntimeRecord) || hasHumanEvidence(record as RuntimeRecord)

  const tier = getEvidenceTier(record as RuntimeRecord)
  return tier === 'strong' || tier === 'moderate' || hasHumanEvidence(record as RuntimeRecord)
}

export function normalizeCollection(collection: unknown): ScientificCollection | null {
  if (!collection || typeof collection !== 'object') return null

  const raw = collection as Partial<ScientificCollection>
  const slug = text(raw.slug)
  const title = text(raw.title)
  const kinds = asArray(raw.kinds).map(kind => safeLower(kind) as CollectionKind).filter(kind => Boolean(COLLECTION_KEYWORDS[kind]))

  if (!slug || !title || !kinds.length) return null

  return {
    slug,
    title,
    eyebrow: text(raw.eyebrow) || 'Scientific collection',
    itemType: raw.itemType === 'herb' || raw.itemType === 'compound' || raw.itemType === 'mixed' ? raw.itemType : 'mixed',
    primaryType: raw.primaryType === 'herb' || raw.primaryType === 'compound' ? raw.primaryType : undefined,
    kinds,
    description: getCollectionDescription(raw),
    chips: asArray(raw.chips).map(formatDisplayLabel).filter(isClean),
    related: asArray(raw.related)
      .map((item) => ({
        title: formatDisplayLabel(item?.title),
        href: text(item?.href),
        description: text(item?.description),
      }))
      .filter((item) => item.title && item.href.startsWith('/')),
    evidence: raw.evidence === 'human' || raw.evidence === 'mechanism' || raw.evidence === 'moderate_or_strong' ? raw.evidence : undefined,
  }
}

export function getCollectionDescription(collection: unknown) {
  const raw = collection && typeof collection === 'object' ? collection as Partial<ScientificCollection> : {}
  const description = text(raw.description)
  if (description) return description

  const title = text(raw.title) || 'Scientific collection'
  return `${title} groups workbook-visible records by conservative semantic overlap and evidence context.`
}

export function buildCollectionMetadata(collection: unknown) {
  const normalized = normalizeCollection(collection)
  const title = normalized?.title || 'Scientific Collection'
  const description = getCollectionDescription(normalized || collection)
  const path = normalized?.slug ? `/collections/${normalized.slug}` : '/collections'

  return buildPageMetadata({ title: `${title} | Scientific Collections`, description, path })
}

export function isCollectionMatch(record: Record<string, unknown>, collection: unknown) {
  const normalized = normalizeCollection(collection)
  if (!normalized || !record || typeof record !== 'object') return false
  if (!text(record.slug)) return false

  const keywords = unique(normalized.kinds.flatMap(kind => COLLECTION_KEYWORDS[kind] || []))
  if (!keywordMatch(record, keywords)) return false

  return evidenceMatches(record, normalized.evidence)
}

export function getCollectionRecords(records: unknown, collection: unknown) {
  return asArray(records).filter(record => isCollectionMatch(record, collection))
}

export function findCollectionBySlug(slug: unknown) {
  const value = text(slug)
  return scientificCollections.find(collection => collection.slug === value) || null
}

export function getFeaturedCollections(record: Record<string, unknown>) {
  return scientificCollections
    .filter(collection => isCollectionMatch(record, collection))
    .map(collection => ({
      slug: collection.slug,
      title: collection.title,
      href: `/collections/${collection.slug}`,
      description: getCollectionDescription(collection),
    }))
}

export function getCollectionRecordSignals(record: Record<string, unknown>, collection: ScientificCollection) {
  const keywords = unique(collection.kinds.flatMap(kind => COLLECTION_KEYWORDS[kind] || []))
  const signals = signalValues(record)
    .filter(value => keywordMatch({ summary: value }, keywords))
    .map(formatDisplayLabel)
    .filter(isClean)

  const pathways = getSupportedPathways(record).map(getPathwayLabel).filter(isClean)

  return unique([...signals, ...pathways]).slice(0, 4)
}

export function getCollectionCard(record: Record<string, unknown>, type: 'herb' | 'compound', collection: ScientificCollection) {
  const slug = text(record?.slug)
  const label = formatDisplayLabel(record?.displayName || record?.name || slug)

  return {
    record,
    type,
    slug,
    name: label || slug,
    href: slug ? `/${type === 'herb' ? 'herbs' : 'compounds'}/${slug}` : '',
    summary: cleanSummary(record?.summary || record?.description || '', type),
    signals: getCollectionRecordSignals(record, collection),
    pathways: getSupportedPathways(record).map(getPathwayLabel).filter(isClean).slice(0, 3),
  }
}
