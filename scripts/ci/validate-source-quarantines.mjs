#!/usr/bin/env node
/**
 * Read-only, deterministic reconciliation of REVIEWED whole-source quarantines
 * against active profile sources. A draft is a review item, NOT permission to
 * delete a scientific reference.
 *
 * Quarantine scope is explicit: only 'wrong-source quarantine' in usageContext
 * is treated as an entire source-assignment ban. Ordinary evidence_conflict
 * submissions may concern a claim or endpoint and must not remove a paper.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..')
const APPROVED_EDITORIAL = new Set(['approved', 'published'])
const STATUS_APPROVED = 'approved_for_rollup'
const IDENTIFIER = /[^a-z0-9]/g

const compact = (value) => String(value ?? '').toLowerCase().replace(IDENTIFIER, '')

function listJsonFiles(dir) {
  if (!fs.existsSync(dir)) return []
  return fs.readdirSync(dir, { withFileTypes: true })
    .flatMap((entry) => {
      const full = path.join(dir, entry.name)
      return entry.isDirectory() ? listJsonFiles(full) : entry.isFile() && full.endsWith('.json') ? [full] : []
    })
    .sort()
}

export function isWholeSourceQuarantine(submission) {
  return submission?.topicType === 'conflict_note'
    && submission?.claimType === 'evidence_conflict'
    && /\bwrong-source quarantine\b/i.test(String(submission.usageContext ?? ''))
}

/**
 * Submission source IDs use 'src_pubmed-PMID' or 'src_doi-DOI-with-punctuation
 * rendered as hyphens'. Detail JSON uses different, hashed IDs, so sourceId
 * string equality is NOT valid; canonical source identifiers must match.
 */
export function quarantineIdentity(sourceId) {
  const id = String(sourceId ?? '')
  const pmid = /^src_pubmed-(\d+)$/i.exec(id)
  if (pmid) return { kind: 'pmid', key: pmid[1] }
  const doi = /^src_doi-(10-.+)$/i.exec(id)
  if (doi) return { kind: 'doi', key: compact(doi[1]) }
  return null
}

function activeProfileSourceMatches(source, identity) {
  if (!identity) return false
  // The public citation extractor renders every member of 'sources',
  // regardless of source.active or reviewStatus. Presence is still exposure.
  if (identity.kind === 'pmid') {
    const urlPmid = /^https?:\/\/(?:www\.)?pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)(?:[/?#]|$)/i.exec(String(source.url ?? ''))?.[1]
    return [source.pmid, source.pubmedId, urlPmid].some((candidate) => String(candidate ?? '') === identity.key)
  }
  const urlDoi = /^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i.exec(String(source.url ?? ''))?.[1]
  return [source.doi, urlDoi].some((candidate) => compact(candidate) === identity.key)
}

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function claimMatches(claim, identity, pubmedCache) {
  if (!identity) return false
  const pmid = String(claim?.pmid ?? '')
  if (identity.kind === 'pmid') {
    const urlPmid = /^https?:\/\/(?:www\.)?pubmed\.ncbi\.nlm\.nih\.gov\/(\d+)(?:[/?#]|$)/i.exec(String(claim?.source_url ?? ''))?.[1]
    return pmid === identity.key || urlPmid === identity.key
  }
  const doiFromMetadata = pubmedCache[pmid]?.doi
  const urlDoi = /^https?:\/\/(?:dx\.)?doi\.org\/(.+)$/i.exec(String(claim?.source_url ?? ''))?.[1]
  return [claim?.doi, urlDoi, doiFromMetadata].some((candidate) => compact(candidate) === identity.key)
}

export function assessQuarantine({ submission, profile, claims = [], pubmedCache = {}, fragmentPath }) {
  if (!isWholeSourceQuarantine(submission) || submission.active === false) return null
  const id = String(submission.submissionId ?? 'unknown')
  const tag = `${fragmentPath}:${id}`
  const problems = []
  const identity = quarantineIdentity(submission.sourceId)
  const statusApproved = submission.reviewStatus === STATUS_APPROVED
  const editorialApproved = APPROVED_EDITORIAL.has(submission.editorialStatus)
  // An alleged approval must be complete; a missing reviewer is not signoff.
  const claimsApproval = statusApproved || editorialApproved
  if (claimsApproval && (!statusApproved || !editorialApproved
    || !String(submission.reviewer ?? '').trim()
    || !String(submission.reviewedAt ?? '').trim()
    || !String(submission.approvalNotes ?? '').trim())) {
    problems.push(`${tag}: incomplete quarantine approval (requires approved_for_rollup, approved/published, reviewer, reviewedAt, and approvalNotes)`)
  }
  if (claimsApproval && !identity) {
    problems.push(`${tag}: reviewed quarantine cannot resolve PMID/DOI sourceId ${submission.sourceId}`)
  }
  if (statusApproved && editorialApproved && identity) {
    if (profile && !Array.isArray(profile.sources)) {
      problems.push(`${tag}: approved quarantine target profile malformed`)
    }
    const presentInProfile = Array.isArray(profile?.sources)
      && profile.sources.some((source) => activeProfileSourceMatches(source, identity))
    // Runtime attachWorkbookEvidence() merges matching claims.json entries back
    // into the published source list; a detail-only removal is NOT sufficient.
    const presentInClaims = claims.some((claim) => (
      claim.profile_slug === submission.entitySlug && claimMatches(claim, identity, pubmedCache)
    ))
    if (presentInProfile || presentInClaims) {
      const surfaces = [presentInProfile && 'detail sources', presentInClaims && 'workbook claims']
        .filter(Boolean).join(' + ')
      problems.push(`${tag}: APPROVED QUARANTINE CONFLICT: ${submission.entityType}/${submission.entitySlug} still cites ${submission.sourceId} through ${surfaces}. Remove from active records via reviewed data change.`)
    }
  }
  return { tag, approved: statusApproved && editorialApproved, identity, problems }
}

export function reconcileQuarantines({ fragmentRoot, dataRoot, pubmedMetadataPath }) {
  const errors = []
  const warnings = []
  const inspected = []
  const claimsFile = path.join(dataRoot, 'claims.json')
  const claims = fs.existsSync(claimsFile) ? readJson(claimsFile) : []
  if (!Array.isArray(claims)) throw new Error('claims.json must be a list')
  const pubmedCache = pubmedMetadataPath && fs.existsSync(pubmedMetadataPath)
    ? readJson(pubmedMetadataPath).records ?? {} : {}
  for (const fragmentPath of listJsonFiles(fragmentRoot)) {
    const fragment = readJson(fragmentPath)
    if (!Array.isArray(fragment.submissions)) continue
    for (const submission of fragment.submissions) {
      if (!isWholeSourceQuarantine(submission) || submission.active === false) continue
      const kind = submission.entityType === 'herb' ? 'herbs' : submission.entityType === 'compound' ? 'compounds' : null
      const target = kind && /^[a-z0-9-]+$/.test(String(submission.entitySlug ?? ''))
        ? path.join(dataRoot, `${kind}-detail`, `${submission.entitySlug}.json`)
        : null
      let profile = null
      if (target && fs.existsSync(target)) profile = readJson(target)
      const assessment = assessQuarantine({
        submission, profile, claims, pubmedCache, fragmentPath: path.relative(fragmentRoot, fragmentPath),
      })
      if (!assessment) continue
      inspected.push(assessment.tag)
      errors.push(...assessment.problems)
      if (!assessment.approved && !assessment.problems.length) {
        warnings.push(`${assessment.tag}: DRAFT whole-source warning requires scientific review; it does not remove an active source`)
      }
    }
  }
  return { inspected, errors, warnings }
}

export function main() {
  const result = reconcileQuarantines({
    fragmentRoot: path.join(ROOT, 'ops/enrichment-submissions/sessions'),
    dataRoot: path.join(ROOT, 'public/data'),
    pubmedMetadataPath: path.join(ROOT, 'ops/cache/pubmed-metadata.json'),
  })
  console.log(`[quarantine] reviewed ${result.inspected.length} whole-source warnings; ${result.errors.length} blocking conflicts; ${result.warnings.length} pending-review alerts`)
  for (const warning of result.warnings.slice(0, 30)) console.warn(`WARN: ${warning}`)
  if (result.warnings.length > 30) console.warn(`WARN: ${result.warnings.length - 30} more pending-review alerts`)
  for (const error of result.errors) console.error(`ERROR: ${error}`)
  if (result.errors.length) process.exitCode = 1
  return result
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
