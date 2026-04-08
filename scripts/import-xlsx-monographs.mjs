#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const DEFAULT_XLSX_PATH = path.join('data-sources', 'herb_monograph_master.xlsx')
const workbookPath = path.resolve(repoRoot, process.env.HERB_XLSX_PATH || DEFAULT_XLSX_PATH)

const herbsPath = path.join(repoRoot, 'public', 'data', 'herbs.json')
const compoundsPath = path.join(repoRoot, 'public', 'data', 'compounds.json')

const citationArtifactPatterns = [/【[^】]*】/g, /\[[\d†\-:A-Za-z]+\]/g]
const JUNK_TOKENS = new Set([
  '',
  'na',
  'n/a',
  'none',
  'null',
  'undefined',
  'unknown',
  'unk',
  'tbd',
  '?',
  '-',
  '--',
  '[]',
  '{}',
  '[object object]',
  'object object',
  'nan',
])

function cleanText(value) {
  const input = String(value ?? '').trim()
  if (!input) return ''

  let output = input
  for (const pattern of citationArtifactPatterns) {
    output = output.replace(pattern, '')
  }

  return output.replace(/\s+/g, ' ').trim()
}

function looksJunk(value) {
  if (value === null || value === undefined) return true
  if (Array.isArray(value)) return value.length === 0 || value.every((item) => looksJunk(item))

  const normalized = cleanText(value).toLowerCase()
  if (!normalized) return true
  if (JUNK_TOKENS.has(normalized)) return true

  if (/^[-–—.,;:!?/\\\s]+$/.test(normalized)) return true
  return false
}

function weakScalar(value, { minLength = 16 } = {}) {
  if (looksJunk(value)) return true
  const normalized = cleanText(value)
  return normalized.length < minLength
}

function weakArray(value, { minItems = 1, minItemLength = 3 } = {}) {
  if (!Array.isArray(value) || value.length < minItems) return true
  const strongItems = value
    .map((item) => cleanText(item))
    .filter((item) => !looksJunk(item) && item.length >= minItemLength)
  return strongItems.length < minItems
}

function splitSemicolonDelimited(value) {
  if (Array.isArray(value)) {
    return value.map((item) => cleanText(item)).filter(Boolean)
  }

  const cleaned = cleanText(value)
  if (!cleaned) return []

  return cleaned
    .split(/[;|]/)
    .map((part) => part.trim())
    .filter(Boolean)
}

function dedupeStrings(values) {
  const seen = new Set()
  const deduped = []

  for (const value of values) {
    const normalized = cleanText(value)
    if (!normalized || looksJunk(normalized)) continue
    const key = normalized.toLowerCase()
    if (seen.has(key)) continue
    seen.add(key)
    deduped.push(normalized)
  }

  return deduped
}

function normalizeSource(candidate) {
  if (!candidate || typeof candidate !== 'object') return null

  const title = cleanText(candidate.title)
  const url = cleanText(candidate.url)
  const note = cleanText(candidate.note)

  if (!title && !url && !note) return null

  return {
    ...(title ? { title } : {}),
    ...(url ? { url } : {}),
    ...(note ? { note } : {}),
  }
}

function dedupeSources(sources) {
  const seen = new Set()
  const out = []

  for (const source of sources.map(normalizeSource).filter(Boolean)) {
    const key = `${(source.title || '').toLowerCase()}|${(source.url || '').toLowerCase()}|${(source.note || '').toLowerCase()}`
    if (seen.has(key)) continue
    seen.add(key)
    out.push(source)
  }

  return out
}

function parseSourceUrls(value) {
  const raw = splitSemicolonDelimited(value)
  const urls = []

  for (const part of raw) {
    const pieces = part.split(/[\s,]+/).filter(Boolean)
    for (const token of pieces) {
      if (/^https?:\/\//i.test(token)) {
        urls.push(token)
      }
    }
  }

  return urls
}

function buildHerbSources(row) {
  const rawSources = splitSemicolonDelimited(row.sources)
  const rawSummaryCitations = splitSemicolonDelimited(row.summaryCitations)
  const rawMechanismCitations = splitSemicolonDelimited(row.mechanismCitations)
  const rawSafetyCitations = splitSemicolonDelimited(row.safetyCitations)
  const rawInteractionCitations = splitSemicolonDelimited(row.interactionCitations)
  const authority = cleanText(row.sourceAuthority)

  const sources = []

  for (const value of rawSources) {
    if (/^https?:\/\//i.test(value)) {
      sources.push({ title: 'Workbook source', url: value })
    } else {
      sources.push({ title: value })
    }
  }

  for (const citation of [...rawSummaryCitations, ...rawMechanismCitations, ...rawSafetyCitations, ...rawInteractionCitations]) {
    if (!citation) continue
    if (/^https?:\/\//i.test(citation)) {
      sources.push({ title: 'Workbook citation', url: citation })
    } else {
      sources.push({ title: 'Workbook citation', note: citation })
    }
  }

  if (authority) {
    sources.push({ title: authority })
  }

  return dedupeSources(sources)
}

function buildCompoundSources(row) {
  const urls = parseSourceUrls(row.sourceUrls)
  const basis = dedupeStrings(splitSemicolonDelimited(row.sourceBasis))
  const workbooks = dedupeStrings(splitSemicolonDelimited(row.sourceWorkbook))
  const quality = cleanText(row.sourceQuality)
  const evidence = cleanText(row.evidence)
  const confidence = cleanText(row.confidence)

  const sources = []

  for (const url of urls) {
    sources.push({ title: 'Workbook source', url })
  }

  for (const item of basis) {
    sources.push({ title: 'Workbook source basis', note: item })
  }

  for (const item of workbooks) {
    sources.push({ title: 'Workbook source workbook', note: item })
  }

  if (quality) {
    sources.push({ title: 'Workbook source quality', note: quality })
  }

  if (evidence) {
    sources.push({ title: 'Workbook evidence', note: evidence })
  }

  if (confidence) {
    sources.push({ title: 'Workbook confidence', note: confidence })
  }

  return dedupeSources(sources)
}

function canonicalizeRow(row) {
  const out = {}
  for (const [key, value] of Object.entries(row || {})) {
    out[String(key).trim()] = typeof value === 'string' ? cleanText(value) : value
  }
  return out
}

function parseSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`[import-xlsx-monographs] Missing required worksheet: ${sheetName}`)
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  })

  return rows.map(canonicalizeRow)
}

function applyValueIfChanged(record, key, value) {
  const current = record[key]
  const nextSerialized = JSON.stringify(value)
  const currentSerialized = JSON.stringify(current)
  if (nextSerialized === currentSerialized) return false
  record[key] = value
  return true
}

function indexHerbs(herbs) {
  const bySlug = new Map()
  const byName = new Map()

  for (const herb of herbs) {
    const slug = cleanText(herb.slug).toLowerCase()
    const name = cleanText(herb.name).toLowerCase()
    if (slug) bySlug.set(slug, herb)
    if (name) byName.set(name, herb)
  }

  return { bySlug, byName }
}

function patchHerb(herb, row) {
  let patched = false

  const scientificName = cleanText(row.scientificName)
  if (!weakScalar(herb.latin, { minLength: 6 }) || weakScalar(scientificName, { minLength: 6 })) {
    // keep existing richer value
  } else {
    patched = applyValueIfChanged(herb, 'latin', scientificName) || patched
  }

  const descriptionCandidate = cleanText(row.description || row.summary)
  if (weakScalar(herb.description, { minLength: 80 }) && !weakScalar(descriptionCandidate, { minLength: 40 })) {
    patched = applyValueIfChanged(herb, 'description', descriptionCandidate) || patched
  }

  const mechanismCandidate = cleanText(row.mechanism)
  if (weakScalar(herb.mechanism, { minLength: 40 }) && !weakScalar(mechanismCandidate, { minLength: 20 })) {
    patched = applyValueIfChanged(herb, 'mechanism', mechanismCandidate) || patched
  }

  const safetyCandidate = cleanText(row.safetyNotes)
  if (weakScalar(herb.safetyNotes, { minLength: 40 }) && !weakScalar(safetyCandidate, { minLength: 20 })) {
    patched = applyValueIfChanged(herb, 'safetyNotes', safetyCandidate) || patched
  }

  const dosageCandidate = cleanText(row.dosage)
  if (weakScalar(herb.dosage, { minLength: 20 }) && !weakScalar(dosageCandidate, { minLength: 10 })) {
    patched = applyValueIfChanged(herb, 'dosage', dosageCandidate) || patched
  }

  const preparationCandidate = cleanText(row.preparation)
  if (weakScalar(herb.preparation, { minLength: 20 }) && !weakScalar(preparationCandidate, { minLength: 10 })) {
    patched = applyValueIfChanged(herb, 'preparation', preparationCandidate) || patched
  }

  const regionCandidate = cleanText(row.region)
  if (weakScalar(herb.region, { minLength: 4 }) && !weakScalar(regionCandidate, { minLength: 4 })) {
    patched = applyValueIfChanged(herb, 'region', regionCandidate) || patched
  }

  const aliasCandidate = dedupeStrings(splitSemicolonDelimited(row.commonNames))
  if (weakArray(herb.aliases, { minItems: 1, minItemLength: 3 }) && aliasCandidate.length > 0) {
    patched = applyValueIfChanged(herb, 'aliases', aliasCandidate) || patched
  }

  const compoundsCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.activeCompounds),
    ...splitSemicolonDelimited(row.markerCompounds),
  ])
  if (weakArray(herb.activeCompounds, { minItems: 1, minItemLength: 3 }) && compoundsCandidate.length > 0) {
    patched = applyValueIfChanged(herb, 'activeCompounds', compoundsCandidate) || patched
  }

  const interactionsCandidate = dedupeStrings(splitSemicolonDelimited(row.interactions))
  if (weakArray(herb.interactions, { minItems: 1, minItemLength: 5 }) && interactionsCandidate.length > 0) {
    patched = applyValueIfChanged(herb, 'interactions', interactionsCandidate) || patched
  }

  const contraindicationsCandidate = dedupeStrings(splitSemicolonDelimited(row.contraindications))
  if (weakArray(herb.contraindications, { minItems: 1, minItemLength: 5 }) && contraindicationsCandidate.length > 0) {
    patched = applyValueIfChanged(herb, 'contraindications', contraindicationsCandidate) || patched
  }

  const sourceCandidates = buildHerbSources(row)
  if (weakArray(herb.sources, { minItems: 1, minItemLength: 1 }) && sourceCandidates.length > 0) {
    patched = applyValueIfChanged(herb, 'sources', sourceCandidates) || patched
  }

  return patched
}

function indexCompounds(compounds) {
  const byId = new Map()
  const byName = new Map()

  for (const compound of compounds) {
    const id = cleanText(compound.id)
    const name = cleanText(compound.name)
    if (id) byId.set(id, compound)
    if (name) byName.set(name.toLowerCase(), compound)
  }

  return { byId, byName }
}

function patchCompound(compound, row) {
  let patched = false

  const classCandidate = cleanText(row.compoundClass)
  if (weakScalar(compound.category, { minLength: 4 }) && !weakScalar(classCandidate, { minLength: 4 })) {
    patched = applyValueIfChanged(compound, 'category', classCandidate) || patched
  }

  const mechanismCandidate = cleanText(row.mechanism)
  if (weakScalar(compound.mechanism, { minLength: 24 }) && !weakScalar(mechanismCandidate, { minLength: 20 })) {
    patched = applyValueIfChanged(compound, 'mechanism', mechanismCandidate) || patched
  }

  const effectsCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.mechanismTags),
    ...splitSemicolonDelimited(row.pathwayTargets),
  ])
  if (weakArray(compound.effects, { minItems: 1, minItemLength: 3 }) && effectsCandidate.length > 0) {
    patched = applyValueIfChanged(compound, 'effects', effectsCandidate) || patched
  }

  const contraindicationCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.safetyNotes),
    ...splitSemicolonDelimited(row.drugInteractions),
  ])
  if (weakArray(compound.contraindications, { minItems: 1, minItemLength: 5 }) && contraindicationCandidate.length > 0) {
    patched = applyValueIfChanged(compound, 'contraindications', contraindicationCandidate) || patched
  }

  const herbLinksCandidate = dedupeStrings(splitSemicolonDelimited(row.relatedHerbSlugs))
  if (weakArray(compound.herbs, { minItems: 1, minItemLength: 3 }) && herbLinksCandidate.length > 0) {
    patched = applyValueIfChanged(compound, 'herbs', herbLinksCandidate) || patched
  }

  const sourceCandidates = buildCompoundSources(row)
  if (weakArray(compound.sources, { minItems: 1, minItemLength: 1 }) && sourceCandidates.length > 0) {
    patched = applyValueIfChanged(compound, 'sources', sourceCandidates) || patched
  }

  return patched
}

function main() {
  if (!fs.existsSync(workbookPath)) {
    throw new Error(`[import-xlsx-monographs] Workbook not found at ${workbookPath}`)
  }

  const workbook = XLSX.readFile(workbookPath)
  const herbRows = parseSheet(workbook, 'Herb Monographs')
  const compoundRows = parseSheet(workbook, 'Compound Master V3')

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'))
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'))

  if (!Array.isArray(herbs) || !Array.isArray(compounds)) {
    throw new Error('[import-xlsx-monographs] Expected herbs.json and compounds.json to be arrays.')
  }

  const herbIndex = indexHerbs(herbs)
  const compoundIndex = indexCompounds(compounds)

  let herbsPatched = 0
  let herbRowsMatched = 0

  for (const row of herbRows) {
    const slug = cleanText(row.slug).toLowerCase()
    const name = cleanText(row.name).toLowerCase()

    const herb = (slug && herbIndex.bySlug.get(slug)) || (name && herbIndex.byName.get(name))
    if (!herb) continue

    herbRowsMatched += 1
    if (patchHerb(herb, row)) {
      herbsPatched += 1
    }
  }

  let compoundsPatched = 0
  let compoundRowsMatched = 0

  for (const row of compoundRows) {
    const canonicalId = cleanText(row.canonicalCompoundId)
    const compoundName = cleanText(row.compoundName).toLowerCase()

    const compound = (canonicalId && compoundIndex.byId.get(canonicalId)) || (compoundName && compoundIndex.byName.get(compoundName))
    if (!compound) continue

    compoundRowsMatched += 1
    if (patchCompound(compound, row)) {
      compoundsPatched += 1
    }
  }

  fs.writeFileSync(herbsPath, `${JSON.stringify(herbs, null, 2)}\n`, 'utf8')
  fs.writeFileSync(compoundsPath, `${JSON.stringify(compounds, null, 2)}\n`, 'utf8')

  console.log(`[import-xlsx-monographs] workbook: ${workbookPath}`)
  console.log(`[import-xlsx-monographs] herb rows: ${herbRows.length}, matched: ${herbRowsMatched}, patched: ${herbsPatched}`)
  console.log(`[import-xlsx-monographs] compound rows: ${compoundRows.length}, matched: ${compoundRowsMatched}, patched: ${compoundsPatched}`)
}

main()
