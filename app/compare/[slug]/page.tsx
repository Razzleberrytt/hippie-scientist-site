import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompounds, getStacks } from '@/lib/runtime-data'
import AffiliateBlock from '@/components/AffiliateBlock'
import { generatedComparisons } from '@/data/generated-comparisons'

type Params = { params: Promise<{ slug: string }> }

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')

const displayName = (compound: any) =>
  compound?.displayName || compound?.name || compound?.slug || 'Compound'

const summary = (compound: any) =>
  compound?.summary || compound?.description || 'Open the compound profile for more detail.'

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

  return {
    title: `${aSlug} vs ${bSlug} | Which is better?`,
    description: `Compare ${aSlug} vs ${bSlug} for effectiveness, safety, and best use cases.`,
  }
}

export default async function Page({ params }: Params) {
  const { slug } = await params

  const [aSlug, bSlug] = slug.split('-vs-')

  const [compounds, stacks] = await Promise.all([
    getCompounds(),
    getStacks(),
  ])

  const a = compounds.find((c: any) => c.slug === aSlug)
  const b = compounds.find((c: any) => c.slug === bSlug)

  if (!a || !b) return notFound()

  const winner = evidenceScore(a) >= evidenceScore(b) ? a : b

  const relatedStack = stacks.find((s: any) =>
    (s.compounds || s.stack || []).some((i: any) => {
      const slug = i.compound_slug || i.compound
      return slug === aSlug || slug === bSlug
    })
  )

  return (
    <div className="space-y-10">

      <section>
        <h1 className="text-4xl font-black text-white">
          {displayName(a)} vs {displayName(b)}
        </h1>
      </section>

      {/* 🏆 WINNER */}
      <section className="rounded-2xl border border-emerald-300/20 p-5 bg-emerald-300/[0.05]">
        <h2 className="text-xl font-bold text-white">Best choice</h2>
        <p className="text-white mt-2 font-semibold">
          {displayName(winner)} is the better default option.
        </p>

        <AffiliateBlock compound={winner.slug} intentLabel="Shop winner" />
      </section>

      {/* ⚖️ COMPARISON */}
      <section className="grid md:grid-cols-2 gap-4">
        {[a, b].map((compound: any) => (
          <div key={compound.slug} className="border rounded-xl p-4 text-white">
            <h3 className="font-bold text-lg">{displayName(compound)}</h3>
            <p className="text-white/70 text-sm mt-2">{summary(compound)}</p>

            <div className="mt-4">
              <AffiliateBlock compound={compound.slug} compact />
            </div>

            <Link
              href={`/compounds/${compound.slug}`}
              className="text-emerald-300 text-sm font-bold mt-2 inline-block"
            >
              View full profile →
            </Link>
          </div>
        ))}
      </section>

      {/* 🔗 STACK CTA */}
      {relatedStack && (
        <section className="border border-amber-300/20 p-5 rounded-2xl">
          <h2 className="text-white font-bold">Better together</h2>
          <p className="text-white/70 text-sm">
            These compounds often work best in a stack.
          </p>

          <Link
            href={`/stacks/${relatedStack.slug}`}
            className="text-amber-300 font-bold mt-3 inline-block"
          >
            View stack →
          </Link>
        </section>
      )}

    </div>
  )
}
