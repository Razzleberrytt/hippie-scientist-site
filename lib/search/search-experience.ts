import { cleanSummary, formatDisplayLabel, isClean, labelize, list, text, unique } from '@/lib/display-utils'
import {
  normalizeDecisionEvidence,
  normalizeDecisionSafety,
} from '@/lib/decision-primitives'
import { getSemanticOrchestrationSignals } from '@/src/lib/semantic-orchestration'

export type ResearchSearchType = 'Herb' | 'Compound'

export type ResearchSearchItem = {
  slug: string
  name: string
  type: ResearchSearchType
  href: string
  summary: string
  aliases: string[]
  scientificNames: string[]
  extractNames: string[]
  outcomes: string[]
  conditions: string[]
  mechanisms: string[]
  evidence: string
  safety: string
  quality: string
  searchText: string
  authorityScore: number
  discoveryScore: number
  popularityScore: number
  evidenceCompleteness: number
  evidenceScore: number
  mechanismScore: number
  ecosystemScore: number
  safetyPenalty: number
  uncertaintyPenalty: number
  translationalPenalty: number
  typicalDosage: string
  avoidIf: string[]
  sideEffects: string[]
  contraindications: string[]
  interactions: string[]
}

export type SearchIntent = 'general' | 'evidence' | 'safety' | 'mechanism' | 'comparison'

export type RecentResearchItem = Pick<ResearchSearchItem, 'slug' | 'name' | 'type' | 'href'> & {
  viewedAt: string
}

export type FailedSearchEntry = {
  query: string
  count: number
  lastSeenAt: string
}

const RECENT_KEY = 'ths:search:recent:v1'
const FAILED_KEY = 'ths:search:failed:v1'
const COMPARE_KEY = 'ths:search:compare:v1'
const MAX_RECENT = 6
const MAX_FAILURES = 30

function cleanList(...values: unknown[]): string[] {
  return unique(values.flatMap((value) => list(value)).map((value) => formatDisplayLabel(value)).filter(isClean))
}

function numeric(value: unknown): number | null {
  if (typeof value === 'number' && Number.isFinite(value)) return value
  if (typeof value === 'string') {
    const parsed = Number(value.replace(/,/g, '').trim())
    return Number.isFinite(parsed) ? parsed : null
  }
  return null
}

function clamp(value: number): number {
  return Math.max(0, Math.min(1, value))
}

function popularityScore(record: Record<string, unknown>): number {
  const direct = numeric(
    record.search_popularity ??
      record.searchPopularity ??
      record.popularity_score ??
      record.popularityScore ??
      record.traffic_score ??
      record.trafficScore,
  )
  if (direct !== null) return direct > 1 ? clamp(Math.log10(direct + 1) / 5) : clamp(direct)

  const impressions = numeric(record.impressions ?? record.search_impressions ?? record.searchImpressions) ?? 0
  const clicks = numeric(record.clicks ?? record.organic_clicks ?? record.organicClicks) ?? 0
  const pageviews = numeric(record.pageviews ?? record.page_views ?? record.pageViews) ?? 0
  const composite = impressions * 0.02 + clicks * 2 + pageviews
  return composite > 0 ? clamp(Math.log10(composite + 1) / 5) : 0
}

function evidenceCompleteness(record: Record<string, unknown>, evidenceScore: number): number {
  const explicit = numeric(
    record.evidence_completeness_score ??
      record.evidenceCompletenessScore ??
      record.completeness_score ??
      record.completenessScore,
  )
  if (explicit !== null) return explicit > 1 ? clamp(explicit / 100) : clamp(explicit)

  const citations = cleanList(record.citations, record.references, record.sources, record.studies).length
  const humanStudies = numeric(record.human_study_count ?? record.humanStudyCount ?? record.human_trials ?? record.humanTrials) ?? 0
  const sourceSignal = citations > 0 ? Math.min(0.35, citations * 0.05) : 0
  const humanSignal = humanStudies > 0 ? Math.min(0.25, humanStudies * 0.05) : 0
  return clamp(evidenceScore * 0.4 + sourceSignal + humanSignal)
}

export function getSearchIntent(query: string): SearchIntent {
  const value = query.toLowerCase()
  if (/safe|safety|risk|avoid|interaction|contraindication|warning|pregnancy|side effect/.test(value)) return 'safety'
  if (/evidence|study|studies|clinical|human|trial|meta|systematic|research/.test(value)) return 'evidence'
  if (/mechanism|pathway|receptor|target|how does|works|action|bioavailability/.test(value)) return 'mechanism'
  if (/compare|comparison|versus|\bvs\.?\b|alternative|similar/.test(value)) return 'comparison'
  return 'general'
}

export function weightedSearchScore(item: ResearchSearchItem, relevanceScore: number, intent: SearchIntent): number {
  if (intent === 'evidence') {
    return relevanceScore * 0.55 + item.evidenceCompleteness * 0.2 + item.evidenceScore * 0.15 + item.popularityScore * 0.1
  }
  if (intent === 'safety') {
    return relevanceScore * 0.6 + (1 - item.safetyPenalty) * 0.18 + item.evidenceCompleteness * 0.12 + item.popularityScore * 0.1
  }
  if (intent === 'mechanism') {
    return relevanceScore * 0.6 + item.mechanismScore * 0.2 + item.evidenceCompleteness * 0.12 + item.popularityScore * 0.08
  }
  if (intent === 'comparison') {
    return relevanceScore * 0.56 + item.evidenceCompleteness * 0.16 + item.popularityScore * 0.14 + item.authorityScore * 0.14
  }
  return relevanceScore * 0.62 + item.evidenceCompleteness * 0.16 + item.popularityScore * 0.14 + item.authorityScore * 0.08
}

export function normalizeResearchSearchItem(
  record: Record<string, unknown>,
  type: ResearchSearchType,
): ResearchSearchItem | null {
  const rawSlug = text(record.slug || record.id)
  if (!rawSlug) return null
  const slug = rawSlug.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const name = formatDisplayLabel(record.displayName) || formatDisplayLabel(record.name) || formatDisplayLabel(record.slug)
  if (!name || !isClean(name)) return null

  const summary = cleanSummary(
    record.short_earthy_summary || record.shortEarthySummary || record.summaryShort || record.summary || record.coreInsight || record.hero || record.description,
    type === 'Herb' ? 'herb' : 'compound',
  )
  const aliases = cleanList(record.aliases, record.common_names, record.commonNames, record.synonyms, record.alternate_names, record.alternateNames)
    .filter((value) => value.toLowerCase() !== name.toLowerCase())
  const scientificNames = cleanList(
    record.scientific_name,
    record.scientificName,
    record.latin_name,
    record.latinName,
    record.botanical_name,
    record.botanicalName,
    record.species,
  )
  const extractNames = cleanList(
    record.extract_names,
    record.extractNames,
    record.standardized_extracts,
    record.standardizedExtracts,
    record.branded_extracts,
    record.brandedExtracts,
    record.brand_names,
    record.brandNames,
    record.trademarked_extracts,
    record.trademarkedExtracts,
  )
  const outcomes = cleanList(
    record.clinically_supported_outcomes,
    record.clinicallySupportedOutcomes,
    record.primary_effects,
    record.primaryEffects,
    record.best_for,
    record.bestFor,
    record.outcomes,
    record.effects,
  ).slice(0, 8)
  const conditions = cleanList(
    record.conditions,
    record.studied_conditions,
    record.studiedConditions,
    record.indications,
    record.goals,
    record.health_goals,
    record.healthGoals,
  ).slice(0, 10)
  const mechanisms = cleanList(
    record.mechanisms,
    record.pathways,
    record.targets,
    record.receptors,
    record.primaryActions,
    record.primary_actions,
  ).slice(0, 10)

  const safetyRecord = record.safety && typeof record.safety === 'object' ? record.safety as Record<string, unknown> : {}
  const evidence = normalizeDecisionEvidence(
    record.evidence_tier || record.evidenceTier || safetyRecord.evidenceTier || record.evidence_grade || record.evidenceLevel || record.confidence || record.summary_quality,
    'Needs review',
  )
  const safety = normalizeDecisionSafety(
    record.safety_level || record.safetyLevel || safetyRecord.confidence || record.safetyNotes || record.confidenceTier || record.profile_status,
    { hasSafetyNotes: Boolean(record.safetyNotes || record.safety_notes || record.safety) },
  )
  const quality = labelize(record.profile_status || record.summary_quality || record.review_status || record.status || record.confidence, 'Profile Review')
  const orchestration = getSemanticOrchestrationSignals(record)
  const popularity = popularityScore(record)
  const completeness = evidenceCompleteness(record, orchestration.evidenceScore)

  return {
    slug,
    name,
    type,
    href: type === 'Herb' ? `/herbs/${slug}/` : `/compounds/${slug}/`,
    summary,
    aliases,
    scientificNames,
    extractNames,
    outcomes,
    conditions,
    mechanisms,
    evidence,
    safety,
    quality,
    authorityScore: orchestration.authorityScore,
    discoveryScore: orchestration.discoveryScore,
    popularityScore: popularity,
    evidenceCompleteness: completeness,
    evidenceScore: orchestration.evidenceScore,
    mechanismScore: orchestration.mechanismDensity,
    ecosystemScore: orchestration.ecosystemDensity,
    safetyPenalty: orchestration.safetyPenalty,
    uncertaintyPenalty: orchestration.uncertaintyPenalty,
    translationalPenalty: orchestration.translationalPenalty,
    typicalDosage: text(record.typical_dosage || record.typicalDosage || record.preparation || record.dosage),
    avoidIf: cleanList(record.avoid_if, record.avoidIf, record.contraindications, record.interactions, record.safetyNotes, record.safety),
    sideEffects: cleanList(record.side_effects, record.sideEffects, record.safetyNotes),
    contraindications: cleanList(record.contraindications, record.avoid_if, record.avoidIf),
    interactions: cleanList(record.interactions),
    searchText: [
      name,
      slug,
      aliases.join(' '),
      scientificNames.join(' '),
      extractNames.join(' '),
      summary,
      outcomes.join(' '),
      conditions.join(' '),
      mechanisms.join(' '),
      evidence,
      safety,
      quality,
    ].join(' '),
  }
}

export function getCanonicalMatchNote(item: ResearchSearchItem, query: string): string | null {
  const normalized = query.trim().toLowerCase()
  if (!normalized || item.name.toLowerCase().includes(normalized)) return null

  const alias = [...item.aliases, ...item.scientificNames, ...item.extractNames]
    .find((value) => value.toLowerCase().includes(normalized) || normalized.includes(value.toLowerCase()))
  return alias ? `Canonical profile for “${alias}”` : null
}

function browserRead<T>(key: string, fallback: T): T {
  if (typeof window === 'undefined') return fallback
  try {
    const raw = window.localStorage.getItem(key)
    return raw ? JSON.parse(raw) as T : fallback
  } catch {
    return fallback
  }
}

function browserWrite(key: string, value: unknown): void {
  if (typeof window === 'undefined') return
  try {
    window.localStorage.setItem(key, JSON.stringify(value))
  } catch {
    // Local convenience state must never block research.
  }
}

export function getRecentlyViewedResearch(): RecentResearchItem[] {
  return browserRead<RecentResearchItem[]>(RECENT_KEY, []).slice(0, MAX_RECENT)
}

export function recordRecentlyViewedResearch(item: ResearchSearchItem): RecentResearchItem[] {
  const next: RecentResearchItem[] = [
    { slug: item.slug, name: item.name, type: item.type, href: item.href, viewedAt: new Date().toISOString() },
    ...getRecentlyViewedResearch().filter((entry) => !(entry.slug === item.slug && entry.type === item.type)),
  ].slice(0, MAX_RECENT)
  browserWrite(RECENT_KEY, next)
  return next
}

export function getFailedSearchBacklog(): FailedSearchEntry[] {
  return browserRead<FailedSearchEntry[]>(FAILED_KEY, []).slice(0, MAX_FAILURES)
}

export function recordFailedSearch(query: string): FailedSearchEntry[] {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ').slice(0, 80)
  if (normalized.length < 2) return getFailedSearchBacklog()
  const current = getFailedSearchBacklog()
  const existing = current.find((entry) => entry.query === normalized)
  const nextEntry: FailedSearchEntry = {
    query: normalized,
    count: (existing?.count ?? 0) + 1,
    lastSeenAt: new Date().toISOString(),
  }
  const next = [nextEntry, ...current.filter((entry) => entry.query !== normalized)]
    .sort((a, b) => b.count - a.count || b.lastSeenAt.localeCompare(a.lastSeenAt))
    .slice(0, MAX_FAILURES)
  browserWrite(FAILED_KEY, next)
  return next
}

export function getComparisonSelection(): string[] {
  return browserRead<string[]>(COMPARE_KEY, []).filter(Boolean).slice(0, 2)
}

export function setComparisonSelection(keys: string[]): string[] {
  const next = Array.from(new Set(keys.filter(Boolean))).slice(0, 2)
  browserWrite(COMPARE_KEY, next)
  return next
}

export function comparisonKey(item: Pick<ResearchSearchItem, 'type' | 'slug'>): string {
  return `${item.type.toLowerCase()}:${item.slug}`
}

export function parseComparisonKey(value: string): { type: ResearchSearchType; slug: string } | null {
  const [rawType, slug] = value.split(':', 2)
  if (!slug || (rawType !== 'herb' && rawType !== 'compound')) return null
  return { type: rawType === 'herb' ? 'Herb' : 'Compound', slug }
}

export function buildOnDemandComparisonHref(keys: string[]): string {
  const [left = '', right = ''] = keys.slice(0, 2)
  const params = new URLSearchParams({ left, right })
  return `/compare/on-demand/?${params.toString()}`
}

const SENSITIVE_BACKLOG_PATTERN = /\b(my|i|me|diagnos|pregnan|suicid|self[- ]?harm|medication|prescription|symptom|pain|anxiety|depress|adhd|bipolar|cancer|diabetes|blood pressure|dose|dosage)\b/i

export function safeFailedSearchAnalyticsTerm(query: string): string | null {
  const normalized = query.trim().toLowerCase().replace(/\s+/g, ' ')
  if (normalized.length < 2 || normalized.length > 48) return null
  if (normalized.split(' ').length > 4) return null
  if (!/^[a-z][a-z0-9 .+'-]*$/i.test(normalized)) return null
  if (SENSITIVE_BACKLOG_PATTERN.test(normalized)) return null
  return normalized
}
