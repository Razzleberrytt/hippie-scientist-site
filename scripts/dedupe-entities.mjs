#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { countBootstrapSources } from './source-normalization.mjs'

const ROOT = process.cwd()

const DATASETS = [
  {
    type: 'herbs',
    input: 'public/data/herbs.json',
    routeBase: '/herbs',
    scientificFields: ['scientific', 'latin', 'latinName', 'scientificName'],
    displayFields: ['common', 'commonName', 'name', 'latin', 'scientific'],
  },
  {
    type: 'compounds',
    input: 'public/data/compounds.json',
    routeBase: '/compounds',
    scientificFields: ['scientific', 'latin', 'latinName', 'scientificName'],
    displayFields: ['name', 'common', 'commonName', 'latin'],
  },
]

const AUTHOR_SUFFIX_PATTERN = new RegExp(
  [
    '\\b(l|l\\.|linn\\.?|linnaeus|mill\\.?|dc\\.?|willd\\.?|thunb\\.?|lam\\.?|roxb\\.?|benth\\.?|hook\\.?f?\\.?|boiss\\.?|a\\.?rich\\.?|auct\\.?\\s*non)\\b',
    '\\b(var\\.?|subsp\\.?|ssp\\.?|f\\.?|forma|cv\\.?)\\b',
  ].join('|'),
  'gi'
)

const NOISE_PUNCTUATION_PATTERN = /[(),{};:]|\[|\]/g
const DASH_PATTERN = /[–—−]/g
const DIACRITICS_PATTERN = /[\u0300-\u036f]/g
const GREEK_LETTER_PATTERN = /[α-ως]/g
const GREEK_LETTER_NORMALIZATION_MAP = new Map([
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

const text = value => String(value || '').trim()
const asArray = value => (Array.isArray(value) ? value : [])

const slugify = value =>
  text(value)
    .normalize('NFKD')
    .replace(DIACRITICS_PATTERN, '')
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')

function normalizeScientificName(value) {
  return text(value)
    .normalize('NFKD')
    .replace(DIACRITICS_PATTERN, '')
    .replace(DASH_PATTERN, '-')
    .toLowerCase()
    .replace(NOISE_PUNCTUATION_PATTERN, ' ')
    .replace(/\./g, ' ')
    .replace(AUTHOR_SUFFIX_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function normalizeGenericName(value) {
  return text(value)
    .normalize('NFKD')
    .replace(DIACRITICS_PATTERN, '')
    .replace(GREEK_LETTER_PATTERN, character => GREEK_LETTER_NORMALIZATION_MAP.get(character) || character)
    .toLowerCase()
    .replace(DASH_PATTERN, '-')
    .replace(NOISE_PUNCTUATION_PATTERN, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

function readJson(relativePath) {
  const file = path.join(ROOT, relativePath)
  const raw = fs.readFileSync(file, 'utf8')
  const parsed = JSON.parse(raw)
  return Array.isArray(parsed) ? parsed : []
}

function writeJson(relativePath, value) {
  const file = path.join(ROOT, relativePath)
  fs.mkdirSync(path.dirname(file), { recursive: true })
  fs.writeFileSync(file, JSON.stringify(value, null, 2) + '\n', 'utf8')
}

function collectFirstNonEmpty(record, fields) {
  for (const field of fields) {
    const found = text(record?.[field])
    if (found) return found
  }
  return ''
}

function uniqueStrings(values) {
  return [...new Set(values.map(text).filter(Boolean))]
}

function mergeArrays(a, b) {
  const merged = [...asArray(a), ...asArray(b)]
  const seen = new Set()
  const out = []

  for (const item of merged) {
    const key =
      item && typeof item === 'object'
        ? JSON.stringify(item, Object.keys(item).sort())
        : JSON.stringify(text(item))
    if (seen.has(key)) continue
    seen.add(key)
    out.push(item)
  }

  return out
}

function completenessScore(record) {
  const sources = countBootstrapSources([record?.sources, record?.source, record?.references, record?.citations])
  const effects = asArray(record?.effects).length
  const contraindications = asArray(record?.contraindications).length
  const hasDescription = text(record?.description || record?.summary).length > 0 ? 1 : 0
  const hasMechanism = text(record?.mechanism).length > 0 ? 1 : 0
  return sources * 3 + effects + contraindications + hasDescription * 2 + hasMechanism * 2
}

function pickCanonicalEntry(entries) {
  return [...entries].sort((a, b) => {
    const scoreDiff = completenessScore(b.record) - completenessScore(a.record)
    if (scoreDiff !== 0) return scoreDiff

    const slugA = text(a.record?.slug)
    const slugB = text(b.record?.slug)
    const slugLenDiff = slugA.length - slugB.length
    if (slugLenDiff !== 0) return slugLenDiff

    const slugOrder = slugA.localeCompare(slugB)
    if (slugOrder !== 0) return slugOrder

    return a.index - b.index
  })[0]
}

function mergeRecord(canonical, duplicate, dataset) {
  const merged = { ...canonical }
  const keys = new Set([...Object.keys(canonical || {}), ...Object.keys(duplicate || {})])

  for (const key of keys) {
    const left = canonical?.[key]
    const right = duplicate?.[key]

    if (Array.isArray(left) || Array.isArray(right)) {
      merged[key] = mergeArrays(left, right)
      continue
    }

    if (
      left &&
      typeof left === 'object' &&
      !Array.isArray(left) &&
      right &&
      typeof right === 'object' &&
      !Array.isArray(right)
    ) {
      merged[key] = { ...left, ...right }
      continue
    }

    const leftText = text(left)
    const rightText = text(right)
    if (!leftText && rightText) {
      merged[key] = right
      continue
    }

    if (rightText && rightText.length > leftText.length && !['slug', 'id'].includes(key)) {
      merged[key] = right
    }
  }

  const displayName = collectFirstNonEmpty(merged, dataset.displayFields)
  if (displayName) {
    merged.displayName = displayName
  }

  const scientific = collectFirstNonEmpty(merged, dataset.scientificFields)
  if (scientific) {
    merged.displayScientificName = scientific
    merged.scientificNormalized = normalizeScientificName(scientific)
  }

  return merged
}

function dedupeDataset(config) {
  const input = readJson(config.input)

  const withKeys = input
    .map((record, index) => {
      const scientific = collectFirstNonEmpty(record, config.scientificFields)
      const displayName = collectFirstNonEmpty(record, config.displayFields)
      const originalSlug = text(record?.slug) || slugify(displayName || scientific || record?.id)
      const scientificKey = normalizeScientificName(scientific)
      const genericKey = normalizeGenericName(displayName || scientific)
      const dedupeKey = scientificKey || genericKey || originalSlug

      return {
        index,
        record,
        scientific,
        displayName,
        originalSlug,
        scientificKey,
        dedupeKey,
      }
    })
    .filter(item => item.dedupeKey)

  const groups = new Map()
  for (const item of withKeys) {
    if (!groups.has(item.dedupeKey)) groups.set(item.dedupeKey, [])
    groups.get(item.dedupeKey).push(item)
  }

  const deduped = []
  const report = []
  const slugAliases = {}
  const stats = {
    before: input.length,
    after: 0,
    duplicatesConsolidated: 0,
    duplicateGroups: 0,
  }

  for (const entries of groups.values()) {
    const canonicalEntry = pickCanonicalEntry(entries)
    let canonical = { ...canonicalEntry.record }
    const mergedSlugs = []
    const reportMergedSlugs = []
    const scientificAliases = []
    const nameAliases = []

    const hasDuplicates = entries.length > 1
    const canonicalSlugFromKey = hasDuplicates
      ? slugify(canonicalEntry.scientificKey || canonicalEntry.dedupeKey)
      : ''
    const canonicalSlug = hasDuplicates
      ? canonicalSlugFromKey || text(canonicalEntry.record?.slug) || canonicalEntry.originalSlug
      : text(canonicalEntry.record?.slug) || canonicalEntry.originalSlug || canonicalSlugFromKey

    for (const entry of entries) {
      const candidate = entry.record
      const candidateSlug = entry.originalSlug
      const candidateName = entry.displayName
      const candidateScientific = entry.scientific

      if (entry !== canonicalEntry) {
        canonical = mergeRecord(canonical, candidate, config)
        stats.duplicatesConsolidated += 1
        if (candidateSlug) {
          reportMergedSlugs.push(candidateSlug)
        }
        if (candidateSlug && candidateSlug !== canonicalSlug) {
          mergedSlugs.push(candidateSlug)
          slugAliases[candidateSlug] = canonicalSlug
        }
      }

      if (candidateName) nameAliases.push(candidateName)
      if (candidateScientific) scientificAliases.push(candidateScientific)
    }

    if (hasDuplicates && canonicalEntry.originalSlug && canonicalEntry.originalSlug !== canonicalSlug) {
      mergedSlugs.push(canonicalEntry.originalSlug)
      slugAliases[canonicalEntry.originalSlug] = canonicalSlug
    }

    canonical.slug = canonicalSlug
    canonical.id = text(canonical.id) || canonicalSlug

    const canonicalName = collectFirstNonEmpty(canonical, config.displayFields)
    if (canonicalName) canonical.displayName = canonicalName

    const canonicalScientific = collectFirstNonEmpty(canonical, config.scientificFields)
    if (canonicalScientific) {
      canonical.displayScientificName = canonicalScientific
      canonical.scientificNormalized = normalizeScientificName(canonicalScientific)
    }

    const canonicalAliasList = uniqueStrings([
      ...asArray(canonical.aliases),
      ...nameAliases,
      ...scientificAliases,
    ]).filter(alias => alias !== canonicalName && alias !== canonicalScientific)

    if (canonicalAliasList.length > 0) {
      canonical.aliases = canonicalAliasList
    }

    const canonicalSlugAliases = uniqueStrings([
      ...asArray(canonical.slugAliases),
      ...mergedSlugs,
    ]).filter(aliasSlug => aliasSlug && aliasSlug !== canonicalSlug)

    if (canonicalSlugAliases.length > 0) {
      canonical.slugAliases = canonicalSlugAliases
    }

    deduped.push(canonical)

    if (hasDuplicates) {
      stats.duplicateGroups += 1
      report.push({
        type: config.type,
        canonicalSlug,
        mergedSlugs: uniqueStrings(reportMergedSlugs),
        mergeReason: canonicalScientific
          ? 'scientific-name-normalization-and-author-suffix-trim'
          : 'name-normalization',
      })
    }
  }

  deduped.sort((a, b) => {
    const left = collectFirstNonEmpty(a, config.displayFields) || a.slug || a.id || ''
    const right = collectFirstNonEmpty(b, config.displayFields) || b.slug || b.id || ''
    return left.localeCompare(right)
  })

  stats.after = deduped.length

  return {
    deduped,
    report,
    slugAliases,
    stats,
  }
}

function run() {
  const reportRows = []
  const aliasMap = { herbs: {}, compounds: {} }
  const summary = {}

  for (const dataset of DATASETS) {
    const result = dedupeDataset(dataset)
    writeJson(dataset.input, result.deduped)

    for (const [from, to] of Object.entries(result.slugAliases)) {
      aliasMap[dataset.type][`${dataset.routeBase}/${from}`] = `${dataset.routeBase}/${to}`
    }

    reportRows.push(...result.report)
    summary[dataset.type] = result.stats
  }

  writeJson('public/data/entity-slug-aliases.json', aliasMap)
  writeJson('public/data/dedupe-report.json', {
    generatedAt: new Date().toISOString(),
    summary,
    merges: reportRows,
  })

  const herbStats = summary.herbs
  const compoundStats = summary.compounds
  console.log(
    `[dedupe] herbs ${herbStats.before} -> ${herbStats.after}; consolidated ${herbStats.duplicatesConsolidated} duplicates across ${herbStats.duplicateGroups} groups`
  )
  console.log(
    `[dedupe] compounds ${compoundStats.before} -> ${compoundStats.after}; consolidated ${compoundStats.duplicatesConsolidated} duplicates across ${compoundStats.duplicateGroups} groups`
  )
  console.log('[dedupe] wrote public/data/entity-slug-aliases.json and public/data/dedupe-report.json')
}

run()
