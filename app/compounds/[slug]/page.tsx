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
  `${label} is in the compound library. Use stack context, safety notes, and comparisons before choosing a product format.`

const getSafety = (compound: any) =>
  usable(compound?.safety_summary) ||
  usable(compound?.safety_notes) ||
  usable(compound?.safetyNotes) ||
  usable(compound?.avoid_if) ||
  usable(compound?.contraindications_interactions) ||
  'Review dose, medication interactions, pregnancy status, medical conditions, and tolerance before using any supplement.'

const getEvidenceLabel = (compound: any) => {
  const label = usable(compound?.evidence_grade) || usable(compound?.evidenceTier) || usable(compound?.tier_level) || usable(compound?.summary_quality)
  return label && !/needs review/i.test(label) ? label : 'Still being evaluated'
}

const getEvidenceTone = (label: string) => {
  const text = label.toLowerCase()
  if (/strong|high|tier\s*1|a-tier|rct|meta/.test(text)) return 'Strong human evidence signal'
  if (/moderate|tier\s*2|human/.test(text)) return 'Moderate evidence signal'
  if (/limited|low|tier\s*3/.test(text)) return 'Limited evidence signal'
  return 'Evidence still being evaluated'
}

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

const getQuickTake = (compound: any, decisionFacts: Array<[string, string]>) => {
  const bestFor = decisionFacts.find(([name]) => name === 'Best for')?.[1]
  const onset = decisionFacts.find(([name]) => name === 'Onset')?.[1]
  const form = decisionFacts.find(([name]) => name === 'Common form')?.[1]

  return [
    bestFor ? `Best used when: ${bestFor}` : 'Best used after checking whether it fits your goal and safety context.',
    onset ? `Expected timing: ${onset}` : 'Expected timing may vary, so compare it with more established options first.',
    form ? `Common form: ${form}` : 'Check the product format before assuming dose or quality.',
  ]
}

const getBestForm = (compound: any, label: string) => {
  const explicit = usable(compound?.oral_form) || usable(compound?.form) || usable(compound?.common_form)
  if (explicit) return explicit

  const text = `${label} ${compound?.slug ?? ''} ${compound?.summary ?? ''}`.toLowerCase()
  if (/omega|oil|fatty acid|fish/.test(text)) return 'Softgels or oil are usually the most practical format.'
  if (/creatine|protein|collagen|fiber|psyllium/.test(text)) return 'Powder is usually best when flexible dosing matters.'
  if (/extract|ashwagandha|rhodiola|bacopa|curcumin|boswellia/.test(text)) return 'Look for a clearly labeled standardized extract.'
  return 'Capsules are usually the simplest default; powder can help when dose flexibility matters.'
}

const getAvoidIf = (compound: any) =>
  usable(compound?.avoid_if) ||
  usable(compound?.contraindications_interactions) ||
  usable(compound?.cautionSignals) ||
  'Avoid guessing if you are pregnant, using medications, managing a medical condition, or sensitive to supplements.'

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
  const evidenceTone = getEvidenceTone(evidenceLabel)
  const factScore = getFactScore(compound)
  const decisionFacts = getDecisionFacts(compound)
  const quickTake = getQuickTake(compound, decisionFacts)
  const bestFor = decisionFacts.find(([name]) => name === 'Best for')?.[1] || 'People comparing it against their goal, safety context, and routine fit.'
  const avoidIf = getAvoidIf(compound)
  const bestForm = getBestForm(compound, label)

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
    <main className="space-y-8">
      <section className="hero-panel">
        <div className="relative max-w-4xl">
          <p className="text-xs font-black uppercase tracking-[0.22em] text-emerald-800/70">Compound guide</p>
          <h1 className="mt-3 text-5xl font-black leading-[0.95] tracking-tight text-slate-950 sm:text-7xl">{label}</h1>
          <p className="mt-5 max-w-3xl text-lg leading-8 text-slate-700">{summary}</p>
          <div className="mt-5 flex flex-wrap gap-2 text-xs font-black text-slate-600">
            <span className="rounded-full border border-slate-900/10 bg-white/75 px-3 py-1.5">{evidenceTone}</span>
            {relatedStacks.length > 0 ? <span className="rounded-full border border-emerald-900/10 bg-emerald-50 px-3 py-1.5 text-emerald-800">{relatedStacks.length} stack{relatedStacks.length === 1 ? '' : 's'}</span> : null}
            {factScore ? <span className="rounded-full border border-amber-900/10 bg-amber-100 px-3 py-1.5 text-amber-900">Score: {factScore}</span> : null}
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="soft-section">
          <h2 className="text-2xl font-black text-slate-950">Quick take</h2>
          <ul className="mt-4 space-y-3">
            {quickTake.map(item => (
              <li key={item} className="flex gap-3 text-sm font-semibold leading-6 text-slate-700">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-emerald-500" />
                <span>{item}</span>
              </li>
            ))}
          </ul>
        </article>

        <article className="soft-section bg-emerald-50/80">
          <h2 className="text-2xl font-black text-slate-950">What to do next</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">
            {primaryStack ? 'Start with the related routine so this compound has timing, dose, and safety context.' : 'Use comparisons and goal context before choosing a product.'}
          </p>
          <div className="mt-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {primaryStack ? <Link href={`/stacks/${primaryStack.slug}`} className="premium-button text-center">View related stack →</Link> : null}
            {primaryGoal ? <Link href={`/goals/${primaryGoal.slug}`} className="rounded-2xl border border-slate-900/10 bg-white px-5 py-3 text-center text-sm font-black text-slate-900 transition hover:bg-emerald-50">Open goal guide →</Link> : null}
            {relatedComparisons[0] ? <Link href={`/compare/${relatedComparisons[0].slug}`} className="rounded-2xl border border-slate-900/10 bg-white px-5 py-3 text-center text-sm font-black text-slate-900 transition hover:bg-emerald-50">Compare options →</Link> : null}
            {!primaryStack && !primaryGoal ? <Link href="/stacks" className="premium-button text-center">Browse routines →</Link> : null}
          </div>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-3">
        <article className="soft-section">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700/60">Authority</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Evidence clarity</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-black">Current level:</span> {String(evidenceLabel)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">This reflects available evidence signals and profile quality, not marketing claims.</p>
        </article>
        <article className="soft-section bg-emerald-50/80">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700/60">Fit</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Best for</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{bestFor}</p>
        </article>
        <article className="soft-section bg-amber-50/80">
          <p className="text-xs font-black uppercase tracking-[0.16em] text-amber-700/60">Safety</p>
          <h2 className="mt-1 text-xl font-black text-slate-950">Avoid if</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{avoidIf}</p>
        </article>
      </section>

      <section className="grid gap-4 md:grid-cols-[0.8fr_1.2fr]">
        <article className="soft-section">
          <h2 className="text-2xl font-black text-slate-950">Best form to look for</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{bestForm}</p>
          <ul className="mt-4 space-y-2 text-sm leading-6 text-slate-600">
            <li>• Prefer clearly labeled ingredient amounts.</li>
            <li>• Avoid proprietary blends with hidden doses.</li>
            <li>• Match the form to how you will actually use it.</li>
          </ul>
        </article>

        <article className="soft-section">
          <h2 className="text-2xl font-black text-slate-950">Find a good option</h2>
          <p className="mt-2 text-sm leading-6 text-slate-600">After checking safety and fit, compare available forms and products. Affiliate links may support the site at no extra cost.</p>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {links.map((link) => (
              <a key={link.label} href={link.url} target="_blank" rel="nofollow sponsored noopener noreferrer" className="premium-card block p-4 transition hover:-translate-y-0.5 hover:bg-white">
                <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700/60">Product search</p>
                <h3 className="mt-1 text-lg font-black text-slate-950">{link.label}</h3>
                <p className="mt-2 text-sm leading-6 text-slate-600">Look for transparent labeling, appropriate form, and reasonable dosing.</p>
                <span className="mt-3 inline-flex text-sm font-black text-emerald-700">View options →</span>
              </a>
            ))}
          </div>
        </article>
      </section>

      {decisionFacts.length > 0 ? (
        <section className="soft-section">
          <h2 className="text-2xl font-black text-slate-950">Decision facts</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {decisionFacts.slice(0, 6).map(([name, value]) => (
              <div key={name} className="rounded-2xl border border-slate-900/10 bg-white/75 p-4">
                <p className="text-xs font-black uppercase tracking-[0.14em] text-slate-500">{name}</p>
                <p className="mt-1 text-sm leading-6 text-slate-700">{value}</p>
              </div>
            ))}
          </div>
        </section>
      ) : null}

      <section className="grid gap-4 md:grid-cols-2">
        <article className="soft-section">
          <h2 className="text-2xl font-black text-slate-950">Evidence context</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700"><span className="font-black text-slate-950">Status:</span> {String(evidenceLabel)}</p>
          <p className="mt-2 text-sm leading-6 text-slate-600">Use comparisons and stack context to guide your decision while the evidence profile is refined.</p>
        </article>
        <article className="soft-section bg-amber-50/80">
          <h2 className="text-2xl font-black text-slate-950">Safety first</h2>
          <p className="mt-3 text-sm leading-6 text-slate-700">{safety}</p>
        </article>
      </section>

      {relatedStacks.length > 0 ? (
        <section>
          <div className="flex items-end justify-between gap-3">
            <div>
              <h2 className="text-3xl font-black text-slate-950">Used in routines</h2>
              <p className="mt-1 text-sm text-slate-600">The most practical way to use this compound.</p>
            </div>
            <Link href="/stacks" className="text-sm font-black text-emerald-700">All stacks →</Link>
          </div>
          <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {relatedStacks.slice(0, 3).map((stack) => {
              const stackItem = stack.stack.find((item: any) => matchesCompound(item.compound, aliases))
              return (
                <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="premium-card block p-5 transition hover:-translate-y-0.5 hover:bg-white">
                  <p className="text-xs font-black uppercase tracking-[0.16em] text-emerald-700/60">{formatName(stack.goal || stack.slug)}</p>
                  <h3 className="mt-2 text-lg font-black text-slate-950">{stack.title}</h3>
                  <p className="mt-2 line-clamp-2 text-sm leading-6 text-slate-600">{stack.short_description}</p>
                  {stackItem ? <p className="mt-3 text-xs text-slate-500"><span className="font-black text-slate-700">{formatName(stackItem.role || 'included')}:</span> {stackItem.dosage || 'dose listed'} · {stackItem.timing || 'timing listed'}</p> : null}
                  <span className="mt-3 inline-flex text-sm font-black text-emerald-700">See stack →</span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {relatedComparisons.length > 0 ? (
        <section className="rounded-[2rem] bg-slate-950 p-5 text-white sm:p-6">
          <h2 className="text-3xl font-black text-white">Compare before choosing</h2>
          <div className="mt-4 grid gap-3 md:grid-cols-2">
            {relatedComparisons.slice(0, 2).map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.06] p-4 transition hover:bg-white/[0.1]">
                <h3 className="text-lg font-black text-white">{comparison.title}</h3>
                <p className="mt-2 line-clamp-2 text-sm leading-6 text-white/65">{comparison.summary}</p>
                <span className="mt-3 inline-flex text-sm font-black text-emerald-200">Compare →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}
    </main>
  )
}
