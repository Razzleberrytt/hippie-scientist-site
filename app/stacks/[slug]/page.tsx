import { notFound } from 'next/navigation'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import StackCard from '@/components/StackCard'
import type { Metadata } from 'next'
import type { Stack, StackItem, CompoundSummary } from '@/types/stack'
import { isValidSlug } from '@/utils/safeLink'

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

  return (
    <div className='space-y-8'>
      <section className='space-y-3'>
        <h1 className='text-4xl font-black text-white'>{stack.title}</h1>
        {stack.short_description ? <p className='text-white/80'>{stack.short_description}</p> : null}
      </section>

      {stack.stack?.length ? (
        <section className='space-y-4'>
          <h2 className='text-2xl font-bold text-white'>Stack Breakdown</h2>
          <div className='grid gap-4'>
            {stack.stack.map((item: StackItem, i: number) => {
              const compound = compoundMap.get(item.compound)
              const compoundSlug = compound?.slug || item.compound

              return (
                <div key={`${compoundSlug}-${i}`} className='space-y-2 rounded-2xl border border-white/10 bg-white/[0.035] p-4'>
                  <StackCard item={item} />
                  {isValidSlug(compoundSlug) ? (
                    <Link href={`/compounds/${compoundSlug}`} className='text-emerald-300 text-sm'>
                      Learn more about {formatName(compoundSlug)}
                    </Link>
                  ) : (
                    <span className='text-white/60 text-sm'>{formatName(compoundSlug)}</span>
                  )}
                </div>
              )
            })}
          </div>
        </section>
      ) : (
        <p className='rounded-2xl border border-white/10 p-5 text-white/70'>No data available yet.</p>
      )}

      <section className='rounded-3xl border border-white/10 bg-white/[0.035] p-5 sm:p-6'>
        <h2 className='text-2xl font-bold text-white'>Explore More</h2>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link href={`/goals/${cleanGoal}`} className='rounded-2xl border border-emerald-300/20 bg-emerald-300/10 px-4 py-2 text-sm font-bold text-emerald-100 transition hover:bg-emerald-300/20'>
            Explore {formatName(cleanGoal)} goal
          </Link>
          <Link href={`/${cleanGoal}-supplements`} className='rounded-2xl border border-white/10 px-4 py-2 text-sm font-bold text-white/75 transition hover:bg-white/5 hover:text-white'>
            Best supplements for {formatName(cleanGoal)}
          </Link>
        </div>
      </section>
    </div>
  )
}
