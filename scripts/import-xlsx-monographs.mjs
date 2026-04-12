#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from './workbook-source.mjs'
import { canonicalizeWorkbookRow } from './workbook-column-mapping.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const workbookPath = resolveWorkbookPath(repoRoot)

const herbsPath = path.join(repoRoot, 'public', 'data', 'herbs.json')
const compoundsPath = path.join(repoRoot, 'public', 'data', 'compounds.json')
const reportsDir = path.join(repoRoot, 'reports')
const unmatchedHerbsReportPath = path.join(reportsDir, 'workbook-unmatched-herbs.json')
const unmatchedCompoundsReportPath = path.join(reportsDir, 'workbook-unmatched-compounds.json')

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

const HERB_EXPLICIT_ALIASES = {
  'saint johns wort': 'st-johns-wort',
  'st johns wort': 'st-johns-wort',
  "st john's wort": 'st-johns-wort',
  'st john wort': 'st-johns-wort',
}

const COMPOUND_EXPLICIT_ALIASES = {
  'omega 3 fatty acids': 'omega-3-fatty-acids',
  omega3: 'omega-3-fatty-acids',
  'vitamin d': 'vitamin-d',
}

function parseArgs(argv) {
  return {
    dryRun: argv.includes('--dry-run'),
  }
}

function cleanText(value) {
  const input = String(value ?? '').trim()
  if (!input) return ''

  let output = input
  for (const pattern of citationArtifactPatterns) {
    output = output.replace(pattern, '')
  }

  return output.replace(/\s+/g, ' ').trim()
}

function normalizeLookupBase(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[’'`]/g, '')
    .replace(/[–—−]/g, '-')
    .replace(/&/g, ' and ')
    .replace(/[()[\]{}]/g, ' ')
    .replace(/[^a-z0-9+\-\s/]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function buildLookupVariants(value) {
  const base = normalizeLookupBase(value)
  if (!base) return []

  const variants = new Set([
    base,
    base.replace(/[-/]/g, ' '),
    base.replace(/[\s/]+/g, '-'),
    base.replace(/[\s/-]+/g, ''),
  ])

  const parentheticalStripped = base.replace(/\([^)]*\)/g, ' ').replace(/\s+/g, ' ').trim()
  if (parentheticalStripped && parentheticalStripped !== base) {
    variants.add(parentheticalStripped)
    variants.add(parentheticalStripped.replace(/[\s/]+/g, '-'))
    variants.add(parentheticalStripped.replace(/[\s/-]+/g, ''))
  }

  const slashSplit = base.split('/').map((part) => part.trim()).filter(Boolean)
  for (const part of slashSplit) {
    variants.add(part)
    variants.add(part.replace(/[\s/-]+/g, ''))
  }

  return [...variants].filter(Boolean)
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

function scalarStrength(value) {
  const normalized = cleanText(value)
  if (looksJunk(normalized)) return 0
  const words = normalized.split(/\s+/).filter(Boolean).length
  const punctuation = (normalized.match(/[.,;:()]/g) || []).length
  return normalized.length + words * 4 + punctuation
}

function arrayStrength(values) {
  if (!Array.isArray(values)) return 0
  const cleaned = values.map((item) => cleanText(item)).filter((item) => !looksJunk(item))
  return cleaned.length * 20 + cleaned.reduce((sum, item) => sum + item.length, 0)
}

function shouldPatchScalar(currentValue, candidateValue, { minCandidateLength = 12, minGain = 48 } = {}) {
  const current = cleanText(currentValue)
  const candidate = cleanText(candidateValue)
  if (!candidate || looksJunk(candidate) || candidate.length < minCandidateLength) return false
  if (candidate === current) return false

  if (weakScalar(current, { minLength: minCandidateLength })) return true
  return scalarStrength(candidate) >= scalarStrength(current) + minGain
}

function shouldPatchArray(currentValue, candidateValue, { minItems = 1, minGain = 20 } = {}) {
  if (!Array.isArray(candidateValue) || candidateValue.length < minItems) return false
  if (weakArray(currentValue, { minItems })) return true
  return arrayStrength(candidateValue) >= arrayStrength(currentValue) + minGain
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
  const out = canonicalizeWorkbookRow(row, 'unknown')
  for (const [key, value] of Object.entries(out)) {
    out[key] = typeof value === 'string' ? cleanText(value) : value
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

  return rows.map(row => canonicalizeWorkbookRow(canonicalizeRow(row), sheetName))
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function applyValueIfChanged(record, key, value) {
  const current = record[key]
  const nextSerialized = JSON.stringify(value)
  const currentSerialized = JSON.stringify(current)
  if (nextSerialized === currentSerialized) return false
  record[key] = value
  return true
}

function addLookupEntry(map, key, value) {
  if (!key || map.has(key)) return
  map.set(key, value)
}

function indexHerbs(herbs) {
  const bySlug = new Map()
  const byName = new Map()
  const byVariant = new Map()

  for (const herb of herbs) {
    const slug = cleanText(herb.slug).toLowerCase()
    const name = cleanText(herb.name).toLowerCase()
    if (slug) addLookupEntry(bySlug, slug, herb)
    if (name) addLookupEntry(byName, name, herb)

    const aliases = Array.isArray(herb.aliases) ? herb.aliases : []
    for (const value of [herb.slug, herb.name, ...aliases]) {
      for (const variant of buildLookupVariants(value)) {
        addLookupEntry(byVariant, variant, herb)
      }
    }
  }

  return { bySlug, byName, byVariant }
}

function resolveHerb(herbIndex, row) {
  const slug = cleanText(row.slug).toLowerCase()
  const name = cleanText(row.name).toLowerCase()

  const aliasTargets = [
    ...buildLookupVariants(slug),
    ...buildLookupVariants(name),
    HERB_EXPLICIT_ALIASES[normalizeLookupBase(slug)] || '',
    HERB_EXPLICIT_ALIASES[normalizeLookupBase(name)] || '',
  ].filter(Boolean)

  return (
    (slug && herbIndex.bySlug.get(slug)) ||
    (name && herbIndex.byName.get(name)) ||
    aliasTargets.map((value) => herbIndex.byVariant.get(value) || herbIndex.bySlug.get(value)).find(Boolean) ||
    null
  )
}

function patchHerb(herb, row) {
  let patched = false

  const scientificName = cleanText(row.scientificName)
  if (shouldPatchScalar(herb.latin, scientificName, { minCandidateLength: 6, minGain: 8 })) {
    patched = applyValueIfChanged(herb, 'latin', scientificName) || patched
  }

  const descriptionCandidate = cleanText(row.description || row.summary)
  if (shouldPatchScalar(herb.description, descriptionCandidate, { minCandidateLength: 40, minGain: 80 })) {
    patched = applyValueIfChanged(herb, 'description', descriptionCandidate) || patched
  }

  const mechanismCandidate = cleanText(row.mechanism)
  if (shouldPatchScalar(herb.mechanism, mechanismCandidate, { minCandidateLength: 20, minGain: 56 })) {
    patched = applyValueIfChanged(herb, 'mechanism', mechanismCandidate) || patched
  }

  const safetyCandidate = cleanText(row.safetyNotes)
  if (shouldPatchScalar(herb.safetyNotes, safetyCandidate, { minCandidateLength: 20, minGain: 56 })) {
    patched = applyValueIfChanged(herb, 'safetyNotes', safetyCandidate) || patched
  }

  const dosageCandidate = cleanText(row.dosage)
  if (shouldPatchScalar(herb.dosage, dosageCandidate, { minCandidateLength: 10, minGain: 18 })) {
    patched = applyValueIfChanged(herb, 'dosage', dosageCandidate) || patched
  }

  const preparationCandidate = cleanText(row.preparation)
  if (shouldPatchScalar(herb.preparation, preparationCandidate, { minCandidateLength: 10, minGain: 18 })) {
    patched = applyValueIfChanged(herb, 'preparation', preparationCandidate) || patched
  }

  const regionCandidate = cleanText(row.region)
  if (shouldPatchScalar(herb.region, regionCandidate, { minCandidateLength: 4, minGain: 8 })) {
    patched = applyValueIfChanged(herb, 'region', regionCandidate) || patched
  }

  const aliasCandidate = dedupeStrings(splitSemicolonDelimited(row.commonNames))
  if (shouldPatchArray(herb.aliases, aliasCandidate, { minItems: 1, minGain: 30 })) {
    patched = applyValueIfChanged(herb, 'aliases', aliasCandidate) || patched
  }

  const compoundsCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.activeCompounds),
    ...splitSemicolonDelimited(row.markerCompounds),
  ])
  if (shouldPatchArray(herb.activeCompounds, compoundsCandidate, { minItems: 1, minGain: 30 })) {
    patched = applyValueIfChanged(herb, 'activeCompounds', compoundsCandidate) || patched
  }

  const interactionsCandidate = dedupeStrings(splitSemicolonDelimited(row.interactions))
  if (shouldPatchArray(herb.interactions, interactionsCandidate, { minItems: 1, minGain: 24 })) {
    patched = applyValueIfChanged(herb, 'interactions', interactionsCandidate) || patched
  }

  const contraindicationsCandidate = dedupeStrings(splitSemicolonDelimited(row.contraindications))
  if (shouldPatchArray(herb.contraindications, contraindicationsCandidate, { minItems: 1, minGain: 24 })) {
    patched = applyValueIfChanged(herb, 'contraindications', contraindicationsCandidate) || patched
  }

  const sourceCandidates = buildHerbSources(row)
  if (shouldPatchArray(herb.sources, sourceCandidates, { minItems: 1, minGain: 18 })) {
    patched = applyValueIfChanged(herb, 'sources', sourceCandidates) || patched
  }

  return patched
}

function indexCompounds(compounds) {
  const byId = new Map()
  const byName = new Map()
  const byVariant = new Map()

  for (const compound of compounds) {
    const id = cleanText(compound.id || compound.canonicalCompoundId)
    const name = cleanText(compound.name || compound.compoundName || compound.canonicalCompoundName)
    if (id) addLookupEntry(byId, id, compound)
    if (name) addLookupEntry(byName, name.toLowerCase(), compound)

    for (const value of [compound.id, compound.canonicalCompoundId, compound.name, compound.compoundName]) {
      for (const variant of buildLookupVariants(value)) {
        addLookupEntry(byVariant, variant, compound)
      }
    }
  }

  return { byId, byName, byVariant }
}

function resolveCompound(compoundIndex, row) {
  const canonicalId = cleanText(row.canonicalCompoundId)
  const compoundName = cleanText(row.compoundName)

  const aliasTargets = [
    ...buildLookupVariants(canonicalId),
    ...buildLookupVariants(compoundName),
    COMPOUND_EXPLICIT_ALIASES[normalizeLookupBase(canonicalId)] || '',
    COMPOUND_EXPLICIT_ALIASES[normalizeLookupBase(compoundName)] || '',
  ].filter(Boolean)

  return (
    (canonicalId && compoundIndex.byId.get(canonicalId)) ||
    (compoundName && compoundIndex.byName.get(compoundName.toLowerCase())) ||
    aliasTargets
      .map(
        (value) =>
          compoundIndex.byVariant.get(value) ||
          compoundIndex.byId.get(value) ||
          compoundIndex.byName.get(value.toLowerCase())
      )
      .find(Boolean) ||
    null
  )
}

function patchCompound(compound, row) {
  let patched = false

  const canonicalId = cleanText(row.canonicalCompoundId) || slugify(row.compoundName || row.canonicalCompoundName)
  if (shouldPatchScalar(compound.canonicalCompoundId, canonicalId, { minCandidateLength: 3, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'canonicalCompoundId', canonicalId) || patched
  }
  if (shouldPatchScalar(compound.id, canonicalId, { minCandidateLength: 3, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'id', canonicalId) || patched
  }

  const compoundName = cleanText(row.compoundName || row.canonicalCompoundName)
  if (shouldPatchScalar(compound.compoundName, compoundName, { minCandidateLength: 3, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'compoundName', compoundName) || patched
  }
  if (shouldPatchScalar(compound.name, compoundName, { minCandidateLength: 3, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'name', compoundName) || patched
  }

  const classCandidate = cleanText(row.compoundClass)
  if (shouldPatchScalar(compound.category, classCandidate, { minCandidateLength: 4, minGain: 12 })) {
    patched = applyValueIfChanged(compound, 'category', classCandidate) || patched
  }
  if (shouldPatchScalar(compound.compoundClass, classCandidate, { minCandidateLength: 3, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'compoundClass', classCandidate) || patched
  }

  const mechanismCandidate = cleanText(row.mechanism)
  if (shouldPatchScalar(compound.mechanism, mechanismCandidate, { minCandidateLength: 20, minGain: 32 })) {
    patched = applyValueIfChanged(compound, 'mechanism', mechanismCandidate) || patched
  }

  const effectsCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.mechanismTags),
    ...splitSemicolonDelimited(row.pathwayTargets),
  ])
  if (shouldPatchArray(compound.effects, effectsCandidate, { minItems: 1, minGain: 20 })) {
    patched = applyValueIfChanged(compound, 'effects', effectsCandidate) || patched
  }

  const contraindicationCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.safetyNotes),
    ...splitSemicolonDelimited(row.drugInteractions),
  ])
  if (shouldPatchArray(compound.contraindications, contraindicationCandidate, { minItems: 1, minGain: 20 })) {
    patched = applyValueIfChanged(compound, 'contraindications', contraindicationCandidate) || patched
  }

  const safetyNotes = cleanText(row.safetyNotes)
  if (shouldPatchScalar(compound.safetyNotes, safetyNotes, { minCandidateLength: 3, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'safetyNotes', safetyNotes) || patched
  }

  const drugInteractions = cleanText(row.drugInteractions)
  if (shouldPatchScalar(compound.drugInteractions, drugInteractions, { minCandidateLength: 3, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'drugInteractions', drugInteractions) || patched
  }

  const herbLinksCandidate = dedupeStrings(splitSemicolonDelimited(row.relatedHerbSlugs))
  if (shouldPatchArray(compound.herbs, herbLinksCandidate, { minItems: 1, minGain: 16 })) {
    patched = applyValueIfChanged(compound, 'herbs', herbLinksCandidate) || patched
  }
  if (shouldPatchScalar(compound.relatedHerbSlugs, herbLinksCandidate.join('; '), { minCandidateLength: 3, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'relatedHerbSlugs', herbLinksCandidate.join('; ')) || patched
  }

  const sourceCandidates = buildCompoundSources(row)
  if (shouldPatchArray(compound.sources, sourceCandidates, { minItems: 1, minGain: 18 })) {
    patched = applyValueIfChanged(compound, 'sources', sourceCandidates) || patched
  }

  const sourceUrls = dedupeStrings(parseSourceUrls(row.sourceUrls))
  if (shouldPatchScalar(compound.sourceUrls, sourceUrls.join(' | '), { minCandidateLength: 8, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'sourceUrls', sourceUrls.join(' | ')) || patched
  }

  const confidence = cleanText(row.confidence)
  if (shouldPatchScalar(compound.confidence, confidence, { minCandidateLength: 2, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'confidence', confidence) || patched
  }

  const evidence = cleanText(row.evidence)
  if (shouldPatchScalar(compound.evidence, evidence, { minCandidateLength: 2, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'evidence', evidence) || patched
  }

  const mechanismTags = dedupeStrings(splitSemicolonDelimited(row.mechanismTags))
  if (shouldPatchScalar(compound.mechanismTags, mechanismTags.join('; '), { minCandidateLength: 2, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'mechanismTags', mechanismTags.join('; ')) || patched
  }

  const pathwayTargets = dedupeStrings(splitSemicolonDelimited(row.pathwayTargets))
  if (shouldPatchScalar(compound.pathwayTargets, pathwayTargets.join('; '), { minCandidateLength: 2, minGain: 0 })) {
    patched = applyValueIfChanged(compound, 'pathwayTargets', pathwayTargets.join('; ')) || patched
  }

  return patched
}

function ensureReportsDir() {
  if (!fs.existsSync(reportsDir)) {
    fs.mkdirSync(reportsDir, { recursive: true })
  }
}

function writeJson(filePath, data) {
  fs.writeFileSync(filePath, `${JSON.stringify(data, null, 2)}\n`, 'utf8')
}

function main() {
  const options = parseArgs(process.argv.slice(2))

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

  const herbLog = {
    matchedAndPatched: [],
    matchedNoChange: [],
    unmatched: [],
  }
  const compoundLog = {
    matchedAndPatched: [],
    matchedNoChange: [],
    unmatched: [],
  }

  for (const row of herbRows) {
    const herb = resolveHerb(herbIndex, row)
    if (!herb) {
      herbLog.unmatched.push({
        slug: cleanText(row.slug),
        name: cleanText(row.name),
        scientificName: cleanText(row.scientificName),
      })
      continue
    }

    const patched = patchHerb(herb, row)
    const payload = {
      rowSlug: cleanText(row.slug),
      rowName: cleanText(row.name),
      herbSlug: cleanText(herb.slug),
      herbName: cleanText(herb.name),
    }

    if (patched) {
      herbLog.matchedAndPatched.push(payload)
    } else {
      herbLog.matchedNoChange.push(payload)
    }
  }

  for (const row of compoundRows) {
    const compound = resolveCompound(compoundIndex, row)
    if (!compound) {
      compoundLog.unmatched.push({
        canonicalCompoundId: cleanText(row.canonicalCompoundId),
        compoundName: cleanText(row.compoundName),
      })
      continue
    }

    const patched = patchCompound(compound, row)
    const payload = {
      rowCompoundId: cleanText(row.canonicalCompoundId),
      rowCompoundName: cleanText(row.compoundName),
      compoundId: cleanText(compound.id),
      compoundName: cleanText(compound.name),
    }

    if (patched) {
      compoundLog.matchedAndPatched.push(payload)
    } else {
      compoundLog.matchedNoChange.push(payload)
    }
  }

  ensureReportsDir()
  writeJson(unmatchedHerbsReportPath, herbLog.unmatched)
  writeJson(unmatchedCompoundsReportPath, compoundLog.unmatched)

  if (!options.dryRun) {
    writeJson(herbsPath, herbs)
    writeJson(compoundsPath, compounds)
  }

  console.log(`[import-xlsx-monographs] mode: ${options.dryRun ? 'dry-run' : 'apply'}`)
  console.log(`[import-xlsx-monographs] workbook: ${workbookPath}`)
  console.log(
    `[import-xlsx-monographs] herbs => matched-and-patched: ${herbLog.matchedAndPatched.length}, matched-no-change: ${herbLog.matchedNoChange.length}, unmatched: ${herbLog.unmatched.length}`
  )
  console.log(
    `[import-xlsx-monographs] compounds => matched-and-patched: ${compoundLog.matchedAndPatched.length}, matched-no-change: ${compoundLog.matchedNoChange.length}, unmatched: ${compoundLog.unmatched.length}`
  )
  console.log(`[import-xlsx-monographs] unmatched herb report: ${path.relative(repoRoot, unmatchedHerbsReportPath)}`)
  console.log(`[import-xlsx-monographs] unmatched compound report: ${path.relative(repoRoot, unmatchedCompoundsReportPath)}`)
}

main()
