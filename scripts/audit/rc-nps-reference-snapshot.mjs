import fs from 'node:fs'
import matter from 'gray-matter'

// An external MED metadata snapshot checks reference identity only, not claims.
const snapshotPath = process.argv[2]
if (!snapshotPath) throw new Error('Usage: node scripts/audit/rc-nps-reference-snapshot.mjs <Europe PMC core JSON snapshot> [report.json]')
const snapshot = JSON.parse(fs.readFileSync(snapshotPath, 'utf8').replace(/^\uFEFF/, ''))
const sources = new Map(snapshot.map(source => [String(source.id), source]))
const normalize = text => String(text || '').replace(/<[^>]+>/g, '').normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim()
const words = text => new Set(normalize(text).split(' ').filter(word => word.length > 2))
const rows = []
for (const name of fs.readdirSync('content/articles').filter(name => /\.mdx?$/.test(name))) {
  const file = `content/articles/${name}`
  const { data } = matter(fs.readFileSync(file, 'utf8'))
  if (!['Substance Use & Harm Reduction', 'Novel Psychoactive Substances'].includes(data.category)) continue
  for (const ref of data.references || []) {
    if (!ref.pmid) continue
    const source = sources.get(String(ref.pmid))
    const expected = words(ref.title)
    const actual = words(source?.title)
    const overlap = [...expected].filter(word => actual.has(word)).length / Math.max(1, Math.min(expected.size, actual.size))
    rows.push({ file, pmid: String(ref.pmid), recordedTitle: ref.title,
      retrievedTitle: source?.title?.replace(/<[^>]+>/g, '') || null,
      retrievedAuthors: source?.authorString || null,
      recordedDoi: ref.doi || null, retrievedDoi: source?.doi || null,
      retrievedYear: source?.pubYear || null,
      sourceUrl: `https://europepmc.org/article/MED/${ref.pmid}`,
      findings: [
        ...(!source ? ['PMID absent from supplied snapshot'] : []),
        ...(source && overlap < 0.55 ? ['Title requires manual identity review'] : []),
        ...(ref.doi && source?.doi && ref.doi.toLowerCase() !== source.doi.toLowerCase() ? ['DOI mismatch'] : []),
      ],
    })
  }
}
const report = {
  semantics: 'MED metadata identity reconciliation only; does not verify claim support, evidence grade, legal status, source eligibility, or full-text corrections.',
  snapshotSource: 'Europe PMC REST search, SRC:MED, resultType=core',
  referenceOccurrences: rows.length,
  uniquePmids: new Set(rows.map(row => row.pmid)).size,
  findingCount: rows.reduce((sum, row) => sum + row.findings.length, 0),
  references: rows,
}
if (process.argv[3]) fs.writeFileSync(process.argv[3], JSON.stringify(report, null, 2) + '\n')
console.log(JSON.stringify({ referenceOccurrences: report.referenceOccurrences, uniquePmids: report.uniquePmids, findingCount: report.findingCount }))
if (report.findingCount) process.exitCode = 1
