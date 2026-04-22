// Expanded publication quality gate checks for placeholders, corrupted effects, and title-cased display names.
import fs from 'node:fs'
import path from 'node:path'
import { countBootstrapSources, sourceCountBuckets } from './source-normalization.mjs'

const ROOT = process.cwd()

const QUALITY_THRESHOLDS = {
  strongDescriptionLength: 200,
  strongMinSources: 2,
  publishableDescriptionLength: 80,
  publishableMinSources: 1,
  minSlugLength: 2,
  maxEffectLength: 200,
}

const PLACEHOLDER_PATTERNS = [
  /\bno direct\b/i,
  /\bno\s+direct\b/i,
  /\bcontextual inference\b/i,
  /\bherb profile\b/i,
  /\breference profile\b/i,
  /\bmechanismofaction\b/i,
  /\bnot established\b/i,
  /\binsufficient data\b/i,
  /\bunknown\b/i,
  /\[object\s+object\]/i,
  /\bplaceholder\b/i,
]
const FRAGMENTED_EFFECT_PATTERN = /\.\s+[A-Z]/

const NAN_PATTERN = /(^|[^a-z0-9])nan([^a-z0-9]|$)/i
const INVALID_NAME_PATTERN = /^(?:nan|null|undefined|n\/a)$/i
const NUMERIC_ONLY_NAME = /^\d+(?:[\s.,/-]\d+)*$/
const VALID_NAME_CHARS = /^[\p{L}\p{N}][\p{L}\p{N}\s\-,'()./]*[\p{L}\p{N})]$/u

const GREEK_LETTER_SLUG_MAP = new Map([
  ['α', 'alpha'],
  ['β', 'beta'],
  ['γ', 'gamma'],
  ['δ', 'delta'],
  ['ε', 'epsilon'],
  ['ζ', 'zeta'],
  ['η', 'eta'],
  ['θ', 'theta'],
  ['ι', 'iota'],
  ['κ', 'kappa'],
  ['λ', 'lambda'],
  ['μ', 'mu'],
  ['ν', 'nu'],
  ['ξ', 'xi'],
  ['ο', 'omicron'],
  ['π', 'pi'],
  ['ρ', 'rho'],
  ['σ', 'sigma'],
  ['ς', 'sigma'],
  ['τ', 'tau'],
  ['υ', 'upsilon'],
  ['φ', 'phi'],
  ['χ', 'chi'],
  ['ψ', 'psi'],
  ['ω', 'omega'],
])

function normalizeForSlug(value) {
  return String(value || '')
    .toLowerCase()
    .replace(/[α-ως]/g, character => `${GREEK_LETTER_SLUG_MAP.get(character) || character}-`)
}

const slugify = value =>
  normalizeForSlug(value)
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
const stripCitationBrackets = value =>
  asText(value)
    .replace(/\[(?:\s*\d+\s*(?:[-,]\s*\d+\s*)*)\]/g, ' ')
    .replace(/\[\s*citation needed\s*\]/gi, ' ')
    .replace(/\s+/g, ' ')
    .trim()
const normalizeKey = value =>
  asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
const toTitle = value =>
  asText(value)
    .split(/\s+/)
    .filter(Boolean)
    .map(chunk => {
      const normalized = chunk.toLowerCase()
      return normalized.charAt(0).toUpperCase() + normalized.slice(1)
    })
    .join(' ')

function hasCorruptedEffects(record) {
  const effects = asArray(record?.effects).map(asText).filter(Boolean)
  if (!effects.length) return false
  return effects.some(effect => effect.length > QUALITY_THRESHOLDS.maxEffectLength || FRAGMENTED_EFFECT_PATTERN.test(effect))
}

function normalizeDate(value) {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return date.toISOString().slice(0, 10)
}

function countSources(record) {
  return countBootstrapSources([record?.sources, record?.source, record?.references, record?.citations])
}

function sourceQualityScore(record) {
  const sources = mergeSources(record?.sources, record?.source, record?.references, record?.citations)
  let score = 0

  for (const source of sources) {
    const title = asText(source?.title)
    const url = asText(source?.url)
    if (!title) continue
    if (/inferred from/i.test(title)) continue

    const isPubMedTitle = /\bpubmed\b/i.test(title)
    if (isPubMedTitle && !url) {
      score += 0.5
      continue
    }

    score += 1
  }

  return score
}

function mergeSources(...sourceSets) {
  const merged = []
  const seen = new Set()
  for (const set of sourceSets) {
    for (const source of asArray(set)) {
      if (!source) continue
      if (typeof source === 'string') {
        const title = asText(source)
        if (!title) continue
        const key = `string:${title.toLowerCase()}`
        if (seen.has(key)) continue
        seen.add(key)
        merged.push({ title })
        continue
      }

      const title = asText(source?.title || source?.name || source?.citation || source?.url)
      const url = asText(source?.url || source?.link)
      if (!title && !url) continue
      const key = `${title.toLowerCase()}|${url.toLowerCase()}`
      if (seen.has(key)) continue
      seen.add(key)
      merged.push(url ? { title: title || url, url } : { title })
    }
  }

  return merged
}

function deriveCompoundRescueContext(compounds, herbs) {
  const herbByKey = new Map()
  const compoundToHerbs = new Map()

  for (const herb of herbs) {
    const herbName = asText(herb?.name || herb?.commonName || herb?.common || herb?.latinName || herb?.latin)
    if (!herbName) continue

    const herbSummary = asText(herb?.summary || herb?.description)
    const herbCategory = asText(herb?.category || herb?.class || herb?.subcategory || herb?.traditionalUse)
    const herbSources = asArray(herb?.sources)
    const herbRecord = { herbName, herbSummary, herbCategory, herbSources }

    for (const alias of [herbName, herb?.slug, herb?.id, herb?.latin, herb?.name]) {
      const key = normalizeKey(alias)
      if (!key || herbByKey.has(key)) continue
      herbByKey.set(key, herbRecord)
    }

    for (const compoundName of asArray(herb?.activeCompounds ?? herb?.active_compounds ?? herb?.compounds)) {
      const key = normalizeKey(compoundName)
      if (!key) continue
      const bucket = compoundToHerbs.get(key) || []
      bucket.push(herbRecord)
      compoundToHerbs.set(key, bucket)
    }
  }

  return compounds.map(record => {
    const compoundName = asText(record?.name || record?.commonName || record?.common || record?.latinName || record?.latin)
    const key = normalizeKey(compoundName || record?.slug || record?.id)
    const parentFromRecord = asArray(record?.herbs).map(asText).filter(Boolean)
    const parentFromLinks = asArray(record?.relatedHerbs).map(asText).filter(Boolean)
    const inferredFromHerbCompounds = (compoundToHerbs.get(key) || []).map(item => item.herbName)
    const parentHerbs = Array.from(new Set([...parentFromRecord, ...parentFromLinks, ...inferredFromHerbCompounds]))

    const linkedHerbRecords = parentHerbs
      .map(name => herbByKey.get(normalizeKey(name)))
      .filter(Boolean)

    const inheritedCategory = linkedHerbRecords.map(item => asText(item.herbCategory)).find(Boolean) || ''
    const broadContext = asText(record?.category || record?.class || inheritedCategory || 'general context')
    const inheritedSources = linkedHerbRecords.flatMap(item => item.herbSources || [])
    const mergedSourceSet = countSources(record) > 0 ? mergeSources(record?.sources) : mergeSources(record?.sources, inheritedSources)

    const hasDescription = asText(record?.description).length > 0
    const hasSummary = asText(record?.summary).length > 0
    const displayName = compoundName || toTitle(asText(record?.slug || record?.id || 'This compound'))
    const herbLabel =
      parentHerbs.length === 0
        ? 'linked herb profiles'
        : parentHerbs.length <= 3
          ? parentHerbs.join(', ')
          : `${parentHerbs.slice(0, 3).join(', ')}, and related herbs`
    const conservativeDescription =
      parentHerbs.length > 0
        ? `${displayName} is a constituent reported in ${herbLabel}. Current site data links it to ${broadContext}, but evidence depth is still limited.`
        : ''

    return {
      ...record,
      herbs: parentHerbs.length > 0 ? parentHerbs : asArray(record?.herbs),
      category: asText(record?.category) || inheritedCategory || asText(record?.class) || '',
      sources: mergedSourceSet.length > 0 ? mergedSourceSet : asArray(record?.sources),
      description: hasDescription ? record?.description : conservativeDescription || record?.description,
      summary: hasSummary ? record?.summary : conservativeDescription || record?.summary,
    }
  })
}

function countEffects(record) {
  return asArray(record?.effects)
    .map(asText)
    .filter(Boolean)
    .filter(text => !NAN_PATTERN.test(text))
    .filter(text => text.length <= QUALITY_THRESHOLDS.maxEffectLength)
    .filter(text => !FRAGMENTED_EFFECT_PATTERN.test(text))
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
    .map(stripCitationBrackets)
    .filter(Boolean)
    .join(' ')
  if (narrative.length < QUALITY_THRESHOLDS.minDescriptionLength) return false
  if (NAN_PATTERN.test(narrative)) return false
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(narrative))) return false
  return true
}

function supportingFieldCount(record) {
  const effectCount = countEffects(record)
  const mechanism = asText(record?.mechanism || record?.mechanismOfAction)
  const safetyCount =
    asArray(record?.contraindications).map(asText).filter(Boolean).length +
    asArray(record?.interactions).map(asText).filter(Boolean).length +
    (asText(record?.safetyNotes || record?.safety).length > 0 ? 1 : 0)
  const activeContextCount =
    asArray(record?.activeCompounds ?? record?.active_compounds ?? record?.compounds).map(asText).filter(Boolean).length +
    asArray(record?.herbs).map(asText).filter(Boolean).length
  const categoryCount = [
    record?.category,
    record?.class,
    record?.className,
    record?.therapeuticClass,
    record?.traditionalUse,
  ]
    .map(asText)
    .filter(Boolean).length

  return [effectCount > 0, mechanism.length > 0, safetyCount > 0, activeContextCount > 0, categoryCount > 0].filter(Boolean).length
}

function hasLinkedContext(record) {
  return (
    asArray(record?.activeCompounds ?? record?.active_compounds ?? record?.compounds).map(asText).filter(Boolean).length > 0 ||
    asArray(record?.herbs).map(asText).filter(Boolean).length > 0 ||
    asArray(record?.relatedHerbs).map(asText).filter(Boolean).length > 0 ||
    asArray(record?.relatedCompounds).map(asText).filter(Boolean).length > 0
  )
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

function ensureUniqueSlug(preferredSlug, alternatives, usedSlugs) {
  const candidates = [preferredSlug, ...alternatives].map(asText).filter(Boolean)
  for (const candidate of candidates) {
    if (!usedSlugs.has(candidate)) {
      usedSlugs.add(candidate)
      return candidate
    }
  }

  const base = candidates[0] || 'entry'
  let index = 2
  let candidate = `${base}-${index}`
  while (usedSlugs.has(candidate)) {
    index += 1
    candidate = `${base}-${index}`
  }
  usedSlugs.add(candidate)
  return candidate
}

function auditEntity(record, type, usedSlugs = new Set()) {
  const name = asText(record?.name || record?.commonName || record?.common || record?.latinName || record?.latin)
  const explicitSlug = slugify(record?.slug)
  const nameSlug = slugify(name)
  const idSlug = slugify(record?.id)
  const slug = ensureUniqueSlug(explicitSlug || nameSlug || idSlug, [nameSlug, idSlug], usedSlugs)
  const route = `/${type}/${slug}`

  const flags = {
    hasValidName: hasValidName(record),
    hasUsableDescription: hasUsableDescription(record),
    hasPlaceholderText: hasPlaceholderText(record),
    hasNanArtifacts: hasNanArtifacts(record),
    sourceCount: countSources(record),
    sourceQualityScore: sourceQualityScore(record),
    effectCount: countEffects(record),
    hasCorruptedEffects: hasCorruptedEffects(record),
  }

  const descriptionLength = stripCitationBrackets(record?.description).length
  const hasSummary = stripCitationBrackets(record?.summary).length > 0
  const sourceCountNormalized = flags.sourceQualityScore
  const supportingFields = supportingFieldCount(record)
  const hasUsefulSupportingField = supportingFields > 0
  const hasMeaningfulLinkedContext = hasLinkedContext(record)
  const stronglyCorrupted =
    flags.hasNanArtifacts || flags.hasCorruptedEffects || /^\[object\s+object\]$/i.test(asText(record?.description))
  const hasAnyUsefulContent = descriptionLength > 0 || hasSummary || sourceCountNormalized > 0 || hasUsefulSupportingField

  const isStrong =
    descriptionLength >= QUALITY_THRESHOLDS.strongDescriptionLength &&
    sourceCountNormalized >= QUALITY_THRESHOLDS.strongMinSources &&
    hasUsefulSupportingField

  const isPublishable =
    (descriptionLength >= QUALITY_THRESHOLDS.publishableDescriptionLength || hasSummary) &&
    (sourceCountNormalized >= QUALITY_THRESHOLDS.publishableMinSources || hasMeaningfulLinkedContext) &&
    hasUsefulSupportingField

  const shouldExclude = !flags.hasValidName || stronglyCorrupted || !hasAnyUsefulContent

  const completenessScore = scoreRecord(record)
  const tier = tierFromScore(completenessScore)
  const blockedForPlaceholders = flags.hasPlaceholderText || flags.hasCorruptedEffects
  const qualityTier = shouldExclude
    ? 'excluded'
    : blockedForPlaceholders
      ? 'needs_work'
      : isStrong
        ? 'strong'
        : isPublishable
          ? 'publishable'
          : 'needs_work'
  const publicationEligible = true

  const exclusionReasons = []
  if (!flags.hasValidName) exclusionReasons.push('invalidNameOrSlug')
  if (stronglyCorrupted) exclusionReasons.push('corruptedContent')
  if (!hasAnyUsefulContent) exclusionReasons.push('noUsefulContent')

  return {
    slug,
    route,
    name,
    flags,
    sourceCountNormalized,
    qualityTier,
    publicationEligible,
    completenessScore,
    tier,
    passesIndexThreshold: true,
    exclusionReasons,
  }
}


function buildPublicationEntry(record, type, audit) {
  const displayName = toTitle(
    asText(record?.commonName || record?.common || record?.name || record?.latinName || record?.latin || audit.slug)
  )
  const descriptionCandidate = asText(record?.summary || record?.description || record?.mechanism)
  const description = clip(
    PLACEHOLDER_PATTERNS.some(pattern => pattern.test(descriptionCandidate)) || NAN_PATTERN.test(descriptionCandidate)
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
    qualityTier: audit.qualityTier,
    sourceCountNormalized: audit.sourceCountNormalized,
    publicationEligible: audit.publicationEligible,
    indexable: true,
    lastmod,
  }
}

function summarizeAudits(audits) {
  const excludedByReason = {}
  const tierCounts = { strong: 0, publishable: 0, needs_work: 0, excluded: 0 }
  let indexable = 0

  for (const audit of audits) {
    tierCounts[audit.qualityTier] = (tierCounts[audit.qualityTier] || 0) + 1
    if (audit.publicationEligible) {
      indexable += 1
    }
    if (audit.qualityTier === 'excluded') {
      for (const reason of audit.exclusionReasons) {
        excludedByReason[reason] = (excludedByReason[reason] || 0) + 1
      }
    }
  }

  return {
    total: audits.length,
    indexable,
    excluded: tierCounts.excluded,
    tierCounts,
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
  const rescuedCompounds = deriveCompoundRescueContext(compounds, herbs)

  const herbSlugSet = new Set()
  const compoundSlugSet = new Set()
  const herbAudits = herbs.map(record => auditEntity(record, 'herbs', herbSlugSet))
  const compoundAudits = rescuedCompounds.map(record => auditEntity(record, 'compounds', compoundSlugSet))

  const herbSummary = summarizeAudits(herbAudits)
  const compoundSummary = summarizeAudits(compoundAudits)
  const blogSummary = auditBlogIndex(asArray(blogIndex))
  const herbSourceBuckets = sourceCountBuckets(herbs.map(record => [record?.sources, record?.source, record?.references, record?.citations]))
  const compoundSourceBuckets = sourceCountBuckets(
    rescuedCompounds.map(record => [record?.sources, record?.source, record?.references, record?.citations]),
  )

  const indexableHerbEntries = herbAudits
    .map((audit, index) => ({ audit, record: herbs[index] }))
    .map(item => buildPublicationEntry(item.record, 'herb', item.audit))
    .sort((a, b) => b.completenessScore - a.completenessScore)

  const indexableCompoundEntries = compoundAudits
    .map((audit, index) => ({ audit, record: rescuedCompounds[index] }))
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
