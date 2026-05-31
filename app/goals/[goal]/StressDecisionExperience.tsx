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
import type { StressEvidenceEnginePayload } from '@/lib/runtime-data'

type StressOption = {
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

type StressDecisionExperienceProps = {
  goal: Goal
  enrichedOptions: StressOption[]
  stressEvidence: StressEvidenceEnginePayload
  structuredData?: ReactNode
}

const stressProblemLabels: Record<string, { title: string; description: string }> = {
  acute_stress: {
    title: 'Acute stress',
    description: 'Short-term spikes in tension, pressure, or overwhelm.',
  },
  stress_reactivity: {
    title: 'Stress reactivity',
    description: 'Feeling easily triggered with stronger physical or emotional responses.',
  },
  baseline_tension: {
    title: 'Baseline tension',
    description: 'Persistent background strain that does not fully reset.',
  },
  stress_sleep_spillover: {
    title: 'Stress-sleep spillover',
    description: 'Stress carrying into bedtime, sleep continuity, or next-day recovery.',
  },
  cognitive_stress_load: {
    title: 'Cognitive stress load',
    description: 'Rumination, cognitive fatigue, or pressure-linked focus disruption.',
  },
}

function getProblemKey(claim: EvidenceEngineClaim): string {
  return claim.stress_problem || claim.problem || ''
}

function profileHrefFor(claim: EvidenceEngineClaim, enrichedOptions: StressOption[]) {
  const option = enrichedOptions.find((item) => item.option.slug === claim.ingredient_slug)
  return option?.profileHref || `/compounds/${claim.ingredient_slug}`
}

export default function StressDecisionExperience({
  enrichedOptions,
  stressEvidence,
  structuredData,
}: StressDecisionExperienceProps) {
  const claims = stressEvidence.claims
  const problemLabels = {
    ...stressProblemLabels,
    ...(stressEvidence.problemLabels || {}),
  }
  const claimGroups = groupClaimsByDecisionGroup(claims)
  const safetyGroups = groupSafetyNotesByIngredient(stressEvidence.safetyNotes)
  const hasEvidence = claims.length > 0

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      {structuredData}

      <section className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow-label">Stress evidence engine</p>
            <h1 className="heading-premium mt-3 text-ink">I want calmer stress response. What does the evidence actually support?</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              A workbook-backed stress decision page that separates claim, evidence, limitation, source, and safety context before you decide what to research next.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#stress-orientation" className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-900">
                Start with the stress pattern
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
                <dd>{claims.length} published stress claims</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Safety notes</dt>
                <dd>{stressEvidence.safetyNotes.length} ingredient warnings</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Last generated</dt>
                <dd>{stressEvidence.updatedAt ? new Date(stressEvidence.updatedAt).toLocaleDateString('en-US') : 'Awaiting workbook rows'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="stress-orientation" className="card-premium p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Stress problem orientation</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Start by naming the stress pattern</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            The same ingredient can look useful or weak depending on acute pressure, baseline tension, reactivity, and sleep spillover.
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
                    const sources = stressEvidence.sourcesByClaim[claim.claim_id] || []
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
          <h2 className="mt-2 text-2xl font-semibold text-ink">The stress Evidence Engine payload is ready, but no claims are published yet</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Add published rows to Stress Evidence Claims, Stress Evidence Sources, and Stress Safety Notes workbook sheets, then rebuild the static data.
          </p>
        </section>
      )}

      <section id="safety-first" className="rounded-[2rem] border border-rose-700/15 bg-rose-50/70 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-800">Safety first</p>
          <h2 className="mt-2 text-2xl font-semibold text-rose-950">Stress-support decisions change when risk context changes</h2>
          <p className="mt-3 text-sm leading-7 text-rose-900">
            Do not use supplements to mask persistent panic symptoms, severe mood instability, unsafe medication interactions, or other complex clinical situations.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {stressEvidence.safetyNotes.map((note) => (
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
