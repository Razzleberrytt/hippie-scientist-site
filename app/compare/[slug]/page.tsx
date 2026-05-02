import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import compoundsData from '@/public/data/compounds.json'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'

const compounds = Array.isArray(compoundsData) ? compoundsData : []
const stacks = Array.isArray(stacksData) ? stacksData : []

const findCompound = (candidates: string[]) => {
  for (const c of candidates) {
    const found = compounds.find((x: any) => x?.slug === c)
    if (found) return found
  }
  return null
}

export function generateStaticParams() {
  return supplementComparisons.map(c => ({ slug: c.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const config = supplementComparisons.find(c => c.slug === params.slug)
  if (!config) return {}

  return {
    title: `${config.title} — Which is better?`,
    description: config.summary,
  }
}

export default function Page({ params }: { params: { slug: string } }) {
  const config = supplementComparisons.find(c => c.slug === params.slug)
  if (!config) return notFound()

  const a = findCompound(config.a.candidates)
  const b = findCompound(config.b.candidates)

  if (!a || !b) return notFound()

  const relatedStacks = stacks.filter((s: any) =>
    s.stack?.some((item: any) =>
      config.a.candidates.includes(item.compound) || config.b.candidates.includes(item.compound)
    )
  )

  return (
    <div className='space-y-8'>
      <h1 className='text-4xl font-black text-white'>{config.title}</h1>
      <p className='text-white/80'>{config.summary}</p>

      <section className='overflow-hidden rounded-2xl border border-white/10'>
        <table className='w-full text-left text-sm'>
          <thead className='text-white/60'>
            <tr>
              <th className='p-4'>Compound</th>
              <th className='p-4'>Primary fact</th>
              <th className='p-4'>Tier</th>
            </tr>
          </thead>
          <tbody>
            {[a, b].map((c: any) => (
              <tr key={c.slug} className='border-t border-white/10 text-white/80'>
                <td className='p-4 font-bold'>{c.displayName || c.name}</td>
                <td className='p-4'>{c.scispace_primary_fact_v2 || 'See compound page'}</td>
                <td className='p-4'>{c.tier_level || 'Unranked'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>

      <section className='grid gap-4 sm:grid-cols-2'>
        {[a, b].map((c: any) => (
          <div key={c.slug} className='rounded-2xl border border-white/10 p-5'>
            <h2 className='font-bold text-white'>{c.displayName || c.name}</h2>
            <p className='text-sm text-white/70 mt-2'>{c.safety_notes || 'Review compound page for safety context.'}</p>
            <Link href={`/compounds/${c.slug}`} className='text-emerald-300 text-sm mt-3 inline-block'>
              View details →
            </Link>
          </div>
        ))}
      </section>

      {relatedStacks.length > 0 && (
        <section>
          <h2 className='text-xl font-bold text-white'>Related stacks</h2>
          <div className='mt-2 flex flex-wrap gap-3'>
            {relatedStacks.map((s: any) => (
              <Link key={s.slug} href={`/stacks/${s.slug}`} className='text-emerald-300 text-sm'>
                {s.title}
              </Link>
            ))}
          </div>
        </section>
      )}

      <section className='flex gap-4'>
        <Link href={`/compounds/${a.slug}`} className='bg-emerald-300 text-black px-4 py-2 rounded-xl font-bold'>View {a.slug}</Link>
        <Link href={`/compounds/${b.slug}`} className='bg-emerald-300 text-black px-4 py-2 rounded-xl font-bold'>View {b.slug}</Link>
      </section>
    </div>
  )
}
