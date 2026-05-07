import Link from 'next/link'
import { notFound } from 'next/navigation'
import compounds from '../../../public/data/compounds.json'
import {
  classifyArchetype,
  getTopicClusters,
} from '@/lib/semantic-runtime'
import { cleanSummary, isClean } from '@/lib/display-utils'

const TITLES: Record<string, string> = {
  sleep: 'Sleep Support',
  focus: 'Focus & Cognition',
  anxiety: 'Stress & Mood',
  recovery: 'Recovery & Performance',
}

export async function generateStaticParams() {
  return Object.keys(TITLES).map((topic) => ({ topic }))
}

export default async function TopicExplorePage({ params }: any) {
  const topic = String(params.topic || '').toLowerCase()

  if (!TITLES[topic]) notFound()

  const filtered = (compounds as any[])
    .filter((compound) => compound.slug && compound.name)
    .map((compound) => ({
      ...compound,
      archetype: classifyArchetype(compound),
      clusters: getTopicClusters(compound).filter(isClean),
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
    <main className="mx-auto max-w-7xl space-y-9 px-4 py-10 sm:py-14">
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="max-w-4xl space-y-4">
          <p className="eyebrow-label">Semantic Explore Hub</p>

          <h1 className="heading-premium text-ink">
            {TITLES[topic]}
          </h1>

          <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
            Discover compounds grouped by shared outcomes, relationship signals, mechanisms, and conservative evidence patterns.
          </p>
        </div>
      </section>

      <section className="space-y-5">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="eyebrow-label">Profiles</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink sm:text-3xl">Related discovery cards</h2>
          </div>
          <span className="chip-readable">{filtered.length} matches</span>
        </div>

        <div className="grid gap-5 md:grid-cols-2 xl:grid-cols-3">
          {filtered.map((compound) => (
            <Link
              key={compound.slug}
              href={`/compounds/${compound.slug}`}
              className="card-premium group p-6"
            >
              <div className="space-y-4">
                <div className="flex flex-wrap gap-2">
                  {isClean(compound.archetype) ? (
                    <span className="evidence-pill-strong">
                      {compound.archetype}
                    </span>
                  ) : null}

                  {(compound.clusters || []).slice(0, 2).map((cluster:string) => (
                    <span key={cluster} className="chip-readable text-[10px] uppercase tracking-wide">
                      {cluster}
                    </span>
                  ))}
                </div>

                <div>
                  <h2 className="text-2xl font-semibold text-ink transition group-hover:text-brand-800">
                    {compound.name}
                  </h2>

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
