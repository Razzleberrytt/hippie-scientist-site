import { notFound } from 'next/navigation'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import StackCard from '@/components/StackCard'
import AffiliateBlock from '@/components/AffiliateBlock'
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

      <section className='space-y-4'>
        <h2 className='text-2xl font-bold text-white'>Stack Breakdown</h2>
        <div className='grid gap-4'>
          {stack.stack.map((item: StackItem, i: number) => {
            const compound = compoundMap.get(item.compound)
            const compoundSlug = compound?.slug || item.compound

            return (
              <div key={i} className='space-y-2'>
                <StackCard item={item} />

                {isValidSlug(compoundSlug) ? (
                  <Link href={`/compounds/${compoundSlug}`} className='text-emerald-300 text-sm'>
                    Learn more about {formatName(compoundSlug)}
                  </Link>
                ) : (
                  <span className='text-white/60 text-sm'>
                    {formatName(compoundSlug)}
                  </span>
                )}

              </div>
            )
          })}
        </div>
      </section>

    </div>
  )
}
