import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import stacksData from '@/public/data/stacks.json'
import { getCompoundSearchLinks } from '@/lib/affiliate'
import { getCompounds } from '@/lib/runtime-data'
import { supplementComparisons } from '@/data/comparisons'
import { goalConfigs } from '@/data/goals'

type Params = { params: Promise<{ slug: string }> }

type CompoundRecord = {
  slug: string
  name?: string
  displayName?: string
  summary?: string
  description?: string
  safety_notes?: string
  safetyNotes?: string
  fact_score_v2?: number | string
  factScore?: number | string
  net_score?: number | string
  evidence_grade?: string
  evidenceTier?: string | number
  tier_level?: string | number
}

type StackRecord = {
  slug: string
  title?: string
  short_description?: string
  goal?: string
  stack?: Array<{ compound?: string }>
}

const stacks = stacksData as StackRecord[]

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]/g, '')
const normalizeGoal = (value?: string) => (value ?? '').replace(/_/g, '-').toLowerCase()
const toNumber = (value: unknown) => {
  const number = Number(value)
  return Number.isFinite(number) ? number : 0
}

const compoundName = (compound: CompoundRecord) =>
  compound.displayName || compound.name || compound.slug.split('-').map((part) => part.charAt(0).toUpperCase() + part.slice(1)).join(' ')

const compoundSummary = (compound: CompoundRecord) =>
  compound.summary || compound.description || compound.safety_notes || compound.safetyNotes || 'Open the compound profile for evidence, safety, and practical context.'

const evidenceScore = (compound: CompoundRecord) => {
  const text = `${compound.evidence_grade ?? ''} ${compound.evidenceTier ?? ''} ${compound.tier_level ?? ''}`.toLowerCase()
  if (/strong|high|tier\s*1|\ba\b/.test(text)) return 4
  if (/moderate|tier\s*2|\bb\b/.test(text)) return 3
  if (/limited|low|tier\s*3|\bc\b/.test(text)) return 2
  return 1
}

const factScore = (compound: CompoundRecord) =>
  Math.max(toNumber(compound.fact_score_v2), toNumber(compound.factScore), toNumber(compound.net_score))

const decisionScore = (compound: CompoundRecord) => evidenceScore(compound) * 100 + factScore(compound)

const pickUnique = (items: Array<CompoundRecord | undefined>) => {
  const seen = new Set<string>()
  return items.filter((item): item is CompoundRecord => {
    if (!item?.slug || seen.has(item.slug)) return false
    seen.add(item.slug)
    return true
  })
}

const searchLinksFor = (compound: CompoundRecord) => getCompoundSearchLinks(compoundName(compound)).slice(0, 2)

export function generateStaticParams() {
  return goalConfigs.map((goal) => ({ slug: goal.slug }))
}

export async function generateMetadata({ params }: Params): Promise<Metadata> {
  const { slug } = await params
  const goal = goalConfigs.find((item) => item.slug === slug)
  if (!goal) return { title: 'Goal Guide | The Hippie Scientist' }

  return {
    title: `${goal.title} Decision Guide | The Hippie Scientist`,
    description: goal.summary,
  }
}

export default async function GoalPage({ params }: Params) {
  const { slug } = await params
  const goal = goalConfigs.find((item) => item.slug === slug)
  if (!goal) return notFound()

  const compounds = (await getCompounds()) as CompoundRecord[]
  const compoundLookup = new Map<string, CompoundRecord>()

  for (const compound of compounds) {
    if (!compound?.slug) continue
    compoundLookup.set(compound.slug, compound)
    compoundLookup.set(normalize(compound.slug), compound)
    if (compound.name) compoundLookup.set(normalize(compound.name), compound)
    if (compound.displayName) compoundLookup.set(normalize(compound.displayName), compound)
  }

  const relatedStacks = stacks.filter((stack) =>
    goal.stackSlugs.includes(stack.slug) || normalizeGoal(stack.goal) === goal.slug
  )

  const goalCompounds = pickUnique(
    goal.compoundCandidates.map((candidate) =>
      compoundLookup.get(candidate) ?? compoundLookup.get(normalize(candidate))
    )
  )

  const rankedCompounds = [...goalCompounds].sort((a, b) => decisionScore(b) - decisionScore(a))
  const bestOverall = rankedCompounds[0]
  const strongestEvidence = [...goalCompounds].sort((a, b) => evidenceScore(b) - evidenceScore(a) || factScore(b) - factScore(a))[0]
  const practicalPick = rankedCompounds.find((compound) => factScore(compound) > 0 && evidenceScore(compound) >= 2) ?? rankedCompounds[1]

  const decisionCards = pickUnique([bestOverall, strongestEvidence, practicalPick]).map((compound, index) => ({
    compound,
    label: index === 0 ? 'Best Overall' : index === 1 ? 'Strongest Evidence' : 'Practical Pick',
  }))

  const relatedComparisons = supplementComparisons.filter((comparison) =>
    goal.comparisonSlugs.includes(comparison.slug) ||
    goal.compoundCandidates.some((candidate) =>
      comparison.a.candidates.includes(candidate) || comparison.b.candidates.includes(candidate)
    )
  )

  return (
    <main className="space-y-10">
      <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-6">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-emerald-300">Goal decision guide</p>
        <h1 className="mt-3 text-4xl font-black text-white">{goal.title}</h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-white/75">{goal.summary}</p>
      </section>

      {decisionCards.length > 0 && (
        <section>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <h2 className="text-2xl font-bold text-white">Best picks</h2>
              <p className="mt-1 text-sm text-white/55">Decision-ranked picks with product-search CTAs.</p>
            </div>
            <p className="text-xs text-white/45">Affiliate links may support the site at no extra cost.</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-3">
            {decisionCards.map(({ compound, label }) => (
              <article
                key={`${label}-${compound.slug}`}
                className="rounded-2xl border border-emerald-300/25 bg-emerald-300/[0.06] p-5"
              >
                <p className="text-xs font-bold uppercase tracking-[0.18em] text-emerald-200">{label}</p>
                <h3 className="mt-2 text-lg font-bold text-white">{compoundName(compound)}</h3>
                <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/65">{compoundSummary(compound)}</p>
                <p className="mt-3 text-xs text-white/50">Evidence score {evidenceScore(compound)} · Fact score {factScore(compound)}</p>
                <div className="mt-4 flex flex-wrap gap-2">
                  <Link href={`/compounds/${compound.slug}`} className="rounded-full border border-white/10 px-3 py-1.5 text-xs font-semibold text-white/75 hover:border-emerald-300/40 hover:text-emerald-200">
                    View evidence
                  </Link>
                  {searchLinksFor(compound).map((link) => (
                    <a
                      key={link.label}
                      href={link.url}
                      className="rounded-full bg-emerald-300 px-3 py-1.5 text-xs font-bold text-black hover:bg-emerald-200"
                      rel="nofollow sponsored noopener noreferrer"
                      target="_blank"
                    >
                      Search {link.label}
                    </a>
                  ))}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      <section>
        <h2 className="text-2xl font-bold text-white">Related stacks</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2">
          {relatedStacks.length > 0 ? (
            relatedStacks.map((stack) => (
              <Link key={stack.slug} href={`/stacks/${stack.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
                <h3 className="font-bold text-white">{stack.title ?? stack.slug}</h3>
                <p className="mt-2 text-sm text-white/65">{stack.short_description ?? 'Open this stack for dosage, timing, and compound context.'}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">View stack →</span>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 p-5 text-sm text-white/65">No dedicated stack is published for this goal yet. Start with the compounds below.</div>
          )}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Top related compounds</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {rankedCompounds.slice(0, 9).map((compound) => (
            <article key={compound.slug} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
              <h3 className="font-bold text-white">{compoundName(compound)}</h3>
              <p className="mt-2 line-clamp-3 text-sm leading-6 text-white/65">{compoundSummary(compound)}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <Link href={`/compounds/${compound.slug}`} className="text-sm font-semibold text-emerald-300">View compound →</Link>
                <a
                  href={searchLinksFor(compound)[0]?.url}
                  className="text-sm font-semibold text-white/65 hover:text-emerald-200"
                  rel="nofollow sponsored noopener noreferrer"
                  target="_blank"
                >
                  Search supplement →
                </a>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section>
        <h2 className="text-2xl font-bold text-white">Related comparisons</h2>
        <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {relatedComparisons.length > 0 ? (
            relatedComparisons.map((comparison) => (
              <Link key={comparison.slug} href={`/compare/${comparison.slug}`} className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 hover:border-emerald-300/40">
                <h3 className="font-bold text-white">{comparison.title}</h3>
                <p className="mt-2 text-sm text-white/65">{comparison.summary}</p>
                <span className="mt-3 inline-block text-sm font-semibold text-emerald-300">Compare →</span>
              </Link>
            ))
          ) : (
            <div className="rounded-2xl border border-white/10 p-5 text-sm text-white/65">No direct comparison page is published for this goal yet.</div>
          )}
        </div>
      </section>

      <section className="rounded-3xl border border-amber-300/20 bg-amber-300/[0.06] p-5">
        <h2 className="font-bold text-amber-100">Safety note</h2>
        <p className="mt-2 text-sm leading-6 text-white/75">{goal.safetyNote}</p>
      </section>

      <section className="flex flex-wrap gap-3">
        <Link href="/stacks" className="rounded-full border border-emerald-300/40 px-4 py-2 text-sm font-semibold text-emerald-200 hover:bg-emerald-300/10">Browse stacks</Link>
        <Link href="/compounds" className="rounded-full border border-white/10 px-4 py-2 text-sm font-semibold text-white/75 hover:bg-white/10">Browse compounds</Link>
      </section>
    </main>
  )
}
