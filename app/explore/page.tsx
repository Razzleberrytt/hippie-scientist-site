import Link from 'next/link'
import compounds from '../../public/data/compounds.json'
import {
  classifyArchetype,
  getTopicClusters,
} from '@/lib/semantic-runtime'
import { cleanSummary, isClean } from '@/lib/display-utils'

const TOPICS = [
  {
    slug: 'sleep',
    title: 'Sleep Support',
    description: 'Compounds commonly explored for sleep quality, latency, recovery, and nighttime relaxation.',
  },
  {
    slug: 'focus',
    title: 'Focus & Cognition',
    description: 'Nootropic and cognition-oriented compounds for attention, productivity, and mental performance.',
  },
  {
    slug: 'anxiety',
    title: 'Stress & Mood',
    description: 'Calming, stress-supportive, and mood-oriented compounds.',
  },
  {
    slug: 'recovery',
    title: 'Recovery & Performance',
    description: 'Exercise, recovery, hydration, and performance-supportive compounds.',
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
    <main className="mx-auto max-w-7xl space-y-10 px-4 py-10 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-4">
          <p className="eyebrow-label">Semantic Discovery</p>
          <h1 className="heading-premium max-w-4xl text-ink">
            Explore Compounds by Goal
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
            Navigate compounds through semantic relationships, archetypes, evidence patterns, mechanisms, and shared outcomes.
          </p>
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
              <div className="eyebrow text-emerald-600">
                Explore
              </div>

              <h2 className="text-2xl font-semibold text-ink transition group-hover:text-emerald-700">
                {topic.title}
              </h2>

              <p className="text-sm leading-7 text-[#46574d]">
                {topic.description}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="eyebrow text-brand-700">
              Discovery Rail
            </div>

            <h2 className="mt-2 text-3xl font-semibold text-ink">
              Trending Compounds
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((compound) => (
            <Link
              key={compound.slug}
              href={`/compounds/${compound.slug}`}
              className="card-premium group p-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-emerald-700">
                    {compound.archetype}
                  </span>

                  {(compound.clusters || []).slice(0, 2).map((cluster:string) => (
                    <span
                      key={cluster}
                      className="rounded-full border border-neutral-200 bg-neutral-100 px-3 py-1 text-[10px] uppercase tracking-wide text-neutral-700"
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
              </div>
            </Link>
          ))}
        </div>
      </section>
    </main>
  )
}
