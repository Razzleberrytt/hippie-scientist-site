import { notFound } from 'next/navigation'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import StackCard from '@/components/StackCard'
import { getCompoundSearchLinks } from '@/src/lib/affiliate'
import type { Metadata } from 'next'

const stacks = stacksData as any[]
const compounds = ((compoundsData as any[]) || []).filter(Boolean)

const compoundMap = new Map(
  compounds
    .filter((c) => c?.slug)
    .map((c) => [c.slug as string, c])
)

export async function generateStaticParams() {
  return stacks.map((s) => ({ slug: s.slug }))
}

export function generateMetadata({ params }: { params: { slug: string } }): Metadata {
  const stack = stacks.find((s) => s.slug === params.slug)
  const goal = stack?.goal?.replace(/[-_]/g, ' ') || 'supplements'

  return {
    title: `Best Supplements for ${goal} (Stack Guide)`,
    description: `Science-backed supplement stack for ${goal}. Dosage, timing, and safety included.`,
  }
}

const formatName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map(p => p.charAt(0).toUpperCase() + p.slice(1))
    .join(' ')

export default function StackPage({ params }: { params: { slug: string } }) {
  const stack = stacks.find((s) => s.slug === params.slug)

  if (!stack) return notFound()

  return (
    <div className='space-y-10'>
      <section className='space-y-4'>
        <h1 className='text-4xl font-black text-white'>{stack.title}</h1>
        <p className='text-white/80'>{stack.short_description}</p>
        {stack.who_for && <p className='text-emerald-200 text-sm'>Best for: {stack.who_for}</p>}
      </section>

      <section className='space-y-6'>
        <h2 className='text-2xl font-bold text-white'>Stack Breakdown</h2>
        <div className='grid gap-5'>
          {stack.stack.map((item: any, i: number) => {
            const compound = compoundMap.get(item.compound)
            const label = compound?.displayName || compound?.name || formatName(item.compound)
            const fact = compound?.scispace_primary_fact_v2
            const tier = compound?.tier_level
            const links = getCompoundSearchLinks(label)

            return (
              <div key={i} className='rounded-2xl border border-white/10 p-5 space-y-4'>
                <StackCard item={item} />

                {fact && (
                  <p className='text-white/80 text-sm'>
                    <strong className='text-emerald-300'>Key fact:</strong> {fact}
                  </p>
                )}

                {tier && (
                  <p className='text-xs text-amber-200'>Tier: {tier}</p>
                )}

                <div className='flex flex-wrap gap-2'>
                  {links.map((l: any) => (
                    <a key={l.label} href={l.url} target='_blank' className='text-sm text-emerald-300'>
                      {l.label}
                    </a>
                  ))}
                </div>

                {compound?.slug && (
                  <Link href={`/compounds/${compound.slug}`} className='text-sm text-white/70'>
                    Learn more →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </section>

      {stack.avoid_if && (
        <section className='rounded-2xl border border-red-300/20 p-5'>
          <h3 className='text-red-200 font-bold'>Avoid if:</h3>
          <p className='text-white/70 text-sm'>{stack.avoid_if}</p>
        </section>
      )}

      <section className='text-center'>
        <h3 className='text-xl font-bold text-white mb-2'>Take Action</h3>
        <p className='text-white/70 mb-4'>Find supplements that match this stack.</p>
        <Link href='/compounds' className='bg-emerald-300 text-black px-6 py-3 rounded-xl font-bold'>
          Browse Supplements
        </Link>
      </section>
    </div>
  )
}
