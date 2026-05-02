import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import { getCompoundSearchLinks } from '@/lib/affiliate'

const stacks = stacksData as any[]

const formatName = (slug: string) =>
  slug
    .split('-')
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const normalize = (value?: string) => (value ?? '').toLowerCase().replace(/[^a-z0-9]/g, '')

const getCompoundAliases = (compound: any, slug: string) =>
  new Set([
    slug,
    normalize(slug),
    compound?.name,
    compound?.displayName,
    normalize(compound?.name),
    normalize(compound?.displayName),
  ].filter(Boolean))

const matchesCompound = (candidate: string | undefined, aliases: Set<string>) => {
  if (!candidate) return false
  return aliases.has(candidate) || aliases.has(normalize(candidate))
}

const getSummary = (compound: any, label: string) =>
  compound?.summary ||
  compound?.description ||
  compound?.evidence_summary ||
  compound?.mechanism_summary ||
  `${label} is a supplement compound. Start with the related stack, then compare options before buying.`

const getSafety = (compound: any) =>
  compound?.safety_notes ||
  compound?.safetyNotes ||
  compound?.safety_summary ||
  compound?.contraindications_interactions ||
  'Review dosage, medication interactions, pregnancy status, medical conditions, and tolerance before using any supplement.'

const getEvidenceLabel = (compound: any) =>
  compound?.evidence_grade || compound?.evidenceTier || compound?.tier_level || compound?.summary_quality || 'Needs review'

const getFactScore = (compound: any) => {
  const value = Number(compound?.fact_score_v2 ?? compound?.factScore ?? compound?.net_score ?? 0)
  return Number.isFinite(value) && value > 0 ? value : null
}

export async function generateStaticParams() {
  const compounds = await getCompounds()
  return compounds.map((compound: any) => ({ slug: compound.slug }))
}

export async function generateMetadata({ params }: any): Promise<Metadata> {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  const label = compound?.displayName || compound?.name || formatName(slug)

  return {
    title: `${label} Benefits, Facts, and Safety`,
    description: `Evidence-backed facts, safety notes, related goals, stacks, comparisons, and supplement search paths for ${label.toLowerCase()}.`,
  }
}

export default async function Page({ params }: any) {
  const { slug } = await params
  const compound = await getCompoundBySlug(slug)
  if (!compound) notFound()

  const label = compound.displayName || compound.name || formatName(slug)
  const aliases = getCompoundAliases(compound, slug)
  const links = getCompoundSearchLinks(label).slice(0, 3)
  const summary = getSummary(compound, label)
  const safety = getSafety(compound)
  const evidenceLabel = getEvidenceLabel(compound)
  const factScore = getFactScore(compound)

  const relatedStacks = stacks.filter((stack) =>
    Array.isArray(stack.stack) && stack.stack.some((item: any) => matchesCompound(item.compound, aliases))
  )

  const relatedGoals = goalConfigs.filter((goal) =>
    goal.compoundCandidates.some((candidate) => matchesCompound(candidate, aliases)) ||
    goal.stackSlugs.some((stackSlug) => relatedStacks.some((stack) => stack.slug === stackSlug))
  )

  const relatedComparisons = supplementComparisons.filter((comparison) =>
    comparison.a.candidates.some((candidate) => matchesCompound(candidate, aliases)) ||
    comparison.b.candidates.some((candidate) => matchesCompound(candidate, aliases))
  )

  const primaryStack = relatedStacks[0]
  const primaryGoal = relatedGoals[0]

  return (
    <main className="space-y-6">
      <section className="rounded-3xl border border-emerald-300/15 bg-white/[0.035] p-5 sm:p-7">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-200/70">Compound guide</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{label}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/70">{summary}</p>

        <div className="mt-5 flex flex-wrap gap-2 text-xs font-bold text-white/70">
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">Evidence: {String(evidenceLabel)}</span>
          <span className="rounded-full border border-white/10 bg-black/20 px-3 py-1.5">Stacks: {relatedStacks.length}</span>
          {factScore ? <span className="rounded-full border border-amber-300/20 bg-amber-300/10 px-3 py-1.5 text-amber-100">Fact: {factScore}</span> : null}
        </div>
      </section>

      <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.055] p-5">
        <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/70">Best next step</p>
        <h2 className="mt-2 text-2xl font-black text-white">Do not start with products first</h2>
        <p className="mt-2 text-sm leading-6 text-white/70">Use the stack or goal page first so dosage, timing, and safety make sense before buying.</p>
        <div className="mt-4 flex flex-wrap gap-3">
          {primaryStack ? (
            <Link href={`/stacks/${primaryStack.slug}`} className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-black text-black">View best stack →</Link>
          ) : null}
          {primaryGoal ? (
            <Link href={`/goals/${primaryGoal.slug}`} className="rounded-full border border-emerald-300/30 px-4 py-2 text-sm font-black text-emerald-100">Open goal guide →</Link>
          ) : null}
        </div>
      </section>

      <section className="grid gap-4 md:grid-cols-2">
        <article className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
          <h2 className="text-xl font-black text-white">What to check first</h2>
          <div className="mt-4 grid gap-3 text-sm text-white/70">
            <p><span className="font-bold text-white">Evidence:</span> {String(evidenceLabel)}</p>
            <p><span className="font-bold text-white">Best path:</span> stack first, product second.</p>
          </div>
        </article>
        <article className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.055] p-5">
          <h2 className="text-xl font-black text-white">Safety first</h2>
          <p className="mt-3 text-sm leading-6 text-white/72">{safety}</p>
        </article>
      </section>

      {relatedStacks.length > 0 ? (
        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">Used in stacks</h2>
              <p className="mt-1 text-sm text-white/55">This is where the compound becomes practical.</p>
            </div>
            <Link href="/stacks" className="text-sm font-black text-emerald-200">All stacks →</Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relatedStacks.slice(0, 3).map((stack) => {
              const stackItem = stack.stack.find((item: any) => matchesCompound(item.compound, aliases))
              return (
                <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-3xl border border-white/10 bg-white/[0.035] p-4 transition hover:border-emerald-300/35">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-100/60">{formatName(stack.goal || stack.slug)}</p>
                  <h3 className="mt-2 text-lg font-black text-white">{stack.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{stack.short_description}</p>
                  {stackItem ? <p className="mt-3 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/62"><span className="font-black text-white">{formatName(stackItem.role || 'included')}:</span> {stackItem.dosage || 'dose listed'} · {stackItem.timing || 'timing listed'}</p> : null}
                  <span className="mt-3 inline-flex text-sm font-black text-emerald-200">See stack →</span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {relatedGoals.length > 0 ? (
        <section>
          <h2 className="text-2xl font-black text-white">Related goals</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relatedGoals.slice(0, 2).map((goal) => (
              <Link key={goal.slug} href={`/goals/${goal.slug}`} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-300/35">
                <h3 className="text-lg font-black text-white">{goal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{goal.summary}</p>
                <span className="mt-3 inline-flex text-sm font-black text-emerald-200">Open guide →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedComparisons.length > 0 ? (
        <section>
          <h2 className="text-2xl font-black text-white">Compare before choosing</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relatedComparisons.slice(0, 2).map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-3xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-300/35">
                <h3 className="text-lg font-black text-white">{comparison.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{comparison.summary}</p>
                <span className="mt-3 inline-flex text-sm font-black text-emerald-200">Compare →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-3xl border border-emerald-300/20 bg-emerald-300/[0.055] p-5">
        <h2 className="text-2xl font-black text-white">Ready to compare products?</h2>
        <p className="mt-2 text-sm leading-6 text-white/62">Use this after checking the stack and safety context. Affiliate links may support the site at no extra cost.</p>
        <div className="mt-4 flex flex-wrap gap-2">
          {links.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="nofollow sponsored noopener noreferrer" className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-emerald-200">
              Search {link.label}
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
