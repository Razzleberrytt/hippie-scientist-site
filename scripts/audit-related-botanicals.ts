import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getBotanicalAtlasRecords } from '../src/lib/botanical-atlas-data'
import { getRelatedBotanicals } from '../src/lib/related-botanicals'

const outputDir = path.resolve(process.cwd(), 'reports/related-botanicals')
const topN = Math.max(1, Number(process.env.RELATED_BOTANICALS_TOP_N ?? 5) || 5)

const records = await getBotanicalAtlasRecords()
const rows = records.map((source) => ({
  source: { slug: source.slug, name: source.name },
  matches: getRelatedBotanicals(source, records, topN).map((match) => ({
    slug: match.record.slug,
    name: match.record.name,
    score: match.score,
    reasons: match.reasons.map((reason) => ({
      type: reason.type,
      label: reason.label,
      values: reason.values,
      score: Number(reason.score.toFixed(4)),
    })),
  })),
}))

const noMatches = rows.filter((row) => row.matches.length === 0)
const lowConfidence = rows.flatMap((row) => row.matches
  .filter((match) => match.score < 4)
  .map((match) => ({ source: row.source, match })))
const safetyDominated = rows.flatMap((row) => row.matches
  .filter((match) => match.reasons[0]?.type === 'safety')
  .map((match) => ({ source: row.source, match })))

const summary = {
  generatedAt: new Date().toISOString(),
  botanicals: records.length,
  topN,
  botanicalsWithoutMatches: noMatches.length,
  lowConfidenceMatches: lowConfidence.length,
  safetyDominatedMatches: safetyDominated.length,
}

const markdown = [
  '# Related Botanicals Quality Audit',
  '',
  `Generated: ${summary.generatedAt}`,
  '',
  '## Summary',
  '',
  `- Botanicals evaluated: ${summary.botanicals}`,
  `- Recommendations per botanical: up to ${summary.topN}`,
  `- Botanicals without qualifying matches: ${summary.botanicalsWithoutMatches}`,
  `- Low-confidence matches (score < 4): ${summary.lowConfidenceMatches}`,
  `- Safety-dominated top reasons: ${summary.safetyDominatedMatches}`,
  '',
  '## Recommendations',
  '',
  ...rows.flatMap((row) => [
    `### ${row.source.name} (${row.source.slug})`,
    '',
    ...(row.matches.length
      ? row.matches.flatMap((match, index) => [
          `${index + 1}. **${match.name}** — score ${match.score}`,
          ...match.reasons.map((reason) => `   - ${reason.label}: ${reason.values.join(', ')} (+${reason.score})`),
        ])
      : ['_No qualifying related botanicals._']),
    '',
  ]),
].join('\n')

await mkdir(outputDir, { recursive: true })
await Promise.all([
  writeFile(path.join(outputDir, 'related-botanicals-audit.json'), JSON.stringify({ summary, rows }, null, 2) + '\n'),
  writeFile(path.join(outputDir, 'related-botanicals-audit.md'), markdown + '\n'),
])

console.log(JSON.stringify(summary, null, 2))
