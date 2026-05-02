import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getCompoundBySlug, getCompounds } from '@/lib/runtime-data'
import stacksData from '@/public/data/stacks.json'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'
import { getCompoundSearchLinks } from '@/lib/affiliate'

const stacks = stacksData as any[]

const PLACEHOLDER_PATTERNS = [/coming soon/i, /bulk mode/i, /placeholder/i, /^n\/?a$/i, /^unknown$/i, /^tbd$/i]

const clean = (value: unknown): string => {
  if (value === null || value === undefined) return ''
  if (Array.isArray(value)) return value.map(clean).filter(Boolean).join(', ')
  if (typeof value === 'object') return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

const usable = (value: unknown): string => {
  const text = clean(value)
  if (!text) return ''
  return PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text)) ? '' : text
}

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
  usable(compound?.summary) ||
  usable(compound?.description) ||
  usable(compound?.evidence_summary) ||
  usable(compound?.mechanism_summary) ||
  usable(compound?.safety_summary) ||
  `${label} is in the compound library. Use the related stack, evidence snapshot, and safety notes before comparing products.`

const getSafety = (compound: any) =>
  usable(compound?.safety_summary) ||
  usable(compound?.safety_notes) ||
  usable(compound?.safetyNotes) ||
  usable(compound?.avoid_if) ||
  usable(compound?.contraindications_interactions) ||
  'Review dosage, medication interactions, pregnancy status, medical conditions, and tolerance before using any supplement.'

const getEvidenceLabel = (compound: any) =>
  usable(compound?.evidence_grade) || usable(compound?.evidenceTier) || usable(compound?.tier_level) || usable(compound?.summary_quality) || 'Needs review'

const getFactScore = (compound: any) => {
  const value = Number(compound?.fact_score_v2 ?? compound?.factScore ?? compound?.net_score ?? 0)
  return Number.isFinite(value) && value > 0 ? value : null
}

const getDecisionFacts = (compound: any) => [
  usable(compound?.best_for) ? ['Best for', usable(compound.best_for)] : null,
  usable(compound?.time_to_effect) ? ['Onset', usable(compound.time_to_effect)] : null,
  usable(compound?.duration) ? ['Duration', usable(compound.duration)] : null,
  usable(compound?.dosage_range) ? ['Typical dose', usable(compound.dosage_range)] : null,
  usable(compound?.oral_form) ? ['Common form', usable(compound.oral_form)] : null,
].filter(Boolean) as Array<[string, string]>

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
  const links = getCompoundSearchLinks(label).slice(0, 2)
  const summary = getSummary(compound, label)
  const safety = getSafety(compound)
  const evidenceLabel = getEvidenceLabel(compound)
  const factScore = getFactScore(compound)
  const decisionFacts = getDecisionFacts(compound)

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
  const primaryProduct = links[0]

  return (
    <main className="space-y-5">
      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5 sm:p-6">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-100/60">Compound guide</p>
        <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-5xl">{label}</h1>
        <p className="mt-3 max-w-3xl text-base leading-7 text-white/68">{summary}</p>
        <div className="mt-4 flex flex-wrap gap-2 text-xs font-bold text-white/55">
          <span className="rounded-full border border-white/10 px-3 py-1.5">Evidence: {String(evidenceLabel)}</span>
          {relatedStacks.length > 0 ? <span className="rounded-full border border-white/10 px-3 py-1.5">{relatedStacks.length} stack{relatedStacks.length === 1 ? '' : 's'}</span> : null}
          {factScore ? <span className="rounded-full border border-amber-200/20 px-3 py-1.5 text-amber-100">Score: {factScore}</span> : null}
        </div>
      </section>

      <section className="rounded-2xl border border-emerald-200/15 bg-emerald-200/[0.045] p-5">
        <h2 className="text-2xl font-black text-white">Best next step</h2>
        <p className="mt-2 text-sm leading-6 text-white/66">
          {primaryStack ? 'Use the full stack first so this compound fits into dosage, timing, and safety context.' : 'No stack is linked yet, so check the evidence and safety notes before comparing products.'}
        </p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {primaryStack ? <Link href={`/stacks/${primaryStack.slug}`} className="premium-button text-center">View best stack →</Link> : null}
          {primaryGoal ? <Link href={`/goals/${primaryGoal.slug}`} className="rounded-xl border border-white/10 px-5 py-3 text-center text-sm font-black text-white/80 hover:bg-white/5">Open goal guide →</Link> : null}
          {!primaryStack && primaryProduct ? <a href={primaryProduct.url} target="_blank" rel="nofollow sponsored noopener noreferrer" className="premium-button text-center">Compare products →</a> : null}
        </div>
      </section>

      {decisionFacts.length > 0 ? (
        <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <h2 className="text-xl font-black text-white">Quick decision facts</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {decisionFacts.slice(0, 6).map(([name, value]) => (
              <div key={name} className="rounded-xl border border-white/10 bg-black/15 p-3">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-white/38">{name}</p>
                <p className="mt-1 text-sm leading-6 text-white/75">{value}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
          <h2 className="text-xl font-black text-white">Evidence snapshot</h2>
          <p className="mt-3 text-sm leading-6 text-white/70"><span className="font-bold text-white">Evidence:</span> {String(evidenceLabel)}</p>
          <p className="mt-2 text-sm leading-6 text-white/62"><span className="font-bold text-white">Best path:</span> stack first, product second.</p>
        </article>
        <article className="rounded-2xl border border-amber-200/15 bg-amber-200/[0.04] p-5">
          <h2 className="text-xl font-black text-white">Safety first</h2>
          <p className="mt-3 text-sm leading-6 text-white/70">{safety}</p>
        </article>
      </section>

      {relatedStacks.length > 0 ? (
        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-2xl font-black text-white">Used in stacks</h2>
              <p className="mt-1 text-sm text-white/50">The most practical way to use this compound.</p>
            </div>
            <Link href="/stacks" className="text-sm font-bold text-emerald-200">All stacks →</Link>
          </div>
          <div className="mt-3 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relatedStacks.slice(0, 3).map((stack) => {
              const stackItem = stack.stack.find((item: any) => matchesCompound(item.compound, aliases))
              return (
                <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-emerald-200/30 hover:bg-white/[0.04]">
                  <p className="text-xs font-bold uppercase tracking-[0.16em] text-emerald-100/55">{formatName(stack.goal || stack.slug)}</p>
                  <h3 className="mt-2 text-lg font-black text-white">{stack.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">{stack.short_description}</p>
                  {stackItem ? <p className="mt-3 text-xs text-white/52"><span className="font-bold text-white/75">{formatName(stackItem.role || 'included')}:</span> {stackItem.dosage || 'dose listed'} · {stackItem.timing || 'timing listed'}</p> : null}
                  <span className="mt-3 inline-flex text-sm font-bold text-emerald-200">See stack →</span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {relatedComparisons.length > 0 ? (
        <section>
          <h2 className="text-2xl font-black text-white">Compare before choosing</h2>
          <div className="mt-3 grid gap-3 md:grid-cols-2">
            {relatedComparisons.slice(0, 2).map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.025] p-4 transition hover:border-emerald-200/30 hover:bg-white/[0.04]">
                <h3 className="text-lg font-black text-white">{comparison.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/58">{comparison.summary}</p>
                <span className="mt-3 inline-flex text-sm font-bold text-emerald-200">Compare →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-2xl border border-white/10 bg-white/[0.025] p-5">
        <h2 className="text-2xl font-black text-white">Product search</h2>
        <p className="mt-2 text-sm leading-6 text-white/58">Use this after checking stack fit and safety context. Affiliate links may support the site at no extra cost.</p>
        <div className="mt-4 flex flex-col gap-2 sm:flex-row sm:flex-wrap">
          {links.map((link) => (
            <a key={link.label} href={link.url} target="_blank" rel="nofollow sponsored noopener noreferrer" className="rounded-xl bg-emerald-200 px-4 py-3 text-center text-sm font-black text-slate-950 transition hover:bg-emerald-100">
              Search {link.label} →
            </a>
          ))}
        </div>
      </section>
    </main>
  )
}
