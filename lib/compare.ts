/**
 * SUPPLEMENT COMPARISON DATA LAYER
 * 
 * Available source fields in herbs.json / compounds.json for Ashwagandha and Rhodiola:
 * - slug: Unique identifier (string)
 * - name: Display name (string), sometimes containing scientific name in parentheses
 * - summary / description: Text overview of the supplement (string)
 * - effects: Array of strings representing general effects (e.g. stress, sleep)
 * - primary_effects: Array of strings representing primary targets (e.g. sleep)
 * - canonical_mechanisms / mechanisms: Array of strings representing biological mechanisms
 * - evidence_grade: Evidence letter grade (string)
 * - evidence_tier: Evidence description (string)
 * - dosage / typical_dosage: Typical dose text (string)
 * - contraindications: Array of safety contraindications (string[])
 * - interactions: Array of drug/supplement interactions (string[])
 * - side_effects: Array of known side effects (string[])
 * - safety: General safety summary text (string)
 * 
 * Fields reliable enough to use:
 * - name, slug, description, canonical_mechanisms, evidence_tier, typical_dosage, contraindications, interactions, safety
 * 
 * Advanced comparison sections intentionally simplified or omitted because the source data does not support them yet:
 * - onsetTime: Not present in the database schemas (maps to undefined)
 * - bestTiming: Not present in the database schemas (maps to undefined)
 * - safetyGrade: No standardized safety grade (A/B/C/D) exists in database (maps to undefined, safety text is displayed instead)
 * - category: Not consistently defined or populated in database (maps to undefined)
 */

import { getHerbBySlug, getCompoundBySlug } from '@/src/lib/runtime-data'

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

const HARM_REDUCTION_SLUGS = new Set([
  'kava', 'kavain', 'dihydrokavain', 'methysticin', 'yangonin', 'desmethoxyyangonin',
  'dihydromethysticin', 'piper-methysticum', 'kratom', 'mitragynine', '7-hydroxymitragynine',
  'psilocybin', 'psilocin', '5-meo-dmt', 'dmt', 'lsa', 'mescaline', 'ibogaine',
  'harmaline', 'harmine', 'amanita-muscaria', 'muscimol', 'thc', 'thcv', 'rosin',
  'safrole', 'sinicuichi', 'wild-dagga', 'heimia-salicifolia', 'morning-glory-seed',
  'acacia-maidenii'
])

export function isHarmReductionSlug(slug: string): boolean {
  return HARM_REDUCTION_SLUGS.has(slug.toLowerCase().trim())
}

export async function getItemBySlug(slug: string): Promise<CompareItem | null> {
  const normalizedSlug = slug.toLowerCase().trim()

  // 1. Check herbs first
  let rawItem = await getHerbBySlug(normalizedSlug)
  let type: 'herb' | 'compound' = 'herb'

  // 2. Then compounds
  if (!rawItem) {
    rawItem = await getCompoundBySlug(normalizedSlug)
    type = 'compound'
  }

  if (!rawItem) {
    return null
  }

  // Parse scientific name from name if parenthesized, e.g., "Ashwagandha (Withania somnifera)"
  const nameMatch = rawItem.name.match(/\(([^)]+)\)/)
  const name = nameMatch ? rawItem.name.replace(/\s*\([^)]+\)/, '').trim() : rawItem.name
  const scientificName = nameMatch ? nameMatch[1].trim() : undefined

  // Determine harm-reduction status using slug check and database flags
  const isHarmReduction = isHarmReductionSlug(normalizedSlug) ||
    Boolean(rawItem.controlled_substance) ||
    Boolean(rawItem.doNotPromote) ||
    Boolean(rawItem.doNotMonetize)

  return {
    slug: rawItem.slug,
    name,
    type,
    scientificName,
    description: rawItem.description || rawItem.summary || '',
    primaryBenefits: rawItem.effects || [],
    mechanisms: rawItem.canonical_mechanisms || rawItem.mechanisms || [],
    safetyGrade: undefined, // Schema does not contain safetyGrade
    evidenceLevel: rawItem.evidence_tier || rawItem.evidence_grade || undefined,
    typicalDose: rawItem.typical_dosage || rawItem.dosage || undefined,
    onsetTime: undefined, // Schema does not contain onsetTime
    bestTiming: undefined, // Schema does not contain bestTiming
    keyInteractions: Array.isArray(rawItem.interactions) ? rawItem.interactions : undefined,
    sideEffects: Array.isArray(rawItem.side_effects) && rawItem.side_effects.length > 0 ? rawItem.side_effects : undefined,
    contraindications: Array.isArray(rawItem.contraindications) ? rawItem.contraindications : undefined,
    category: rawItem.category || undefined,
    isHarmReduction,
    pageUrl: `/${type === 'herb' ? 'herbs' : 'compounds'}/${rawItem.slug}`
  }
}
