import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getBotanicalAtlasRecords } from '../src/lib/botanical-atlas-data'
import { buildComparisonShortlist } from '../src/lib/comparison-shortlist'

const outputDir = path.resolve(process.cwd(), 'reports/related-botanicals')
const limit = Math.max(1, Number(process.env.COMPARISON_SHORTLIST_LIMIT ?? 30) || 30)
const records = await getBotanicalAtlasRecords()
const rows = buildComparisonShortlist(records, limit)

const markdown = [
  '# Curated Botanical Comparison Shortlist',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  'Ranks unbuilt botanical comparison opportunities. Relationship strength stays primary; chemistry support, evidence strength, and multiple specific shared effects add priority. This is an editorial shortlist, not an auto-publishing queue.',
  '',
  '| Rank | Pair | Priority | Relationship | Chemistry | Evidence | Shared specific effects |',
  '| ---: | --- | ---: | ---: | :---: | --- | --- |',
  ...rows.map((row, index) => `| ${index + 1} | **${row.a.name} vs ${row.b.name}** | ${row.priorityScore.toFixed(2)} | ${row.relationshipScore.toFixed(2)} | ${row.chemistrySupported ? 'yes' : 'no'} | ${row.evidenceLabel} | ${row.sharedSpecificEffects.slice(0, 4).join(', ') || '—'} |`),
  '',
  '## Why these rank',
  '',
  ...rows.slice(0, 15).flatMap((row, index) => [
    `### ${index + 1}. ${row.a.name} vs ${row.b.name}`,
    '',
    `- Priority score: ${row.priorityScore.toFixed(2)}`,
    `- Relationship score: ${row.relationshipScore.toFixed(2)}`,
    `- Chemistry-supported: ${row.chemistrySupported ? 'yes' : 'no'}`,
    `- Pair evidence tier: ${row.evidenceLabel}`,
    ...row.reasons.slice(0, 4).map((reason) => `- ${reason.label}: ${reason.values.join(', ')}`),
    '',
  ]),
].join('\n')

await mkdir(outputDir, { recursive: true })
await Promise.all([
  writeFile(path.join(outputDir, 'comparison-shortlist.json'), JSON.stringify({ generatedAt: new Date().toISOString(), rows }, null, 2) + '\n'),
  writeFile(path.join(outputDir, 'comparison-shortlist.md'), markdown + '\n'),
])

console.log(JSON.stringify({ candidates: rows.length, top: rows.slice(0, 5).map((row) => `${row.a.name} vs ${row.b.name}`) }, null, 2))
