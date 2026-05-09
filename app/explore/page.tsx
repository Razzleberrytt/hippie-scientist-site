import Link from 'next/link'
import compounds from '../../public/data/compounds.json'
import {
  classifyArchetype,
  getTopicClusters,
} from '@/lib/semantic-runtime'
import { cleanSummary, isClean } from '@/lib/display-utils'
import { EcosystemPanelGrid, KnowledgeGraphLinks, SemanticHubIntro } from '@/components/semantic-hubs/semantic-hub-sections'
import { getEcosystemPanels, getTopicClusterLinks } from '@/lib/ecosystem-context'

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

  return (
    <main className="mx-auto max-w-7xl space-y-12 px-4 py-10 sm:space-y-16 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-6">
          <div className="space-y-3">
            <p className="eyebrow-label">Semantic Discovery Layer</p>

            <h1 className="heading-premium max-w-[11ch] text-ink">
              Explore
            </h1>
          </div>

          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
            Navigate compounds through semantic relationships, archetypes, evidence maturity, mechanisms, and shared research pathways instead of simple alphabetical browsing.
          </p>

          <div className="flex flex-wrap gap-2">
            {['Human Evidence', 'Mechanism-Led', 'Sleep', 'Stress', 'Cognition', 'Recovery', 'Metabolism', 'Neurochemistry'].map((item) => (
              <span key={item} className="chip-readable">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <SemanticHubIntro sections={hubIntro} />

      <section className="surface-depth card-spacing">
        <div className="flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="max-w-3xl space-y-3">
            <p className="eyebrow-label">
              Guided research paths
            </p>

            <h2 className="max-w-[16ch]">
              Start with an outcome or pathway.
            </h2>

            <p className="detail-reading text-base">
              Discovery clusters surface related compounds, evidence-forward profiles, and overlapping mechanisms to improve scientific exploration quality.
            </p>
          </div>

          <div className="flex flex-wrap gap-2">
            {['Adaptogens', 'Neurotransmitters', 'Inflammatory Pathways', 'Mitochondrial Function'].map((item) => (
              <span key={item} className="chip-readable">
                {item}
              </span>
            ))}
          </div>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/explore/${topic.slug}`}
            className="card-premium group p-6"
          >
            <div className="space-y-4">
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

              <div className="pt-3">
                <span className="button-secondary inline-flex rounded-full px-4 py-2 text-sm">
                  Explore Cluster
                </span>
              </div>
            </div>
          </Link>
        ))}
      </section>

      <EcosystemPanelGrid
        eyebrow="Topic-cluster depth"
        title="Core scientific ecosystems"
        panels={getEcosystemPanels(['inflammation cognition metabolism stress response longevity mitochondrial function oxidative stress sleep neurobiology cardiovascular function'], 10)}
        limit={10}
      />

      <KnowledgeGraphLinks
        eyebrow="Often explored together"
        title="Move through the scientific graph"
        links={[...graphLinks, ...getTopicClusterLinks(4)].slice(0, 6)}
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
              className="card-premium group p-6"
            >
              <div className="space-y-5">
                <div className="flex flex-wrap gap-2">
                  <span className="evidence-pill-strong">
                    {compound.archetype}
                  </span>

                  {(compound.clusters || []).slice(0, 2).map((cluster:string) => (
                    <span
                      key={cluster}
                      className="chip-readable"
                    >
                      {cluster}
                    </span>
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
