import type { ReactNode } from 'react'
import Link from 'next/link'
import type { Goal } from '@/data/goals'
import type { SleepEvidenceClaim, SleepEvidenceEnginePayload, SleepSafetyNote } from '@/lib/runtime-data'

type SleepOption = {
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

type SleepDecisionExperienceProps = {
  goal: Goal
  enrichedOptions: SleepOption[]
  sleepEvidence: SleepEvidenceEnginePayload
  structuredData?: ReactNode
}

const sleepProblemLabels: Record<string, { title: string; description: string }> = {
  sleep_onset: {
    title: 'Sleep onset',
    description: 'Trouble getting sleepy or shifting into bedtime.',
  },
  sleep_quality: {
    title: 'Sleep quality',
    description: 'Light, unrefreshing, or inconsistent sleep.',
  },
  night_waking: {
    title: 'Night waking',
    description: 'Waking during the night or struggling to return to sleep.',
  },
  racing_mind: {
    title: 'Racing mind',
    description: 'Mental noise, tension, or bedtime rumination.',
  },
  relaxation: {
    title: 'Relaxation',
    description: 'A gentler wind-down target before stronger sedating approaches.',
  },
}

const confidenceLabels: Record<string, { label: string; tone: string; description: string }> = {
  strong_human: {
    label: 'Strong human evidence',
    tone: 'bg-emerald-50 text-emerald-800 ring-emerald-100',
    description: 'Supported by multiple human studies or strong human-focused synthesis.',
  },
  moderate_human: {
    label: 'Moderate human evidence',
    tone: 'bg-teal-50 text-teal-800 ring-teal-100',
    description: 'Human evidence exists, but population, dose, or outcome certainty is still limited.',
  },
  limited_human: {
    label: 'Limited human evidence',
    tone: 'bg-amber-50 text-amber-800 ring-amber-100',
    description: 'Some human signal, but not enough to treat the claim as settled.',
  },
  mixed: {
    label: 'Mixed evidence',
    tone: 'bg-orange-50 text-orange-800 ring-orange-100',
    description: 'Findings vary enough that fit and limitations matter more than the headline.',
  },
  mechanistic_only: {
    label: 'Mechanistic only',
    tone: 'bg-slate-50 text-slate-700 ring-slate-200',
    description: 'Biological plausibility without enough direct human outcome evidence.',
  },
  insufficient: {
    label: 'Insufficient evidence',
    tone: 'bg-zinc-50 text-zinc-700 ring-zinc-200',
    description: 'Not enough reliable evidence for a confident sleep decision.',
  },
}

const safetyTone: Record<string, string> = {
  low: 'border-amber-600/20 bg-amber-50/70 text-amber-950',
  moderate: 'border-orange-700/20 bg-orange-50/70 text-orange-950',
  high: 'border-rose-700/20 bg-rose-50/80 text-rose-950',
}

function groupClaims(claims: SleepEvidenceClaim[]) {
  return claims.reduce<Record<string, SleepEvidenceClaim[]>>((groups, claim) => {
    const group = claim.decision_group || 'Other sleep support'
    groups[group] = groups[group] || []
    groups[group].push(claim)
    return groups
  }, {})
}

function safetyByIngredient(notes: SleepSafetyNote[]) {
  return notes.reduce<Record<string, SleepSafetyNote[]>>((groups, note) => {
    groups[note.ingredient_slug] = groups[note.ingredient_slug] || []
    groups[note.ingredient_slug].push(note)
    return groups
  }, {})
}

function profileHrefFor(claim: SleepEvidenceClaim, enrichedOptions: SleepOption[]) {
  const option = enrichedOptions.find((item) => item.option.slug === claim.ingredient_slug)
  return option?.profileHref || `/compounds/${claim.ingredient_slug}`
}

function confidenceFor(tier: string) {
  return confidenceLabels[tier] || confidenceLabels.insufficient
}

export default function SleepDecisionExperience({
  enrichedOptions,
  sleepEvidence,
  structuredData,
}: SleepDecisionExperienceProps) {
  const claims = sleepEvidence.claims
  const claimGroups = groupClaims(claims)
  const safetyGroups = safetyByIngredient(sleepEvidence.safetyNotes)
  const hasEvidence = claims.length > 0

  return (
    <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-10 lg:px-8 space-y-8">
      {structuredData}

      <section className="hero-shell overflow-hidden rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-10">
        <div className="grid gap-8 lg:grid-cols-[1.15fr_0.85fr] lg:items-center">
          <div>
            <p className="eyebrow-label">Sleep evidence engine</p>
            <h1 className="heading-premium mt-3 text-ink">I want better sleep. What does the evidence actually support?</h1>
            <p className="mt-4 max-w-3xl text-base leading-8 text-muted">
              A workbook-backed sleep decision page that separates claim, evidence, limitation, source, and safety context before you decide what to research next.
            </p>
            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <a href="#sleep-orientation" className="inline-flex min-h-11 items-center justify-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm transition hover:bg-brand-900">
                Start with the sleep problem
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
                <dd>{claims.length} published sleep claims</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Safety notes</dt>
                <dd>{sleepEvidence.safetyNotes.length} ingredient warnings</dd>
              </div>
              <div>
                <dt className="font-semibold text-ink">Last generated</dt>
                <dd>{sleepEvidence.updatedAt ? new Date(sleepEvidence.updatedAt).toLocaleDateString('en-US') : 'Awaiting workbook rows'}</dd>
              </div>
            </dl>
          </div>
        </div>
      </section>

      <section id="sleep-orientation" className="card-premium p-6 sm:p-8">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Sleep problem orientation</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">Start by naming the sleep problem</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            The same ingredient can look useful or weak depending on whether the issue is timing, mental arousal, waking, or general sleep quality.
          </p>
        </div>
        <div className="mt-6 grid gap-3 md:grid-cols-5">
          {Object.entries(sleepProblemLabels).map(([key, problem]) => {
            const count = claims.filter((claim) => claim.sleep_problem === key).length
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
                    const confidence = confidenceFor(claim.confidence_tier)
                    const sources = sleepEvidence.sourcesByClaim[claim.claim_id] || []
                    const safetyNotes = safetyGroups[claim.ingredient_slug] || []
                    return (
                      <article key={claim.claim_id} className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                          <div>
                            <h4 className="text-xl font-semibold text-ink">{claim.ingredient_name}</h4>
                            <p className="mt-1 text-xs font-bold uppercase tracking-[0.14em] text-brand-700">
                              {sleepProblemLabels[claim.sleep_problem]?.title || claim.sleep_problem}
                            </p>
                          </div>
                          <span className={`inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-bold ring-1 ${confidence.tone}`}>
                            {confidence.label}
                          </span>
                        </div>

                        <p className="mt-4 text-sm font-semibold leading-6 text-ink">{claim.claim_statement}</p>
                        <dl className="mt-4 space-y-3 text-sm leading-6">
                          <div>
                            <dt className="font-semibold text-ink">Evidence summary</dt>
                            <dd className="text-muted">{claim.evidence_summary}</dd>
                          </div>
                          <div>
                            <dt className="font-semibold text-ink">Limitations</dt>
                            <dd className="text-muted">{claim.limitations}</dd>
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="rounded-xl bg-brand-50/50 p-3 ring-1 ring-brand-900/5">
                              <dt className="font-semibold text-ink">Best fit</dt>
                              <dd className="mt-1 text-muted">{claim.best_fit}</dd>
                            </div>
                            <div className="rounded-xl bg-zinc-50 p-3 ring-1 ring-zinc-200">
                              <dt className="font-semibold text-ink">Not best fit</dt>
                              <dd className="mt-1 text-muted">{claim.not_best_fit}</dd>
                            </div>
                          </div>
                        </dl>

                        <div className="mt-4 rounded-xl bg-slate-50 p-3 text-xs leading-5 text-slate-700 ring-1 ring-slate-200">
                          <strong>{confidence.label}:</strong> {confidence.description}
                        </div>

                        {safetyNotes.length > 0 ? (
                          <div className="mt-4 space-y-2">
                            <p className="text-xs font-bold uppercase tracking-[0.14em] text-rose-800">Ingredient safety warnings</p>
                            {safetyNotes.map((note) => (
                              <div key={note.safety_id} className={`rounded-xl border p-3 text-xs leading-5 ${safetyTone[note.severity] || safetyTone.moderate}`}>
                                <strong>{note.risk_type.replace(/_/g, ' ')}:</strong> {note.warning}
                                <span className="mt-1 block">{note.decision_effect}</span>
                              </div>
                            ))}
                          </div>
                        ) : null}

                        <div className="mt-4">
                          <p className="text-xs font-bold uppercase tracking-[0.14em] text-brand-700">Claim-specific sources</p>
                          <ul className="mt-2 space-y-2 text-sm leading-6">
                            {sources.map((source) => (
                              <li key={source.source_id}>
                                <a href={source.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-800 hover:text-brand-700 hover:underline">
                                  {source.citation_label}
                                </a>
                                <span className="text-muted"> - {source.title} ({source.year})</span>
                                {source.source_note ? <span className="block text-xs text-muted">{source.source_note}</span> : null}
                              </li>
                            ))}
                          </ul>
                        </div>

                        <Link href={profileHrefFor(claim, enrichedOptions)} className="mt-5 inline-flex text-sm font-semibold text-brand-800 hover:text-brand-700 hover:underline">
                          Read the full profile
                        </Link>
                      </article>
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
          <h2 className="mt-2 text-2xl font-semibold text-ink">The sleep Evidence Engine payload is ready, but no claims are published yet</h2>
          <p className="mt-3 text-sm leading-7 text-muted">
            Add published rows to the Sleep Evidence Claims, Sleep Evidence Sources, and Sleep Safety Notes workbook sheets, then rebuild the static data.
          </p>
        </section>
      )}

      <section id="safety-first" className="rounded-[2rem] border border-rose-700/15 bg-rose-50/70 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl">
          <p className="text-xs font-bold uppercase tracking-[0.18em] text-rose-800">Safety first</p>
          <h2 className="mt-2 text-2xl font-semibold text-rose-950">Sleep supplement decisions change when risk context changes</h2>
          <p className="mt-3 text-sm leading-7 text-rose-900">
            Do not use supplements to mask loud snoring, witnessed apnea, severe daytime sleepiness, persistent insomnia, chest symptoms, or complex medication situations.
          </p>
        </div>
        <div className="mt-6 grid gap-4 md:grid-cols-2">
          {sleepEvidence.safetyNotes.map((note) => (
            <article key={`${note.safety_id}-global`} className={`rounded-2xl border p-5 ${safetyTone[note.severity] || safetyTone.moderate}`}>
              <h3 className="text-base font-semibold capitalize">{note.ingredient_slug.replace(/-/g, ' ')}</h3>
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
