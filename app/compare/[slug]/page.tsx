import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompounds, getStacks } from '@/lib/runtime-data'
import AffiliateBlock from '@/components/AffiliateBlock'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

type Params = { params: Promise<{ slug: string }> }

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const displayName = (compound: any) => compound?.displayName || compound?.name || compound?.slug || 'Compound'
const summary = (compound: any) => compound?.summary || compound?.description || compound?.scispace_primary_fact_v2 || 'Open the compound profile for more detail.'

const evidenceScore = (compound: any) => {
  const text = `${compound?.evidence_grade ?? ''} ${compound?.evidenceTier ?? ''} ${compound?.tier_level ?? ''} ${compound?.evidence ?? ''}`.toLowerCase()
  if (/strong|high|tier\s*1|\ba\b/.test(text)) return 4
  if (/moderate|tier\s*2|\bb\b/.test(text)) return 3
  if (/limited|low|tier\s*3|\bc\b/.test(text)) return 2
  return 1
}

const findCompound = (compounds: any[], candidates: string[]) => {
  const lookup = new Map<string, any>()
  for (const compound of compounds) {
    if (!compound?.slug) continue
    lookup.set(compound.slug, compound)
    lookup.set(normalize(compound.slug), compound)
    if (compound.name) lookup.set(normalize(compound.name), compound)
    if (compound.displayName) lookup.set(normalize(compound.displayName), compound)
  }

  for (const candidate of candidates) {
    const found = lookup.get(candidate) || lookup.get(normalize(candidate))
    if (found) return found
  }
  return null
}

const stackHasCompound = (stack: any, slug: string) => {
  const items = stack.compounds || stack.stack || []
  return items.some((item: any) => (item.compound_slug || item.compound) === slug)
}

export function generateStaticParams() {
  return supplementComparisons.map((comparison) => ({ slug: comparison.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const config = supplementComparisons.find((comparison) => comparison.slug === slug)
  if (!config) return {}

  return {
    title: `${config.title} | Which is better?`,
    description: config.summary,
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const config = supplementComparisons.find((comparison) => comparison.slug === slug)
  if (!config) return notFound()

  const [compounds, stacks] = await Promise.all([getCompounds(), getStacks()])
  const a = findCompound(compounds, config.a.candidates)
  const b = findCompound(compounds, config.b.candidates)
  if (!a || !b) return notFound()

  const winner = evidenceScore(a) >= evidenceScore(b) ? a : b
  const relatedStack = stacks.find((stack: any) => stackHasCompound(stack, a.slug) || stackHasCompound(stack, b.slug))
  const relatedGoals = goalConfigs.filter((goal) => goal.comparisonSlugs.includes(config.slug)).slice(0, 4)

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.04] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200/70">Supplement comparison</p>
        <h1 className="mt-3 text-4xl font-black text-white">{config.title}</h1>
        <p className="mt-3 max-w-3xl text-white/72">{config.summary}</p>
      </section>

      <section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100/70">Best default pick</p>
        <h2 className="mt-2 text-2xl font-black text-white">{displayName(winner)}</h2>
        <p className="mt-2 text-sm text-white/70">Chosen by available evidence/tier strength. Review safety context before buying.</p>
        <div className="mt-4">
          <AffiliateBlock compound={winner.slug} intentLabel="Shop winner" />
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[a, b].map((compound: any) => (
          <article key={compound.slug} className="rounded-3xl border border-white/10 bg-white/[0.035] p-5">
            <h2 className="text-xl font-black text-white">{displayName(compound)}</h2>
            <p className="mt-3 text-sm leading-6 text-white/65">{summary(compound)}</p>
            <div className="mt-4 grid gap-2 text-sm text-white/60">
              <p><strong className="text-white/85">Evidence:</strong> {compound.evidence_grade || compound.evidence || compound.tier_level || 'Review profile'}</p>
              <p><strong className="text-white/85">Safety:</strong> {compound.safety_notes || compound.safetyNotes || compound.safety || 'Review compound safety notes.'}</p>
            </div>
            <div className="mt-5 space-y-3">
              <AffiliateBlock compound={compound.slug} intentLabel={`Shop ${displayName(compound)}`} compact />
              <Link href={`/compounds/${compound.slug}`} className="inline-block text-sm font-bold text-emerald-300">
                View evidence profile →
              </Link>
            </div>
          </article>
        ))}
      </section>

      {relatedStack && (
        <section className="rounded-3xl border border-emerald-300/20 bg-white/[0.035] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200/70">Stack recommendation</p>
          <h2 className="mt-2 text-2xl font-black text-white">Use this in a stack</h2>
          <p className="mt-2 text-sm text-white/65">These compounds may fit better as part of a goal-based stack instead of being chosen in isolation.</p>
          <Link href={`/stacks/${relatedStack.slug}`} className="mt-4 inline-block rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-black text-black">
            View {relatedStack.title} →
          </Link>
        </section>
      )}

      {relatedGoals.length > 0 && (
        <section>
          <h2 className="text-xl font-bold text-white">Related goals</h2>
          <div className="mt-3 flex flex-wrap gap-3">
            {relatedGoals.map((goal) => (
              <Link key={goal.slug} href={`/goals/${goal.slug}`} className="rounded-full border border-white/10 px-4 py-2 text-sm font-bold text-emerald-300">
                {goal.title}
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
