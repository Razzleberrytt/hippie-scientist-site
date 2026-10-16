#!/usr/bin/env node
/**
 * Live smoke test for the public research-intake collection.
 * Reuses the existing weekly link-checker schedule; never creates clinical
 * grades, alters canonical ledgers, or removes the review/noindex boundary.
 */
import assert from 'node:assert/strict'
import { readFileSync, readdirSync } from 'node:fs'

const BASE = (process.env.SITE_URL || 'https://thehippiescientist.net').replace(/\/$/, '')
const DOSSIER_DIR = 'docs/research'
const FILE = /^deep-enrichment-(\d+)-(\d{4}-\d{2}-\d{2})\.md$/
const rounds = readdirSync(DOSSIER_DIR)
  .filter((filename) => filename.startsWith('deep-enrichment-'))
  .map((filename) => {
    const match = filename.match(FILE)
    assert(match, `Unexpected dossier filename: ${filename}`)
    return { round: Number(match[1]), file: `${DOSSIER_DIR}/${filename}` }
  })
  .filter((item) => item.round >= 10)
  .sort((a, b) => a.round - b.round)

assert(rounds.length >= 6, 'Original six rounds must remain published')

const expectedByRound = new Map()
for (const { round, file } of rounds) {
  const markdown = readFileSync(file, 'utf8')
  const headings = [...markdown.matchAll(/^## (DE\d+-\d+)\s+[—–-]\s+(.+)$/gm)]
  assert.equal(headings.length, 10, `Wrong number of source sections in ${file}`)
  const sources = new Set()
  headings.forEach((heading, i) => {
    assert.equal(heading[1], `DE${round}-${String(i + 1).padStart(2, '0')}`)
    const body = markdown.slice(heading.index + heading[0].length, headings[i + 1]?.index ?? markdown.length)
    const pmids = [...body.matchAll(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{7,9})/g)].map((match) => match[1])
    assert(pmids.length > 0, `Missing primary source in ${heading[1]}`)
    pmids.forEach((pmid) => sources.add(pmid))
  })
  expectedByRound.set(round, { ids: headings.map((heading) => heading[1]), sources })
}

async function getHtml(path) {
  let error
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const response = await fetch(`${BASE}${path}`, {
        headers: { 'User-Agent': 'THS-Research-Publication-Sentinel/1.0' },
        signal: AbortSignal.timeout(20000),
        redirect: 'follow',
      })
      if (!response.ok) throw new Error(`${path}: HTTP ${response.status}`)
      const html = await response.text()
      assert(html.length > 500, `${path}: unexpectedly short HTML response`)
      return html
    } catch (cause) {
      error = cause
      if (attempt < 3) await new Promise((resolve) => setTimeout(resolve, 1000 * attempt))
    }
  }
  throw new Error(`${path}: ${error?.message ?? 'unknown live-fetch failure'}`)
}

const index = await getHtml('/research/investigations/')
assert(/<meta[^>]+name="robots"[^>]+content="index, follow"/.test(index), 'Public investigation index must remain indexable')
const everyId = [...expectedByRound.values()].flatMap((record) => record.ids)
for (const id of everyId) assert(index.includes(id), `Index is missing ${id}`)
for (const { round } of rounds) {
  assert(index.includes(`/research/investigations/${round}/`), `Index lacks link to round ${round}`)
  const html = await getHtml(`/research/investigations/${round}/`)
  assert(/<meta[^>]+name="robots"[^>]+content="noindex, follow"/.test(html), `Raw round ${round} has lost its scientific review gate`)
  const expected = expectedByRound.get(round)
  assert(html.includes('id="round-governance"'), `Round ${round} is missing its shared QA section`)
  assert(html.includes('Read complete whole-round governance notes'), `Round ${round} hides its whole-round QA record`)
  for (const id of expected.ids) {
    assert(html.includes(`id="${id.toLowerCase()}"`), `Round ${round} missing ${id}`)
  }
  for (const pmid of expected.sources) {
    assert(html.includes(`https://pubmed.ncbi.nlm.nih.gov/${pmid}/`), `Round ${round} missing PMID ${pmid}`)
  }
  assert((html.match(/Read complete research-intake notes/g) || []).length === 10, `Round ${round}: notes missing or hidden from page markup`)
  console.log(`PASS: round ${round} — 10 investigations, ${expected.sources.size} linked PMIDs`)
}
console.log(`SUCCESS: all ${everyId.length} investigations across ${rounds.length} publicly accessible rounds matched the merged source dossier inventory.`)
