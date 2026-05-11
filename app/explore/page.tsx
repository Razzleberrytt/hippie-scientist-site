import Link from 'next/link'
import compounds from '../../public/data/compounds.json'
import {
  classifyArchetype,
  getTopicClusters,
} from '@/lib/semantic-runtime'
import { cleanSummary, isClean } from '@/lib/display-utils'
import { EcosystemPanelGrid, KnowledgeGraphLinks, SemanticHubIntro } from '@/components/semantic-hubs/semantic-hub-sections'
import { getEcosystemPanels, getTopicClusterLinks, topicClusters } from '@/lib/ecosystem-context'
import { GuidedSemanticFlowSection } from '@/src/components/explore/GuidedSemanticFlowSection'
import { EcosystemContinuityVisualizationSection } from '@/src/components/explore/EcosystemContinuityVisualizationSection'
import { SemanticBridgeSection } from '@/src/components/explore/SemanticBridgeSection'
import { ContinuityMapSection } from '@/src/components/explore/ContinuityMapSection'
import {
  SemanticSectionBoundary,
  SemanticSectionFallback,
} from '@/src/components/runtime/SemanticSectionBoundary'
import { buildAdaptiveEcosystemPriorities } from '@/src/lib/adaptive-ecosystem-prioritization'
import { buildSemanticMomentum } from '@/src/lib/semantic-momentum-engine'
import { buildSemanticEcosystemBridges } from '@/src/lib/semantic-ecosystem-bridges'

const hubIntro = [
  {
    title: 'Biological context',
    body: 'The explore layer groups records by outcomes and plausible biological systems so readers can move from broad intent to profile-level evidence without treating mechanism labels as proof.',
  },
  {
    title: 'Research focus',
    body: 'Clusters emphasize evidence maturity, recurring pathway language, and common research contexts such as inhibitory tone, cognition, inflammatory signaling, and metabolic support.',
  },
  {
    title: 'Discovery method',
    body: 'This hub is designed as a crawlable map: outcome pages, pathway hubs, collections, and individual profiles reinforce one another through shared semantic signals.',
  },
]

const graphLinks = [
  { label: 'GABA pathway', href: '/pathways/gaba', description: 'Calming, inhibitory tone, relaxation, and sleep-adjacent neurotransmitter context.' },
  { label: 'Dopamine pathway', href: '/pathways/dopamine', description: 'Motivation, attention, reward, and cognition-oriented pathway relationships.' },
  { label: 'Inflammation pathway', href: '/pathways/inflammation', description: 'Immune tone, oxidative stress, cytokine, recovery, and joint-support relationships.' },
  { label: 'Best studied sleep compounds', href: '/collections/best-studied-sleep-compounds', description: 'Collection view for sleep-related compounds with stronger evidence and semantic signals.' },
  { label: 'Adaptogens for stress', href: '/collections/adaptogens-for-stress', description: 'Botanical stress-support cluster organized around adaptation, resilience, and calm.' },
  { label: 'Cholinergic compounds', href: '/collections/cholinergic-compounds', description: 'Cognition-adjacent compounds commonly explored with acetylcholine and attention context.' },
]

const TOPICS = [
  {
    slug: 'sleep',
    title: 'Sleep Support',
    description: 'Compounds commonly explored for sleep quality, latency, recovery, and nighttime relaxation.',
    meta: 'Sleep pathways',
  },
  {
    slug: 'focus',
    title: 'Focus & Cognition',
    description: 'Nootropic and cognition-oriented compounds for attention, productivity, and mental performance.',
    meta: 'Neurotransmitters',
  },
  {
    slug: 'anxiety',
    title: 'Stress & Mood',
    description: 'Calming, stress-supportive, and mood-oriented compounds.',
    meta: 'Stress signaling',
  },
  {
    slug: 'recovery',
    title: 'Recovery & Performance',
    description: 'Exercise, recovery, hydration, and performance-supportive compounds.',
    meta: 'Recovery support',
  },
]

export default function ExplorePage() {
  const featured = (compounds as any[])
    .filter((compound) => compound.slug && compound.name)
    .slice(0, 12)
    .map((compound) => ({
      ...compound,
      archetype: classifyArchetype(compound),
      clusters: getTopicClusters(compound).filter(isClean),
    }))

  const adaptivePriorities = buildAdaptiveEcosystemPriorities(featured, topicClusters)
  const semanticMomentum = buildSemanticMomentum(featured, topicClusters)
  const semanticBridges = buildSemanticEcosystemBridges(featured, topicClusters)

  const prioritizedSignals = semanticMomentum
    .filter((signal) => signal.momentumTier !== 'weak')
    .map((signal) => signal.ecosystem.toLowerCase())

  const prioritizedGraphLinks = [...graphLinks, ...getTopicClusterLinks(10)]
    .sort((a, b) => {
      const aMomentum = semanticMomentum.find((signal) => signal.ecosystem.toLowerCase() === a.label.toLowerCase())
      const bMomentum = semanticMomentum.find((signal) => signal.ecosystem.toLowerCase() === b.label.toLowerCase())

      const aAdaptive = adaptivePriorities.find((priority) => priority.ecosystem.toLowerCase() === a.label.toLowerCase())
      const bAdaptive = adaptivePriorities.find((priority) => priority.ecosystem.toLowerCase() === b.label.toLowerCase())

      const aBridge = semanticBridges.find((bridge) =>
        bridge.source.toLowerCase() === a.label.toLowerCase() ||
        bridge.target.toLowerCase() === a.label.toLowerCase(),
      )

      const bBridge = semanticBridges.find((bridge) =>
        bridge.source.toLowerCase() === b.label.toLowerCase() ||
        bridge.target.toLowerCase() === b.label.toLowerCase(),
      )

      const aScore =
        (aMomentum?.momentumScore || 0) +
        (aAdaptive?.ecosystemScore || 0) +
        (aBridge?.bridgeScore || 0)

      const bScore =
        (bMomentum?.momentumScore || 0) +
        (bAdaptive?.ecosystemScore || 0) +
        (bBridge?.bridgeScore || 0)

      if (bScore !== aScore) {
        return bScore - aScore
      }

      return a.label.localeCompare(b.label)
    })
    .slice(0, 6)

  const semanticSource = featured[0] || null

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:space-y-16 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-6">
          <div className="space-y-3">
            <p className="eyebrow-label">Semantic Discovery Layer</p>
            <h1 className="heading-premium max-w-[11ch] text-ink">Explore</h1>
          </div>

          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
            Navigate compounds through semantic relationships, archetypes, evidence maturity, mechanisms, and shared research pathways instead of simple alphabetical browsing.
          </p>
        </div>
      </section>

      <SemanticHubIntro sections={hubIntro} />

      <SemanticSectionBoundary
        source={semanticSource}
        candidates={featured}
        fallback={<SemanticSectionFallback />}
      >
        <GuidedSemanticFlowSection />
      </SemanticSectionBoundary>

      <SemanticSectionBoundary source={semanticSource} candidates={featured} minCandidates={3}>
        <SemanticBridgeSection source={semanticSource} candidates={featured} />
      </SemanticSectionBoundary>

      <SemanticSectionBoundary source={semanticSource} candidates={featured} minCandidates={3}>
        <ContinuityMapSection source={semanticSource} candidates={featured} />
      </SemanticSectionBoundary>

      <SemanticSectionBoundary source={semanticSource} candidates={featured} minCandidates={3}>
        <EcosystemContinuityVisualizationSection source={semanticSource} candidates={featured} />
      </SemanticSectionBoundary>

      <EcosystemPanelGrid
        eyebrow="Topic-cluster depth"
        title="Core scientific ecosystems"
        panels={getEcosystemPanels(prioritizedSignals, 10)}
        limit={10}
      />

      <KnowledgeGraphLinks
        eyebrow="Often explored together"
        title="Move through the scientific graph"
        links={prioritizedGraphLinks}
      />
    </main>
  )
}
