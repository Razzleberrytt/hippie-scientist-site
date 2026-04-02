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
  /\bno direct\b/i,
  /\bcontextual inference\b/i,
  /\bnot established\b/i,
  /\binsufficient data\b/i,
  /\bunknown\b/i,
  /\[object\s+object\]/i,
  /\bplaceholder\b/i,
]

const NAN_PATTERN = /(^|[^a-z0-9])nan([^a-z0-9]|$)/i
const INVALID_NAME_PATTERN = /^(?:nan|null|undefined|n\/a)$/i
const NUMERIC_ONLY_NAME = /^\d+(?:[\s.,/-]\d+)*$/
const VALID_NAME_CHARS = /^[\p{L}\p{N}][\p{L}\p{N}\s\-,'()./]*[\p{L}\p{N})]$/u

const slugify = value =>
  String(value || '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function readJson(relativePath) {
  const fullPath = path.join(ROOT, relativePath)
  const raw = fs.readFileSync(fullPath, 'utf8')
  return JSON.parse(raw)
}

function writeJson(relativePath, data) {
  const fullPath = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(fullPath), { recursive: true })
  fs.writeFileSync(fullPath, JSON.stringify(data, null, 2) + '\n', 'utf8')
}

const asArray = value => (Array.isArray(value) ? value : [])
const asText = value => String(value || '').trim()
const clip = (value, max = 155) => asText(value).slice(0, max)

function normalizeDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
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

function tierFromScore(score) {
  if (score <= 25) return 'stub'
  if (score <= 50) return 'partial'
  return 'full'
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
  const route = `/${type}/${slug}`

  const flags = {
    hasValidName: hasValidName(record),
    hasUsableDescription: hasUsableDescription(record),
    hasPlaceholderText: hasPlaceholderText(record),
    hasNanArtifacts: hasNanArtifacts(record),
    sourceCount: countSources(record),
    effectCount: countEffects(record),
  }

  const completenessScore = scoreRecord(record)
  const tier = tierFromScore(completenessScore)
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

  return {
    slug,
    route,
    name,
    flags,
    completenessScore,
    tier,
    passesIndexThreshold,
    exclusionReasons,
  }
}


function buildPublicationEntry(record, type, audit) {
  const displayName = asText(record?.commonName || record?.common || record?.name || record?.latinName || record?.latin || audit.slug)
  const descriptionCandidate = asText(record?.summary || record?.description || record?.mechanism)
  const description = clip(
    PLACEHOLDER_PATTERNS.some(pattern => pattern.test(descriptionCandidate))
      ? `${displayName} reference profile.`
      : descriptionCandidate || `${displayName} reference profile.`
  )
  const lastmod =
    normalizeDate(record?.updated_at) ||
    normalizeDate(record?.lastmod) ||
    normalizeDate(record?.date) ||
    new Date().toISOString().slice(0, 10)

  return {
    slug: audit.slug,
    route: audit.route,
    name: displayName,
    kind: type,
    title: `${displayName} | The Hippie Scientist`,
    description,
    completenessScore: audit.completenessScore,
    tier: audit.tier,
    lastmod,
  }
}

function summarizeAudits(audits) {
  const excludedByReason = {}
  let indexable = 0

  for (const audit of audits) {
    if (audit.passesIndexThreshold) {
      indexable += 1
      continue
    }

    for (const reason of audit.exclusionReasons) {
      excludedByReason[reason] = (excludedByReason[reason] || 0) + 1
    }
  }

  return {
    total: audits.length,
    indexable,
    excluded: audits.length - indexable,
    excludedByReason,
  }
}

function auditBlogIndex(entries) {
  const total = entries.length
  let invalidSlug = 0
  let weakSummary = 0
  let placeholderText = 0
  let nanArtifacts = 0

  for (const entry of entries) {
    const slug = slugify(entry?.slug)
    const summary = asText(entry?.summary || entry?.description)
    const corpus = `${summary} ${asText(entry?.title)}`
    if (!slug) invalidSlug += 1
    if (summary.length < 40) weakSummary += 1
    if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(corpus))) placeholderText += 1
    if (NAN_PATTERN.test(corpus)) nanArtifacts += 1
  }

  return {
    total,
    invalidSlug,
    weakSummary,
    placeholderText,
    nanArtifacts,
  }
}

function run() {
  const herbs = readJson('public/data/herbs.json')
  const compounds = readJson('public/data/compounds.json')
  const blogIndex = readJson('public/blogdata/index.json')

  const herbAudits = herbs.map(record => auditEntity(record, 'herbs'))
  const compoundAudits = compounds.map(record => auditEntity(record, 'compounds'))

  const herbSummary = summarizeAudits(herbAudits)
  const compoundSummary = summarizeAudits(compoundAudits)
  const blogSummary = auditBlogIndex(asArray(blogIndex))
  const herbSourceBuckets = sourceCountBuckets(herbs.map(record => [record?.sources, record?.source, record?.references, record?.citations]))
  const compoundSourceBuckets = sourceCountBuckets(
    compounds.map(record => [record?.sources, record?.source, record?.references, record?.citations]),
  )

  const indexableHerbEntries = herbAudits
    .map((audit, index) => ({ audit, record: herbs[index] }))
    .filter(item => item.audit.passesIndexThreshold)
    .map(item => buildPublicationEntry(item.record, 'herb', item.audit))
    .sort((a, b) => b.completenessScore - a.completenessScore)

  const indexableCompoundEntries = compoundAudits
    .map((audit, index) => ({ audit, record: compounds[index] }))
    .filter(item => item.audit.passesIndexThreshold)
    .map(item => buildPublicationEntry(item.record, 'compound', item.audit))
    .sort((a, b) => b.completenessScore - a.completenessScore)

  const publicationManifest = {
    generatedAt: new Date().toISOString(),
    thresholds: QUALITY_THRESHOLDS,
    entities: {
      herbs: indexableHerbEntries,
      compounds: indexableCompoundEntries,
    },
    routes: {
      herbs: indexableHerbEntries.map(entry => entry.route),
      compounds: indexableCompoundEntries.map(entry => entry.route),
    },
    summaries: {
      herbs: herbSummary,
      compounds: compoundSummary,
      blogIndex: blogSummary,
    },
  }

  const qualityReport = {
    generatedAt: publicationManifest.generatedAt,
    thresholds: QUALITY_THRESHOLDS,
    herbs: herbSummary,
    compounds: compoundSummary,
    blogIndex: blogSummary,
  }

  writeJson('public/data/quality-report.json', qualityReport)
  writeJson('public/data/publication-manifest.json', publicationManifest)
  writeJson('public/data/indexable-herbs.json', indexableHerbEntries)
  writeJson('public/data/indexable-compounds.json', indexableCompoundEntries)

  console.log('[quality-gate] thresholds', JSON.stringify(QUALITY_THRESHOLDS))
  console.log(
    `[quality-gate] herbs total=${herbSummary.total} indexable=${herbSummary.indexable} excluded=${herbSummary.excluded}`
  )
  console.log(
    `[quality-gate] herbs normalized-sources zero=${herbSourceBuckets.zero} one=${herbSourceBuckets.one} twoPlus=${herbSourceBuckets.twoOrMore}`
  )
  Object.entries(herbSummary.excludedByReason).forEach(([reason, count]) => {
    console.log(`[quality-gate] herbs excluded ${reason}=${count}`)
  })

  console.log(
    `[quality-gate] compounds total=${compoundSummary.total} indexable=${compoundSummary.indexable} excluded=${compoundSummary.excluded}`
  )
  console.log(
    `[quality-gate] compounds normalized-sources zero=${compoundSourceBuckets.zero} one=${compoundSourceBuckets.one} twoPlus=${compoundSourceBuckets.twoOrMore}`
  )
  Object.entries(compoundSummary.excludedByReason).forEach(([reason, count]) => {
    console.log(`[quality-gate] compounds excluded ${reason}=${count}`)
  })

  console.log(
    `[quality-gate] blog-index total=${blogSummary.total} invalidSlug=${blogSummary.invalidSlug} weakSummary=${blogSummary.weakSummary}`
  )
}

run()
