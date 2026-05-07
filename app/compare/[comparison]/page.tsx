import Link from 'next/link'
import compounds from '../../../public/data/compounds.json'
import {
  classifyArchetype,
  getEvidenceSnapshot,
  getTopicClusters,
} from '@/lib/semantic-runtime'
import { cleanSummary, isClean } from '@/lib/display-utils'

function findCompound(slug:string) {
  return (compounds as any[]).find((c)=>c.slug===slug)
}

export async function generateStaticParams() {
  const items = (compounds as any[]).slice(0, 25)

  return items.flatMap((a, index) => {
    const b = items[index + 1]

    if (!b) return []

    return [{
      comparison: `${a.slug}-vs-${b.slug}`,
    }]
  })
}

export default function ComparePage({ params }: any) {
  const comparison = String(params.comparison || '')
  const [leftSlug, rightSlug] = comparison.split('-vs-')

  const left = findCompound(leftSlug)
  const right = findCompound(rightSlug)

  if (!left || !right) {
    return (
      <main className="mx-auto max-w-4xl px-4 py-24 text-center text-[#46574d]">
        Comparison not found.
      </main>
    )
  }

  const leftSnapshot = getEvidenceSnapshot(left)
  const rightSnapshot = getEvidenceSnapshot(right)

  const rows = [
    {
      label: 'Archetype',
      left: classifyArchetype(left),
      right: classifyArchetype(right),
    },
    {
      label: 'Topical Clusters',
      left: getTopicClusters(left).filter(isClean).join(', '),
      right: getTopicClusters(right).filter(isClean).join(', '),
    },
    {
      label: 'Citation Density',
      left: String(leftSnapshot.citation_density),
      right: String(rightSnapshot.citation_density),
    },
    {
      label: 'Source Count',
      left: String(leftSnapshot.source_count),
      right: String(rightSnapshot.source_count),
    },
  ]

  return (
    <main className="mx-auto max-w-7xl px-4 py-16 space-y-10">
      <div className="space-y-4">
        <div className="text-xs uppercase tracking-[0.2em] text-brand-700">
          Semantic Comparison Engine
        </div>

        <h1 className="text-5xl font-semibold tracking-tight text-ink">
          {left.name} vs {right.name}
        </h1>

        <p className="max-w-3xl text-lg leading-8 text-[#46574d]">
          Evidence-aware semantic comparison across archetypes, topical clusters, source depth, and discovery context.
        </p>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {[left, right].map((compound:any)=>(
          <div
            key={compound.slug}
            className="rounded-3xl border border-brand-900/10 bg-white/80 p-7 backdrop-blur-xl"
          >
            <div className="space-y-4">
              <div className="flex flex-wrap gap-2">
                <span className="rounded-full border border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-[10px] uppercase tracking-wide text-brand-700">
                  {classifyArchetype(compound)}
                </span>

                {getTopicClusters(compound).slice(0,2).map((cluster:string)=>(
                  <span
                    key={cluster}
                    className="rounded-full border border-brand-900/10 bg-white/75 px-3 py-1 text-[10px] uppercase tracking-wide text-[#46574d]"
                  >
                    {cluster}
                  </span>
                ))}
              </div>

              <div>
                <h2 className="text-3xl font-semibold text-ink">
                  {compound.name}
                </h2>

                <p className="mt-4 text-sm leading-7 text-[#46574d]">
                  {cleanSummary(compound.summary, 'compound')}
                </p>
              </div>

              <Link
                href={`/compounds/${compound.slug}`}
                className="inline-flex rounded-full border border-brand-900/10 bg-white/75 px-4 py-2 text-xs uppercase tracking-wide text-[#33443a] hover:bg-white transition"
              >
                Open Compound
              </Link>
            </div>
          </div>
        ))}
      </div>

      <div className="rounded-3xl border border-brand-900/10 bg-white/80 p-6 backdrop-blur-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-brand-900/10">
              <th className="py-4 text-xs uppercase tracking-[0.2em] text-[#66756d]">
                Metric
              </th>
              <th className="py-4 text-xs uppercase tracking-[0.2em] text-[#66756d]">
                {left.name}
              </th>
              <th className="py-4 text-xs uppercase tracking-[0.2em] text-[#66756d]">
                {right.name}
              </th>
            </tr>
          </thead>

          <tbody>
            {rows.map((row)=>(
              <tr
                key={row.label}
                className="border-b border-brand-900/10 last:border-none"
              >
                <td className="py-5 text-sm font-medium text-ink">
                  {row.label}
                </td>

                <td className="py-5 text-sm text-[#46574d]">
                  {row.left}
                </td>

                <td className="py-5 text-sm text-[#46574d]">
                  {row.right}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </main>
  )
}
