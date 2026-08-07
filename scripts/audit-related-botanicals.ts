import { mkdir, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { getBotanicalAtlasRecords } from '../src/lib/botanical-atlas-data'
import { getRelatedBotanicals } from '../src/lib/related-botanicals'

const outputDir = path.resolve(process.cwd(), 'reports/related-botanicals')
const topN = Math.max(1, Number(process.env.RELATED_BOTANICALS_TOP_N ?? 5) || 5)

const records = await getBotanicalAtlasRecords()
const rows = records.map((source) => ({
  source: { slug: source.slug, name: source.name, scientificName: source.scientificName },
  matches: getRelatedBotanicals(source, records, topN).map((match) => ({
    slug: match.record.slug,
    name: match.record.name,
    scientificName: match.record.scientificName,
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
const allPairs = rows.flatMap((row) => row.matches.map((match) => ({ source: row.source, match })))
const chemistrySupported = allPairs.filter(({ match }) => match.reasons.some((reason) =>
  reason.type === 'compound-class' || reason.type === 'compound',
))
const effectOnly = allPairs.filter(({ match }) => {
  const substantiveTypes = new Set(match.reasons
    .filter((reason) => ['explicit-effect', 'compound-class', 'compound'].includes(reason.type))
    .map((reason) => reason.type))
  return substantiveTypes.size === 1 && substantiveTypes.has('explicit-effect')
})
const strongestPairs = [...allPairs]
  .sort((a, b) => b.match.score - a.match.score
    || a.source.name.localeCompare(b.source.name)
    || a.match.name.localeCompare(b.match.name))
  .slice(0, 20)
const averageTopScore = rows.length
  ? rows.reduce((sum, row) => sum + (row.matches[0]?.score ?? 0), 0) / rows.length
  : 0

const summary = {
  generatedAt: new Date().toISOString(),
  botanicals: records.length,
  topN,
  botanicalsWithoutMatches: noMatches.length,
  lowConfidenceMatches: lowConfidence.length,
  safetyDominatedMatches: safetyDominated.length,
  chemistrySupportedMatches: chemistrySupported.length,
  effectOnlyMatches: effectOnly.length,
  averageTopScore: Number(averageTopScore.toFixed(2)),
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
  `- Chemistry-supported matches: ${summary.chemistrySupportedMatches}`,
  `- Effect-only matches: ${summary.effectOnlyMatches}`,
  `- Average top recommendation score: ${summary.averageTopScore}`,
  '',
  '## Strongest pairings',
  '',
  ...strongestPairs.map(({ source, match }, index) =>
    `${index + 1}. **${source.name} → ${match.name}** — score ${match.score}; ${match.reasons.slice(0, 3).map((reason) => `${reason.label}: ${reason.values.join(', ')}`).join(' · ')}`,
  ),
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
  writeFile(path.join(outputDir, 'related-botanicals-audit.json'), JSON.stringify({ summary, strongestPairs, rows }, null, 2) + '\n'),
  writeFile(path.join(outputDir, 'related-botanicals-audit.md'), markdown + '\n'),
])

console.log(JSON.stringify(summary, null, 2))
