/**
 * Comparison data layer for the first flagship page.
 *
 * Available fields for the herb records used here:
 * - Ashwagandha: slug, name, summary/description, effects, primary_effects,
 *   mechanisms/canonical_mechanisms, mechanism categories/classes/target systems,
 *   evidence_grade, evidence_tier, evidence_design_match, evidence_rationale,
 *   trial_design_insight, contraindications, interactions, side_effects, dosage,
 *   typical_dosage, safety, buying_criteria, affiliate flags, governance flags.
 * - Rhodiola: the same core fields are present, but several deeper evidence fields
 *   such as evidence_rationale and trial_design_insight are empty.
 *
 * Reliable enough for this prototype:
 * - slug, name, summary/description, effects/primary_effects, canonical_mechanisms
 *   or mechanisms, evidence_tier/evidence_grade, typical_dosage/dosage,
 *   contraindications, interactions, side_effects when non-empty, safety, and
 *   conservative harm-reduction or do-not-monetize flags.
 *
 * Intentionally simplified or omitted because current data does not support it:
 * - onset time, best timing, safety grades, cost-per-dose, product rankings beyond
 *   existing revenue config, citation counts, PubMed links, RCT counts, sample sizes,
 *   effect sizes, and detailed molecular pathway explanations.
 */

import compoundsJson from '@/public/data/compounds.json'
import herbsJson from '@/public/data/herbs.json'

export type CompareItem = {
  slug: string
  name: string
  type: 'herb' | 'compound'
  scientificName?: string
  description: string
  primaryBenefits: string[]
  mechanisms: string[]
  safetyGrade?: string
  evidenceLevel?: string
  typicalDose?: string
  onsetTime?: string
  bestTiming?: string
  keyInteractions?: string[]
  sideEffects?: string[]
  contraindications?: string[]
  category?: string
  isHarmReduction: boolean
  pageUrl: string
}

type SourceItem = Record<string, unknown> & {
  slug?: string
  name?: string
  description?: string
  summary?: string
}

const HARM_REDUCTION_SLUGS = new Set([
  'kava',
  'kavain',
  'dihydrokavain',
  'methysticin',
  'yangonin',
  'desmethoxyyangonin',
  'dihydromethysticin',
  'piper-methysticum',
  'kratom',
  'mitragynine',
  '7-hydroxymitragynine',
  'psilocybin',
  'psilocin',
  '5-meo-dmt',
  'dmt',
  'lsa',
  'mescaline',
  'ibogaine',
  'harmaline',
  'harmine',
  'amanita-muscaria',
  'muscimol',
  'thc',
  'thcv',
  'rosin',
  'safrole',
  'sinicuichi',
  'wild-dagga',
  'heimia-salicifolia',
  'morning-glory-seed',
  'acacia-maidenii',
])

function normalizeSlug(slug: string) {
  return slug.toLowerCase().trim()
}

function asString(value: unknown): string | undefined {
  return typeof value === 'string' && value.trim() ? value.trim() : undefined
}

function asStringArray(value: unknown): string[] {
  if (!Array.isArray(value)) return []
  return value.filter((item): item is string => typeof item === 'string' && item.trim().length > 0)
}

function findBySlug(items: SourceItem[], slug: string): SourceItem | null {
  return items.find((item) => normalizeSlug(String(item.slug || '')) === slug) ?? null
}

function parseName(rawName: string) {
  const match = rawName.match(/\(([^)]+)\)/)
  if (!match) return { name: rawName }

  return {
    name: rawName.replace(/\s*\([^)]+\)/, '').trim(),
    scientificName: match[1]?.trim(),
  }
}

function hasHarmReductionFlag(item: SourceItem, slug: string) {
  const textFields = [
    item.zone,
    item.category,
    item.governance_status,
    item.legal_status,
    item.regulatory_status,
  ]
    .map((value) => String(value || '').toLowerCase())
    .join(' ')

  return (
    isHarmReductionSlug(slug) ||
    item.harm_reduction === true ||
    item.harmReduction === true ||
    item.controlled_substance === true ||
    item.doNotPromote === true ||
    item.doNotMonetize === true ||
    textFields.includes('harm')
  )
}

function mapItem(item: SourceItem, type: CompareItem['type']): CompareItem | null {
  const slug = asString(item.slug)
  const rawName = asString(item.name)
  if (!slug || !rawName) return null

  const parsedName = parseName(rawName)
  const description = asString(item.description) || asString(item.summary) || ''
  const primaryBenefits = asStringArray(item.primary_effects).length > 0
    ? asStringArray(item.primary_effects)
    : asStringArray(item.effects)
  const mechanisms = asStringArray(item.canonical_mechanisms).length > 0
    ? asStringArray(item.canonical_mechanisms)
    : asStringArray(item.mechanisms)
  const evidenceLevel = asString(item.evidence_tier) || asString(item.evidence_grade)
  const typicalDose = asString(item.typical_dosage) || asString(item.dosage)
  const contraindications = asStringArray(item.contraindications)
  const keyInteractions = asStringArray(item.interactions)
  const sideEffects = asStringArray(item.side_effects)

  return {
    slug,
    name: parsedName.name,
    type,
    ...(parsedName.scientificName ? { scientificName: parsedName.scientificName } : {}),
    description,
    primaryBenefits,
    mechanisms,
    ...(evidenceLevel ? { evidenceLevel } : {}),
    ...(typicalDose ? { typicalDose } : {}),
    ...(keyInteractions.length > 0 ? { keyInteractions } : {}),
    ...(sideEffects.length > 0 ? { sideEffects } : {}),
    ...(contraindications.length > 0 ? { contraindications } : {}),
    ...(asString(item.category) ? { category: asString(item.category) } : {}),
    isHarmReduction: hasHarmReductionFlag(item, slug),
    pageUrl: `/${type === 'herb' ? 'herbs' : 'compounds'}/${slug}`,
  }
}

export function isHarmReductionSlug(slug: string): boolean {
  return HARM_REDUCTION_SLUGS.has(normalizeSlug(slug))
}

export function getItemBySlug(slug: string): CompareItem | null {
  const normalizedSlug = normalizeSlug(slug)
  const herbs = Array.isArray(herbsJson) ? herbsJson as SourceItem[] : Object.values(herbsJson) as SourceItem[]
  const compounds = Array.isArray(compoundsJson)
    ? compoundsJson as SourceItem[]
    : Object.values(compoundsJson) as SourceItem[]

  const herb = findBySlug(herbs, normalizedSlug)
  if (herb) return mapItem(herb, 'herb')

  const compound = findBySlug(compounds, normalizedSlug)
  if (compound) return mapItem(compound, 'compound')

  return null
}
