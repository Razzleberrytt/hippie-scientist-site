import { mkdir, readFile, writeFile } from 'node:fs/promises'
import path from 'node:path'
import { buildRelatedBotanicalPerformance, type AtlasAnalyticsEvent } from '../src/lib/atlasAnalyticsReport'
import { getBotanicalAtlasRecords } from '../src/lib/botanical-atlas-data'
import { buildComparisonAgentWorkPacket } from '../src/lib/comparison-agent-work-queue'
import { classifyObservedDemand, observedDemandRank, recommendEditorialAction } from '../src/lib/comparison-demand-tier'
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
const observedDemandQueue = rows
  .map((row) => {
    const demandTier = classifyObservedDemand({
      impressions: row.observedBehavior.impressions,
      clicks: row.observedBehavior.clicks,
      ctr: row.observedBehavior.ctr,
      observedBehaviorScore: row.observedBehaviorScore,
    })
    return {
      row,
      demandTier,
      recommendedAction: recommendEditorialAction(demandTier, row.evidenceTier),
    }
  })
  .filter(({ demandTier }) => demandTier !== 'insufficient')
  .sort((a, b) => observedDemandRank(b.demandTier) - observedDemandRank(a.demandTier)
    || b.row.observedBehaviorScore - a.row.observedBehaviorScore
    || b.row.priorityScore - a.row.priorityScore)

const agentWorkPackets = observedDemandQueue
  .map(({ row, demandTier, recommendedAction }) => buildComparisonAgentWorkPacket(row, demandTier, recommendedAction))
  .filter((packet) => packet.recommendedAction !== 'no-action')

const markdown = [
  '# Curated Botanical Comparison Shortlist',
  '',
  `Generated: ${new Date().toISOString()}`,
  '',
  analyticsEventsPath
    ? `Observed behavior source: \`${analyticsEventsPath}\` (${behaviorRows.length} pair-position rows)`
    : 'Observed behavior source: none supplied. Set `ANALYTICS_EVENTS_PATH` to a JSON analytics export to add pair-level demand and research-depth signals.',
  '',
  'Ranks unbuilt botanical comparison opportunities using scientific priority, deterministic editorial-intent proxies, and optional observed Related Botanicals behavior. Observed behavior is confidence-weighted so tiny samples cannot dominate the queue. Demand tiers are then gated by evidence quality before a recommended editorial action is assigned. This remains a human-reviewed shortlist, not an auto-publishing queue.',
  '',
  '## Observed-demand editorial queue',
  '',
  analyticsEventsPath
    ? 'Candidates below have enough real Related Botanicals behavior to earn an observed-demand tier. High-confidence requires at least 20 impressions, 5 clicks, 20% CTR, and a behavior score of 4.5. A high-demand pair only receives `build-next` when its pair evidence tier is at least moderate; otherwise it is routed to `research-first`.'
    : 'No analytics export supplied, so no observed-demand editorial queue can be generated yet.',
  '',
  ...(observedDemandQueue.length
    ? [
        '| Action | Tier | Pair | Evidence | Behavior | Clicks / impressions | CTR | Depth 3+ | Combined priority |',
        '| --- | --- | --- | --- | ---: | ---: | ---: | ---: | ---: |',
        ...observedDemandQueue.map(({ row, demandTier, recommendedAction }) => `| **${recommendedAction}** | ${demandTier} | ${row.a.name} vs ${row.b.name} | ${row.evidenceLabel} | ${row.observedBehaviorScore.toFixed(2)} | ${row.observedBehavior.clicks} / ${row.observedBehavior.impressions} | ${Math.round(row.observedBehavior.ctr * 100)}% | ${Math.round(row.observedBehavior.deepExplorationRate * 100)}% | ${row.priorityScore.toFixed(2)} |`),
      ]
    : ['No candidates currently clear the observed-demand sample thresholds.']),
  '',
  '## Agent execution queue',
  '',
  agentWorkPackets.length
    ? 'Each packet below is also emitted to `comparison-agent-work-queue.json` with explicit research gaps and completion criteria. Agents should execute the recommended task, not infer a more aggressive action from demand alone.'
    : 'No active agent packets are available yet.',
  '',
  ...agentWorkPackets.slice(0, 15).flatMap((packet, index) => [
    `### ${index + 1}. ${packet.title}`,
    '',
    `- Action: **${packet.recommendedAction}**`,
    `- Proposed slug: \`${packet.proposedSlug}\``,
    `- Why: ${packet.actionReason}`,
    `- Next task: ${packet.nextTask}`,
    `- Research gaps: ${packet.researchGaps.length ? packet.researchGaps.join(' | ') : 'none identified'}`,
    `- Done when: ${packet.completionCriteria.join(' | ')}`,
    '',
  ]),
  '## Full scientific + editorial shortlist',
  '',
  '| Rank | Pair | Combined | Scientific | Intent proxy | Observed behavior | Relationship | Chemistry | Evidence | Shared specific effects |',
  '| ---: | --- | ---: | ---: | ---: | ---: | ---: | :---: | --- | --- |',
  ...rows.map((row, index) => `| ${index + 1} | **${row.a.name} vs ${row.b.name}** | ${row.priorityScore.toFixed(2)} | ${row.scientificPriorityScore.toFixed(2)} | ${row.editorialIntentScore.toFixed(2)} | ${row.observedBehaviorScore.toFixed(2)} | ${row.relationshipScore.toFixed(2)} | ${row.chemistrySupported ? 'yes' : 'no'} | ${row.evidenceLabel} | ${row.sharedSpecificEffects.slice(0, 4).join(', ') || '—'} |`),
  '',
  '## Why these rank',
  '',
  ...rows.slice(0, 15).flatMap((row, index) => {
    const demandTier = classifyObservedDemand({ impressions: row.observedBehavior.impressions, clicks: row.observedBehavior.clicks, ctr: row.observedBehavior.ctr, observedBehaviorScore: row.observedBehaviorScore })
    return [
      `### ${index + 1}. ${row.a.name} vs ${row.b.name}`,
      '',
      `- Combined priority: ${row.priorityScore.toFixed(2)}`,
      `- Scientific priority: ${row.scientificPriorityScore.toFixed(2)}`,
      `- Editorial intent proxy: ${row.editorialIntentScore.toFixed(2)}`,
      `- Observed behavior: ${row.observedBehaviorScore.toFixed(2)} (${row.observedBehavior.clicks}/${row.observedBehavior.impressions} clicks; ${Math.round(row.observedBehavior.ctr * 100)}% CTR; ${Math.round(row.observedBehavior.deepExplorationRate * 100)}% depth 3+)`,
      `- Observed-demand tier: ${demandTier}`,
      `- Recommended action: ${recommendEditorialAction(demandTier, row.evidenceTier)}`,
      `- Relationship score: ${row.relationshipScore.toFixed(2)}`,
      `- Chemistry-supported: ${row.chemistrySupported ? 'yes' : 'no'}`,
      `- Pair evidence tier: ${row.evidenceLabel}`,
      ...row.intentSignals.map((signal) => `- Intent signal (${signal.score >= 0 ? '+' : ''}${signal.score}): ${signal.label}`),
      ...row.behaviorSignals.map((signal) => `- Behavior signal (+${signal.score}): ${signal.label}`),
      ...row.reasons.slice(0, 4).map((reason) => `- ${reason.label}: ${reason.values.join(', ')}`),
      '',
    ]
  }),
].join('\n')

const editorialQueue = observedDemandQueue.map(({ row, demandTier, recommendedAction }) => ({
  recommendedAction,
  demandTier,
  pair: `${row.a.name} vs ${row.b.name}`,
  aSlug: row.a.slug,
  bSlug: row.b.slug,
  evidenceTier: row.evidenceTier,
  evidenceLabel: row.evidenceLabel,
  priorityScore: row.priorityScore,
  observedBehaviorScore: row.observedBehaviorScore,
  ...row.observedBehavior,
}))

await mkdir(outputDir, { recursive: true })
await Promise.all([
  writeFile(path.join(outputDir, 'comparison-shortlist.json'), JSON.stringify({ generatedAt: new Date().toISOString(), analyticsEventsPath: analyticsEventsPath ?? null, editorialQueue, agentWorkPackets, rows }, null, 2) + '\n'),
  writeFile(path.join(outputDir, 'comparison-shortlist.md'), markdown + '\n'),
  writeFile(path.join(outputDir, 'observed-demand-editorial-queue.json'), JSON.stringify({ generatedAt: new Date().toISOString(), analyticsEventsPath: analyticsEventsPath ?? null, candidates: editorialQueue }, null, 2) + '\n'),
  writeFile(path.join(outputDir, 'comparison-agent-work-queue.json'), JSON.stringify({ generatedAt: new Date().toISOString(), analyticsEventsPath: analyticsEventsPath ?? null, packets: agentWorkPackets }, null, 2) + '\n'),
])

console.log(JSON.stringify({
  candidates: rows.length,
  behaviorRows: behaviorRows.length,
  observedDemandCandidates: editorialQueue.length,
  agentWorkPackets: agentWorkPackets.length,
  buildNextCandidates: editorialQueue.filter((candidate) => candidate.recommendedAction === 'build-next').length,
  researchFirstCandidates: editorialQueue.filter((candidate) => candidate.recommendedAction === 'research-first').length,
  top: rows.slice(0, 5).map((row) => ({
    pair: `${row.a.name} vs ${row.b.name}`,
    combined: row.priorityScore,
    scientific: row.scientificPriorityScore,
    intentProxy: row.editorialIntentScore,
    observedBehavior: row.observedBehaviorScore,
  })),
}, null, 2))
