#!/usr/bin/env node
/**
 * Split citation rows that packed several studies into one entry.
 *
 * A workbook cell holding two studies was written as a single string —
 * `pmid: "15070181; 22167571"`, `url: ".../15070181/; .../22167571/"` — and
 * exported unchanged. The result is one citation whose link resolves nowhere
 * and whose two studies count as one.
 *
 * `citation-export.mjs` now splits these at generation, so this repairs the
 * already-generated detail files rather than being part of the pipeline. It is
 * idempotent: rows that hold a single identifier are left untouched.
 *
 * Usage: node scripts/data/repair-packed-citations.mjs [--dry-run]
 */

import fs from 'node:fs'
import path from 'node:path'

import { normalizeDoi, normalizePmidList } from '../../lib/citation-identifiers.mjs'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const DRY_RUN = process.argv.includes('--dry-run')

const text = (value) => String(value ?? '').trim()

/** Split a packed URL field into its individual links. */
function splitUrls(value) {
  return text(value)
    .split(/[;|]\s*/)
    .map((part) => part.trim().replace(/[;|]+$/, ''))
    .filter((part) => /^https?:\/\/\S+$/.test(part))
}

/**
 * Expand one source into the studies it actually describes.
 *
 * The first study keeps the original id so nothing that references it breaks;
 * subsequent ones get a suffixed id.
 */
function expandSource(source) {
  const pmids = normalizePmidList(source.pmid ?? source.pubmedId)
  const urls = splitUrls(source.url)
  const count = Math.max(pmids.length, urls.length)

  const packedPmid = /[;,|]/.test(text(source.pmid ?? source.pubmedId))
  const packedUrl = /[;|]/.test(text(source.url))
  if (!packedPmid && !packedUrl) return null
  if (count < 2) {
    // Packed separators but only one usable identifier — just clean the fields.
    const cleaned = { ...source }
    if (pmids.length) {
      if ('pmid' in cleaned) cleaned.pmid = pmids[0]
      if ('pubmedId' in cleaned) cleaned.pubmedId = pmids[0]
    }
    if (urls.length) cleaned.url = urls[0]
    return [cleaned]
  }

  const out = []
  for (let index = 0; index < count; index += 1) {
    const next = { ...source }
    if (pmids[index]) {
      if ('pmid' in next) next.pmid = pmids[index]
      if ('pubmedId' in next) next.pubmedId = pmids[index]
      if (!('pmid' in next) && !('pubmedId' in next)) next.pmid = pmids[index]
    } else {
      delete next.pmid
      delete next.pubmedId
    }
    if (urls[index]) next.url = urls[index]
    else if (pmids[index]) next.url = `https://pubmed.ncbi.nlm.nih.gov/${pmids[index]}/`
    else delete next.url

    if (index > 0 && text(source.id)) next.id = `${source.id}-${index + 1}`
    out.push(next)
  }
  return out
}

/**
 * Collapse sources on the same profile that are the same study.
 *
 * Recovering a missing PMID by title search surfaced these: a paper already
 * cited under a curated title matched again under PubMed's, differing only by
 * a hyphen against an em-dash. Counting one study as two would inflate the
 * evidence backing a claim.
 *
 * Identity is the DOI or PMID, never the title — two spellings of one title
 * are the reason this exists. The richer record wins so no metadata is lost.
 */
function dedupeSources(sources) {
  const byIdentifier = new Map()
  const out = []
  let removed = 0

  for (const source of sources) {
    const doi = normalizeDoi(source.doi)
    const [pmid] = normalizePmidList(source.pmid ?? source.pubmedId)
    const identity = doi ? `doi:${doi.toLowerCase()}` : pmid ? `pmid:${pmid}` : ''

    if (!identity) {
      out.push(source)
      continue
    }

    const seenIndex = byIdentifier.get(identity)
    if (seenIndex === undefined) {
      byIdentifier.set(identity, out.length)
      out.push(source)
      continue
    }

    // Same study twice. Keep whichever record carries more fields, then fill
    // any gap from the other.
    const existing = out[seenIndex]
    const score = (row) => Object.values(row).filter((v) => text(v)).length
    const [primary, secondary] = score(source) > score(existing) ? [source, existing] : [existing, source]
    const merged = { ...primary }
    for (const [key, value] of Object.entries(secondary)) {
      if (!text(merged[key]) && text(value)) merged[key] = value
    }
    out[seenIndex] = merged
    removed += 1
  }

  return { sources: out, removed }
}

function main() {
  const changed = []
  const deduped = []
  let added = 0
  let removed = 0

  for (const dir of ['herbs-detail', 'compounds-detail']) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue

    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const filePath = path.join(full, file)
      const record = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      const sources = Array.isArray(record.sources) ? record.sources : []
      if (!sources.length) continue

      let touched = false
      const next = []
      for (const source of sources) {
        const expanded = expandSource(source)
        if (!expanded) {
          next.push(source)
          continue
        }
        touched = true
        added += expanded.length - 1
        next.push(...expanded)
      }

      const dedupeResult = dedupeSources(next)
      if (dedupeResult.removed) {
        removed += dedupeResult.removed
        deduped.push({ file: `${dir}/${file}`, removed: dedupeResult.removed })
      }

      if (!touched && !dedupeResult.removed) continue
      if (touched) changed.push({ file: `${dir}/${file}`, before: sources.length, after: dedupeResult.sources.length })
      if (!DRY_RUN) {
        record.sources = dedupeResult.sources
        fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`)
      }
    }
  }

  console.log(`\nPacked citation repair${DRY_RUN ? ' (dry run)' : ''}`)
  console.log('='.repeat(66))
  console.log(`Records changed   ${changed.length}`)
  console.log(`Sources added     ${added}  (packed rows split apart)`)
  console.log(`Sources merged    ${removed}  (same study cited twice)`)
  for (const item of changed) console.log(`  split  ${item.file}: ${item.before} -> ${item.after}`)
  for (const item of deduped) console.log(`  merge  ${item.file}: -${item.removed}`)
}

main()
