#!/usr/bin/env node
/**
 * Remove citations a reader could never check, and citations confirmed wrong.
 *
 * Two rules, both conservative, neither of them guessing:
 *
 * 1. UNVERIFIABLE — a citation with no PMID, no DOI and no URL. There is
 *    nothing to follow and nothing to check; several carry a pipeline status
 *    note where the study title belongs ("Requires manual source normalization
 *    to PMID, DOI, PMC, or a stable URL"). Publishing these as evidence
 *    overstates the evidence base, so they are withdrawn to an internal report
 *    where the underlying research note is preserved for a human to resolve.
 *
 * 2. MISATTRIBUTED — a citation checked against PubMed by hand and found to be
 *    about something else entirely. This list is explicit and hand-verified,
 *    never inferred: the script will not remove a citation because a heuristic
 *    disliked it. Adding an entry here means someone read the paper.
 *
 * Nothing is ever *reassigned*. A citation is either kept as it is or
 * withdrawn; moving a paper to a different supplement requires reading it.
 *
 * Usage: node scripts/data/quarantine-unverifiable-citations.mjs [--data-dir=public/data] [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'
import { writeFileAtomic } from '../lib/atomic-json.mjs'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const dirArg = args.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dirArg ? dirArg.split('=')[1] : 'public/data')
const DRY_RUN = args.includes('--dry-run')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'quarantined-citations.json')

/**
 * Citations verified against PubMed and found to be about a different subject.
 * `verifiedAgainst` records what was actually read, so the decision can be
 * re-checked rather than taken on trust.
 *
 * @type {{ profile: string, pmid: string, reason: string, verifiedAgainst: string }[]}
 */
const CONFIRMED_MISATTRIBUTIONS = [
  {
    profile: 'curcumin',
    pmid: '27403209',
    reason:
      'Study is a pilot of an art-gallery engagement programme for people with dementia. It does not involve curcumin, turmeric, or any supplement.',
    verifiedAgainst:
      "PubMed 27403209 — \"Impact of the 'Artful Moments' Intervention on Persons with Dementia and Their Care Partners: a Pilot Study\", Can Geriatr J 2016, doi:10.5770/cgj.19.220",
  },
  {
    profile: 'potassium',
    pmid: '25059961',
    reason:
      'Item is a news piece in a veterinary journal about One Health policy. It is not a study, and it concerns neither potassium nor any supplement.',
    verifiedAgainst:
      'PubMed 25059961 — "One Health: time to move on from just talking", Vet Rec 2014, doi:10.1136/vr.g4746, publication type News',
  },
]

/**
 * PMIDs PubMed will not resolve at all.
 *
 * These are worse than a citation with no identifier, because they look
 * checkable. A reader follows the link and lands on nothing; the pipeline sees
 * a well-formed PMID and treats the row as evidence. Neither the subject nor
 * the standing of the paper can be established, so there is nothing to weigh.
 *
 * Kept separate from CONFIRMED_MISATTRIBUTIONS because the finding is
 * different: a misattributed citation is about the wrong thing, and one of
 * these is about nothing retrievable. Saying "misattributed" would claim
 * knowledge of a paper nobody can read.
 *
 * `verifiedAgainst` records the exact response, so this can be re-checked —
 * PubMed does occasionally restore records.
 *
 * @type {{ profile: string, pmid: string, reason: string, verifiedAgainst: string }[]}
 */
const CONFIRMED_UNRESOLVABLE = [
  {
    profile: 'policosanol',
    pmid: '17127598',
    reason:
      'PubMed does not return this record, so the citation cannot be checked by a reader or by the pipeline. Its stored title is the pipeline placeholder rather than a study title, so nothing about the paper is known.',
    verifiedAgainst:
      'NCBI esummary for PMID 17127598 responds "cannot get document summary" (checked 2026-08-30); the same id is the one unresolved PMID in ops/cache/pubmed-metadata.json',
  },
]

const quarantined = []
const quarantinedClaims = []

function sourceId(source) {
  return String(source?.id ?? source?.sourceId ?? source?.source_id ?? '').trim()
}

function claimSourceIds(claim) {
  const values = claim?.sourceRefIds ?? claim?.sourceIds ?? claim?.source_ids ?? claim?.sources ?? []
  return (Array.isArray(values) ? values : [values])
    .map((value) => (typeof value === 'string' ? value : sourceId(value)))
    .filter(Boolean)
}

function main() {
  if (!fs.existsSync(DATA_DIR)) {
    console.error(`[quarantine-citations] FAILED — no data directory at ${path.relative(ROOT, DATA_DIR)}`)
    process.exit(1)
  }

  const misattributionKeys = new Set(
    CONFIRMED_MISATTRIBUTIONS.map((entry) => `${entry.profile}::${entry.pmid}`),
  )
  const misattributionsSeen = new Set()
  const unresolvableKeys = new Set(
    CONFIRMED_UNRESOLVABLE.map((entry) => `${entry.profile}::${entry.pmid}`),
  )
  const unresolvableSeen = new Set()
  const observedPmidProfiles = new Map()

  let filesChanged = 0
  let profilesInspected = 0
  let profilesWithCitations = 0
  let claimsDereferenced = 0

  for (const [kind, dir] of [['herb', 'herbs-detail'], ['compound', 'compounds-detail']]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue

    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(full, file)
      const raw = fs.readFileSync(filePath, 'utf8')
      const record = JSON.parse(raw)
      profilesInspected += 1
      if (!Array.isArray(record.sources) || record.sources.length === 0) continue
      profilesWithCitations += 1

      const slug = String(record.slug ?? file.replace(/\.json$/, ''))
      const kept = []
      const removedSourceIds = new Set()

      for (const source of record.sources) {
        const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
        const doi = String(source.doi ?? '').trim()
        const url = String(source.url ?? '').trim()

        if (pmid) {
          if (!observedPmidProfiles.has(pmid)) observedPmidProfiles.set(pmid, new Set())
          observedPmidProfiles.get(pmid).add(slug)
        }

        if (!pmid && !doi && !url) {
          if (sourceId(source)) removedSourceIds.add(sourceId(source))
          quarantined.push({
            profile: slug,
            kind,
            classification: 'BROKEN_IDENTIFIER',
            reason: 'no PMID, DOI or URL — a reader cannot check this citation',
            source,
          })
          continue
        }

        const key = `${slug}::${pmid}`
        if (pmid && misattributionKeys.has(key)) {
          if (sourceId(source)) removedSourceIds.add(sourceId(source))
          const entry = CONFIRMED_MISATTRIBUTIONS.find((item) => `${item.profile}::${item.pmid}` === key)
          misattributionsSeen.add(key)
          quarantined.push({
            profile: slug,
            kind,
            classification: 'CLEARLY_MISATTRIBUTED',
            reason: entry.reason,
            verifiedAgainst: entry.verifiedAgainst,
            source,
          })
          continue
        }

        if (pmid && unresolvableKeys.has(key)) {
          if (sourceId(source)) removedSourceIds.add(sourceId(source))
          const entry = CONFIRMED_UNRESOLVABLE.find((item) => `${item.profile}::${item.pmid}` === key)
          unresolvableSeen.add(key)
          quarantined.push({
            profile: slug,
            kind,
            classification: 'UNRESOLVABLE_IDENTIFIER',
            reason: entry.reason,
            verifiedAgainst: entry.verifiedAgainst,
            source,
          })
          continue
        }

        kept.push(source)
      }

      if (kept.length === record.sources.length) continue
      filesChanged += 1
      record.sources = kept
      // A claim that cited a withdrawn source keeps its other sources. Only a
      // claim left with *no* remaining support is withdrawn: deleting a
      // well-evidenced claim because one of its three citations lacked a DOI
      // would destroy curated science to fix a bookkeeping problem.
      if (Array.isArray(record.claimMap) && removedSourceIds.size > 0) {
        record.claimMap = record.claimMap.filter((claim) => {
          const refs = claimSourceIds(claim)
          const removedRefs = refs.filter((id) => removedSourceIds.has(id))
          if (removedRefs.length === 0) return true

          const survivingRefs = refs.filter((id) => !removedSourceIds.has(id))
          if (survivingRefs.length > 0) {
            // Drop only the dangling reference, so the claim no longer points
            // at a citation the reader cannot see.
            if (Array.isArray(claim.sourceRefIds)) claim.sourceRefIds = survivingRefs
            claimsDereferenced += 1
            return true
          }

          quarantinedClaims.push({
            profile: slug,
            kind,
            classification: 'SOURCE_WITHDRAWN',
            reason: 'claim had no remaining source after its only citation was withdrawn',
            removedSourceIds: removedRefs,
            claim,
          })
          return false
        })
      }
      if (!DRY_RUN) {
        const pretty = /\n\s+"/.test(raw.slice(0, 4096))
        const serialized = pretty ? JSON.stringify(record, null, 2) : JSON.stringify(record)
        writeFileAtomic(filePath, raw.endsWith('\n') ? `${serialized}\n` : serialized)
      }
    }
  }

  // Guard against running on a missing or half-built corpus. This counts
  // profiles *read*, not profiles that still hold citations — withdrawing an
  // unverifiable citation can legitimately leave a profile with none, and the
  // count must not shrink just because the script did its job.
  if (profilesInspected < 400) {
    console.error(
      `[quarantine-citations] FAILED — only ${profilesInspected} profiles were readable; the corpus looks ` +
        'incomplete. Run `npm run data:build` first.',
    )
    process.exit(1)
  }

  // The detail files are not the only place a withdrawn citation appears.
  // claims.json carries its own `pmid` and a pipe-separated `source_url`, and
  // the claim endpoints and the research graph are built from it — so leaving
  // it alone would keep pointing a reader at a paper that has just been
  // withdrawn from the profile beside it.
  //
  // The rule is the one already used for claimMap above: drop the dangling
  // reference, keep the claim if anything still supports it. A claim is only
  // withdrawn when nothing is left to follow.
  let claimsScrubbed = 0
  const withdrawnPairs = new Set(
    quarantined
      .map((entry) => {
        const pmid = String(entry.source?.pmid ?? entry.source?.pubmedId ?? '').trim()
        return pmid ? `${entry.profile}::${pmid}` : null
      })
      .filter(Boolean),
  )

  const claimsPath = path.join(DATA_DIR, 'claims.json')
  if (withdrawnPairs.size && fs.existsSync(claimsPath)) {
    const rawClaims = fs.readFileSync(claimsPath, 'utf8')
    const claims = JSON.parse(rawClaims)
    if (Array.isArray(claims)) {
      const keptClaims = []
      for (const claim of claims) {
        const pmid = String(claim?.pmid ?? '').trim()
        if (!pmid || !withdrawnPairs.has(`${claim?.profile_slug}::${pmid}`)) {
          keptClaims.push(claim)
          continue
        }

        const urls = String(claim.source_url ?? '')
          .split('|')
          .map((url) => url.trim())
          .filter(Boolean)
          .filter((url) => !new RegExp(`/${pmid}/?$`).test(url))

        const next = { ...claim }
        delete next.pmid
        if (urls.length) {
          next.source_url = urls.join(' | ')
          keptClaims.push(next)
          claimsScrubbed += 1
          continue
        }

        quarantinedClaims.push({
          profile: claim.profile_slug,
          kind: 'claim',
          classification: 'SOURCE_WITHDRAWN',
          reason: 'claim had no remaining source after its only citation was withdrawn',
          removedSourceIds: [pmid],
          claim,
        })
      }

      const claimsChanged = claimsScrubbed > 0 || keptClaims.length !== claims.length
      if (!DRY_RUN && claimsChanged) {
        const serialized = JSON.stringify(keptClaims, null, 2)
        writeFileAtomic(claimsPath, rawClaims.endsWith('\n') ? `${serialized}\n` : serialized)
      }
    }
  }

  // A confirmed bad citation being absent is the desired steady state and must
  // pass on a clean checkout. The old implementation depended on a gitignored
  // previous-run report to prove prior withdrawal, so a deterministic rebuild
  // failed even when the corpus was already clean. Preserve the useful drift
  // guard instead: if the same hand-verified PMID reappears under a different
  // profile, fail rather than silently treating the denylist entry as stale.
  const movedMisattributions = []
  // Both hand-verified lists get the same drift guard: a bad citation that
  // moves to another profile is still a bad citation, whichever list caught it.
  const verifiedEntries = [
    ...CONFIRMED_MISATTRIBUTIONS.map((entry) => ({ entry, seen: misattributionsSeen })),
    ...CONFIRMED_UNRESOLVABLE.map((entry) => ({ entry, seen: unresolvableSeen })),
  ]
  for (const { entry, seen } of verifiedEntries) {
    const key = `${entry.profile}::${entry.pmid}`
    if (seen.has(key)) continue
    const profiles = [...(observedPmidProfiles.get(entry.pmid) || [])]
      .filter((profile) => profile !== entry.profile)
      .sort()
    if (profiles.length) {
      movedMisattributions.push({
        expectedProfile: entry.profile,
        pmid: entry.pmid,
        observedProfiles: profiles,
      })
    }
  }

  if (!DRY_RUN && quarantined.length) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
    writeFileAtomic(
      REPORT_PATH,
      `${JSON.stringify({ count: quarantined.length, claimCount: quarantinedClaims.length, citations: quarantined, claims: quarantinedClaims }, null, 2)}\n`,
    )
  }

  const byClass = quarantined.reduce((acc, entry) => {
    acc[entry.classification] = (acc[entry.classification] ?? 0) + 1
    return acc
  }, {})

  console.log(`\nCitations quarantined${DRY_RUN ? ' (dry run)' : ''}`)
  console.log('='.repeat(66))
  console.log(`Profiles inspected  ${profilesInspected}`)
  console.log(`  with citations    ${profilesWithCitations}`)
  console.log(`Files changed       ${filesChanged}`)
  for (const [classification, count] of Object.entries(byClass)) {
    console.log(`  ${classification}: ${count}`)
  }
  console.log(`Claims withdrawn    ${quarantinedClaims.length}  (no source left)`)
  console.log(`Claims dereferenced ${claimsDereferenced}  (kept, dangling ref dropped)`)
  console.log(`Claims scrubbed     ${claimsScrubbed}  (claims.json pmid + url dropped, claim kept)`)
  if (quarantined.length && !DRY_RUN) console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (movedMisattributions.length) {
    console.error('\n[quarantine-citations] FAILED — confirmed bad PMID reappeared under a different profile:')
    for (const row of movedMisattributions) {
      console.error(`  PMID ${row.pmid}: expected denylist profile ${row.expectedProfile}; observed under ${row.observedProfiles.join(', ')}`)
    }
    console.error('Re-verify the moved citation before changing the denylist.')
    process.exit(1)
  }
}

main()
