#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { gradeEvidenceByTopic, gradeEvidenceEntries } from './evidence-grading.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')

export const NORMALIZED_ENTRY_SCHEMA_PATH = path.join(ROOT, 'schemas', 'normalized-enrichment-entry.schema.json')
export const SOURCE_REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
export const INPUT_PATH_DEFAULT = path.join(ROOT, 'public', 'data', 'enrichment-normalized.jsonl')
export const SUMMARY_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-normalization-summary.json')
export const EVIDENCE_GRADING_SUMMARY_PATH = path.join(ROOT, 'ops', 'reports', 'evidence-grading-summary.json')
export const SAFETY_SUMMARY_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'safety-enrichment-summary.json')
export const MECHANISM_SUMMARY_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'mechanism-enrichment-summary.json')
export const EDITORIAL_READINESS_REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'enrichment-editorial-readiness.json')

export const EDITORIAL_STATUS = {
  DRAFT: 'draft',
  NEEDS_REVIEW: 'needs_review',
  REVIEWED: 'reviewed',
  IN_REVIEW: 'in-review',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  BLOCKED: 'blocked',
  NEEDS_UPDATE: 'needs-update',
  DEPRECATED: 'deprecated',
}

export const PUBLISH_ALLOWED_EDITORIAL_STATES = new Set([EDITORIAL_STATUS.APPROVED, EDITORIAL_STATUS.PUBLISHED])
const WEAK_EVIDENCE_CLASSES = new Set(['preclinical-mechanistic', 'traditional-use'])
const CRITICAL_SOURCE_PUBLICATION_STATUSES = new Set(['withdrawn', 'superseded'])

export const TOPIC_TO_ROLLUP_FIELD = {
  supported_use: 'supportedUses',
  unsupported_or_unclear_use: 'unsupportedOrUnclearUses',
  mechanism: 'mechanisms',
  constituent: 'constituents',
  constituent_relationship: 'constituents',
  pathway: 'mechanisms',
  receptor_activity: 'mechanisms',
  enzyme_interaction: 'mechanisms',
  transporter_interaction: 'mechanisms',
  herb_compound_link: 'constituents',
  compound_origin_note: 'constituents',
  interaction: 'interactions',
  contraindication: 'contraindications',
  adverse_effect: 'adverseEffects',
  pregnancy_note: 'populationSpecificNotes',
  lactation_note: 'populationSpecificNotes',
  pediatric_note: 'populationSpecificNotes',
  geriatric_note: 'populationSpecificNotes',
  condition_caution: 'populationSpecificNotes',
  surgery_caution: 'populationSpecificNotes',
  medication_class_caution: 'populationSpecificNotes',
  dosage_context: 'dosageContextNotes',
  population_specific_note: 'populationSpecificNotes',
  conflict_note: 'conflictNotes',
  research_gap: 'researchGaps',
}

export const SAFETY_TOPIC_TYPES = new Set([
  'interaction',
  'contraindication',
  'adverse_effect',
  'pregnancy_note',
  'lactation_note',
  'pediatric_note',
  'geriatric_note',
  'condition_caution',
  'surgery_caution',
  'medication_class_caution',
])

const SAFETY_TARGET_TYPES = new Set(['drug', 'drug_class', 'herb', 'condition', 'population'])
const SEVERITY_LABELS = new Set(['none_known', 'low', 'moderate', 'high', 'severe', 'contraindicated'])
const URGENCY_LABELS = new Set(['routine', 'caution', 'prompt_review', 'urgent'])
const SEVERITY_RANK = {
  none_known: 0,
  low: 1,
  moderate: 2,
  high: 3,
  severe: 4,
  contraindicated: 5,
}

const TOPIC_ALLOWED_TARGET_TYPES = {
  interaction: new Set(['drug', 'drug_class', 'herb']),
  contraindication: new Set(['condition', 'population']),
  adverse_effect: new Set(['population']),
  pregnancy_note: new Set(['population']),
  lactation_note: new Set(['population']),
  pediatric_note: new Set(['population']),
  geriatric_note: new Set(['population']),
  condition_caution: new Set(['condition', 'population']),
  surgery_caution: new Set(['condition', 'population']),
  medication_class_caution: new Set(['drug_class']),
}

const TOPIC_RELATION_RULES = {
  constituent: { relationTypes: new Set(['contains', 'enriched_for', 'linked_to', 'traditional_association']), targetTypes: new Set(['constituent']) },
  constituent_relationship: {
    relationTypes: new Set(['contains', 'enriched_for', 'linked_to', 'traditional_association', 'related_to']),
    targetTypes: new Set(['constituent', 'compound']),
  },
  mechanism: {
    relationTypes: new Set(['may_modulate', 'observed_to_affect', 'linked_to', 'related_to']),
    targetTypes: new Set(['pathway', 'receptor', 'enzyme', 'transporter', 'biological_process', 'compound', 'constituent']),
  },
  pathway: { relationTypes: new Set(['may_modulate', 'observed_to_affect', 'linked_to']), targetTypes: new Set(['pathway', 'biological_process']) },
  receptor_activity: { relationTypes: new Set(['may_modulate', 'observed_to_affect', 'linked_to']), targetTypes: new Set(['receptor']) },
  enzyme_interaction: { relationTypes: new Set(['may_modulate', 'observed_to_affect', 'linked_to']), targetTypes: new Set(['enzyme']) },
  transporter_interaction: { relationTypes: new Set(['may_modulate', 'observed_to_affect', 'linked_to']), targetTypes: new Set(['transporter']) },
  herb_compound_link: { relationTypes: new Set(['contains', 'derived_from', 'linked_to', 'related_to']), targetTypes: new Set(['herb', 'compound']) },
  compound_origin_note: { relationTypes: new Set(['derived_from', 'linked_to', 'related_to', 'traditional_association']), targetTypes: new Set(['herb']) },
}

const CONSTITUENT_ALIAS_NORMALIZATION = new Map([
  ['beta caryophyllene', 'beta-caryophyllene'],
  ['β-caryophyllene', 'beta-caryophyllene'],
  ['a-pinene', 'alpha-pinene'],
  ['α-pinene', 'alpha-pinene'],
  ['b-pinene', 'beta-pinene'],
  ['β-pinene', 'beta-pinene'],
  ['thc', 'tetrahydrocannabinol'],
  ['cbd', 'cannabidiol'],
])

const NON_EMPTY_FIELDS = [
  'populationContext',
  'usageContext',
  'safetyContext',
  'mechanismContext',
  'traditionalUseContext',
  'uncertaintyNote',
  'targetName',
  'targetSlug',
  'relationType',
  'topicTypeDetail',
  'constituentRoleContext',
  'biologicalContext',
  'mechanismEntryId',
  'mechanismStrengthLabel',
  'medicationClassContext',
  'conflictNote',
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

function normalizeConstituentAlias(value) {
  const key = normalizeWhitespace(String(value).toLowerCase())
  return CONSTITUENT_ALIAS_NORMALIZATION.get(key) ?? value
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
  const aliasFile = path.join(ROOT, 'public', 'data', 'entity-slug-aliases.json')
  const aliases = fs.existsSync(aliasFile) ? readJson(aliasFile) : {}

  return Object.fromEntries(
    Object.entries(entityDirs).map(([entityType, dir]) => {
      const slugSet = new Set(
        fs
          .readdirSync(dir)
          .filter(name => name.endsWith('.json'))
          .map(name => name.replace(/\.json$/u, '')),
      )

      const aliasEntries = Object.entries(aliases?.[`${entityType}s`] || {})
      aliasEntries.forEach(([aliasPath]) => {
        const aliasSlug = String(aliasPath)
          .split('/')
          .filter(Boolean)
          .at(-1)
        if (aliasSlug) slugSet.add(aliasSlug)
      })
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
  normalized.safetyTopicType = normalizeWhitespace(normalized.safetyTopicType)
  normalized.targetType = normalizeWhitespace(normalized.targetType)
  normalized.targetSlug = normalizeWhitespace(normalized.targetSlug)
  normalized.relationType = normalizeWhitespace(normalized.relationType)
  normalized.topicTypeDetail = normalizeWhitespace(normalized.topicTypeDetail)
  normalized.constituentRoleContext = normalizeWhitespace(normalized.constituentRoleContext)
  normalized.biologicalContext = normalizeWhitespace(normalized.biologicalContext)
  normalized.mechanismEntryId = normalizeWhitespace(normalized.mechanismEntryId)
  normalized.mechanismStrengthLabel = normalizeWhitespace(normalized.mechanismStrengthLabel)
  normalized.severityLabel = normalizeWhitespace(normalized.severityLabel)
  normalized.urgencyLabel = normalizeWhitespace(normalized.urgencyLabel)
  normalized.safetyEntryId = normalizeWhitespace(normalized.safetyEntryId)
  for (const key of NON_EMPTY_FIELDS) {
    if (normalized[key] == null) continue
    normalized[key] = normalizeWhitespace(normalized[key])
    if (!normalized[key]) delete normalized[key]
  }
  if (normalized.targetType === 'constituent' && normalized.targetName) {
    normalized.targetName = normalizeConstituentAlias(normalized.targetName)
  }
  return normalized
}

function isNonEmptyText(value) {
  return typeof value === 'string' && value.trim().length > 0
}

function classifyEditorialBucket(editorialStatus) {
  if (editorialStatus === EDITORIAL_STATUS.BLOCKED || editorialStatus === EDITORIAL_STATUS.DEPRECATED) return 'blocked'
  if (PUBLISH_ALLOWED_EDITORIAL_STATES.has(editorialStatus)) return 'publishable'
  if (
    editorialStatus === EDITORIAL_STATUS.NEEDS_REVIEW ||
    editorialStatus === EDITORIAL_STATUS.REVIEWED ||
    editorialStatus === EDITORIAL_STATUS.IN_REVIEW
  ) {
    return 'review-ready'
  }
  return 'draft-only'
}

export function evaluateEntryReadiness(entry, source, validationIssues = []) {
  const reasons = []
  const criticalReasons = []

  if (entry.active !== true) {
    reasons.push('entry_inactive')
    criticalReasons.push('entry_inactive')
  }

  if (!source) {
    reasons.push('missing_source_registry_reference')
    criticalReasons.push('missing_source_registry_reference')
  } else {
    if (source.active !== true) {
      reasons.push('source_inactive')
      criticalReasons.push('source_inactive')
    }
    if (CRITICAL_SOURCE_PUBLICATION_STATUSES.has(source.publicationStatus)) {
      reasons.push(`source_publication_status_${source.publicationStatus}`)
      criticalReasons.push(`source_publication_status_${source.publicationStatus}`)
    }
  }

  if (!isNonEmptyText(entry.reviewer)) {
    reasons.push('missing_reviewer')
    criticalReasons.push('missing_reviewer')
  }
  if (!isNonEmptyText(entry.reviewedAt)) {
    reasons.push('missing_reviewed_at')
    criticalReasons.push('missing_reviewed_at')
  }
  if (!PUBLISH_ALLOWED_EDITORIAL_STATES.has(entry.editorialStatus)) {
    reasons.push('editorial_status_not_publishable')
  }
  if (WEAK_EVIDENCE_CLASSES.has(entry.evidenceClass) && !isNonEmptyText(entry.uncertaintyNote)) {
    reasons.push('weak_evidence_requires_uncertainty_note')
    criticalReasons.push('weak_evidence_requires_uncertainty_note')
  }
  if (validationIssues.length > 0) {
    reasons.push('validation_failures_present')
    criticalReasons.push('validation_failures_present')
  }

  return {
    publishable: reasons.length === 0,
    editorialBucket: classifyEditorialBucket(entry.editorialStatus),
    reasons,
    criticalReasons,
  }
}

export function validateAndNormalizeEntries(entries, options = {}) {
  const validate = compileValidator()
  const sourceRegistry = readJson(SOURCE_REGISTRY_PATH)
  const sourceById = new Map(sourceRegistry.map(source => [source.sourceId, source]))
  const entitySlugs = loadEntitySlugSets()
  const includeNearDuplicateCheck = options.includeNearDuplicateCheck !== false
  const allowMissingEntityRefs = options.allowMissingEntityRefs === true

  const issues = []
  const normalizedEntries = []
  const exactDupeKeys = new Set()
  const nearDupeBuckets = new Map()
  const safetySeverityByTarget = new Map()

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
      if (!allowMissingEntityRefs) {
        issues.push(`${prefix} entity reference ${entry.entityType}:${entry.entitySlug} was not found in detail data.`)
      } else {
        continue
      }
    }

    const findingNormalizedLc = entry.findingTextNormalized.toLowerCase()
    if (VAGUE_FINDING_PATTERNS.has(findingNormalizedLc)) {
      issues.push(`${prefix} findingTextNormalized is too vague; provide source-backed specific finding text.`)
    }

    const tokenCount = findingNormalizedLc.split(' ').filter(Boolean).length
    if (tokenCount < 5) {
      issues.push(`${prefix} findingTextNormalized must include at least 5 words.`)
    }

    if (
      PUBLISH_ALLOWED_EDITORIAL_STATES.has(entry.editorialStatus) &&
      WEAK_EVIDENCE_CLASSES.has(entry.evidenceClass) &&
      !entry.uncertaintyNote
    ) {
      issues.push(
        `${prefix} editorialStatus=${entry.editorialStatus} with evidenceClass=${entry.evidenceClass} requires uncertaintyNote.`,
      )
    }

    if (!TOPIC_TO_ROLLUP_FIELD[entry.topicType]) {
      issues.push(`${prefix} unsupported topicType=${entry.topicType}.`)
    }

    const relationRule = TOPIC_RELATION_RULES[entry.topicType]
    if (relationRule) {
      if (!entry.relationType) {
        issues.push(`${prefix} topicType=${entry.topicType} requires relationType.`)
      } else if (!relationRule.relationTypes.has(entry.relationType)) {
        issues.push(
          `${prefix} relationType=${entry.relationType} is not allowed for topicType=${entry.topicType}; expected ${Array.from(
            relationRule.relationTypes,
          ).join('|')}.`,
        )
      }

      if (!entry.targetType) {
        issues.push(`${prefix} topicType=${entry.topicType} requires targetType.`)
      } else if (!relationRule.targetTypes.has(entry.targetType)) {
        issues.push(
          `${prefix} targetType=${entry.targetType} is not allowed for topicType=${entry.topicType}; expected ${Array.from(
            relationRule.targetTypes,
          ).join('|')}.`,
        )
      }
    }

    if (entry.topicType === 'herb_compound_link' || entry.topicType === 'compound_origin_note') {
      if (!entry.targetSlug) {
        issues.push(`${prefix} topicType=${entry.topicType} requires targetSlug when targetType is an internal entity.`)
      } else if (!entitySlugs[entry.targetType]?.has(entry.targetSlug)) {
        issues.push(`${prefix} target reference ${entry.targetType}:${entry.targetSlug} was not found in detail data.`)
      }
    }

    if (entry.topicType === 'herb_compound_link' && entry.targetType) {
      const expected = entry.entityType === 'herb' ? 'compound' : 'herb'
      if (entry.targetType !== expected) {
        issues.push(`${prefix} herb_compound_link requires targetType=${expected} for entityType=${entry.entityType}.`)
      }
    }

    const isSafetyTopic = SAFETY_TOPIC_TYPES.has(entry.topicType)
    const effectiveSafetyTopic = entry.safetyTopicType ?? entry.topicType
    if (entry.safetyTopicType && !SAFETY_TOPIC_TYPES.has(entry.safetyTopicType)) {
      issues.push(`${prefix} invalid safetyTopicType=${entry.safetyTopicType}.`)
    }
    if (isSafetyTopic && entry.safetyTopicType && entry.safetyTopicType !== entry.topicType) {
      issues.push(`${prefix} safetyTopicType must match topicType for safety topics.`)
    }

    if (isSafetyTopic) {
      if (!entry.targetType || !SAFETY_TARGET_TYPES.has(entry.targetType)) {
        issues.push(`${prefix} safety entry requires valid targetType (${Array.from(SAFETY_TARGET_TYPES).join('|')}).`)
      }
      if (!entry.targetName || entry.targetName.length < 2) {
        issues.push(`${prefix} safety entry requires targetName with at least 2 characters.`)
      }
      if (!entry.severityLabel || !SEVERITY_LABELS.has(entry.severityLabel)) {
        issues.push(`${prefix} safety entry requires valid severityLabel (${Array.from(SEVERITY_LABELS).join('|')}).`)
      }
      if (!entry.urgencyLabel || !URGENCY_LABELS.has(entry.urgencyLabel)) {
        issues.push(`${prefix} safety entry requires valid urgencyLabel (${Array.from(URGENCY_LABELS).join('|')}).`)
      }
      if (typeof entry.mechanismKnown !== 'boolean') {
        issues.push(`${prefix} safety entry requires mechanismKnown boolean.`)
      }
      const allowedTargetTypes = TOPIC_ALLOWED_TARGET_TYPES[effectiveSafetyTopic]
      if (allowedTargetTypes && entry.targetType && !allowedTargetTypes.has(entry.targetType)) {
        issues.push(
          `${prefix} targetType=${entry.targetType} is not allowed for topic=${effectiveSafetyTopic}; expected ${Array.from(
            allowedTargetTypes,
          ).join('|')}.`,
        )
      }

      if (effectiveSafetyTopic === 'medication_class_caution' && !entry.medicationClassContext) {
        issues.push(`${prefix} medication_class_caution entries require medicationClassContext.`)
      }
      if ((effectiveSafetyTopic === 'pregnancy_note' || effectiveSafetyTopic === 'lactation_note') && entry.targetType !== 'population') {
        issues.push(`${prefix} ${effectiveSafetyTopic} entries must target population.`)
      }
      if (effectiveSafetyTopic === 'adverse_effect' && entry.claimType !== 'safety_risk') {
        issues.push(`${prefix} adverse_effect entries must use claimType=safety_risk.`)
      }

      if (
        (entry.evidenceClass === 'preclinical-mechanistic' || entry.evidenceClass === 'traditional-use') &&
        !entry.uncertaintyNote
      ) {
        issues.push(`${prefix} ${entry.evidenceClass} safety entries require uncertaintyNote to avoid overstating certainty.`)
      }

      const safetySeverityKey = [
        entry.entityType,
        entry.entitySlug,
        effectiveSafetyTopic,
        normalizeForNearDuplicate(entry.targetType ?? ''),
        normalizeForNearDuplicate(entry.targetName ?? ''),
      ].join('|')
      const severityRank = SEVERITY_RANK[entry.severityLabel]
      const prior = safetySeverityByTarget.get(safetySeverityKey)
      if (prior && prior.rank !== severityRank) {
        issues.push(
          `${prefix} contradictory severity assignment for same safety target (existing=${prior.label}, current=${entry.severityLabel}).`,
        )
      } else if (!prior) {
        safetySeverityByTarget.set(safetySeverityKey, { rank: severityRank, label: entry.severityLabel })
      }
    }

    const exactKey = [
      entry.entityType,
      entry.entitySlug,
      entry.sourceId,
      entry.topicType,
      normalizeForNearDuplicate(entry.relationType ?? ''),
      entry.claimType,
      normalizeForNearDuplicate(entry.targetType ?? ''),
      normalizeForNearDuplicate(entry.targetName ?? ''),
      findingNormalizedLc,
    ].join('|')
    if (exactDupeKeys.has(exactKey)) {
      issues.push(`${prefix} duplicate claim for entity/source/topic with same normalized finding text.`)
    } else {
      exactDupeKeys.add(exactKey)
    }

    if (includeNearDuplicateCheck) {
      const nearBucketKey = [
        entry.entityType,
        entry.entitySlug,
        entry.sourceId,
        entry.topicType,
        normalizeForNearDuplicate(entry.relationType ?? ''),
        normalizeForNearDuplicate(entry.targetType ?? ''),
        normalizeForNearDuplicate(entry.targetName ?? ''),
      ].join('|')
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
  if (statuses.has(EDITORIAL_STATUS.BLOCKED)) return EDITORIAL_STATUS.BLOCKED
  if (statuses.has(EDITORIAL_STATUS.DEPRECATED) && statuses.size === 1) return EDITORIAL_STATUS.DEPRECATED
  if (statuses.has(EDITORIAL_STATUS.PUBLISHED) && statuses.size === 1) return EDITORIAL_STATUS.PUBLISHED
  if (statuses.has(EDITORIAL_STATUS.APPROVED) && statuses.size === 1) return EDITORIAL_STATUS.APPROVED
  if (statuses.has(EDITORIAL_STATUS.NEEDS_UPDATE)) return EDITORIAL_STATUS.NEEDS_UPDATE
  if (statuses.has(EDITORIAL_STATUS.IN_REVIEW) || statuses.has(EDITORIAL_STATUS.NEEDS_REVIEW)) return EDITORIAL_STATUS.IN_REVIEW
  if (statuses.has(EDITORIAL_STATUS.REVIEWED)) return EDITORIAL_STATUS.REVIEWED
  return EDITORIAL_STATUS.DRAFT
}

export function rollupToResearchEnrichment(entries, sourceById = null) {
  const grouped = new Map()
  for (const entry of entries) {
    const source = sourceById?.get(entry.sourceId) ?? null
    const readiness = evaluateEntryReadiness(entry, source)
    if (entry.active !== true || !readiness.publishable) continue
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
        ...(entry.relationType ? { relationType: entry.relationType } : {}),
        ...(entry.targetType ? { targetType: entry.targetType } : {}),
        ...(entry.targetName ? { targetName: entry.targetName } : {}),
        ...(entry.targetSlug ? { targetSlug: entry.targetSlug } : {}),
        ...(entry.biologicalContext ? { biologicalContext: entry.biologicalContext } : {}),
        ...(entry.constituentRoleContext ? { constituentRoleContext: entry.constituentRoleContext } : {}),
        ...(entry.uncertaintyNote ? { uncertaintyNote: entry.uncertaintyNote } : {}),
        ...(entry.conflictNote ? { conflictNote: entry.conflictNote } : {}),
        ...(entry.mechanismEntryId ? { mechanismEntryId: entry.mechanismEntryId } : {}),
        ...(entry.strengthLabel ? { strengthNote: entry.strengthLabel } : {}),
        ...(entry.mechanismStrengthLabel ? { mechanismStrengthLabel: entry.mechanismStrengthLabel } : {}),
      })
    }

    const sourceMap = sourceById ?? sourceByIdFromEntries(entityEntries)
    const topicEvidenceJudgments = gradeEvidenceByTopic(entityEntries, sourceMap)
    const pageEvidenceJudgment = gradeEvidenceEntries(entityEntries, sourceMap)
    const safetyProfile = buildSafetyProfile(entityEntries)
    const hasConflictOrWeakEvidence =
      pageEvidenceJudgment.conflictNotes.length > 0 ||
      pageEvidenceJudgment.grading.conflictState !== 'none' ||
      pageEvidenceJudgment.evidenceLabel === 'mixed_or_uncertain' ||
      pageEvidenceJudgment.evidenceLabel === 'conflicting_evidence' ||
      pageEvidenceJudgment.evidenceLabel === 'preclinical_only' ||
      pageEvidenceJudgment.evidenceLabel === 'traditional_use_only'
    const weakEvidenceClaimsLabeled = entityEntries
      .filter(entry => WEAK_EVIDENCE_CLASSES.has(entry.evidenceClass))
      .every(entry => isNonEmptyText(entry.uncertaintyNote))
    const conflictLabelingPresent = !hasConflictOrWeakEvidence || claimsByField.conflictNotes.length > 0

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
        safetyProfile,
        topicEvidenceJudgments,
        pageEvidenceJudgment,
        editorialReadiness: {
          publishable: conflictLabelingPresent && weakEvidenceClaimsLabeled,
          hasConflictOrWeakEvidence,
          conflictLabelingPresent,
          weakEvidenceClaimsLabeled,
        },
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

function sourceByIdFromEntries(entries) {
  const sourceRegistry = readJson(SOURCE_REGISTRY_PATH)
  const registry = new Map(sourceRegistry.map(source => [source.sourceId, source]))
  const active = new Map()
  for (const entry of entries) {
    const source = registry.get(entry.sourceId)
    if (source) active.set(source.sourceId, source)
  }
  return active
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

function buildSafetyProfile(entries) {
  const safetyEntries = entries
    .filter(entry => SAFETY_TOPIC_TYPES.has(entry.topicType))
    .map(entry => ({
      safetyEntryId: entry.safetyEntryId ?? `senr_${entry.enrichmentId.replace(/^enr_/u, '')}`,
      sourceId: entry.sourceId,
      safetyTopicType: entry.safetyTopicType ?? entry.topicType,
      targetType: entry.targetType,
      targetName: entry.targetName,
      severityLabel: entry.severityLabel,
      urgencyLabel: entry.urgencyLabel,
      evidenceClass: entry.evidenceClass,
      findingTextShort: entry.findingTextShort,
      findingTextNormalized: entry.findingTextNormalized,
      mechanismKnown: entry.mechanismKnown,
      populationContext: entry.populationContext,
      medicationClassContext: entry.medicationClassContext,
      uncertaintyNote: entry.uncertaintyNote,
      conflictNote: entry.conflictNote,
      reviewer: entry.reviewer,
      reviewedAt: entry.reviewedAt,
      editorialStatus: entry.editorialStatus,
      active: entry.active,
    }))
  const severityCounts = {}
  const topicCounts = {}
  for (const row of safetyEntries) {
    topicCounts[row.safetyTopicType] = (topicCounts[row.safetyTopicType] ?? 0) + 1
    severityCounts[row.severityLabel] = (severityCounts[row.severityLabel] ?? 0) + 1
  }
  return {
    safetyEntries,
    summary: {
      total: safetyEntries.length,
      byTopicType: topicCounts,
      bySeverity: severityCounts,
    },
  }
}

export function buildSafetySummary(entries) {
  const counts = {
    byEntity: {},
    bySafetyTopicType: {},
    byTargetType: {},
    bySeverity: {},
    byEvidenceClass: {},
    byConflictState: {},
  }

  for (const entry of entries) {
    if (!SAFETY_TOPIC_TYPES.has(entry.topicType)) continue
    const entityKey = `${entry.entityType}:${entry.entitySlug}`
    const conflictState = entry.conflictNote ? 'conflict_noted' : 'none'
    const safetyTopicType = entry.safetyTopicType ?? entry.topicType

    counts.byEntity[entityKey] = (counts.byEntity[entityKey] ?? 0) + 1
    counts.bySafetyTopicType[safetyTopicType] = (counts.bySafetyTopicType[safetyTopicType] ?? 0) + 1
    counts.byTargetType[entry.targetType] = (counts.byTargetType[entry.targetType] ?? 0) + 1
    counts.bySeverity[entry.severityLabel] = (counts.bySeverity[entry.severityLabel] ?? 0) + 1
    counts.byEvidenceClass[entry.evidenceClass] = (counts.byEvidenceClass[entry.evidenceClass] ?? 0) + 1
    counts.byConflictState[conflictState] = (counts.byConflictState[conflictState] ?? 0) + 1
  }

  return {
    generatedAt: new Date().toISOString(),
    inputPath: path.relative(ROOT, INPUT_PATH_DEFAULT),
    totalSafetyEntries: Object.values(counts.byEntity).reduce((sum, value) => sum + value, 0),
    counts,
  }
}

export function buildMechanismSummary(entries) {
  const counts = {
    byEntity: {},
    byTopicType: {},
    byRelationType: {},
    byTargetType: {},
    byEvidenceClass: {},
    byConflictState: {},
  }

  const mechanismTopics = new Set([
    'constituent',
    'constituent_relationship',
    'mechanism',
    'pathway',
    'receptor_activity',
    'enzyme_interaction',
    'transporter_interaction',
    'herb_compound_link',
    'compound_origin_note',
    'research_gap',
  ])

  for (const entry of entries) {
    if (!mechanismTopics.has(entry.topicType)) continue
    const entityKey = `${entry.entityType}:${entry.entitySlug}`
    const relationType = entry.relationType ?? 'unspecified'
    const targetType = entry.targetType ?? 'unspecified'
    const conflictState = entry.conflictNote ? 'conflict_noted' : 'none'

    counts.byEntity[entityKey] = (counts.byEntity[entityKey] ?? 0) + 1
    counts.byTopicType[entry.topicType] = (counts.byTopicType[entry.topicType] ?? 0) + 1
    counts.byRelationType[relationType] = (counts.byRelationType[relationType] ?? 0) + 1
    counts.byTargetType[targetType] = (counts.byTargetType[targetType] ?? 0) + 1
    counts.byEvidenceClass[entry.evidenceClass] = (counts.byEvidenceClass[entry.evidenceClass] ?? 0) + 1
    counts.byConflictState[conflictState] = (counts.byConflictState[conflictState] ?? 0) + 1
  }

  return {
    generatedAt: new Date().toISOString(),
    inputPath: path.relative(ROOT, INPUT_PATH_DEFAULT),
    totalMechanismEntries: Object.values(counts.byEntity).reduce((sum, value) => sum + value, 0),
    counts,
  }
}

export function buildEditorialReadinessReport(entries, sourceById) {
  const byEditorialState = {}
  const readinessRows = []
  const entityMap = new Map()

  for (const [index, entry] of entries.entries()) {
    byEditorialState[entry.editorialStatus] = (byEditorialState[entry.editorialStatus] ?? 0) + 1
    const source = sourceById.get(entry.sourceId) ?? null
    const readiness = evaluateEntryReadiness(entry, source)
    const entryKey = `${entry.entityType}:${entry.entitySlug}`
    const row = {
      index,
      enrichmentId: entry.enrichmentId,
      entityType: entry.entityType,
      entitySlug: entry.entitySlug,
      sourceId: entry.sourceId,
      topicType: entry.topicType,
      editorialStatus: entry.editorialStatus,
      active: entry.active,
      publishable: readiness.publishable,
      readinessState: readiness.editorialBucket,
      blockedReasons: readiness.reasons,
    }
    readinessRows.push(row)

    const entity = entityMap.get(entryKey) ?? {
      entityType: entry.entityType,
      entitySlug: entry.entitySlug,
      entriesTotal: 0,
      publishableEntries: 0,
      blockedEntries: 0,
      blockedReasons: new Set(),
      editorialStates: new Set(),
      readinessState: 'blocked',
    }
    entity.entriesTotal += 1
    entity.editorialStates.add(entry.editorialStatus)
    if (readiness.publishable && entry.active === true) entity.publishableEntries += 1
    else {
      entity.blockedEntries += 1
      for (const reason of readiness.reasons) entity.blockedReasons.add(reason)
    }
    entityMap.set(entryKey, entity)
  }

  const entities = Array.from(entityMap.values())
    .map(entity => {
      const allPublishable = entity.entriesTotal > 0 && entity.blockedEntries === 0 && entity.publishableEntries === entity.entriesTotal
      const partiallyEnrichedBlocked = entity.publishableEntries > 0 && entity.blockedEntries > 0
      return {
        entityType: entity.entityType,
        entitySlug: entity.entitySlug,
        entriesTotal: entity.entriesTotal,
        publishableEntries: entity.publishableEntries,
        blockedEntries: entity.blockedEntries,
        readinessState: allPublishable ? 'ready' : partiallyEnrichedBlocked ? 'partially_blocked' : 'blocked',
        editorialStates: Array.from(entity.editorialStates).sort(),
        blockedReasons: Array.from(entity.blockedReasons).sort(),
      }
    })
    .sort((a, b) => `${a.entityType}:${a.entitySlug}`.localeCompare(`${b.entityType}:${b.entitySlug}`))

  const readyForEnrichedPublish = entities.filter(entity => entity.readinessState === 'ready')
  const partiallyEnrichedBlocked = entities.filter(entity => entity.readinessState === 'partially_blocked')
  const fullyBlocked = entities.filter(entity => entity.readinessState === 'blocked')
  const blockedEntries = readinessRows.filter(row => row.publishable === false)

  return {
    generatedAt: new Date().toISOString(),
    summary: {
      totalEntries: entries.length,
      totalEntities: entities.length,
      entitiesReadyForEnrichedPublish: readyForEnrichedPublish.length,
      entitiesPartiallyBlocked: partiallyEnrichedBlocked.length,
      entitiesBlocked: fullyBlocked.length,
      blockedEntries: blockedEntries.length,
      countsByEditorialState: byEditorialState,
    },
    entitiesReadyForEnrichedPublish: readyForEnrichedPublish,
    entitiesPartiallyEnrichedButBlocked: partiallyEnrichedBlocked,
    entitiesBlocked: fullyBlocked,
    blockedEntries,
  }
}

export function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
}
