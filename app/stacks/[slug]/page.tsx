import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getStacks } from '@/lib/runtime-data'
import StackCard from '@/components/StackCard'
import AffiliateBlock from '@/components/AffiliateBlock'
import { generatedComparisons } from '@/data/generated-comparisons'

type Params = { params: Promise<{ slug: string }> }

const formatGoal = (value?: string) =>
  String(value || 'wellness')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

const stackGoal = (stack: any) => stack?.goal_slug || stack?.goal || stack?.slug

const priority = [
  'creatine',
  'magnesium',
  'omega-3',
  'protein',
  'ashwagandha',
]

const priorityScore = (item: any) => {
  const slug = String(item.compound_slug || item.compound || '').toLowerCase()
  return priority.some(value => slug === value || slug.includes(value)) ? 1 : 0
}

const itemDecisionLabel = (item: any) => {
  const role = String(item.role || '').toLowerCase()
  if (role.includes('anchor') || role.includes('core')) return 'Best for: starting the stack'
  if (role.includes('amplifier')) return 'Best for: boosting results'
  if (role.includes('support')) return 'Best for: rounding out support'
  return 'Best for: beginners / fast decisions'
}

export async function generateStaticParams() {
  const stacks = await getStacks()
  return stacks.map(s => ({ slug: s.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const stacks = await getStacks()
  const stack = stacks.find(s => s.slug === slug)
  const goal = formatGoal(stackGoal(stack))
  const title = stack ? `Best Supplements for ${goal}: ${stack.title} | The Hippie Scientist` : 'Best Supplement Stack | The Hippie Scientist'
  const description = stack
    ? `Discover the best supplement stack for ${goal.toLowerCase()}. Includes dosages, safety notes, key ingredients, and product options.`
    : 'Evidence-aware supplement stack guide with dosages, safety notes, and product options.'

  return {
    title,
    description,
    alternates: { canonical: `/stacks/${slug}` },
    openGraph: { title, description, type: 'article', url: `/stacks/${slug}` },
  }
}

export default async function StackPage({ params }: Params) {
  const { slug } = await params
  const stacks = await getStacks()
  const stack = stacks.find(s => s.slug === slug)
  if (!stack) return notFound()

  const items = [...(stack.compounds || stack.stack || [])].sort((a, b) => priorityScore(b) - priorityScore(a))
  const goal = formatGoal(stackGoal(stack))
  const itemSlugs = items.map(i => i.compound_slug || i.compound).filter(Boolean)
  const bundleQuery = itemSlugs.join('+')
  const relatedComparisons = generatedComparisons
    .filter(compareSlug => itemSlugs.some(itemSlug => compareSlug.includes(itemSlug)))
    .slice(0, 4)

  return (
    <div className="space-y-10">
      <section className="space-y-4">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200/70">Best supplements for {goal}</p>
        <h1 className="text-4xl font-black text-white">{stack.title}</h1>
        <p className="text-white/70">{stack.summary || stack.short_description}</p>
        <p className="text-xs text-white/40">Used by thousands researching better health decisions</p>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-4">
          <p className="text-sm text-white/80">
            If your goal is <span className="font-bold">{goal.toLowerCase()}</span>, this stack is your best starting point.
          </p>
        </section>

        <div>
          <a href={`https://www.amazon.com/s?k=${bundleQuery}+supplement&tag=razzleberry02-20`} target="_blank" rel="noopener noreferrer sponsored" className="block rounded-xl bg-emerald-400 py-4 text-center text-lg font-black text-black">
            Start with this stack →
          </a>
          <p className="mt-2 text-center text-xs text-white/40">Most beginners start here</p>
        </div>

        <section className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-bold text-white">Why buy this stack</h2>
          <ul className="mt-3 grid gap-2 text-sm text-white/70">
            <li>Saves time vs researching individually</li>
            <li>Combines proven ingredients</li>
            <li>Designed for real-world results</li>
          </ul>
        </section>

        <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
          <h2 className="text-xl font-bold text-white">Best supplements for {goal}</h2>
          <p className="mt-2 text-sm text-white/70">This stack includes the key supplement options for people trying to improve {goal.toLowerCase()} without guessing compound by compound.</p>
          <div className="mt-4 flex flex-wrap gap-3 text-sm font-bold">
            <Link href="/goals" className="text-emerald-300">Browse goals →</Link>
            <Link href="/herbs" className="text-emerald-300">Explore herb sources →</Link>
            <Link href="/compounds" className="text-emerald-300">Research compounds →</Link>
          </div>
        </section>

        <div className="rounded-2xl border border-amber-300/20 bg-amber-300/[0.05] p-5">
          <h2 className="text-xl font-bold text-white">Buy full stack (Top picks)</h2>
          <p className="text-sm text-white/60">Often bought together for best results.</p>
          <a href={`https://www.amazon.com/s?k=${bundleQuery}+supplement&tag=razzleberry02-20`} target="_blank" rel="noopener noreferrer sponsored" className="mt-3 block rounded-xl bg-amber-300 py-3 text-center font-black text-black">
            Shop full stack →
          </a>
          <p className="mt-2 text-center text-xs text-white/40">Often bought together • Popular right now</p>
          <p className="mt-1 text-center text-xs text-white/40">Used by thousands researching better health decisions</p>
        </div>

        <div className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
          <h2 className="text-xl font-bold text-white">Top picks from this stack</h2>
          <div className="mt-3 grid gap-3">
            {items.slice(0, 3).map((item, i) => (
              <AffiliateBlock key={i} compound={item.compound_slug || item.compound} intentLabel={i === 0 ? 'Best overall (most effective)' : undefined} />
            ))}
          </div>
        </div>
      </section>

      <section className="space-y-6">
        <h2 className="text-2xl font-bold text-white">Stack Breakdown</h2>
        <div className="grid gap-5">
          {items.map((item, i) => {
            const compoundSlug = item.compound_slug || item.compound
            return (
              <div key={i} className="space-y-3">
                <StackCard item={item} />
                <p className="text-xs text-white/50">{itemDecisionLabel(item)}</p>
                <div className="flex flex-wrap gap-3 rounded-2xl border border-white/10 bg-white/[0.025] p-3 text-xs font-bold">
                  {compoundSlug ? (
                    <Link href={`/compounds/${compoundSlug}`} className="text-emerald-300">View compound profile →</Link>
                  ) : null}
                  <Link href="/herbs" className="text-emerald-300">Find herb sources →</Link>
                  <Link href="/compare" className="text-emerald-300">Compare alternatives →</Link>
                </div>
                <AffiliateBlock compound={compoundSlug} intentLabel={item.role === 'anchor' ? 'Core compound' : undefined} compact />
              </div>
            )
          })}
        </div>
      </section>

      {relatedComparisons.length > 0 && (
        <section className="rounded-2xl border border-white/10 p-5">
          <h2 className="text-xl font-bold text-white">Compare key ingredients</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {relatedComparisons.map(compareSlug => (
              <Link key={compareSlug} href={`/compare/${compareSlug}`} className="text-sm font-bold text-emerald-300">
                {compareSlug.replace(/-/g, ' ').replace(/\b\w/g, char => char.toUpperCase()).replace(' Vs ', ' vs ')} →
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
