import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompounds, getStacks } from '@/lib/runtime-data'
import AffiliateBlock from '@/components/AffiliateBlock'
import { generatedComparisons } from '@/data/generated-comparisons'

type Params = { params: Promise<{ slug: string }> }

const formatSlug = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bL\b/g, 'L')
    .replace(/\bD3\b/g, 'D3')

const displayName = (compound: any) => compound?.displayName || compound?.name || formatSlug(compound?.slug || 'Compound')
const summary = (compound: any) => compound?.summary || compound?.description || 'Open the compound profile for more detail.'

const evidenceScore = (compound: any) => {
  const text = `${compound?.evidence_grade ?? ''} ${compound?.evidenceTier ?? ''} ${compound?.tier_level ?? ''} ${compound?.evidence ?? ''}`.toLowerCase()
  if (/strong|high|tier\s*1/.test(text)) return 4
  if (/moderate|tier\s*2/.test(text)) return 3
  if (/limited|low|tier\s*3/.test(text)) return 2
  return 1
}

export function generateStaticParams() {
  return generatedComparisons.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const [aSlug, bSlug] = slug.split('-vs-')
  const aName = formatSlug(aSlug)
  const bName = formatSlug(bSlug)
  const title = `${aName} vs ${bName}: Which Is Better? | The Hippie Scientist`
  const description = `Compare ${aName} vs ${bName} for benefits, safety, evidence, best use cases, and supplement buying options.`

  return {
    title,
    description,
    alternates: { canonical: `/compare/${slug}` },
    openGraph: {
      title,
      description,
      type: 'article',
      url: `/compare/${slug}`,
    },
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params
  const [aSlug, bSlug] = slug.split('-vs-')
  const [compounds, stacks] = await Promise.all([getCompounds(), getStacks()])

  const a = compounds.find((c: any) => c.slug === aSlug)
  const b = compounds.find((c: any) => c.slug === bSlug)
  if (!a || !b) return notFound()

  const winner = evidenceScore(a) >= evidenceScore(b) ? a : b
  const loser = winner.slug === a.slug ? b : a
  const relatedStack = stacks.find((s: any) =>
    (s.compounds || s.stack || []).some((i: any) => {
      const compoundSlug = i.compound_slug || i.compound
      return compoundSlug === aSlug || compoundSlug === bSlug
    })
  )

  return (
    <div className="space-y-10">
      <section className="rounded-3xl border border-emerald-300/15 bg-emerald-300/[0.04] p-6">
        <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-200/70">Supplement comparison</p>
        <h1 className="mt-3 text-4xl font-black text-white">{displayName(a)} vs {displayName(b)}</h1>
        <p className="mt-3 max-w-3xl text-white/72">Compare benefits, evidence, safety, and best use cases before choosing what to buy.</p>
      </section>

      <section className="rounded-2xl border border-emerald-300/20 bg-emerald-300/[0.05] p-5">
        <h2 className="text-xl font-bold text-white">Best choice</h2>
        <p className="mt-2 font-semibold text-white">{displayName(winner)} is the better default option based on available evidence signals.</p>
        <AffiliateBlock compound={winner.slug} intentLabel="Shop winner" />
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[a, b].map((compound: any) => (
          <div key={compound.slug} className="rounded-xl border border-white/10 bg-white/[0.03] p-4 text-white">
            <h3 className="text-lg font-bold">{displayName(compound)}</h3>
            <p className="mt-2 text-sm text-white/70">{summary(compound)}</p>
            <div className="mt-4">
              <AffiliateBlock compound={compound.slug} compact />
            </div>
            <Link href={`/compounds/${compound.slug}`} className="mt-2 inline-block text-sm font-bold text-emerald-300">
              View full evidence profile →
            </Link>
          </div>
        ))}
      </section>

      {relatedStack && (
        <section className="rounded-2xl border border-amber-300/20 p-5">
          <h2 className="font-bold text-white">Better together</h2>
          <p className="text-sm text-white/70">These compounds may fit better as part of a goal-based stack.</p>
          <Link href={`/stacks/${relatedStack.slug}`} className="mt-3 inline-block font-bold text-amber-300">
            View stack →
          </Link>
        </section>
      )}
    </div>
  )
}
