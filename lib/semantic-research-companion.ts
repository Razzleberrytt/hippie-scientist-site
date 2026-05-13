import { buildAdaptiveSemanticFeed } from '@/lib/adaptive-semantic-feed'

export function buildResearchCompanionExperience(source: any, candidates: any[] = []) {
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
