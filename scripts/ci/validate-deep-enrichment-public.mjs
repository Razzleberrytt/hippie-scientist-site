import assert from 'node:assert/strict'
import { readFileSync, existsSync } from 'node:fs'

const roundFiles = [
  'docs/research/deep-enrichment-10-2026-10-11.md',
  'docs/research/deep-enrichment-11-2026-10-11.md',
  'docs/research/deep-enrichment-12-2026-10-12.md',
  'docs/research/deep-enrichment-13-2026-10-12.md',
  'docs/research/deep-enrichment-14-2026-10-12.md',
  'docs/research/deep-enrichment-15-2026-10-12.md',
]

const read = (path) => readFileSync(path, 'utf8')
const sourceIDs = new Set()
let count = 0

for (const [index, file] of roundFiles.entries()) {
  assert(existsSync(file), `Missing public research source: ${file}`)
  const content = read(file)
  const round = index + 10
  const headings = [...content.matchAll(/^## (DE\d+-\d+)\s+[—–-]\s+(.+)$/gm)]
  assert.equal(headings.length, 10, `Expected 10 studies in Round ${round}`)

  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    assert.equal(heading[1], `DE${round}-${String(i + 1).padStart(2, '0')}`)
    const body = content.slice(heading.index + heading[0].length, headings[i + 1]?.index ?? content.length)
    const pmids = [...body.matchAll(/pubmed\.ncbi\.nlm\.nih\.gov\/(\d{7,9})\/?/g)].map((match) => match[1])
    assert(pmids.length > 0, `Research ${heading[1]} missing PubMed provenance`)
    pmids.forEach((pmid) => sourceIDs.add(pmid))
    count++
  }
}

assert.equal(count, 60, 'Do not silently hide a Deep Enrichment investigation')
assert(existsSync('app/research/investigations/page.tsx'))
assert(existsSync('app/research/investigations/[round]/page.tsx'))
const links = [
  'lib/primary-navigation.ts',
  'app/library/page.tsx',
  'app/research/page.tsx',
  'app/research/source-register/page.tsx',
]
for (const file of links) {
  assert(read(file).includes('/research/investigations'), `Missing route link: ${file}`)
}
const details = read('app/research/investigations/[round]/page.tsx')
assert(details.includes('index: false'), 'Raw, unreviewed notes must remain noindex')
assert(details.includes('item.body'), 'Original investigation text must remain accessible')
assert(read('app/research/investigations/page.tsx').includes('getDeepEnrichmentRounds'), 'Index must use actual merged documents')

console.log(`SUCCESS: 6 public research rounds, ${count} complete investigations, ${sourceIDs.size} unique linked PMIDs; full notes available, independent review gate intact.`)
