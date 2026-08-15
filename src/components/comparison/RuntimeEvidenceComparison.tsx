import Link from 'next/link'
import { notFound } from 'next/navigation'

import ComparisonTable from '@/components/ComparisonTable'
import Disclaimer from '@/src/components/Disclaimer'
import {
  firstComparisonField,
  optionalComparisonField,
  resolveRuntimeComparisonSide,
  type ResolvedRuntimeComparisonSide,
  type RuntimeComparisonSideConfig,
} from '@/src/lib/runtime-comparison-resolution'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'
import type { RuntimeRecord } from '@/src/types/content'

type SideConfig = RuntimeComparisonSideConfig

type Props = {
  title: string
  summary: string
  left: SideConfig
  right: SideConfig
  goal?: string
}

type ResolvedSide = ResolvedRuntimeComparisonSide

type EvidenceBand = {
  label: 'A' | 'B' | 'C' | 'D' | 'Avoid/Insufficient'
  score: number
}

function choiceChecks(side: ResolvedSide): string[] {
  if (!side.record) {
    return ['A canonical record is available and complete enough to support a real comparison.']
  }

  return [
    'Its human-evidence summary directly addresses the outcome you are researching.',
    'Its studied dose and formulation context match the form you are actually evaluating.',
    'You have reviewed its documented safety and interaction constraints rather than choosing on marketing claims alone.',
  ]
}

function neitherChecks(goal?: string): string[] {
  return [
    goal
      ? `Neither option has adequate human outcome evidence for the actual decision context: ${goal}.`
      : 'Neither option has adequate human outcome evidence for the outcome you are actually researching.',
    'The available comparison is driven mainly by mechanism, chemistry, or marketing rather than replicated human outcomes.',
    'A contraindication, medication interaction, pregnancy concern, or other safety constraint makes unsupervised use inappropriate.',
    'The relevant studied formulation or dose is materially different from the product or form being considered.',
  ]
}

function evidenceBand(record: RuntimeRecord | null): EvidenceBand | null {
  if (!record) return null
  const source = record as unknown as Record<string, unknown>
  const rawValue = source.evidence_grade ?? source.evidence_level ?? source.grade
  const raw = typeof rawValue === 'string' ? rawValue.trim().toUpperCase() : ''
  if (!raw) return null

  if (raw.includes('AVOID') || raw.includes('INSUFFICIENT')) return { label: 'Avoid/Insufficient', score: 0 }
  if (/^A(?:\b|[+-])/.test(raw) || raw.includes('STRONG')) return { label: 'A', score: 4 }
  if (/^B(?:\b|[+-])/.test(raw) || raw.includes('MODERATE')) return { label: 'B', score: 3 }
  if (/^C(?:\b|[+-])/.test(raw) || raw.includes('LIMITED') || raw.includes('PRELIMINARY')) return { label: 'C', score: 2 }
  if (/^D(?:\b|[+-])/.test(raw) || raw.includes('WEAK')) return { label: 'D', score: 1 }
  return null
}

function quickVerdict(leftSide: ResolvedSide, rightSide: ResolvedSide): { heading: string; detail: string } {
  const leftBand = evidenceBand(leftSide.record)
  const rightBand = evidenceBand(rightSide.record)

  if (leftBand && rightBand) {
    if (leftBand.score > rightBand.score) {
      return {
        heading: `Evidence edge: ${leftSide.label}`,
        detail: `${leftSide.label} has the stronger profile-level evidence grade in the canonical records (${leftBand.label} vs ${rightBand.label}). That is an overall evidence signal, not proof that it is better for every outcome.`,
      }
    }
    if (rightBand.score > leftBand.score) {
      return {
        heading: `Evidence edge: ${rightSide.label}`,
        detail: `${rightSide.label} has the stronger profile-level evidence grade in the canonical records (${rightBand.label} vs ${leftBand.label}). That is an overall evidence signal, not proof that it is better for every outcome.`,
      }
    }
    return {
      heading: 'No profile-level evidence winner',
      detail: `Both canonical records currently carry the same profile-level evidence grade (${leftBand.label}). The useful decision therefore depends on outcome-specific human evidence, dose, formulation, and safety rather than the overall grade alone.`,
    }
  }

  if (leftBand || rightBand) {
    const gradedSide = leftBand ? leftSide : rightSide
    const band = leftBand ?? rightBand
    return {
      heading: 'No defensible grade-to-grade winner',
      detail: `Only ${gradedSide.label} currently exposes a canonical profile-level evidence grade (${band?.label}). The comparison should not manufacture a winner while the other side lacks a directly comparable grade.`,
    }
  }

  return {
    heading: 'No defensible evidence-grade winner yet',
    detail: 'Neither canonical record exposes a comparable profile-level evidence grade, so this page keeps the verdict unresolved rather than converting mechanism or marketing language into a clinical ranking.',
  }
}

export default async function RuntimeEvidenceComparison({ title, summary, left, right, goal }: Props) {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  const runtimeHerbs = herbs as RuntimeRecord[]
  const runtimeCompounds = compounds as RuntimeRecord[]
  const leftSide = resolveRuntimeComparisonSide(left, runtimeHerbs, runtimeCompounds)
  const rightSide = resolveRuntimeComparisonSide(right, runtimeHerbs, runtimeCompounds)

  if (!leftSide.record || !rightSide.record) notFound()

  const verdict = quickVerdict(leftSide, rightSide)
  const leftStudiedDoseCost = optionalComparisonField(leftSide.record, [
    'cost_per_studied_dose',
    'cost_per_effective_dose',
    'studied_dose_cost',
  ])
  const rightStudiedDoseCost = optionalComparisonField(rightSide.record, [
    'cost_per_studied_dose',
    'cost_per_effective_dose',
    'studied_dose_cost',
  ])

  const rows = [
    {
      label: 'Evidence strength',
      values: [
        firstComparisonField(leftSide.record, ['evidence_grade', 'evidence_level', 'evidence_summary']),
        firstComparisonField(rightSide.record, ['evidence_grade', 'evidence_level', 'evidence_summary']),
      ],
    },
    {
      label: 'Human evidence',
      values: [
        firstComparisonField(leftSide.record, ['human_evidence', 'evidence_summary']),
        firstComparisonField(rightSide.record, ['human_evidence', 'evidence_summary']),
      ],
    },
    {
      label: 'Studied dose / dose context',
      values: [
        firstComparisonField(leftSide.record, ['typical_dosage', 'dosage', 'dose']),
        firstComparisonField(rightSide.record, ['typical_dosage', 'dosage', 'dose']),
      ],
    },
    {
      label: 'Forms / preparation',
      values: [
        firstComparisonField(leftSide.record, ['forms', 'available_forms', 'bioavailability_notes']),
        firstComparisonField(rightSide.record, ['forms', 'available_forms', 'bioavailability_notes']),
      ],
    },
    {
      label: 'Safety',
      values: [
        firstComparisonField(leftSide.record, ['safety', 'contraindications', 'side_effects']),
        firstComparisonField(rightSide.record, ['safety', 'contraindications', 'side_effects']),
      ],
    },
    {
      label: 'Interactions',
      values: [
        firstComparisonField(leftSide.record, ['interactions']),
        firstComparisonField(rightSide.record, ['interactions']),
      ],
    },
    {
      label: 'Mechanism context',
      values: [
        firstComparisonField(leftSide.record, ['mechanism', 'mechanisms']),
        firstComparisonField(rightSide.record, ['mechanism', 'mechanisms']),
      ],
    },
  ]

  if (leftStudiedDoseCost || rightStudiedDoseCost) {
    rows.splice(4, 0, {
      label: 'Cost per studied dose',
      values: [
        leftStudiedDoseCost || 'Not available in the canonical record.',
        rightStudiedDoseCost || 'Not available in the canonical record.',
      ],
    })
  }

  return (
    <main className="container-page space-y-8 py-10">
      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:text-ink">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/guides/compare/" className="hover:text-ink">Compare</Link>
        <span aria-hidden="true"> / </span>
        <span className="text-ink">{title}</span>
      </nav>

      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Evidence-first comparison</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">{title}</h1>
        {goal ? <p className="text-sm leading-6 text-muted">Primary decision context: <strong className="text-ink">{goal}</strong>.</p> : null}
      </header>

      <section className="card-premium max-w-5xl space-y-4 p-6 sm:p-8" aria-labelledby="quick-verdict">
        <p className="eyebrow-label">Quick verdict</p>
        <h2 id="quick-verdict" className="text-2xl font-semibold text-ink">{verdict.heading}</h2>
        <p className="text-base font-medium leading-7 text-ink">{verdict.detail}</p>
        <p className="leading-7 text-muted">{summary}</p>
        <p className="text-sm leading-6 text-muted">
          The table below is populated from each ingredient’s canonical runtime record. Missing fields stay visibly missing rather than being filled with mechanism-derived assumptions.
        </p>
      </section>

      <section className="grid max-w-5xl gap-4 sm:grid-cols-2" aria-label="Choose by evidence fit">
        {[leftSide, rightSide].map((side) => (
          <article key={`choose-${side.label}`} className="card-premium p-5">
            <p className="text-xs font-bold uppercase tracking-wider text-brand-700">Choose {side.label} if…</p>
            <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
              {choiceChecks(side).map((reason) => (
                <li key={reason} className="flex gap-2">
                  <span aria-hidden="true" className="font-bold text-brand-700">•</span>
                  <span>{reason}</span>
                </li>
              ))}
            </ul>
          </article>
        ))}
      </section>

      <section className="max-w-5xl rounded-2xl border border-amber-500/20 bg-amber-50/60 p-5 dark:bg-amber-950/10" aria-labelledby="neither-fit">
        <p className="text-xs font-bold uppercase tracking-wider text-amber-800 dark:text-amber-200">Neither may be appropriate if…</p>
        <h2 id="neither-fit" className="mt-1 text-xl font-semibold text-ink">The comparison itself does not clear the decision bar</h2>
        <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
          {neitherChecks(goal).map((reason) => (
            <li key={reason} className="flex gap-2">
              <span aria-hidden="true" className="font-bold text-amber-700">•</span>
              <span>{reason}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="card-premium max-w-5xl p-4 sm:p-6">
        <ComparisonTable
          title={`${leftSide.label} vs ${rightSide.label}: evidence, dose, and safety`}
          headers={['Dimension', leftSide.label, rightSide.label]}
          rows={rows}
        />
        {(leftStudiedDoseCost || rightStudiedDoseCost) ? (
          <p className="mt-3 text-xs leading-5 text-muted">
            Cost-per-studied-dose is shown only when an explicit canonical cost field is present. It is intentionally omitted when reliable maintained product-cost data is unavailable.
          </p>
        ) : null}
      </section>

      <section className="grid max-w-5xl gap-4 sm:grid-cols-2">
        {[leftSide, rightSide].map((side) => (
          <article key={side.label} className="card-premium space-y-3 p-5">
            <h2 className="text-xl font-semibold text-ink">{side.label}</h2>
            <p className="text-sm leading-6 text-muted">
              {firstComparisonField(side.record, ['summary', 'short_description', 'description'])}
            </p>
            {side.href ? <Link href={side.href} className="font-semibold text-brand-700 hover:underline">Read the full profile →</Link> : null}
          </article>
        ))}
      </section>

      <section className="max-w-5xl rounded-2xl border border-brand-900/10 bg-white/70 p-5 text-sm leading-6 text-muted dark:bg-white/5">
        Mechanism differences are shown as mechanism context, not as proof of different health benefits. Comparison conclusions should follow human outcome evidence, safety, dose, and formulation data where those fields are available.
      </section>

      <Disclaimer />
    </main>
  )
}
