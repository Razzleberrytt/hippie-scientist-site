#!/usr/bin/env node
/**
 * Stamps hand-verified participant counts onto the study rows that display them.
 *
 * The studies table on every monograph has an `n=` column, `lib/citations.ts`
 * already reads `sampleSize` off each source, and `TrialDesignInsight` already
 * renders "n = X participants". The whole display path existed and had never
 * been given a single number, so every row showed an em dash.
 *
 * Counts come from `config/study-participant-counts.json`, which is
 * curated rather than generated: each entry was checked against the PubMed
 * abstract by hand. The automated extraction behind it proposed 67 counts at
 * roughly 85% precision, and its failure mode is silent and one-directional --
 * it grabs a treatment arm or a subgroup and reports it as the cohort, which
 * always understates the study. Eight of the 67 were wrong that way, including
 * one where a thin-space thousands separator turned 11,321 participants into
 * 321. Two more had no single cohort size to state and were dropped rather than
 * guessed.
 *
 * That is why this reads a reviewed file instead of re-running the extractor:
 * an understated n makes a trial look weaker than it was, and a reader
 * comparing studies has no way to notice.
 */

import { existsSync, readFileSync, readdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import process from 'node:process'

const ROOT = process.cwd()
const SOURCE = path.join(ROOT, 'config', 'study-participant-counts.json')
const DETAIL_DIRS = [
  path.join(ROOT, 'public', 'data', 'herbs-detail'),
  path.join(ROOT, 'public', 'data', 'compounds-detail'),
]

if (!existsSync(SOURCE)) {
  console.error(`[participant-counts] missing ${path.relative(ROOT, SOURCE)}`)
  process.exit(1)
}

const { counts } = JSON.parse(readFileSync(SOURCE, 'utf8'))
const bySize = new Map(counts.map((entry) => [String(entry.pmid), entry.sampleSize]))

let filesChanged = 0
let sourcesStamped = 0
const matchedPmids = new Set()

for (const dir of DETAIL_DIRS) {
  if (!existsSync(dir)) continue

  for (const file of readdirSync(dir)) {
    if (!file.endsWith('.json')) continue
    const full = path.join(dir, file)
    const record = JSON.parse(readFileSync(full, 'utf8'))
    if (!Array.isArray(record.sources)) continue

    let touched = false
    for (const source of record.sources) {
      const pmid = String(source.pubmedId ?? source.pmid ?? '')
      const size = bySize.get(pmid)
      if (size === undefined) continue
      matchedPmids.add(pmid)
      // Never overwrite a count already on the record; the workbook is
      // authoritative where it has an opinion.
      if (source.sampleSize !== undefined && source.sampleSize !== null && source.sampleSize !== '') {
        continue
      }
      source.sampleSize = size
      sourcesStamped += 1
      touched = true
    }

    if (touched) {
      writeFileSync(full, `${JSON.stringify(record, null, 2)}\n`)
      filesChanged += 1
    }
  }
}

// A verified count that matches no source is not an error worth failing on --
// governance can withhold a profile, and the citation library is wider than the
// published set -- but it is worth surfacing rather than swallowing.
const unmatched = counts.filter((entry) => !matchedPmids.has(String(entry.pmid)))

console.log(`[participant-counts] verified counts        ${counts.length}`)
console.log(`[participant-counts] matched a study row    ${matchedPmids.size}`)
console.log(`[participant-counts] sources stamped        ${sourcesStamped}`)
console.log(`[participant-counts] detail files rewritten ${filesChanged}`)
if (unmatched.length) {
  console.log(`[participant-counts] no matching source     ${unmatched.length}`)
  console.log(`  ${unmatched.map((entry) => entry.pmid).join(', ')}`)
}
