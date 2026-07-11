#!/usr/bin/env node

import crypto from 'node:crypto'
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const reviewedAt = new Date().toISOString()
const reviewSource = 'editorial-review:l-theanine-pilot-final'

const approvedClaimIds = new Set([
  'clm_1c6f8ef18694',
  'clm_536416fd7202',
  'clm_57db73f124e1',
  'clm_e2f7a00c9a21',
  'clm_ea53ecebd001',
  'clm_f6cf48fbab00',
])

const deprecatedClaimIds = new Set([
  'clm_180b5f6a572b',
  'clm_324f56d1fe6d',
  'clm_9b7e8890480e',
  'clm_9cba3e060690',
  'clm_bf0f9b1568ec',
  'clm_fa83282fb79f',
])

const approvedSourceIds = new Set([
  'src_007e539d5b28',
  'src_042e8f442539',
  'src_11b852f129b3',
  'src_1b56d3987ae1',
  'src_31b5b5b5a562',
  'src_713fa356b5be',
  'src_ab3dacfeda2c',
  'src_c81887683f55',
])

const deprecatedSourceIds = new Set(['src_7fb914c1aece'])

function readJsonl(file) {
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).filter(Boolean).map((line) => JSON.parse(line))
}

function writeJsonl(file, records) {
  fs.writeFileSync(file, `${records.map((record) => JSON.stringify(record)).join('\n')}\n`, 'utf8')
}

function addReviewProvenance(record, notes) {
  const provenance = Array.isArray(record.provenance) ? record.provenance : []
  if (!provenance.some((entry) => entry?.source === reviewSource)) {
    provenance.push({ source: reviewSource, at: reviewedAt, notes })
  }
  record.provenance = provenance
  record.updated_at = reviewedAt
}

const claimsFile = path.join(root, 'data/canonical/claims/claims.jsonl')
const claims = readJsonl(claimsFile)
let approvedClaims = 0
let deprecatedClaims = 0
for (const claim of claims) {
  if (approvedClaimIds.has(claim.id)) {
    claim.review_status = 'approved'
    addReviewProvenance(claim, 'Approved after final editorial review of the L-theanine Scite pilot.')
    approvedClaims += 1
  } else if (deprecatedClaimIds.has(claim.id)) {
    claim.review_status = 'deprecated'
    addReviewProvenance(claim, 'Deprecated as a duplicate, underspecified, or superseded L-theanine claim after the Scite pilot review.')
    deprecatedClaims += 1
  }
}
writeJsonl(claimsFile, claims)

const sourcesFile = path.join(root, 'data/canonical/sources/sources.jsonl')
const sources = readJsonl(sourcesFile)
let approvedSources = 0
let deprecatedSources = 0
for (const source of sources) {
  if (approvedSourceIds.has(source.id)) {
    source.review_status = 'approved'
    addReviewProvenance(source, 'Approved as a traceable source supporting the final L-theanine Scite claim set.')
    approvedSources += 1
  } else if (deprecatedSourceIds.has(source.id)) {
    source.review_status = 'deprecated'
    addReviewProvenance(source, 'Deprecated because the stored URL is not a resolvable scholarly source and its linked claims were superseded.')
    deprecatedSources += 1
  }
}
writeJsonl(sourcesFile, sources)

const detailFile = path.join(root, 'public/data/compounds-detail/l-theanine.json')
const detail = JSON.parse(fs.readFileSync(detailFile, 'utf8'))
detail.claimMap = (Array.isArray(detail.claimMap) ? detail.claimMap : [])
  .filter((claim) => approvedClaimIds.has(claim.id))
  .map((claim) => ({ ...claim, reviewStatus: 'approved' }))
  .sort((a, b) => a.id.localeCompare(b.id))

const referencedSourceIds = new Set(detail.claimMap.flatMap((claim) => claim.sourceRefIds || []))
detail.sources = (Array.isArray(detail.sources) ? detail.sources : [])
  .filter((source) => referencedSourceIds.has(source.id) && approvedSourceIds.has(source.id))
  .map((source) => ({ ...source, reviewStatus: 'approved' }))
  .sort((a, b) => a.id.localeCompare(b.id))

detail.evidence = {
  ...(detail.evidence || {}),
  reviewStatus: 'sourced',
  sourceCount: detail.sources.length,
  sourceIds: detail.sources.map((source) => source.id),
  claimCount: detail.claimMap.length,
  claimIds: detail.claimMap.map((claim) => claim.id),
}
fs.writeFileSync(detailFile, `${JSON.stringify(detail, null, 2)}\n`, 'utf8')

function sortValue(value) {
  if (Array.isArray(value)) return value.map(sortValue)
  if (value && typeof value === 'object') {
    return Object.keys(value).sort().reduce((out, key) => {
      out[key] = sortValue(value[key])
      return out
    }, {})
  }
  return value
}

function stableStringify(value) {
  return JSON.stringify(sortValue(value))
}

function contentHash(value) {
  return crypto.createHash('sha256').update(stableStringify(value), 'utf8').digest('hex')
}

const auditFile = path.join(root, 'data/audit/audit-log.jsonl')
const auditRecords = readJsonl(auditFile)
const auditRecord = {
  at: reviewedAt,
  action: 'editorial_review',
  entity: 'compound:l-theanine',
  approved_claims: [...approvedClaimIds].sort(),
  deprecated_claims: [...deprecatedClaimIds].sort(),
  approved_sources: [...approvedSourceIds].sort(),
  deprecated_sources: [...deprecatedSourceIds].sort(),
  result: {
    claim_count: detail.claimMap.length,
    source_count: detail.sources.length,
    review_status: detail.evidence.reviewStatus,
  },
  prev_hash: auditRecords.length ? auditRecords.at(-1)._entry_hash : 'genesis',
}
auditRecord._entry_hash = contentHash({ ...auditRecord, _entry_hash: undefined })
fs.appendFileSync(auditFile, `${stableStringify(auditRecord)}\n`, 'utf8')

const expected = {
  approvedClaims: approvedClaimIds.size,
  deprecatedClaims: deprecatedClaimIds.size,
  approvedSources: approvedSourceIds.size,
  deprecatedSources: deprecatedSourceIds.size,
}
const actual = { approvedClaims, deprecatedClaims, approvedSources, deprecatedSources }
if (JSON.stringify(actual) !== JSON.stringify(expected)) {
  throw new Error(`Cleanup count mismatch: expected ${JSON.stringify(expected)}, got ${JSON.stringify(actual)}`)
}
if (detail.claimMap.length !== 6 || detail.sources.length !== 8 || detail.evidence.reviewStatus !== 'sourced') {
  throw new Error(`Unexpected runtime result: claims=${detail.claimMap.length} sources=${detail.sources.length} status=${detail.evidence.reviewStatus}`)
}

console.log(JSON.stringify({ actual, runtime: detail.evidence }, null, 2))
