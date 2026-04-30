import type { Metadata } from 'next'
import Link from 'next/link'
import { getHerbs } from '@/lib/runtime-data'
import { getHerbSearchLinks } from '@/lib/affiliate'

type Herb = { slug:string; name?:string; displayName?:string; summary?:string }

const PICKS = ['lemon-balm','ashwagandha','passionflower']

const label=(h:Herb)=>h.displayName||h.name||h.slug

export const metadata: Metadata = {
  title: 'Best Herbs for Overthinking (2026 Guide)',
  description: 'Simple guide to herbs for racing thoughts, overthinking, and mental calm.',
}

export default async function Page(){
  const herbs = (await getHerbs()) as Herb[]
  const map = new Map(herbs.map(h=>[h.slug,h]))
  const picks = PICKS.map(s=>map.get(s)).filter(Boolean) as Herb[]

  return (
    <main className='mx-auto max-w-4xl p-6 text-white space-y-6'>
      <h1 className='text-4xl font-bold'>Best Herbs for Overthinking</h1>
      {picks.map((h,i)=>{
        const links = getHerbSearchLinks(label(h))
        return (
          <div key={h.slug} className='border p-4 rounded-xl'>
            <h2 className='text-2xl font-bold'>#{i+1} {label(h)}</h2>
            <p className='mt-2 text-white/70'>{h.summary}</p>
            <div className='mt-3 flex gap-2'>
              <Link href={`/herbs/${h.slug}`}>Read profile</Link>
              {links[0] && <a href={links[0].url} target='_blank'>Compare →</a>}
            </div>
          </div>
        )
      })}
      <div className='pt-4 border-t'>
        <Link href='/top/stress'>Best herbs for stress</Link>
      </div>
    </main>
  )
}
