import assert from 'node:assert/strict'
import { readFileSync, existsSync, readdirSync } from 'node:fs'

const dir = 'docs/research'
const filePattern = /^deep-enrichment-(\d+)-(\d{4}-\d{2}-\d{2})\.md$/
const candidates = readdirSync(dir).filter((name) => name.startsWith('deep-enrichment-'))
const rounds = candidates.map((name) => {
  const match = name.match(filePattern)
  assert(match, `Unrecognized research dossier name: ${name}`)
  return { round: Number(match[1]), file: `${dir}/${name}` }
}).filter(({ round }) => round >= 10).sort((a, b) => a.round - b.round)

assert(rounds.length >= 6, 'Original six enrichment rounds must remain present')
const sourceIDs = new Set()
let count = 0
for (const [index, { round, file }] of rounds.entries()) {
  if (index) assert.equal(round, rounds[index - 1].round + 1, 'Research rounds cannot disappear or be duplicated')
  assert(existsSync(file), `Missing public research source: ${file}`)
  const content = readFileSync(file, 'utf8')
  const headings = [...content.matchAll(/^## (DE\d+-\d+)\s+[—–-]\s+(.+)$/gm)]
  assert.equal(headings.length, 10, `Expected ten investigations in DE${round}`)
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

assert.equal(count, rounds.length * 10, 'Do not silently hide an investigation')
const loader = readFileSync('lib/research-deep-enrichment-public.ts', 'utf8')
assert(loader.includes('readdirSync('), 'Public research discovery must read source files automatically')
assert(loader.includes('RESEARCH_NAME'), 'Public research discovery must validate dossier filenames')
assert(existsSync('app/research/investigations/page.tsx'))
assert(existsSync('app/research/investigations/[round]/page.tsx'))
const links = [
  'lib/primary-navigation.ts',
  'app/library/page.tsx',
  'app/research/page.tsx',
  'app/research/source-register/page.tsx',
]
for (const file of links) {
  assert(readFileSync(file, 'utf8').includes('/research/investigations'), `Missing navigation link: ${file}`)
}
const detailPage = readFileSync('app/research/investigations/[round]/page.tsx', 'utf8')
assert(detailPage.includes('index: false'), 'Unreviewed clinical source notes remain noindex')
assert(detailPage.includes('item.body'), 'Original source notes must remain accessible')
const indexPage = readFileSync('app/research/investigations/page.tsx', 'utf8')
assert(indexPage.includes('getDeepEnrichmentRounds'), 'Index must use original dossiers')
assert(!/All 60 investigation|these six documents|Browse 60/.test(indexPage), 'Avoid hard-coded counts that age poorly')
console.log(`SUCCESS: ${rounds.length} rounds, ${count} investigations and ${sourceIDs.size} unique linked PMIDs represented in dynamic public inventory.`)
