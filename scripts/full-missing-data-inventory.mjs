#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { countBootstrapSources, sourceCountBuckets } from './source-normalization.mjs'

const ROOT = process.cwd()

const QUALITY_THRESHOLDS = {
  minDescriptionLength: 30,
  minSources: 2,
  minEffects: 1,
  minCompletenessScore: 0.4,
  minSlugLength: 2,
}

const PLACEHOLDER_PATTERNS = [
  { label: 'no direct', pattern: /\bno direct\b/i },
  { label: 'contextual inference', pattern: /\bcontextual inference\b/i },
  { label: 'not established', pattern: /\bnot established\b/i },
  { label: 'insufficient data', pattern: /\binsufficient data\b/i },
  { label: 'unknown', pattern: /\bunknown\b/i },
  { label: '[object Object]', pattern: /\[object\s+object\]/i },
  { label: 'placeholder', pattern: /\bplaceholder\b/i },
  { label: 'tbd', pattern: /\btbd\b/i },
]

const NAN_PATTERN = /(^|[^a-z0-9])nan([^a-z0-9]|$)/i
const INVALID_NAME_PATTERN = /^(?:nan|null|undefined|n\/a)$/i
const NUMERIC_ONLY_NAME = /^\d+(?:[\s.,/-]\d+)*$/
const VALID_NAME_CHARS = /^[\p{L}\p{N}][\p{L}\p{N}\s\-,'()./]*[\p{L}\p{N})]$/u

const CLAIM_ARRAY_FIELDS = [
  'supportedUses',
  'unsupportedOrUnclearUses',
  'mechanisms',
  'constituents',
  'interactions',
  'contraindications',
  'adverseEffects',
  'dosageContextNotes',
  'populationSpecificNotes',
  'conflictNotes',
  'researchGaps',
]

const REQUIRED_BASE_FIELDS = ['name', 'slug', 'description', 'effects', 'sources']

const asArray = value => (Array.isArray(value) ? value : [])
const asText = value => String(value ?? '').trim()

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function readJson(relativePath) {
  const filePath = path.join(ROOT, relativePath)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(relativePath, data) {
  const filePath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

function writeText(relativePath, text) {
  const filePath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, text, 'utf8')
}

function countSources(record) {
  return countBootstrapSources([record?.sources, record?.source, record?.references, record?.citations])
}

function countEffects(record) {
  return asArray(record?.effects)
    .map(asText)
    .filter(Boolean)
    .filter(text => !NAN_PATTERN.test(text))
    .filter(text => !PLACEHOLDER_PATTERNS.some(({ pattern }) => pattern.test(text))).length
}

function collectTextFields(record) {
  const textFields = [
    record?.name,
    record?.latin,
    record?.description,
    record?.summary,
    record?.mechanism,
    record?.duration,
    record?.traditionalUse,
    record?.safetyNotes,
  ]

  return [...textFields, ...asArray(record?.effects), ...asArray(record?.contraindications), ...asArray(record?.interactions)]
    .map(asText)
    .filter(Boolean)
    .join(' ')
}

function hasPlaceholderText(record) {
  const corpus = collectTextFields(record)
  return PLACEHOLDER_PATTERNS.some(({ pattern }) => pattern.test(corpus))
}

function hasNanArtifacts(record) {
  const nameField = asText(record?.name)
  if (!nameField) return true
  if (INVALID_NAME_PATTERN.test(nameField)) return true
  return NAN_PATTERN.test(nameField)
}

function hasUsableDescription(record) {
  const narrative = [record?.description, record?.summary, record?.mechanism]
    .map(asText)
    .filter(Boolean)
    .join(' ')
  if (narrative.length < QUALITY_THRESHOLDS.minDescriptionLength) return false
  if (NAN_PATTERN.test(narrative)) return false
  if (PLACEHOLDER_PATTERNS.some(({ pattern }) => pattern.test(narrative))) return false
  return true
}

function hasValidName(record) {
  const name = asText(record?.name || record?.commonName || record?.common || record?.latinName || record?.latin)
  const slug = slugify(record?.slug || name || record?.id)
  if (!name || !slug) return false
  if (INVALID_NAME_PATTERN.test(name)) return false
  if (slug.length < QUALITY_THRESHOLDS.minSlugLength) return false
  if (!VALID_NAME_CHARS.test(name)) return false
  if (NAN_PATTERN.test(name)) return false
  if (/^\[object\s+object\]$/i.test(name)) return false
  if (NUMERIC_ONLY_NAME.test(name)) return false
  if (PLACEHOLDER_PATTERNS.some(({ pattern }) => pattern.test(name))) return false
  return true
}

function scoreRecord(record) {
  const sourceCount = countSources(record)
  const effectCount = countEffects(record)
  const hasMechanism = asText(record?.mechanism).length > 0 ? 1 : 0
  const hasDescription = hasUsableDescription(record) ? 1 : 0
  const hasContraindications = asArray(record?.contraindications).map(asText).filter(Boolean).length > 0 ? 1 : 0
  return sourceCount * 3 + effectCount + hasMechanism * 2 + hasDescription * 2 + hasContraindications
}

function auditEntity(record, type) {
  const name = asText(record?.name || record?.commonName || record?.common || record?.latinName || record?.latin)
  const slug = slugify(record?.slug || name || record?.id)

  const flags = {
    hasValidName: hasValidName(record),
    hasUsableDescription: hasUsableDescription(record),
    hasPlaceholderText: hasPlaceholderText(record),
    hasNanArtifacts: hasNanArtifacts(record),
    sourceCount: countSources(record),
    effectCount: countEffects(record),
  }

  const completenessScore = scoreRecord(record)
  const passesIndexThreshold =
    flags.hasValidName &&
    flags.hasUsableDescription &&
    !flags.hasPlaceholderText &&
    !flags.hasNanArtifacts &&
    flags.effectCount >= QUALITY_THRESHOLDS.minEffects

  const exclusionReasons = []
  if (!flags.hasValidName) exclusionReasons.push('invalidNameOrSlug')
  if (!flags.hasUsableDescription) exclusionReasons.push('weakDescription')
  if (flags.hasPlaceholderText) exclusionReasons.push('placeholderText')
  if (flags.hasNanArtifacts) exclusionReasons.push('nanArtifacts')
  if (flags.effectCount < QUALITY_THRESHOLDS.minEffects) exclusionReasons.push('insufficientEffects')
  if (flags.sourceCount < QUALITY_THRESHOLDS.minSources && completenessScore < QUALITY_THRESHOLDS.minCompletenessScore) {
    exclusionReasons.push('insufficientEvidenceOrCompleteness')
  }

  return { entityType: type, slug, name, flags, completenessScore, passesIndexThreshold, exclusionReasons }
}

function pushUnique(arr, value) {
  if (!arr.includes(value)) arr.push(value)
}

function detectPlaceholderLabels(text) {
  const labels = []
  for (const { label, pattern } of PLACEHOLDER_PATTERNS) {
    if (pattern.test(text)) labels.push(label)
  }
  return labels
}

function classifyFixType(item) {
  const hasSchema = item.malformedFields.length > 0
  const hasIdentity = item.failingReasons.includes('invalidNameOrSlug') || item.missingFields.includes('name') || item.missingFields.includes('slug')
  const hasSource = item.missingSourceLinks || item.missingClaimSources.length > 0
  const hasWeak = item.weakFields.length > 0

  const classes = [hasSchema, hasIdentity, hasSource, hasWeak].filter(Boolean).length
  if (classes > 1) return 'mixed'
  if (hasIdentity) return 'identity-repair'
  if (hasSchema) return 'schema-repair'
  if (hasSource) return 'source-discovery'
  return 'narrative-rewrite-from-existing-sources'
}

function estimateDifficulty(item) {
  if (item.malformedFields.some(field => field.includes('detail file parse error'))) return 'blocked-human-review'
  if (item.failingReasons.includes('missingDetailFile')) return 'hard'
  if (item.failingReasons.includes('invalidNameOrSlug') && item.missingSourceLinks) return 'blocked-human-review'
  const burden = item.missingFields.length + item.placeholderFields.length + item.malformedFields.length + item.weakFields.length + item.missingClaimSources.length
  if (burden <= 2) return 'easy'
  if (burden <= 7) return 'moderate'
  return 'hard'
}

function computePriority(item) {
  let score = 0
  if (!item.indexableNow) score += 40
  score += item.failingReasons.length * 6
  score += item.missingClaimSources.length * 3
  score += item.missingFields.length * 2
  if (item.missingResearchEnrichment) score += 10
  if (item.missingSourceLinks) score += 10
  if (item.failingReasons.includes('invalidNameOrSlug')) score += 15
  return Math.min(100, score)
}

function topCounts(items, key, limit = 25) {
  return Object.entries(
    items.reduce((acc, entry) => {
      for (const value of entry[key] || []) acc[value] = (acc[value] || 0) + 1
      return acc
    }, {}),
  )
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([name, count]) => ({ name, count }))
}

function run() {
  const herbs = readJson('public/data/herbs.json')
  const compounds = readJson('public/data/compounds.json')
  const sourceRegistry = readJson('public/data/source-registry.json')
  const sourceRegistryIdSet = new Set(sourceRegistry.map(item => item.sourceId))
  const herbSourceBuckets = sourceCountBuckets(herbs.map(record => [record?.sources, record?.source, record?.references, record?.citations]))
  const compoundSourceBuckets = sourceCountBuckets(
    compounds.map(record => [record?.sources, record?.source, record?.references, record?.citations]),
  )

  const detailMaps = {
    herbs: new Map(),
    compounds: new Map(),
  }

  for (const type of ['herbs', 'compounds']) {
    const dir = path.join(ROOT, 'public', 'data', `${type}-detail`)
    const files = fs.existsSync(dir) ? fs.readdirSync(dir).filter(f => f.endsWith('.json')) : []
    for (const file of files) {
      const slug = file.replace(/\.json$/, '')
      const relPath = path.join('public', 'data', `${type}-detail`, file)
      try {
        detailMaps[type].set(slug, { payload: readJson(relPath), relPath })
      } catch (error) {
        detailMaps[type].set(slug, { parseError: String(error), relPath })
      }
    }
  }

  const inventory = []
  const missingDetailFiles = []

  const processEntity = (record, type) => {
    const audit = auditEntity(record, type)
    const displayName = asText(record?.displayName || record?.name || record?.latin || audit.slug)
    const item = {
      entityType: type.slice(0, -1),
      entitySlug: audit.slug,
      displayName,
      indexableNow: audit.passesIndexThreshold,
      failingReasons: [...audit.exclusionReasons],
      missingFields: [],
      placeholderFields: [],
      malformedFields: [],
      weakFields: [],
      missingResearchEnrichment: false,
      missingSourceLinks: false,
      missingClaimSources: [],
      estimatedDifficulty: 'moderate',
      likelyFixType: 'mixed',
      priorityScore: 0,
      notes: [],
    }

    for (const field of REQUIRED_BASE_FIELDS) {
      const value = record?.[field]
      if (value === undefined || value === null) {
        item.missingFields.push(field)
        continue
      }
      if (typeof value === 'string' && !asText(value)) item.missingFields.push(field)
      if (Array.isArray(value) && value.length === 0) item.missingFields.push(field)
    }

    for (const [key, value] of Object.entries(record)) {
      if (value === null) pushUnique(item.missingFields, key)
      if (typeof value === 'string') {
        const trimmed = asText(value)
        if (!trimmed) pushUnique(item.missingFields, key)
        if (NAN_PATTERN.test(trimmed)) pushUnique(item.malformedFields, `${key}:nan`)
        const labels = detectPlaceholderLabels(trimmed)
        if (labels.length) pushUnique(item.placeholderFields, `${key}:${labels.join('|')}`)
      } else if (Array.isArray(value)) {
        for (const [idx, part] of value.entries()) {
          if (part === null || part === undefined || (typeof part === 'string' && !asText(part))) {
            pushUnique(item.missingFields, `${key}[${idx}]`)
          }
          if (typeof part === 'string' && NAN_PATTERN.test(part)) pushUnique(item.malformedFields, `${key}[${idx}]:nan`)
          if (typeof part === 'string') {
            const labels = detectPlaceholderLabels(part)
            if (labels.length) pushUnique(item.placeholderFields, `${key}[${idx}]:${labels.join('|')}`)
          }
        }
      }
    }

    if (!Array.isArray(record?.effects)) item.malformedFields.push('effects:not-array')
    if (!Array.isArray(record?.sources)) item.malformedFields.push('sources:not-array')

    if (!audit.flags.hasUsableDescription) {
      item.weakFields.push('description/summary/mechanism')
    }
    if (audit.flags.effectCount < QUALITY_THRESHOLDS.minEffects) {
      item.weakFields.push('effects')
    }

    const detail = detailMaps[type].get(audit.slug)
    if (!detail) {
      item.failingReasons.push('missingDetailFile')
      item.missingResearchEnrichment = true
      item.missingSourceLinks = true
      item.notes.push(`Missing detail file: public/data/${type}-detail/${audit.slug}.json`)
      missingDetailFiles.push({ entityType: type.slice(0, -1), entitySlug: audit.slug })
    } else if (detail.parseError) {
      item.failingReasons.push('malformedDetailFile')
      item.malformedFields.push(`detail file parse error: ${detail.relPath}`)
      item.missingResearchEnrichment = true
      item.missingSourceLinks = true
    } else {
      const enrichment = detail.payload?.researchEnrichment
      if (!enrichment || typeof enrichment !== 'object') {
        item.missingResearchEnrichment = true
        item.missingSourceLinks = true
        item.failingReasons.push('missingResearchEnrichment')
      } else {
        const sourceRegistryIds = Array.isArray(enrichment.sourceRegistryIds) ? enrichment.sourceRegistryIds : []
        if (!Array.isArray(enrichment.sourceRegistryIds)) item.malformedFields.push('researchEnrichment.sourceRegistryIds:not-array')
        if (sourceRegistryIds.length === 0) {
          item.missingSourceLinks = true
          item.failingReasons.push('missingSourceRegistryIds')
        }

        const localRefs = Array.isArray(enrichment.sourceRefs) ? enrichment.sourceRefs : []
        const declaredSourceIdSet = new Set(sourceRegistryIds)
        for (const sourceId of sourceRegistryIds) {
          if (!sourceRegistryIdSet.has(sourceId)) {
            item.missingSourceLinks = true
            item.malformedFields.push(`researchEnrichment.sourceRegistryIds:unknown:${sourceId}`)
          }
        }

        for (const ref of localRefs) {
          if (!declaredSourceIdSet.has(ref?.sourceId)) {
            item.missingSourceLinks = true
            item.malformedFields.push(`researchEnrichment.sourceRefs.unlinked:${ref?.sourceId || 'missing'}`)
          }
        }

        for (const field of CLAIM_ARRAY_FIELDS) {
          const claims = enrichment[field]
          if (claims === undefined) {
            item.missingFields.push(`researchEnrichment.${field}`)
            continue
          }
          if (!Array.isArray(claims)) {
            item.malformedFields.push(`researchEnrichment.${field}:not-array`)
            continue
          }
          claims.forEach((claim, idx) => {
            const ids = Array.isArray(claim?.sourceRefIds) ? claim.sourceRefIds : null
            if (!ids || ids.length === 0) {
              item.missingClaimSources.push(`${field}[${idx}]`)
              return
            }
            for (const refId of ids) {
              if (!declaredSourceIdSet.has(refId)) {
                item.missingClaimSources.push(`${field}[${idx}]:${refId}`)
              }
            }
          })
        }
      }
    }

    if (item.missingClaimSources.length > 0) {
      item.missingSourceLinks = true
      item.failingReasons.push('claimsMissingSources')
    }

    item.estimatedDifficulty = estimateDifficulty(item)
    item.likelyFixType = classifyFixType(item)
    item.priorityScore = computePriority(item)
    item.notes = item.notes.join(' | ')

    inventory.push(item)
  }

  herbs.forEach(record => processEntity(record, 'herbs'))
  compounds.forEach(record => processEntity(record, 'compounds'))

  const herbItems = inventory.filter(item => item.entityType === 'herb')
  const compoundItems = inventory.filter(item => item.entityType === 'compound')
  const nonIndexable = inventory.filter(item => !item.indexableNow)

  const placeholderCounts = {}
  for (const item of inventory) {
    for (const field of item.placeholderFields) {
      const labelPart = field.split(':').slice(1).join(':')
      for (const part of labelPart.split('|')) {
        if (!part) continue
        placeholderCounts[part] = (placeholderCounts[part] || 0) + 1
      }
    }
  }

  const closestToPassing = nonIndexable
    .map(item => ({ ...item, burden: item.failingReasons.length + item.missingFields.length + item.missingClaimSources.length }))
    .sort((a, b) => a.burden - b.burden || b.priorityScore - a.priorityScore)
    .slice(0, 25)
    .map(item => ({
      entityType: item.entityType,
      entitySlug: item.entitySlug,
      displayName: item.displayName,
      burden: item.burden,
      failingReasons: item.failingReasons,
    }))

  const blockedIdentity = inventory.filter(item => item.failingReasons.includes('invalidNameOrSlug'))
  const blockedMissingSources = inventory.filter(item => item.missingSourceLinks && item.weakFields.length === 0)
  const blockedWeakNarrative = inventory.filter(item => item.weakFields.length > 0 && !item.missingSourceLinks)
  const brokenSourceLinkage = inventory.filter(item => item.missingSourceLinks || item.missingClaimSources.length > 0)

  const summary = {
    generatedAt: new Date().toISOString(),
    totals: {
      herbs: herbItems.length,
      compounds: compoundItems.length,
      herbIndexable: herbItems.filter(item => item.indexableNow).length,
      compoundIndexable: compoundItems.filter(item => item.indexableNow).length,
      entitiesWithMissingField: inventory.filter(item => item.missingFields.length > 0).length,
      entitiesWithPlaceholder: inventory.filter(item => item.placeholderFields.length > 0).length,
      entitiesMissingEnrichment: inventory.filter(item => item.missingResearchEnrichment).length,
      entitiesMissingSourceLinkage: inventory.filter(item => item.missingSourceLinks).length,
    },
    grouped: {
      topMissingFieldsHerbs: topCounts(herbItems, 'missingFields'),
      topMissingFieldsCompounds: topCounts(compoundItems, 'missingFields'),
      mostCommonPlaceholderPatterns: Object.entries(placeholderCounts)
        .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
        .map(([pattern, count]) => ({ pattern, count })),
      entitiesClosestToPassing: closestToPassing,
      entitiesBlockedByCorruptedIdentity: blockedIdentity.map(item => ({ entityType: item.entityType, entitySlug: item.entitySlug, displayName: item.displayName })),
      entitiesBlockedMainlyByMissingSources: blockedMissingSources.map(item => ({ entityType: item.entityType, entitySlug: item.entitySlug, displayName: item.displayName })),
      entitiesBlockedMainlyByWeakNarrativeQuality: blockedWeakNarrative.map(item => ({ entityType: item.entityType, entitySlug: item.entitySlug, displayName: item.displayName })),
      entitiesWithMissingDetailFiles: missingDetailFiles,
      entitiesWithBrokenSourceLinkage: brokenSourceLinkage.map(item => ({ entityType: item.entityType, entitySlug: item.entitySlug, displayName: item.displayName })),
    },
    top25Easiest: inventory
      .slice()
      .sort((a, b) => a.priorityScore - b.priorityScore || a.entitySlug.localeCompare(b.entitySlug))
      .slice(0, 25)
      .map(item => ({ entityType: item.entityType, entitySlug: item.entitySlug, displayName: item.displayName, priorityScore: item.priorityScore, estimatedDifficulty: item.estimatedDifficulty })),
    top25Hardest: inventory
      .slice()
      .sort((a, b) => b.priorityScore - a.priorityScore || a.entitySlug.localeCompare(b.entitySlug))
      .slice(0, 25)
      .map(item => ({ entityType: item.entityType, entitySlug: item.entitySlug, displayName: item.displayName, priorityScore: item.priorityScore, estimatedDifficulty: item.estimatedDifficulty })),
    recommendedNextActionBuckets: {
      source_discovery: inventory.filter(item => item.likelyFixType === 'source-discovery').length,
      narrative_rewrite_from_existing_sources: inventory.filter(item => item.likelyFixType === 'narrative-rewrite-from-existing-sources').length,
      schema_repair: inventory.filter(item => item.likelyFixType === 'schema-repair').length,
      identity_repair: inventory.filter(item => item.likelyFixType === 'identity-repair').length,
      mixed: inventory.filter(item => item.likelyFixType === 'mixed').length,
    },
  }

  const mdLines = [
    '# Full Missing Data Inventory',
    '',
    `Generated at: ${summary.generatedAt}`,
    '',
    '## Counts',
    `- total herb count: ${summary.totals.herbs}`,
    `- total compound count: ${summary.totals.compounds}`,
    `- herb indexable count: ${summary.totals.herbIndexable}`,
    `- compound indexable count: ${summary.totals.compoundIndexable}`,
    `- number of entities with at least one missing field: ${summary.totals.entitiesWithMissingField}`,
    `- number of entities with placeholder fields: ${summary.totals.entitiesWithPlaceholder}`,
    `- number of entities with missing enrichment: ${summary.totals.entitiesMissingEnrichment}`,
    `- number of entities with missing source linkage: ${summary.totals.entitiesMissingSourceLinkage}`,
    '',
    '## Top 25 easiest entities to fix',
    ...summary.top25Easiest.map(
      item => `- ${item.entityType}:${item.entitySlug} (${item.displayName}) — priority=${item.priorityScore}, difficulty=${item.estimatedDifficulty}`,
    ),
    '',
    '## Top 25 hardest entities',
    ...summary.top25Hardest.map(
      item => `- ${item.entityType}:${item.entitySlug} (${item.displayName}) — priority=${item.priorityScore}, difficulty=${item.estimatedDifficulty}`,
    ),
    '',
    '## Recommended next-action buckets',
    `- source-discovery: ${summary.recommendedNextActionBuckets.source_discovery}`,
    `- narrative-rewrite-from-existing-sources: ${summary.recommendedNextActionBuckets.narrative_rewrite_from_existing_sources}`,
    `- schema-repair: ${summary.recommendedNextActionBuckets.schema_repair}`,
    `- identity-repair: ${summary.recommendedNextActionBuckets.identity_repair}`,
    `- mixed: ${summary.recommendedNextActionBuckets.mixed}`,
    '',
    '## Top missing fields across herbs',
    ...summary.grouped.topMissingFieldsHerbs.slice(0, 25).map(row => `- ${row.name}: ${row.count}`),
    '',
    '## Top missing fields across compounds',
    ...summary.grouped.topMissingFieldsCompounds.slice(0, 25).map(row => `- ${row.name}: ${row.count}`),
    '',
    '## Most common placeholder patterns',
    ...summary.grouped.mostCommonPlaceholderPatterns.slice(0, 25).map(row => `- ${row.pattern}: ${row.count}`),
  ]

  writeJson('ops/reports/full-missing-data-inventory.json', inventory)
  writeJson('ops/reports/full-missing-data-summary.json', summary)
  writeText('ops/reports/full-missing-data-inventory.md', mdLines.join('\n') + '\n')

  console.log(`[full-missing-data-inventory] inventory=${inventory.length} herbs=${herbItems.length} compounds=${compoundItems.length}`)
  console.log(
    `[full-missing-data-inventory] herbs normalized-sources zero=${herbSourceBuckets.zero} one=${herbSourceBuckets.one} twoPlus=${herbSourceBuckets.twoOrMore}`
  )
  console.log(
    `[full-missing-data-inventory] compounds normalized-sources zero=${compoundSourceBuckets.zero} one=${compoundSourceBuckets.one} twoPlus=${compoundSourceBuckets.twoOrMore}`
  )
}

run()
