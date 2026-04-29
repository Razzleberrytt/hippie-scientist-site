#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import XLSX from 'xlsx'
import { resolveWorkbookPath } from '../workbook-source.mjs'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)
const repoRoot = path.resolve(__dirname, '../..')

const REQUIRED_SHEETS = {
  herbs: 'Herb Master V3',
  compounds: 'Compound Master V3',
  herbCompoundMap: 'Herb Compound Map V3',
  claimRows: 'Claim Rows',
  researchQueue: 'Research Queue',
}

const PLACEHOLDER_TOKENS = new Set([
  '',
  'unknown',
  'nan',
  'null',
  'undefined',
  '[object object]',
])

const DEFAULT_SUMMARY = 'Profile pending review'

function parseArgs(argv) {
  const args = argv.slice(2)
  let relativeOut = 'public/data'

  for (let i = 0; i < args.length; i += 1) {
    if (args[i] === '--out') {
      relativeOut = args[i + 1] || ''
      i += 1
    } else if (args[i].startsWith('--out=')) {
      relativeOut = args[i].slice('--out='.length)
    }
  }

  if (!relativeOut.trim()) {
    throw new Error('[data] Missing --out value')
  }

  return {
    outputDir: path.resolve(repoRoot, relativeOut),
    outputLabel: relativeOut,
  }
}

function cleanText(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && Number.isNaN(value)) return ''

  const text = String(value).replace(/\s+/g, ' ').trim()
  if (!text) return ''

  if (PLACEHOLDER_TOKENS.has(text.toLowerCase())) return ''

  return text
}

function cleanList(value) {
  const text = cleanText(value)
  if (!text) return []

  return [
    ...new Set(
      text
        .split(/[;|,\n]/)
        .map(item => cleanText(item))
        .filter(Boolean),
    ),
  ]
}

function slugify(value) {
  return cleanText(value)
    .toLowerCase()
    .replace(/α/g, 'alpha')
    .replace(/β/g, 'beta')
    .replace(/γ/g, 'gamma')
    .replace(/δ/g, 'delta')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function first(row, keys) {
  for (const key of keys) {
    const value = cleanText(row[key])
    if (value) return value
  }
  return ''
}

function isWorkbookDataRow(row) {
  return Object.entries(row).some(([key, value]) => {
    if (key.startsWith('__')) return false
    return Boolean(cleanText(value))
  })
}

function readSheet(workbook, sheetName) {
  const sheet = workbook.Sheets[sheetName]

  if (!sheet) {
    throw new Error(`[data] Missing required workbook sheet: ${sheetName}`)
  }

  const rows = XLSX.utils.sheet_to_json(sheet, {
    defval: '',
    raw: false,
    blankrows: false,
  })
    .map((row, index) => ({
      ...row,
      __meta: {
        sheetName,
        excelRow: index + 2,
      },
    }))
    .filter(isWorkbookDataRow)

  if (!rows.length) {
    throw new Error(`[data] Required sheet has zero rows: ${sheetName}`)
  }

  return rows
}

function numeric(value) {
  const parsed = Number.parseInt(cleanText(value), 10)
  return Number.isFinite(parsed) ? parsed : 0
}

function qualityTier(row) {
  const direct = first(row, [
    'qualityTier',
    'quality_tier',
    'publicationStatus',
    'publication_status',
    'confidenceTier_v2',
  ]).toLowerCase()

  if (direct.includes('strong')) return 'strong'
  if (direct.includes('publish')) return 'publishable'
  if (direct.includes('a')) return 'strong'
  if (direct.includes('b')) return 'publishable'

  const hasName = Boolean(cleanText(row.name || row.commonName))
  const hasSlug = Boolean(cleanText(row.slug))
  const hasSummary = Boolean(cleanText(row.summary || row.description))
  const hasSafety = Boolean(cleanText(row.safetyNotes))
  if (hasName && hasSlug && hasSummary && hasSafety) return 'publishable'

  return 'needs_work'
}

function isPublishable(record) {
  return record.qualityTier === 'strong' || record.qualityTier === 'publishable'
}

function identityDebug(record) {
  const raw = record.__raw || {}
  const meta = record.__meta || raw.__meta || {}
  const identityKeys = [
    'slug',
    'herbSlug',
    'compoundSlug',
    'name',
    'herbName',
    'commonName',
    'compoundName',
    'canonicalCompoundName',
    'canonicalCompoundId',
    'id',
  ]

  const rawIdentity = Object.fromEntries(
    identityKeys
      .filter(key => Object.prototype.hasOwnProperty.call(raw, key))
      .map(key => [key, raw[key]]),
  )

  return [
    `sheet=${meta.sheetName || 'unknown'}`,
    `excelRow=${meta.excelRow || 'unknown'}`,
    `name=${JSON.stringify(record.name || '')}`,
    `slug=${JSON.stringify(record.slug || '')}`,
    `rawIdentity=${JSON.stringify(rawIdentity)}`,
  ].join(' ')
}

function assertIdentity(record, type) {
  if (!record.name || !record.slug) {
    throw new Error(`[data] Invalid ${type}: missing name or slug (${identityDebug(record)})`)
  }

  if (record.name.length <= 1 || record.slug.length <= 1) {
    throw new Error(`[data] Invalid ${type}: weak identity (${identityDebug(record)})`)
  }
}

function herbFromRow(row) {
  const name = first(row, ['name', 'herbName', 'commonName'])
  const slug = slugify(first(row, ['slug', 'herbSlug', 'name', 'herbName']))

  return {
    __meta: row.__meta,
    __raw: row,
    id: slug,
    name,
    slug,
    summary: first(row, ['summary', 'hero']) || DEFAULT_SUMMARY,
    description: first(row, ['description']),
    mechanisms: cleanList(first(row, ['mechanisms', 'mechanism', 'pathwayTargets'])),
    safetyNotes: first(row, ['safetyNotes', 'safety']),
    contraindications: cleanList(first(row, ['contraindications'])),
    interactions: cleanList(first(row, ['interactions'])),
    dosage: first(row, ['dosage', 'dose']),
    preparation: first(row, ['preparation']),
    region: first(row, ['region']),
    evidenceLevel: first(row, ['evidenceLevel', 'evidenceTier', 'evidence_tier']),
    sourceCount: numeric(first(row, ['sourceCount', 'source_count', 'sourcesCount'])),
    confidenceTier: first(row, ['confidenceTier', 'confidenceLevel', 'confidenceTier_v2']),
    qualityTier: qualityTier(row),
  }
}

function compoundFromRow(row) {
  const name = first(row, ['name', 'compoundName', 'canonicalCompoundName', 'compound'])
  const slug = slugify(first(row, ['slug', 'canonicalCompoundId', 'compoundName', 'name']))

  return {
    __meta: row.__meta,
    __raw: row,
    id: slug,
    name,
    slug,
    summary: first(row, ['summary']) || DEFAULT_SUMMARY,
    description: first(row, ['description']),
    compoundClass: first(row, ['compoundClass', 'class']),
    mechanisms: cleanList(first(row, ['mechanisms', 'mechanism', 'mechanismTags'])),
    targets: cleanList(first(row, ['targets', 'pathwayTargets'])),
    foundIn: [],
    safetyNotes: first(row, ['safetyNotes', 'safety']),
    evidenceLevel: first(row, ['evidenceLevel', 'evidenceTier', 'evidence_tier']),
    evidenceType: first(row, ['evidenceType', 'evidence_type']),
    sourceCount: numeric(first(row, ['sourceCount', 'source_count', 'sourcesCount'])),
    confidenceTier: first(row, ['confidenceTier', 'confidenceLevel', 'confidenceTier_v2']),
    confidenceReason: first(row, ['confidenceReason']),
    qualityTier: qualityTier(row),
  }
}

function publicRecord(record) {
  const { __meta, __raw, ...publicFields } = record
  return publicFields
}

function summaryRecord(record) {
  return {
    id: record.id,
    name: record.name,
    slug: record.slug,
    summary: record.summary || DEFAULT_SUMMARY,
    evidenceLevel: record.evidenceLevel || '',
    sourceCount: record.sourceCount || 0,
    confidenceTier: record.confidenceTier || '',
    qualityTier: record.qualityTier,
  }
}

function writeJson(filePath, payload) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8')
}

function detectDuplicates(records, type) {
  const seen = new Set()
  const duplicates = []

  for (const record of records) {
    if (seen.has(record.slug)) {
      duplicates.push(`${type}:${record.slug}`)
    }
    seen.add(record.slug)
  }

  return duplicates
}

function run() {
  const { outputDir, outputLabel } = parseArgs(process.argv)

  const workbookPath = resolveWorkbookPath(repoRoot)
  const workbook = XLSX.readFile(workbookPath)

  const herbRows = readSheet(workbook, REQUIRED_SHEETS.herbs)
  const compoundRows = readSheet(workbook, REQUIRED_SHEETS.compounds)
  const mapRows = readSheet(workbook, REQUIRED_SHEETS.herbCompoundMap)
  const claimRows = readSheet(workbook, REQUIRED_SHEETS.claimRows)
  const researchQueueRows = readSheet(workbook, REQUIRED_SHEETS.researchQueue)

  const herbs = herbRows.map(herbFromRow)
  const compounds = compoundRows.map(compoundFromRow)
  const seenCompoundNames = new Map()
  const dedupedCompounds = compounds.filter(compound => {
    const key = compound.name.toLowerCase().trim()
    if (seenCompoundNames.has(key)) {
      console.warn(
        `[data] duplicate compound dropped: ${compound.slug} (dupe of ${seenCompoundNames.get(key)})`,
      )
      return false
    }
    seenCompoundNames.set(key, compound.slug)
    return true
  })

  console.log(
    `[data] herbs: ${herbs.length} total, ${herbs.filter(h => h.summary).length} with summary`,
  )
  console.log(`[data] compounds: ${compounds.length} total`)
  console.log(`[data] compounds: ${dedupedCompounds.length} after canonical-name dedupe`)

  for (const herb of herbs) assertIdentity(herb, 'herb')
  for (const compound of dedupedCompounds) assertIdentity(compound, 'compound')

  const duplicateSlugs = [
    ...detectDuplicates(herbs, 'herb'),
    ...detectDuplicates(dedupedCompounds, 'compound'),
  ]

  if (duplicateSlugs.length > 0) {
    throw new Error(`[data] Duplicate slugs found:\n${duplicateSlugs.join('\n')}`)
  }

  const herbNameBySlug = new Map(herbs.map(herb => [herb.slug, herb.name]))
  const foundInByCompound = new Map()

  for (const row of mapRows) {
    const herbSlug = slugify(first(row, ['herbSlug', 'herb', 'herbName']))
    const compoundSlug = slugify(
      first(row, ['compoundSlug', 'slug', 'canonicalCompoundId', 'canonicalCompoundName', 'compoundName']),
    )

    if (!herbSlug || !compoundSlug) continue

    const herbName = herbNameBySlug.get(herbSlug) || herbSlug
    const list = foundInByCompound.get(compoundSlug) || []

    if (!list.includes(herbName)) {
      list.push(herbName)
      foundInByCompound.set(compoundSlug, list)
    }
  }

  for (const compound of dedupedCompounds) {
    compound.foundIn = (foundInByCompound.get(compound.slug) || []).sort((a, b) =>
      a.localeCompare(b),
    )
  }

  const publishableHerbs = herbs.filter(isPublishable).map(publicRecord)
  const publishableCompounds = dedupedCompounds.filter(isPublishable).map(publicRecord)
  const exportedHerbs = herbs.map(publicRecord)

  const invalidPublishable = [
    ...publishableHerbs
      .filter(herb => !herb.description)
      .map(herb => `herb:${herb.slug}: missing description`),
    ...publishableCompounds
      .filter(compound => !compound.description && !compound.summary)
      .map(compound => `compound:${compound.slug}: missing description/summary`),
  ]

  if (invalidPublishable.length > 0) {
    throw new Error(
      `[data] Publishable records failed validation:\n${invalidPublishable
        .slice(0, 50)
        .join('\n')}`,
    )
  }

  fs.rmSync(outputDir, { recursive: true, force: true })
  fs.mkdirSync(outputDir, { recursive: true })

  writeJson(path.join(outputDir, 'herbs.json'), exportedHerbs)
  writeJson(path.join(outputDir, 'compounds.json'), publishableCompounds)
  writeJson(path.join(outputDir, 'herbs-summary.json'), exportedHerbs.map(summaryRecord))
  writeJson(path.join(outputDir, 'compounds-summary.json'), publishableCompounds.map(summaryRecord))

  for (const herb of exportedHerbs) {
    writeJson(path.join(outputDir, 'herbs-detail', `${herb.slug}.json`), herb)
  }

  for (const compound of publishableCompounds) {
    writeJson(path.join(outputDir, 'compounds-detail', `${compound.slug}.json`), compound)
  }

  const buildReport = {
    generatedAt: new Date().toISOString(),
    dataVersion: 'v1',
    sourceWorkbook: path.relative(repoRoot, workbookPath),
    output: outputLabel,
    totals: {
      workbookHerbs: herbs.length,
      workbookCompounds: compounds.length,
      dedupedWorkbookCompounds: dedupedCompounds.length,
      exportedHerbs: exportedHerbs.length,
      publishableHerbs: publishableHerbs.length,
      publishableCompounds: publishableCompounds.length,
      needsWorkHerbs: herbs.filter(record => !isPublishable(record)).length,
      needsWorkCompounds: dedupedCompounds.filter(record => !isPublishable(record)).length,
      claimRows: claimRows.length,
      researchQueueRows: researchQueueRows.length,
      missingHerbDosage: herbs.filter(record => !record.dosage).length,
      duplicateSlugs: duplicateSlugs.length,
      invalidPublishable: invalidPublishable.length,
    },
    rules: {
      sourceOfTruth: 'data-sources/herb_monograph_master.xlsx',
      generatedOnly: 'public/data',
      uiMustNotRepairBadData: true,
      needsWorkExcludedFromRoutes: true,
      duplicateSlugsFailBuild: true,
      missingIdentityFailsBuild: true,
    },
  }

  writeJson(path.join(outputDir, 'build-report.json'), buildReport)
  writeJson(path.join(outputDir, '_meta', 'build-info.json'), buildReport)

  console.log(`[data] workbook=${path.relative(repoRoot, workbookPath)}`)
  console.log(`[data] output=${outputLabel}`)
  console.log(`[data] herbs=${exportedHerbs.length}/${herbs.length}`)
  console.log(`[data] compounds=${publishableCompounds.length}/${dedupedCompounds.length}`)
  console.log(`[data] build-report=${path.join(outputLabel, 'build-report.json')}`)
}

run()
