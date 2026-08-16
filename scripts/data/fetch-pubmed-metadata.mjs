#!/usr/bin/env node
/**
 * Fetch real bibliographic metadata for every cited PMID from PubMed.
 *
 * 987 of 1070 citations carry no journal, 194 no year, 93 no authors, and 157
 * have a placeholder where the study title should be. All of that is public
 * record — it just was never retrieved. This asks NCBI E-utilities for it.
 *
 * Nothing here is invented: every field written comes from the esummary
 * response for that exact PMID, and a PMID that PubMed does not recognise is
 * recorded as a failure rather than filled in with a guess.
 *
 * Results are cached in `ops/cache/pubmed-metadata.json`, so reruns are free
 * and the merge step can be re-applied without hitting the network.
 *
 * Usage:
 *   node scripts/data/fetch-pubmed-metadata.mjs [--limit=N] [--refresh]
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const CACHE_PATH = path.join(ROOT, 'ops', 'cache', 'pubmed-metadata.json')

const ENDPOINT = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
/** NCBI allows 3 requests/second without an API key; stay well inside that. */
const REQUEST_SPACING_MS = 400
const BATCH_SIZE = 150

const args = process.argv.slice(2)
const limitArg = args.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity
const REFRESH = args.includes('--refresh')

const PMID_PATTERN = /^[1-9]\d{0,8}$/
const sleep = (ms) => new Promise((resolve) => setTimeout(resolve, ms))

function collectPmids() {
  const ids = new Set()
  for (const dir of ['herbs-detail', 'compounds-detail']) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const record = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'))
      for (const source of Array.isArray(record.sources) ? record.sources : []) {
        const pmid = String(source.pmid ?? source.pubmedId ?? '').trim()
        if (PMID_PATTERN.test(pmid)) ids.add(pmid)
      }
    }
  }
  return [...ids].sort()
}

function readCache() {
  if (REFRESH || !fs.existsSync(CACHE_PATH)) return {}
  try {
    const parsed = JSON.parse(fs.readFileSync(CACHE_PATH, 'utf8'))
    return parsed && typeof parsed === 'object' ? parsed.records ?? {} : {}
  } catch {
    return {}
  }
}

/** Year of publication, from the most specific date PubMed supplies. */
function extractYear(entry) {
  const raw = String(entry.sortpubdate || entry.pubdate || entry.epubdate || '')
  const match = raw.match(/\b(1[89]\d{2}|20\d{2})\b/)
  return match ? Number(match[1]) : null
}

function extractDoi(entry) {
  const ids = Array.isArray(entry.articleids) ? entry.articleids : []
  const doi = ids.find((id) => id.idtype === 'doi')
  return doi ? String(doi.value).trim() : ''
}

/** "Cheah KL et al." — the form already used elsewhere in the dataset. */
function formatAuthors(entry) {
  const authors = Array.isArray(entry.authors)
    ? entry.authors.filter((a) => a.authtype === 'Author').map((a) => String(a.name).trim()).filter(Boolean)
    : []
  if (!authors.length) return ''
  if (authors.length === 1) return authors[0]
  if (authors.length === 2) return `${authors[0]} and ${authors[1]}`
  return `${authors[0]} et al.`
}

function normalizeEntry(pmid, entry) {
  return {
    pmid,
    title: String(entry.title ?? '').replace(/\s+/g, ' ').replace(/\.$/, '').trim(),
    authors: formatAuthors(entry),
    authorCount: Array.isArray(entry.authors) ? entry.authors.filter((a) => a.authtype === 'Author').length : 0,
    journal: String(entry.source ?? '').trim(),
    year: extractYear(entry),
    volume: String(entry.volume ?? '').trim(),
    pages: String(entry.pages ?? '').trim(),
    doi: extractDoi(entry),
    /** PubMed's own publication types — the authoritative study design. */
    publicationTypes: Array.isArray(entry.pubtype) ? entry.pubtype.map(String) : [],
    fetchedFrom: 'pubmed-esummary',
  }
}

async function fetchBatch(pmids) {
  const url = `${ENDPOINT}?db=pubmed&retmode=json&id=${pmids.join(',')}`
  const response = await fetch(url, { headers: { 'User-Agent': 'thehippiescientist.net citation verification' } })
  if (!response.ok) throw new Error(`PubMed responded ${response.status}`)
  const payload = await response.json()
  const result = payload?.result
  if (!result) throw new Error('PubMed returned no result block')

  const out = {}
  const failures = []
  for (const pmid of pmids) {
    const entry = result[pmid]
    // PubMed reports an unknown id with an `error` key rather than omitting it.
    if (!entry || entry.error) {
      failures.push({ pmid, reason: entry?.error ? String(entry.error) : 'not-returned' })
      continue
    }
    out[pmid] = normalizeEntry(pmid, entry)
  }
  return { out, failures }
}

async function main() {
  const allPmids = collectPmids()
  const cache = readCache()
  const pending = allPmids.filter((pmid) => !cache[pmid]).slice(0, LIMIT)

  console.log(`\nPubMed metadata fetch`)
  console.log('='.repeat(66))
  console.log(`Cited PMIDs      ${allPmids.length}`)
  console.log(`Already cached   ${allPmids.length - allPmids.filter((p) => !cache[p]).length}`)
  console.log(`To fetch         ${pending.length}`)

  const failures = []
  for (let index = 0; index < pending.length; index += BATCH_SIZE) {
    const batch = pending.slice(index, index + BATCH_SIZE)
    process.stdout.write(`  batch ${Math.floor(index / BATCH_SIZE) + 1}: ${batch.length} ids … `)
    try {
      const { out, failures: batchFailures } = await fetchBatch(batch)
      Object.assign(cache, out)
      failures.push(...batchFailures)
      console.log(`${Object.keys(out).length} resolved, ${batchFailures.length} unresolved`)
    } catch (error) {
      console.log(`FAILED (${error.message})`)
      failures.push(...batch.map((pmid) => ({ pmid, reason: error.message })))
    }
    if (index + BATCH_SIZE < pending.length) await sleep(REQUEST_SPACING_MS)
  }

  fs.mkdirSync(path.dirname(CACHE_PATH), { recursive: true })
  fs.writeFileSync(
    CACHE_PATH,
    `${JSON.stringify({ fetchedAt: new Date().toISOString(), count: Object.keys(cache).length, failures, records: cache }, null, 2)}\n`,
  )

  const resolved = allPmids.filter((pmid) => cache[pmid])
  console.log(`\nResolved         ${resolved.length} / ${allPmids.length}`)
  console.log(`Unresolved       ${allPmids.length - resolved.length}`)
  console.log(`  with journal   ${resolved.filter((p) => cache[p].journal).length}`)
  console.log(`  with year      ${resolved.filter((p) => cache[p].year).length}`)
  console.log(`  with authors   ${resolved.filter((p) => cache[p].authors).length}`)
  console.log(`  with DOI       ${resolved.filter((p) => cache[p].doi).length}`)
  console.log(`\nCache: ${path.relative(ROOT, CACHE_PATH)}`)
}

main().catch((error) => {
  console.error(`[pubmed-metadata] ${error.message}`)
  process.exit(1)
})
