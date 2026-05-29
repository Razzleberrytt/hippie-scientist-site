import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGoal, goals } from '@/data/goals'
import { getHerbBySlug, getCompoundBySlug } from '@/lib/runtime-data'
import { normalizeDecisionEvidence, normalizeDecisionSafety } from '@/lib/decision-primitives'
import { SITE_URL, faqPageJsonLd, breadcrumbJsonLd, collectionPageJsonLd, itemListJsonLd } from '@/lib/seo'
import { rankEntitiesForGoal } from '@/lib/goal-matching-engine'

type GoalRouteParams = { goal: string }
type RuntimeCompound = Record<string, any>

type EnrichedGoalOption = {
  option: {
    slug: string
    name: string
    bestFor: string
    speed: string
    evidence: string
    risk: string
    avoidIf: string
    whyPeopleStop: string
    form: string
  }
  compound?: RuntimeCompound
  profileHref: string
  evidenceLabel: string
  safetyLabel: string
  mechanismTags: string[]
  mechanismCategoryTags: string[]
  pathwayTags: string[]
}

const cleanList = (value: unknown): string[] => {
  if (Array.isArray(value)) {
    return value
      .flatMap((item) => cleanList(item))
      .map((item) => item.trim())
      .filter(Boolean)
  }

  if (typeof value === 'string') {
    return value
      .split(/[;,|]/)
      .map((item) => item.trim())
      .filter(Boolean)
  }

  return []
}

const unique = (values: string[]): string[] => Array.from(new Set(values.filter(Boolean)))

function buildDynamicEnrichedOption(
  match: { slug: string; name: string; type: 'herb' | 'compound' | 'stack'; score: number; confidence: number; reasons: string[]; bestFor: string[]; avoidIf: string[] },
  record: any,
  staticOpt?: (typeof goals)[number]['options'][number]
): EnrichedGoalOption {
  const evidenceLabel = normalizeDecisionEvidence(
    record?.evidence_level ||
      record?.evidenceLevel ||
      record?.evidence_tier ||
      record?.evidenceTier ||
      record?.evidence_grade ||
      staticOpt?.evidence ||
      'Needs review',
    'Needs review'
  )

  const safetyLabel = normalizeDecisionSafety(
    record?.safety_level ||
      record?.safetyLevel ||
      record?.safety_rating ||
      record?.safetyRating ||
      staticOpt?.risk ||
      'Standard caution'
  )

  const mechanismTags = unique([
    ...cleanList(record?.canonical_mechanisms),
    ...cleanList(record?.primary_mechanisms),
    ...cleanList(record?.primaryMechanisms),
    ...cleanList(record?.mechanisms),
    ...cleanList(record?.mechanism_of_action),
  ]).slice(0, 4)

  const mechanismCategoryTags = unique([
    ...cleanList(record?.mechanism_categories),
    ...cleanList(record?.mechanism_classes),
    ...cleanList(record?.mechanism_target_systems),
  ]).slice(0, 4)

  const pathwayTags = unique([
    ...cleanList(record?.pathways),
    ...cleanList(record?.systems),
    ...cleanList(record?.targets),
  ]).slice(0, 4)

  const bestForVal = staticOpt?.bestFor || match.bestFor.join(', ') || (record?.best_for ? cleanList(record.best_for).join(', ') : 'Goal support')
  const speedVal = staticOpt?.speed || (record?.time_to_effect ? String(record.time_to_effect) : record?.onset ? String(record.onset) : 'Timing varies')
  const avoidIfVal = staticOpt?.avoidIf || match.avoidIf.join(', ') || (record?.avoid_if ? cleanList(record.avoid_if).join(', ') : '')
  const whyPeopleStopVal = staticOpt?.whyPeopleStop || (record?.why_people_stop ? String(record.why_people_stop) : record?.side_effects ? String(record.side_effects) : 'Varying compliance')
  const formVal = staticOpt?.form || (record?.form ? String(record.form) : record?.typical_preparation ? String(record.typical_preparation) : 'Standard form')

  const option = {
    slug: match.slug,
    name: match.name,
    bestFor: bestForVal,
    speed: speedVal,
    evidence: staticOpt?.evidence || evidenceLabel,
    risk: staticOpt?.risk || safetyLabel,
    avoidIf: avoidIfVal,
    whyPeopleStop: whyPeopleStopVal,
    form: formVal,
  }

  return {
    option,
    compound: record,
    profileHref: record?.slug ? `/${match.type === 'herb' ? 'herbs' : 'compounds'}/${record.slug}` : '',
    evidenceLabel,
    safetyLabel,
    mechanismTags,
    mechanismCategoryTags,
    pathwayTags,
  }
}

export const dynamicParams = false

export function generateStaticParams(): GoalRouteParams[] {
  return goals.map((goal) => ({ goal: goal.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<GoalRouteParams>
}): Promise<Metadata> {
  const { goal: goalSlug } = await params
  const goal = getGoal(goalSlug)

  if (!goal) {
    return {
      title: 'Goal Guide | The Hippie Scientist',
      description: 'Decision-focused educational goal guide.',
    }
  }

  const matches = rankEntitiesForGoal(goalSlug)
  const topMatches = matches.slice(0, 3).map(m => m.name).join(', ')
  const description = topMatches
    ? `Compare ${topMatches}, and more for ${goalSlug} support. Compare by evidence confidence, safety caveats, timing, and practical tradeoffs.`
    : `${goal.description} Educational comparison only; not medical advice.`

  return {
    title: `${goal.title} Guide | The Hippie Scientist`,
    description: description.slice(0, 155),
  }
}

export default async function GoalDecisionPage({
  params,
}: {
  params: Promise<GoalRouteParams>
}) {
  const { goal: goalSlug } = await params
  const goal = getGoal(goalSlug)

  if (!goal) {
    notFound()
  }

  const matches = rankEntitiesForGoal(goalSlug)

  const enrichedOptions = await Promise.all(
    matches.map(async (match) => {
      const staticOpt = goal.options.find((opt) => opt.slug === match.slug)
      const record = match.type === 'herb'
        ? await getHerbBySlug(match.slug)
        : await getCompoundBySlug(match.slug)
      return buildDynamicEnrichedOption(match, record, staticOpt)
    })
  )

  const goalFaqJsonLd = faqPageJsonLd({
    pagePath: `/goals/${goal.slug}`,
    questions: goal.quickPicks.map(pick => ({
      question: `What is the best option for ${pick.need.toLowerCase()}?`,
      answer: `The recommended option to review is ${pick.option}.`,
    })),
  })

  const goalBreadcrumbJsonLd = breadcrumbJsonLd([
    { name: 'Goals', url: `${SITE_URL}/goals` },
    { name: goal.title, url: `${SITE_URL}/goals/${goal.slug}` },
  ], { id: `${SITE_URL}/goals/${goal.slug}#breadcrumb` })

  const goalCollectionJsonLd = collectionPageJsonLd({
    title: `${goal.title} | The Hippie Scientist`,
    description: goal.description,
    path: `/goals/${goal.slug}`,
    itemListId: `${SITE_URL}/goals/${goal.slug}#item-list`,
    breadcrumbId: `${SITE_URL}/goals/${goal.slug}#breadcrumb`,
  })

  const goalItemListJsonLd = itemListJsonLd({
    id: `${SITE_URL}/goals/${goal.slug}#item-list`,
    name: `${goal.title} Options`,
    path: `/goals/${goal.slug}`,
    items: enrichedOptions.map(opt => ({
      name: opt.option.name,
      url: opt.profileHref || `/goals/${goal.slug}`,
    })),
  })

  return (
    <main className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-8">
      {goalFaqJsonLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(goalFaqJsonLd) }}
        />
      )}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(goalBreadcrumbJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(goalCollectionJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(goalItemListJsonLd) }}
      />
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 sm:p-10 shadow-sm">
        <p className="eyebrow-label">{goal.eyebrow}</p>
        <h1 className="heading-premium mt-3 text-ink">
          {goal.title}
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">{goal.description}</p>
      </section>

      <section className="rounded-2xl border border-amber-600/10 bg-amber-50/50 p-6 text-sm leading-7 text-amber-950 shadow-sm">
        <h2 className="text-base font-bold text-amber-950">How to read this guide</h2>
        <p className="mt-2 text-amber-900">
          These comparisons are educational triage notes, not treatment instructions. They are meant to
          help you compare evidence strength, tolerance issues, and practical tradeoffs before reading the
          full profile or speaking with a qualified clinician.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/education/research-methodology" className="text-brand-800 hover:text-brand-700 hover:underline">
            Research methodology →
          </Link>
          <Link href="/education/evidence-hierarchy" className="text-brand-800 hover:text-brand-700 hover:underline">
            Evidence hierarchy →
          </Link>
          <Link href="/disclaimer" className="text-brand-800 hover:text-brand-700 hover:underline">
            Disclaimer →
          </Link>
        </div>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">Quick Comparison Notes</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These are starting points for comparison, not recommendations, prescriptions, or guaranteed outcomes.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-900/10">
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Use-case context</th>
                <th className="py-3 font-bold text-ink uppercase tracking-wider text-xs">Option to review</th>
              </tr>
            </thead>
            <tbody>
              {goal.quickPicks.map((pick) => (
                <tr key={pick.need} className="border-b border-brand-900/5 last:border-0">
                  <td className="py-3 pr-4 text-muted">{pick.need}</td>
                  <td className="py-3 font-semibold text-brand-850">{pick.option}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">Comparison Table</h2>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-900/10">
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Compound</th>
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Potential fit</th>
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Typical timing window</th>
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Evidence context</th>
                <th className="py-3 font-bold text-ink uppercase tracking-wider text-xs">Caution level</th>
              </tr>
            </thead>
            <tbody>
              {enrichedOptions.map(({ option, profileHref, evidenceLabel, safetyLabel }) => (
                <tr key={option.slug} className="border-b border-brand-900/5 last:border-0 align-top">
                  <td className="py-3 pr-4 font-semibold text-ink">
                    {profileHref ? (
                      <Link href={profileHref} className="text-brand-800 hover:text-brand-700 hover:underline transition">
                        {option.name}
                      </Link>
                    ) : (
                      <span>{option.name}</span>
                    )}
                  </td>
                  <td className="py-3 pr-4 text-muted">{option.bestFor}</td>
                  <td className="py-3 pr-4 text-muted">{option.speed}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 border border-emerald-100/50">
                      {evidenceLabel}
                    </span>
                  </td>
                  <td className="py-3 text-muted">{safetyLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">Runtime Profile Signals</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These badges are pulled from existing compound runtime profiles when available. Empty or pending fields
          stay conservative rather than inventing missing evidence, mechanism, or safety details.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrichedOptions.map(({ option, evidenceLabel, safetyLabel, mechanismTags, mechanismCategoryTags, pathwayTags }) => (
            <article key={`${option.slug}-runtime-signals`} className="rounded-2xl border border-brand-900/10 bg-white/60 p-5 backdrop-blur-sm">
              <h3 className="text-base font-semibold text-ink">{option.name}</h3>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-xs font-semibold text-emerald-800 border border-emerald-100/50">
                  Evidence: {evidenceLabel}
                </span>
                <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-xs font-semibold text-amber-800 border border-amber-100/50">
                  Safety: {safetyLabel}
                </span>
              </div>
              {mechanismTags.length > 0 ? (
                <div className="mt-4 pt-3 border-t border-brand-900/5">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Mechanism tags</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {mechanismTags.map((tag) => (
                      <span key={`${option.slug}-${tag}`} className="inline-flex rounded-full bg-brand-50/50 border border-brand-900/5 px-2 py-0.5 text-xs text-brand-900 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {mechanismCategoryTags.length > 0 ? (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Mechanism categories</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {mechanismCategoryTags.map((tag) => (
                      <span key={`${option.slug}-${tag}`} className="inline-flex rounded-full bg-brand-50/50 border border-brand-900/5 px-2 py-0.5 text-xs text-brand-900 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
              {pathwayTags.length > 0 ? (
                <div className="mt-3">
                  <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700">Pathway tags</p>
                  <div className="mt-2 flex flex-wrap gap-1.5">
                    {pathwayTags.map((tag) => (
                      <span key={`${option.slug}-${tag}`} className="inline-flex rounded-full bg-brand-50/50 border border-brand-900/5 px-2 py-0.5 text-xs text-brand-900 font-medium">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              ) : null}
            </article>
          ))}
        </div>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">Evidence Provenance</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          This page summarizes goal-level comparison signals only. For entity-specific sourcing, safety notes,
          mechanisms, and evidence context, review the underlying compound profiles and the site methodology.
        </p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrichedOptions.map(({ option, profileHref }) => (
            profileHref ? (
              <Link
                key={`${option.slug}-profile-link`}
                href={profileHref}
                className="rounded-2xl border border-brand-900/10 bg-white/60 p-5 text-sm text-muted transition hover:border-brand-700/20 hover:bg-white hover:shadow-sm"
              >
                <span className="block font-semibold text-ink">{option.name}</span>
                <span className="mt-2 block text-xs leading-relaxed">Open the profile for sourcing, safety context, and mechanism notes →</span>
              </Link>
            ) : (
              <article key={`${option.slug}-profile-pending`} className="rounded-2xl border border-brand-900/10 bg-white/60 p-5 text-sm text-muted">
                <span className="block font-semibold text-ink">{option.name}</span>
                <span className="mt-2 block text-xs leading-relaxed">Canonical profile pending; no profile link is shown until a static route exists.</span>
              </article>
            )
          ))}
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {enrichedOptions.map(({ option }) => (
          <article key={`${option.slug}-avoid`} className="rounded-2xl border border-rose-600/10 bg-rose-50/50 p-5 shadow-sm">
            <h3 className="text-sm font-bold uppercase tracking-wider text-rose-900">Review Carefully — {option.name}</h3>
            <p className="mt-2 text-sm leading-relaxed text-rose-800">{option.avoidIf}</p>
          </article>
        ))}
      </section>

      <section className="grid gap-4 sm:grid-cols-2">
        <article className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">Common Reasons People Stop</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {enrichedOptions.map(({ option }) => (
              <li key={`${option.slug}-stop`} className="leading-relaxed">
                <strong className="font-semibold text-ink">{option.name}:</strong> {option.whyPeopleStop}
              </li>
            ))}
          </ul>
        </article>

        <article className="card-premium p-6 sm:p-8">
          <h2 className="text-xl font-semibold text-ink">Commonly Discussed Forms</h2>
          <ul className="mt-4 space-y-3 text-sm text-muted">
            {enrichedOptions.map(({ option }) => (
              <li key={`${option.slug}-form`} className="leading-relaxed">
                <strong className="font-semibold text-ink">{option.name}:</strong> {option.form}
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">Related Goals</h2>
        <div className="mt-4 flex flex-wrap gap-2">
          {goal.relatedGoals.map((relatedSlug) => {
            const related = getGoal(relatedSlug)
            if (!related) {
              return null
            }

            return (
              <Link
                key={related.slug}
                href={`/goals/${related.slug}`}
                className="rounded-full border border-brand-900/10 bg-white px-4 py-2 text-xs font-semibold text-brand-800 transition hover:border-brand-700/20 hover:bg-brand-50/50"
              >
                {related.title}
              </Link>
            )
          })}
        </div>
      </section>

      <footer className="rounded-2xl border border-brand-900/10 bg-brand-950/[0.02] p-5 text-xs leading-6 text-muted">
        Educational only. Not medical advice. Evidence varies by population, preparation, and study design.
        Review medications, health conditions, pregnancy status, and clinician guidance before using supplements.
      </footer>
    </main>
  )
}
