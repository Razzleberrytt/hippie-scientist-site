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
        fs.writeFileSync(filePath, raw.endsWith('\n') ? `${serialized}\n` : serialized, 'utf8')
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

  // A hand-verified entry that matches nothing usually means it was already
  // withdrawn by an earlier run — this script has to be idempotent, since the
  // pipeline runs it on every build. So "not found now" only counts as stale if
  // the previous report does not record it as withdrawn either. That keeps the
  // guard meaningful (a citation known to be wrong cannot quietly return under
  // a changed slug or PMID) without failing on a corpus that is already clean.
  const previouslyWithdrawn = new Set()
  if (fs.existsSync(REPORT_PATH)) {
    try {
      const previous = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8'))
      for (const entry of previous.citations ?? []) {
        const pmid = String(entry?.source?.pmid ?? entry?.source?.pubmedId ?? '').trim()
        if (entry?.profile && pmid) previouslyWithdrawn.add(`${entry.profile}::${pmid}`)
      }
    } catch {
      // A corrupt report is not evidence of anything; fall through to the strict check.
    }
  }
  const unmatched = [...misattributionKeys].filter(
    (key) => !misattributionsSeen.has(key) && !previouslyWithdrawn.has(key),
  )

  if (!DRY_RUN && quarantined.length) {
    fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
    fs.writeFileSync(
      REPORT_PATH,
      `${JSON.stringify({ count: quarantined.length, claimCount: quarantinedClaims.length, citations: quarantined, claims: quarantinedClaims }, null, 2)}\n`,
      'utf8',
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
  if (quarantined.length && !DRY_RUN) console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)

  if (unmatched.length) {
    console.error(`\n[quarantine-citations] FAILED — hand-verified entries matched nothing: ${unmatched.join(', ')}`)
    console.error('Either the citation was already removed, or the profile/PMID changed. Re-verify before editing this list.')
    process.exit(1)
  }
}

main()
