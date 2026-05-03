import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompounds, getStacks } from '@/lib/runtime-data'
import AffiliateBlock from '@/components/AffiliateBlock'
import { generatedComparisons } from '@/data/generated-comparisons'
import { supplementComparisons } from '@/data/comparisons'
import { bestPages } from '@/data/best'

type Params = { params: Promise<{ slug: string }> }

const formatSlug = (value: string) =>
  value
    .replace(/-/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())
    .replace(/\bVs\b/g, 'vs')
    .replace(/\bL\b/g, 'L')
    .replace(/\bD3\b/g, 'D3')

const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

const displayName = (compound: any) => compound?.displayName || compound?.name || formatSlug(compound?.slug || 'Compound')
const summary = (compound: any) => compound?.summary || compound?.description || 'Open the compound profile for more detail.'

const evidenceScore = (compound: any) => {
  const text = `${compound?.evidence_grade ?? ''} ${compound?.evidenceTier ?? ''} ${compound?.tier_level ?? ''} ${compound?.evidence ?? ''} ${compound?.summary_quality ?? ''}`.toLowerCase()
  if (/strong|high|tier\s*1|a-tier|meta|rct/.test(text)) return 5
  if (/moderate|tier\s*2|human/.test(text)) return 4
  if (/limited|low|tier\s*3/.test(text)) return 2
  return 3
}

const findCompound = (compounds: any[], candidates: string[]) =>
  compounds.find((compound: any) => {
    const aliases = new Set([compound.slug, normalize(compound.slug), compound.name, compound.displayName, normalize(compound.name), normalize(compound.displayName)].filter(Boolean))
    return candidates.some(candidate => aliases.has(candidate) || aliases.has(normalize(candidate)))
  })

const getComparisonConfig = (slug: string) => supplementComparisons.find(item => item.slug === slug)

const allComparisonSlugs = Array.from(new Set([
  ...generatedComparisons,
  ...supplementComparisons.map(item => item.slug),
]))

export function generateStaticParams() {
  return allComparisonSlugs.map(slug => ({ slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const config = getComparisonConfig(slug)
  const title = config?.title ? `${config.title}: Which Is Better? | The Hippie Scientist` : `${formatSlug(slug)}: Which Is Better? | The Hippie Scientist`
  const description = config?.summary || `Compare ${formatSlug(slug)} for benefits, safety, evidence, best use cases, and supplement buying options.`

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
  const config = getComparisonConfig(slug)
  const [aSlug, bSlug] = slug.split('-vs-')
  const [compounds, stacks] = await Promise.all([getCompounds(), getStacks()])

  const a = config ? findCompound(compounds, config.a.candidates) : compounds.find((c: any) => c.slug === aSlug)
  const b = config ? findCompound(compounds, config.b.candidates) : compounds.find((c: any) => c.slug === bSlug)
  if (!a || !b) return notFound()

  const winner = evidenceScore(a) >= evidenceScore(b) ? a : b
  const loser = winner.slug === a.slug ? b : a
  const title = config?.title || `${displayName(a)} vs ${displayName(b)}`
  const pageSummary = config?.summary || `Compare ${displayName(a)} and ${displayName(b)} by evidence, fit, safety, and practical use.`

  const relatedStack = stacks.find((s: any) =>
    (s.compounds || s.stack || []).some((i: any) => {
      const compoundSlug = i.compound_slug || i.compound
      return compoundSlug === a.slug || compoundSlug === b.slug
    })
  )

  const relatedComparisons = supplementComparisons
    .filter(item => item.slug !== slug)
    .filter(item =>
      item.a.candidates.includes(a.slug) || item.b.candidates.includes(a.slug) ||
      item.a.candidates.includes(b.slug) || item.b.candidates.includes(b.slug) ||
      item.a.candidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug)) ||
      item.b.candidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug))
    )
    .slice(0, 3)

  const relatedBestPages = bestPages
    .filter(page => page.compoundCandidates.some(candidate => normalize(candidate) === normalize(a.slug) || normalize(candidate) === normalize(b.slug)))
    .slice(0, 3)

  return (
    <main className="space-y-8">
      <section className="hero-panel">
        <div className="relative max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800/70">Supplement comparison</p>
          <h1 className="mt-3 text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-7xl">{title}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{pageSummary}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-black text-slate-600">
            <span className="rounded-full border border-slate-900/10 bg-white/75 px-3 py-1.5">Decision guide</span>
            <span className="rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1.5 text-emerald-800">Evidence signals compared</span>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="soft-section bg-emerald-50/80">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-700/70">Better default</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">{displayName(winner)}</h2>
          <p className="mt-3 text-sm font-semibold leading-6 text-slate-700">Usually the better starting point based on the current evidence and profile signals.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`/compounds/${winner.slug}`} className="premium-button text-center">View full profile →</Link>
            <AffiliateBlock compound={winner.slug} compact />
          </div>
        </article>

        <article className="soft-section">
          <p className="text-xs font-black uppercase tracking-[0.18em] text-slate-500">Alternative</p>
          <h2 className="mt-2 text-3xl font-black text-slate-950">{displayName(loser)}</h2>
          <p className="mt-3 text-sm leading-6 text-slate-600">Still worth considering if it better matches your goal, tolerance, timing, or product preference.</p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            <Link href={`/compounds/${loser.slug}`} className="rounded-2xl border border-slate-900/10 bg-white px-5 py-3 text-center text-sm font-black text-slate-900 transition hover:bg-emerald-50">View profile →</Link>
            <AffiliateBlock compound={loser.slug} compact />
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        {[a, b].map((compound: any) => (
          <Link key={compound.slug} href={`/compounds/${compound.slug}`} className="premium-card block p-5 transition hover:-translate-y-0.5 hover:bg-white">
            <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700/60">Profile</p>
            <h3 className="mt-2 text-2xl font-black text-slate-950">{displayName(compound)}</h3>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-slate-600">{summary(compound)}</p>
            <div className="mt-4 flex items-center justify-between border-t border-slate-200 pt-4">
              <span className="text-xs font-black text-slate-500">Evidence signal: {evidenceScore(compound)}/5</span>
              <span className="text-sm font-black text-emerald-700">Open →</span>
            </div>
          </Link>
        ))}
      </section>

      <section className="grid gap-4 lg:grid-cols-3">
        {relatedStack && (
          <article className="soft-section">
            <h2 className="text-xl font-black text-slate-950">Use it in a routine</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">These options may make more sense inside a goal-based stack.</p>
            <Link href={`/stacks/${relatedStack.slug}`} className="mt-4 inline-flex premium-link">View stack →</Link>
          </article>
        )}

        {relatedComparisons.length > 0 && (
          <article className="soft-section">
            <h2 className="text-xl font-black text-slate-950">You may also compare</h2>
            <div className="mt-3 grid gap-2">
              {relatedComparisons.map(item => (
                <Link key={item.slug} href={`/compare/${item.slug}`} className="premium-link">{item.title} →</Link>
              ))}
            </div>
          </article>
        )}

        {relatedBestPages.length > 0 && (
          <article className="soft-section">
            <h2 className="text-xl font-black text-slate-950">Best-of guides</h2>
            <div className="mt-3 grid gap-2">
              {relatedBestPages.map(page => (
                <Link key={page.slug} href={`/best/${page.slug}`} className="premium-link">{page.title} →</Link>
              ))}
            </div>
          </article>
        )}
      </section>
    </main>
  )
}
