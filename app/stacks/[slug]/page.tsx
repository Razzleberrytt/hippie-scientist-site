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

const budgetFriendlySlugs = new Set([
  'caffeine',
  'creatine',
  'magnesium',
  'glycine',
  'melatonin',
  'l-theanine',
  'capsaicin',
])

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

const normalizeGoal = (goal?: string) => (goal || '').replace(/_/g, '-').toLowerCase()

const toNumber = (value: unknown) => {
  const parsed = Number(value)
  return Number.isFinite(parsed) ? parsed : 0
}

const factsArray = (value: unknown): string[] => {
  if (Array.isArray(value)) return value.filter((fact): fact is string => typeof fact === 'string' && fact.trim().length > 0)
  if (typeof value !== 'string') return []

  const trimmed = value.trim()
  if (!trimmed) return []

  try {
    const parsed = JSON.parse(trimmed)
    if (Array.isArray(parsed)) return parsed.filter((fact): fact is string => typeof fact === 'string' && fact.trim().length > 0)
  } catch {
    // Fall through to text splitting.
  }

  return trimmed
    .split(/\n|\|/)
    .map(fact => fact.trim())
    .filter(Boolean)
}

const evidenceRank = (compound: any) => {
  const text = `${compound?.evidence_grade ?? ''} ${compound?.evidenceTier ?? ''} ${compound?.tier_level ?? ''} ${compound?.summary_quality ?? ''}`.toLowerCase()
  if (/strong|high|tier\s*1|a\b|a-tier/.test(text)) return 4
  if (/moderate|medium|tier\s*2|b\b/.test(text)) return 3
  if (/limited|low|tier\s*3|c\b/.test(text)) return 2
  return 1
}

const rankingLabelsFor = (items: any[]) => {
  const enriched = items.map((item, index) => ({
    item,
    index,
    compound: compoundMap.get(item.compound),
  }))

  const labels = new Map<string, string[]>()
  const addLabel = (compoundSlug: string | undefined, label: string) => {
    if (!compoundSlug) return
    const current = labels.get(compoundSlug) || []
    if (!current.includes(label)) labels.set(compoundSlug, [...current, label])
  }

  const bestOverall = [...enriched].sort((a, b) => toNumber(b.compound?.fact_score_v2) - toNumber(a.compound?.fact_score_v2))[0]
  addLabel(bestOverall?.item?.compound, 'Best Overall')

  const mostStudied = [...enriched].sort((a, b) => evidenceRank(b.compound) - evidenceRank(a.compound))[0]
  addLabel(mostStudied?.item?.compound, 'Most Studied')

  const bestBudget = enriched.find(entry => budgetFriendlySlugs.has(entry.item.compound)) || enriched[0]
  addLabel(bestBudget?.item?.compound, 'Best Budget')

  return labels
}

const inferTimeToEffect = (facts: string[], stack: any) => {
  const timeFact = facts.find(fact => /\b(\d+\s*)?(minute|minutes|min|hour|hours|day|days|week|weeks|month|months)\b/i.test(fact))
  if (timeFact) return timeFact

  const timing = stack?.stack?.map((item: any) => item.timing).filter(Boolean).join('; ')
  return timing ? `Timing guidance from the stack: ${timing}.` : 'Time to effect depends on the compound, dose, and user context.'
}

const relatedStacksFor = (stack: any) => {
  const goal = normalizeGoal(stack.goal)
  const sameGoal = stacks.filter(s => s.slug !== stack.slug && normalizeGoal(s.goal) === goal)
  return sameGoal.length ? sameGoal : stacks.filter(s => s.slug !== stack.slug).slice(0, 3)
}

export default function StackPage({ params }: { params: { slug: string } }) {
  const stack = stacks.find((s) => s.slug === params.slug)

  if (!stack) return notFound()

  const labels = rankingLabelsFor(stack.stack || [])
  const stackCompounds = (stack.stack || []).map((item: any) => ({
    item,
    compound: compoundMap.get(item.compound),
  }))
  const relatedCompounds = stackCompounds.filter(({ compound }: any) => compound?.slug)
  const allFacts = stackCompounds.flatMap(({ compound }) => factsArray(compound?.scispace_key_facts_v2))
  const noticeFacts = allFacts.slice(0, 2)
  const timeToEffect = inferTimeToEffect(allFacts, stack)
  const relatedStacks = relatedStacksFor(stack)

  return (
    <div className='space-y-10'>
      <section className='space-y-4'>
        <h1 className='text-4xl font-black text-white'>{stack.title}</h1>
        <p className='text-white/80'>{stack.short_description}</p>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        <div className='rounded-2xl border border-white/10 bg-white/[0.035] p-5'>
          <h2 className='font-bold text-white'>Who this is for</h2>
          <p className='mt-2 text-sm text-white/70'>{stack.who_for || 'People who want a simple supplement stack matched to this goal.'}</p>
        </div>
        <div className='rounded-2xl border border-red-300/20 bg-red-300/[0.04] p-5'>
          <h2 className='font-bold text-red-100'>Who should avoid this</h2>
          <p className='mt-2 text-sm text-white/70'>{stack.avoid_if || 'Anyone pregnant, managing a medical condition, or taking medications should review ingredients carefully first.'}</p>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/[0.035] p-5'>
          <h2 className='font-bold text-white'>What you’ll notice</h2>
          <ul className='mt-2 list-disc space-y-2 pl-5 text-sm text-white/70'>
            {(noticeFacts.length ? noticeFacts : ['Effects depend on the anchor compound, dose, and consistency.']).map((fact, index) => (
              <li key={index}>{fact}</li>
            ))}
          </ul>
        </div>
        <div className='rounded-2xl border border-white/10 bg-white/[0.035] p-5'>
          <h2 className='font-bold text-white'>Time to effect</h2>
          <p className='mt-2 text-sm text-white/70'>{timeToEffect}</p>
        </div>
      </section>

      <section className='space-y-6'>
        <h2 className='text-2xl font-bold text-white'>Stack Breakdown</h2>
        <div className='grid gap-5'>
          {stackCompounds.map(({ item, compound }: any, i: number) => {
            const label = compound?.displayName || compound?.name || formatName(item.compound)
            const fact = compound?.scispace_primary_fact_v2
            const tier = compound?.tier_level
            const links = getCompoundSearchLinks(label)
            const badges = labels.get(item.compound) || []

            return (
              <div key={i} className='space-y-4 rounded-2xl border border-white/10 p-5'>
                {badges.length > 0 && (
                  <div className='flex flex-wrap gap-2'>
                    {badges.map(badge => (
                      <span key={badge} className='rounded-full border border-amber-300/30 bg-amber-300/10 px-3 py-1 text-xs font-black text-amber-100'>
                        {badge}
                      </span>
                    ))}
                  </div>
                )}

                <StackCard item={item} />

                {fact && (
                  <p className='text-sm text-white/80'>
                    <strong className='text-emerald-300'>Key fact:</strong> {fact}
                  </p>
                )}

                {tier && (
                  <p className='text-xs text-amber-200'>Tier: {tier}</p>
                )}

                <div className='flex flex-wrap gap-3'>
                  {links.map((l: any) => (
                    <a key={l.label} href={l.url} target='_blank' rel='noopener noreferrer' className='text-sm font-bold text-emerald-300'>
                      {l.label}
                    </a>
                  ))}
                </div>

                {compound?.slug && (
                  <Link href={`/compounds/${compound.slug}`} className='text-sm text-white/70 hover:text-white'>
                    Learn more about {label} →
                  </Link>
                )}
              </div>
            )
          })}
        </div>
      </section>

      <section className='overflow-hidden rounded-2xl border border-white/10'>
        <div className='border-b border-white/10 bg-white/[0.035] p-4'>
          <h2 className='text-xl font-bold text-white'>Quick Comparison</h2>
        </div>
        <div className='overflow-x-auto'>
          <table className='w-full min-w-[680px] text-left text-sm'>
            <thead className='text-white/55'>
              <tr>
                <th className='p-4'>Compound</th>
                <th className='p-4'>Primary effect</th>
                <th className='p-4'>Tier</th>
              </tr>
            </thead>
            <tbody>
              {stackCompounds.map(({ item, compound }: any) => {
                const label = compound?.displayName || compound?.name || formatName(item.compound)
                return (
                  <tr key={item.compound} className='border-t border-white/10 text-white/75'>
                    <td className='p-4 font-bold text-white'>{label}</td>
                    <td className='p-4'>{compound?.scispace_primary_fact_v2 || compound?.primary_effect || 'Evidence summary available on compound page.'}</td>
                    <td className='p-4'>{compound?.tier_level || 'Unranked'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        <div className='rounded-2xl border border-white/10 p-5'>
          <h2 className='font-bold text-white'>Related compounds</h2>
          <div className='mt-3 flex flex-wrap gap-3'>
            {relatedCompounds.length > 0 ? relatedCompounds.map(({ item, compound }: any) => (
              <Link key={compound.slug} href={`/compounds/${compound.slug}`} className='text-sm text-emerald-300 hover:text-emerald-100'>
                {compound.displayName || compound.name || formatName(item.compound)}
              </Link>
            )) : <Link href='/compounds' className='text-sm text-emerald-300 hover:text-emerald-100'>Browse compounds</Link>}
          </div>
        </div>
        <div className='rounded-2xl border border-white/10 p-5'>
          <h2 className='font-bold text-white'>Related goals</h2>
          <div className='mt-3 flex flex-wrap gap-3'>
            {relatedStacks.length > 0 ? relatedStacks.map((related: any) => (
              <Link key={related.slug} href={`/stacks/${related.slug}`} className='text-sm text-emerald-300 hover:text-emerald-100'>
                {related.title}
              </Link>
            )) : <Link href='/stacks' className='text-sm text-emerald-300 hover:text-emerald-100'>Browse all stacks</Link>}
          </div>
        </div>
        <div className='rounded-2xl border border-white/10 p-5'>
          <h2 className='font-bold text-white'>Keep exploring</h2>
          <div className='mt-3 flex flex-wrap gap-3'>
            <Link href='/stacks' className='text-sm text-white/70 hover:text-white'>All stacks</Link>
            <Link href='/compounds' className='text-sm text-white/70 hover:text-white'>Compound index</Link>
          </div>
        </div>
      </section>

      <section className='rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.06] p-6 text-center'>
        <h3 className='mb-2 text-xl font-black text-white'>Ready to compare options?</h3>
        <p className='mb-4 text-white/70'>Start with the top-ranked compound, then compare forms and labels before buying.</p>
        <Link href='/compounds' className='rounded-xl bg-emerald-300 px-6 py-3 font-bold text-black'>
          Browse Supplements
        </Link>
      </section>
    </div>
  )
}
