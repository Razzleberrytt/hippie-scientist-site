#!/usr/bin/env node

import { promises as fs } from 'node:fs'
import path from 'node:path'

const DEFAULT_DATA_DIR = path.join(process.cwd(), 'public', 'data')
const DATA_DIR = resolveOutDir(process.argv)
const OUT_DIR = path.join(DATA_DIR, 'runtime-maps')

const MAX_RELATED_PROFILES = 8
const MAX_COMPARISON_CANDIDATES = 6
const MAX_STACK_CANDIDATES = 6
const MAX_RELATED_CANDIDATE_POOL = 40
const MAX_GRAPH_CANDIDATE_POOL = 32
const MAX_SIGNALS_PER_RECORD = 24
const MAX_SIGNAL_INDEX_ROWS = 80
const MAX_OVERLAP_LABELS = 5
const MAX_RELATIONSHIP_KINDS = 4
const MAX_CONDITION_LINKS = 5
const MAX_CONDITION_ENTITY_LINKS = 8
const MAX_COMPARISON_RECOMMENDATIONS = 6

const CONDITION_TOPICS = [
  {
    slug: 'sleep',
    label: 'Sleep',
    signals: ['sleep', 'insomnia', 'sedative', 'relaxation', 'gaba', 'melatonin', 'circadian', 'rest'],
  },
  {
    slug: 'stress',
    label: 'Stress',
    signals: ['stress', 'adaptogen', 'cortisol', 'resilience', 'burnout', 'relaxation'],
  },
  {
    slug: 'anxiety',
    label: 'Anxiety',
    signals: ['anxiety', 'anxiolytic', 'calm', 'gaba', 'serotonin', 'nervous tension', 'relaxation'],
  },
  {
    slug: 'focus',
    label: 'Focus',
    signals: ['focus', 'attention', 'cognition', 'nootropic', 'alertness', 'dopamine', 'cholinergic'],
  },
  {
    slug: 'cognition',
    label: 'Cognition',
    signals: ['cognition', 'memory', 'learning', 'neuroplasticity', 'cholinergic', 'brain', 'bdnf'],
  },
  {
    slug: 'energy',
    label: 'Energy',
    signals: ['energy', 'fatigue', 'stamina', 'mitochondrial', 'atp', 'alertness', 'performance'],
  },
  {
    slug: 'inflammation',
    label: 'Inflammation',
    signals: ['inflammation', 'anti-inflammatory', 'nf-kb', 'cox', 'lox', 'immune modulation'],
  },
  {
    slug: 'pain',
    label: 'Pain',
    signals: ['pain', 'analgesic', 'joint', 'inflammation', 'mobility', 'soreness'],
  },
  {
    slug: 'gut-health',
    label: 'Gut health',
    signals: ['gut', 'digestive', 'microbiome', 'prebiotic', 'fiber', 'bloating', 'ibs'],
  },
  {
    slug: 'joint-support',
    label: 'Joint support',
    signals: ['joint', 'mobility', 'cartilage', 'osteoarthritis', 'inflammation', 'pain'],
  },
  {
    slug: 'blood-pressure',
    label: 'Blood pressure',
    signals: ['blood pressure', 'cardiovascular', 'nitric oxide', 'vascular', 'hypertension', 'circulation'],
  },
  {
    slug: 'fat-loss',
    label: 'Fat loss',
    signals: ['fat loss', 'weight', 'metabolic', 'thermogenic', 'glucose', 'appetite'],
  },
  {
    slug: 'recovery',
    label: 'Recovery',
    signals: ['recovery', 'soreness', 'exercise', 'performance', 'sleep', 'inflammation'],
  },
]

function resolveOutDir(argv) {
  const flag = argv.find((arg) => arg.startsWith('--data-dir=')) || argv.find((arg) => arg.startsWith('--out='))
  if (!flag) return DEFAULT_DATA_DIR
  const value = flag.split('=').slice(1).join('=').trim()
  return value ? path.resolve(process.cwd(), value) : DEFAULT_DATA_DIR
}

async function readJson(fileName, fallback) {
  try {
    const raw = await fs.readFile(path.join(DATA_DIR, fileName), 'utf8')
    return JSON.parse(raw)
  } catch {
    return fallback
  }
}

async function readDetail(kind, slug) {
  if (!isSafeSlug(slug)) return undefined
  const detail = await readJson(`${kind}-detail/${slug}.json`, undefined)
  return detail && typeof detail === 'object' && !Array.isArray(detail) ? detail : undefined
}

function isSafeSlug(slug) {
  return typeof slug === 'string' && /^[a-z0-9][a-z0-9-]*$/.test(slug)
}

function text(value) {
  if (value == null) return ''
  return String(value).trim()
}

function lower(value) {
  return text(value).toLowerCase()
}

function slugify(value) {
  return lower(value)
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function safeSlug(value) {
  const raw = text(value)
  if (!raw) return ''
  const normalized = slugify(raw)
  return isSafeSlug(normalized) ? normalized : ''
}

function capList(values, limit) {
  const safeLimit = Math.max(0, Math.floor(Number(limit) || 0))
  return Array.isArray(values) ? values.slice(0, safeLimit) : []
}

function list(value) {
  if (value == null) return []
  if (Array.isArray(value)) return value.flatMap((item) => list(item))
  if (typeof value === 'string') {
    const trimmed = value.trim()
    if (!trimmed) return []
    if ((trimmed.startsWith('[') && trimmed.endsWith(']')) || (trimmed.startsWith('{') && trimmed.endsWith('}'))) {
      try {
        return list(JSON.parse(trimmed))
      } catch {
        // Fall through to delimiter splitting.
      }
    }
    return trimmed
      .split(/[,;|\n]/g)
      .map((item) => item.trim())
      .filter(Boolean)
  }
  if (typeof value === 'object') {
    const maybeSlug = value.slug || value.id || value.name || value.label || value.title
    return maybeSlug ? [maybeSlug] : []
  }
  return [value]
}

function unique(values, limit = Infinity) {
  const seen = new Set()
  const output = []
  for (const value of values) {
    const normalized = lower(value)
    if (!normalized || seen.has(normalized)) continue
    seen.add(normalized)
    output.push(normalized)
    if (output.length >= limit) break
  }
  return output
}

function normalizeSignals(values, limit = MAX_SIGNALS_PER_RECORD) {
  return unique(values.flatMap((value) => list(value)), limit)
}

function collectEcosystemSignals(record) {
  return normalizeSignals([
    record?.topic_clusters,
    record?.ecosystem_tags,
    record?.pathway_companions,
    record?.comparison_candidates,
    record?.synergy_relationships,
    record?.authority_supernode,
    record?.semantic_neighbors,
    record?.ecosystem_anchors,
    record?.related_topics,
    record?.pathway_ecosystems,
    record?.mechanism_ecosystems,
    record?.clusters,
    record?.compound_cluster,
    record?.comparison_group,
    record?.internal_link_cluster,
    record?.herb_internal_link_cluster,
    record?.pathway_bucket,
    record?.pathways_v2,
  ])
}

function collectMechanismSignals(record) {
  return normalizeSignals([
    record?.mechanism,
    record?.mechanisms,
    record?.mechanism_targets,
    record?.mechanismTags,
    record?.targets,
    record?.biologicalTargets,
    record?.mechanism_ecosystems,
  ])
}

function collectPathwaySignals(record) {
  return normalizeSignals([
    record?.pathways,
    record?.pathwayTargets,
    record?.pathways_v2,
    record?.pathway_bucket,
    record?.pathway_ecosystems,
    record?.pathway_companions,
  ])
}

function explicitRelatedSlugs(record) {
  return unique([
    record?.related_compounds,
    record?.related_herbs,
    record?.semantic_neighbors,
    record?.comparison_candidates,
    record?.synergy_relationships,
    record?.pathway_companions,
  ].flatMap((value) => list(value).map((item) => safeSlug(item))), MAX_GRAPH_CANDIDATE_POOL)
}

function candidateList(record, kind) {
  const values = kind === 'comparison'
    ? [record?.comparison_candidates, record?.semantic_neighbors, record?.related_compounds, record?.related_herbs]
    : [record?.synergy_relationships, record?.pathway_companions, record?.semantic_neighbors, record?.related_compounds, record?.related_herbs]

  return unique(values.flatMap((value) => list(value).map((item) => safeSlug(item))), MAX_GRAPH_CANDIDATE_POOL)
}

function getSignalBundle(record) {
  const ecosystem = collectEcosystemSignals(record)
  const mechanisms = collectMechanismSignals(record)
  const pathways = collectPathwaySignals(record)
  const all = normalizeSignals([
    record?.primary_effects,
    record?.primaryEffects,
    record?.effects,
    record?.secondary_effects,
    record?.mechanism,
    record?.mechanisms,
    record?.mechanism_targets,
    record?.pathways,
    record?.pathwayTargets,
    record?.mechanismTags,
    record?.topics,
    record?.topicTags,
    record?.targets,
    record?.biologicalTargets,
    record?.compoundClass,
    record?.compound_class,
    record?.class,
    record?.foundIn,
    record?.activeCompounds,
    record?.active_constituents,
    record?.traditionalUses,
    record?.traditional_uses,
    ecosystem,
    mechanisms,
    pathways,
  ], MAX_SIGNALS_PER_RECORD)

  return {
    ecosystem,
    mechanisms,
    pathways,
    all,
    explicitSlugs: explicitRelatedSlugs(record),
  }
}

function addIndexed(index, signal, record) {
  if (!signal) return
  const rows = index.get(signal)
  if (rows) {
    if (rows.length < MAX_SIGNAL_INDEX_ROWS) rows.push(record)
  } else {
    index.set(signal, [record])
  }
}

function buildIndex(records) {
  const index = {
    bySlug: new Map(),
    byEcosystemSignal: new Map(),
    byMechanismSignal: new Map(),
    byPathwaySignal: new Map(),
  }

  for (const record of records) {
    const slug = safeSlug(record?.slug)
    if (!slug) continue
    if (!index.bySlug.has(slug)) index.bySlug.set(slug, record)
    const signals = getSignalBundle(record)
    for (const signal of signals.ecosystem) addIndexed(index.byEcosystemSignal, signal, record)
    for (const signal of signals.mechanisms) addIndexed(index.byMechanismSignal, signal, record)
    for (const signal of signals.pathways) addIndexed(index.byPathwaySignal, signal, record)
  }

  return index
}

function addCandidate(candidates, seen, sourceSlug, candidate, max) {
  if (candidates.length >= max) return
  const slug = safeSlug(candidate?.slug)
  if (!candidate || !slug || slug === sourceSlug || seen.has(slug)) return
  seen.add(slug)
  candidates.push(candidate)
}

function addCandidatesForSignals(candidates, seen, sourceSlug, signalIndex, signals, max) {
  for (const signal of capList(signals, MAX_SIGNALS_PER_RECORD)) {
    const rows = signalIndex.get(signal)
    if (!rows) continue
    for (const row of capList(rows, MAX_SIGNAL_INDEX_ROWS)) {
      addCandidate(candidates, seen, sourceSlug, row, max)
      if (candidates.length >= max) return
    }
  }
}

function candidatePool(record, index, max) {
  const sourceSlug = safeSlug(record?.slug)
  if (!sourceSlug) return []

  const sourceSignals = getSignalBundle(record)
  const candidates = []
  const seen = new Set()

  for (const slug of sourceSignals.explicitSlugs) addCandidate(candidates, seen, sourceSlug, index.bySlug.get(slug), max)
  addCandidatesForSignals(candidates, seen, sourceSlug, index.byEcosystemSignal, sourceSignals.ecosystem, max)
  addCandidatesForSignals(candidates, seen, sourceSlug, index.byMechanismSignal, sourceSignals.mechanisms, max)
  addCandidatesForSignals(candidates, seen, sourceSlug, index.byPathwaySignal, sourceSignals.pathways, max)

  return candidates
}

function overlap(candidateSignals, sourceSignals) {
  const set = new Set(sourceSignals)
  return unique(candidateSignals.filter((signal) => set.has(signal)), MAX_OVERLAP_LABELS)
}

function discoveryScore(source, candidate) {
  const baseEffects = normalizeSignals([source?.primary_effects, source?.effects])
  const candidateEffects = normalizeSignals([candidate?.primary_effects, candidate?.effects])
  const baseMechanisms = normalizeSignals([source?.mechanisms, source?.mechanism])
  const candidateMechanisms = normalizeSignals([candidate?.mechanisms, candidate?.mechanism])
  const basePathways = normalizeSignals([source?.pathways, source?.pathways_v2])
  const candidatePathways = normalizeSignals([candidate?.pathways, candidate?.pathways_v2])

  let score = 0
  score += overlap(candidateEffects, baseEffects).length * 3
  score += overlap(candidateMechanisms, baseMechanisms).length * 4
  score += overlap(candidatePathways, basePathways).length * 2
  if (/strong|moderate|clinical|human/i.test(text(candidate?.evidence_tier || candidate?.evidenceTier || candidate?.evidence_grade))) score += 3
  if (/complete/i.test(text(candidate?.profile_status || candidate?.review_status))) score += 2
  return score
}

function conditionScore(record, condition) {
  const haystack = unique([
    getSignalBundle(record).all,
    record?.summary,
    record?.description,
    record?.best_for,
    record?.primary_uses,
    record?.traditional_uses,
    record?.traditionalUses,
  ].flatMap((value) => list(value)), 80).join(' ')

  if (!haystack) return 0

  let score = 0
  for (const signal of condition.signals) {
    const needle = lower(signal)
    if (!needle) continue
    if (haystack.includes(needle)) score += needle.includes(' ') ? 4 : 3
  }
  if (/strong|moderate|clinical|human/i.test(text(record?.evidence_tier || record?.evidenceTier || record?.evidence_grade))) score += 2
  if (/complete|ready|published/i.test(text(record?.profile_status || record?.review_status || record?.summary_quality))) score += 1
  return score
}

function relationshipEntry(source, candidate, preferredSlugs = []) {
  const candidateSlug = safeSlug(candidate?.slug)
  if (!candidateSlug) return null

  const sourceSignals = getSignalBundle(source)
  const candidateSignals = getSignalBundle(candidate)
  const ecosystemOverlap = overlap(candidateSignals.ecosystem, sourceSignals.ecosystem)
  const mechanismOverlap = overlap(candidateSignals.mechanisms, sourceSignals.mechanisms)
  const pathwayOverlap = overlap(candidateSignals.pathways, sourceSignals.pathways)
  const allOverlap = overlap(candidateSignals.all, sourceSignals.all)
  const explicit = sourceSignals.explicitSlugs.includes(candidateSlug) || preferredSlugs.includes(candidateSlug)

  if (!explicit && ecosystemOverlap.length === 0 && mechanismOverlap.length === 0 && pathwayOverlap.length === 0) return null

  const relationshipKinds = []
  if (explicit) relationshipKinds.push('workbook-explicit')
  if (ecosystemOverlap.length > 0) relationshipKinds.push('ecosystem')
  if (mechanismOverlap.length > 0) relationshipKinds.push('mechanism')
  if (pathwayOverlap.length > 0) relationshipKinds.push('pathway')

  const evidenceBoost = text(candidate?.evidence_grade || candidate?.evidence_tier || candidate?.evidence_level) ? 1 : 0
  const authorityBoost = text(candidate?.authority_status || candidate?.evidence_authority_status || candidate?.authority_supernode) ? 1 : 0
  const explicitBoost = explicit ? 8 : 0
  const score = allOverlap.length * 3 + ecosystemOverlap.length * 3 + mechanismOverlap.length * 4 + pathwayOverlap.length * 2 + explicitBoost + evidenceBoost + authorityBoost + discoveryScore(source, candidate)

  return {
    slug: candidateSlug,
    score,
    overlapLabels: allOverlap.slice(0, MAX_OVERLAP_LABELS),
    ecosystemOverlap: ecosystemOverlap.length,
    mechanismOverlap: mechanismOverlap.length,
    pathwayOverlap: pathwayOverlap.length,
    relationshipKinds: unique(relationshipKinds, MAX_RELATIONSHIP_KINDS),
  }
}

function sortEntries(a, b) {
  const scoreDelta = Number(b?.score || 0) - Number(a?.score || 0)
  if (scoreDelta !== 0) return scoreDelta
  return text(a?.slug).localeCompare(text(b?.slug))
}

function dedupeEntries(entries) {
  const bySlug = new Map()
  for (const entry of entries) {
    if (!entry?.slug) continue
    const existing = bySlug.get(entry.slug)
    if (!existing || Number(entry.score || 0) > Number(existing.score || 0)) bySlug.set(entry.slug, entry)
  }
  return [...bySlug.values()].sort(sortEntries)
}

function buildRelatedMap(records, index) {
  const output = {}
  for (const record of records) {
    const slug = safeSlug(record?.slug)
    if (!slug) continue
    const entries = candidatePool(record, index, MAX_RELATED_CANDIDATE_POOL)
      .map((candidate) => relationshipEntry(record, candidate))
      .filter(Boolean)
    output[slug] = dedupeEntries(entries).slice(0, MAX_RELATED_PROFILES)
  }
  return output
}

function buildCandidateMap(records, index, kind) {
  const cap = kind === 'comparison' ? MAX_COMPARISON_CANDIDATES : MAX_STACK_CANDIDATES
  const output = {}

  for (const record of records) {
    const slug = safeSlug(record?.slug)
    if (!slug) continue
    const preferred = candidateList(record, kind)
    const seen = new Set()
    const candidates = []

    for (const candidateSlug of preferred) addCandidate(candidates, seen, slug, index.bySlug.get(candidateSlug), MAX_GRAPH_CANDIDATE_POOL)
    for (const candidate of candidatePool(record, index, MAX_GRAPH_CANDIDATE_POOL)) addCandidate(candidates, seen, slug, candidate, MAX_GRAPH_CANDIDATE_POOL)

    output[slug] = dedupeEntries(
      candidates
        .map((candidate) => relationshipEntry(record, candidate, preferred))
        .filter(Boolean)
        .map((entry) => ({
          ...entry,
          relationshipKinds: unique([...entry.relationshipKinds, kind === 'comparison' ? 'comparison-candidate' : 'stack-candidate'], MAX_RELATIONSHIP_KINDS),
        }))
    ).slice(0, cap)
  }

  return output
}

function buildEcosystemMap(records, index) {
  const output = {}
  for (const record of records) {
    const slug = safeSlug(record?.slug)
    if (!slug) continue
    const signals = getSignalBundle(record)
    const candidates = []
    const seen = new Set()
    addCandidatesForSignals(candidates, seen, slug, index.byEcosystemSignal, signals.ecosystem, MAX_RELATED_CANDIDATE_POOL)
    output[slug] = dedupeEntries(candidates.map((candidate) => relationshipEntry(record, candidate)).filter(Boolean)).slice(0, MAX_RELATED_PROFILES)
  }
  return output
}

function buildAuthorityHubs(records) {
  const hubs = {}
  for (const record of records) {
    const slug = safeSlug(record?.slug)
    const hub = lower(record?.authority_supernode || record?.authority_status || record?.evidence_authority_status)
    if (!slug || !hub) continue
    if (!hubs[hub]) hubs[hub] = []
    if (hubs[hub].length >= MAX_RELATED_CANDIDATE_POOL) continue
    hubs[hub].push({ slug, score: discoveryScore(record, record), relationshipKinds: ['authority-hub'] })
  }

  for (const hub of Object.keys(hubs)) hubs[hub] = dedupeEntries(hubs[hub]).slice(0, MAX_RELATED_PROFILES)
  return hubs
}

function buildConditionMaps(records) {
  const conditionToHerbs = {}
  const entityToConditions = {}

  for (const condition of CONDITION_TOPICS) {
    const rows = records
      .filter((record) => record?.entityType === 'herb')
      .map((record) => ({
        slug: safeSlug(record?.slug),
        score: conditionScore(record, condition),
        label: condition.label,
        title: text(record?.name || record?.title || record?.slug),
      }))
      .filter((entry) => entry.slug && entry.score > 0)
      .sort(sortEntries)
      .slice(0, MAX_CONDITION_ENTITY_LINKS)
    conditionToHerbs[condition.slug] = rows
  }

  for (const record of records) {
    const slug = safeSlug(record?.slug)
    if (!slug) continue
    const rows = CONDITION_TOPICS
      .map((condition) => ({
        slug: condition.slug,
        href: `/goals/${condition.slug}`,
        label: condition.label,
        score: conditionScore(record, condition),
      }))
      .filter((entry) => entry.score > 0)
      .sort(sortEntries)
      .slice(0, MAX_CONDITION_LINKS)
    entityToConditions[slug] = rows
  }

  return { conditionToHerbs, entityToConditions }
}

function buildComparisonRecommendationMap(records, comparisonMap) {
  const output = {}
  const recordsBySlug = new Map(records.map((record) => [safeSlug(record?.slug), record]))

  for (const [sourceSlug, entries] of Object.entries(comparisonMap)) {
    const source = recordsBySlug.get(sourceSlug)
    if (!source) continue
    output[sourceSlug] = capList(entries, MAX_COMPARISON_RECOMMENDATIONS)
      .map((entry) => {
        const candidate = recordsBySlug.get(entry.slug)
        if (!candidate) return null
        return {
          href: `/compare/${sourceSlug}-vs-${entry.slug}`,
          sourceSlug,
          targetSlug: entry.slug,
          targetType: candidate.entityType || 'compound',
          title: `${text(source.name || source.slug)} vs ${text(candidate.name || candidate.slug)}`,
          score: entry.score || 0,
          overlapLabels: capList(entry.overlapLabels, MAX_OVERLAP_LABELS),
          relationshipKinds: capList(entry.relationshipKinds, MAX_RELATIONSHIP_KINDS),
        }
      })
      .filter(Boolean)
  }

  return output
}

async function mergeRows(kind, baseFile, summaryFile) {
  const baseRows = await readJson(baseFile, [])
  const summaryRows = await readJson(summaryFile, [])
  const summaryBySlug = new Map((Array.isArray(summaryRows) ? summaryRows : []).map((row) => [safeSlug(row?.slug), row]))
  const rows = []

  for (const row of Array.isArray(baseRows) ? baseRows : []) {
    const slug = safeSlug(row?.slug)
    if (!slug) continue
    const detail = await readDetail(kind, slug)
    rows.push({ ...row, ...(summaryBySlug.get(slug) || {}), ...(detail || {}), slug })
  }

  return rows
}

function stableClone(value) {
  if (Array.isArray(value)) {
    return value.map(stableClone)
  }

  if (value && typeof value === 'object') {
    return Object.keys(value)
      .sort((a, b) => a.localeCompare(b))
      .reduce((acc, key) => {
        acc[key] = stableClone(value[key])
        return acc
      }, {})
  }

  return value
}

async function writeJson(fileName, value) {
  await fs.mkdir(OUT_DIR, { recursive: true })
  await fs.writeFile(path.join(OUT_DIR, fileName), `${JSON.stringify(stableClone(value))}\n`, 'utf8')
}

const RESTRICTED_TERMS = [
  '5-meo-dmt',
  '5 meo dmt',
  '7-hydroxymitragynine',
  '7 hydroxymitragynine',
  '7-oh-mitragynine',
  '7 oh mitragynine',
  '7-oh',
  'amanita muscaria',
  'anabasine',
  'anatabine',
  'dmt',
  'fadogia',
  'fadogia agrestis',
  'hawaiian baby woodrose',
  'harmaline',
  'harmine',
  'ibogaine',
  'ketamine',
  'kratom',
  'lobeline',
  'lsa',
  'mescaline',
  'mitragynine',
  'morning glory',
  'nicotiana glauca',
  'nicotiana tabacum',
  'noopept',
  'psilocybin',
  'salvinorin',
  'sinicuichi',
  'tetrahydroharmine',
  'thc',
  'thcv',
  // harm-reduction / high-risk substances:
  'kava',
  'kavain',
  'dihydrokavain',
  'methysticin',
  'dihydromethysticin',
  'yangonin',
  'desmethoxyyangonin',
  'kavalactones',
]

const RESTRICTED_STATUS_PATTERNS = [
  /schedule\s*i\b/i,
  /schedule\s*1\b/i,
  /dea\s*watch\s*list/i,
  /dea\s*watchlist/i,
  /controlled\s*substance/i,
]

function isRestricted(record) {
  if (!record) return false
  if (record.doNotMonetize === true || record.do_not_monetize === true ||
      record.doNotPromote === true || record.do_not_promote === true) {
    return true
  }

  // Check governance fields
  const gov = record.governance || {}
  if (gov.monetizationAllowed === false || gov.recommendationAllowed === false) {
    return true
  }

  const governanceStatus = [
    record.governance_status,
    record.governanceStatus,
    record.legal_status,
    record.legalStatus,
    record.controlled_status,
    record.controlledStatus,
    record.controlled_schedule,
    record.controlledSchedule,
    record.schedule,
    record.dea_status,
    record.deaStatus,
    record.dea_watchlist_status,
    record.deaWatchlistStatus,
    record.regulatory_status,
    record.regulatoryStatus,
    record.safety_level,
  ].map(v => (v == null ? '' : String(v).trim())).join(' ')

  if (RESTRICTED_STATUS_PATTERNS.some((pattern) => pattern.test(governanceStatus))) return true

  // Standard normalize logic
  const normalize = (value) => {
    if (value == null) return ''
    return String(value)
      .toLowerCase()
      .replace(/[’']/g, '')
      .replace(/[^a-z0-9]+/g, ' ')
      .replace(/\s+/g, ' ')
      .trim()
  }

  const fieldsToCheck = [
    record.slug,
    record.name,
    record.displayName,
    record.compoundName,
    record.canonicalCompoundName,
    record.scientific_name,
    record.botanical_name,
    record.affiliate_query,
    record.affiliateQuery,
    record.amazon_affiliate_url,
    record.amazonAffiliateUrl,
    record.affiliate_url,
    record.affiliateUrl,
    record.product_url,
    record.summary,
    record.description,
    record.safety,
    record.active_constituents,
    record.compound_profile,
  ].map(normalize)

  return fieldsToCheck.some(field => {
    if (!field) return false
    return RESTRICTED_TERMS.some(term => {
      const normTerm = normalize(term)
      return field === normTerm || field.includes(normTerm)
    })
  })
}

async function main() {
  const [herbs, compounds] = await Promise.all([
    mergeRows('herbs', 'herbs.json', 'herbs-summary.json'),
    mergeRows('compounds', 'compounds.json', 'compounds-summary.json'),
  ])

  const records = [
    ...herbs.map((record) => ({ ...record, entityType: 'herb' })),
    ...compounds.map((record) => ({ ...record, entityType: 'compound' })),
  ]
    // Governance gate: records explicitly marked recommendationAllowed=false (restricted /
    // high-risk profiles) or classified as restricted/harm-reduction are excluded from every
    // recommendation/related map so they are neither recommended to other pages nor surfaced
    // as recommendation hubs themselves.
    .filter((record) => record?.governance?.recommendationAllowed !== false && !isRestricted(record))
  const index = buildIndex(records)
  const comparisonMap = buildCandidateMap(records, index, 'comparison')
  const conditionMaps = buildConditionMaps(records)

  await Promise.all([
    writeJson('related-profiles.json', buildRelatedMap(records, index)),
    writeJson('comparison-map.json', comparisonMap),
    writeJson('comparison-recommendations.json', buildComparisonRecommendationMap(records, comparisonMap)),
    writeJson('condition-to-herbs.json', conditionMaps.conditionToHerbs),
    writeJson('entity-to-conditions.json', conditionMaps.entityToConditions),
    writeJson('stack-map.json', buildCandidateMap(records, index, 'stack')),
    writeJson('ecosystem-map.json', buildEcosystemMap(records, index)),
    writeJson('authority-hubs.json', buildAuthorityHubs(records)),
  ])

  console.log(`Built related runtime maps for ${records.length} records in ${path.relative(process.cwd(), OUT_DIR)}`)
}

main().catch((error) => {
  console.error(error)
  process.exitCode = 1
})
