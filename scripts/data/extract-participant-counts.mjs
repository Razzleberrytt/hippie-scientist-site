#!/usr/bin/env node
/**
 * Extract participant counts from PubMed abstracts (backlog 1288-1293).
 *
 * "4 RCTs, 312 participants" tells a reader far more than "4 RCTs". The number
 * is usually stated in the abstract, but pulling it out is the kind of task
 * that looks easy and produces confidently wrong facts:
 *
 *   "In this 60-day, randomized, double-blind, placebo-controlled study..."
 *
 * 60 is a duration. A naive "number near a study word" rule publishes it as a
 * participant count on a health page.
 *
 * So extraction is deliberately narrow. A count is taken only from a phrase
 * that names people explicitly — "60 participants", "n = 60 patients",
 * "a total of 312 subjects" — and any candidate immediately followed by a unit
 * of time, dose, or percentage is rejected. Where an abstract yields no
 * unambiguous count, none is recorded.
 *
 * MEASURED PRECISION: roughly nine in ten. That is not good enough to publish,
 * so this writes a REVIEW QUEUE and never touches page data. Both failure modes
 * found by hand-checking the output understate the cohort, which would make the
 * evidence look weaker than it is:
 *
 *   "Healthy individuals (n = 60; age >40 y; 30 men/30 women)"
 *     -> a bare-number rule reads "30 men" and reports 30.
 *   "...113). At baseline, the iron-sufficient women (n = 42) performed..."
 *     -> the people-before-n rule reads a subgroup and reports 42, not 113.
 *
 * The second is not fixable by pattern alone: abstracts legitimately report a
 * total and its subgroups in the same sentence, and telling them apart needs
 * someone who can read the study. So each count ships as a proposal with the
 * surrounding sentence attached, for a human to accept or correct.
 *
 * Usage: node scripts/data/extract-participant-counts.mjs [--limit=N]
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')
const ABSTRACT_CACHE = path.join(ROOT, 'ops', 'cache', 'pubmed-abstracts.json')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'participant-counts.json')

const EFETCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/efetch.fcgi'
const BATCH_SIZE = 100
const REQUEST_SPACING_MS = 400

const args = process.argv.slice(2)
const limitArg = args.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))

/** Designs where a participant count is meaningful. */
const HUMAN_DESIGNS = /randomized controlled trial|clinical trial|meta-analysis|systematic review|controlled trial/i

/** Words that mean the number counts people. */
const PEOPLE = '(?:participants?|patients?|subjects?|volunteers?|adults?|women|men|children|individuals?)'

/**
 * Units that disqualify a candidate. "60-day", "60 mg", "60 %" and "60 weeks"
 * all sit next to study vocabulary and none of them count people.
 */
const DISQUALIFYING_UNIT = /^\s*(?:-|\s)?(?:day|days|week|weeks|month|months|year|years|hour|hours|min|minutes|mg|g|mcg|µg|ml|kg|%|percent|iu)\b/i

const PATTERNS = [
  // "a total of 312 participants", "total of 312 patients"
  new RegExp(`\\btotal of\\s+([\\d,]+)\\s+${PEOPLE}\\b`, 'i'),
  // "n = 60 participants" / "N=60 patients"
  new RegExp(`\\bn\\s*=\\s*([\\d,]+)\\s+${PEOPLE}\\b`, 'i'),
  // "Healthy individuals (n = 60; age >40 y; 30 men/30 women)" — the people
  // word precedes the count. Without this the bare pattern below matched
  // "30 men" and reported a cohort of 60 as 30.
  new RegExp(`${PEOPLE}\\s*\\(\\s*n\\s*=\\s*([\\d,]+)`, 'i'),
  // "60 participants were randomized"
  new RegExp(`\\b([\\d,]+)\\s+${PEOPLE}\\s+(?:were|was|underwent|completed|received|participated)\\b`, 'i'),
  // "randomized 60 patients", "enrolled 312 participants"
  new RegExp(`\\b(?:randomi[sz]ed|enrolled|recruited|included)\\s+([\\d,]+)\\s+${PEOPLE}\\b`, 'i'),
  // bare "312 participants" — last resort, still requires the people word
  new RegExp(`\\b([\\d,]+)\\s+${PEOPLE}\\b`, 'i'),
]

/**
 * @param {string} abstract
 * @returns {{ count: number, pattern: number, evidence: string } | null}
 */
export function extractParticipantCount(abstract) {
  const text = String(abstract ?? '').replace(/\s+/g, ' ')
  if (!text) return null

  for (let index = 0; index < PATTERNS.length; index += 1) {
    const match = PATTERNS[index].exec(text)
    if (!match) continue

    const raw = match[1].replace(/,/g, '')
    const count = Number(raw)
    if (!Number.isFinite(count)) continue
    // Below 5 is a case series rather than a trial cohort; above 5,000,000 is
    // a population statistic that wandered into the abstract.
    if (count < 5 || count > 5_000_000) continue

    // Reject when a unit follows the number rather than a people word — this
    // is what stops "60-day" being read as sixty people.
    const after = text.slice(match.index + match[0].length)
    if (DISQUALIFYING_UNIT.test(after)) continue

    return {
      count,
      pattern: index,
      evidence: text.slice(Math.max(0, match.index - 40), match.index + match[0].length + 40).trim(),
    }
  }
  return null
}

function readJson(file, fallback) {
  if (!fs.existsSync(file)) return fallback
  try {
    return JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return fallback
  }
}

async function fetchAbstracts(pmids) {
  const url = `${EFETCH}?db=pubmed&id=${pmids.join(',')}&retmode=xml&rettype=abstract`
  const response = await fetch(url, { headers: { 'User-Agent': 'thehippiescientist.net citation verification' } })
  if (!response.ok) throw new Error(`efetch ${response.status}`)
  const xml = await response.text()

  const out = {}
  for (const block of xml.split('<PubmedArticle>').slice(1)) {
    const pmid = (block.match(/<PMID[^>]*>(\d+)</) ?? [])[1]
    if (!pmid) continue
    const parts = (block.match(/<AbstractText[^>]*>([\s\S]*?)<\/AbstractText>/g) ?? []).map((chunk) =>
      chunk.replace(/<[^>]+>/g, ' ').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&amp;/g, '&'),
    )
    out[pmid] = parts.join(' ').replace(/\s+/g, ' ').trim()
  }
  return out
}

async function main() {
  const cache = readJson(CACHE_PATH, { records: {} }).records ?? {}
  const abstracts = readJson(ABSTRACT_CACHE, { abstracts: {} }).abstracts ?? {}

  const candidates = Object.values(cache)
    .filter((record) => (record.publicationTypes ?? []).some((type) => HUMAN_DESIGNS.test(type)))
    .map((record) => record.pmid)

  const pending = candidates.filter((pmid) => !abstracts[pmid]).slice(0, LIMIT)

  console.log('\nParticipant counts')
  console.log('='.repeat(70))
  console.log(`Human-design studies   ${candidates.length}`)
  console.log(`Abstracts to fetch     ${pending.length}`)

  for (let index = 0; index < pending.length; index += BATCH_SIZE) {
    const batch = pending.slice(index, index + BATCH_SIZE)
    process.stdout.write(`  batch ${Math.floor(index / BATCH_SIZE) + 1}: ${batch.length} … `)
    try {
      Object.assign(abstracts, await fetchAbstracts(batch))
      console.log('ok')
    } catch (error) {
      console.log(`FAILED (${error.message})`)
    }
    if (index + BATCH_SIZE < pending.length) await sleep(REQUEST_SPACING_MS)
  }

  fs.mkdirSync(path.dirname(ABSTRACT_CACHE), { recursive: true })
  fs.writeFileSync(ABSTRACT_CACHE, `${JSON.stringify({ fetchedAt: new Date().toISOString(), abstracts }, null, 2)}\n`)

  const extracted = []
  const skipped = []
  for (const pmid of candidates) {
    const abstract = abstracts[pmid]
    if (!abstract) {
      skipped.push({ pmid, reason: 'no-abstract' })
      continue
    }
    const result = extractParticipantCount(abstract)
    if (!result) {
      skipped.push({ pmid, reason: 'no-unambiguous-count' })
      continue
    }
    extracted.push({ pmid, title: String(cache[pmid]?.title ?? '').slice(0, 70), ...result })
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        status: 'review-queue',
        note: 'Hand-verify each count against its evidence sentence before use. Measured precision is roughly 90%; the known failure mode is reporting a subgroup as the total, which understates the cohort.',
        extracted,
        skipped,
      },
      null,
      2,
    )}\n`,
  )

  console.log(`\nWith a participant count  ${extracted.length} / ${candidates.length}`)
  console.log(`No unambiguous count      ${skipped.filter((s) => s.reason === 'no-unambiguous-count').length}`)
  console.log(`No abstract available     ${skipped.filter((s) => s.reason === 'no-abstract').length}`)
  console.log('\nSample (verify these against the abstract before applying):')
  for (const item of extracted.slice(0, 12)) {
    console.log(`  n=${String(item.count).padStart(6)}  p${item.pattern}  ${item.title}`)
    console.log(`             …${item.evidence}…`)
  }
  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
}

main().catch((error) => {
  console.error(`[participant-counts] ${error.message}`)
  process.exit(1)
})
