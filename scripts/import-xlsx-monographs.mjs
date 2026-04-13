#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from './workbook-source.mjs'
import { canonicalizeWorkbookRow, hasMeaningfulWorkbookValue, normalizeWorkbookCell } from './workbook-column-mapping.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '..')

const workbookPath = resolveWorkbookPath(repoRoot)
const PRIMARY_HERB_SHEET = 'Site Export Herbs'
const LEGACY_HERB_SHEET = 'Herb Monographs'
const PRIMARY_COMPOUND_SHEET = 'Site Export Compounds'
const LEGACY_COMPOUND_SHEET = 'Compound Master V3'
const TARGET_WORKBOOK_SHEETS = [
  PRIMARY_HERB_SHEET,
  LEGACY_HERB_SHEET,
  PRIMARY_COMPOUND_SHEET,
  LEGACY_COMPOUND_SHEET,
  'Herb Compound Map V3',
  'Production Export V1',
]
const OPTIONAL_WORKBOOK_SHEETS = new Set(['Production Export V1'])
const SHEET_REQUIRED_COLUMNS = {
  'Site Export Herbs': ['name'],
  'Herb Monographs': ['name'],
  'Site Export Compounds': ['compoundName'],
  'Compound Master V3': ['compoundName'],
  'Herb Compound Map V3': ['herbSlug', 'canonicalCompoundId'],
  'Production Export V1': ['goal'],
}

const herbsPath = path.join(repoRoot, 'public', 'data', 'herbs.json')
const compoundsPath = path.join(repoRoot, 'public', 'data', 'compounds.json')
const reportsDir = path.join(repoRoot, 'reports')
const unmatchedHerbsReportPath = path.join(reportsDir, 'workbook-unmatched-herbs.json')
const unmatchedCompoundsReportPath = path.join(reportsDir, 'workbook-unmatched-compounds.json')
const identityDir = path.join(repoRoot, 'data', 'identity')
const herbIdentityMapPath = path.join(identityDir, 'herb-identity-map.json')
const compoundIdentityMapPath = path.join(identityDir, 'compound-identity-map.json')
const identityMapSuggestionsPath = path.join(reportsDir, 'identity-map-suggestions.json')

const citationArtifactPatterns = [/【[^】]*】/g, /\[[\d†\-:A-Za-z]+\]/g]
const DELIMITED_SPLIT_PATTERN = /[;|]/
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
  'nil',
  'nill',
  'n.a.',
  'not applicable',
  'not available',
  '<null>',
  '(null)',
  '<na>',
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
    allowLegacyFallback: argv.includes('--allow-legacy-fallback'),
  }
}

function cleanText(value) {
  const normalized = normalizeWorkbookCell(value)
  const input = String(normalized ?? '').trim()
  if (!input) return ''

  let output = input
  for (const pattern of citationArtifactPatterns) {
    output = output.replace(pattern, '')
  }

  return output.replace(/\s+/g, ' ').trim()
}

function normalizeSlugValue(value) {
  return slugify(value).toLowerCase()
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

function normalizeIdentityKey(value) {
  return normalizeString(value)
}

function normalizeString(value) {
  return cleanText(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\p{L}\p{N}\s]+/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeCompound(value) {
  const base = normalizeString(value)
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!base) return ''
  return base
    .replace(/\bacids\b/g, 'acid')
    .replace(/\bates\b/g, 'ate')
    .replace(/\bides\b/g, 'ide')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeHerb(value) {
  return normalizeString(value)
    .replace(/\b(var|ssp|subsp|subspecies|species|spec|sp)\.?\b/g, ' ')
    .replace(/[-_/]+/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function herbNormalizationVariants(value) {
  const normalized = normalizeHerb(value)
  if (!normalized) return []
  return dedupeStrings([normalized, normalized.replace(/\s+/g, '')])
}

function compoundNormalizationVariants(value) {
  const normalized = normalizeCompound(value)
  if (!normalized) return []
  return dedupeStrings([normalized, normalized.replace(/\s+/g, ''), normalized.replace(/\bacid\b/g, 'acids')])
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

function buildIdentityVariants(value) {
  const cleaned = cleanText(value)
  if (!cleaned) return []
  const baseVariants = buildLookupVariants(cleaned)
  const variants = new Set(baseVariants)
  for (const variant of baseVariants) {
    const normalized = normalizeIdentityKey(variant)
    if (normalized) variants.add(normalized)
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
  const candidateScore = scalarStrength(candidate)
  const currentScore = scalarStrength(current)
  return candidateScore > currentScore && candidateScore >= currentScore + minGain
}

function shouldPatchArray(currentValue, candidateValue, { minItems = 1, minGain = 20 } = {}) {
  if (!Array.isArray(candidateValue) || candidateValue.length < minItems) return false
  if (weakArray(currentValue, { minItems })) return true
  const candidateScore = arrayStrength(candidateValue)
  const currentScore = arrayStrength(currentValue)
  return candidateScore > currentScore && candidateScore >= currentScore + minGain
}

function splitSemicolonDelimited(value) {
  if (Array.isArray(value)) {
    return dedupeStrings(value)
  }

  const cleaned = cleanText(value)
  if (!cleaned) return []

  return cleaned
    .split(DELIMITED_SPLIT_PATTERN)
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

function mergeSourcesPreferExisting(currentSources, candidateSources) {
  if (!Array.isArray(currentSources) || currentSources.length === 0) {
    return dedupeSources(candidateSources)
  }

  if (!Array.isArray(candidateSources) || candidateSources.length === 0) {
    return dedupeSources(currentSources)
  }

  return dedupeSources([...currentSources, ...candidateSources])
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
    if (typeof value === 'string') {
      const cleaned = cleanText(value)
      out[key] = looksJunk(cleaned) ? '' : cleaned
      continue
    }
    out[key] = value
  }
  return out
}

function createDiagnostics() {
  return {
    sheets: Object.fromEntries(
      TARGET_WORKBOOK_SHEETS.map(sheetName => [
        sheetName,
        { loadedRows: 0, skippedRows: 0, parseWarnings: [], missingRequiredColumns: [] },
      ])
    ),
    ignoredSheets: [],
  }
}

function parseSheet(workbook, sheetName, diagnostics, { optional = false } = {}) {
  const sheetDiagnostics = diagnostics.sheets[sheetName]
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    if (optional) {
      sheetDiagnostics.parseWarnings.push('Sheet not present; treated as optional and skipped.')
      return []
    }
    throw new Error(`[import-xlsx-monographs] Missing required worksheet: ${sheetName}`)
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  })
  sheetDiagnostics.loadedRows = rows.length

  const canonicalRows = rows.map(row => canonicalizeWorkbookRow(canonicalizeRow(row), sheetName))
  const requiredColumns = SHEET_REQUIRED_COLUMNS[sheetName] || []
  const observedColumns = new Set(canonicalRows.flatMap(row => Object.keys(row || {})))
  const missingRequiredColumns = requiredColumns.filter(column => !observedColumns.has(column))
  if (missingRequiredColumns.length > 0) {
    sheetDiagnostics.missingRequiredColumns = missingRequiredColumns
    sheetDiagnostics.parseWarnings.push(`Missing required columns: ${missingRequiredColumns.join(', ')}`)
  }

  return canonicalRows.filter(row => {
    const hasData = Object.values(row || {}).some(hasMeaningfulWorkbookValue)
    if (!hasData) sheetDiagnostics.skippedRows += 1
    return hasData
  })
}

function rowsByPrimaryWithOptionalFallback({ primaryRows, fallbackRows, getKey, allowLegacyFallback, entityType }) {
  if (!allowLegacyFallback) {
    return { rows: primaryRows, fallbackUsage: [] }
  }

  const fallbackByKey = new Map()
  for (const row of fallbackRows) {
    const key = cleanText(getKey(row)).toLowerCase()
    if (!key || fallbackByKey.has(key)) continue
    fallbackByKey.set(key, row)
  }

  const primaryKeys = new Set(
    primaryRows
      .map((row) => cleanText(getKey(row)).toLowerCase())
      .filter(Boolean)
  )
  const fallbackUsage = []
  const rows = [...primaryRows]

  for (const [key, row] of fallbackByKey.entries()) {
    if (primaryKeys.has(key)) continue
    rows.push(row)
    fallbackUsage.push({
      entityType,
      key,
      reason: 'missing_site_export_alignment',
      sourceSheet: entityType === 'herb' ? LEGACY_HERB_SHEET : LEGACY_COMPOUND_SHEET,
    })
  }

  return { rows, fallbackUsage }
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function isStableSlug(value) {
  const normalized = cleanText(value).toLowerCase()
  if (!normalized || looksJunk(normalized)) return false
  return normalized === normalizeSlugValue(normalized)
}

function applyValueIfChanged(record, key, value) {
  const current = record[key]
  const nextSerialized = JSON.stringify(value)
  const currentSerialized = JSON.stringify(current)
  if (nextSerialized === currentSerialized) return false
  record[key] = value
  return true
}

function patchField(record, key, value, counters) {
  const changed = applyValueIfChanged(record, key, value)
  if (changed) {
    counters[key] = (counters[key] || 0) + 1
  }
  return changed
}

function addLookupEntry(map, key, value) {
  if (!key || map.has(key)) return
  map.set(key, value)
}

function addUniqueLookupEntry(map, key, value, getIdentity) {
  if (!key) return
  if (!map.has(key)) {
    map.set(key, value)
    return
  }
  const existing = map.get(key)
  if (!existing) return
  if (getIdentity(existing) !== getIdentity(value)) {
    map.set(key, null)
  }
}

function indexHerbs(herbs) {
  const bySlug = new Map()
  const byNormalizedSlug = new Map()
  const byNormalizedName = new Map()
  const byNormalizedCommonName = new Map()
  const byNormalizedAlias = new Map()
  const herbIdentity = (herb) => cleanText(herb.slug).toLowerCase()

  for (const herb of herbs) {
    const slug = cleanText(herb.slug).toLowerCase()
    if (slug) addUniqueLookupEntry(bySlug, slug, herb, herbIdentity)
    const normalizedSlug = normalizeString(slug)
    if (normalizedSlug) addUniqueLookupEntry(byNormalizedSlug, normalizedSlug, herb, herbIdentity)

    for (const normalizedName of herbNormalizationVariants(herb.name)) {
      addUniqueLookupEntry(byNormalizedName, normalizedName, herb, herbIdentity)
    }

    for (const scientificName of herbNormalizationVariants(herb.latin || herb.scientificName)) {
      addUniqueLookupEntry(byNormalizedAlias, scientificName, herb, herbIdentity)
    }

    const commonNames = splitSemicolonDelimited(herb.commonNames)
    const aliases = Array.isArray(herb.aliases) ? herb.aliases : []
    for (const commonName of commonNames) {
      for (const normalizedCommonName of herbNormalizationVariants(commonName)) {
        addUniqueLookupEntry(byNormalizedCommonName, normalizedCommonName, herb, herbIdentity)
      }
    }

    for (const alias of [...aliases, herb.slug]) {
      for (const normalizedAlias of herbNormalizationVariants(alias)) {
        addUniqueLookupEntry(byNormalizedAlias, normalizedAlias, herb, herbIdentity)
      }
    }
  }

  return { bySlug, byNormalizedSlug, byNormalizedName, byNormalizedCommonName, byNormalizedAlias }
}

function resolveHerbPrimary(herbIndex, row) {
  const slug = cleanText(row.slug).toLowerCase()
  if (slug && herbIndex.bySlug.get(slug)) {
    return { herb: herbIndex.bySlug.get(slug), matchType: 'slug' }
  }
  return { herb: null, matchType: 'unmatched' }
}

function resolveHerbRetry(herbIndex, row) {
  for (const normalizedName of herbNormalizationVariants(row.name)) {
    const nameMatch = herbIndex.byNormalizedName.get(normalizedName)
    if (nameMatch) return { herb: nameMatch, matchType: 'normalized-name' }
  }

  return { herb: null, matchType: 'unmatched' }
}

function patchHerb(herb, row, fieldPatchCounts) {
  let patched = false

  const scientificName = cleanText(row.scientificName)
  if (shouldPatchScalar(herb.latin, scientificName, { minCandidateLength: 6, minGain: 8 })) {
    patched = patchField(herb, 'latin', scientificName, fieldPatchCounts) || patched
  }

  const descriptionCandidate = cleanText(row.description || row.summary)
  if (shouldPatchScalar(herb.description, descriptionCandidate, { minCandidateLength: 40, minGain: 80 })) {
    patched = patchField(herb, 'description', descriptionCandidate, fieldPatchCounts) || patched
  }

  const mechanismCandidate = cleanText(row.mechanism)
  if (shouldPatchScalar(herb.mechanism, mechanismCandidate, { minCandidateLength: 20, minGain: 56 })) {
    patched = patchField(herb, 'mechanism', mechanismCandidate, fieldPatchCounts) || patched
  }

  const safetyCandidate = cleanText(row.safetyNotes)
  if (shouldPatchScalar(herb.safetyNotes, safetyCandidate, { minCandidateLength: 20, minGain: 56 })) {
    patched = patchField(herb, 'safetyNotes', safetyCandidate, fieldPatchCounts) || patched
  }

  const dosageCandidate = cleanText(row.dosage)
  if (shouldPatchScalar(herb.dosage, dosageCandidate, { minCandidateLength: 10, minGain: 18 })) {
    patched = patchField(herb, 'dosage', dosageCandidate, fieldPatchCounts) || patched
  }

  const preparationCandidate = cleanText(row.preparation)
  if (shouldPatchScalar(herb.preparation, preparationCandidate, { minCandidateLength: 10, minGain: 18 })) {
    patched = patchField(herb, 'preparation', preparationCandidate, fieldPatchCounts) || patched
  }

  const regionCandidate = cleanText(row.region)
  if (shouldPatchScalar(herb.region, regionCandidate, { minCandidateLength: 4, minGain: 8 })) {
    patched = patchField(herb, 'region', regionCandidate, fieldPatchCounts) || patched
  }

  const workbookAliases = splitSemicolonDelimited(row.aliases)
  const commonNames = splitSemicolonDelimited(row.commonNames)
  const nameVariants = dedupeStrings([
    cleanText(row.name),
    normalizeLookupBase(row.name).replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim(),
  ])
  const aliasCandidate = dedupeStrings([
    ...workbookAliases,
    ...(workbookAliases.length === 0 ? commonNames : []),
    ...(workbookAliases.length === 0 && commonNames.length === 0 ? nameVariants : []),
  ])
  const hasExistingAliases = Array.isArray(herb.aliases) && herb.aliases.length > 0
  if (!hasExistingAliases && shouldPatchArray(herb.aliases, aliasCandidate, { minItems: 1, minGain: 30 })) {
    patched = patchField(herb, 'aliases', aliasCandidate, fieldPatchCounts) || patched
  }

  const compoundsCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.activeCompounds),
    ...splitSemicolonDelimited(row.markerCompounds),
  ])
  if (shouldPatchArray(herb.activeCompounds, compoundsCandidate, { minItems: 1, minGain: 30 })) {
    patched = patchField(herb, 'activeCompounds', compoundsCandidate, fieldPatchCounts) || patched
  }

  const interactionsCandidate = dedupeStrings(splitSemicolonDelimited(row.interactions))
  if (shouldPatchArray(herb.interactions, interactionsCandidate, { minItems: 1, minGain: 24 })) {
    patched = patchField(herb, 'interactions', interactionsCandidate, fieldPatchCounts) || patched
  }

  const contraindicationsCandidate = dedupeStrings(splitSemicolonDelimited(row.contraindications))
  if (shouldPatchArray(herb.contraindications, contraindicationsCandidate, { minItems: 1, minGain: 24 })) {
    patched = patchField(herb, 'contraindications', contraindicationsCandidate, fieldPatchCounts) || patched
  }

  const mechanismTagsCandidate = dedupeStrings(splitSemicolonDelimited(row.mechanismTags))
  if (shouldPatchArray(herb.mechanismTags, mechanismTagsCandidate, { minItems: 1, minGain: 18 })) {
    patched = patchField(herb, 'mechanismTags', mechanismTagsCandidate, fieldPatchCounts) || patched
  }

  const sourceCandidates = buildHerbSources(row)
  const mergedSources = mergeSourcesPreferExisting(herb.sources, sourceCandidates)
  if (shouldPatchArray(herb.sources, mergedSources, { minItems: 1, minGain: 18 })) {
    patched = patchField(herb, 'sources', mergedSources, fieldPatchCounts) || patched
  }

  return patched
}

function indexCompounds(compounds) {
  const byCanonicalId = new Map()
  const byNormalizedCanonicalId = new Map()
  const byNormalizedCanonicalName = new Map()
  const byNormalizedCompoundName = new Map()
  const compoundIdentity = (compound) => cleanText(compound.canonicalCompoundId || compound.id || compound.slug).toLowerCase()

  for (const compound of compounds) {
    const canonicalId = cleanText(compound.canonicalCompoundId || compound.id || compound.slug).toLowerCase()
    if (canonicalId) addUniqueLookupEntry(byCanonicalId, canonicalId, compound, compoundIdentity)
    const normalizedCanonicalId = normalizeString(canonicalId)
    if (normalizedCanonicalId) addUniqueLookupEntry(byNormalizedCanonicalId, normalizedCanonicalId, compound, compoundIdentity)
    for (const normalizedCanonicalName of compoundNormalizationVariants(compound.canonicalCompoundName || compound.name || compound.compoundName || compound.id || compound.canonicalCompoundId)) {
      addUniqueLookupEntry(byNormalizedCanonicalName, normalizedCanonicalName, compound, compoundIdentity)
    }
    for (const normalizedCompoundName of compoundNormalizationVariants(compound.compoundName || compound.name || compound.canonicalCompoundName || compound.id || compound.canonicalCompoundId)) {
      addUniqueLookupEntry(byNormalizedCompoundName, normalizedCompoundName, compound, compoundIdentity)
    }
  }

  return { byCanonicalId, byNormalizedCanonicalId, byNormalizedCanonicalName, byNormalizedCompoundName }
}

function resolveCompoundPrimary(compoundIndex, row) {
  const canonicalNameCandidates = [
    cleanText(row.canonicalCompoundId),
    cleanText(row.canonicalCompoundName),
    COMPOUND_EXPLICIT_ALIASES[normalizeLookupBase(row.canonicalCompoundId)] || '',
    COMPOUND_EXPLICIT_ALIASES[normalizeLookupBase(row.canonicalCompoundName)] || '',
  ]
  for (const candidate of canonicalNameCandidates) {
    for (const normalizedCanonical of compoundNormalizationVariants(candidate)) {
      const canonicalMatch = compoundIndex.byNormalizedCanonicalName.get(normalizedCanonical)
      if (canonicalMatch) return { compound: canonicalMatch, matchType: 'canonical-name' }
    }
  }

  return { compound: null, matchType: 'unmatched' }
}

function resolveCompoundRetry(compoundIndex, row) {
  const nameCandidates = [cleanText(row.compoundName), cleanText(row.canonicalCompoundName)]
  for (const candidate of nameCandidates) {
    for (const normalizedName of compoundNormalizationVariants(candidate)) {
      const nameMatch = compoundIndex.byNormalizedCompoundName.get(normalizedName)
      if (nameMatch) return { compound: nameMatch, matchType: 'normalized-name' }
    }
  }

  return { compound: null, matchType: 'unmatched' }
}

function readIdentityMap(filePath, { label }) {
  if (!fs.existsSync(filePath)) return {}
  const parsed = JSON.parse(fs.readFileSync(filePath, 'utf8'))
  if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) {
    throw new Error(`[import-xlsx-monographs] Expected ${label} to be a JSON object.`)
  }
  return parsed
}

function normalizeIdentityMap(rawMap) {
  const normalized = new Map()
  for (const [rawKey, rawValue] of Object.entries(rawMap)) {
    const key = normalizeString(rawKey)
    const value = normalizeString(rawValue)
    if (!key || !value) continue
    normalized.set(key, value)
  }
  return normalized
}

function chooseBestIdentityKey(candidates) {
  for (const candidate of candidates) {
    const key = normalizeString(candidate)
    if (key) return key
  }
  return ''
}

function resolveMappedHerb(herbIndex, mappedHerbSlug) {
  if (!mappedHerbSlug) return null
  const slugKey = cleanText(mappedHerbSlug).toLowerCase()
  return (
    herbIndex.bySlug.get(slugKey) ||
    herbIndex.byNormalizedSlug.get(normalizeString(slugKey)) ||
    null
  )
}

function resolveMappedCompound(compoundIndex, compounds, mappedCompoundId) {
  if (!mappedCompoundId) return null
  const normalizedMappedId = normalizeString(mappedCompoundId)
  return (
    compoundIndex.byCanonicalId.get(cleanText(mappedCompoundId).toLowerCase()) ||
    compoundIndex.byNormalizedCanonicalId.get(normalizedMappedId) ||
    compoundIndex.byNormalizedCanonicalName.get(normalizeCompound(mappedCompoundId)) ||
    compounds.find((entry) => normalizeString(entry.canonicalCompoundId || entry.id || entry.slug) === normalizedMappedId) ||
    compounds.find((entry) => normalizeString(entry.slug) === normalizedMappedId) ||
    null
  )
}

function scoreSimilarity(left, right) {
  const leftTokens = new Set(normalizeIdentityKey(left).split(/\s+/).filter(Boolean))
  const rightTokens = new Set(normalizeIdentityKey(right).split(/\s+/).filter(Boolean))
  if (leftTokens.size === 0 || rightTokens.size === 0) return 0
  let intersection = 0
  for (const token of leftTokens) {
    if (rightTokens.has(token)) intersection += 1
  }
  const union = new Set([...leftTokens, ...rightTokens]).size
  return union > 0 ? intersection / union : 0
}

function classifySuggestion(topScore, runnerUpScore) {
  if (topScore >= 0.92 && topScore - runnerUpScore >= 0.2) return 'high'
  if (topScore >= 0.78 && topScore - runnerUpScore >= 0.1) return 'medium'
  return 'low'
}

function buildIdentityMapSuggestions({ unmatchedRows, candidates, entityType, targetField }) {
  const suggestions = []
  for (const row of unmatchedRows) {
    const workbookLabel = cleanText(row.name || row.compoundName || row.canonicalCompoundName || row.slug || row.canonicalCompoundId)
    const workbookScientific = cleanText(row.scientificName || row.latin || '')
    const keys = dedupeStrings([workbookLabel, workbookScientific]).filter(Boolean)
    if (keys.length === 0) continue

    let best = null
    let runnerUp = 0
    for (const candidate of candidates) {
      const scoreLabel = scoreSimilarity(workbookLabel, candidate.name)
      const scoreScientific = workbookScientific ? scoreSimilarity(workbookScientific, candidate.name) : 0
      const score = Math.max(scoreLabel, scoreScientific)
      if (!best || score > best.score) {
        runnerUp = best ? best.score : runnerUp
        best = { score, candidate }
      } else if (score > runnerUp) {
        runnerUp = score
      }
    }

    if (!best || best.score < 0.62) continue
    const confidence = classifySuggestion(best.score, runnerUp)
    suggestions.push({
      entityType,
      workbookKey: chooseBestIdentityKey(keys),
      workbookLabel,
      workbookScientificName: workbookScientific || null,
      suggestedValue: cleanText(best.candidate[targetField] || best.candidate.slug || best.candidate.id).toLowerCase(),
      suggestedDisplayName: cleanText(best.candidate.name || best.candidate.compoundName || best.candidate.common || ''),
      confidence,
      score: Number(best.score.toFixed(3)),
      autoApply: false,
      reviewRequired: confidence !== 'high',
    })
  }
  return suggestions
}

function patchCompound(compound, row, reservedCanonicalIds, fieldPatchCounts) {
  let patched = false

  const workbookCanonicalId = cleanText(row.canonicalCompoundId)
  const fallbackCanonicalId = slugify(row.compoundName || row.canonicalCompoundName)
  const canonicalId = workbookCanonicalId || fallbackCanonicalId
  const canPatchCanonicalId =
    (workbookCanonicalId && isStableSlug(workbookCanonicalId)) ||
    (weakScalar(compound.canonicalCompoundId, { minLength: 3 }) && isStableSlug(fallbackCanonicalId))

  const currentCanonicalId = cleanText(compound.canonicalCompoundId || compound.id)
  const canonicalIdIsUnique = !canonicalId || !reservedCanonicalIds.has(canonicalId) || canonicalId === currentCanonicalId

  if (
    canonicalIdIsUnique &&
    canPatchCanonicalId &&
    shouldPatchScalar(compound.canonicalCompoundId, canonicalId, { minCandidateLength: 3, minGain: 0 })
  ) {
    patched = patchField(compound, 'canonicalCompoundId', canonicalId, fieldPatchCounts) || patched
  }
  if (canonicalIdIsUnique && canPatchCanonicalId && shouldPatchScalar(compound.id, canonicalId, { minCandidateLength: 3, minGain: 0 })) {
    patched = patchField(compound, 'id', canonicalId, fieldPatchCounts) || patched
  }
  if (canonicalIdIsUnique && canonicalId) {
    reservedCanonicalIds.add(canonicalId)
  }

  const compoundName = cleanText(row.compoundName || row.canonicalCompoundName)
  if (shouldPatchScalar(compound.compoundName, compoundName, { minCandidateLength: 3, minGain: 0 })) {
    patched = patchField(compound, 'compoundName', compoundName, fieldPatchCounts) || patched
  }
  if (shouldPatchScalar(compound.name, compoundName, { minCandidateLength: 3, minGain: 0 })) {
    patched = patchField(compound, 'name', compoundName, fieldPatchCounts) || patched
  }

  const classCandidate = cleanText(row.compoundClass)
  if (shouldPatchScalar(compound.category, classCandidate, { minCandidateLength: 4, minGain: 12 })) {
    patched = patchField(compound, 'category', classCandidate, fieldPatchCounts) || patched
  }
  if (shouldPatchScalar(compound.compoundClass, classCandidate, { minCandidateLength: 3, minGain: 0 })) {
    patched = patchField(compound, 'compoundClass', classCandidate, fieldPatchCounts) || patched
  }

  const mechanismCandidate = cleanText(row.mechanism)
  if (shouldPatchScalar(compound.mechanism, mechanismCandidate, { minCandidateLength: 20, minGain: 32 })) {
    patched = patchField(compound, 'mechanism', mechanismCandidate, fieldPatchCounts) || patched
  }

  const effectsCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.mechanismTags),
    ...splitSemicolonDelimited(row.pathwayTargets),
  ])
  if (shouldPatchArray(compound.effects, effectsCandidate, { minItems: 1, minGain: 20 })) {
    patched = patchField(compound, 'effects', effectsCandidate, fieldPatchCounts) || patched
  }

  const contraindicationCandidate = dedupeStrings([
    ...splitSemicolonDelimited(row.safetyNotes),
    ...splitSemicolonDelimited(row.drugInteractions),
  ])
  if (shouldPatchArray(compound.contraindications, contraindicationCandidate, { minItems: 1, minGain: 20 })) {
    patched = patchField(compound, 'contraindications', contraindicationCandidate, fieldPatchCounts) || patched
  }

  const safetyNotes = cleanText(row.safetyNotes)
  if (shouldPatchScalar(compound.safetyNotes, safetyNotes, { minCandidateLength: 3, minGain: 0 })) {
    patched = patchField(compound, 'safetyNotes', safetyNotes, fieldPatchCounts) || patched
  }

  const drugInteractions = cleanText(row.drugInteractions)
  if (shouldPatchScalar(compound.drugInteractions, drugInteractions, { minCandidateLength: 3, minGain: 0 })) {
    patched = patchField(compound, 'drugInteractions', drugInteractions, fieldPatchCounts) || patched
  }

  const herbLinksCandidate = dedupeStrings(splitSemicolonDelimited(row.relatedHerbSlugs))
  if (shouldPatchArray(compound.herbs, herbLinksCandidate, { minItems: 1, minGain: 16 })) {
    patched = patchField(compound, 'herbs', herbLinksCandidate, fieldPatchCounts) || patched
  }
  if (shouldPatchScalar(compound.relatedHerbSlugs, herbLinksCandidate.join('; '), { minCandidateLength: 3, minGain: 0 })) {
    patched = patchField(compound, 'relatedHerbSlugs', herbLinksCandidate.join('; '), fieldPatchCounts) || patched
  }

  const sourceCandidates = buildCompoundSources(row)
  const mergedSources = mergeSourcesPreferExisting(compound.sources, sourceCandidates)
  if (shouldPatchArray(compound.sources, mergedSources, { minItems: 1, minGain: 18 })) {
    patched = patchField(compound, 'sources', mergedSources, fieldPatchCounts) || patched
  }

  const sourceUrls = dedupeStrings(parseSourceUrls(row.sourceUrls))
  if (shouldPatchScalar(compound.sourceUrls, sourceUrls.join(' | '), { minCandidateLength: 8, minGain: 0 })) {
    patched = patchField(compound, 'sourceUrls', sourceUrls.join(' | '), fieldPatchCounts) || patched
  }

  const confidence = cleanText(row.confidence)
  if (shouldPatchScalar(compound.confidence, confidence, { minCandidateLength: 2, minGain: 0 })) {
    patched = patchField(compound, 'confidence', confidence, fieldPatchCounts) || patched
  }

  const evidence = cleanText(row.evidence)
  if (shouldPatchScalar(compound.evidence, evidence, { minCandidateLength: 2, minGain: 0 })) {
    patched = patchField(compound, 'evidence', evidence, fieldPatchCounts) || patched
  }

  const mechanismTags = dedupeStrings(splitSemicolonDelimited(row.mechanismTags))
  if (shouldPatchArray(compound.mechanismTags, mechanismTags, { minItems: 1, minGain: 12 })) {
    patched = patchField(compound, 'mechanismTags', mechanismTags, fieldPatchCounts) || patched
  }

  const pathwayTargets = dedupeStrings(splitSemicolonDelimited(row.pathwayTargets))
  if (shouldPatchArray(compound.pathwayTargets, pathwayTargets, { minItems: 1, minGain: 12 })) {
    patched = patchField(compound, 'pathwayTargets', pathwayTargets, fieldPatchCounts) || patched
  } else if (shouldPatchScalar(compound.pathwayTargets, pathwayTargets.join('; '), { minCandidateLength: 2, minGain: 0 })) {
    patched = patchField(compound, 'pathwayTargets', pathwayTargets.join('; '), fieldPatchCounts) || patched
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
  const diagnostics = createDiagnostics()

  if (!fs.existsSync(workbookPath)) {
    throw new Error(`[import-xlsx-monographs] Workbook not found at ${workbookPath}`)
  }

  const workbook = XLSX.readFile(workbookPath, { sheets: TARGET_WORKBOOK_SHEETS })
  diagnostics.ignoredSheets = workbook.SheetNames.filter(sheetName => !TARGET_WORKBOOK_SHEETS.includes(sheetName))
  const primaryHerbRows = parseSheet(workbook, PRIMARY_HERB_SHEET, diagnostics, { optional: true })
  const fallbackHerbRows = parseSheet(workbook, LEGACY_HERB_SHEET, diagnostics)
  const { rows: herbRows, fallbackUsage: herbFallbackUsage } = rowsByPrimaryWithOptionalFallback({
    primaryRows: primaryHerbRows,
    fallbackRows: fallbackHerbRows,
    getKey: row => cleanText(row.slug || row.herbSlug || row.name),
    allowLegacyFallback: options.allowLegacyFallback,
    entityType: 'herb',
  })

  const primaryCompoundRows = parseSheet(workbook, PRIMARY_COMPOUND_SHEET, diagnostics, { optional: true })
  const fallbackCompoundRows = parseSheet(workbook, LEGACY_COMPOUND_SHEET, diagnostics)
  const { rows: compoundRows, fallbackUsage: compoundFallbackUsage } = rowsByPrimaryWithOptionalFallback({
    primaryRows: primaryCompoundRows,
    fallbackRows: fallbackCompoundRows,
    getKey: row => cleanText(row.canonicalCompoundId || row.compoundName || row.canonicalCompoundName),
    allowLegacyFallback: options.allowLegacyFallback,
    entityType: 'compound',
  })
  parseSheet(workbook, 'Herb Compound Map V3', diagnostics)
  parseSheet(workbook, 'Production Export V1', diagnostics, { optional: OPTIONAL_WORKBOOK_SHEETS.has('Production Export V1') })

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'))
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'))

  if (!Array.isArray(herbs) || !Array.isArray(compounds)) {
    throw new Error('[import-xlsx-monographs] Expected herbs.json and compounds.json to be arrays.')
  }

  const herbIndex = indexHerbs(herbs)
  const compoundIndex = indexCompounds(compounds)
  const herbIdentityMap = normalizeIdentityMap(readIdentityMap(herbIdentityMapPath, { label: 'data/identity/herb-identity-map.json' }))
  const compoundIdentityMap = normalizeIdentityMap(readIdentityMap(compoundIdentityMapPath, { label: 'data/identity/compound-identity-map.json' }))
  const fieldPatchCounts = {
    herbs: {},
    compounds: {},
  }
  const herbMatchTypeCounts = { slug: 0, normalizedName: 0, unmatched: 0 }
  const compoundMatchTypeCounts = { canonicalName: 0, normalizedName: 0, unmatched: 0 }
  const identityDebug = {
    herbs: { hits: [], misses: [] },
    compounds: { hits: [], misses: [] },
  }
  const reservedCanonicalIds = new Set(
    compounds
      .flatMap((compound) => [cleanText(compound.canonicalCompoundId), cleanText(compound.id)])
      .filter(Boolean)
  )
  const matchedCompoundSlugs = new Set()

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

  const previousUnmatchedHerbsCount = fs.existsSync(unmatchedHerbsReportPath)
    ? JSON.parse(fs.readFileSync(unmatchedHerbsReportPath, 'utf8')).length
    : null
  const previousUnmatchedCompoundsCount = fs.existsSync(unmatchedCompoundsReportPath)
    ? JSON.parse(fs.readFileSync(unmatchedCompoundsReportPath, 'utf8')).length
    : null

  const totalFallbackUsage = herbFallbackUsage.length + compoundFallbackUsage.length
  if (options.allowLegacyFallback) {
    console.warn(`[import-xlsx-monographs] legacy fallback enabled via --allow-legacy-fallback. fallback rows used=${totalFallbackUsage}`)
  }

  const herbPrimaryUnmatchedRows = []
  for (const row of herbRows) {
    const { herb, matchType } = resolveHerbPrimary(herbIndex, row)
    if (!herb) {
      herbPrimaryUnmatchedRows.push(row)
      continue
    }
    if (matchType === 'slug') herbMatchTypeCounts.slug += 1

    const patched = patchHerb(herb, row, fieldPatchCounts.herbs)
    const payload = {
      rowSlug: cleanText(row.slug),
      rowName: cleanText(row.name),
      herbSlug: cleanText(herb.slug),
      herbName: cleanText(herb.name),
      matchType,
    }

    if (patched) {
      herbLog.matchedAndPatched.push(payload)
    } else {
      herbLog.matchedNoChange.push(payload)
    }
  }

  for (const row of herbPrimaryUnmatchedRows) {
    const { herb, matchType } = resolveHerbRetry(herbIndex, row)
    if (!herb) {
      herbLog.unmatched.push({
        slug: cleanText(row.slug),
        name: cleanText(row.name),
        scientificName: cleanText(row.scientificName),
      })
      continue
    }
    if (matchType === 'normalized-name') herbMatchTypeCounts.normalizedName += 1
    const patched = patchHerb(herb, row, fieldPatchCounts.herbs)
    const payload = {
      rowSlug: cleanText(row.slug),
      rowName: cleanText(row.name),
      herbSlug: cleanText(herb.slug),
      herbName: cleanText(herb.name),
      matchType,
    }
    if (patched) herbLog.matchedAndPatched.push(payload)
    else herbLog.matchedNoChange.push(payload)
  }
  herbMatchTypeCounts.unmatched = herbLog.unmatched.length

  const compoundPrimaryUnmatchedRows = []
  for (const row of compoundRows) {
    const { compound, matchType } = resolveCompoundPrimary(compoundIndex, row)
    if (!compound) {
      compoundPrimaryUnmatchedRows.push(row)
      continue
    }

    const compoundKey = cleanText(compound.canonicalCompoundId || compound.id || compound.slug).toLowerCase()
    if (compoundKey && matchedCompoundSlugs.has(compoundKey)) {
      continue
    }
    if (compoundKey) matchedCompoundSlugs.add(compoundKey)

    compoundMatchTypeCounts.canonicalName += 1

    const patched = patchCompound(compound, row, reservedCanonicalIds, fieldPatchCounts.compounds)
    const payload = {
      rowCompoundId: cleanText(row.canonicalCompoundId),
      rowCompoundName: cleanText(row.compoundName),
      compoundId: cleanText(compound.id),
      compoundName: cleanText(compound.name),
      matchType,
    }

    if (patched) {
      compoundLog.matchedAndPatched.push(payload)
    } else {
      compoundLog.matchedNoChange.push(payload)
    }
  }

  for (const row of compoundPrimaryUnmatchedRows) {
    const { compound, matchType } = resolveCompoundRetry(compoundIndex, row)
    if (!compound) {
      compoundLog.unmatched.push({
        canonicalCompoundId: cleanText(row.canonicalCompoundId),
        compoundName: cleanText(row.compoundName),
      })
      continue
    }
    const compoundKey = cleanText(compound.canonicalCompoundId || compound.id || compound.slug).toLowerCase()
    if (compoundKey && matchedCompoundSlugs.has(compoundKey)) {
      continue
    }
    if (compoundKey) matchedCompoundSlugs.add(compoundKey)

    if (matchType === 'normalized-name') compoundMatchTypeCounts.normalizedName += 1
    const patched = patchCompound(compound, row, reservedCanonicalIds, fieldPatchCounts.compounds)
    const payload = {
      rowCompoundId: cleanText(row.canonicalCompoundId),
      rowCompoundName: cleanText(row.compoundName),
      compoundId: cleanText(compound.id),
      compoundName: cleanText(compound.name),
      matchType,
    }
    if (patched) compoundLog.matchedAndPatched.push(payload)
    else compoundLog.matchedNoChange.push(payload)
  }
  compoundMatchTypeCounts.unmatched = compoundLog.unmatched.length

  ensureReportsDir()
  writeJson(unmatchedHerbsReportPath, herbLog.unmatched)
  writeJson(unmatchedCompoundsReportPath, compoundLog.unmatched)
  const fallbackUsageReportPath = path.join(reportsDir, 'workbook-fallback-usage.json')
  writeJson(fallbackUsageReportPath, [...herbFallbackUsage, ...compoundFallbackUsage])
  const identityMapSuggestions = {
    generatedAt: new Date().toISOString(),
    herbs: buildIdentityMapSuggestions({
      unmatchedRows: herbLog.unmatched,
      candidates: herbs,
      entityType: 'herb',
      targetField: 'slug',
    }),
    compounds: buildIdentityMapSuggestions({
      unmatchedRows: compoundLog.unmatched,
      candidates: compounds,
      entityType: 'compound',
      targetField: 'canonicalCompoundId',
    }),
  }
  writeJson(identityMapSuggestionsPath, identityMapSuggestions)

  if (!options.dryRun) {
    writeJson(herbsPath, herbs)
    writeJson(compoundsPath, compounds)
  }

  console.log(`[import-xlsx-monographs] mode: ${options.dryRun ? 'dry-run' : 'apply'}`)
  console.log(`[import-xlsx-monographs] workbook: ${workbookPath}`)
  console.log(
    `[import-xlsx-monographs] ignored non-target sheets: ${diagnostics.ignoredSheets.length > 0 ? diagnostics.ignoredSheets.join(', ') : '(none)'}`
  )
  console.log(`[import-xlsx-monographs] rows read => herbs: ${herbRows.length}, compounds: ${compoundRows.length}`)
  console.log(`[import-xlsx-monographs] herb matches => matched via slug: ${herbMatchTypeCounts.slug}, matched via normalized name: ${herbMatchTypeCounts.normalizedName}, remaining unmatched: ${herbMatchTypeCounts.unmatched}`)
  console.log(`[import-xlsx-monographs] compound matches => matched via canonical: ${compoundMatchTypeCounts.canonicalName}, matched via normalized: ${compoundMatchTypeCounts.normalizedName}, remaining unmatched: ${compoundMatchTypeCounts.unmatched}`)
  console.log(`[import-xlsx-monographs] fallback usage count: ${totalFallbackUsage}`)
  if (previousUnmatchedHerbsCount !== null) {
    const herbDelta = previousUnmatchedHerbsCount - herbLog.unmatched.length
    const herbPct = previousUnmatchedHerbsCount > 0 ? ((herbDelta / previousUnmatchedHerbsCount) * 100).toFixed(2) : '0.00'
    console.log(`[import-xlsx-monographs] herbs unmatched improvement vs previous run: ${herbDelta >= 0 ? '+' : ''}${herbDelta} (${herbPct}%)`)
  } else {
    console.log('[import-xlsx-monographs] herbs unmatched improvement vs previous run: n/a (no prior report)')
  }
  if (previousUnmatchedCompoundsCount !== null) {
    const compoundDelta = previousUnmatchedCompoundsCount - compoundLog.unmatched.length
    const compoundPct = previousUnmatchedCompoundsCount > 0 ? ((compoundDelta / previousUnmatchedCompoundsCount) * 100).toFixed(2) : '0.00'
    console.log(`[import-xlsx-monographs] compounds unmatched improvement vs previous run: ${compoundDelta >= 0 ? '+' : ''}${compoundDelta} (${compoundPct}%)`)
  } else {
    console.log('[import-xlsx-monographs] compounds unmatched improvement vs previous run: n/a (no prior report)')
  }
  console.log(
    `[import-xlsx-monographs] rows patched => herbs: ${herbLog.matchedAndPatched.length}, compounds: ${compoundLog.matchedAndPatched.length}`
  )
  console.log(
    `[import-xlsx-monographs] rows skipped (matched with no changes + unmatched) => herbs: ${herbLog.matchedNoChange.length + herbLog.unmatched.length}, compounds: ${compoundLog.matchedNoChange.length + compoundLog.unmatched.length}`
  )
  console.log(
    `[import-xlsx-monographs] herbs => matched-and-patched: ${herbLog.matchedAndPatched.length}, matched-no-change: ${herbLog.matchedNoChange.length}, unmatched: ${herbLog.unmatched.length}`
  )
  console.log(
    `[import-xlsx-monographs] compounds => matched-and-patched: ${compoundLog.matchedAndPatched.length}, matched-no-change: ${compoundLog.matchedNoChange.length}, unmatched: ${compoundLog.unmatched.length}`
  )
  console.log(`[import-xlsx-monographs] herb field patch counts: ${JSON.stringify(fieldPatchCounts.herbs)}`)
  console.log(`[import-xlsx-monographs] compound field patch counts: ${JSON.stringify(fieldPatchCounts.compounds)}`)
  console.log(`[import-xlsx-monographs] unmatched herb report: ${path.relative(repoRoot, unmatchedHerbsReportPath)}`)
  console.log(`[import-xlsx-monographs] unmatched compound report: ${path.relative(repoRoot, unmatchedCompoundsReportPath)}`)
  console.log(`[import-xlsx-monographs] fallback usage report: ${path.relative(repoRoot, fallbackUsageReportPath)}`)
  console.log(`[import-xlsx-monographs] identity map suggestions: ${path.relative(repoRoot, identityMapSuggestionsPath)}`)
  console.log(`[import-xlsx-monographs] unmatched herbs: ${JSON.stringify(herbLog.unmatched)}`)
  console.log(`[import-xlsx-monographs] unmatched compounds: ${JSON.stringify(compoundLog.unmatched)}`)
  for (const sheetName of TARGET_WORKBOOK_SHEETS) {
    const sheetDiagnostics = diagnostics.sheets[sheetName]
    console.log(`[import-xlsx-monographs][diagnostics] ${sheetName}: loaded=${sheetDiagnostics.loadedRows} skipped=${sheetDiagnostics.skippedRows}`)
    if (sheetDiagnostics.missingRequiredColumns.length > 0) {
      console.warn(
        `[import-xlsx-monographs][diagnostics] ${sheetName}: missing required columns => ${sheetDiagnostics.missingRequiredColumns.join(', ')}`
      )
    }
    for (const warning of sheetDiagnostics.parseWarnings) {
      console.warn(`[import-xlsx-monographs][diagnostics] ${sheetName}: warning => ${warning}`)
    }
  }
}

try {
  main()
} catch (error) {
  const message = error instanceof Error ? error.stack || error.message : String(error)
  console.error(`[import-xlsx-monographs] fatal error: ${message}`)
  process.exitCode = 1
}
