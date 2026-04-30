import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'

type Compound = { slug:string; name?:string; displayName?:string; summary?:string }

const PICKS = ['creatine','caffeine','l-theanine']
const label=(c:Compound)=>c.displayName||c.name||c.slug

export const metadata: Metadata = {
  title: 'Best Supplements for Brain Fog (2026 Guide)',
  description: 'Simple breakdown of supplements for brain fog and mental clarity.',
}

export default async function Page(){
  const compounds = (await getCompounds()) as Compound[]
  const map = new Map(compounds.map(c=>[c.slug,c]))
  const picks = PICKS.map(s=>map.get(s)).filter(Boolean) as Compound[]

  return (
    <main className='mx-auto max-w-4xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>Best Supplements for Brain Fog</h1>
      {picks.map((c,i)=>(
        <div key={c.slug} className='border p-4 rounded-xl'>
          <h2 className='text-2xl font-bold'>#{i+1} {label(c)}</h2>
          <p className='mt-2 text-white/70'>{c.summary}</p>
          <div className='mt-3 flex gap-2'>
            <Link href={`/compounds/${c.slug}`}>Read profile</Link>
            <a href={buildAmazonSearchUrl(c.slug)} target='_blank'>Compare →</a>
          </div>
        </div>
      ))}
      <div className='pt-4 border-t'>
        <Link href='/top/focus'>Best supplements for focus</Link>
      </div>
    </main>
  )
}
