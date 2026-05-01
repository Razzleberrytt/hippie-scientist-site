import { notFound } from 'next/navigation'
import Link from 'next/link'
import stacksData from '@/public/data/stacks.json'
import compoundsData from '@/public/data/compounds.json'
import StackCard from '@/components/StackCard'
import AffiliateBlock from '@/components/AffiliateBlock'
import type { Stack, StackItem, CompoundSummary } from '@/types/stack'

const stacks = stacksData as Stack[]
const compounds = (compoundsData as CompoundSummary[]) || []

const compoundMap = new Map(
  compounds.map((c: any) => [c.slug, c])
)

export async function generateStaticParams() {
  return stacks.map((s) => ({ slug: s.slug }))
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
    <div className='space-y-6'>
      <h1 className='text-4xl font-black text-white'>{stack.title}</h1>
      <p className='text-white/70'>{stack.short_description}</p>

      <p className='text-sm text-white/50'>
        Built from human evidence and mechanism-backed compounds.
      </p>

      <div className='grid gap-4'>
        {stack.stack.map((item: StackItem, i: number) => {
          const compound = compoundMap.get(item.compound)
          const hasSlug = !!compound?.slug

          return (
            <div key={i} className='space-y-2'>
              <StackCard item={item} />

              {compound && (
                <div className='text-sm text-white/70 space-y-1'>
                  {compound.primary_effect && <p><strong>Effect:</strong> {compound.primary_effect}</p>}
                  {compound.mechanism_summary && <p><strong>Mechanism:</strong> {compound.mechanism_summary}</p>}
                  {compound.safety_notes && <p><strong>Safety:</strong> {compound.safety_notes}</p>}
                </div>
              )}

              {hasSlug ? (
                <Link
                  href={`/compounds/${item.compound}`}
                  className='text-emerald-300 text-sm'
                >
                  Learn more about {formatName(item.compound)}
                </Link>
              ) : (
                <span className='text-sm text-white/40'>
                  {formatName(item.compound)}
                </span>
              )}

              <AffiliateBlock compound={item.compound} />
            </div>
          )
        })}
      </div>

      {stack.who_for && (
        <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
          <h3 className='font-bold text-white'>Who it’s for</h3>
          <p className='text-white/70 mt-1'>{stack.who_for}</p>
        </div>
      )}

      {stack.avoid_if && (
        <div className='rounded-2xl border border-white/10 bg-red-500/10 p-4'>
          <h3 className='font-bold text-white'>Who should avoid</h3>
          <p className='text-white/70 mt-1'>{stack.avoid_if}</p>
        </div>
      )}
    </div>
  )
}
