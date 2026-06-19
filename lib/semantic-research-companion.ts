import { buildAdaptiveSemanticFeed } from '../src/lib/adaptive-semantic-feed'

export function buildResearchCompanionExperience(source: Record<string, unknown>, candidates: Record<string, unknown>[] = []) {
  return {
    headline: 'Continue exploring intelligently',
    prompts: [
      'Compare adjacent pathways',
      'Explore mechanism overlap',
      'Investigate stack compatibility',
      'Review evidence hierarchy',
    ],
    feed: buildAdaptiveSemanticFeed(source, candidates, 6),
  }
}
