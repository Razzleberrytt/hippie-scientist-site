import Link from 'next/link'
import compounds from '../../public/data/compounds.json'
import {
  classifyArchetype,
  getTopicClusters,
} from '@/lib/semantic-runtime'

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
    .slice(0, 12)
    .map((compound) => ({
      ...compound,
      archetype: classifyArchetype(compound),
      clusters: getTopicClusters(compound),
    }))

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 space-y-14">
      <section className="space-y-5">
        <div className="inline-flex rounded-full border border-emerald-500/20 bg-emerald-500/10 px-4 py-2 text-xs uppercase tracking-[0.2em] text-emerald-300">
          Semantic Discovery
        </div>

        <div className="space-y-4">
          <h1 className="text-5xl font-semibold tracking-tight text-white">
            Explore Compounds by Goal
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-neutral-400">
            Navigate compounds through semantic relationships, archetypes, evidence patterns, mechanisms, and shared outcomes.
          </p>
        </div>
      </section>

      <section className="grid gap-5 md:grid-cols-2 xl:grid-cols-4">
        {TOPICS.map((topic) => (
          <Link
            key={topic.slug}
            href={`/explore/${topic.slug}`}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08] hover:shadow-2xl"
          >
            <div className="space-y-4">
              <div className="text-sm uppercase tracking-[0.2em] text-emerald-300">
                Explore
              </div>

              <h2 className="text-2xl font-semibold text-white group-hover:text-emerald-300 transition">
                {topic.title}
              </h2>

              <p className="text-sm leading-7 text-neutral-400">
                {topic.description}
              </p>
            </div>
          </Link>
        ))}
      </section>

      <section className="space-y-6">
        <div className="flex items-center justify-between gap-4">
          <div>
            <div className="text-xs uppercase tracking-[0.2em] text-neutral-500">
              Discovery Rail
            </div>

            <h2 className="mt-2 text-3xl font-semibold text-white">
              Trending Compounds
            </h2>
          </div>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {featured.map((compound) => (
            <Link
              key={compound.slug}
              href={`/compounds/${compound.slug}`}
              className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:bg-white/[0.08] hover:-translate-y-1"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-emerald-300">
                    {compound.archetype}
                  </span>

                  {(compound.clusters || []).slice(0, 2).map((cluster:string) => (
                    <span
                      key={cluster}
                      className="rounded-full border border-white/10 bg-white/5 px-3 py-1 text-[10px] uppercase tracking-wide text-neutral-300"
                    >
                      {cluster}
                    </span>
                  ))}
                </div>

                <div>
                  <h3 className="text-xl font-semibold text-white group-hover:text-emerald-300 transition">
                    {compound.name}
                  </h3>

                  <p className="mt-3 line-clamp-4 text-sm leading-7 text-neutral-400">
                    {compound.summary || 'Evidence-aware compound profile with semantic discovery support.'}
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
