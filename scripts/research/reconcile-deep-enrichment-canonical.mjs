#!/usr/bin/env node
/**
 * Read-only Deep Enrichment PMID reconciliation against the actual canonical
 * workbook plus its manifest-verified additive research ledgers.
 *
 * This is an identity-presence audit, NOT a scientific review, complete
 * PMID/DOI duplicate admission decision, or claim promotion.
 */
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

const DIRECTORY = 'docs/research'
const DOSSIER = /^deep-enrichment-(\d+)-(\d{4}-\d{2}-\d{2})\.md$/
const INVESTIGATION = /^## (DE\d+-\d{2})\s+[—–-]\s+(.+)$/gm
const SOURCE_SHEETS = ['Source_Register', 'Source Register']
const CLAIM_SHEETS = ['Study Registry', 'Evidence_Register', 'Sheet8']

const field = (row, names) => {
  if (!row || typeof row !== 'object') return ''
  for (const name of names) {
    const value = row[name]
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim()
  }
  return ''
}
const pmid = (value) => {
  const str = String(value ?? '').trim().replace(/^PMID\s*[:#]?\s*/i, '')
  return /^\d{7,9}$/.test(str) ? str : ''
}
const pmidFromUrl = (value) => {
  const match = String(value ?? '').match(/(?:https?:\/\/)?(?:www\.)?pubmed\.ncbi\.nlm\.nih\.gov\/(\d{7,9})(?:\/|\b)/i)
  return match?.[1] || ''
}
const identifyRow = (row) => pmid(field(row, ['pmid', 'PMID', 'pubmed_id', 'pubmedId']))
  || pmidFromUrl(field(row, ['source_url', 'source url', 'url', 'URL', 'link', 'canonicalUrl']))
const cleanID = (row) => field(row, ['source_id', 'source id', 'claim_id', 'claim id', 'record_id', 'id'])
const uniqueSorted = (items) => [...new Set(items)].sort((a, b) => a.localeCompare(b))

export function parseDeepEnrichmentDossiers(root) {
  const dir = path.join(root, DIRECTORY)
  const files = fs.readdirSync(dir)
    .filter((name) => name.startsWith('deep-enrichment-'))
    .map((name) => {
      const match = name.match(DOSSIER)
      if (!match) throw new Error('Unexpected deep enrichment filename: ' + name)
      return { round: Number(match[1]), file: path.join(DIRECTORY, name) }
    })
    .filter((x) => x.round >= 10)
    .sort((a, b) => a.round - b.round)
  if (!files.length || files[0].round !== 10) throw new Error('DE dossier inventory must begin at round 10')
  for (let i = 1; i < files.length; i++) {
    if (files[i].round !== files[i - 1].round + 1) throw new Error('Missing or repeated DE round')
  }
  return files.flatMap(({ round, file }) => {
    const input = fs.readFileSync(path.join(root, file), 'utf8')
    const matches = [...input.matchAll(INVESTIGATION)]
    if (matches.length !== 10) throw new Error(file + ': expected exactly 10 investigations')
    return matches.map((match, index) => {
      const id = `DE${round}-${String(index + 1).padStart(2, '0')}`
      if (match[1] !== id) throw new Error(file + ': unexpected ID ' + match[1])
      const start = match.index + match[0].length
      const nextInvestigation = matches[index + 1]?.index ?? input.length
      const after = input.slice(start, nextInvestigation)
      const trailing = /^## (?!DE\d+-\d{2}\s+[—–-]).+$/m.exec(after)
      const body = trailing ? after.slice(0, trailing.index) : after
      const pmids = uniqueSorted([...body.matchAll(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{7,9})\/?/g)].map((m) => m[1]))
      if (!pmids.length) throw new Error('No original PMID source in ' + id)
      return { id, round, title: match[2].trim(), pmids }
    })
  })
}

function rowsByPmid(rows, sheet) {
  const map = new Map()
  for (const row of rows) {
    const id = identifyRow(row)
    if (!id) continue
    const hits = map.get(id) ?? []
    hits.push({ sheet, row_id: cleanID(row) || null })
    map.set(id, hits)
  }
  return map
}

export function reconcile(dossiers, sourceRows, claimRows, sourceSheet = 'Source_Register', claimSheet = 'Study Registry') {
  const sources = rowsByPmid(sourceRows, sourceSheet)
  const claims = rowsByPmid(claimRows, claimSheet)
  const occurrences = new Map()
  for (const dossier of dossiers) {
    for (const id of dossier.pmids) {
      const arr = occurrences.get(id) ?? []
      arr.push(dossier.id)
      occurrences.set(id, arr)
    }
  }
  const source_reuse_within_dossiers = [...occurrences.entries()]
    .filter(([, ids]) => ids.length > 1)
    .map(([identifier, investigations]) => ({ pmid: identifier, investigations }))
    .sort((a, b) => a.pmid.localeCompare(b.pmid))

  const entries = uniqueSorted([...occurrences.keys()]).map((id) => ({
    pmid: id,
    investigations: occurrences.get(id),
    workbook_source_records: sources.get(id) ?? [],
    workbook_study_claim_records: claims.get(id) ?? [],
    // Absence from selected canonical rows does not prove the PMID is novel:
    // DOI-only metadata, other journal records and pending intake may overlap.
    pmid_present_in_workbook: sources.has(id) || claims.has(id),
  }))

  const present = entries.filter((entry) => entry.pmid_present_in_workbook).length
  const out = {
    schema_version: 1,
    kind: 'research-only-canonical-pmid-presence-audit',
    canonical_basis: 'canonical workbook sheets with manifest-verified additive ledgers applied',
    full_doi_novelty_or_clinical_approval_verified: false,
    promotes_clinical_claims: false,
    notes: 'PMID exact-match audit only. Unmatched PMIDs are NOT established as net-new canonical citations. DOI-only matches, trial cohort lineage, retractions and source-to-claim approval still require independent validation.',
    summary: {
      round_count: uniqueSorted(dossiers.map((e) => String(e.round))).length,
      investigation_count: dossiers.length,
      distinct_dossier_pmids: entries.length,
      pmids_present_in_workbook_by_exact_id: present,
      pmids_not_found_in_selected_workbook_rows: entries.length - present,
      reused_pmids_between_dossiers: source_reuse_within_dossiers.length,
    },
    source_reuse_within_dossiers,
    source_rows_scanned: sourceRows.length,
    study_rows_scanned: claimRows.length,
    source_sheet: sourceSheet,
    study_sheet: claimSheet,
    entries,
  }
  return out
}

export async function audit(root = process.cwd()) {
  const { readWorkbook, getSheet, sheetToRows } = await import('../data/workbook-parser.mjs')
  const workbookPath = path.join(root, 'data-sources', 'herb_monograph_master.xlsx')
  if (!fs.existsSync(workbookPath)) throw new Error('Canonical workbook missing: ' + workbookPath)
  const workbook = await readWorkbook(workbookPath)
  const sourceName = SOURCE_SHEETS.find((name) => Array.isArray(getSheet(workbook, name)))
  const claimName = CLAIM_SHEETS.find((name) => Array.isArray(getSheet(workbook, name)))
  if (!sourceName || !claimName) throw new Error('Required canonical source/study sheet missing; refusing partial results')
  return reconcile(
    parseDeepEnrichmentDossiers(root),
    sheetToRows(getSheet(workbook, sourceName)),
    sheetToRows(getSheet(workbook, claimName)),
    sourceName,
    claimName,
  )
}

const direct = process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href
if (direct) {
  const report = await audit()
  const flag = process.argv.find((v) => v.startsWith('--report='))
  if (flag) {
    const output = path.resolve(flag.slice('--report='.length))
    fs.mkdirSync(path.dirname(output), { recursive: true })
    fs.writeFileSync(output, JSON.stringify(report, null, 2) + '\n')
    console.log('Reconciliation report: ' + path.relative(process.cwd(), output))
  }
  console.log(JSON.stringify(report.summary))
  console.log('No canonical source admissions or clinical approvals were made.')
}
