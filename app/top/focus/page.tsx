import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'

type CompoundRecord = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  net_score?: number | string | null
}

const text = (value: unknown): string =>
  typeof value === 'string' ? value.trim() : value === null || value === undefined ? '' : String(value).trim()

const titleFor = (c: CompoundRecord): string =>
  text(c.displayName) || text(c.name) || c.slug

const scoreFor = (c: CompoundRecord): number => {
  const raw = c.net_score
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') return parseFloat(raw) || 0
  return 0
}

export const metadata: Metadata = {
  title: 'Best Supplements for Focus',
  description: 'Compounds associated with focus and cognition ranked by dataset score.',
}

export default async function FocusPage() {
  const compounds = (await getCompounds()) as CompoundRecord[]
  const ranked = compounds.sort((a,b)=>scoreFor(b)-scoreFor(a)).slice(0,12)

  return (
    <main className='mx-auto max-w-6xl space-y-6 px-4 py-8 text-white'>
      <h1 className='text-4xl font-bold'>Best Supplements for Focus</h1>
      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {ranked.map((c,i)=>(
          <div key={c.slug} className='border p-4 rounded-xl'>
            <h2 className='font-bold'>#{i+1} {titleFor(c)}</h2>
            <p className='text-sm text-white/70'>{c.summary}</p>
            <a href={buildAmazonSearchUrl(c.slug)} target='_blank' className='mt-3 inline-block bg-emerald-300 text-black px-3 py-1 rounded'>Compare →</a>
            <Link href={`/compounds/${c.slug}`} className='block mt-2 text-sm'>View →</Link>
          </div>
        ))}
      </div>
    </main>
  )
}
