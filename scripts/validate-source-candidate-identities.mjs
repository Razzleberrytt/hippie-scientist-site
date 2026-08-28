#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import {
  compareCandidateToCrossref,
  compareCandidateToPubmed,
  normalizeDoi,
} from './lib/source-identity-attestation.mjs'

const ROOT = process.cwd()
const CANDIDATE_PATH = path.join(ROOT, 'ops', 'source-candidates.json')
const QUARANTINE_PATH = path.join(ROOT, 'ops', 'source-identity-quarantine.json')
const WAVE_ID = process.env.ENRICHMENT_WAVE_ID || 'wave-2'
const SAFE_WAVE_ID = WAVE_ID.replace(/[^a-z0-9-]+/gi, '-').toLowerCase()
const WAVE_CANDIDATES_PATH =
  process.env.ENRICHMENT_WAVE_CANDIDATES_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-candidates.json`)
const OUTPUT_PATH =
  process.env.ENRICHMENT_WAVE_SOURCE_IDENTITY_PATH || path.join(ROOT, 'ops', 'reports', `source-${SAFE_WAVE_ID}-identity-attestation.json`)
const PUBMED_ENDPOINT = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
const CROSSREF_ENDPOINT = 'https://api.crossref.org/works/'
const DISALLOWED_STATUSES = new Set(['rejected', 'duplicate_of_existing', 'deprecated_candidate'])

function readJson(filePath, fallback = null) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

async function fetchJson(url, label) {
  const response = await fetch(url, {
    headers: {
      'User-Agent': 'thehippiescientist.net source identity attestation',
      Accept: 'application/json',
    },
  })
  if (!response.ok) throw new Error(`${label} responded ${response.status}`)
  return response.json()
}

async function resolvePubmed(pmids) {
  if (!pmids.length) return new Map()
  const url = `${PUBMED_ENDPOINT}?db=pubmed&retmode=json&id=${pmids.join(',')}`
  const payload = await fetchJson(url, 'PubMed')
  const result = payload?.result
  if (!result) throw new Error('PubMed returned no result block')
  return new Map(pmids.map((pmid) => [pmid, result[pmid] ?? null]))
}

async function resolveCrossref(doi) {
  return fetchJson(`${CROSSREF_ENDPOINT}${encodeURIComponent(normalizeDoi(doi))}`, 'Crossref')
}

async function main() {
  const candidates = readJson(CANDIDATE_PATH, [])
  const waveReport = readJson(WAVE_CANDIDATES_PATH)
  if (!waveReport || !Array.isArray(waveReport.candidates)) {
    throw new Error(`Wave candidate report not found or invalid: ${path.relative(ROOT, WAVE_CANDIDATES_PATH)}`)
  }

  const quarantine = readJson(QUARANTINE_PATH, { entries: [] })
  const quarantineById = new Map((quarantine?.entries || []).map((entry) => [entry.candidateSourceId, entry]))
  const candidateById = new Map(candidates.map((candidate) => [candidate.candidateSourceId, candidate]))
  const waveIds = [...new Set(waveReport.candidates.map((candidate) => candidate.candidateSourceId))]
  const waveCandidates = waveIds.map((id) => candidateById.get(id)).filter(Boolean)
  const missingCandidateIds = waveIds.filter((id) => !candidateById.has(id))
  if (missingCandidateIds.length) {
    throw new Error(`Wave references unknown candidateSourceId(s): ${missingCandidateIds.join(', ')}`)
  }

  const pmids = [...new Set(waveCandidates.map((candidate) => String(candidate.pmid || '').trim()).filter(Boolean))]
  const pubmedByPmid = await resolvePubmed(pmids)
  const decisions = []

  for (const candidate of waveCandidates) {
    const reasons = []
    const quarantineEntry = quarantineById.get(candidate.candidateSourceId)
    if (quarantineEntry) {
      reasons.push(`candidate is quarantined: ${quarantineEntry.reason}`)
    }
    if (!candidate.active) reasons.push('candidate is inactive')
    if (DISALLOWED_STATUSES.has(candidate.reviewStatus)) {
      reasons.push(`candidate reviewStatus=${candidate.reviewStatus} is not eligible for promotion`)
    }

    let resolver = null
    let resolved = null
    if (!reasons.length && candidate.pmid) {
      resolver = 'pubmed-esummary'
      const entry = pubmedByPmid.get(String(candidate.pmid))
      if (!entry || entry.error) {
        reasons.push(`PMID ${candidate.pmid} did not resolve in PubMed`)
      } else {
        const comparison = compareCandidateToPubmed(candidate, entry)
        resolved = comparison.resolved
        reasons.push(...comparison.issues)
      }
    } else if (!reasons.length && candidate.doi) {
      resolver = 'crossref-works'
      try {
        const payload = await resolveCrossref(candidate.doi)
        const comparison = compareCandidateToCrossref(candidate, payload)
        resolved = comparison.resolved
        reasons.push(...comparison.issues)
      } catch (error) {
        reasons.push(`DOI ${candidate.doi} could not be independently resolved: ${error.message}`)
      }
    } else if (!reasons.length) {
      reasons.push('candidate has neither PMID nor DOI; automatic promotion requires independent identifier attestation')
    }

    decisions.push({
      candidateSourceId: candidate.candidateSourceId,
      intakeTaskId: candidate.intakeTaskId,
      eligible: reasons.length === 0,
      resolver,
      reasons,
      candidateIdentity: {
        pmid: candidate.pmid || null,
        doi: candidate.doi || null,
        title: candidate.title,
        publicationYear: candidate.publicationYear ?? null,
        canonicalUrl: candidate.canonicalUrl || null,
      },
      resolvedIdentity: resolved,
    })
  }

  const blocked = decisions.filter((decision) => !decision.eligible)
  const report = {
    generatedAt: new Date().toISOString(),
    modelVersion: 'source-identity-attestation-v1',
    waveId: WAVE_ID,
    candidateCount: decisions.length,
    eligibleCount: decisions.length - blocked.length,
    blockedCount: blocked.length,
    eligibleCandidateIds: decisions.filter((decision) => decision.eligible).map((decision) => decision.candidateSourceId).sort(),
    blockedCandidates: blocked.map(({ candidateSourceId, reasons }) => ({ candidateSourceId, reasons })),
    decisions,
  }
  writeJson(OUTPUT_PATH, report)

  if (blocked.length) {
    const detail = blocked
      .map((decision) => `- ${decision.candidateSourceId}: ${decision.reasons.join('; ')}`)
      .join('\n')
    throw new Error(`Source identity attestation blocked ${blocked.length} candidate(s):\n${detail}`)
  }

  console.log(`[source-identity] attested ${decisions.length} candidate(s) for ${WAVE_ID}`)
}

main().catch((error) => {
  console.error(`[source-identity] ${error.message}`)
  process.exit(1)
})
