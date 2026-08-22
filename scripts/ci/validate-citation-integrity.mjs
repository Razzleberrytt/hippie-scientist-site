#!/usr/bin/env node
/**
 * Citation integrity: deterministic failures, heuristic review candidates.
 *
 * A citation attached to the wrong profile is a scientific-integrity defect,
 * but the signals that detect one are not equally trustworthy, so this script
 * keeps two classes strictly apart:
 *
 *   DETERMINISTIC — provably broken regardless of subject matter. A malformed
 *   PMID, the same identifier twice on one profile, a `metadataSource: 'pubmed'`
 *   flag on a placeholder title. These fail the build.
 *
 *   HEURISTIC — a citation whose title never names the profile's subject. This
 *   is a *review candidate*, written to a report and never failing the build,
 *   because the signal is weak in both directions. Of the four strongest
 *   candidates checked by hand against PubMed, three were correct: an ecology
 *   review of old-growth forests genuinely discusses Fomitopsis officinalis, an
 *   epilepsy review genuinely lists Angelica archangelica, and a collagen trial
 *   genuinely used a formula containing acerola extract. Auto-correcting on
 *   title similarity would have destroyed all three.
 *
 * Nothing here rewrites a citation. Reassigning a paper to a different
 * supplement requires reading it, which is a human's job.
 *
 * Usage: node scripts/ci/validate-citation-integrity.mjs [--data-dir=public/data]
 */

import fs from 'node:fs'
import path from 'node:path'

import { isPlaceholderCitationTitle } from '../../lib/citation-identifiers.mjs'

const ROOT = process.cwd()
const args = process.argv.slice(2)
const dirArg = args.find((arg) => arg.startsWith('--data-dir='))
const DATA_DIR = path.resolve(ROOT, dirArg ? dirArg.split('=')[1] : 'public/data')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'citation-review-candidates.json')

/** A corpus smaller than this is not the corpus; see validate-editorial-leaks. */
const MIN_EXPECTED_PROFILES = 400
const MIN_EXPECTED_SOURCES = 700

const PMID_PATTERN = /^[1-9]\d{0,8}$/
const DOI_PATTERN = /^10\.\d{4,9}\/\S+$/

const norm = (value) => String(value ?? '').toLowerCase().replace(/[^a-z0-9 ]+/g, ' ').replace(/\s+/g, ' ').trim()
const words = (value) => new Set(norm(value).split(' ').filter((word) => word.length > 3))

function loadProfiles() {
  const profiles = []
  for (const [kind, dir] of [['herb', 'herbs-detail'], ['compound', 'compounds-detail']]) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(full, file)
      let record
      try {
        record = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      } catch (error) {
        console.error(`[citation-integrity] FAILED — cannot parse ${path.relative(ROOT, filePath)}: ${error.message}`)
        process.exit(1)
      }
      const constituents = (record.activeCompounds ?? [])
        .map((entry) => (typeof entry === 'string' ? entry : entry?.name ?? entry?.slug))
        .filter(Boolean)
      profiles.push({
        kind,
        slug: String(record.slug ?? file.replace(/\.json$/, '')),
        name: String(record.name ?? ''),
        identity: [record.name, record.scientific, record.common, ...(record.aliases ?? [])].filter(Boolean),
        constituents,
        sources: Array.isArray(record.sources) ? record.sources : [],
      })
    }
  }
  return profiles
}

function main() {
  const profiles = loadProfiles()
  const sources = profiles.flatMap((profile) => profile.sources)

  if (profiles.length < MIN_EXPECTED_PROFILES || sources.length < MIN_EXPECTED_SOURCES) {
    console.error(
      `[citation-integrity] FAILED — inspected ${profiles.length} profiles and ${sources.length} citations, below ` +
        `the ${MIN_EXPECTED_PROFILES}/${MIN_EXPECTED_SOURCES} minimum. Run \`npm run data:build\` first; a clean ` +
        'result on an empty corpus would mean nothing.',
    )
    process.exit(1)
  }

  const failures = []
  const candidates = []

  for (const profile of profiles) {
    const seen = new Map()

    for (const source of profile.sources) {
      const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
      const doi = String(source.doi ?? '').trim()
      const url = String(source.url ?? '').trim()
      const title = String(source.title ?? '').trim()

      // ---- deterministic ----
      if (pmid && !PMID_PATTERN.test(pmid)) {
        failures.push({ kind: 'BROKEN_IDENTIFIER', profile: profile.slug, detail: `malformed PMID "${pmid}"` })
      }
      if (doi && !DOI_PATTERN.test(doi)) {
        failures.push({ kind: 'BROKEN_IDENTIFIER', profile: profile.slug, detail: `malformed DOI "${doi}"` })
      }
      if (!pmid && !doi && !url) {
        failures.push({ kind: 'BROKEN_IDENTIFIER', profile: profile.slug, detail: `citation with no PMID, DOI or URL: "${title.slice(0, 60)}"` })
      }
      const identity = pmid || doi || url
      if (identity) {
        if (seen.has(identity)) {
          failures.push({ kind: 'DUPLICATE', profile: profile.slug, detail: `identifier cited twice on one profile: ${identity}` })
        }
        seen.set(identity, true)
      }
      // A pubmed provenance flag on a placeholder title claims PubMed supplied
      // a value that is in fact a note about PubMed not having supplied it.
      if (source.metadataSource === 'pubmed' && isPlaceholderCitationTitle(title)) {
        failures.push({
          kind: 'FALSE_PROVENANCE',
          profile: profile.slug,
          detail: `metadataSource=pubmed but title is a placeholder (PMID ${pmid || '-'})`,
        })
      }

      // ---- heuristic (review candidates only) ----
      if (!title) continue
      const own = new Set([...words(profile.identity.join(' ')), ...words(profile.slug.replace(/-/g, ' '))])
      const constituentWords = words(profile.constituents.join(' '))
      const titleWords = words(title)
      const namesSubject = [...own].some((word) => titleWords.has(word))
      const namesConstituent = [...constituentWords].some((word) => titleWords.has(word))
      if (namesSubject || namesConstituent) continue

      candidates.push({
        classification: 'AMBIGUOUS_REQUIRES_REVIEW',
        profile: profile.slug,
        profileName: profile.name,
        kind: profile.kind,
        pmid: pmid || null,
        doi: doi || null,
        url: url || null,
        title,
        reason: 'citation title names neither the profile subject nor any of its listed constituents',
        metadataSource: source.metadataSource ?? null,
      })
    }
  }

  // Reuse across profiles is reported alongside, but note that a herb-drug
  // interaction review legitimately belongs on every herb it covers: PMID
  // 10675182 ("Herb-drug interactions") is cited on nine profiles and is
  // correct on all nine. This is context for a reviewer, not a defect.
  const byIdentifier = new Map()
  for (const profile of profiles) {
    for (const source of profile.sources) {
      const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
      if (!pmid) continue
      if (!byIdentifier.has(pmid)) byIdentifier.set(pmid, new Set())
      byIdentifier.get(pmid).add(profile.slug)
    }
  }
  const reused = [...byIdentifier.entries()]
    .filter(([, slugs]) => slugs.size > 1)
    .map(([pmid, slugs]) => ({ pmid, profiles: [...slugs].sort() }))
    .sort((a, b) => b.profiles.length - a.profiles.length)

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(
      {
        profilesInspected: profiles.length,
        citationsInspected: sources.length,
        deterministicFailures: failures.length,
        reviewCandidates: candidates.length,
        note: 'Review candidates are heuristic. Nothing here has been auto-corrected. Reassigning a citation requires reading the paper.',
        candidates,
        citationsReusedAcrossProfiles: reused,
      },
      null,
      2,
    )}\n`,
    'utf8',
  )

  console.log('\nCitation integrity')
  console.log('='.repeat(66))
  console.log(`Profiles inspected      ${profiles.length}`)
  console.log(`Citations inspected     ${sources.length}`)
  console.log(`Deterministic failures  ${failures.length}`)
  console.log(`Review candidates       ${candidates.length}  (heuristic — not failures)`)
  console.log(`Reused across profiles  ${reused.length}`)
  console.log(`\nReview report: ${path.relative(ROOT, REPORT_PATH)}`)

  if (!failures.length) {
    console.log('\nNo deterministic citation defects.')
    return
  }

  const byKind = failures.reduce((acc, failure) => {
    acc[failure.kind] = (acc[failure.kind] ?? 0) + 1
    return acc
  }, {})
  console.error(`\n[citation-integrity] FAILED — ${failures.length} deterministic defect(s).`)
  for (const [kind, count] of Object.entries(byKind)) console.error(`  ${kind}: ${count}`)
  for (const failure of failures.slice(0, 25)) {
    console.error(`  ${failure.profile}: ${failure.detail}`)
  }
  if (failures.length > 25) console.error(`  … and ${failures.length - 25} more`)
  process.exit(1)
}

main()
