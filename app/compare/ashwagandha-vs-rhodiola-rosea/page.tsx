import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'
import { AffiliateConversionCard } from '@/components/affiliate-conversion-card'

type Herb = { slug:string; name?:string; displayName?:string; summary?:string }

const A = 'ashwagandha'
const B = 'rhodiola-rosea'

const label = (h:Herb)=>h.displayName||h.name||h.slug

export const metadata: Metadata = {
  title: 'Ashwagandha vs Rhodiola (Which is better?)',
  description: 'Compare ashwagandha vs rhodiola for stress, anxiety, and energy.',
}

export default async function Page(){
  const herbs = (await getHerbs()) as Herb[]
  const map = new Map(herbs.map(h=>[h.slug,h]))
  const a = map.get(A)
  const b = map.get(B)

  const aLabel = a?label(a):'Ashwagandha'
  const bLabel = b?label(b):'Rhodiola'

  const aLink = getHerbSearchLinks(aLabel)[0]?.url
  const bLink = getHerbSearchLinks(bLabel)[0]?.url

  return (
    <main className='mx-auto max-w-5xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>Ashwagandha vs Rhodiola</h1>

      <AffiliateConversionCard
        title={aLabel}
        description='Better for long-term stress and calm.'
        href={aLink || '#'}
        secondaryHref={`/herbs/${A}`}
      />

      <section className='grid md:grid-cols-2 gap-4'>
        <div className='border p-4 rounded-xl'>
          <h2 className='text-2xl font-bold'>{aLabel}</h2>
          <p className='text-white/70 mt-2'>Best for chronic stress and anxiety.</p>
          {aLink && <a href={aLink} target='_blank'>View products →</a>}
        </div>

        <div className='border p-4 rounded-xl'>
          <h2 className='text-2xl font-bold'>{bLabel}</h2>
          <p className='text-white/70 mt-2'>Better for stress + fatigue and energy.</p>
          {bLink && <a href={bLink} target='_blank'>View products →</a>}
        </div>
      </section>

      <div className='pt-4 border-t'>
        <Link href='/top/top-3-herbs-for-stress'>Top stress herbs →</Link>
      </div>
    </main>
  )
}
