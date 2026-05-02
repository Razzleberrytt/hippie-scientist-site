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
  `${label} is in the compound library. Use the related stacks, goals, comparisons, and product-search links below to decide whether it deserves a deeper look.`

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

  const title = `${label} Benefits, Facts, and Safety`
  const description = `Evidence-backed facts, safety notes, related goals, stacks, comparisons, and supplement search paths for ${label.toLowerCase()}.`

  return {
    title,
    description,
    openGraph: {
      title,
      description,
    },
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

  return (
    <main className="space-y-8">
      <section className="relative overflow-hidden rounded-[2rem] border border-emerald-300/15 bg-[radial-gradient(circle_at_top_left,rgba(52,211,153,0.18),transparent_34%),linear-gradient(135deg,rgba(255,255,255,0.075),rgba(255,255,255,0.025))] p-5 shadow-2xl shadow-emerald-950/20 sm:p-8">
        <div className="absolute -right-10 -top-10 h-56 w-56 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative grid gap-6 lg:grid-cols-[1.15fr_0.85fr] lg:items-end">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.26em] text-emerald-200/75">Compound decision page</p>
            <h1 className="mt-3 text-4xl font-black tracking-tight text-white sm:text-6xl">{label}</h1>
            <p className="mt-4 max-w-3xl text-sm leading-7 text-white/72 sm:text-base">{summary}</p>
          </div>

          <div className="grid grid-cols-3 gap-2 rounded-3xl border border-white/10 bg-black/25 p-2 text-center backdrop-blur">
            <div className="rounded-2xl bg-white/[0.055] px-3 py-3">
              <div className="text-xl font-black text-white">{relatedStacks.length}</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-white/45">Stacks</div>
            </div>
            <div className="rounded-2xl bg-emerald-300/10 px-3 py-3">
              <div className="text-xl font-black text-emerald-100">{relatedGoals.length}</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-100/55">Goals</div>
            </div>
            <div className="rounded-2xl bg-amber-300/10 px-3 py-3">
              <div className="text-xl font-black text-amber-100">{factScore ?? '—'}</div>
              <div className="text-[0.68rem] font-bold uppercase tracking-[0.16em] text-amber-100/55">Fact</div>
            </div>
          </div>
        </div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.9fr_1.1fr]">
        <article className="rounded-[1.75rem] border border-white/10 bg-white/[0.035] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-white/45">Evidence snapshot</p>
          <h2 className="mt-3 text-2xl font-black text-white">What to check first</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/42">Evidence</p>
              <p className="mt-2 text-lg font-black text-emerald-100">{String(evidenceLabel)}</p>
            </div>
            <div className="rounded-2xl border border-white/10 bg-black/20 p-4">
              <p className="text-xs font-bold uppercase tracking-[0.16em] text-white/42">Practical use</p>
              <p className="mt-2 text-sm leading-6 text-white/68">Use goals and stacks below before jumping to products.</p>
            </div>
          </div>
        </article>

        <article className="rounded-[1.75rem] border border-amber-300/20 bg-amber-300/[0.06] p-5">
          <p className="text-xs font-black uppercase tracking-[0.2em] text-amber-100/65">Safety first</p>
          <h2 className="mt-3 text-2xl font-black text-amber-50">Before buying</h2>
          <p className="mt-3 text-sm leading-7 text-white/74">{safety}</p>
        </article>
      </section>

      {relatedStacks.length > 0 ? (
        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-black text-white">Used in these stacks</h2>
              <p className="mt-1 text-sm text-white/55">Best path: read the stack before deciding whether this compound fits.</p>
            </div>
            <Link href="/stacks" className="text-sm font-black text-emerald-200 hover:text-emerald-100">Browse all stacks →</Link>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedStacks.map((stack) => {
              const stackItem = stack.stack.find((item: any) => matchesCompound(item.compound, aliases))
              return (
                <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="group rounded-[1.5rem] border border-emerald-300/18 bg-emerald-300/[0.055] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/40">
                  <p className="text-xs font-black uppercase tracking-[0.18em] text-emerald-100/60">{formatName(stack.goal || stack.slug)}</p>
                  <h3 className="mt-2 text-xl font-black text-white group-hover:text-emerald-100">{stack.title}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/62">{stack.short_description}</p>
                  {stackItem ? (
                    <div className="mt-4 rounded-2xl border border-white/10 bg-black/20 p-3 text-xs text-white/62">
                      <span className="font-black text-white">{formatName(stackItem.role || 'included')}:</span> {stackItem.dosage || 'dose listed in stack'} · {stackItem.timing || 'timing listed in stack'}
                    </div>
                  ) : null}
                  <span className="mt-4 inline-flex text-sm font-black text-emerald-200 transition group-hover:translate-x-1">See dosage, timing & risks →</span>
                </Link>
              )
            })}
          </div>
        </section>
      ) : null}

      {relatedGoals.length > 0 ? (
        <section>
          <h2 className="text-2xl font-black text-white">Related goals</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedGoals.map((goal) => (
              <Link key={goal.slug} href={`/goals/${goal.slug}`} className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/35">
                <h3 className="text-xl font-black text-white">{goal.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{goal.summary}</p>
                <span className="mt-4 inline-flex text-sm font-black text-emerald-200">Open goal guide →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      {relatedComparisons.length > 0 ? (
        <section>
          <h2 className="text-2xl font-black text-white">Compare before choosing</h2>
          <div className="mt-4 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {relatedComparisons.map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-[1.5rem] border border-white/10 bg-white/[0.035] p-5 transition hover:-translate-y-0.5 hover:border-emerald-300/35">
                <h3 className="text-xl font-black text-white">{comparison.title}</h3>
                <p className="mt-2 text-sm leading-6 text-white/62">{comparison.summary}</p>
                <span className="mt-4 inline-flex text-sm font-black text-emerald-200">Compare options →</span>
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <section className="rounded-[1.75rem] border border-emerald-300/20 bg-emerald-300/[0.06] p-5">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-100/65">Product research</p>
            <h2 className="mt-2 text-2xl font-black text-white">Ready to compare products?</h2>
            <p className="mt-2 text-sm leading-6 text-white/62">Use this after checking the stack and safety context above. Affiliate links may support the site at no extra cost.</p>
          </div>
          <div className="flex flex-wrap gap-2">
            {links.map((link) => (
              <a
                key={link.label}
                href={link.url}
                target="_blank"
                rel="nofollow sponsored noopener noreferrer"
                className="rounded-full bg-emerald-300 px-4 py-2 text-sm font-black text-slate-950 transition hover:bg-emerald-200"
              >
                Search {link.label}
              </a>
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}
