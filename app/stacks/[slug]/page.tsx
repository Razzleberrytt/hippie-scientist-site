import { notFound } from 'next/navigation'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import StackCard from '@/components/StackCard'
import AffiliateBlock from '@/components/AffiliateBlock'
import type { Metadata } from 'next'
import type { Stack, StackItem, CompoundSummary } from '@/types/stack'

const stacks = stacksData as Stack[]
const compounds = ((compoundsData as CompoundSummary[]) || []).filter(Boolean)

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

const goalSlug = (goal: string) => goal.replace(/_/g, '-')

export default function StackPage({ params }: { params: { slug: string } }) {
  const stack = stacks.find((s) => s.slug === params.slug)

  if (!stack) return notFound()

  const cleanGoal = goalSlug(stack.goal || stack.slug)
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: stack.title,
    description: stack.short_description || `Best supplements for ${stack.goal?.replace(/[-_]/g, ' ') || 'this goal'}.`,
  }

  return (
    <div className='space-y-8'>
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      <section className='space-y-3'>
        <h1 className='text-4xl font-black text-white'>{stack.title}</h1>
        {stack.short_description && <p className='text-white/70'>{stack.short_description}</p>}
        <p className='text-sm text-white/50'>
          Built from human evidence and mechanism-backed compounds.
        </p>
      </section>

      <section className='space-y-4'>
        <h2 className='text-2xl font-bold text-white'>Stack Breakdown</h2>
        <div className='grid gap-4'>
          {stack.stack.map((item: StackItem, i: number) => {
            const compound = compoundMap.get(item.compound)
            const compoundSlug = compound?.slug || item.compound

            return (
              <div key={i} className='space-y-2'>
                <StackCard item={item} />

                <Link href={`/compounds/${compoundSlug}`} className='text-emerald-300 text-sm'>
                  Learn more about {formatName(compoundSlug)}
                </Link>

                {compound && (
                  <div className='text-sm text-white/70 space-y-1'>
                    {compound.primary_effect && <p><strong>Effect:</strong> {compound.primary_effect}</p>}
                    {compound.mechanism_summary && <p><strong>Mechanism:</strong> {compound.mechanism_summary}</p>}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
        <h2 className='text-2xl font-bold text-white'>How It Works</h2>
        <p className='text-white/70 mt-2'>
          This stack combines anchor compounds, support compounds, and timing guidance so readers can compare dosage, role, and mechanism without guessing.
        </p>
      </section>

      <section className='rounded-2xl border border-white/10 bg-red-500/10 p-4'>
        <h2 className='text-2xl font-bold text-white'>Safety</h2>
        {stack.avoid_if && <p className='text-white/70 mt-2'>{stack.avoid_if}</p>}
        <div className='mt-3 space-y-1 text-sm text-white/60'>
          {stack.stack.map((item: StackItem) => {
            const compound = compoundMap.get(item.compound)
            if (!compound?.safety_notes) return null

            return (
              <p key={item.compound}>
                <strong>{formatName(item.compound)}:</strong> {compound.safety_notes}
              </p>
            )
          })}
        </div>
      </section>

      <section className='space-y-4'>
        <h2 className='text-2xl font-bold text-white'>Recommended Products</h2>
        <div className='grid gap-4'>
          {stack.stack.map((item: StackItem) => (
            <div key={item.compound} className='space-y-2'>
              <h3 className='font-bold text-white'>Shop {formatName(item.compound)}</h3>
              <AffiliateBlock compound={item.compound} />
            </div>
          ))}
        </div>
      </section>

      {stack.who_for && (
        <section className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
          <h2 className='text-2xl font-bold text-white'>Who It’s For</h2>
          <p className='text-white/70 mt-2'>{stack.who_for}</p>
        </section>
      )}

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
        <h2 className='text-2xl font-bold text-white'>Explore More</h2>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link href={`/goals/${cleanGoal}`} className='rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/20'>Explore {formatName(cleanGoal)} goal</Link>
          <Link href={`/${cleanGoal}-supplements`} className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/5 hover:text-white'>Best supplements for {formatName(cleanGoal)}</Link>
        </div>
      </section>
    </div>
  )
}
