import type { ReactNode } from 'react'
import EvidenceClaimCard from '@/components/evidence-engine/EvidenceClaimCard'
import type { Goal } from '@/data/goals'
import {
  type EvidenceEngineClaim,
  formatEvidenceLabel,
  getSafetySeverityTone,
  groupClaimsByDecisionGroup,
  groupSafetyNotesByIngredient,
} from '@/lib/evidence-engine'
import type { AnxietyEvidenceEnginePayload } from '@/lib/runtime-data'

type AnxietyOption = {
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

type AnxietyDecisionExperienceProps = {
  goal: Goal
  enrichedOptions: AnxietyOption[]
  anxietyEvidence: AnxietyEvidenceEnginePayload
  structuredData?: ReactNode
}

const anxietyProblemLabels: Record<string, { title: string; description: string }> = {
  generalized_tension: {
    title: 'Generalized tension',
    description: 'Persistent background worry or daily low-level anxiety that does not fully reset.',
  },
  situational_anxiety: {
    title: 'Situational anxiety',
    description: 'Anxiety tied to specific events, transitions, or anticipatory pressure.',
  },
  social_anxiety: {
    title: 'Social anxiety',
    description: 'Nervousness or performance pressure in social or high-visibility situations.',
  },
  physical_tension: {
    title: 'Physical tension',
    description: 'Somatic anxiety patterns including muscle tightness, shallow breathing, or restlessness.',
  },
  anxious_sleep_onset: {
    title: 'Anxious sleep onset',
    description: 'Worry loops or nervous arousal that delay sleep or prevent full wind-down.',
  },
}

function getProblemKey(claim: EvidenceEngineClaim): string {
  return (claim as EvidenceEngineClaim & { anxiety_problem?: string }).anxiety_problem || claim.problem || ''
}

function profileHrefFor(claim: EvidenceEngineClaim, enrichedOptions: AnxietyOption[]) {
  const option = enrichedOptions.find((item) => item.option.slug === claim.ingredient_slug)
  return option?.profileHref || `/compounds/${claim.ingredient_slug}`
}

export default function AnxietyDecisionExperience({
  enrichedOptions,
  anxietyEvidence,
  structuredData,
}: AnxietyDecisionExperienceProps) {
  const claims = anxietyEvidence.claims
  const problemLabels = {
    ...anxietyProblemLabels,
    ...(anxietyEvidence.problemLabels || {}),
  }
  const claimGroups = groupClaimsByDecisionGroup(claims)
  const safetyGroups = groupSafetyNotesByIngredient(anxietyEvidence.safetyNotes)
  const hasEvidence = claims.length > 0

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      {structuredData}

      <section className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow-label">Anxiety evidence engine</p>
            <h1 className="heading-premium mt-3 text-ink">I want calmer anxiety support. What does the evidence actually support?</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              A workbook-backed anxiety decision page that separates claim, evidence, limitation, source, and safety context before you decide what to research next.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#anxiety-orientation" className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-900">
                Start with the anxiety pattern
              </a>
              <a href="#safety-first" className="inline-flex min-h-11 items-center justify-center rounded-full border border-brand-900/10 bg-white/70 px-5 py-2.5 text-sm font-semibold text-brand-900 transition hover:border-brand-700/30 hover:bg-white">
                Review safety warnings
              </a>
            </div>
          </div>

          <div className="rounded-3xl border border-brand-900/10 bg-white/70 p-5 shadow-sm">
            <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Proof of concept</p>
            <dl className="mt-4 space-y-3 text-sm leading-6 text-muted">
              <div>
                <dt className="font-semibold text-ink">Workbook claims</dt>
                <dd>{claims.length} published anxiety claims</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Safety notes</dt>
                <dd>{anxietyEvidence.safetyNotes.length} ingredient warnings</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Last generated</dt>
                <dd>{anxietyEvidence.updatedAt ? new Date(anxietyEvidence.updatedAt).toLocaleDateString('en-US') : 'Awaiting workbook rows'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="anxiety-orientation" className="card-premium p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Anxiety problem orientation</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Start by naming the anxiety pattern</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            The same ingredient can look useful or weak depending on generalized tension, situational triggers, social pressure, physical symptoms, and sleep interference.
          </p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {Object.entries(problemLabels).map(([key, problem]) => {
            const count = claims.filter((claim) => getProblemKey(claim) === key).length
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
                    const sources = anxietyEvidence.sourcesByClaim[claim.claim_id] || []
                    const safetyNotes = safetyGroups[claim.ingredient_slug] || []
                    return (
                      <EvidenceClaimCard
                        key={claim.claim_id}
                        claim={claim}
                        problemLabel={problemLabels[getProblemKey(claim)]?.title || getProblemKey(claim)}
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
          <h2 className="mt-2 text-2xl font-semibold text-ink">The anxiety Evidence Engine payload is ready, but no claims are published yet</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Add published rows to Anxiety Evidence Claims, Anxiety Evidence Sources, and Anxiety Safety Notes workbook sheets, then rebuild the static data.
          </p>
        </section>
      )}

      <section id="safety-first" className="rounded-[2rem] border border-rose-700/15 bg-rose-50/70 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-800">Safety first</p>
          <h2 className="mt-2 text-2xl font-semibold text-rose-950">Anxiety-support decisions change when risk context changes</h2>
          <p className="mt-3 text-sm leading-7 text-rose-900">
            Do not use supplements to mask persistent panic disorders, severe anxiety, medication interactions, or other complex clinical situations.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {anxietyEvidence.safetyNotes.map((note) => (
            <article key={`${note.safety_id}-global`} className={`rounded-2xl border p-5 ${getSafetySeverityTone(note.severity)}`}>
              <h3 className="text-base font-semibold capitalize">{formatEvidenceLabel(note.ingredient_slug)}</h3>
              <p className="mt-2 text-sm leading-6">{note.warning}</p>
              <p className="mt-2 text-xs font-semibold leading-5">{note.decision_effect}</p>
            </article>
          ))}
        </div>
      </section>

      <footer className="rounded-2xl border border-brand-900/10 bg-brand-950/[0.02] p-5 text-xs leading-6 text-muted">
        Educational only. Not medical advice. Evidence varies by population, preparation, dose, timing, and study design.
        Review medications, health conditions, pregnancy status, and clinician guidance before using supplements.
      </footer>
    </main>
  )
}
