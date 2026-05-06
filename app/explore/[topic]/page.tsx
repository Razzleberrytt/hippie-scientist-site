import Link from 'next/link'
import compounds from '../../../public/data/compounds.json'
import {
  classifyArchetype,
  getTopicClusters,
} from '@/lib/semantic-runtime'

const TITLES: Record<string, string> = {
  sleep: 'Sleep Support',
  focus: 'Focus & Cognition',
  anxiety: 'Stress & Mood',
  recovery: 'Recovery & Performance',
}

export async function generateStaticParams() {
  return [
    { topic: 'sleep' },
    { topic: 'focus' },
    { topic: 'anxiety' },
    { topic: 'recovery' },
  ]
}

export default async function TopicExplorePage({ params }: any) {
  const topic = String(params.topic || '').toLowerCase()

  const filtered = (compounds as any[])
    .map((compound) => ({
      ...compound,
      archetype: classifyArchetype(compound),
      clusters: getTopicClusters(compound),
    }))
    .filter((compound) => {
      return (compound.clusters || []).some((cluster: string) => {
        const normalized = cluster.toLowerCase()

        if (topic === 'sleep') return normalized.includes('sleep')
        if (topic === 'focus') return normalized.includes('focus')
        if (topic === 'anxiety') return normalized.includes('stress')
        if (topic === 'recovery') return normalized.includes('recovery')

        return false
      })
    })
    .slice(0, 24)

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 space-y-10">
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.2em] text-emerald-300">
          Semantic Explore Hub
        </div>

        <h1 className="text-5xl font-semibold tracking-tight text-white">
          {TITLES[topic] || 'Explore Compounds'}
        </h1>

        <p className="max-w-3xl text-lg leading-8 text-neutral-400">
          Discover compounds grouped by shared outcomes, semantic relationships, mechanisms, and evidence-aware patterns.
        </p>
      </div>

      <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
        {filtered.map((compound) => (
          <Link
            key={compound.slug}
            href={`/compounds/${compound.slug}`}
            className="group rounded-3xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-xl transition hover:-translate-y-1 hover:bg-white/[0.08]"
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
                <h2 className="text-2xl font-semibold text-white group-hover:text-emerald-300 transition">
                  {compound.name}
                </h2>

                <p className="mt-3 line-clamp-4 text-sm leading-7 text-neutral-400">
                  {compound.summary || 'Semantic compound profile with evidence-aware discovery.'}
                </p>
              </div>
            </div>
          </Link>
        ))}
      </div>
    </main>
  )
}
