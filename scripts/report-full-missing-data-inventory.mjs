import fs from 'node:fs'
import path from 'node:path'
import Ajv2020 from 'ajv/dist/2020.js'
import addFormats from 'ajv-formats'
import { countBootstrapSources, sourceCountBuckets } from './source-normalization.mjs'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')

const QUALITY_THRESHOLDS = {
  minDescriptionLength: 30,
  minSources: 2,
  minEffects: 1,
  minCompletenessScore: 0.4,
  minSlugLength: 2,
}

const PLACEHOLDER_PATTERNS = [
  /\bno direct\b/i,
  /\bcontextual inference\b/i,
  /\bnot established\b/i,
  /\binsufficient data\b/i,
  /\bunknown\b/i,
  /\[object\s+object\]/i,
  /\bplaceholder\b/i,
  /\btbd\b/i,
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

const REQUIRED_FIELDS_BY_TYPE = {
  herb: ['name', 'slug', 'id', 'effects', 'sources'],
  compound: ['name', 'slug', 'id', 'effects', 'sources'],
}

const EXPECTED_ARRAY_FIELDS_BY_TYPE = {
  herb: ['effects', 'contraindications', 'interactions', 'sources', 'activeCompounds', 'aliases', 'slugAliases'],
  compound: ['herbs', 'effects', 'contraindications', 'sources'],
}

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const asArray = value => (Array.isArray(value) ? value : [])
const asText = value => String(value ?? '').trim()

function readJson(relPath) {
  return JSON.parse(fs.readFileSync(path.join(ROOT, relPath), 'utf8'))
}

function readJsonAbsolute(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function countSources(record) {
  return countBootstrapSources([record?.sources, record?.source, record?.references, record?.citations])
}

function countEffects(record) {
  return asArray(record?.effects)
    .map(asText)
    .filter(Boolean)
    .filter(text => !NAN_PATTERN.test(text))
    .filter(text => !PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))).length
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
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(corpus))
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
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(narrative))) return false
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
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(name))) return false
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

function auditEntity(record, typePlural) {
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

  return { slug, name, flags, completenessScore, passesIndexThreshold, exclusionReasons, typePlural }
}

function pushIssue(list, field, issue, sample) {
  list.push({ field, issue, sample: asText(sample).slice(0, 180) || null })
}

function classifyDifficulty(item) {
  if (item.failingReasons.includes('invalidNameOrSlug') || item.failingReasons.includes('nanArtifacts')) return 'blocked-human-review'
  if (item.malformedFields.length >= 3) return 'hard'
  if (item.missingClaimSources.length >= 4 || item.missingSourceLinks) return 'hard'
  const burden = item.missingFields.length + item.placeholderFields.length + item.weakFields.length
  if (burden <= 2) return 'easy'
  if (burden <= 6) return 'moderate'
  return 'hard'
}

function classifyFixType(item) {
  const hasSchema = item.malformedFields.some(f => f.field.includes('researchEnrichment') || f.issue.includes('schema'))
  const hasIdentity = item.failingReasons.includes('invalidNameOrSlug') || item.failingReasons.includes('nanArtifacts')
  const hasSources = item.missingSourceLinks || item.missingClaimSources.length > 0
  const hasNarrative = item.weakFields.length > 0 || item.failingReasons.includes('weakDescription')

  const kinds = [hasSchema, hasIdentity, hasSources, hasNarrative].filter(Boolean).length
  if (kinds > 1) return 'mixed'
  if (hasIdentity) return 'identity-repair'
  if (hasSchema) return 'schema-repair'
  if (hasSources) return 'source-discovery'
  return 'narrative-rewrite-from-existing-sources'
}

function priorityScore(item) {
  let score = item.indexableNow ? 40 : 60
  score -= item.failingReasons.length * 8
  score -= item.missingFields.length * 3
  score -= item.placeholderFields.length * 2
  score -= item.malformedFields.length * 4
  score -= item.weakFields.length * 3
  if (item.missingResearchEnrichment) score -= 12
  if (item.missingSourceLinks) score -= 8
  score -= item.missingClaimSources.length * 2
  return Math.max(0, Math.min(100, score))
}

function getDetailMap(dirPath) {
  if (!fs.existsSync(dirPath)) return new Map()
  const entries = fs.readdirSync(dirPath).filter(name => name.endsWith('.json'))
  const map = new Map()
  for (const file of entries) {
    const slug = file.replace(/\.json$/, '')
    map.set(slug, {
      file: path.join(dirPath, file),
      relPath: path.relative(ROOT, path.join(dirPath, file)),
      payload: readJsonAbsolute(path.join(dirPath, file)),
    })
  }
  return map
}

function increment(map, key) {
  map.set(key, (map.get(key) || 0) + 1)
}

function run() {
  const herbs = readJson('public/data/herbs.json')
  const compounds = readJson('public/data/compounds.json')
  const sourceRegistry = readJson('public/data/source-registry.json')
  const qualityReport = readJson('public/data/quality-report.json')

  const sourceIdSet = new Set(sourceRegistry.map(entry => entry.sourceId))
  const herbSourceBuckets = sourceCountBuckets(herbs.map(record => [record?.sources, record?.source, record?.references, record?.citations]))
  const compoundSourceBuckets = sourceCountBuckets(
    compounds.map(record => [record?.sources, record?.source, record?.references, record?.citations]),
  )

  const herbDetailMap = getDetailMap(path.join(ROOT, 'public', 'data', 'herbs-detail'))
  const compoundDetailMap = getDetailMap(path.join(ROOT, 'public', 'data', 'compounds-detail'))

  const schema = readJson('schemas/research-enrichment.schema.json')
  const ajv = new Ajv2020({ allErrors: true, strict: true, strictRequired: true })
  addFormats(ajv)
  const validateEnrichment = ajv.compile(schema)

  const placeholderPatternCounts = new Map()
  const missingHerbFieldCounts = new Map()
  const missingCompoundFieldCounts = new Map()
  const missingDetailFiles = []
  const brokenSourceLinkage = []

  const inventory = []

  const datasets = [
    { type: 'herb', typePlural: 'herbs', records: herbs, detailMap: herbDetailMap, missingFieldCounts: missingHerbFieldCounts },
    {
      type: 'compound',
      typePlural: 'compounds',
      records: compounds,
      detailMap: compoundDetailMap,
      missingFieldCounts: missingCompoundFieldCounts,
    },
  ]

  for (const set of datasets) {
    for (const record of set.records) {
      const audit = auditEntity(record, set.typePlural)
      const slug = audit.slug
      const displayName = asText(record?.displayName || record?.name || record?.latin || slug)
      const missingFields = []
      const placeholderFields = []
      const malformedFields = []
      const weakFields = []
      const missingClaimSources = []

      for (const field of REQUIRED_FIELDS_BY_TYPE[set.type]) {
        const value = record?.[field]
        const missing =
          value == null ||
          (typeof value === 'string' && asText(value).length === 0) ||
          (Array.isArray(value) && value.length === 0)
        if (missing) {
          pushIssue(missingFields, field, 'missing required field', value)
          increment(set.missingFieldCounts, field)
        }
      }

      for (const [field, value] of Object.entries(record)) {
        if (value == null) {
          pushIssue(missingFields, field, 'null field', value)
          continue
        }
        if (typeof value === 'string' && asText(value).length === 0) {
          pushIssue(missingFields, field, 'blank string', value)
          continue
        }
        if (typeof value === 'string') {
          const matched = PLACEHOLDER_PATTERNS.find(pattern => pattern.test(value))
          if (matched) {
            pushIssue(placeholderFields, field, 'placeholder pattern', value)
            increment(placeholderPatternCounts, matched.toString())
          }
          if (NAN_PATTERN.test(value) || /^\[object\s+object\]$/i.test(value)) {
            pushIssue(malformedFields, field, 'nan or object-string artifact', value)
          }
        }
      }

      for (const arrayField of EXPECTED_ARRAY_FIELDS_BY_TYPE[set.type]) {
        const value = record?.[arrayField]
        if (value == null) continue
        if (!Array.isArray(value)) {
          pushIssue(malformedFields, arrayField, 'expected array', typeof value)
          continue
        }
        const badItem = value.find(item => typeof item !== 'string' && typeof item !== 'object')
        if (badItem !== undefined) pushIssue(malformedFields, arrayField, 'malformed array item', typeof badItem)
      }

      if (!audit.flags.hasUsableDescription) {
        pushIssue(weakFields, 'description|summary|mechanism', 'fails quality threshold', `${record?.description || ''} ${record?.mechanism || ''}`)
      }
      if (audit.flags.hasPlaceholderText) {
        pushIssue(weakFields, 'narrativeText', 'contains placeholder context language', collectTextFields(record).slice(0, 180))
      }

      const detail = set.detailMap.get(slug)
      let missingResearchEnrichment = false
      let missingSourceLinks = false

      if (!detail) {
        missingResearchEnrichment = true
        missingSourceLinks = true
        missingDetailFiles.push({ entityType: set.type, entitySlug: slug })
        pushIssue(missingFields, 'detailFile', 'missing detail JSON file', `${set.typePlural}-detail/${slug}.json`)
      } else {
        const enrichment = detail.payload?.researchEnrichment
        if (!enrichment) {
          missingResearchEnrichment = true
          missingSourceLinks = true
          pushIssue(missingFields, 'researchEnrichment', 'missing researchEnrichment object', detail.relPath)
        } else {
          const valid = validateEnrichment(enrichment)
          if (!valid) {
            for (const err of validateEnrichment.errors || []) {
              pushIssue(malformedFields, `researchEnrichment${err.instancePath || ''}`, `schema: ${err.message}`, err.keyword)
            }
          }

          const sourceRegistryIds = Array.isArray(enrichment.sourceRegistryIds) ? enrichment.sourceRegistryIds : []
          if (sourceRegistryIds.length === 0) {
            missingSourceLinks = true
            pushIssue(missingFields, 'researchEnrichment.sourceRegistryIds', 'missing source registry links', detail.relPath)
          }

          const availableSourceIds = new Set(sourceRegistryIds)
          for (const sourceId of sourceRegistryIds) {
            if (!sourceIdSet.has(sourceId)) {
              missingSourceLinks = true
              pushIssue(malformedFields, 'researchEnrichment.sourceRegistryIds', 'unknown sourceId in registry link', sourceId)
            }
          }

          for (const field of CLAIM_ARRAY_FIELDS) {
            const claims = enrichment[field]
            if (claims == null) continue
            if (!Array.isArray(claims)) {
              pushIssue(malformedFields, `researchEnrichment.${field}`, 'claim field must be array', typeof claims)
              continue
            }
            for (let i = 0; i < claims.length; i += 1) {
              const claim = claims[i]
              if (!claim || typeof claim !== 'object') {
                pushIssue(malformedFields, `researchEnrichment.${field}[${i}]`, 'claim entry must be object', typeof claim)
                continue
              }
              if (!Array.isArray(claim.sourceRefIds) || claim.sourceRefIds.length === 0) {
                missingClaimSources.push(`${field}[${i}]`)
                continue
              }
              for (const srcId of claim.sourceRefIds) {
                if (!availableSourceIds.has(srcId)) {
                  missingClaimSources.push(`${field}[${i}]=>${srcId}`)
                  missingSourceLinks = true
                }
              }
            }
          }
        }
      }

      const failingReasons = [...audit.exclusionReasons]
      if (missingResearchEnrichment) failingReasons.push('missingResearchEnrichment')
      if (missingSourceLinks) failingReasons.push('missingSourceLinks')
      if (missingClaimSources.length > 0) failingReasons.push('missingClaimSources')

      const item = {
        entityType: set.type,
        entitySlug: slug,
        displayName,
        indexableNow: audit.passesIndexThreshold,
        failingReasons: [...new Set(failingReasons)],
        missingFields,
        placeholderFields,
        malformedFields,
        weakFields,
        missingResearchEnrichment,
        missingSourceLinks,
        missingClaimSources: [...new Set(missingClaimSources)],
        estimatedDifficulty: 'moderate',
        likelyFixType: 'mixed',
        priorityScore: 0,
        notes: [],
      }

      if (!detail) item.notes.push('Detail file missing; cannot attach enrichment or source linkage.')
      if (item.indexableNow && item.failingReasons.length > 0) item.notes.push('Passes current quality gate but still blocked for enrichment/source completeness.')

      item.estimatedDifficulty = classifyDifficulty(item)
      item.likelyFixType = classifyFixType(item)
      item.priorityScore = priorityScore(item)

      if (item.missingSourceLinks || item.missingClaimSources.length > 0) {
        brokenSourceLinkage.push({ entityType: set.type, entitySlug: slug })
      }

      inventory.push(item)
    }
  }

  const herbsInventory = inventory.filter(item => item.entityType === 'herb')
  const compoundsInventory = inventory.filter(item => item.entityType === 'compound')

  const sortCountMap = map =>
    [...map.entries()]
      .map(([field, count]) => ({ field, count }))
      .sort((a, b) => b.count - a.count)

  const entitiesClosestToPassing = inventory
    .filter(item => !item.indexableNow)
    .map(item => ({ item, blockers: item.failingReasons.length + item.missingFields.length + item.malformedFields.length + item.weakFields.length }))
    .sort((a, b) => a.blockers - b.blockers || b.item.priorityScore - a.item.priorityScore)
    .slice(0, 50)
    .map(({ item, blockers }) => ({ entityType: item.entityType, entitySlug: item.entitySlug, blockers, priorityScore: item.priorityScore }))

  const summary = {
    generatedAt: new Date().toISOString(),
    qualityGateSnapshot: qualityReport,
    totals: {
      herbs: herbs.length,
      compounds: compounds.length,
      herbIndexable: herbsInventory.filter(i => i.indexableNow).length,
      compoundIndexable: compoundsInventory.filter(i => i.indexableNow).length,
      withMissingField: inventory.filter(i => i.missingFields.length > 0).length,
      withPlaceholderFields: inventory.filter(i => i.placeholderFields.length > 0).length,
      withMissingEnrichment: inventory.filter(i => i.missingResearchEnrichment).length,
      withMissingSourceLinkage: inventory.filter(i => i.missingSourceLinks).length,
    },
    grouped: {
      topMissingFieldsHerbs: sortCountMap(missingHerbFieldCounts),
      topMissingFieldsCompounds: sortCountMap(missingCompoundFieldCounts),
      mostCommonPlaceholderPatterns: sortCountMap(placeholderPatternCounts),
      entitiesClosestToPassing,
      entitiesBlockedByCorruptedIdentity: inventory
        .filter(i => i.failingReasons.includes('invalidNameOrSlug') || i.failingReasons.includes('nanArtifacts'))
        .map(i => ({ entityType: i.entityType, entitySlug: i.entitySlug, displayName: i.displayName })),
      entitiesBlockedMainlyByMissingSources: inventory
        .filter(i => i.missingSourceLinks || i.missingClaimSources.length > 0)
        .map(i => ({ entityType: i.entityType, entitySlug: i.entitySlug, missingClaimSources: i.missingClaimSources.length })),
      entitiesBlockedMainlyByWeakNarrativeQuality: inventory
        .filter(i => i.weakFields.length > 0 || i.failingReasons.includes('weakDescription'))
        .map(i => ({ entityType: i.entityType, entitySlug: i.entitySlug })),
      entitiesWithMissingDetailFiles: missingDetailFiles,
      entitiesWithBrokenSourceLinkage: brokenSourceLinkage,
    },
    top25Easiest: [...inventory]
      .sort((a, b) => {
        const rank = { easy: 0, moderate: 1, hard: 2, 'blocked-human-review': 3 }
        return rank[a.estimatedDifficulty] - rank[b.estimatedDifficulty] || b.priorityScore - a.priorityScore
      })
      .slice(0, 25)
      .map(i => ({ entityType: i.entityType, entitySlug: i.entitySlug, difficulty: i.estimatedDifficulty, priorityScore: i.priorityScore })),
    top25Hardest: [...inventory]
      .sort((a, b) => {
        const rank = { 'blocked-human-review': 0, hard: 1, moderate: 2, easy: 3 }
        return rank[a.estimatedDifficulty] - rank[b.estimatedDifficulty] || a.priorityScore - b.priorityScore
      })
      .slice(0, 25)
      .map(i => ({ entityType: i.entityType, entitySlug: i.entitySlug, difficulty: i.estimatedDifficulty, priorityScore: i.priorityScore })),
    recommendedNextActionBuckets: {
      sourceDiscovery: inventory.filter(i => i.likelyFixType === 'source-discovery' || i.likelyFixType === 'mixed').length,
      narrativeRewriteFromExistingSources: inventory.filter(i => i.likelyFixType === 'narrative-rewrite-from-existing-sources').length,
      schemaRepair: inventory.filter(i => i.likelyFixType === 'schema-repair' || i.likelyFixType === 'mixed').length,
      identityRepair: inventory.filter(i => i.likelyFixType === 'identity-repair' || i.likelyFixType === 'mixed').length,
    },
  }

  const lines = [
    '# Full Missing Data Inventory',
    '',
    `Generated at: ${summary.generatedAt}`,
    '',
    '## Counts',
    `- Total herb count: ${summary.totals.herbs}`,
    `- Total compound count: ${summary.totals.compounds}`,
    `- Herb indexable count: ${summary.totals.herbIndexable}`,
    `- Compound indexable count: ${summary.totals.compoundIndexable}`,
    `- Entities with at least one missing field: ${summary.totals.withMissingField}`,
    `- Entities with placeholder fields: ${summary.totals.withPlaceholderFields}`,
    `- Entities with missing enrichment: ${summary.totals.withMissingEnrichment}`,
    `- Entities with missing source linkage: ${summary.totals.withMissingSourceLinkage}`,
    '',
    '## Top missing fields (herbs)',
    ...summary.grouped.topMissingFieldsHerbs.slice(0, 20).map(item => `- ${item.field}: ${item.count}`),
    '',
    '## Top missing fields (compounds)',
    ...summary.grouped.topMissingFieldsCompounds.slice(0, 20).map(item => `- ${item.field}: ${item.count}`),
    '',
    '## Most common placeholder patterns',
    ...summary.grouped.mostCommonPlaceholderPatterns.slice(0, 20).map(item => `- ${item.field}: ${item.count}`),
    '',
    '## Top 25 easiest entities to fix',
    ...summary.top25Easiest.map(item => `- ${item.entityType}:${item.entitySlug} (${item.difficulty}, priority=${item.priorityScore})`),
    '',
    '## Top 25 hardest entities',
    ...summary.top25Hardest.map(item => `- ${item.entityType}:${item.entitySlug} (${item.difficulty}, priority=${item.priorityScore})`),
    '',
    '## Recommended next-action buckets',
    `- source-discovery: ${summary.recommendedNextActionBuckets.sourceDiscovery}`,
    `- narrative-rewrite-from-existing-sources: ${summary.recommendedNextActionBuckets.narrativeRewriteFromExistingSources}`,
    `- schema-repair: ${summary.recommendedNextActionBuckets.schemaRepair}`,
    `- identity-repair: ${summary.recommendedNextActionBuckets.identityRepair}`,
  ]

  fs.mkdirSync(REPORT_DIR, { recursive: true })
  fs.writeFileSync(path.join(REPORT_DIR, 'full-missing-data-inventory.json'), `${JSON.stringify(inventory, null, 2)}\n`, 'utf8')
  fs.writeFileSync(path.join(REPORT_DIR, 'full-missing-data-summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8')
  fs.writeFileSync(path.join(REPORT_DIR, 'full-missing-data-inventory.md'), `${lines.join('\n')}\n`, 'utf8')

  console.log(`[full-missing-data-inventory] wrote inventory=${inventory.length}`)
  console.log(
    `[full-missing-data-inventory] herbs=${summary.totals.herbs} compounds=${summary.totals.compounds} missingEnrichment=${summary.totals.withMissingEnrichment}`,
  )
  console.log(
    `[full-missing-data-inventory] herbs normalized-sources zero=${herbSourceBuckets.zero} one=${herbSourceBuckets.one} twoPlus=${herbSourceBuckets.twoOrMore}`
  )
  console.log(
    `[full-missing-data-inventory] compounds normalized-sources zero=${compoundSourceBuckets.zero} one=${compoundSourceBuckets.one} twoPlus=${compoundSourceBuckets.twoOrMore}`
  )
}

run()
