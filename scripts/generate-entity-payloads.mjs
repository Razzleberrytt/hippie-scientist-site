import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const HERBS_PATH = path.join(DATA_DIR, 'herbs.json')
const COMPOUNDS_PATH = path.join(DATA_DIR, 'compounds.json')
const HERB_SUMMARY_PATH = path.join(DATA_DIR, 'herbs-summary.json')
const COMPOUND_SUMMARY_PATH = path.join(DATA_DIR, 'compounds-summary.json')
const HERB_DETAIL_DIR = path.join(DATA_DIR, 'herbs-detail')
const COMPOUND_DETAIL_DIR = path.join(DATA_DIR, 'compounds-detail')
const GOVERNED_ENRICHMENT_PATH = path.join(DATA_DIR, 'enrichment-governed.json')

const asText = value => String(value || '').trim()
const clip = (value, max = 260) => asText(value).slice(0, max)
const splitList = value => {
  if (Array.isArray(value)) {
    return value.map(asText).filter(Boolean)
  }
  const text = asText(value)
  if (!text) return []
  return text
    .split(/[\n,;|]/)
    .map(item => item.trim())
    .filter(Boolean)
}

const PLACEHOLDER_PATTERNS = [
  /\bno direct\b/i,
  /\bcontextual inference\b/i,
  /\bnot established\b/i,
  /\binsufficient data\b/i,
  /\[object\s+object\]/i,
  /\bnan\b/i,
]

const GENERIC_CATEGORY_PATTERNS = /^(?:general|unknown|other|misc(?:ellaneous)?|n\/a)$/i

function cleanNarrative(value) {
  const text = asText(value).replace(/\s+/g, ' ')
  if (!text) return ''
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))) return ''
  return text
}

function normalizeCategoryLabel(record) {
  const raw = asText(record.category || record.className || record.class || record.type)
  if (!raw || GENERIC_CATEGORY_PATTERNS.test(raw)) return ''
  return raw
}

function formatHerbContext(herbs) {
  if (herbs.length === 0) return ''
  if (herbs.length === 1) return `reported in ${herbs[0]}`
  if (herbs.length === 2) return `reported in ${herbs[0]} and ${herbs[1]}`
  return `reported in ${herbs[0]}, ${herbs[1]}, and related herbs`
}

function chooseVariant(seed, options) {
  if (!Array.isArray(options) || options.length === 0) return ''
  const normalizedSeed = asText(seed)
  const hash = Array.from(normalizedSeed).reduce((acc, char) => acc + char.charCodeAt(0), 0)
  return options[hash % options.length]
}

function withIndefiniteArticle(phrase) {
  const text = asText(phrase)
  if (!text) return ''
  const article = /^[aeiou]/i.test(text) ? 'an' : 'a'
  return `${article} ${text}`
}

function formatEvidenceContext(governedSummary, hasEvidence, seed) {
  const evidenceLabel = asText(governedSummary?.evidenceLabelTitle)
  if (evidenceLabel) {
    return `Governed evidence review is currently rated ${evidenceLabel.toLowerCase()}.`
  }
  return hasEvidence
    ? chooseVariant(seed, [
        'Available references are still early and incomplete.',
        'Current source coverage is limited and still developing.',
      ])
    : chooseVariant(seed, [
        'Published evidence is still sparse for this profile.',
        'This profile currently has very limited evidence depth.',
      ])
}

function buildCompoundNarrative(record, governedSummary) {
  const name = asText(record.name || record.commonName || record.slug || 'This compound')
  const herbs = splitList(record.herbs || record.foundInHerbs || record.associatedHerbs)
  const category = normalizeCategoryLabel(record)
  const mechanism = cleanNarrative(record.mechanism || record.mechanismOfAction)
  const existingDescription = cleanNarrative(record.description)
  const existingSummary = cleanNarrative(record.summary)
  const evidenceContext = formatEvidenceContext(governedSummary, hasEvidenceNotes(record), name)
  const identityWithCategoryAndHerb = `${name} is ${withIndefiniteArticle(category)} compound ${formatHerbContext(herbs)}.`
  const identityWithCategoryOnly = `${name} is ${withIndefiniteArticle(category)} compound.`
  const identityWithHerbOnlyOptions = [
    `${name} is a compound ${formatHerbContext(herbs)}.`,
    `${name} appears in records as a compound ${formatHerbContext(herbs)}.`,
  ]
  const identityFallbackOptions = [
    `${name} is listed as a compound in this profile.`,
    `${name} is currently cataloged as a compound entry.`,
  ]

  const identitySentence =
    category && formatHerbContext(herbs)
      ? identityWithCategoryAndHerb
      : category
        ? identityWithCategoryOnly
        : formatHerbContext(herbs)
          ? chooseVariant(name, identityWithHerbOnlyOptions)
          : chooseVariant(name, identityFallbackOptions)

  const mechanismSentence = mechanism
    ? chooseVariant(name, [
        `Mechanism notes currently mention ${mechanism.charAt(0).toLowerCase()}${mechanism.slice(1)}.`,
        `Available mechanism notes describe ${mechanism.charAt(0).toLowerCase()}${mechanism.slice(1)}.`,
      ])
    : ''

  const generatedDescription = clip(
    [identitySentence, mechanismSentence, evidenceContext].filter(Boolean).join(' '),
    320,
  )
  const description = existingDescription || generatedDescription
  const summary = existingSummary || clip(existingDescription || generatedDescription, 180)

  return { description, summary }
}

const slugify = value =>
  asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

const PUBLISHABLE_EDITORIAL_STATUSES = new Set(['approved', 'published'])

function isPublishableGovernedEnrichment(enrichment) {
  if (!enrichment || typeof enrichment !== 'object') return false
  if (!PUBLISHABLE_EDITORIAL_STATUSES.has(String(enrichment.editorialStatus || ''))) return false
  return enrichment.editorialReadiness?.publishable === true
}

const EVIDENCE_LABEL_TITLES = {
  stronger_human_support: 'Stronger human support',
  limited_human_support: 'Limited human support',
  observational_only: 'Observational only',
  preclinical_only: 'Preclinical only',
  traditional_use_only: 'Traditional use only',
  mixed_or_uncertain: 'Mixed or uncertain',
  conflicting_evidence: 'Conflicting evidence',
  insufficient_evidence: 'Insufficient evidence',
}

function buildPublishSafeSummary(enrichment) {
  const evidenceLabel = String(enrichment?.pageEvidenceJudgment?.evidenceLabel || 'insufficient_evidence')
  const evidenceClasses = Array.isArray(enrichment.evidenceClassesPresent)
    ? enrichment.evidenceClassesPresent
    : []
  const hasHumanEvidence = evidenceClasses.some(
    evidenceClass => evidenceClass === 'human-clinical' || evidenceClass === 'human-observational',
  )

  return {
    evidenceLabel,
    evidenceLabelTitle:
      EVIDENCE_LABEL_TITLES[evidenceLabel] || EVIDENCE_LABEL_TITLES.insufficient_evidence,
    hasHumanEvidence,
    safetyCautionsPresent:
      (enrichment?.safetyProfile?.summary?.total ?? 0) > 0 ||
      (Array.isArray(enrichment.interactions) && enrichment.interactions.length > 0) ||
      (Array.isArray(enrichment.contraindications) && enrichment.contraindications.length > 0) ||
      (Array.isArray(enrichment.adverseEffects) && enrichment.adverseEffects.length > 0),
    supportedUseCoveragePresent:
      (Array.isArray(enrichment.supportedUses) && enrichment.supportedUses.length > 0) ||
      (Array.isArray(enrichment.unsupportedOrUnclearUses) &&
        enrichment.unsupportedOrUnclearUses.length > 0),
    mechanismOrConstituentCoveragePresent:
      (Array.isArray(enrichment.mechanisms) && enrichment.mechanisms.length > 0) ||
      (Array.isArray(enrichment.constituents) && enrichment.constituents.length > 0),
    traditionalUseOnly: evidenceLabel === 'traditional_use_only',
    conflictingEvidence:
      evidenceLabel === 'conflicting_evidence' ||
      enrichment?.pageEvidenceJudgment?.grading?.conflictState === 'conflicting_evidence',
    enrichedAndReviewed: true,
    lastReviewedAt: asText(enrichment.lastReviewedAt),
  }
}

function buildGovernedSummaryIndex() {
  if (!fs.existsSync(GOVERNED_ENRICHMENT_PATH)) return new Map()
  const rows = JSON.parse(fs.readFileSync(GOVERNED_ENRICHMENT_PATH, 'utf8'))
  if (!Array.isArray(rows)) return new Map()

  const map = new Map()
  for (const row of rows) {
    const entityType = asText(row?.entityType).toLowerCase()
    const entitySlug = slugify(row?.entitySlug)
    const enrichment = row?.researchEnrichment
    if (!entityType || !entitySlug || !isPublishableGovernedEnrichment(enrichment)) continue
    map.set(`${entityType}:${entitySlug}`, buildPublishSafeSummary(enrichment))
  }
  return map
}

function writeJson(targetPath, payload) {
  fs.mkdirSync(path.dirname(targetPath), { recursive: true })
  fs.writeFileSync(targetPath, JSON.stringify(payload, null, 2) + '\n', 'utf8')
}

function cleanDir(dir) {
  fs.rmSync(dir, { recursive: true, force: true })
  fs.mkdirSync(dir, { recursive: true })
}

function hasEvidenceNotes(record) {
  const sources = Array.isArray(record.sources) ? record.sources : []
  const enrichmentSources = Array.isArray(record.researchEnrichment?.sourceRefs)
    ? record.researchEnrichment.sourceRefs
    : []
  const sourceCount = sources
    .map(item => (typeof item === 'string' ? item : item?.url || item?.title || ''))
    .map(asText)
    .filter(Boolean).length
  const enrichmentSourceCount = enrichmentSources
    .map(item => (typeof item === 'object' ? item?.sourceId || item?.url || item?.title || '' : ''))
    .map(asText)
    .filter(Boolean).length
  return (
    sourceCount > 0 ||
    enrichmentSourceCount > 0 ||
    asText(record.lastUpdated || record.updatedAt || record.researchEnrichment?.lastReviewedAt)
      .length > 0
  )
}

function buildHerbSummary(record, governedSummaryByEntity) {
  const slug = slugify(
    record.slug || record.id || record.common || record.name || record.scientific,
  )
  const common = asText(record.common || record.commonName || record.name)
  const scientific = asText(record.scientific || record.scientificName || record.latin)
  const effects = splitList(record.effects)
  const activeCompounds = splitList(
    record.activeCompounds || record.active_compounds || record.compounds,
  )
  const interactionTags = splitList(record.interactionTags)

  return {
    id: asText(record.id || slug),
    slug,
    name: common || scientific || slug,
    common,
    scientific,
    summaryShort: asText(record.summary || record.description || record.mechanism),
    description: asText(record.description || record.summary),
    mechanism: asText(record.mechanism || record.mechanismOfAction),
    category: asText(record.category),
    class: asText(record.class || record.category),
    confidence: asText(record.confidence || 'low').toLowerCase(),
    effects,
    primaryEffects: effects.slice(0, 4),
    activeCompounds,
    compounds: activeCompounds,
    interactionTags,
    hasInteractionData:
      interactionTags.length > 0 ||
      splitList(record.interactionNotes || record.interactions).length > 0,
    hasEvidenceNotes: hasEvidenceNotes(record),
    researchEnrichmentSummary:
      governedSummaryByEntity.get(`herb:${slug}`) || undefined,
    image: asText(record.image),
    aliases: [common, scientific, asText(record.name)].map(asText).filter(Boolean),
  }
}

function buildCompoundSummary(record, governedSummaryByEntity) {
  const slug = slugify(record.slug || record.id || record.name)
  const effects = splitList(record.effects)
  const herbs = splitList(record.herbs || record.foundInHerbs || record.associatedHerbs)
  const interactionTags = splitList(record.interactionTags)
  const governedSummary = governedSummaryByEntity.get(`compound:${slug}`) || undefined
  const narrative = buildCompoundNarrative(record, governedSummary)

  return {
    id: asText(record.id || slug),
    slug,
    name: asText(record.name || record.commonName || slug),
    summaryShort: narrative.summary,
    description: narrative.description,
    className: asText(record.className || record.class || record.type),
    category: asText(record.category || record.className || record.class || record.type),
    mechanism: asText(record.mechanism || record.mechanismOfAction),
    effects,
    primaryEffects: effects.slice(0, 4),
    herbs,
    confidence: asText(record.confidence || 'low').toLowerCase(),
    hasInteractionData:
      interactionTags.length > 0 ||
      splitList(record.interactionNotes || record.interactions).length > 0,
    hasEvidenceNotes: hasEvidenceNotes(record),
    researchEnrichmentSummary: governedSummary,
    aliases: [asText(record.name), asText(record.className), asText(record.category)]
      .map(asText)
      .filter(Boolean),
  }
}

function dedupeBySlug(entries) {
  const seen = new Set()
  return entries.filter(entry => {
    const slug = asText(entry.slug)
    if (!slug || seen.has(slug)) return false
    seen.add(slug)
    return true
  })
}

function writeEntityDetails(records, targetDir) {
  cleanDir(targetDir)
  const writtenSlugs = new Set()

  for (const record of records) {
    const slug = slugify(record.slug || record.id || record.name || record.common)
    if (!slug || writtenSlugs.has(slug)) continue

    const detailRecord = { ...record, slug }
    writeJson(path.join(targetDir, `${slug}.json`), detailRecord)
    writtenSlugs.add(slug)
  }

  return writtenSlugs.size
}

function writeCompoundDetails(records, targetDir, governedSummaryByEntity) {
  cleanDir(targetDir)
  const writtenSlugs = new Set()

  for (const record of records) {
    const slug = slugify(record.slug || record.id || record.name || record.common)
    if (!slug || writtenSlugs.has(slug)) continue

    const governedSummary = governedSummaryByEntity.get(`compound:${slug}`) || undefined
    const narrative = buildCompoundNarrative(record, governedSummary)
    const detailRecord = {
      ...record,
      slug,
      description: narrative.description,
      summary: narrative.summary,
    }
    writeJson(path.join(targetDir, `${slug}.json`), detailRecord)
    writtenSlugs.add(slug)
  }

  return writtenSlugs.size
}

function run() {
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, 'utf8'))
  const compounds = JSON.parse(fs.readFileSync(COMPOUNDS_PATH, 'utf8'))
  const governedSummaryByEntity = buildGovernedSummaryIndex()

  const herbSummaries = dedupeBySlug(
    herbs.map(record => buildHerbSummary(record, governedSummaryByEntity)),
  )
  const compoundSummaries = dedupeBySlug(
    compounds.map(record => buildCompoundSummary(record, governedSummaryByEntity)),
  )

  writeJson(HERB_SUMMARY_PATH, herbSummaries)
  writeJson(COMPOUND_SUMMARY_PATH, compoundSummaries)

  const herbDetailCount = writeEntityDetails(herbs, HERB_DETAIL_DIR)
  const compoundDetailCount = writeCompoundDetails(compounds, COMPOUND_DETAIL_DIR, governedSummaryByEntity)

  console.log(`[entity-payloads] herbs summary=${herbSummaries.length} detail=${herbDetailCount}`)
  console.log(
    `[entity-payloads] compounds summary=${compoundSummaries.length} detail=${compoundDetailCount}`,
  )
}

run()
