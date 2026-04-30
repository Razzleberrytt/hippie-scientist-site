// upgraded comparison page with conversion focus
import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'

const COMPARISONS = [
  { slug: 'creatine-vs-caffeine', a: 'creatine', b: 'caffeine' },
  { slug: 'epa-vs-dha', a: 'epa', b: 'dha' },
  { slug: 'ashwagandha-vs-rhodiola', a: 'ashwagandha', b: 'rhodiola' },
  { slug: 'magnesium-vs-l-theanine', a: 'magnesium', b: 'l-theanine' },
]

export function generateStaticParams() {
  return COMPARISONS.map(c => ({ slug: c.slug }))
}

export default async function Page({ params }) {
  const { slug } = await params
  const config = COMPARISONS.find(c => c.slug === slug)
  if (!config) notFound()

  const compounds = await getCompounds()

  const get = (s) => compounds.find(c => c.slug === s)

  const A = get(config.a)
  const B = get(config.b)

  const scoreA = Number(A?.net_score || 0)
  const scoreB = Number(B?.net_score || 0)

  const winner = scoreA >= scoreB ? A : B

  return (
    <div className='mx-auto max-w-5xl space-y-6 px-4 py-10'>
      <h1 className='text-4xl font-bold text-white'>
        {config.a} vs {config.b}
      </h1>

      <div className='rounded-2xl bg-emerald-300/10 border border-emerald-300/20 p-4'>
        <p className='text-emerald-100'>🏆 Winner: {winner?.slug}</p>
      </div>

      <div className='grid md:grid-cols-2 gap-4'>
        {[A, B].map((c) => (
          <div key={c.slug} className='border p-4 rounded-xl text-white'>
            <h2 className='text-xl font-bold'>{c.slug}</h2>
            <p className='text-sm text-white/70 mt-2'>{c.summary}</p>

            <a
              href={buildAmazonSearchUrl(c.slug)}
              target='_blank'
              className='mt-4 inline-block bg-emerald-300 text-black px-4 py-2 rounded-lg font-bold'
            >
              Buy →
            </a>
          </div>
        ))}
      </div>
    </div>
  )
}
