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
const ledgerEvidenceByKey = new Map()
const ledgerSourceById = new Map()

let targetReport = null

for (const manifestName of manifests) {
  const manifestPath = path.join(enrichmentDir, manifestName)
  const { ledger, ledgerName } = parseLedger(manifestPath)

  const duplicateEvidence = []
  const duplicateSources = []
  const invalidCorrections = []
  let admittedEvidence = 0
  let correctedEvidence = 0
  let admittedSources = 0
  let correctedSources = 0

  for (const row of ledger.evidence) {
    const key = evidenceKey(row)
    if (!key) continue
    const correctionTarget = clean(row.corrects_evidence_key)

    if (correctionTarget) {
      if (key !== correctionTarget || !ledgerEvidenceByKey.has(correctionTarget)) {
        invalidCorrections.push({
          type: 'evidence',
          record_id: clean(row.record_id),
          key,
          correction_target: correctionTarget,
          reason: key !== correctionTarget ? 'identity-key-mismatch' : 'missing-earlier-ledger-target',
        })
        continue
      }
      ledgerEvidenceByKey.set(key, row)
      correctedEvidence += 1
      continue
    }

    if (evidenceKeys.has(key)) {
      duplicateEvidence.push({
        record_id: clean(row.record_id),
        entity_slug: clean(row.entity_slug || row.profile_slug),
        pmid: clean(row.pmid),
        doi: clean(row.doi),
        key,
      })
      // Preserve the first effective row for later correction targeting, matching runtime dedupe.
      if (!ledgerEvidenceByKey.has(key)) ledgerEvidenceByKey.set(key, row)
      continue
    }

    evidenceKeys.add(key)
    ledgerEvidenceByKey.set(key, row)
    admittedEvidence += 1
  }

  for (const row of ledger.sources) {
    const key = sourceKey(row)
    if (!key) continue
    const sourceId = clean(row.source_id)
    const correctionTarget = clean(row.corrects_source_id)

    if (correctionTarget) {
      if (!sourceId || sourceId !== correctionTarget || !ledgerSourceById.has(correctionTarget)) {
        invalidCorrections.push({
          type: 'source',
          source_id: sourceId,
          key,
          correction_target: correctionTarget,
          reason: sourceId !== correctionTarget ? 'source-id-mismatch' : 'missing-earlier-ledger-target',
        })
        continue
      }
      ledgerSourceById.set(sourceId, row)
      correctedSources += 1
      continue
    }

    if (sourceKeys.has(key)) {
      duplicateSources.push({
        source_id: sourceId,
        pmid: clean(row.pmid),
        doi: clean(row.doi),
        key,
      })
      if (sourceId && !ledgerSourceById.has(sourceId)) ledgerSourceById.set(sourceId, row)
      continue
    }

    sourceKeys.add(key)
    if (sourceId) ledgerSourceById.set(sourceId, row)
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
      accepted: {
        evidence_additions: admittedEvidence,
        evidence_corrections: correctedEvidence,
        source_additions: admittedSources,
        source_corrections: correctedSources,
      },
      duplicates: {
        evidence: duplicateEvidence,
        sources: duplicateSources,
      },
      invalid_corrections: invalidCorrections,
    }
    break
  }
}

if (!targetReport) throw new Error(`Target manifest was not processed: ${targetName}`)

console.log(JSON.stringify(targetReport, null, 2))

if (
  args.failOnPartial &&
  (
    targetReport.duplicates.evidence.length > 0 ||
    targetReport.duplicates.sources.length > 0 ||
    targetReport.invalid_corrections.length > 0 ||
    targetReport.accepted.evidence_additions + targetReport.accepted.evidence_corrections !== targetReport.raw.evidence ||
    targetReport.accepted.source_additions + targetReport.accepted.source_corrections !== targetReport.raw.sources
  )
) {
  console.error(
    `[enrichment-admission] ${targetName} contains silently discarded or invalid rows: ` +
    `evidence additions=${targetReport.accepted.evidence_additions}, corrections=${targetReport.accepted.evidence_corrections}, raw=${targetReport.raw.evidence}; ` +
    `source additions=${targetReport.accepted.source_additions}, corrections=${targetReport.accepted.source_corrections}, raw=${targetReport.raw.sources}; ` +
    `duplicate evidence=${targetReport.duplicates.evidence.length}, duplicate sources=${targetReport.duplicates.sources.length}, invalid corrections=${targetReport.invalid_corrections.length}`,
  )
  process.exitCode = 1
}
