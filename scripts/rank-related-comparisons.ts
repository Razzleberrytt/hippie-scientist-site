import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildRelatedBotanicalPerformance, type AtlasAnalyticsEvent } from '../src/lib/atlasAnalyticsReport'
import { getBotanicalAtlasRecords } from '../src/lib/botanical-atlas-data'
import { buildComparisonShortlist } from '../src/lib/comparison-shortlist'

const outputDir = path.resolve(process.cwd(), 'reports/related-botanicals')
const limit = Math.max(1, Number(process.env.COMPARISON_SHORTLIST_LIMIT ?? 30) || 30)
const analyticsEventsPath = process.env.ANALYTICS_EVENTS_PATH

async function loadBehaviorRows() {
  if (!analyticsEventsPath) return []
  const absolutePath = path.resolve(process.cwd(), analyticsEventsPath)
  const payload = JSON.parse(await readFile(absolutePath, 'utf8')) as AtlasAnalyticsEvent[] | { events?: AtlasAnalyticsEvent[] }
  const events = Array.isArray(payload) ? payload : payload.events ?? []
  return buildRelatedBotanicalPerformance(events).cardRows
}

const [records, behaviorRows] = await Promise.all([
  getBotanicalAtlasRecords(),
  loadBehaviorRows(),
])
const rows = buildComparisonShortlist(records, limit, behaviorRows)

const markdown = [
  '# Curated Botanical Comparison Shortlist',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  analyticsEventsPath
    ? `Observed behavior source: \`${analyticsEventsPath}\` (${behaviorRows.length} pair-position rows)`
    : 'Observed behavior source: none supplied. Set `ANALYTICS_EVENTS_PATH` to a JSON analytics export to add pair-level demand and research-depth signals.',
  '',
  'Ranks unbuilt botanical comparison opportunities using scientific priority, deterministic editorial-intent proxies, and optional observed Related Botanicals behavior. Observed behavior is confidence-weighted so tiny samples cannot dominate the queue. This remains a human-reviewed shortlist, not an auto-publishing queue.',
  '',
  '| Rank | Pair | Combined | Scientific | Intent proxy | Observed behavior | Relationship | Chemistry | Evidence | Shared specific effects |',
  '| ---: | --- | ---: | ---: | ---: | ---: | ---: | :---: | --- | --- |',
  ...rows.map((row, index) => `| ${index + 1} | **${row.a.name} vs ${row.b.name}** | ${row.priorityScore.toFixed(2)} | ${row.scientificPriorityScore.toFixed(2)} | ${row.editorialIntentScore.toFixed(2)} | ${row.observedBehaviorScore.toFixed(2)} | ${row.relationshipScore.toFixed(2)} | ${row.chemistrySupported ? 'yes' : 'no'} | ${row.evidenceLabel} | ${row.sharedSpecificEffects.slice(0, 4).join(', ') || '—'} |`),
  '',
  '## Why these rank',
  '',
  ...rows.slice(0, 15).flatMap((row, index) => [
    `### ${index + 1}. ${row.a.name} vs ${row.b.name}`,
    '',
    `- Combined priority: ${row.priorityScore.toFixed(2)}`,
    `- Scientific priority: ${row.scientificPriorityScore.toFixed(2)}`,
    `- Editorial intent proxy: ${row.editorialIntentScore.toFixed(2)}`,
    `- Observed behavior: ${row.observedBehaviorScore.toFixed(2)} (${row.observedBehavior.clicks}/${row.observedBehavior.impressions} clicks; ${Math.round(row.observedBehavior.ctr * 100)}% CTR; ${Math.round(row.observedBehavior.deepExplorationRate * 100)}% depth 3+)`,
    `- Relationship score: ${row.relationshipScore.toFixed(2)}`,
    `- Chemistry-supported: ${row.chemistrySupported ? 'yes' : 'no'}`,
    `- Pair evidence tier: ${row.evidenceLabel}`,
    ...row.intentSignals.map((signal) => `- Intent signal (${signal.score >= 0 ? '+' : ''}${signal.score}): ${signal.label}`),
    ...row.behaviorSignals.map((signal) => `- Behavior signal (+${signal.score}): ${signal.label}`),
    ...row.reasons.slice(0, 4).map((reason) => `- ${reason.label}: ${reason.values.join(', ')}`),
    '',
  ]),
].join('\n')

await mkdir(outputDir, { recursive: true })
await Promise.all([
  writeFile(path.join(outputDir, 'comparison-shortlist.json'), JSON.stringify({ generatedAt: new Date().toISOString(), analyticsEventsPath: analyticsEventsPath ?? null, rows }, null, 2) + '\n'),
  writeFile(path.join(outputDir, 'comparison-shortlist.md'), markdown + '\n'),
])

console.log(JSON.stringify({
  candidates: rows.length,
  behaviorRows: behaviorRows.length,
  top: rows.slice(0, 5).map((row) => ({
    pair: `${row.a.name} vs ${row.b.name}`,
    combined: row.priorityScore,
    scientific: row.scientificPriorityScore,
    intentProxy: row.editorialIntentScore,
    observedBehavior: row.observedBehaviorScore,
  })),
}, null, 2))
