import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Goal } from '@/data/goals'
import SafetyChecklistPromo from '@/components/monetization/SafetyChecklistPromo'
import GoalTopAffiliatePicks from '@/components/monetization/GoalTopAffiliatePicks'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import { getGoalFreshness } from '@/lib/freshness'
import type { GoalContentExtension } from '@/data/goal-content'
import type { EmailCaptureGoal } from '@/content/emailCapture'
import GoalHubSections from '../../../src/components/goals/GoalHubSections'
import GoalContentDepth from '../../../src/components/goals/GoalContentDepth'
import GoalStartHereLinks from '@/components/goals/GoalStartHereLinks'
import type { GoalStartHereLink } from '@/lib/goal-start-here-links'
import type { getGoalHubLinks } from '../../../src/lib/goal-hub-links'
import {
  type EvidenceEnginePayload,
  formatEvidenceLabel,
  getSafetySeverityTone,
} from '../../../src/lib/evidence-engine'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import AuthorCredentials from '@/components/AuthorCredentials'
import SeeAlsoInCluster from '@/components/SeeAlsoInCluster'
import { getGoalCluster, type GoalCategory } from '@/lib/goal-clusters'

type GoalHubBundle = ReturnType<typeof getGoalHubLinks>

type GoalOption = {
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
  profileHref: string
  evidenceLabel: string
  safetyLabel: string
}

type GoalDecisionExperienceProps = {
  goal: Goal
  enrichedOptions: GoalOption[]
  evidence: EvidenceEnginePayload
  structuredData?: ReactNode
  hubLinks?: GoalHubBundle
  startHereLinks?: GoalStartHereLink[]
  goalContent?: GoalContentExtension | null
  captureGoal?: EmailCaptureGoal
  isEducationOnly?: boolean
}

type SafetyCard = {
  safety_id: string
  ingredient_slug: string
  severity: string
  warning: string
  decision_effect: string
}

function cleanGoalHeading(value: string) {
  return value
    .replace(/\s+decisions$/i, '')
    .replace(/\bsupplement decisions change\b/gi, 'supplement context changes')
    .replace(/\bsupport decisions change\b/gi, 'support context changes')
}

function ArticleClusterLinks({
  category,
  eyebrow = 'More guides',
}: {
  category: GoalCategory
  eyebrow?: string
}) {
  const cluster = getGoalCluster(category)
  if (!cluster || cluster.articles.length === 0) return null

  return (
    <section className="card-premium p-5 sm:p-6">
      <p className="eyebrow-label">{eyebrow}</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">{cluster.title}</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">{cluster.description}</p>
      <div className="mt-5 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {cluster.articles.map((article) => (
          <Link
            key={article.slug}
            href={`/articles/${article.slug}/`}
            className="goal-link-card rounded-2xl border border-brand-900/10 bg-white/75 p-4 text-sm transition hover:border-brand-700/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
          >
            <span className="text-[10px] font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-200">
              {article.kind.replace('-', ' ')}
            </span>
            <span className="mt-1 block font-semibold text-ink">{article.title}</span>
          </Link>
        ))}
      </div>
    </section>
  )
}

function clusterForGoal(slug: string): GoalCategory | null {
  if (slug === 'sleep') return 'sleep'
  if (slug === 'anxiety' || slug === 'stress') return 'mood'
  if (slug === 'focus') return 'memory'
  return null
}

function defaultSafetyCards(options: GoalOption[]): SafetyCard[] {
  return options.map(({ option }) => ({
    safety_id: `${option.slug}-avoid`,
    ingredient_slug: option.slug,
    severity: 'moderate',
    warning: option.avoidIf,
    decision_effect: 'Review this caution before use.',
  }))
}

export default function GoalDecisionExperience({
  goal,
  enrichedOptions,
  evidence,
  structuredData,
  hubLinks,
  startHereLinks = [],
  goalContent = null,
  captureGoal = 'default',
  isEducationOnly = false,
}: GoalDecisionExperienceProps) {
  const freshness = getGoalFreshness(goal.slug)
  const config = evidence.config ?? {}
  const comparisonOptions = enrichedOptions.slice(0, 6)
  const safetyCards: SafetyCard[] = evidence.safetyNotes.length > 0
    ? evidence.safetyNotes.slice(0, 4)
    : defaultSafetyCards(comparisonOptions).slice(0, 4)
  const cluster = clusterForGoal(goal.slug)
  const quickAnswerId = `${goal.slug}-quick-answer`
  const goalDisplayTitle = cleanGoalHeading(goal.title)
  const heroHeadline = cleanGoalHeading(config.heroHeadline ?? `${goalDisplayTitle}: What does the evidence actually support?`)
  const heroDescription = goal.description
  const heroCta = config.heroCta ?? 'Start with the quick answer'
  const safetyHeading = cleanGoalHeading(config.safetyHeading ?? (isEducationOnly ? 'Safety notes before use' : 'Safety notes before buying'))
  const safetyBody = config.safetyBody ?? 'Use this as a screening layer before comparing options. Medication use, pregnancy, chronic conditions, and psychiatric history can change the risk calculation.'

  return (
    <div className="goal-decision-experience mx-auto max-w-6xl space-y-6 px-4 pb-28 pt-6 sm:space-y-10 sm:px-6 sm:py-10 lg:px-8">
      {structuredData}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Goals', href: '/goals' },
          { label: goalDisplayTitle },
        ]}
      />

      <section className="hero-shell rounded-[1.25rem] border border-brand-900/10 p-5 shadow-card sm:rounded-[2rem] sm:p-12 dark:border-white/10">
        <p className="eyebrow-label">{goal.eyebrow}</p>
        <h1 className="heading-premium mt-3 max-w-4xl text-ink">{heroHeadline}</h1>
        <p className="mt-4 max-w-3xl text-base leading-8 text-muted">{heroDescription}</p>
        <div className="mt-6 flex flex-col gap-3 sm:flex-row">
          <a href={`#${quickAnswerId}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-900 dark:bg-brand-200 dark:text-brand-950 dark:hover:bg-brand-100">
            {heroCta}
          </a>
          <a href="#comparison-table" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-900/15 bg-white/90 px-5 py-2.5 text-sm font-bold text-brand-900 shadow-sm transition hover:border-brand-700/30 hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-brand-50 dark:hover:bg-white/10">
            Compare options
          </a>
        </div>
        <div className="mt-5">
          <LastUpdatedBadge date={freshness.lastReviewed} citationCount={freshness.citationCount} />
        </div>
      </section>

      <section id={quickAnswerId} className="card-premium scroll-mt-24 p-5 sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Quick answer</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Best options by {goal.slug.replace(/-/g, ' ')} problem</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Start with the problem you are trying to solve, then use the table to check timing, evidence, and risk.
          </p>
        </div>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goal.quickPicks.map((pick) => {
            const opt = comparisonOptions.find((item) => item.option.slug === pick.slug)
            const href = opt?.profileHref || `/compounds/${pick.slug}`
            return (
              <article key={pick.slug} className="goal-mini-card rounded-2xl border border-brand-900/12 bg-white/85 p-5 shadow-sm dark:border-white/10 dark:bg-white/5">
                <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700 dark:text-brand-200">{pick.need}</p>
                <h3 className="mt-2 text-lg font-semibold text-ink">
                  <Link href={href} className="text-brand-800 transition hover:text-brand-700 hover:underline dark:text-brand-100 dark:hover:text-white">
                    {pick.option}
                  </Link>
                </h3>
                {opt ? <p className="mt-2 text-sm leading-6 text-muted">{opt.option.bestFor}</p> : null}
              </article>
            )
          })}
        </div>
      </section>

      <section id="comparison-table" className="card-premium scroll-mt-24 p-5 sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Compare the main options</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Shortlist before you read deeper</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            The table keeps the practical comparison points visible: fit, timing, form quality, evidence, and caution level.
          </p>
        </div>
        <div className="mt-6 overflow-x-auto rounded-2xl border border-brand-900/10 bg-white/55 dark:border-white/10 dark:bg-white/5">
          <table className="min-w-[780px] w-max border-collapse text-left text-sm lg:min-w-full lg:w-full">
            <caption className="sr-only">{goalDisplayTitle} comparison table</caption>
            <thead>
              <tr className="border-b border-brand-900/10 dark:border-white/10">
                <th scope="col" className="py-3 pl-4 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Option</th>
                <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Best fit</th>
                <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Timing</th>
                <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Form to check</th>
                <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Evidence</th>
                <th scope="col" className="py-3 pr-4 text-xs font-bold uppercase tracking-wider text-ink">Caution</th>
              </tr>
            </thead>
            <tbody>
              {comparisonOptions.map(({ option, profileHref, evidenceLabel, safetyLabel }) => (
                <tr key={option.slug} className="border-b border-brand-900/5 align-top last:border-0 dark:border-white/10">
                  <th scope="row" className="py-3 pl-4 pr-4 text-left font-semibold text-ink">
                    <Link href={profileHref || `/compounds/${option.slug}`} className="text-brand-800 transition hover:text-brand-700 hover:underline dark:text-brand-100 dark:hover:text-white">
                      {option.name}
                    </Link>
                  </th>
                  <td className="py-3 pr-4 text-muted">{option.bestFor}</td>
                  <td className="py-3 pr-4 text-muted">{option.speed}</td>
                  <td className="py-3 pr-4 text-muted">{option.form}</td>
                  <td className="py-3 pr-4">
                    <span className="inline-flex rounded-full border border-emerald-100/50 bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-800 dark:border-emerald-200/20 dark:bg-emerald-300/10 dark:text-emerald-100">
                      {evidenceLabel}
                    </span>
                  </td>
                  <td className="py-3 pr-4 text-muted">{safetyLabel}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="safety-first" className="rounded-[1.5rem] border border-rose-700/15 bg-rose-50/75 p-5 shadow-sm sm:rounded-[2rem] sm:p-9 dark:border-rose-200/20 dark:bg-rose-950/30">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-800 dark:text-rose-200">Safety notes</p>
          <h2 className="mt-2 text-2xl font-semibold text-rose-950 dark:text-rose-50">{safetyHeading}</h2>
          <p className="mt-3 text-sm leading-7 text-rose-900 dark:text-rose-100/85">{safetyBody}</p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {safetyCards.map((note) => (
            <article key={`${note.safety_id}-global`} className={`rounded-2xl border p-5 dark:border-rose-200/15 dark:bg-white/5 dark:text-rose-50 ${getSafetySeverityTone(note.severity)}`}>
              <h3 className="text-base font-semibold capitalize">{formatEvidenceLabel(note.ingredient_slug)}</h3>
              <p className="mt-2 text-sm leading-6">{note.warning}</p>
              <p className="mt-2 text-xs font-semibold leading-5">{note.decision_effect}</p>
            </article>
          ))}
        </div>
      </section>

      <GoalStartHereLinks links={startHereLinks} />

      {cluster ? <ArticleClusterLinks category={cluster} /> : null}

      {goal.slug === 'focus' ? <SeeAlsoInCluster currentPath="/goals/focus" /> : null}

      <GoalTopAffiliatePicks goalSlug={goal.slug} limit={2} suppressMonetization={isEducationOnly} />

      {isEducationOnly ? null : <SafetyChecklistPromo goal={captureGoal} />}

      {hubLinks ? (
        <GoalHubSections
          goalSlug={goal.slug}
          stack={hubLinks.stack}
          compares={hubLinks.compares}
          seoEntry={hubLinks.seoEntry}
        />
      ) : null}

      {goalContent ? <GoalContentDepth content={goalContent} /> : null}

      <AuthorCredentials />
    </div>
  )
}
