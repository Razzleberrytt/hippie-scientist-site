#!/usr/bin/env node
/**
 * Quarantine citations that cannot safely remain in the published evidence graph.
 *
 * Bibliographic validity and semantic validity are separate. A PMID can be real
 * while still naming the wrong paper for a profile or claim. Semantic decisions
 * therefore live as explicit, auditable receipts in
 * `ops/citation-semantic-attestations.json`; this script never guesses from
 * title similarity.
 *
 * Source-scoped rejected/held decisions remove the source from the generated
 * public profile. Claim-edge decisions remove only that source→claim edge. A
 * claim that loses all of its source refs is withdrawn. Evidence counters are
 * rebuilt from the surviving graph so removed citations cannot keep inflating
 * the public evidence state.
 *
 * Usage: node scripts/data/quarantine-unverifiable-citations.mjs [--data-dir=public/data] [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const dirArg = args.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dirArg ? dirArg.split('=')[1] : 'public/data')
const DRY_RUN = args.includes('--dry-run')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'quarantined-citations.json')
const ATTESTATION_PATH = path.join(ROOT, 'ops', 'citation-semantic-attestations.json')

const PMID_PATTERN = /^[1-9]\d{0,8}$/
const BLOCKED_STATUSES = new Set(['rejected', 'held'])

const LEGACY_CONFIRMED_MISATTRIBUTIONS = [
  {
    profile: 'curcumin',
    pmid: '27403209',
    scope: 'source',
    status: 'rejected',
    reasonCode: 'WRONG_ENTITY_OR_INTERVENTION',
    verifiedTitle: "Impact of the 'Artful Moments' Intervention on Persons with Dementia and Their Care Partners: a Pilot Study",
    provenance: 'citation-integrity-2026-08-21',
  },
]

function normalizePmid(value) {
  return String(value ?? '').trim()
}

function sourceId(source) {
  return String(source?.id ?? source?.sourceId ?? source?.source_id ?? '').trim()
}

function claimSourceIds(claim) {
  const values = claim?.sourceRefIds ?? claim?.sourceIds ?? claim?.source_ids ?? claim?.sources ?? []
  return (Array.isArray(values) ? values : [values])
    .map((value) => (typeof value === 'string' ? value : sourceId(value)))
    .filter(Boolean)
}

function sourceIdentifiers(source) {
  return {
    pmid: normalizePmid(source?.pmid ?? source?.pubmedId),
    doi: String(source?.doi ?? '').trim(),
    url: String(source?.url ?? '').trim(),
  }
}

function loadSemanticDecisions() {
  if (!fs.existsSync(ATTESTATION_PATH)) return LEGACY_CONFIRMED_MISATTRIBUTIONS
  const parsed = JSON.parse(fs.readFileSync(ATTESTATION_PATH, 'utf8'))
  const decisions = Array.isArray(parsed?.decisions) ? parsed.decisions : []
  return [...LEGACY_CONFIRMED_MISATTRIBUTIONS, ...decisions]
    .filter((decision) => BLOCKED_STATUSES.has(String(decision?.status ?? '').toLowerCase()))
    .map((decision) => ({
      ...decision,
      profile: String(decision.profile ?? '').trim(),
      pmid: normalizePmid(decision.pmid),
      scope: String(decision.scope ?? 'source').trim(),
      claimId: decision.claimId ? String(decision.claimId).trim() : null,
      status: String(decision.status ?? '').toLowerCase(),
      provenance: decision.provenance ?? 'semantic-citation-attestation-v1',
    }))
}

function semanticDecisionIndex(decisions) {
  const source = new Map()
  const edge = new Map()
  for (const decision of decisions) {
    if (!decision.profile || !PMID_PATTERN.test(decision.pmid)) continue
    if (decision.scope === 'claim-edge') {
      if (!decision.claimId) continue
      edge.set(`${decision.profile}::${decision.claimId}::${decision.pmid}`, decision)
    } else if (decision.scope === 'source') {
      source.set(`${decision.profile}::${decision.pmid}`, decision)
    }
  }
  return { source, edge }
}

function recomputeEvidence(record, sources, claims) {
  if (!record.evidence || typeof record.evidence !== 'object' || Array.isArray(record.evidence)) return record.evidence
  return {
    ...record.evidence,
    sourceCount: sources.length,
    sourceIds: sources.map(sourceId).filter(Boolean),
    claimCount: claims.length,
    claimIds: claims.map((claim) => String(claim?.id ?? '').trim()).filter(Boolean),
  }
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`[quarantine-citations] FAILED — no data directory at ${path.relative(ROOT, DATA_DIR)}`)
    process.exit(1)
  }

  const decisions = loadSemanticDecisions()
  const decisionIndex = semanticDecisionIndex(decisions)
  const quarantined = []
  const quarantinedClaims = []
  const changedProfiles = []
  const observedPmidProfiles = new Map()
  const legacySeen = new Set()
  let profilesInspected = 0
  let profilesWithCitations = 0
  let sourcesInspected = 0
  let claimsInspected = 0
  let claimsDereferenced = 0

  for (const [kind, dir] of [['herb', 'herbs-detail'], ['compound', 'compounds-detail']]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue

    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(full, file)
      const raw = fs.readFileSync(filePath, 'utf8')
      const record = JSON.parse(raw)
      const slug = String(record.slug ?? record.id ?? file.replace(/\.json$/, '')).trim()
      const originalSources = Array.isArray(record.sources) ? record.sources : []
      const originalClaims = Array.isArray(record.claimMap) ? record.claimMap : []
      profilesInspected += 1
      sourcesInspected += originalSources.length
      claimsInspected += originalClaims.length
      if (originalSources.length) profilesWithCitations += 1

      const removedSourceIds = new Set()
      const keptSources = []

      for (const source of originalSources) {
        const id = sourceId(source)
        const { pmid, doi, url } = sourceIdentifiers(source)
        if (pmid) {
          if (!observedPmidProfiles.has(pmid)) observedPmidProfiles.set(pmid, new Set())
          observedPmidProfiles.get(pmid).add(slug)
        }

        const semantic = pmid ? decisionIndex.source.get(`${slug}::${pmid}`) : null
        const noIdentifier = !pmid && !doi && !url
        if (!semantic && !noIdentifier) {
          keptSources.push(source)
          continue
        }

        if (id) removedSourceIds.add(id)
        if (semantic?.provenance === 'citation-integrity-2026-08-21') legacySeen.add(`${slug}::${pmid}`)
        quarantined.push({
          profile: slug,
          kind,
          scope: 'source',
          claimId: null,
          sourceId: id || null,
          pmid: pmid || null,
          doi: doi || null,
          url: url || null,
          title: String(source?.title ?? '').trim() || null,
          classification: semantic ? 'SEMANTIC_ATTESTATION_BLOCK' : 'BROKEN_IDENTIFIER',
          status: semantic?.status ?? 'rejected',
          reasonCode: semantic?.reasonCode ?? 'NO_VERIFIABLE_IDENTIFIER',
          verifiedTitle: semantic?.verifiedTitle ?? null,
          provenance: semantic?.provenance ?? 'identifier-integrity',
          source,
        })
      }

      const sourceById = new Map(originalSources.filter((source) => sourceId(source)).map((source) => [sourceId(source), source]))
      const keptClaims = []

      for (const claim of originalClaims) {
        const claimId = String(claim?.id ?? '').trim()
        const refs = claimSourceIds(claim)
        if (!refs.length) {
          keptClaims.push(claim)
          continue
        }

        const survivingRefs = []
        for (const ref of refs) {
          if (removedSourceIds.has(ref)) continue
          const source = sourceById.get(ref)
          const pmid = source ? normalizePmid(source.pmid ?? source.pubmedId) : ''
          const semanticEdge = claimId && pmid
            ? decisionIndex.edge.get(`${slug}::${claimId}::${pmid}`)
            : null

          if (!semanticEdge) {
            survivingRefs.push(ref)
            continue
          }

          quarantined.push({
            profile: slug,
            kind,
            scope: 'claim-edge',
            claimId: claimId || null,
            sourceId: ref,
            pmid: pmid || null,
            doi: source ? String(source.doi ?? '').trim() || null : null,
            url: source ? String(source.url ?? '').trim() || null : null,
            title: source ? String(source.title ?? '').trim() || null : null,
            classification: 'SEMANTIC_ATTESTATION_BLOCK',
            status: semanticEdge.status,
            reasonCode: semanticEdge.reasonCode,
            verifiedTitle: semanticEdge.verifiedTitle ?? null,
            provenance: semanticEdge.provenance,
          })
        }

        if (!survivingRefs.length) {
          quarantinedClaims.push({
            profile: slug,
            kind,
            classification: 'SOURCE_WITHDRAWN',
            reason: 'claim had no remaining source after rejected/held citation evidence was quarantined',
            removedSourceIds: refs,
            claim,
          })
          continue
        }

        if (survivingRefs.length !== refs.length) claimsDereferenced += 1
        keptClaims.push(
          Array.isArray(claim.sourceRefIds) && survivingRefs.length !== refs.length
            ? { ...claim, sourceRefIds: survivingRefs }
            : claim,
        )
      }

      const nextEvidence = recomputeEvidence(record, keptSources, keptClaims)
      const nextRecord = {
        ...record,
        sources: keptSources,
        claimMap: keptClaims,
        ...(nextEvidence ? { evidence: nextEvidence } : {}),
      }

      if (JSON.stringify(record) === JSON.stringify(nextRecord)) continue
      changedProfiles.push({
        kind,
        profile: slug,
        removedSources: originalSources.length - keptSources.length,
        removedClaims: originalClaims.length - keptClaims.length,
        survivingSources: keptSources.length,
        survivingClaims: keptClaims.length,
      })

      if (!DRY_RUN) {
        const pretty = /\n\s+"/.test(raw.slice(0, 4096))
        const serialized = pretty ? JSON.stringify(nextRecord, null, 2) : JSON.stringify(nextRecord)
        fs.writeFileSync(filePath, raw.endsWith('\n') ? `${serialized}\n` : serialized, 'utf8')
      }
    }
  }

  if (profilesInspected < 400) {
    console.error(`[quarantine-citations] FAILED — only ${profilesInspected} profiles were readable; corpus is incomplete.`)
    process.exit(1)
  }

  // Preserve the original Curcumin drift guard. Other semantic receipts are
  // profile-scoped: the same PMID can be legitimate elsewhere and must not be
  // globally denied without a separate attestation.
  const movedLegacy = []
  for (const entry of LEGACY_CONFIRMED_MISATTRIBUTIONS) {
    const key = `${entry.profile}::${entry.pmid}`
    if (legacySeen.has(key)) continue
    const profiles = [...(observedPmidProfiles.get(entry.pmid) || [])].filter((profile) => profile !== entry.profile).sort()
    if (profiles.length) movedLegacy.push({ expectedProfile: entry.profile, pmid: entry.pmid, observedProfiles: profiles })
  }
  if (movedLegacy.length) {
    console.error('\n[quarantine-citations] FAILED — legacy confirmed bad PMID reappeared under a different profile:')
    for (const row of movedLegacy) console.error(`  PMID ${row.pmid}: ${row.observedProfiles.join(', ')}`)
    process.exit(1)
  }

  if (!DRY_RUN && (quarantined.length || changedProfiles.length)) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
    fs.writeFileSync(REPORT_PATH, `${JSON.stringify({
      schemaVersion: 2,
      policy: 'identifier-and-semantic-citation-quarantine-v2',
      count: quarantined.length,
      claimCount: quarantinedClaims.length,
      semanticDecisionsLoaded: decisions.length,
      profilesChanged: changedProfiles.length,
      changedProfiles,
      citations: quarantined,
      claims: quarantinedClaims,
    }, null, 2)}\n`, 'utf8')
  }

  const byStatus = quarantined.reduce((acc, entry) => {
    acc[entry.status] = (acc[entry.status] ?? 0) + 1
    return acc
  }, {})

  console.log(`\nCitations quarantined${DRY_RUN ? ' (dry run)' : ''}`)
  console.log('='.repeat(66))
  console.log(`Profiles inspected   ${profilesInspected}`)
  console.log(`  with citations     ${profilesWithCitations}`)
  console.log(`Sources inspected    ${sourcesInspected}`)
  console.log(`Claims inspected     ${claimsInspected}`)
  console.log(`Semantic decisions   ${decisions.length}`)
  console.log(`Profiles changed     ${changedProfiles.length}`)
  console.log(`Quarantine receipts  ${quarantined.length}`)
  for (const [status, count] of Object.entries(byStatus)) console.log(`  ${status}: ${count}`)
  console.log(`Claims withdrawn     ${quarantinedClaims.length}`)
  console.log(`Claims dereferenced  ${claimsDereferenced}`)
  if ((quarantined.length || changedProfiles.length) && !DRY_RUN) console.log(`Report: ${path.relative(ROOT, REPORT_PATH)}`)
}

main()
