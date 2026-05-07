import type { Metadata } from 'next'
import Link from 'next/link'
import { getCompounds } from '@/lib/runtime-data'
import { buildAmazonSearchUrl } from '@/lib/affiliate'
import { cleanSummary } from '@/lib/display-utils'

type CompoundRecord = {
  slug: string
  name?: string | null
  displayName?: string | null
  summary?: string | null
  description?: string | null
  net_score?: number | string | null
}

const text = (v: unknown): string =>
  typeof v === 'string' ? v.trim() : v ? String(v).trim() : ''

const titleFor = (c: CompoundRecord): string =>
  text(c.displayName) || text(c.name) || c.slug

const scoreFor = (c: CompoundRecord): number => {
  const raw = c.net_score
  if (typeof raw === 'number') return raw
  if (typeof raw === 'string') return parseFloat(raw) || 0
  return 0
}

export const metadata: Metadata = {
  title: 'Best Supplements for Focus & Cognitive Performance (2026)',
  description:
    'Compare top supplements for focus, memory, and cognitive performance. Ranked using evidence, mechanisms, and real-world use.',
  alternates: { canonical: '/top/focus' },
}

export default async function FocusPage() {
  const compounds = (await getCompounds()) as CompoundRecord[]
  const ranked = compounds.sort((a, b) => scoreFor(b) - scoreFor(a)).slice(0, 12)

  return (
    <main className='mx-auto max-w-6xl space-y-6 px-4 py-8 text-white'>
      <section className='rounded-[2rem] border border-white/10 bg-white/[0.04] p-6'>
        <h1 className='text-4xl font-bold'>Best Supplements for Focus</h1>
        <p className='mt-4 text-white/70'>
          These supplements are commonly used for focus, memory, and cognitive performance. Rankings are based on dataset signals and research context.
        </p>
      </section>

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5'>
        <h2 className='text-2xl font-bold'>What supplements improve focus?</h2>
        <p className='mt-3 text-white/65'>
          Popular focus supplements include compounds that influence neurotransmitters, energy metabolism, and stress response — such as caffeine, L-theanine, creatine, and others found in the dataset.
        </p>
        <div className='mt-4 flex flex-wrap gap-2'>
          <Link href='/compare/creatine-vs-caffeine'>Creatine vs caffeine</Link>
          <Link href='/top/stress'>Best herbs for stress</Link>
          <Link href='/top/sleep'>Best herbs for sleep</Link>
        </div>
      </section>

      <div className='grid md:grid-cols-2 lg:grid-cols-3 gap-4'>
        {ranked.map((c, i) => (
          <div key={c.slug} className='border p-4 rounded-xl'>
            <h2 className='font-bold'>#{i + 1} {titleFor(c)}</h2>
            <p className='text-sm text-white/70'>{cleanSummary(c.summary || c.description, 'compound')}</p>
            <a href={buildAmazonSearchUrl(c.slug)} target='_blank' className='mt-3 inline-block bg-emerald-300 text-black px-3 py-1 rounded'>Compare {titleFor(c)} products →</a>
            <Link href={`/compounds/${c.slug}`} className='block mt-2 text-sm'>Read full profile →</Link>
          </div>
        ))}
      </div>

      <section className='border-t border-white/10 pt-6'>
        <h2 className='text-2xl font-bold'>Related guides</h2>
        <div className='mt-3 flex gap-3 flex-wrap'>
          <Link href='/top/stress'>Best herbs for stress</Link>
          <Link href='/top/sleep'>Best herbs for sleep</Link>
        </div>
      </section>
    </main>
  )
}
