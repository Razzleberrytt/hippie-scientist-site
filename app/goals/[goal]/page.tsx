import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { getGoal, goals } from '@/data/goals'
import { getHerbBySlug, getCompoundBySlug, getGoalEvidenceEngine } from '../../../src/lib/runtime-data'
import { normalizeDecisionEvidence, normalizeDecisionSafety } from '@/lib/decision-primitives'
import { SITE_URL } from '../../../src/lib/seo'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGoalSchemaGraph } from '../../../src/lib/schema-graph'
import { buildGoalClusterGraph } from '@/lib/cluster-linking'
import { buildGoalPageMetadata } from '../../../src/lib/goal-seo'
import { getGoalHubLinks } from '../../../src/lib/goal-hub-links'
import { getGoalStartHereLinks } from '@/lib/goal-start-here-links'
import { getGoalContentExtension, getGoalFaqItems } from '@/data/goal-content'
import { rankEntitiesForGoal } from '@/lib/goal-matching-engine'
import { getAffiliateShopLinks } from '../../../src/lib/affiliate'
import { getRevenueProductSet } from '@/config/revenue-products'
import SafetyChecklistPromo from '@/components/monetization/SafetyChecklistPromo'
import GoalTopAffiliatePicks from '@/components/monetization/GoalTopAffiliatePicks'
import ProductTrustAffiliate from '@/components/monetization/ProductTrustAffiliate'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import AuthorCredentials from '@/components/AuthorCredentials'
import SeeAlsoInCluster from '@/components/SeeAlsoInCluster'
import { getGoalCluster } from '@/lib/goal-clusters'

import GoalDecisionExperience from './GoalDecisionExperience'
import GoalHubSections from '../../../src/components/goals/GoalHubSections'
import GoalContentDepth from '../../../src/components/goals/GoalContentDepth'
import GoalStartHereLinks from '@/components/goals/GoalStartHereLinks'
import StudyDesignSnapshot from '@/components/evidence/StudyDesignSnapshot'
import { getGoalPivotalStudy } from '@/data/goal-pivotal-studies'

import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import { getGoalFreshness } from '@/lib/freshness'
import type { EmailCaptureGoal } from '@/content/emailCapture'

type GoalRouteParams = { goal: string }
type RuntimeCompound = Record<string, unknown>

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
  record: Record<string, unknown>,
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
      title: 'Goal Guide',
      description: 'Decision-focused educational goal guide.',
    }
  }

  const matches = rankEntitiesForGoal(goalSlug)
  const topNames = matches.slice(0, 3).map((m) => m.name)

  const goalEvidence = await getGoalEvidenceEngine(goalSlug)
  if (goalEvidence) {
    return buildGoalPageMetadata(
      { ...goal, title: `${goal.title} Evidence Engine` },
      topNames,
    )
  }

  return buildGoalPageMetadata(goal, topNames)
}

function goalCaptureGoal(slug: string): EmailCaptureGoal {
  const allowed: EmailCaptureGoal[] = [
    'sleep',
    'stress',
    'focus',
    'anxiety',
    'brain-fog',
    'fatigue',
    'overthinking',
    'pain',
    'inflammation',
    'default',
  ]
  return allowed.includes(slug as EmailCaptureGoal) ? (slug as EmailCaptureGoal) : 'default'
}

function SleepClusterLinks() {
  const sleepCluster = getGoalCluster('sleep')
  if (!sleepCluster) return null

  return (
    <section className="rounded-2xl border border-emerald-800/15 bg-emerald-50/70 p-5 shadow-sm sm:p-6">
      <p className="eyebrow-label">Sleep article cluster</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">Read the practical sleep supplement guides</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
        Use the cornerstone first, then compare the focused magnesium, melatonin, L-theanine, and stack guides.
      </p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {sleepCluster.articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}/`}
            className="rounded-2xl border border-brand-900/10 bg-white/75 p-4 text-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700">
              {article.kind.replace('-', ' ')}
            </span>
            <span className="mt-1 block font-semibold text-ink">{article.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
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

  const freshness = getGoalFreshness(goal.slug)

  const matches = rankEntitiesForGoal(goalSlug)

  const enrichedOptions = await Promise.all(
    matches.map(async (match) => {
      const staticOpt = goal.options.find((opt) => opt.slug === match.slug)
      const record = match.type === 'herb'
        ? await getHerbBySlug(match.slug)
        : await getCompoundBySlug(match.slug)
      return buildDynamicEnrichedOption(match, record ?? {}, staticOpt)
    })
  )

  const goalPath = `/goals/${goal.slug}`
  const goalContent = getGoalContentExtension(goal.slug)
  const pivotalStudy = getGoalPivotalStudy(goal.slug)
  const fallbackFaq = goal.quickPicks.map((pick) => ({
    question: `What is the best option for ${pick.need.toLowerCase()}?`,
    answer: `A common starting point to review is ${pick.option}. Compare evidence, safety, and timing on the full profile before deciding.`,
  }))
  const faqQuestions = getGoalFaqItems(goal.slug, fallbackFaq)

  const schemaGraph = buildGoalSchemaGraph({
    goalPath,
    title: `${goal.title} | The Hippie Scientist`,
    description: goal.description,
    breadcrumbs: [
      { name: 'Goals', url: `${SITE_URL}/goals/` },
      { name: goal.title, url: `${SITE_URL}${goalPath}/` },
    ],
    faqQuestions,
    comparisonRows: enrichedOptions.map((opt) => ({
      name: opt.option.name,
      bestFor: opt.option.bestFor,
      evidence: opt.option.evidence,
      risk: opt.option.risk,
      profileHref: opt.profileHref,
    })),
    itemList: {
      name: `${goal.title} Options`,
      items: enrichedOptions.map(opt => ({
        name: opt.option.name,
        url: opt.profileHref || `/goals/${goal.slug}`,
      })),
    },
  })

  const clusterGraph = buildGoalClusterGraph(goal.slug)
  const structuredData = (
    <>
      <SchemaGraphScript graph={schemaGraph} />
      {clusterGraph ? <SchemaGraphScript graph={clusterGraph} /> : null}
    </>
  )

  const hubLinks = getGoalHubLinks(goal.slug)
  const startHereLinks = getGoalStartHereLinks(goal.slug)
  const goalEvidence = await getGoalEvidenceEngine(goal.slug)
  if (goalEvidence) {
    return (
      <GoalDecisionExperience
        goal={goal}
        enrichedOptions={enrichedOptions}
        evidence={goalEvidence}
        structuredData={structuredData}
        hubLinks={hubLinks}
        startHereLinks={startHereLinks}
        goalContent={goalContent}
        captureGoal={goalCaptureGoal(goal.slug)}
      />
    )
  }

  return (
    <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6 lg:px-8 space-y-10">
      {structuredData}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Goals', href: '/goals' },
          { label: goal.title },
        ]}
      />
      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-7 sm:p-12 shadow-sm">
        <p className="eyebrow-label">{goal.eyebrow}</p>
        <h1 className="heading-premium mt-3 text-ink">
          {goal.title.replace(/ decisions$/, '')}: What does the evidence actually support?
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">{goal.description}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href="#decision-orientation" className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-900">
            Start with the {goal.slug} decisions
          </a>
          <a href="#safety-first" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-900/10 bg-white/70 px-5 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-700/30 hover:bg-white">
            Review safety warnings
          </a>
        </div>
        <div className="mt-4">
          <LastUpdatedBadge date={freshness.lastReviewed} citationCount={freshness.citationCount} />
        </div>
      </section>

      <section id="decision-orientation" className="card-premium p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">{goal.title} orientation</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Start by naming your target need</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Compare quick starting points by target need before reading the detailed evidence and caution levels below.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goal.quickPicks.map((pick) => {
            const opt = enrichedOptions.find((o) => o.option.slug === pick.slug)
            const href = opt?.profileHref
            return (
              <article key={pick.slug} className="rounded-2xl border border-brand-900/10 bg-white/70 p-5 flex flex-col justify-between">
                <div>
                  <p className="eyebrow-label">Use-case fit</p>
                  <h3 className="mt-2 text-base font-semibold text-ink">
                    {href ? (
                      <Link href={href} className="text-brand-800 hover:text-brand-700 hover:underline transition">
                        {pick.option}
                      </Link>
                    ) : (
                      <span>{pick.option}</span>
                    )}
                  </h3>
                  <p className="mt-2 text-sm leading-relaxed text-muted">{pick.need}</p>
                </div>
              </article>
            )
          })}
        </div>
      </section>

      <section id='comparison-table' className="card-premium scroll-mt-24 p-6 sm:p-8">
        <h2 className="text-xl font-semibold text-ink">Comparison Table</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These are starting points for comparison, not recommendations, prescriptions, or guaranteed outcomes.
        </p>
        <div className="mt-6 overflow-x-auto">
          <table className="min-w-full text-left text-sm border-collapse">
            <thead>
              <tr className="border-b border-brand-900/10">
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Compound</th>
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Potential fit</th>
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Typical timing window</th>
                <th className="py-3 pr-4 font-bold text-ink uppercase tracking-wider text-xs">Standardized Form / Quality</th>
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
                  <td className="py-3 pr-4 text-muted">{option.form}</td>
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
          {enrichedOptions.map(({ option, evidenceLabel, safetyLabel, mechanismTags, mechanismCategoryTags, pathwayTags, compound }) => (
            <article key={`${option.slug}-runtime-signals`} className="rounded-2xl border border-brand-900/10 bg-white/60 p-5 backdrop-blur-sm flex flex-col justify-between">
              <div>
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
              </div>
              {/* Sourcing CTA */}
              {(() => {
                const revenue = getRevenueProductSet(option.slug)
                const overall = revenue?.products.find((p) => p.slot === 'overall') ?? revenue?.products[0]
                if (overall?.affiliateUrl) {
                  return (
                    <ProductTrustAffiliate
                      productName={overall.title || option.name}
                      brand={overall.brand}
                      href={overall.affiliateUrl}
                      rationale={overall.rationale || `Editor starting point for ${option.name} — verify dose and safety on the profile.`}
                      slotLabel="Best overall"
                      compact
                    />
                  )
                }
                const entityType = compound?.entityType === 'herb' || compound?.entityType === 'compound'
                  ? compound.entityType
                  : undefined
                const shopLinks = getAffiliateShopLinks(compound, option.name, entityType)
                const cta = shopLinks.find((l) => l.url)
                if (!cta) return null
                return (
                  <ProductTrustAffiliate
                    productName={option.name}
                    href={cta.url}
                    rationale={`Search filtered for third-party tested ${option.name} supplements — compare standardization on the label before buying.`}
                    compact
                  />
                )
              })()}
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

      {pivotalStudy ? (
        <section className="card-premium p-6 sm:p-8" aria-labelledby="pivotal-evidence-heading">
          <div className="mb-4 space-y-2">
            <p className="eyebrow-label">Evidence transparency</p>
            <h2 id="pivotal-evidence-heading" className="text-2xl font-semibold tracking-tight text-ink sm:text-3xl">
              How strong is the evidence here?
            </h2>
            <p className="text-sm leading-7 text-[#5c6b63]">
              The practical takeaway stays up top; expand the snapshot for the trial design and limitations behind the grade.
            </p>
          </div>
          <StudyDesignSnapshot
            grade={pivotalStudy.grade}
            summary={pivotalStudy.summary}
            gradeRationale={pivotalStudy.gradeRationale}
            studyType={pivotalStudy.studyType}
            population={pivotalStudy.population}
            participants={pivotalStudy.participants}
            duration={pivotalStudy.duration}
            comparator={pivotalStudy.comparator}
            dosing={pivotalStudy.dosing}
            design={pivotalStudy.design}
            limitations={pivotalStudy.limitations}
            context={pivotalStudy.context}
            sources={pivotalStudy.sources}
            title={`Study design snapshot · ${pivotalStudy.subject}`}
          />
        </section>
      ) : null}

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

      <section id="safety-first" className="rounded-[2rem] border border-amber-600/10 bg-amber-50/50 p-7 sm:p-9 shadow-sm">
        <h2 className="text-base font-bold text-amber-950">How to read this guide</h2>
        <p className="mt-2 text-sm leading-7 text-amber-900">
          These comparisons are educational triage notes, not treatment instructions. They are meant to
          help you compare evidence strength, tolerance issues, and practical tradeoffs before reading the
          full profile or speaking with a qualified clinician.
        </p>
        <div className="mt-4 flex flex-wrap gap-4 text-xs font-semibold uppercase tracking-[0.14em]">
          <Link href="/methodology" className="text-brand-800 hover:text-brand-700 hover:underline">
            Research methodology →
          </Link>
          <Link href="/education/evidence-hierarchy" className="text-brand-800 hover:text-brand-700 hover:underline">
            Evidence hierarchy →
          </Link>
          <Link href="/disclaimer" className="text-brand-800 hover:text-brand-700 hover:underline">
            Disclaimer →
          </Link>
        </div>

        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {enrichedOptions.map(({ option }) => (
            <article key={`${option.slug}-avoid`} className="rounded-2xl border border-rose-600/10 bg-rose-50/50 p-5 shadow-sm">
              <h3 className="text-sm font-bold uppercase tracking-wider text-rose-900">Review Carefully — {option.name}</h3>
              <p className="mt-2 text-sm leading-relaxed text-rose-800">{option.avoidIf}</p>
            </article>
          ))}
        </div>
      </section>

      <GoalTopAffiliatePicks goalSlug={goal.slug} limit={4} />

      <GoalStartHereLinks links={startHereLinks} />

      {goal.slug === 'sleep' ? <SleepClusterLinks /> : null}

      {goal.slug === 'focus' ? (
        <SeeAlsoInCluster currentPath="/goals/focus" />
      ) : null}

      <section className='rounded-2xl border border-emerald-800/15 bg-emerald-50/70 p-5 shadow-sm sm:p-6'>
        <h2 className='text-xl font-semibold text-ink'>Ready to start?</h2>
        <p className='mt-2 max-w-3xl text-sm leading-6 text-muted'>
          Which supplement should you start with? Review the ranked options, then open the product-quality notes before buying.
        </p>
        <Link
          href={goal.slug === 'focus' ? '/best-magnesium-supplements-for-adhd/' : `/goals/${goal.slug}/#comparison-table`}
          className='mt-4 inline-flex min-h-11 items-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900'
        >
          See ranked options
        </Link>
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

      <SafetyChecklistPromo goal={goalCaptureGoal(goal.slug)} variant="hero" />

      {goalContent ? <GoalContentDepth content={goalContent} /> : null}

      <GoalHubSections
        goalSlug={goal.slug}
        stack={hubLinks.stack}
        compares={hubLinks.compares}
        seoEntry={hubLinks.seoEntry}
      />

      <AuthorCredentials />

      <footer className="rounded-2xl border border-brand-900/10 bg-brand-950/[0.02] p-5 text-xs leading-6 text-muted">
        Educational only. Not medical advice. Evidence varies by population, preparation, and study design.
        Review medications, health conditions, pregnancy status, and clinician guidance before using supplements.
      </footer>
    </div>
  )
}
