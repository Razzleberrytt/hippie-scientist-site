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

const asText = value => String(value || '').trim()
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

const slugify = value =>
  asText(value)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

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
  const sourceCount = sources
    .map(item => (typeof item === 'string' ? item : item?.url || item?.title || ''))
    .map(asText)
    .filter(Boolean).length
  return sourceCount > 0 || asText(record.lastUpdated || record.updatedAt).length > 0
}

function buildHerbSummary(record) {
  const slug = slugify(record.slug || record.id || record.common || record.name || record.scientific)
  const common = asText(record.common || record.commonName || record.name)
  const scientific = asText(record.scientific || record.scientificName || record.latin)
  const effects = splitList(record.effects)
  const activeCompounds = splitList(record.activeCompounds || record.active_compounds || record.compounds)
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
      interactionTags.length > 0 || splitList(record.interactionNotes || record.interactions).length > 0,
    hasEvidenceNotes: hasEvidenceNotes(record),
    image: asText(record.image),
    aliases: [common, scientific, asText(record.name)].map(asText).filter(Boolean),
  }
}

function buildCompoundSummary(record) {
  const slug = slugify(record.slug || record.id || record.name)
  const effects = splitList(record.effects)
  const herbs = splitList(record.herbs || record.foundInHerbs || record.associatedHerbs)
  const interactionTags = splitList(record.interactionTags)

  return {
    id: asText(record.id || slug),
    slug,
    name: asText(record.name || record.commonName || slug),
    summaryShort: asText(record.summary || record.description || record.mechanism),
    description: asText(record.description || record.summary),
    className: asText(record.className || record.class || record.type),
    category: asText(record.category || record.className || record.class || record.type),
    mechanism: asText(record.mechanism || record.mechanismOfAction),
    effects,
    primaryEffects: effects.slice(0, 4),
    herbs,
    confidence: asText(record.confidence || 'low').toLowerCase(),
    hasInteractionData:
      interactionTags.length > 0 || splitList(record.interactionNotes || record.interactions).length > 0,
    hasEvidenceNotes: hasEvidenceNotes(record),
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

function run() {
  const herbs = JSON.parse(fs.readFileSync(HERBS_PATH, 'utf8'))
  const compounds = JSON.parse(fs.readFileSync(COMPOUNDS_PATH, 'utf8'))

  const herbSummaries = dedupeBySlug(herbs.map(buildHerbSummary))
  const compoundSummaries = dedupeBySlug(compounds.map(buildCompoundSummary))

  writeJson(HERB_SUMMARY_PATH, herbSummaries)
  writeJson(COMPOUND_SUMMARY_PATH, compoundSummaries)

  const herbDetailCount = writeEntityDetails(herbs, HERB_DETAIL_DIR)
  const compoundDetailCount = writeEntityDetails(compounds, COMPOUND_DETAIL_DIR)

  console.log(`[entity-payloads] herbs summary=${herbSummaries.length} detail=${herbDetailCount}`)
  console.log(`[entity-payloads] compounds summary=${compoundSummaries.length} detail=${compoundDetailCount}`)
}

run()
