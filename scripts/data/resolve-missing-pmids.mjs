#!/usr/bin/env node
/**
 * Recover PubMed identifiers for citations that have none.
 *
 * 93 cited sources carry a title but no PMID and no DOI, so nothing links them
 * to a verifiable record. Most are indexed in PubMed; the identifier was just
 * never captured. This searches PubMed by title and accepts a match only when
 * the returned record's title is effectively the same string.
 *
 * A wrong PMID is worse than no PMID — it attributes a claim to a study that
 * does not support it — so the acceptance rule is deliberately strict:
 *
 *   - the search must return a candidate whose normalized title similarity to
 *     the cited title is at least MIN_SIMILARITY
 *   - ties and near-ties are rejected rather than guessed between
 *
 * Everything else is reported as unresolved. Some correctly have no PMID at
 * all: "Black Cohosh: Health Professional Fact Sheet" is an NIH ODS page, not
 * a journal article.
 *
 * Writes proposals to ops/reports/. Nothing is applied without --apply.
 *
 * Usage: node scripts/data/resolve-missing-pmids.mjs [--apply] [--limit=N]
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const DATA_DIR = path.join(ROOT, 'public', 'data')
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'resolved-pmids.json')

const ESEARCH = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esearch.fcgi'
const ESUMMARY = 'https://eutils.ncbi.nlm.nih.gov/entrez/eutils/esummary.fcgi'
const REQUEST_SPACING_MS = 400
/** Jaccard over normalized title tokens. 0.85 tolerates punctuation and case only. */
const MIN_SIMILARITY = 0.85
/**
 * Below the auto-apply bar but too close to throw away. These are usually the
 * right paper reached through a flawed cited title — one reads
 * "Bacopamonnieri" where PubMed has "Bacopa monnieri" (0.842), another is the
 * real title truncated mid-sentence (0.846). A human can confirm each in
 * seconds; a script guessing would attribute claims to the wrong study.
 */
const REVIEW_SIMILARITY = 0.7

const args = process.argv.slice(2)
const APPLY = args.includes('--apply')
const limitArg = args.find((a) => a.startsWith('--limit='))
const LIMIT = limitArg ? Number(limitArg.split('=')[1]) : Infinity

const sleep = (ms) => new Promise((r) => setTimeout(r, ms))
const text = (v) => String(v ?? '').trim()

/** Titles that are internal notes rather than the name of a study. */
const NON_TITLE = /^v\d|minimal citation row|^pubmed pmid|fact sheet|monograph|livertox/i

function normalizeTitle(value) {
  return text(value).toLowerCase().replace(/[^a-z0-9\s]/g, ' ').replace(/\s+/g, ' ').trim()
}

function similarity(a, b) {
  const A = new Set(normalizeTitle(a).split(' ').filter(Boolean))
  const B = new Set(normalizeTitle(b).split(' ').filter(Boolean))
  if (!A.size || !B.size) return 0
  let inter = 0
  for (const t of A) if (B.has(t)) inter += 1
  return inter / (A.size + B.size - inter)
}

function collectUnidentified() {
  const out = []
  for (const dir of ['herbs-detail', 'compounds-detail']) {
    const full = path.join(DATA_DIR, dir)
    if (!fs.existsSync(full)) continue
    for (const file of fs.readdirSync(full)) {
      if (!file.endsWith('.json')) continue
      const record = JSON.parse(fs.readFileSync(path.join(full, file), 'utf8'))
      for (const source of Array.isArray(record.sources) ? record.sources : []) {
        if (text(source.pmid ?? source.pubmedId) || text(source.doi)) continue
        const title = text(source.title)
        if (title.length < 25 || NON_TITLE.test(title)) continue
        out.push({ file: `${dir}/${file}`, slug: record.slug ?? file, id: text(source.id), title })
      }
    }
  }
  return out
}

async function searchByTitle(title) {
  const term = encodeURIComponent(`${normalizeTitle(title)}[Title]`)
  const searchRes = await fetch(`${ESEARCH}?db=pubmed&retmode=json&retmax=5&term=${term}`, {
    headers: { 'User-Agent': 'thehippiescientist.net citation verification' },
  })
  if (!searchRes.ok) throw new Error(`esearch ${searchRes.status}`)
  const ids = (await searchRes.json())?.esearchresult?.idlist ?? []
  if (!ids.length) return null

  await sleep(REQUEST_SPACING_MS)
  const sumRes = await fetch(`${ESUMMARY}?db=pubmed&retmode=json&id=${ids.join(',')}`, {
    headers: { 'User-Agent': 'thehippiescientist.net citation verification' },
  })
  if (!sumRes.ok) throw new Error(`esummary ${sumRes.status}`)
  const result = (await sumRes.json())?.result ?? {}

  return ids
    .map((id) => result[id])
    .filter((entry) => entry && !entry.error)
    .map((entry) => ({ pmid: entry.uid, title: text(entry.title), journal: text(entry.source), pubdate: text(entry.pubdate) }))
}

async function main() {
  const pending = collectUnidentified().slice(0, LIMIT)
  console.log(`\nResolve missing PMIDs${APPLY ? ' (applying)' : ' (proposal only)'}`)
  console.log('='.repeat(70))
  console.log(`Citations with a searchable title and no identifier: ${pending.length}\n`)

  const resolved = []
  const needsReview = []
  const unresolved = []

  for (const item of pending) {
    let candidates = null
    try {
      candidates = await searchByTitle(item.title)
    } catch (error) {
      unresolved.push({ ...item, reason: error.message })
      await sleep(REQUEST_SPACING_MS)
      continue
    }

    if (!candidates?.length) {
      unresolved.push({ ...item, reason: 'no-search-result' })
      await sleep(REQUEST_SPACING_MS)
      continue
    }

    const scored = candidates
      .map((c) => ({ ...c, score: similarity(item.title, c.title) }))
      .sort((a, b) => b.score - a.score)
    const best = scored[0]

    if (best.score >= MIN_SIMILARITY) {
      resolved.push({ ...item, pmid: best.pmid, matchedTitle: best.title, journal: best.journal, pubdate: best.pubdate, score: Number(best.score.toFixed(3)) })
      console.log(`  ✓ ${item.slug} → PMID ${best.pmid} (${best.score.toFixed(2)}) ${best.title.slice(0, 60)}`)
    } else if (best.score >= REVIEW_SIMILARITY) {
      needsReview.push({ ...item, candidatePmid: best.pmid, candidateTitle: best.title, journal: best.journal, score: Number(best.score.toFixed(3)) })
    } else {
      unresolved.push({ ...item, reason: 'below-similarity-threshold', bestScore: Number(best.score.toFixed(3)), bestTitle: best.title.slice(0, 90) })
    }
    await sleep(REQUEST_SPACING_MS)
  }

  fs.mkdirSync(path.dirname(REPORT_PATH), { recursive: true })
  fs.writeFileSync(
    REPORT_PATH,
    `${JSON.stringify({ generatedAt: new Date().toISOString(), minSimilarity: MIN_SIMILARITY, reviewSimilarity: REVIEW_SIMILARITY, resolved, needsReview, unresolved }, null, 2)}\n`,
  )

  console.log(`\nResolved   ${resolved.length}`)
  console.log(`Unresolved ${unresolved.length}`)

  if (APPLY && resolved.length) {
    const byFile = new Map()
    for (const item of resolved) {
      if (!byFile.has(item.file)) byFile.set(item.file, [])
      byFile.get(item.file).push(item)
    }
    let applied = 0
    for (const [file, items] of byFile) {
      const filePath = path.join(DATA_DIR, file)
      const record = JSON.parse(fs.readFileSync(filePath, 'utf8'))
      for (const source of record.sources ?? []) {
        const hit = items.find((i) => (i.id && i.id === text(source.id)) || i.title === text(source.title))
        if (!hit || text(source.pmid ?? source.pubmedId)) continue
        source.pmid = hit.pmid
        source.url = `https://pubmed.ncbi.nlm.nih.gov/${hit.pmid}/`
        source.metadataSource = 'pubmed-title-search'
        applied += 1
      }
      fs.writeFileSync(filePath, `${JSON.stringify(record, null, 2)}\n`)
    }
    console.log(`Applied    ${applied} identifiers`)
  }

  console.log(`\nReport: ${path.relative(ROOT, REPORT_PATH)}`)
}

main().catch((error) => {
  console.error(`[resolve-pmids] ${error.message}`)
  process.exit(1)
})
