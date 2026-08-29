import type { EditorialQueueAction, ObservedDemandTier } from '@/lib/comparison-demand-tier'
import type { ComparisonShortlistRow } from '@/lib/comparison-shortlist'

export type ComparisonAgentWorkPacket = {
  packetId: string
  proposedSlug: string
  title: string
  recommendedAction: EditorialQueueAction
  demandTier: ObservedDemandTier
  actionReason: string
  nextTask: string
  researchGaps: string[]
  completionCriteria: string[]
  aSlug: string
  bSlug: string
  evidenceTier: number
  evidenceLabel: string
  chemistrySupported: boolean
  sharedSpecificEffects: string[]
  priorityScore: number
  scientificPriorityScore: number
  editorialIntentScore: number
  observedBehaviorScore: number
  observedBehavior: ComparisonShortlistRow['observedBehavior']
}

function stablePair(aSlug: string, bSlug: string) {
  return [aSlug, bSlug].sort((a, b) => a.localeCompare(b))
}

function actionReason(action: EditorialQueueAction, row: ComparisonShortlistRow, demandTier: ObservedDemandTier) {
  if (action === 'build-next') {
    return `High-confidence observed demand is backed by ${row.evidenceLabel} pair evidence, so this comparison is ready for editorial production.`
  }
  if (action === 'research-first') {
    return `${demandTier} observed demand is meaningful, but the pair evidence is only ${row.evidenceLabel}; strengthen the evidence base before drafting a production comparison.`
  }
  if (action === 'validate-and-outline') {
    return `Promising observed demand and ${row.evidenceLabel} evidence justify validating the decision axis and preparing an outline before committing to a full page.`
  }
  if (action === 'keep-observing') {
    return 'The pair has an emerging behavioral signal, but the sample is still too small to justify production work.'
  }
  return 'The pair does not currently have enough observed demand to justify agent work.'
}

function buildResearchGaps(row: ComparisonShortlistRow, demandTier: ObservedDemandTier) {
  const gaps: string[] = []
  if (row.evidenceTier < 2) gaps.push('Raise the pair evidence basis to at least moderate before recommending production.')
  if (!row.chemistrySupported) gaps.push('Verify whether a defensible chemistry or mechanism distinction can help users choose between the botanicals.')
  if (row.sharedSpecificEffects.length === 0) gaps.push('Identify a concrete user-facing decision axis beyond generic botanical similarity.')

  if (demandTier !== 'high-confidence') {
    const impressionsNeeded = Math.max(0, 20 - row.observedBehavior.impressions)
    const clicksNeeded = Math.max(0, 5 - row.observedBehavior.clicks)
    if (impressionsNeeded > 0) gaps.push(`Collect at least ${impressionsNeeded} more related-card impressions before treating demand as high-confidence.`)
    if (clicksNeeded > 0) gaps.push(`Collect at least ${clicksNeeded} more related-card clicks before treating demand as high-confidence.`)
  }
  return gaps
}

function nextTask(action: EditorialQueueAction, row: ComparisonShortlistRow) {
  const pair = `${row.a.name} vs ${row.b.name}`
  if (action === 'build-next') return `Draft the production comparison for ${pair}, centered on the strongest shared user goal and the clearest evidence-backed differences.`
  if (action === 'research-first') return `Research the evidence gaps for ${pair}; do not draft the production page until the evidence gate reaches moderate or stronger.`
  if (action === 'validate-and-outline') return `Validate the primary decision question for ${pair} and create a concise comparison outline with evidence requirements for each section.`
  if (action === 'keep-observing') return `Keep collecting Related Botanicals behavior for ${pair}; reassess when the pair reaches the promising or high-confidence thresholds.`
  return `No active task for ${pair}; leave it in the scientific shortlist until demand changes.`
}

function completionCriteria(action: EditorialQueueAction, row: ComparisonShortlistRow) {
  const common = [
    'Use only claims supportable by the canonical evidence/data system.',
    'Preserve safety caveats and avoid implying unsupported superiority.',
  ]
  if (action === 'build-next') {
    return [
      'Create a comparison page or production-ready content artifact for the proposed slug.',
      'Answer a concrete user decision question rather than merely listing similarities.',
      'Include evidence-backed differences, shared goals, safety context, and useful next-step links.',
      ...common,
    ]
  }
  if (action === 'research-first') {
    return [
      'Document the missing or weak evidence that blocks production.',
      'Resolve enough evidence gaps for the pair evidence tier to reach at least moderate, or explicitly document why it cannot.',
      ...common,
    ]
  }
  if (action === 'validate-and-outline') {
    return [
      'Define the primary comparison question in one sentence.',
      'Produce an outline whose sections each have a clear evidence requirement.',
      'Record any unresolved evidence or chemistry gaps before promoting to build-next.',
      ...common,
    ]
  }
  if (action === 'keep-observing') {
    return [
      `Reassess after at least ${Math.max(20, row.observedBehavior.impressions)} total impressions or a higher demand tier is reached.`,
      'Do not create a production page from the emerging signal alone.',
    ]
  }
  return ['No action required until new behavioral or evidence signals change the recommendation.']
}

export function buildComparisonAgentWorkPacket(
  row: ComparisonShortlistRow,
  demandTier: ObservedDemandTier,
  recommendedAction: EditorialQueueAction,
): ComparisonAgentWorkPacket {
  const [firstSlug, secondSlug] = stablePair(row.a.slug, row.b.slug)
  return {
    packetId: `comparison:${firstSlug}:${secondSlug}`,
    proposedSlug: `${firstSlug}-vs-${secondSlug}`,
    title: `${row.a.name} vs ${row.b.name}`,
    recommendedAction,
    demandTier,
    actionReason: actionReason(recommendedAction, row, demandTier),
    nextTask: nextTask(recommendedAction, row),
    researchGaps: buildResearchGaps(row, demandTier),
    completionCriteria: completionCriteria(recommendedAction, row),
    aSlug: row.a.slug,
    bSlug: row.b.slug,
    evidenceTier: row.evidenceTier,
    evidenceLabel: row.evidenceLabel,
    chemistrySupported: row.chemistrySupported,
    sharedSpecificEffects: row.sharedSpecificEffects,
    priorityScore: row.priorityScore,
    scientificPriorityScore: row.scientificPriorityScore,
    editorialIntentScore: row.editorialIntentScore,
    observedBehaviorScore: row.observedBehaviorScore,
    observedBehavior: row.observedBehavior,
  }
}
