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
import { normalizePmidList } from '../../lib/citation-identifiers.mjs'

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
// A canonical row can cite *several* studies. Never collapse a packed
// PMID cell or url_or_source cell to only its first PubMed identity.
const identifyRowPmids = (row) => {
  const found = new Set()
  for (const name of ['pmid', 'PMID', 'pubmed_id', 'pubmedId']) {
    for (const id of normalizePmidList(row?.[name])) found.add(id)
  }
  for (const name of ['source_url', 'source url', 'url', 'URL', 'link', 'canonicalUrl', 'url_or_source']) {
    const value = String(row?.[name] ?? '')
    for (const match of value.matchAll(/(?:https?:\/\/)?(?:www\.)?pubmed\.ncbi\.nlm\.nih\.gov\/(\d{7,9})(?=\/|\b)/gi)) {
      found.add(match[1])
    }
    // Some workbook cells store a prefixed PMID rather than a PubMed URL.
    for (const id of normalizePmidList(value)) found.add(id)
  }
  return [...found]
}
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
    for (const id of identifyRowPmids(row)) {
      const hits = map.get(id) ?? []
      hits.push({ sheet: row.__audit_sheet || sheet, row_id: cleanID(row) || null })
      map.set(id, hits)
    }
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


/**
 * Cumulative research-only PMID index is a separate scientific intake stream.
 * Its presence does not imply canonical admission, publication, clinical
 * approval, or independent trial identity. Require the finalized, fail-closed
 * manifest + status + full cumulative-index consistency before using it.
 */
export function readResearchOnlyIndex(root) {
  const dir = path.join(root, 'ops', 'enrichment-submissions', 'reconciliation')
  const candidates = fs.readdirSync(dir)
    .filter((file) => file.endsWith('-final-manifest.json'))
    .map((file) => {
      const envelope = JSON.parse(fs.readFileSync(path.join(dir, file), 'utf8'))
      const match = String(envelope.range || '').match(/^(\d+)-(\d+)$/)
      return match ? { file, envelope, through: Number(match[2]), start: Number(match[1]) } : null
    })
    .filter(Boolean)
    .sort((a, b) => b.through - a.through)
  const current = candidates[0]
  if (!current) throw new Error('No finalized research-only cumulative PMID manifest found')
  const { envelope, file, through, start } = current
  const policy = envelope.admission_policy || {}
  if (through - start + 1 !== 500 || envelope.research_only !== true ||
      envelope.fail_closed !== true || envelope.accepted_new_unique_pmids !== 500 ||
      policy.published_entities !== false || policy.recommendations !== false ||
      policy.runtime_admission !== false) {
    throw new Error('Research-only cumulative manifest admission or coverage policy invalid: ' + file)
  }
  const stem = file.replace(/-final-manifest\.json$/, '')
  const statusFile = path.join(dir, stem + '-final-status.json')
  // The status and manifest share the batch range even though the status
  // batch_id often carries an additional "-status" suffix.
  const status = JSON.parse(fs.readFileSync(statusFile, 'utf8'))
  const relative = String(envelope.cumulative_index || '')
  const expectedPrefix = 'ops/enrichment-submissions/reconciliation/'
  if (!relative.startsWith(expectedPrefix) ||
      path.basename(relative) !== relative.slice(expectedPrefix.length)) {
    throw new Error('Research index must stay in the audited reconciliation directory')
  }
  const index = JSON.parse(fs.readFileSync(path.join(root, relative), 'utf8'))
  if (status.range !== envelope.range || status.research_only !== true ||
      status.published !== false || status.verified_rows !== 500 ||
      status.total_unique_pmids !== envelope.cumulative_unique_pmids ||
      index.through_wave !== through || index.total_unique_pmids !== envelope.cumulative_unique_pmids ||
      index.previous_unique_pmids !== envelope.previous_unique_pmids ||
      !Array.isArray(index.pmids) || index.pmids.length !== index.total_unique_pmids ||
      new Set(index.pmids).size !== index.pmids.length ||
      index.pmids.some((id) => !/^\d{5,10}$/.test(String(id)))) {
    throw new Error('Research-only cumulative index, manifest and status disagree')
  }
  return {
    pmids: new Set(index.pmids.map(String)),
    provenance: {
      manifest: 'ops/enrichment-submissions/reconciliation/' + file,
      index: relative,
      range: envelope.range,
      through_wave: through,
      total_unique_pmids: index.total_unique_pmids,
      independent_clinical_review: false,
    },
  }
}

export function reconcileResearchOnlyIndex(report, { pmids, provenance }) {
  const entries = report.entries.map((entry) => {
    const researchIndex = pmids.has(entry.pmid)
    const canonical = entry.pmid_present_in_workbook
    const identityStatus = canonical && researchIndex ? 'both' :
      canonical ? 'canonical_workbook_only' :
      researchIndex ? 'research_only_index_only' : 'unmatched_exact_pmid'
    return {
      ...entry,
      pmid_in_research_only_index: researchIndex,
      exact_pmid_presence: identityStatus,
    }
  })
  const tally = (status) => entries.filter((entry) => entry.exact_pmid_presence === status).length
  const unmatched = entries.filter((entry) => entry.exact_pmid_presence === 'unmatched_exact_pmid')
    .map(({ pmid, investigations }) => ({ pmid, investigations }))
    .sort((a, b) => {
      const latestRound = (item) => Math.max(...item.investigations.map(
        (id) => Number(/^DE(\d+)-/.exec(id)?.[1] || 0),
      ))
      return latestRound(b) - latestRound(a) || Number(a.pmid) - Number(b.pmid)
    })
  return {
    ...report,
    entries,
    research_only_index: provenance,
    summary: {
      ...report.summary,
      pmids_in_research_only_index: entries.filter((e) => e.pmid_in_research_only_index).length,
      pmids_in_both_stores: tally('both'),
      pmids_in_canonical_only: tally('canonical_workbook_only'),
      pmids_in_research_only_index_only: tally('research_only_index_only'),
      pmids_not_found_in_either_by_exact_id: unmatched.length,
      pmids_in_at_least_one_store: entries.length - unmatched.length,
    },
    unmatched_exact_pmids_for_identity_review: unmatched,
    no_automatic_admissions: true,
  }
}

export async function audit(root = process.cwd()) {
  const { readWorkbook, getSheet, sheetToRows } = await import('../data/workbook-parser.mjs')
  const workbookPath = path.join(root, 'data-sources', 'herb_monograph_master.xlsx')
  if (!fs.existsSync(workbookPath)) throw new Error('Canonical workbook missing: ' + workbookPath)
  const workbook = await readWorkbook(workbookPath)
  const sourceNames = SOURCE_SHEETS.filter((name) => Array.isArray(getSheet(workbook, name)))
  const claimNames = CLAIM_SHEETS.filter((name) => Array.isArray(getSheet(workbook, name)))
  if (!sourceNames.length || !claimNames.length) {
    throw new Error('Required canonical source/study sheet missing; refusing partial results')
  }
  // Inspect every recognized worksheet, not just the first matching alias.
  // Preserve the sheet of origin on each matched record for provenance.
  const taggedRows = (names) => names.flatMap((name) =>
    sheetToRows(getSheet(workbook, name)).map((row) => ({ ...row, __audit_sheet: name })),
  )
  const report = reconcile(
    parseDeepEnrichmentDossiers(root),
    taggedRows(sourceNames),
    taggedRows(claimNames),
    sourceNames.join(', '),
    claimNames.join(', '),
  )
  report.source_sheets = sourceNames
  report.study_sheets = claimNames
  return reconcileResearchOnlyIndex(report, readResearchOnlyIndex(root))
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
