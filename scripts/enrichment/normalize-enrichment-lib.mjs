#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export const NORMALIZED_ENTRY_SCHEMA_PATH = path.join(ROOT, 'schemas', 'normalized-enrichment-entry.schema.json')
export const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
export const INPUT_PATH_DEFAULT = path.join(ROOT, 'public', 'data', 'enrichment-normalized.jsonl')
export const SUMMARY_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-normalization-summary.json')

export const TOPIC_TO_ROLLUP_FIELD = {
  supported_use: 'supportedUses',
  unsupported_or_unclear_use: 'unsupportedOrUnclearUses',
  mechanism: 'mechanisms',
  constituent: 'constituents',
  interaction: 'interactions',
  contraindication: 'contraindications',
  adverse_effect: 'adverseEffects',
  dosage_context: 'dosageContextNotes',
  population_specific_note: 'populationSpecificNotes',
  conflict_note: 'conflictNotes',
  research_gap: 'researchGaps',
}

const NON_EMPTY_FIELDS = [
  'populationContext',
  'usageContext',
  'safetyContext',
  'mechanismContext',
  'traditionalUseContext',
  'uncertaintyNote',
]

const VAGUE_FINDING_PATTERNS = new Set([
  'needs more research',
  'more research is needed',
  'promising results',
  'works well',
  'appears beneficial',
  'likely helps',
])

const EVIDENCE_TIER_SCORE = {
  'human-clinical': 4,
  'human-observational': 3,
  'regulatory-monograph': 2,
  'preclinical-mechanistic': 1,
  'traditional-use': 1,
}

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

export function parseNormalizedInput(filePath = INPUT_PATH_DEFAULT) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Input file not found: ${path.relative(ROOT, filePath)}`)
  }

  const raw = fs.readFileSync(filePath, 'utf8')
  const ext = path.extname(filePath).toLowerCase()
  if (ext === '.jsonl') {
    return raw
      .split(/\r?\n/u)
      .map(line => line.trim())
      .filter(Boolean)
      .map((line, index) => {
        try {
          return JSON.parse(line)
        } catch (error) {
          throw new Error(`Invalid JSONL at line ${index + 1}: ${error.message}`)
        }
      })
  }

  const parsed = JSON.parse(raw)
  if (Array.isArray(parsed)) return parsed
  throw new Error('Input must be JSON array or JSONL line-delimited objects.')
}

function normalizeWhitespace(value) {
  return typeof value === 'string' ? value.replace(/\s+/gu, ' ').trim() : value
}

function normalizeForNearDuplicate(value) {
  return normalizeWhitespace(String(value).toLowerCase()).replace(/[^a-z0-9\s]/gu, '')
}

function similarityScore(a, b) {
  const tokensA = new Set(normalizeForNearDuplicate(a).split(' ').filter(Boolean))
  const tokensB = new Set(normalizeForNearDuplicate(b).split(' ').filter(Boolean))
  if (tokensA.size === 0 || tokensB.size === 0) return 0
  let intersection = 0
  for (const token of tokensA) {
    if (tokensB.has(token)) intersection += 1
  }
  const union = new Set([...tokensA, ...tokensB]).size
  return union === 0 ? 0 : intersection / union
}

function compileValidator() {
  const schema = readJson(NORMALIZED_ENTRY_SCHEMA_PATH)
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
  addFormats(ajv)
  return ajv.compile(schema)
}

function loadEntitySlugSets() {
  const entityDirs = {
    herb: path.join(ROOT, 'public', 'data', 'herbs-detail'),
    compound: path.join(ROOT, 'public', 'data', 'compounds-detail'),
  }

  return Object.fromEntries(
    Object.entries(entityDirs).map(([entityType, dir]) => {
      const slugSet = new Set(
        fs
          .readdirSync(dir)
          .filter(name => name.endsWith('.json'))
          .map(name => name.replace(/\.json$/u, '')),
      )
      return [entityType, slugSet]
    }),
  )
}

function normalizeEntry(entry) {
  const normalized = { ...entry }
  normalized.entitySlug = normalizeWhitespace(normalized.entitySlug)
  normalized.findingTextShort = normalizeWhitespace(normalized.findingTextShort)
  normalized.findingTextNormalized = normalizeWhitespace(normalized.findingTextNormalized)
  normalized.reviewer = normalizeWhitespace(normalized.reviewer)
  normalized.claimType = normalizeWhitespace(normalized.claimType)
  normalized.topicType = normalizeWhitespace(normalized.topicType)
  for (const key of NON_EMPTY_FIELDS) {
    if (normalized[key] == null) continue
    normalized[key] = normalizeWhitespace(normalized[key])
    if (!normalized[key]) delete normalized[key]
  }
  return normalized
}

export function validateAndNormalizeEntries(entries, options = {}) {
  const validate = compileValidator()
  const sourceRegistry = readJson(SOURCE_REGISTRY_PATH)
  const sourceById = new Map(sourceRegistry.map(source => [source.sourceId, source]))
  const entitySlugs = loadEntitySlugSets()
  const includeNearDuplicateCheck = options.includeNearDuplicateCheck !== false

  const issues = []
  const normalizedEntries = []
  const exactDupeKeys = new Set()
  const nearDupeBuckets = new Map()

  for (const [index, rawEntry] of entries.entries()) {
    const entry = normalizeEntry(rawEntry)
    const idPart = entry.enrichmentId ?? `row-${index + 1}`
    const prefix = `[entry:${index}:${idPart}]`

    if (!validate(entry)) {
      issues.push(`${prefix} schema invalid: ${JSON.stringify(validate.errors ?? [])}`)
      continue
    }

    const source = sourceById.get(entry.sourceId)
    if (!source) {
      issues.push(`${prefix} sourceId=${entry.sourceId} not found in source registry.`)
      continue
    }

    if (entry.evidenceClass !== source.evidenceClass) {
      issues.push(
        `${prefix} evidenceClass=${entry.evidenceClass} contradicts source ${entry.sourceId} evidenceClass=${source.evidenceClass}.`,
      )
    }

    if (!entitySlugs[entry.entityType]?.has(entry.entitySlug)) {
      issues.push(`${prefix} entity reference ${entry.entityType}:${entry.entitySlug} was not found in detail data.`)
    }

    const findingNormalizedLc = entry.findingTextNormalized.toLowerCase()
    if (VAGUE_FINDING_PATTERNS.has(findingNormalizedLc)) {
      issues.push(`${prefix} findingTextNormalized is too vague; provide source-backed specific finding text.`)
    }

    const tokenCount = findingNormalizedLc.split(' ').filter(Boolean).length
    if (tokenCount < 5) {
      issues.push(`${prefix} findingTextNormalized must include at least 5 words.`)
    }

    if (!TOPIC_TO_ROLLUP_FIELD[entry.topicType]) {
      issues.push(`${prefix} unsupported topicType=${entry.topicType}.`)
    }

    const exactKey = [
      entry.entityType,
      entry.entitySlug,
      entry.sourceId,
      entry.topicType,
      entry.claimType,
      findingNormalizedLc,
    ].join('|')
    if (exactDupeKeys.has(exactKey)) {
      issues.push(`${prefix} duplicate claim for entity/source/topic with same normalized finding text.`)
    } else {
      exactDupeKeys.add(exactKey)
    }

    if (includeNearDuplicateCheck) {
      const nearBucketKey = [entry.entityType, entry.entitySlug, entry.sourceId, entry.topicType].join('|')
      const bucket = nearDupeBuckets.get(nearBucketKey) ?? []
      const candidateText = entry.findingTextNormalized
      for (const existing of bucket) {
        const similarity = similarityScore(existing.findingTextNormalized, candidateText)
        if (similarity >= 0.9) {
          issues.push(
            `${prefix} near-duplicate claim detected against enrichmentId=${existing.enrichmentId} similarity=${similarity.toFixed(2)}.`,
          )
          break
        }
      }
      bucket.push(entry)
      nearDupeBuckets.set(nearBucketKey, bucket)
    }

    normalizedEntries.push(entry)
  }

  return {
    normalizedEntries,
    issues,
    sourceById,
  }
}

function rankEvidenceTier(evidenceClasses) {
  const maxScore = Math.max(...evidenceClasses.map(value => EVIDENCE_TIER_SCORE[value] ?? 0), 0)
  if (maxScore >= 4) return 'tier-1-strong'
  if (maxScore === 3) return 'tier-2-moderate'
  if (maxScore === 2) return 'tier-3-limited'
  return 'tier-4-insufficient'
}

function pickEditorialStatus(statuses) {
  if (statuses.has('in-review')) return 'in-review'
  if (statuses.has('approved') && statuses.size === 1) return 'approved'
  if (statuses.has('needs-update')) return 'needs-update'
  if (statuses.has('deprecated') && statuses.size === 1) return 'deprecated'
  return 'draft'
}

export function rollupToResearchEnrichment(entries) {
  const grouped = new Map()
  for (const entry of entries) {
    if (entry.active !== true || entry.editorialStatus !== 'approved') continue
    const key = `${entry.entityType}:${entry.entitySlug}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(entry)
  }

  const output = []
  for (const [entityKey, entityEntries] of grouped.entries()) {
    const [entityType, entitySlug] = entityKey.split(':')
    const claimsByField = Object.fromEntries(Object.values(TOPIC_TO_ROLLUP_FIELD).map(field => [field, []]))

    const sourceRegistryIds = new Set()
    const evidenceClassesPresent = new Set()
    const statusSet = new Set()
    let lastReviewedAt = '1970-01-01T00:00:00.000Z'

    for (const entry of entityEntries) {
      sourceRegistryIds.add(entry.sourceId)
      evidenceClassesPresent.add(entry.evidenceClass)
      statusSet.add(entry.editorialStatus)
      if (entry.reviewedAt > lastReviewedAt) lastReviewedAt = entry.reviewedAt

      const field = TOPIC_TO_ROLLUP_FIELD[entry.topicType]
      claimsByField[field].push({
        claim: entry.findingTextNormalized,
        evidenceClass: entry.evidenceClass,
        sourceRefIds: [entry.sourceId],
        ...(entry.strengthLabel ? { strengthNote: entry.strengthLabel } : {}),
      })
    }

    const evidenceClassList = Array.from(evidenceClassesPresent).sort()
    output.push({
      entityType,
      entitySlug,
      researchEnrichment: {
        evidenceSummary: `${entityEntries.length} approved normalized findings across ${new Set(entityEntries.map(e => e.topicType)).size} topic types.`,
        evidenceTier: rankEvidenceTier(evidenceClassList),
        evidenceClassesPresent: evidenceClassList,
        supportedUses: claimsByField.supportedUses,
        unsupportedOrUnclearUses: claimsByField.unsupportedOrUnclearUses,
        mechanisms: claimsByField.mechanisms,
        constituents: claimsByField.constituents,
        interactions: claimsByField.interactions,
        contraindications: claimsByField.contraindications,
        adverseEffects: claimsByField.adverseEffects,
        dosageContextNotes: claimsByField.dosageContextNotes,
        populationSpecificNotes: claimsByField.populationSpecificNotes,
        conflictNotes: claimsByField.conflictNotes,
        researchGaps: claimsByField.researchGaps,
        sourceRegistryIds: Array.from(sourceRegistryIds).sort(),
        lastReviewedAt,
        reviewedBy: 'normalized-enrichment-pipeline',
        editorialStatus: pickEditorialStatus(statusSet),
      },
    })
  }

  output.sort((a, b) => `${a.entityType}:${a.entitySlug}`.localeCompare(`${b.entityType}:${b.entitySlug}`))
  return output
}

export function buildSummary(entries) {
  const byEntity = {}
  const byTopicType = {}
  const byEvidenceClass = {}
  const byEditorialStatus = {}

  for (const entry of entries) {
    const entityKey = `${entry.entityType}:${entry.entitySlug}`
    byEntity[entityKey] = (byEntity[entityKey] ?? 0) + 1
    byTopicType[entry.topicType] = (byTopicType[entry.topicType] ?? 0) + 1
    byEvidenceClass[entry.evidenceClass] = (byEvidenceClass[entry.evidenceClass] ?? 0) + 1
    byEditorialStatus[entry.editorialStatus] = (byEditorialStatus[entry.editorialStatus] ?? 0) + 1
  }

  return {
    generatedAt: new Date().toISOString(),
    inputPath: path.relative(ROOT, INPUT_PATH_DEFAULT),
    totalEntries: entries.length,
    counts: { byEntity, byTopicType, byEvidenceClass, byEditorialStatus },
  }
}

export function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
}
