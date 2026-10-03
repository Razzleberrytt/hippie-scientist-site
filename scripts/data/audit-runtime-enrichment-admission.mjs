#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { gunzipSync } from 'node:zlib'
import { readWorkbookExcelJS } from '../utils/read-workbook-exceljs.mjs'
import { assertWorkbookExists, getRepoRoot, resolveWorkbookPath } from '../workbook-source.mjs'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = getRepoRoot()
const enrichmentDir = path.join(repoRoot, 'data-sources', 'runtime-enrichment')

const CLAIM_SHEETS = ['Study Registry', 'Evidence_Register', 'Sheet8']
const SOURCE_SHEETS = ['Source_Register', 'Source Register']

function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function slug(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function first(row, keys) {
  for (const key of keys) {
    const value = row?.[key]
    if (clean(value)) return value
  }
  return ''
}

function evidenceKey(row) {
  const entity = slug(first(row, ['entity_slug', 'profile_slug', 'slug', 'herb_slug', 'compound_slug']))
  const pmid = clean(first(row, ['pmid', 'PMID'])).toLowerCase()
  const doi = clean(first(row, ['doi', 'DOI']))
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
  const title = clean(first(row, ['title', 'study title', 'claim', 'summary', 'supported_claim_language']))
    .toLowerCase()
  const source = pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : title ? `title:${title}` : ''
  return entity && source ? `${entity}|${source}` : ''
}

function sourceKey(row) {
  const pmid = clean(first(row, ['pmid', 'PMID'])).toLowerCase()
  const doi = clean(first(row, ['doi', 'DOI']))
    .toLowerCase()
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//, '')
  const title = clean(first(row, ['title'])).toLowerCase()
  return pmid ? `pmid:${pmid}` : doi ? `doi:${doi}` : title ? `title:${title}` : ''
}

function findSheet(workbook, candidates) {
  return candidates.find((name) => workbook.getSheetNames().includes(name)) || ''
}

function parseLedger(manifestPath) {
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'))
  const ledgerName = clean(manifest?.ledger?.file)
  if (!ledgerName || path.basename(ledgerName) !== ledgerName) {
    throw new Error(`Invalid ledger.file in ${path.basename(manifestPath)}`)
  }

  const ledgerPath = path.join(enrichmentDir, ledgerName)
  const payload = fs.readFileSync(ledgerPath)
  const text = ledgerPath.endsWith('.gz') ? gunzipSync(payload).toString('utf8') : payload.toString('utf8')
  const ledger = JSON.parse(text)
  for (const key of ['entities', 'evidence', 'sources', 'relationships']) {
    if (!Array.isArray(ledger?.[key])) {
      throw new Error(`Ledger ${ledgerName} is missing array ${key}`)
    }
  }
  return { manifest, ledger, ledgerName }
}

function parseArgs(argv) {
  const args = { manifest: '', failOnPartial: false }
  for (let index = 2; index < argv.length; index += 1) {
    const value = argv[index]
    if (value === '--manifest') args.manifest = argv[++index] || ''
    else if (value === '--fail-on-partial') args.failOnPartial = true
  }
  if (!args.manifest) throw new Error('Usage: audit-runtime-enrichment-admission.mjs --manifest <basename> [--fail-on-partial]')
  return args
}

const args = parseArgs(process.argv)
const targetName = path.basename(args.manifest)
const manifests = fs.readdirSync(enrichmentDir)
  .filter((name) => name.endsWith('-manifest.json'))
  .sort()

if (!manifests.includes(targetName)) {
  throw new Error(`Target manifest not found: ${targetName}`)
}

const workbookPath = resolveWorkbookPath(repoRoot)
assertWorkbookExists(workbookPath)
const workbook = await readWorkbookExcelJS(workbookPath)
const claimSheet = findSheet(workbook, CLAIM_SHEETS)
const sourceSheet = findSheet(workbook, SOURCE_SHEETS)

const evidenceKeys = new Set((claimSheet ? workbook.getSheetData(claimSheet) : []).map(evidenceKey).filter(Boolean))
const sourceKeys = new Set((sourceSheet ? workbook.getSheetData(sourceSheet) : []).map(sourceKey).filter(Boolean))

let targetReport = null

for (const manifestName of manifests) {
  const manifestPath = path.join(enrichmentDir, manifestName)
  const { ledger, ledgerName } = parseLedger(manifestPath)

  const duplicateEvidence = []
  const duplicateSources = []
  let admittedEvidence = 0
  let admittedSources = 0

  for (const row of ledger.evidence) {
    const key = evidenceKey(row)
    if (!key) continue
    if (evidenceKeys.has(key)) {
      duplicateEvidence.push({
        record_id: clean(row.record_id),
        entity_slug: clean(row.entity_slug || row.profile_slug),
        pmid: clean(row.pmid),
        doi: clean(row.doi),
        key,
      })
      continue
    }
    evidenceKeys.add(key)
    admittedEvidence += 1
  }

  for (const row of ledger.sources) {
    const key = sourceKey(row)
    if (!key) continue
    if (sourceKeys.has(key)) {
      duplicateSources.push({
        source_id: clean(row.source_id),
        pmid: clean(row.pmid),
        doi: clean(row.doi),
        key,
      })
      continue
    }
    sourceKeys.add(key)
    admittedSources += 1
  }

  if (manifestName === targetName) {
    targetReport = {
      manifest: manifestName,
      ledger: ledgerName,
      raw: {
        evidence: ledger.evidence.length,
        sources: ledger.sources.length,
      },
      admitted: {
        evidence: admittedEvidence,
        sources: admittedSources,
      },
      duplicates: {
        evidence: duplicateEvidence,
        sources: duplicateSources,
      },
    }
    break
  }
}

if (!targetReport) throw new Error(`Target manifest was not processed: ${targetName}`)

console.log(JSON.stringify(targetReport, null, 2))

if (
  args.failOnPartial &&
  (targetReport.raw.evidence !== targetReport.admitted.evidence ||
   targetReport.raw.sources !== targetReport.admitted.sources)
) {
  console.error(
    `[enrichment-admission] ${targetName} is not fully additive: ` +
    `evidence ${targetReport.admitted.evidence}/${targetReport.raw.evidence}, ` +
    `sources ${targetReport.admitted.sources}/${targetReport.raw.sources}`,
  )
  process.exitCode = 1
}
