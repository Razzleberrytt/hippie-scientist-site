import Link from 'next/link'
import { getAllCompounds } from '@/lib/server/runtime-data'
import {
  classifyArchetype,
  getTopicClusters,
} from '@/lib/semantic-runtime'
import { cleanSummary, formatDisplayLabel, isClean } from '@/lib/display-utils'
import {
  EcosystemPanelGrid,
  KnowledgeGraphLinks,
  SemanticHubIntro,
} from '@/components/semantic-hubs/semantic-hub-sections'
import {
  getEcosystemPanels,
  getTopicClusterLinks,
  topicClusters,
} from '@/lib/ecosystem-context'
import { GuidedSemanticFlowSection } from '@/src/components/explore/GuidedSemanticFlowSection'
import { EcosystemContinuityVisualizationSection } from '@/src/components/explore/EcosystemContinuityVisualizationSection'
import { SemanticBridgeSection } from '@/src/components/explore/SemanticBridgeSection'
import { ContinuityMapSection } from '@/src/components/explore/ContinuityMapSection'
import {
  SemanticSectionBoundary,
  SemanticSectionFallback,
} from '@/src/components/runtime/SemanticSectionBoundary'
import { sortGraphLinksBySemanticDiscovery } from '@/src/lib/semantic-discovery-orchestrator'
import { getSemanticDiscoveryCache } from '@/src/lib/semantic-discovery-cache'
import {
  SEMANTIC_EXPANSION_LIMITS,
  cappedExpansion,
} from '@/src/lib/semantic-expansion-budget'
import SemanticArtworkPanel from '@/components/semantic-artwork-panel'
import SemanticGraphMap from '@/components/semantic-graph-map'
import SemanticVisibilityGate from '@/components/semantic-visibility-gate'
import PathwayVisualChip from '@/components/pathway-visual-chip'
import { buildSemanticGraphVisual } from '@/lib/semantic-graph-visuals'

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
  {
    label: 'GABA pathway',
    href: '/pathways/gaba',
    description: 'Calming, inhibitory tone, relaxation, and sleep-adjacent neurotransmitter context.',
  },
  {
    label: 'Dopamine pathway',
    href: '/pathways/dopamine',
    description: 'Motivation, attention, reward, and cognition-oriented pathway relationships.',
  },
  {
    label: 'Inflammation pathway',
    href: '/pathways/inflammation',
    description: 'Immune tone, oxidative stress, cytokine, recovery, and joint-support relationships.',
  },
  {
    label: 'Best studied sleep compounds',
    href: '/collections/best-studied-sleep-compounds',
    description: 'Collection view for sleep-related compounds with stronger evidence and semantic signals.',
  },
  {
    label: 'Adaptogens for stress',
    href: '/collections/adaptogens-for-stress',
    description: 'Botanical stress-support cluster organized around adaptation, resilience, and calm.',
  },
  {
    label: 'Cholinergic compounds',
    href: '/collections/cholinergic-compounds',
    description: 'Cognition-adjacent compounds commonly explored with acetylcholine and attention context.',
  },
]

const TOPICS = [
  {
    slug: 'sleep',
    title: 'Sleep Support',
    description: 'Compounds commonly explored for sleep quality, latency, recovery, and nighttime relaxation.',
    meta: 'Sleep pathways',
    artwork: 'gaba-systems',
  },
  {
    slug: 'focus',
    title: 'Focus & Cognition',
    description: 'Nootropic and cognition-oriented compounds for attention, productivity, and mental performance.',
    meta: 'Neurotransmitters',
    artwork: 'dopamine-systems',
  },
  {
    slug: 'anxiety',
    title: 'Stress & Mood',
    description: 'Calming, stress-supportive, and mood-oriented compounds.',
    meta: 'Stress signaling',
    artwork: 'adaptogen-ecosystems',
  },
  {
    slug: 'recovery',
    title: 'Recovery & Performance',
    description: 'Exercise, recovery, hydration, and performance-supportive compounds.',
    meta: 'Recovery support',
    artwork: 'mitochondrial-ecosystems',
  },
]

export default async function ExplorePage() {
  const compounds = await getAllCompounds()
  const featured = cappedExpansion(
    (compounds as any[])
      .filter((compound) => compound.slug && compound.name)
      .slice(0, 24)
      .map((compound) => ({
        ...compound,
        archetype: classifyArchetype(compound),
        clusters: getTopicClusters(compound)
          .filter(isClean)
          .slice(0, 4),
      })),
    SEMANTIC_EXPANSION_LIMITS.maxDiscoverySignals,
  )

  const cache = getSemanticDiscoveryCache(featured, topicClusters)

  const discoverySignals = cache.discoverySignals
  const prioritizedSignals = cache.prioritizedSignals

  const prioritizedGraphLinks = sortGraphLinksBySemanticDiscovery(
    cappedExpansion(
      [...graphLinks, ...getTopicClusterLinks(10)],
      SEMANTIC_EXPANSION_LIMITS.maxBridgeExpansions,
    ),
    featured,
    topicClusters,
  ).slice(0, 6)

  const semanticSource = featured[0] || null

  const syntheticGraph = buildSemanticGraphVisual(
    {
      slug: 'explore-atlas',
      displayName: 'Explore Atlas',
      pathways: discoverySignals.map((signal) => signal.ecosystem),
      effects: discoverySignals.map((signal) => signal.ecosystem),
    },
    featured,
    18,
  )

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:space-y-16 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(320px,460px)] lg:items-stretch">
          <div className="max-w-4xl space-y-6">
            <div className="space-y-3">
              <p className="eyebrow-label">Semantic Discovery Atlas</p>

              <h1 className="heading-premium max-w-[11ch] text-ink">
                Explore
              </h1>
            </div>

            <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
              Navigate compounds through semantic relationships, archetypes, evidence maturity, mechanisms, and shared research pathways instead of simple alphabetical browsing.
            </p>

            <div className="flex flex-wrap gap-2">
              {['Human Evidence', 'Mechanism-Led', 'Sleep', 'Stress', 'Cognition', 'Recovery', 'Metabolism', 'Neurochemistry'].map((item) => (
                <PathwayVisualChip key={item} pathway={item} />
              ))}
            </div>
          </div>

          <SemanticArtworkPanel
            slug="dopamine-systems"
            kind="ecosystem"
            title="Semantic Atlas"
            subtitle="Explore pathway ecosystems, evidence continuity, graph-native discovery, and semantic scientific relationships."
            height={320}
          />
        </div>
      </section>

      <SemanticVisibilityGate minHeight={440}>
        <SemanticGraphMap
          title="Explore relationship atlas"
          description="A lightweight atlas map of discovery ecosystems, semantic continuity, and evidence-aware exploration clusters."
          nodes={syntheticGraph.nodes}
          edges={syntheticGraph.edges}
        />
      </SemanticVisibilityGate>

      <SemanticHubIntro sections={hubIntro} />

      <SemanticSectionBoundary
        source={semanticSource}
        candidates={featured}
        fallback={<SemanticSectionFallback />}
      >
        <GuidedSemanticFlowSection />
      </SemanticSectionBoundary>

      <SemanticSectionBoundary
        source={semanticSource}
        candidates={featured}
        minCandidates={3}
      >
        <SemanticBridgeSection
          source={semanticSource}
          candidates={featured}
        />
      </SemanticSectionBoundary>

      <SemanticSectionBoundary
        source={semanticSource}
        candidates={featured}
        minCandidates={3}
      >
        <ContinuityMapSection
          source={semanticSource}
          candidates={featured}
        />
      </SemanticSectionBoundary>

      <SemanticSectionBoundary
        source={semanticSource}
        candidates={featured}
        minCandidates={3}
      >
        <EcosystemContinuityVisualizationSection
          source={semanticSource}
          candidates={featured}
        />
      </SemanticSectionBoundary>

      <section className="surface-depth card-spacing">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="eyebrow-label">
              Guided research paths
            </p>

            <h2 className="max-w-[16ch]">
              Stability-weighted semantic ecosystems.
            </h2>

            <p className="detail-reading text-base">
              Semantic continuity, ecosystem resilience, and bridge reinforcement are combined to prioritize stable scientific discovery pathways.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {discoverySignals.slice(0, 4).map((signal) => (
              <PathwayVisualChip
                key={signal.ecosystem}
                pathway={formatDisplayLabel(signal.ecosystem)}
              />
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/explore/${topic.slug}`}
            className="compact-card group overflow-hidden"
          >
            <SemanticArtworkPanel
              slug={topic.artwork}
              kind="ecosystem"
              title={topic.title}
              subtitle={topic.description}
              height={220}
            />

            <div className="space-y-4 p-5">
              <span className="identity-kicker">
                {topic.meta}
              </span>

              <div>
                <h2 className="text-2xl font-semibold text-ink transition group-hover:text-emerald-700">
                  {topic.title}
                </h2>

                <p className="mt-3 text-sm leading-7 text-[#46574d]">
                  {topic.description}
                </p>
              </div>

              <div className="pt-2">
                <span className="button-secondary inline-flex rounded-full px-4 py-2 text-sm">
                  Explore Ecosystem
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

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

      <section className="space-y-6">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div className="space-y-2">
            <div className="eyebrow text-brand-700">
              Discovery Rail
            </div>

            <h2 className="text-3xl font-semibold text-ink max-w-[14ch]">
              Evidence-forward compounds
            </h2>
          </div>

          <Link
            href="/compounds"
            className="button-secondary rounded-full px-4 py-2 text-sm"
          >
            Browse All Compounds
          </Link>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((compound) => (
            <Link
              key={compound.slug}
              href={`/compounds/${compound.slug}`}
              className="compact-card group overflow-hidden"
            >
              <SemanticArtworkPanel
                slug={compound.slug}
                kind="compound"
                title={compound.name}
                subtitle="Semantic profile exploration card."
                height={210}
              />

              <div className="space-y-5 p-5">
                <div className="flex flex-wrap gap-2">
                  <span className="evidence-pill-strong">
                    {compound.archetype}
                  </span>

                  {(compound.clusters || []).slice(0, 2).map((cluster:string) => (
                    <PathwayVisualChip
                      key={cluster}
                      pathway={cluster}
                    />
                  ))}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-ink transition group-hover:text-emerald-700">
                    {compound.name}
                  </h3>

                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-[#46574d]">
                    {cleanSummary(compound.summary, 'compound')}
                  </p>
                </div>

                <div className="flex items-center justify-between gap-4 border-t border-brand-900/10 pt-4">
                  <span className="identity-meta">
                    Semantic profile
                  </span>

                  <span className="button-secondary inline-flex rounded-full px-4 py-2 text-sm">
                    Explore
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
