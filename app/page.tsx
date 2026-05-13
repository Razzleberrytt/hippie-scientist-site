import HomepageV2 from '@/components/homepage-v2'
import SemanticOperatingSystem from '@/components/semantic-operating-system'
import { getCompoundSummaryIndex, getHerbSummaryIndex } from '@/lib/runtime-summary-indexes'
import { getRuntimeVisibility } from '@/lib/runtime-visibility'

export default async function Page() {
  const [herbs, compounds] = await Promise.all([
    getHerbSummaryIndex(),
    getCompoundSummaryIndex(),
  ])

  const featuredHerbs = herbs
    .filter((item: any) => getRuntimeVisibility(item).canFeature)
    .slice(0, 3)

  const featuredCompounds = compounds
    .filter((item: any) => getRuntimeVisibility(item).canFeature)
    .slice(0, 3)

  const semanticCandidates = [
    ...featuredHerbs.map((item: any) => ({ ...item, entityType: 'herb' })),
    ...featuredCompounds.map((item: any) => ({ ...item, entityType: 'compound' })),
  ]

  const semanticSource = {
    slug: 'homepage-semantic-os',
    name: 'The Hippie Scientist Semantic OS',
    displayName: 'The Hippie Scientist Semantic OS',
    summary: 'A guided research layer for moving through herbs, compounds, pathways, comparisons, stacks, and evidence-aware ecosystems.',
    effects: ['semantic discovery', 'evidence navigation', 'pathway exploration'],
    mechanisms: ['adaptive traversal', 'ecosystem continuity', 'comparison guidance'],
    pathways: ['sleep', 'stress', 'focus', 'energy', 'inflammation', 'mitochondrial support'],
  }

  return (
    <>
      <HomepageV2
        featuredHerbs={featuredHerbs}
        featuredCompounds={featuredCompounds}
      />

      <section className="mx-auto max-w-7xl px-4 py-10 sm:py-14">
        <SemanticOperatingSystem
          source={semanticSource}
          candidates={semanticCandidates}
          title="Continue through the research graph."
          description="Use the semantic operating layer to resume exploration, compare adjacent profiles, follow ecosystem bridges, and move through evidence-aware pathways."
        />
      </section>
    </>
  )
}
