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

import { normalizePmidList } from '../../lib/citation-identifiers.mjs'

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

function main() {
  const changed = []
  let added = 0

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

      if (!touched) continue
      changed.push({ file: `${dir}/${file}`, before: sources.length, after: next.length })
      if (!DRY_RUN) {
        record.sources = next
        fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`)
      }
    }
  }

  console.log(`\nPacked citation repair${DRY_RUN ? ' (dry run)' : ''}`)
  console.log('='.repeat(66))
  console.log(`Records changed   ${changed.length}`)
  console.log(`Sources added     ${added}`)
  for (const item of changed) console.log(`  ${item.file}: ${item.before} -> ${item.after}`)
}

main()
