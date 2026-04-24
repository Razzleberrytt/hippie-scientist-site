#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'
import { SLUG_ALIASES } from './slug-aliases.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const INPUTS = {
  currentHerbs: path.join(repoRoot, 'public', 'data', 'herbs.json'),
  currentCompounds: path.join(repoRoot, 'public', 'data', 'compounds.json'),
  nextHerbs: path.join(repoRoot, 'public', 'data-next', 'herbs.json'),
  nextCompounds: path.join(repoRoot, 'public', 'data-next', 'compounds.json'),
}

const OUTPUTS = {
  json: path.join(repoRoot, 'reports', 'data-next-parity-report.json'),
  md: path.join(repoRoot, 'reports', 'data-next-parity-report.md'),
}

const REQUIRED_FIELDS = {
  herbs: ['name', 'slug', 'summary'],
  compounds: ['name', 'slug', 'summary'],
}

const WORKBOOK_SHEETS = {
  herbs: 'Herb Master Clean',
  compounds: 'Compound Master V3',
}

const ROOT_CAUSES = {
  MISSING_WORKBOOK_ROW: 'missing_workbook_row',
  PARSER_SKIP: 'parser_skip',
  ALIAS_MISSING: 'alias_missing',
  NORMALIZATION_DRIFT: 'normalization_drift',
  UNKNOWN: 'unknown',
}

function readJsonArray(filePath) {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing required file: ${path.relative(repoRoot, filePath)}`)
  }

  let parsed
  try {
    const raw = fs.readFileSync(filePath, 'utf8')
    parsed = JSON.parse(raw)
  } catch (error) {
    throw new Error(`Invalid JSON in ${path.relative(repoRoot, filePath)}: ${error.message}`)
  }

  if (!Array.isArray(parsed)) {
    throw new Error(`Expected array JSON in ${path.relative(repoRoot, filePath)}`)
  }

  return parsed
}

function normalizeText(value) {
  if (value === null || value === undefined) return ''
  return String(value).trim().replace(/\s+/g, ' ').toLowerCase()
}

function normalizeSlug(value) {
  return normalizeText(value)
}

function getComparableSlug(value) {
  return normalizeSlug(value).replace(/[^a-z0-9]/g, '')
}

function firstNonEmpty(row, keys) {
  for (const key of keys) {
    const value = String(row?.[key] ?? '').trim()
    if (value) return value
  }
  return ''
}

function toSimpleRow(row) {
  const output = {}
  for (const [key, value] of Object.entries(row || {})) {
    const normalizedKey = String(key ?? '').trim()
    if (!normalizedKey) continue
    output[normalizedKey] = value
  }
  return output
}

function readWorkbookRows(entityName) {
  const workbookPath = resolveWorkbookPath(repoRoot)
  const workbook = XLSX.readFile(workbookPath)
  const sheetName = WORKBOOK_SHEETS[entityName]
  const sheet = workbook.Sheets[sheetName]
  if (!sheet) {
    throw new Error(`[parity] missing workbook sheet: ${sheetName}`)
  }

  return XLSX.utils
    .sheet_to_json(sheet, {
      defval: '',
      raw: false,
      blankrows: false,
    })
    .map(toSimpleRow)
}

function getWorkbookIdentity(entityName, row) {
  if (entityName === 'herbs') {
    return {
      name: firstNonEmpty(row, ['name', 'herbName']),
      slug: normalizeSlug(firstNonEmpty(row, ['slug', 'herbSlug', 'name'])),
    }
  }

  return {
    name: firstNonEmpty(row, ['name', 'compoundName', 'canonicalCompoundName', 'compound']),
    slug: normalizeSlug(firstNonEmpty(row, ['slug', 'canonicalCompoundId', 'compoundName', 'name'])),
  }
}

function findDuplicateSlugs(records) {
  const counts = new Map()
  for (const record of records) {
    const slug = normalizeSlug(record?.slug)
    if (!slug) continue
    counts.set(slug, (counts.get(slug) || 0) + 1)
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count > 1)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .map(([slug, count]) => ({ slug, count }))
}

function buildSlugSet(records) {
  return new Set(records.map(record => normalizeSlug(record?.slug)).filter(Boolean))
}

function assessRequiredFields(records, requiredFields) {
  const missingByField = {}
  for (const field of requiredFields) {
    missingByField[field] = []
  }

  for (const record of records) {
    const slug = normalizeSlug(record?.slug) || '(missing-slug)'
    for (const field of requiredFields) {
      const value = record?.[field]
      const missing =
        value === null ||
        value === undefined ||
        (typeof value === 'string' && value.trim() === '') ||
        (Array.isArray(value) && value.length === 0)

      if (missing) {
        missingByField[field].push(slug)
      }
    }
  }

  const totals = {}
  for (const field of requiredFields) {
    totals[field] = {
      missingCount: missingByField[field].length,
      completeCount: Math.max(records.length - missingByField[field].length, 0),
    }
  }

  return { totals, missingByField }
}

function countByRootCause(items) {
  const counts = {
    [ROOT_CAUSES.MISSING_WORKBOOK_ROW]: 0,
    [ROOT_CAUSES.PARSER_SKIP]: 0,
    [ROOT_CAUSES.ALIAS_MISSING]: 0,
    [ROOT_CAUSES.NORMALIZATION_DRIFT]: 0,
    [ROOT_CAUSES.UNKNOWN]: 0,
  }

  for (const item of items) {
    const bucket = item?.rootCause || ROOT_CAUSES.UNKNOWN
    if (!Object.prototype.hasOwnProperty.call(counts, bucket)) {
      counts[ROOT_CAUSES.UNKNOWN] += 1
      continue
    }
    counts[bucket] += 1
  }

  return counts
}

function classifyByNameSlugDifference(currentSlug, nextSlug) {
  if (!currentSlug || !nextSlug) return ROOT_CAUSES.UNKNOWN
  return getComparableSlug(currentSlug) === getComparableSlug(nextSlug)
    ? ROOT_CAUSES.NORMALIZATION_DRIFT
    : ROOT_CAUSES.ALIAS_MISSING
}

function createIndexes(records) {
  const bySlug = new Map()
  const byName = new Map()

  for (const record of records) {
    const slug = normalizeSlug(record?.slug)
    const name = normalizeText(record?.name)
    if (slug && !bySlug.has(slug)) {
      bySlug.set(slug, record)
    }
    if (name && !byName.has(name)) {
      byName.set(name, record)
    }
  }

  return { bySlug, byName }
}

function createWorkbookIndexes(entityName, rows) {
  const bySlug = new Set()
  const byName = new Set()

  for (const row of rows) {
    const identity = getWorkbookIdentity(entityName, row)
    if (identity.slug) bySlug.add(identity.slug)
    if (normalizeText(identity.name)) byName.add(normalizeText(identity.name))
  }

  return { bySlug, byName }
}

function analyzeSlugParity(entityName, currentRecords, nextRecords, workbookRows) {
  const aliases = SLUG_ALIASES[entityName] || {}
  const currentIndexes = createIndexes(currentRecords)
  const nextIndexes = createIndexes(nextRecords)
  const workbookIndexes = createWorkbookIndexes(entityName, workbookRows)

  const currentSet = buildSlugSet(currentRecords)
  const nextSet = buildSlugSet(nextRecords)

  const directMatches = Array.from(currentSet).filter(slug => nextSet.has(slug)).sort()

  const aliasMatches = []
  const matchedCurrentSlugs = new Set(directMatches)
  const matchedNextSlugs = new Set(directMatches)

  for (const [fromSlugRaw, toSlugRaw] of Object.entries(aliases)) {
    const fromSlug = normalizeSlug(fromSlugRaw)
    const toSlug = normalizeSlug(toSlugRaw)
    if (!fromSlug || !toSlug) continue
    if (!currentSet.has(fromSlug)) continue
    if (!nextSet.has(toSlug)) continue

    const currentRecord = currentIndexes.bySlug.get(fromSlug)
    const nextRecord = nextIndexes.bySlug.get(toSlug)

    aliasMatches.push({
      fromSlug,
      toSlug,
      currentName: currentRecord?.name || '',
      nextName: nextRecord?.name || '',
    })

    matchedCurrentSlugs.add(fromSlug)
    matchedNextSlugs.add(toSlug)
  }

  const unresolvedMissing = Array.from(currentSet)
    .filter(slug => !matchedCurrentSlugs.has(slug))
    .map(slug => {
      const currentRecord = currentIndexes.bySlug.get(slug)
      const normalizedName = normalizeText(currentRecord?.name)
      const nextByName = normalizedName ? nextIndexes.byName.get(normalizedName) : null

      let rootCause = ROOT_CAUSES.UNKNOWN
      let evidence = ''

      if (nextByName && normalizeSlug(nextByName.slug) !== slug) {
        rootCause = classifyByNameSlugDifference(slug, normalizeSlug(nextByName.slug))
        evidence = `name_match:${normalizeSlug(nextByName.slug)}`
      } else {
        const inWorkbook = workbookIndexes.bySlug.has(slug) || (normalizedName && workbookIndexes.byName.has(normalizedName))
        if (inWorkbook) {
          rootCause = ROOT_CAUSES.PARSER_SKIP
          evidence = 'present_in_workbook_not_emitted'
        } else {
          rootCause = ROOT_CAUSES.MISSING_WORKBOOK_ROW
          evidence = 'absent_from_workbook_rows'
        }
      }

      return {
        slug,
        name: currentRecord?.name || '',
        rootCause,
        evidence,
      }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))

  const unresolvedExtras = Array.from(nextSet)
    .filter(slug => !matchedNextSlugs.has(slug))
    .map(slug => {
      const nextRecord = nextIndexes.bySlug.get(slug)
      const normalizedName = normalizeText(nextRecord?.name)
      const currentByName = normalizedName ? currentIndexes.byName.get(normalizedName) : null

      let rootCause = ROOT_CAUSES.UNKNOWN
      let evidence = ''

      if (currentByName && normalizeSlug(currentByName.slug) !== slug) {
        rootCause = classifyByNameSlugDifference(normalizeSlug(currentByName.slug), slug)
        evidence = `name_match:${normalizeSlug(currentByName.slug)}`
      }

      return {
        slug,
        name: nextRecord?.name || '',
        rootCause,
        evidence,
      }
    })
    .sort((a, b) => a.slug.localeCompare(b.slug))

  return {
    currentSet,
    nextSet,
    directMatches,
    aliasMatches,
    unresolvedMissing,
    unresolvedExtras,
    rootCauseBuckets: {
      unresolvedMissing: countByRootCause(unresolvedMissing),
      unresolvedExtras: countByRootCause(unresolvedExtras),
    },
  }
}

function buildEntityParity(entityName, currentRecords, nextRecords, workbookRows) {
  const slugParity = analyzeSlugParity(entityName, currentRecords, nextRecords, workbookRows)

  return {
    entity: entityName,
    counts: {
      current: currentRecords.length,
      next: nextRecords.length,
      delta: nextRecords.length - currentRecords.length,
    },
    slugSets: {
      currentUnique: slugParity.currentSet.size,
      nextUnique: slugParity.nextSet.size,
      directMatchesCount: slugParity.directMatches.length,
      aliasMatchesCount: slugParity.aliasMatches.length,
      missingInNextCount: slugParity.unresolvedMissing.length,
      extraInNextCount: slugParity.unresolvedExtras.length,
      directMatches: slugParity.directMatches,
      aliasMatches: slugParity.aliasMatches,
      unresolvedMissing: slugParity.unresolvedMissing,
      unresolvedExtras: slugParity.unresolvedExtras,
      rootCauseBuckets: slugParity.rootCauseBuckets,
    },
    requiredFields: {
      current: assessRequiredFields(currentRecords, REQUIRED_FIELDS[entityName]),
      next: assessRequiredFields(nextRecords, REQUIRED_FIELDS[entityName]),
    },
    duplicateSlugs: {
      current: findDuplicateSlugs(currentRecords),
      next: findDuplicateSlugs(nextRecords),
    },
  }
}

function formatTopList(items, label, count = 25) {
  const sliced = items.slice(0, count)
  if (sliced.length === 0) {
    return [`### ${label}`, '', '- none', '']
  }

  const lines = [`### ${label}`, '']
  for (const item of sliced) {
    lines.push(`- ${item.slug}${item.name ? ` (${item.name})` : ''} [${item.rootCause}]`)
  }
  lines.push('')
  return lines
}

function writeOutputs(report) {
  fs.mkdirSync(path.dirname(OUTPUTS.json), { recursive: true })
  fs.writeFileSync(OUTPUTS.json, `${JSON.stringify(report, null, 2)}\n`, 'utf8')

  const rootCauseLines = entity =>
    Object.entries(report[entity].slugSets.rootCauseBuckets.unresolvedMissing)
      .map(([bucket, value]) => `${bucket}=${value}`)
      .join(', ')

  const mdLines = [
    '# Data-next parity report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    '## Counts',
    '',
    '| Entity | Current | Data-next | Delta |',
    '|---|---:|---:|---:|',
    `| Herbs | ${report.herbs.counts.current} | ${report.herbs.counts.next} | ${report.herbs.counts.delta} |`,
    `| Compounds | ${report.compounds.counts.current} | ${report.compounds.counts.next} | ${report.compounds.counts.delta} |`,
    '',
    '## Slug parity',
    '',
    `- Herbs direct matches: ${report.herbs.slugSets.directMatchesCount}`,
    `- Herbs alias matches: ${report.herbs.slugSets.aliasMatchesCount}`,
    `- Herbs unresolved missing in data-next: ${report.herbs.slugSets.missingInNextCount}`,
    `- Herbs unresolved extra in data-next: ${report.herbs.slugSets.extraInNextCount}`,
    `- Compounds direct matches: ${report.compounds.slugSets.directMatchesCount}`,
    `- Compounds alias matches: ${report.compounds.slugSets.aliasMatchesCount}`,
    `- Compounds unresolved missing in data-next: ${report.compounds.slugSets.missingInNextCount}`,
    `- Compounds unresolved extra in data-next: ${report.compounds.slugSets.extraInNextCount}`,
    '',
    '## Root-cause bucket counts (unresolved missing)',
    '',
    `- Herbs: ${rootCauseLines('herbs')}`,
    `- Compounds: ${rootCauseLines('compounds')}`,
    '',
    '## Required field gaps (data-next)',
    '',
    `- Herbs: ${Object.entries(report.herbs.requiredFields.next.totals)
      .map(([field, stats]) => `${field} missing=${stats.missingCount}`)
      .join(', ')}`,
    `- Compounds: ${Object.entries(report.compounds.requiredFields.next.totals)
      .map(([field, stats]) => `${field} missing=${stats.missingCount}`)
      .join(', ')}`,
    '',
    '## Duplicate slug counts',
    '',
    `- Herbs current/data-next: ${report.herbs.duplicateSlugs.current.length}/${report.herbs.duplicateSlugs.next.length}`,
    `- Compounds current/data-next: ${report.compounds.duplicateSlugs.current.length}/${report.compounds.duplicateSlugs.next.length}`,
    '',
    ...formatTopList(report.herbs.slugSets.unresolvedMissing, 'Top 25 unresolved missing herbs'),
    ...formatTopList(report.compounds.slugSets.unresolvedMissing, 'Top 25 unresolved missing compounds'),
    ...formatTopList(report.herbs.slugSets.unresolvedExtras, 'Top 25 extra herbs'),
    ...formatTopList(report.compounds.slugSets.unresolvedExtras, 'Top 25 extra compounds'),
  ]

  fs.writeFileSync(OUTPUTS.md, `${mdLines.join('\n')}\n`, 'utf8')
}

function printSummary(report) {
  console.log('[parity] Data-next migration parity summary')
  console.log(`- herbs current=${report.herbs.counts.current} next=${report.herbs.counts.next} delta=${report.herbs.counts.delta}`)
  console.log(`- compounds current=${report.compounds.counts.current} next=${report.compounds.counts.next} delta=${report.compounds.counts.delta}`)
  console.log(
    `- slug gaps herbs missing=${report.herbs.slugSets.missingInNextCount} extra=${report.herbs.slugSets.extraInNextCount} alias=${report.herbs.slugSets.aliasMatchesCount}; compounds missing=${report.compounds.slugSets.missingInNextCount} extra=${report.compounds.slugSets.extraInNextCount} alias=${report.compounds.slugSets.aliasMatchesCount}`,
  )
  console.log(
    `- duplicate slug groups herbs current/next=${report.herbs.duplicateSlugs.current.length}/${report.herbs.duplicateSlugs.next.length}; compounds current/next=${report.compounds.duplicateSlugs.current.length}/${report.compounds.duplicateSlugs.next.length}`,
  )
  console.log(`- wrote ${path.relative(repoRoot, OUTPUTS.json)}`)
  console.log(`- wrote ${path.relative(repoRoot, OUTPUTS.md)}`)
}

function run() {
  const currentHerbs = readJsonArray(INPUTS.currentHerbs)
  const currentCompounds = readJsonArray(INPUTS.currentCompounds)
  const nextHerbs = readJsonArray(INPUTS.nextHerbs)
  const nextCompounds = readJsonArray(INPUTS.nextCompounds)

  const workbookHerbs = readWorkbookRows('herbs')
  const workbookCompounds = readWorkbookRows('compounds')

  const report = {
    generatedAt: new Date().toISOString(),
    herbs: buildEntityParity('herbs', currentHerbs, nextHerbs, workbookHerbs),
    compounds: buildEntityParity('compounds', currentCompounds, nextCompounds, workbookCompounds),
  }

  writeOutputs(report)
  printSummary(report)
}

run()
