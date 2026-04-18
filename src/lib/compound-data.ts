import { useEffect, useState } from 'react'
import { slugify } from '@/lib/slug'
import { calculateCompoundConfidence, type ConfidenceLevel } from '@/utils/calculateConfidence'
import { cleanText, splitClean } from '@/lib/sanitize'
import { getCompoundSeedInteractionData, mergeInteractionData } from '@/lib/interactionSeed'
import { hasInvalidEntityName, sanitizeCompoundRecord } from '@/utils/sanitizeData'
import { normalizeResearchEnrichment } from '@/lib/researchEnrichment'
import type { PublishSafeEnrichmentSummary } from '@/types/enrichmentDiscovery'
import type { ResearchEnrichment } from '@/types/researchEnrichment'
import { getCuratedData, type CuratedData } from '@/lib/semanticCompression'

export type SourceRef = { title: string; url: string; note?: string }

export type CompoundRecord = {
  id: string
  slug: string
  name: string
  description: string
  className: string
  category: string
  compoundClass: string
  intensity: string
  mechanisms: string[]
  targets: string[]
  pathways: string[]
  mechanism: string
  activeCompounds: string[]
  effects: string[]
  therapeuticUses: string[]
  contraindications: string[]
  interactions: string[]
  dosage: string
  duration: string
  region: string
  preparation: string
  legalStatus: string
  sideEffects: string[]
  interactionTags?: string[]
  interactionNotes?: string[]
  foundIn: string[]
  herbs: string[]
  sources: SourceRef[]
  lastUpdated: string
  confidence: ConfidenceLevel
  identity: string
  categoryUseContext: string
  evidenceLevel: string
  relatedEntities: string[]
  relatedCompounds: string[]
  linkedHerbs: string[]
  researchEnrichment?: ResearchEnrichment
  researchEnrichmentSummary?: PublishSafeEnrichmentSummary
  sourceCount?: number
  compounds?: string[]
  benefits?: string[]
  curatedData: CuratedData
  rawData?: Record<string, unknown>
}

export type CompoundSummaryRecord = {
  id: string
  slug: string
  name: string
  summaryShort: string
  description: string
  className: string
  category: string
  compoundClass: string
  mechanisms: string[]
  targets: string[]
  pathways: string[]
  mechanism: string
  effects: string[]
  primaryEffects: string[]
  foundIn: string[]
  herbs: string[]
  confidence: ConfidenceLevel
  hasInteractionData: boolean
  hasEvidenceNotes: boolean
  aliases: string[]
  sourceCount?: number
  researchEnrichmentSummary?: PublishSafeEnrichmentSummary
  curatedData: CuratedData
  rawData?: Record<string, unknown>
}

function normalizeEnrichmentSummary(value: unknown): PublishSafeEnrichmentSummary | undefined {
  if (!value || typeof value !== 'object') return undefined
  const summary = value as Record<string, unknown>
  const evidenceLabel = String(summary.evidenceLabel || '').trim()
  const evidenceLabelTitle = String(summary.evidenceLabelTitle || '').trim()
  const lastReviewedAt = String(summary.lastReviewedAt || '').trim()
  if (!evidenceLabel || !evidenceLabelTitle || !lastReviewedAt) return undefined

  return {
    evidenceLabel: evidenceLabel as PublishSafeEnrichmentSummary['evidenceLabel'],
    evidenceLabelTitle,
    hasHumanEvidence: Boolean(summary.hasHumanEvidence),
    safetyCautionsPresent: Boolean(summary.safetyCautionsPresent),
    supportedUseCoveragePresent: Boolean(summary.supportedUseCoveragePresent),
    mechanismOrConstituentCoveragePresent: Boolean(summary.mechanismOrConstituentCoveragePresent),
    traditionalUseOnly: Boolean(summary.traditionalUseOnly),
    conflictingEvidence: Boolean(summary.conflictingEvidence),
    enrichedAndReviewed: Boolean(summary.enrichedAndReviewed),
    lastReviewedAt,
  }
}

let compoundsSummaryPromise: Promise<CompoundSummaryRecord[]> | null = null
let canonicalCompoundsSummaryPromise: Promise<CompoundSummaryRecord[]> | null = null
const compoundDetailPromiseBySlug = new Map<string, Promise<CompoundRecord | null>>()

function normalizeSlugCandidate(value: string): string {
  return value
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/\band\b/g, '')
    .replace(/[^a-z0-9]+/g, '')
}

function loadCanonicalCompoundSummaryRows(): Promise<CompoundSummaryRecord[]> {
  if (!canonicalCompoundsSummaryPromise) {
    canonicalCompoundsSummaryPromise = fetch('/data/compounds-summary.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/compounds-summary.json')
        return response.json()
      })
      .then(payload => {
        const rows = Array.isArray(payload) ? payload : []
        return rows.map(row => normalizeCompoundSummary(row as Record<string, unknown>))
      })
      .catch(error => {
        canonicalCompoundsSummaryPromise = null
        throw error
      })
  }

  return canonicalCompoundsSummaryPromise
}

async function resolveCanonicalCompoundDetailSlug(slug: string): Promise<string | null> {
  const needle = normalizeSlugCandidate(slug)
  if (!needle) return null

  const summaries = await loadCanonicalCompoundSummaryRows()
  const match = summaries.find(item => {
    const candidates = [item.slug, item.id, item.name, ...item.aliases]
    return candidates.some(candidate => normalizeSlugCandidate(candidate) === needle)
  })

  return match?.slug || null
}

function normalizeSources(value: unknown): SourceRef[] {
  if (!Array.isArray(value)) return []
  return value
    .map(source => {
      if (typeof source === 'string') {
        const t = source.trim()
        return t ? { title: t, url: t } : null
      }
      if (!source || typeof source !== 'object') return null
      const ref = source as Record<string, unknown>
      const title = String(ref.title || ref.url || '').trim()
      const url = String(ref.url || '').trim()
      if (!title && !url) return null
      const note = String(ref.note || '').trim()
      return { title: title || url, url: url || title, note: note || undefined }
    })
    .filter((item): item is SourceRef => Boolean(item))
}

function readContextRecord(data: Record<string, unknown>): Record<string, unknown> {
  const context = data.context
  if (typeof context === 'string') {
    const trimmed = context.trim()
    if (!trimmed) return {}
    try {
      const parsed = JSON.parse(trimmed)
      return parsed && typeof parsed === 'object' && !Array.isArray(parsed)
        ? (parsed as Record<string, unknown>)
        : {}
    } catch {
      return {}
    }
  }
  return context && typeof context === 'object' ? (context as Record<string, unknown>) : {}
}

function readSafetyRecord(data: Record<string, unknown>): Record<string, unknown> {
  const safety = data.safety
  return safety && typeof safety === 'object' ? (safety as Record<string, unknown>) : {}
}

function normalizeCompound(raw: Record<string, unknown>): CompoundRecord {
  const { data } = sanitizeCompoundRecord(raw, { debug: import.meta.env.DEV })
  const context = readContextRecord(data)
  const safetyRecord = readSafetyRecord(data)
  const name = cleanText(data.name ?? data.commonName ?? data.id) || ''
  const slug = String(data.slug || slugify(name))
  const primaryActions = splitClean(data.primaryActions ?? data.effects ?? data.actions ?? data.benefits ?? data.keyEffects)
  const foundIn = splitClean(
    data.associatedHerbs ?? data.foundInHerbs ?? data.herbs ?? data.foundIn ?? context.foundIn,
  )
  const mechanisms = splitClean(data.mechanisms ?? data.mechanism ?? data.mechanismOfAction)
  const targets = splitClean(data.targets ?? data.mechanismTargets)
  const pathways = splitClean(data.pathways ?? data.pathwayTargets)
  const mechanism = cleanText(data.mechanism ?? mechanisms.join('; ') ?? data.mechanismOfAction) || ''
  const researchEnrichment = normalizeResearchEnrichment(data.researchEnrichment)
  const rawInteractionTags = splitClean(data.interactionTags)
  const rawInteractionNotes = splitClean(data.interactionNotes)
  const seededInteraction = getCompoundSeedInteractionData(data)
  const mergedInteraction = mergeInteractionData({
    rawTags: rawInteractionTags,
    rawNotes: rawInteractionNotes,
    seed: seededInteraction,
  })
  const identity = cleanText(data.identity) || ''
  const categoryUseContext = cleanText(data.categoryUseContext ?? data.category_use_context) || ''
  const evidenceLevel =
    cleanText(data.evidenceLevel ?? data.evidence_level ?? safetyRecord.evidence ?? safetyRecord.confidence) ||
    ''
  const relatedEntities = splitClean(data.relatedEntities ?? context.foundIn)
  const relatedCompounds = splitClean(data.relatedCompounds ?? context.relatedCompounds)
  const linkedHerbs = splitClean(data.linkedHerbs)
  const compounds = splitClean(data.compounds ?? data.relatedCompounds)
  const benefits = splitClean(data.benefits ?? data.effects)
  const sources = normalizeSources(data.sources)

  return {
    id: String(data.id || slug),
    slug,
    name,
    description:
      cleanText(data.description ?? data.summary ?? data.hero ?? data.intro ?? data.coreInsight) || '',
    className: cleanText(data.class ?? data.type ?? data.className ?? data.compoundClass) || '',
    category: cleanText(data.category ?? data.class ?? data.type ?? data.className ?? data.compoundClass) || '',
    compoundClass: cleanText(data.compoundClass ?? data.class ?? data.className ?? data.type) || '',
    mechanisms,
    targets,
    pathways,
    intensity: cleanText(data.intensity) || '',
    mechanism,
    activeCompounds: splitClean(data.activeCompounds),
    effects: primaryActions,
    benefits,
    therapeuticUses: splitClean(data.therapeuticUses),
    contraindications: splitClean(data.contraindications),
    interactions: splitClean(data.interactions),
    interactionTags: mergedInteraction.interactionTags,
    interactionNotes: mergedInteraction.interactionNotes,
    dosage: cleanText(data.dosage) || '',
    duration: cleanText(data.duration) || '',
    region: cleanText(data.region) || '',
    preparation: cleanText(data.preparation) || '',
    legalStatus: cleanText(data.legalStatus) || '',
    sideEffects: splitClean(data.sideEffects),
    foundIn,
    herbs: foundIn,
    identity,
    categoryUseContext,
    evidenceLevel,
    relatedEntities,
    relatedCompounds,
    compounds,
    linkedHerbs,
    confidence: calculateCompoundConfidence({ mechanism, effects: primaryActions, compounds: foundIn }),
    sources,
    researchEnrichment: researchEnrichment || undefined,
    researchEnrichmentSummary: normalizeEnrichmentSummary(data.researchEnrichmentSummary),
    sourceCount: sources.length,
    lastUpdated: String(data.lastUpdated || data.updatedAt || '').trim(),
    curatedData: getCuratedData({
      name,
      summary:
        cleanText(data.summary ?? data.description ?? data.hero ?? data.intro ?? data.coreInsight) || '',
      description:
        cleanText(data.description ?? data.summary ?? data.hero ?? data.intro ?? data.coreInsight) || '',
      whyItMatters: cleanText(data.whyItMatters ?? data.coreInsight ?? data.overview) || '',
      primaryEffects: splitClean(data.primary_effects ?? data.primaryEffects ?? data.keyEffects ?? primaryActions),
      effects: primaryActions,
      contraindications: splitClean(data.contraindications),
      interactions: splitClean(data.interactions),
      sideEffects: splitClean(data.sideEffects),
      safety: splitClean(data.safety ?? safetyRecord.caution ?? safetyRecord.notes ?? safetyRecord.summary),
      mechanism,
    }),
    rawData: data as Record<string, unknown>,
  }
}

function normalizeCompoundSummary(raw: Record<string, unknown>): CompoundSummaryRecord {
  const context = readContextRecord(raw)
  const effects = splitClean(raw.primaryActions ?? raw.effects ?? raw.actions ?? raw.benefits ?? raw.keyEffects)
  const foundIn = splitClean(raw.foundIn ?? raw.herbs ?? context.foundIn)
  const mechanisms = splitClean(raw.mechanisms ?? raw.mechanism ?? raw.mechanismOfAction)
  const targets = splitClean(raw.targets ?? raw.mechanismTargets)
  const pathways = splitClean(raw.pathways ?? raw.pathwayTargets)
  const confidence = String(raw.confidence || '')
    .trim()
    .toLowerCase()

  return {
    id: String(raw.id || raw.slug || ''),
    slug: String(raw.slug || '')
      .trim()
      .toLowerCase(),
    name: cleanText(raw.name) || '',
    summaryShort: cleanText(raw.summaryShort ?? raw.description ?? raw.summary ?? raw.hero ?? raw.coreInsight) || '',
    description: cleanText(raw.description ?? raw.summaryShort ?? raw.summary ?? raw.hero ?? raw.coreInsight) || '',
    className: cleanText(raw.className ?? raw.compoundClass) || '',
    category: cleanText(raw.category ?? raw.className ?? raw.compoundClass) || '',
    compoundClass: cleanText(raw.compoundClass ?? raw.className ?? raw.category) || '',
    mechanisms,
    targets,
    pathways,
    mechanism: cleanText(raw.mechanism ?? mechanisms.join('; ')) || '',
    effects,
    primaryEffects: splitClean(raw.primary_effects ?? raw.primaryEffects ?? raw.keyEffects ?? effects).slice(0, 4),
    foundIn,
    herbs: foundIn,
    confidence: confidence === 'high' || confidence === 'medium' ? confidence : 'low',
    hasInteractionData: Boolean(raw.hasInteractionData),
    hasEvidenceNotes: Boolean(raw.hasEvidenceNotes),
    aliases: splitClean(raw.aliases),
    sourceCount: Number.isFinite(Number(raw.sourceCount)) ? Number(raw.sourceCount) : undefined,
    researchEnrichmentSummary: normalizeEnrichmentSummary(raw.researchEnrichmentSummary),
    curatedData: getCuratedData(raw),
    rawData: raw,
  }
}

export function isRenderableCompound(raw: Record<string, unknown>): boolean {
  const { data } = sanitizeCompoundRecord(raw)
  return !hasInvalidEntityName(data)
}

export async function loadCompoundSummaryData(): Promise<CompoundSummaryRecord[]> {
  if (!compoundsSummaryPromise) {
    compoundsSummaryPromise = fetch('/data/compounds-summary.json', { cache: 'no-store' })
      .then(response => {
        if (!response.ok) throw new Error('Failed to load /data/compounds-summary.json')
        return response.json()
      })
      .then(payload => {
        const rows = Array.isArray(payload) ? payload : []
        return rows.map(row => normalizeCompoundSummary(row as Record<string, unknown>)).filter(row => Boolean(row.slug))
      })
      .catch(error => {
        compoundsSummaryPromise = null
        throw error
      })
  }

  return compoundsSummaryPromise
}

export async function loadCompoundDetailBySlug(slug: string): Promise<CompoundRecord | null> {
  const slugKey = slug.trim().toLowerCase()
  if (!slugKey) return null

  const cached = compoundDetailPromiseBySlug.get(slugKey)
  if (cached) return cached

  const request = resolveCanonicalCompoundDetailSlug(slugKey)
    .then(async resolvedCanonicalSlug => {
      if (!resolvedCanonicalSlug) return null
      const canonicalResponse = await fetch(
        `/data/compounds-detail/${encodeURIComponent(resolvedCanonicalSlug)}.json`,
        { cache: 'no-store' },
      )
      if (canonicalResponse.ok) {
        return canonicalResponse.json()
      }
      if (canonicalResponse.status === 404) return null
      throw new Error(`Failed to load /data/compounds-detail/${resolvedCanonicalSlug}.json`)
    })
    .then(payload => {
      if (!payload || typeof payload !== 'object') return null
      return normalizeCompound(payload as Record<string, unknown>)
    })
    .catch(error => {
      compoundDetailPromiseBySlug.delete(slugKey)
      throw error
    })

  compoundDetailPromiseBySlug.set(slugKey, request)
  return request
}

export function useCompoundData() {
  const { compounds } = useCompoundDataState()
  return compounds
}

export function useCompoundDataState() {
  const [compounds, setCompounds] = useState<CompoundSummaryRecord[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)

    loadCompoundSummaryData()
      .then(items => {
        if (!alive) return
        setCompounds(items)
        setIsLoading(false)
      })
      .catch(cause => {
        if (!alive) return
        setCompounds([])
        setError(cause instanceof Error ? cause : new Error('Failed to load compound summary data'))
        setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [])

  return { compounds, isLoading, error }
}

export function useCompoundDetailState(slug: string) {
  const [compound, setCompound] = useState<CompoundRecord | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<Error | null>(null)

  useEffect(() => {
    let alive = true
    setIsLoading(true)
    setError(null)

    loadCompoundDetailBySlug(slug)
      .then(item => {
        if (!alive) return
        setCompound(item)
        setIsLoading(false)
      })
      .catch(cause => {
        if (!alive) return
        setCompound(null)
        setError(cause instanceof Error ? cause : new Error('Failed to load compound detail'))
        setIsLoading(false)
      })

    return () => {
      alive = false
    }
  }, [slug])

  return { compound, isLoading, error }
}
