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
  const footer = [...content.matchAll(/^## (?!DE\d+-\d+\s+[—–-]).+$/gm)]
    .find((m) => (m.index ?? -1) > (headings[9].index ?? -1))
  // Whole-round QA is either a dedicated trailing section (DE10–16) or a
  // clear preface before DE17-01. Never attribute it to study DE##-10.
  const firstInvestigationStart = headings[0].index ?? content.length
  const prefaceStart = content.indexOf('### Whole-round research QA')
  const prefaceReceipt = prefaceStart >= 0 && prefaceStart < firstInvestigationStart
    ? content.slice(prefaceStart, firstInvestigationStart).trim()
    : ''
  const trailingReceipt = footer ? content.slice(footer.index).trim() : ''
  assert(
    prefaceReceipt.length > 200 || trailingReceipt.length > 200,
    `Round ${round} must preserve its independent shared editorial QA receipt`,
  )
  for (let i = 0; i < headings.length; i++) {
    const heading = headings[i]
    assert.equal(heading[1], `DE${round}-${String(i + 1).padStart(2, '0')}`)
    const body = content.slice(heading.index + heading[0].length, headings[i + 1]?.index ?? footer?.index ?? content.length)
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
assert(loader.includes('sharedDossierNotes') && loader.includes('sharedNotesStart'), 'Shared QA must remain separate from the tenth investigation')
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
const llms = readFileSync('public/llms.txt', 'utf8')
assert(llms.includes('https://thehippiescientist.net/research/investigations/'), 'AI discovery guide must link to public research archive')
assert(llms.includes('not independently verified clinical conclusions'), 'AI discovery guide must preserve scientific-review caveat')
assert(llms.includes('https://thehippiescientist.net/research/investigations/sources.json'), 'AI discovery guide must point to source-only JSON')
const jsonRoute = readFileSync('app/research/investigations/sources.json/route.ts', 'utf8')
assert(jsonRoute.includes('getDeepEnrichmentRounds'), 'Source manifest must derive from original merged dossiers')
assert(jsonRoute.includes('getDeepEnrichmentSourceOccurrences') && jsonRoute.includes('repeated_pubmed_sources'), 'Source manifest must disclose exact cross-round PMID reuse')
assert(jsonRoute.includes("approved_clinical_claim: false"), 'Source manifest cannot promote clinical claims')
assert(jsonRoute.includes('x-robots-tag'), 'Machine-readable research manifest must declare crawler policy')
assert(readFileSync('app/research/investigations/page.tsx', 'utf8').includes('sources.json'), 'Visible index must link to research JSON')
const detailPage = readFileSync('app/research/investigations/[round]/page.tsx', 'utf8')
assert(detailPage.includes('index: false'), 'Unreviewed clinical source notes remain noindex')
assert(detailPage.includes('item.body'), 'Original source notes must remain accessible')
assert(detailPage.includes('getDeepEnrichmentSourceOccurrences') && detailPage.includes('Also cited in'), 'Public research pages must link repeated PMIDs to their other investigations')
assert(detailPage.includes('Same PubMed paper reused, not another independent study.'), 'Repeated PubMed citations must not be misrepresented as independent studies')
assert(detailPage.includes('Linked PubMed research sources') && detailPage.includes('not additional independent clinical trials'), 'Do not mislabel research syntheses as original independent trials')
assert(detailPage.includes('doc.sharedDossierNotes') && detailPage.includes("id='round-governance'"), 'Full round QA notes must be publicly accessible')
const indexPage = readFileSync('app/research/investigations/page.tsx', 'utf8')
assert(indexPage.includes('getDeepEnrichmentRounds'), 'Index must use original dossiers')
assert(indexPage.includes('Research Investigations | PubMed Research Source Trails'), 'Metadata title cannot mislabel secondary reviews as independent primary studies')
assert(indexPage.includes('linked PubMed trials, reviews'), 'Metadata description must distinguish trials and syntheses')
assert(!indexPage.includes('Primary-Study Source Trails'), 'Remove misleading primary-only research-archive title')
assert(!/All 60 investigation|these six documents|Browse 60/.test(indexPage), 'Avoid hard-coded counts that age poorly')
console.log(`SUCCESS: ${rounds.length} rounds, ${count} investigations and ${sourceIDs.size} unique linked PMIDs represented in dynamic public inventory.`)
