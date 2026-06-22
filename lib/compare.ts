/**
 * Data layer for /compare/ pages.
 * Pre-flight findings (2026-06-22):
 *   Herbs: 287 total, 218 PUBLISH | Compounds: 597 total, 123 PUBLISH
 *   100% coverage: slug, name, summary, mechanisms, evidence_grade, evidence_tier,
 *                  primary_effects, contraindications, interactions
 *   22% coverage: typical_dosage/dosage — show "—" when absent
 *   No harm_reduction field in source — rely on HARM_REDUCTION_SLUGS + doNotMonetize
 */

import compoundsJson from '@/public/data/compounds.json'
import herbsJson from '@/public/data/herbs.json'

export const HARM_REDUCTION_SLUGS = new Set([
  'kava', 'kavain', 'dihydrokavain', 'methysticin', 'yangonin',
  'desmethoxyyangonin', 'dihydromethysticin', 'piper-methysticum',
  'kratom', 'mitragynine', '7-hydroxymitragynine',
  'psilocybin', 'psilocin', '5-meo-dmt', 'dmt', 'lsa', 'mescaline',
  'ibogaine', 'harmaline', 'harmine', 'amanita-muscaria', 'muscimol',
  'thc', 'thcv', 'rosin', 'safrole', 'sinicuichi', 'wild-dagga',
  'heimia-salicifolia', 'morning-glory-seed', 'acacia-maidenii',
])

export type EvidenceLevel = 'strong' | 'moderate' | 'preliminary' | 'anecdotal' | 'unknown'

export type CompareItem = {
  slug: string
  name: string
  type: 'herb' | 'compound'
  scientificName?: string
  description: string
  primaryBenefits: string[]
  mechanisms: string[]
  canonicalMechanisms: string[]
  mechanismCategories: string[]
  evidenceGrade?: string
  evidenceTier?: string
  evidenceLevel: EvidenceLevel
  typicalDose?: string
  onsetTime?: string
  bestTiming?: string
  keyInteractions?: string[]
  sideEffects?: string[]
  contraindications?: string[]
  category?: string
  safety?: string
  sources?: unknown[]
  doNotMonetize: boolean
  isHarmReduction: boolean
  pageUrl: string
}

type SourceItem = Record<string, unknown> & {
  slug?: string
  name?: string
  description?: string
  summary?: string
}

// ─── Private helpers ──────────────────────────────────────────────────────────

function str(v: unknown, fallback = ''): string {
  if (typeof v !== 'string') return fallback
  const t = v.trim()
  return t && t.toLowerCase() !== 'nan' ? t : fallback
}

function arr(v: unknown): string[] {
  if (!Array.isArray(v)) return []
  return v.filter((x): x is string => typeof x === 'string' && Boolean(x.trim()))
}

function gradeToLevel(grade: string, tier: string): EvidenceLevel {
  const g = (grade + ' ' + tier).toLowerCase()
  if (/\ba\b|strong|meta-analysis|systematic review/.test(g)) return 'strong'
  if (/\bb\b|moderate|human evidence|rct/.test(g)) return 'moderate'
  if (/\bc\b|limited|preliminary|pilot/.test(g)) return 'preliminary'
  if (/\bd\b|anecdot|traditional|in vitro only/.test(g)) return 'anecdotal'
  return 'unknown'
}

function parseName(rawName: string): { name: string; scientificName?: string } {
  const match = rawName.match(/\(([^)]+)\)/)
  if (!match) return { name: rawName }
  return {
    name: rawName.replace(/\s*\([^)]+\)/, '').trim(),
    scientificName: match[1]?.trim(),
  }
}

function hasHarmFlag(item: SourceItem, slug: string): boolean {
  const textFields = [item.zone, item.category, item.governance_status, item.legal_status, item.regulatory_status]
    .map((v) => String(v || '').toLowerCase())
    .join(' ')
  return (
    HARM_REDUCTION_SLUGS.has(slug) ||
    item.harm_reduction === true ||
    item.harmReduction === true ||
    item.controlled_substance === true ||
    item.doNotPromote === true ||
    item.doNotMonetize === true ||
    textFields.includes('harm')
  )
}

function sourceItemToCompareItem(item: SourceItem, type: CompareItem['type']): CompareItem | null {
  const slug = str(item.slug)
  const rawName = str(item.name)
  if (!slug || !rawName) return null

  const { name, scientificName } = parseName(rawName)
  const evidenceGrade = str(item.evidence_grade)
  const evidenceTier = str(item.evidence_tier)

  const primaryBenefits = arr(item.primary_effects).length > 0
    ? arr(item.primary_effects)
    : arr(item.effects)

  const mechanisms = arr(item.canonical_mechanisms).length > 0
    ? arr(item.canonical_mechanisms)
    : arr(item.mechanisms)

  return {
    slug,
    name,
    type,
    ...(scientificName ? { scientificName } : {}),
    description: str(item.description) || str(item.summary) || '',
    primaryBenefits: primaryBenefits.slice(0, 5),
    mechanisms: mechanisms.slice(0, 6),
    canonicalMechanisms: arr(item.canonical_mechanisms).slice(0, 5),
    mechanismCategories: arr(item.mechanism_categories),
    evidenceGrade: evidenceGrade || undefined,
    evidenceTier: evidenceTier || undefined,
    evidenceLevel: gradeToLevel(evidenceGrade, evidenceTier),
    typicalDose: str(item.typical_dosage) || str(item.dosage) || undefined,
    onsetTime: str(item.time_to_effect) || str(item.onset) || undefined,
    bestTiming: str(item.best_timing) || str(item.timing) || undefined,
    keyInteractions: arr(item.interactions).slice(0, 5),
    sideEffects: arr(item.side_effects).slice(0, 5),
    contraindications: arr(item.contraindications).slice(0, 5),
    category: arr(item.mechanism_categories)[0] || undefined,
    safety: str(item.safety) || undefined,
    sources: Array.isArray(item.sources) ? item.sources : [],
    doNotMonetize: Boolean(item.doNotMonetize),
    isHarmReduction: hasHarmFlag(item, slug),
    pageUrl: `/${type === 'herb' ? 'herbs' : 'compounds'}/${slug}`,
  }
}

// ─── Public API ───────────────────────────────────────────────────────────────

/** Synchronous lookup — reads directly from bundled JSON at build time. */
export function getItemBySlug(slug: string): CompareItem | null {
  const normalizedSlug = slug.toLowerCase().trim()
  const herbs = (Array.isArray(herbsJson) ? herbsJson : Object.values(herbsJson)) as SourceItem[]
  const compounds = (Array.isArray(compoundsJson) ? compoundsJson : Object.values(compoundsJson)) as SourceItem[]

  const herb = herbs.find((h) => String(h.slug || '').toLowerCase().trim() === normalizedSlug)
  if (herb) return sourceItemToCompareItem(herb, 'herb')

  const compound = compounds.find((c) => String(c.slug || '').toLowerCase().trim() === normalizedSlug)
  if (compound) return sourceItemToCompareItem(compound, 'compound')

  return null
}

/** Converts a raw getUnifiedRuntimeRecords() record to a CompareItem. */
export function recordToCompareItem(record: Record<string, unknown>): CompareItem {
  const slug = str(record.slug)
  const type = (record.entityType === 'herb' ? 'herb' : 'compound') as 'herb' | 'compound'
  const evidenceGrade = str(record.evidence_grade)
  const evidenceTier = str(record.evidence_tier)

  return {
    slug,
    name: str(record.name) || str(record.displayName) || slug,
    type,
    scientificName: str(record.scientific_name) || undefined,
    description: str(record.summary) || str(record.description) || '',
    primaryBenefits: arr(record.primary_effects).slice(0, 5),
    mechanisms: arr(record.mechanisms).slice(0, 6),
    canonicalMechanisms: arr(record.canonical_mechanisms).slice(0, 5),
    mechanismCategories: arr(record.mechanism_categories),
    evidenceGrade: evidenceGrade || undefined,
    evidenceTier: evidenceTier || undefined,
    evidenceLevel: gradeToLevel(evidenceGrade, evidenceTier),
    typicalDose: str(record.typical_dosage) || str(record.dosage) || undefined,
    onsetTime: str(record.time_to_effect) || str(record.onset) || undefined,
    bestTiming: str(record.best_timing) || str(record.timing) || undefined,
    keyInteractions: arr(record.interactions).slice(0, 5),
    sideEffects: arr(record.side_effects).slice(0, 5),
    contraindications: arr(record.contraindications).slice(0, 5),
    category: arr(record.mechanism_categories)[0] || undefined,
    safety: str(record.safety) || undefined,
    sources: Array.isArray(record.sources) ? record.sources : [],
    doNotMonetize: Boolean(record.doNotMonetize),
    isHarmReduction:
      HARM_REDUCTION_SLUGS.has(slug) ||
      Boolean(record.harm_reduction) ||
      Boolean(record.doNotMonetize),
    pageUrl: type === 'herb' ? `/herbs/${slug}` : `/compounds/${slug}`,
  }
}

export function isHarmReductionSlug(slug: string): boolean {
  return HARM_REDUCTION_SLUGS.has(slug)
}

export function parseCompareSlug(
  slug: string,
): { item1Slug: string; item2Slug: string } | null {
  const positions: number[] = []
  let i = 0
  while (i < slug.length) {
    const idx = slug.indexOf('-vs-', i)
    if (idx === -1) break
    positions.push(idx)
    i = idx + 1
  }
  if (positions.length === 0) return null
  for (const pos of positions) {
    const a = slug.slice(0, pos)
    const b = slug.slice(pos + 4)
    if (a && b) return { item1Slug: a, item2Slug: b }
  }
  return null
}

export function evidenceDots(level: EvidenceLevel): { filled: number; empty: number } {
  const map: Record<EvidenceLevel, number> = {
    strong: 5, moderate: 4, preliminary: 2, anecdotal: 1, unknown: 0,
  }
  const filled = map[level] ?? 0
  return { filled, empty: 5 - filled }
}

export function evidenceLabelText(level: EvidenceLevel): string {
  const map: Record<EvidenceLevel, string> = {
    strong: 'Strong Evidence',
    moderate: 'Moderate Evidence',
    preliminary: 'Preliminary Evidence',
    anecdotal: 'Anecdotal / Traditional',
    unknown: 'Evidence Unknown',
  }
  return map[level]
}

export function stimulationProfile(item: CompareItem): 'stimulating' | 'calming' | 'adaptogenic' | 'mixed' {
  const text = [...item.primaryBenefits, ...item.mechanisms, item.description].join(' ').toLowerCase()
  const isStim = /\bstimul|energy|alert|focus|wake|caffeine/.test(text)
  const isSed = /\bsleep|calm|sedat|relax|anxiolyt/.test(text)
  if (isStim && !isSed) return 'stimulating'
  if (isSed && !isStim) return 'calming'
  if (item.mechanismCategories.includes('stress') || /adapt/.test(text)) return 'adaptogenic'
  return 'mixed'
}

export function getRelatedComparisons(
  slug1: string,
  slug2: string,
  allCombinations: readonly string[],
  limit = 6,
): string[] {
  const current = new Set([slug1, slug2])
  return allCombinations
    .filter(pair => {
      const parts = pair.split('-vs-')
      if (parts.length !== 2) return false
      const [a, b] = parts
      if (isHarmReductionSlug(a) || isHarmReductionSlug(b)) return false
      const overlap = [a, b].filter(s => current.has(s)).length
      return overlap === 1
    })
    .slice(0, limit)
}

export function buildFAQs(
  item1: CompareItem,
  item2: CompareItem,
): Array<{ question: string; answer: string }> {
  const n1 = item1.name
  const n2 = item2.name
  const winner = item1.evidenceLevel === 'strong' || (item1.evidenceLevel === 'moderate' && item2.evidenceLevel !== 'strong')
    ? item1 : item2
  const loser = winner === item1 ? item2 : item1

  const benefit1 = item1.primaryBenefits[0] || 'general support'
  const benefit2 = item2.primaryBenefits[0] || 'general support'

  return [
    {
      question: `Which is better, ${n1} or ${n2}?`,
      answer: `It depends on your goal. ${winner.name} has ${evidenceLabelText(winner.evidenceLevel).toLowerCase()} for its primary use cases and may be the better default. ${loser.name} offers a different mechanism and may suit users who respond better to ${loser.primaryBenefits[0] || 'its approach'}. Many people find value in both at different times.`,
    },
    {
      question: `Can I take ${n1} and ${n2} together?`,
      answer: `${n1} and ${n2} are commonly used together because they work through different mechanisms. Always start with one at a time to assess tolerance, then layer the second if needed. Consult a healthcare provider if you take medications.`,
    },
    {
      question: `Which works faster, ${n1} or ${n2}?`,
      answer: item1.onsetTime || item2.onsetTime
        ? `${n1} ${item1.onsetTime ? `typically shows effects in ${item1.onsetTime}` : 'has variable onset'}. ${n2} ${item2.onsetTime ? `typically shows effects in ${item2.onsetTime}` : 'has variable onset'}. Adaptogens and nootropics often require consistent use over weeks.`
        : `Both ${n1} and ${n2} may take days to weeks of consistent use before effects become noticeable, though some users report acute effects sooner. Individual response varies.`,
    },
    {
      question: `Which is safer, ${n1} or ${n2}?`,
      answer: `Both ${n1} and ${n2} are generally well-tolerated when used as directed. ${n1} ${item1.contraindications?.length ? `should be avoided if you have: ${item1.contraindications.slice(0, 2).join(', ')}` : 'has few known contraindications'}. ${n2} ${item2.contraindications?.length ? `should be avoided if: ${item2.contraindications.slice(0, 2).join(', ')}` : 'has few known contraindications'}. Neither replaces medical advice.`,
    },
    {
      question: `What is the key difference between ${n1} and ${n2}?`,
      answer: `${n1} primarily works through ${item1.canonicalMechanisms.slice(0, 2).join(' and ') || 'its active compounds'}, making it better suited for ${benefit1}. ${n2} works through ${item2.canonicalMechanisms.slice(0, 2).join(' and ') || 'different pathways'}, making it better suited for ${benefit2}. The right choice depends on which outcome you're prioritizing.`,
    },
    {
      question: `Which is better for ${benefit1}?`,
      answer: `For ${benefit1}, ${item1.name} has ${evidenceLabelText(item1.evidenceLevel).toLowerCase()} based on its ${item1.evidenceTier || 'available research'}. ${item2.name} may also support this goal through different pathways. Compare both based on your specific needs and consult available evidence.`,
    },
  ]
}
