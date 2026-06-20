import type { ReactNode } from 'react'
import Link from 'next/link'
import EvidenceClaimCard from '../../../src/components/evidence-engine/EvidenceClaimCard'
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

type GoalHubBundle = ReturnType<typeof getGoalHubLinks>
import {
  type EvidenceEngineClaim,
  type EvidenceEnginePayload,
  formatEvidenceLabel,
  getClaimProblemKey,
  getSafetySeverityTone,
  groupClaimsByDecisionGroup,
  groupSafetyNotesByIngredient,
} from '../../../src/lib/evidence-engine'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import AuthorCredentials from '@/components/AuthorCredentials'
import SeeAlsoInCluster from '@/components/SeeAlsoInCluster'
import { getGoalCluster } from '@/lib/goal-clusters'

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
}

function profileHrefFor(claim: EvidenceEngineClaim, enrichedOptions: GoalOption[]) {
  const option = enrichedOptions.find((item) => item.option.slug === claim.ingredient_slug)
  return option?.profileHref || `/compounds/${claim.ingredient_slug}`
}

function SleepClusterLinks() {
  const sleepCluster = getGoalCluster('sleep')
  if (!sleepCluster) return null

  return (
    <section className="rounded-2xl border border-emerald-800/15 bg-emerald-50/70 p-5 shadow-sm sm:p-6">
      <p className="eyebrow-label">Sleep article cluster</p>
      <h2 className="mt-2 text-xl font-semibold text-ink">Need the practical sleep supplement guide?</h2>
      <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
        Start with the cornerstone, then open the specific magnesium, melatonin, L-theanine, or stacking guide that matches the problem.
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

export default function GoalDecisionExperience({
  goal,
  enrichedOptions,
  evidence,
  structuredData,
  hubLinks,
  startHereLinks = [],
  goalContent = null,
  captureGoal = 'default',
}: GoalDecisionExperienceProps) {
  const freshness = getGoalFreshness(goal.slug)
  const claims = evidence.claims
  const problemLabels = evidence.problemLabels
  const config = evidence.config ?? {}
  const claimGroups = groupClaimsByDecisionGroup(claims)
  const safetyGroups = groupSafetyNotesByIngredient(evidence.safetyNotes)
  const hasEvidence = claims.length > 0

  const problemField = config.problemField ?? `${goal.slug}_problem`
  const orientationId = `${goal.slug}-orientation`
  const heroHeadline = config.heroHeadline ?? `${goal.title.replace(/ decisions$/, '')}: What does the evidence actually support?`
  const heroDescription = `A workbook-backed ${goal.slug} decision page that separates claim, evidence, limitation, source, and safety context before you decide what to research next.`
  const heroCta = config.heroCta ?? `Start with the ${goal.slug} problem`
  const orientationHeading = config.orientationHeading ?? `Start by naming the ${goal.slug} problem`
  const orientationSubtext = config.orientationSubtext ?? `The same ingredient can look useful or weak depending on which ${goal.slug} problem you are targeting.`
  const safetyHeading = config.safetyHeading ?? `${goal.title} decisions change when risk context changes`
  const safetyBody = config.safetyBody ?? `Do not use supplements to manage complex clinical situations without professional guidance.`

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-10">
      {structuredData}
      <Breadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Goals', href: '/goals' },
          { label: goal.title },
        ]}
      />

      <section className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 p-7 sm:p-12 shadow-card">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow-label">{goal.title} evidence engine</p>
            <h1 className="heading-premium mt-3 text-ink">{heroHeadline}</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              {heroDescription}
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href={`#${orientationId}`} className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-900">
                {heroCta}
              </a>
              <a href="#safety-first" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-900/10 bg-white/70 px-5 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-700/30 hover:bg-white">
                Review safety warnings
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-900/10 bg-white/70 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Evidence snapshot</p>
            <dl className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <div>
                <dt className="font-semibold text-ink">Workbook claims</dt>
                <dd>{claims.length} published {goal.slug} claims</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Safety notes</dt>
                <dd>{evidence.safetyNotes.length} ingredient warnings</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Last reviewed</dt>
                <dd>{evidence.updatedAt ? new Date(evidence.updatedAt).toLocaleDateString('en-US') : 'Review pending'}</dd>
              </div>
            </dl>
          </div>
        </div>
        <div className="mt-6">
          <LastUpdatedBadge date={freshness.lastReviewed} citationCount={freshness.citationCount} />
        </div>
      </section>

      <section id={orientationId} className="card-premium p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">{goal.title} problem orientation</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">{orientationHeading}</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            {orientationSubtext}
          </p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {Object.entries(problemLabels).map(([key, problem]) => {
            const count = claims.filter((claim) => getClaimProblemKey(claim, problemField) === key).length
            return (
              <article key={key} className="rounded-2xl border border-brand-900/10 bg-white/70 p-4">
                <h3 className="text-sm font-semibold text-ink">{problem.title}</h3>
                <p className="mt-2 text-xs leading-5 text-muted">{problem.description}</p>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">{count} claim{count === 1 ? '' : 's'}</p>
              </article>
            )
          })}
        </div>
      </section>

      {hasEvidence ? (
        <section id="shortlist" className="card-premium p-6 sm:p-8">
          <div className="max-w-3xl">
            <p className="eyebrow-label">Claim-backed shortlist</p>
            <h2 className="mt-2 text-2xl font-semibold text-ink">Published workbook claims, grouped by decision role</h2>
            <p className="mt-3 text-sm leading-7 text-muted">
              These are not rankings or personalized recommendations. Each card shows the claim, evidence summary, limitation, source trail, and ingredient-specific safety notes.
            </p>
          </div>

          <div className="mt-6 space-y-6">
            {Object.entries(claimGroups).map(([group, groupClaims]) => (
              <section key={group} className="rounded-3xl border border-brand-900/10 bg-white/60 p-5">
                <h3 className="text-lg font-semibold text-ink">{group}</h3>
                <div className="mt-4 grid gap-4 lg:grid-cols-2">
                  {groupClaims.map((claim) => {
                    const problemKey = getClaimProblemKey(claim, problemField)
                    const sources = evidence.sourcesByClaim[claim.claim_id] || []
                    const safetyNotes = safetyGroups[claim.ingredient_slug] || []
                    return (
                      <EvidenceClaimCard
                        key={claim.claim_id}
                        claim={claim}
                        problemLabel={problemLabels[problemKey]?.title || problemKey}
                        profileHref={profileHrefFor(claim, enrichedOptions)}
                        safetyNotes={safetyNotes}
                        sources={sources}
                      />
                    )
                  })}
                </div>
              </section>
            ))}
          </div>
        </section>
      ) : (
        <section className="card-premium p-6 sm:p-8">
          <p className="eyebrow-label">Awaiting workbook rows</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">The {goal.slug} Evidence Engine payload is ready, but no claims are published yet</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Add published rows to the {goal.title} Evidence Claims, {goal.title} Evidence Sources, and {goal.title} Safety Notes workbook sheets, then rebuild the static data.
          </p>
        </section>
      )}

      <section id="safety-first" className="rounded-[2rem] border border-rose-700/15 bg-rose-50/70 p-7 sm:p-9 shadow-sm">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-800">Safety first</p>
          <h2 className="mt-2 text-2xl font-semibold text-rose-950">{safetyHeading}</h2>
          <p className="mt-3 text-sm leading-7 text-rose-900">
            {safetyBody}
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {evidence.safetyNotes.map((note) => (
            <article key={`${note.safety_id}-global`} className={`rounded-2xl border p-5 ${getSafetySeverityTone(note.severity)}`}>
              <h3 className="text-base font-semibold capitalize">{formatEvidenceLabel(note.ingredient_slug)}</h3>
              <p className="mt-2 text-sm leading-6">{note.warning}</p>
              <p className="mt-2 text-xs font-semibold leading-5">{note.decision_effect}</p>
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

      {goal.slug === 'anxiety' ? (
        <section className="rounded-2xl border border-emerald-700/15 bg-emerald-50/70 p-5 shadow-sm sm:p-6">
          <p className="eyebrow-label">Decision guide</p>
          <h2 className="mt-2 text-xl font-semibold text-ink">Need the broader anxiety herb shortlist?</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            The anxiety goal page keeps the evidence engine separate from the canonical decision guide.
          </p>
          <Link
            href="/guides/best-herbs-for-anxiety"
            className="mt-4 inline-flex min-h-11 items-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-900"
          >
            See our full evidence-based guide - Best Herbs for Anxiety
          </Link>
        </section>
      ) : null}

      <SafetyChecklistPromo goal={captureGoal} variant="hero" />

      {goalContent ? <GoalContentDepth content={goalContent} /> : null}

      {hubLinks ? (
        <GoalHubSections
          goalSlug={goal.slug}
          stack={hubLinks.stack}
          compares={hubLinks.compares}
          seoEntry={hubLinks.seoEntry}
        />
      ) : null}

      <AuthorCredentials />

      <footer className="rounded-2xl border border-brand-900/10 bg-brand-950/[0.02] p-5 text-xs leading-6 text-muted">
        Educational only. Not medical advice. Evidence varies by population, preparation, dose, timing, and study design.
        Review medications, health conditions, pregnancy status, and clinician guidance before using supplements.
      </footer>
    </div>
  )
}
