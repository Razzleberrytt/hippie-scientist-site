import Link from 'next/link'

import ComparisonTable from '@/components/ComparisonTable'
import Disclaimer from '@/src/components/Disclaimer'
import { getUnifiedRuntimeRecords } from '@/src/lib/runtime-record-index'

type RuntimeIngredient = Record<string, unknown> & {
  slug?: string
  name?: string
}

type SideConfig = {
  label: string
  candidates: string[]
}

type Props = {
  title: string
  summary: string
  left: SideConfig
  right: SideConfig
  goal?: string
}

type ResolvedSide = {
  label: string
  record: RuntimeIngredient | null
  href: string | null
}

function clean(value: unknown): string {
  if (typeof value !== 'string') return ''
  return value.replace(/\s+/g, ' ').trim()
}

function toText(value: unknown): string {
  if (typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') return clean(String(value))
  if (Array.isArray(value)) return value.map(toText).filter(Boolean).join('; ')
  if (value && typeof value === 'object') {
    return Object.entries(value as Record<string, unknown>)
      .map(([key, nested]) => {
        const text = toText(nested)
        return text ? `${key.replace(/[_-]+/g, ' ')}: ${text}` : ''
      })
      .filter(Boolean)
      .join('; ')
  }
  return ''
}

function firstField(record: RuntimeIngredient | null, keys: string[]): string {
  if (!record) return 'Not available in the canonical record.'
  for (const key of keys) {
    const value = toText(record[key])
    if (value) return value
  }
  return 'Not available in the canonical record.'
}

async function resolveSide(config: SideConfig): Promise<ResolvedSide> {
  const { herbs, compounds } = await getUnifiedRuntimeRecords()
  const candidates = new Set(config.candidates)

  const herb = (herbs as RuntimeIngredient[]).find((record) => candidates.has(clean(record.slug)))
  if (herb) return { label: config.label, record: herb, href: `/herbs/${clean(herb.slug)}/` }

  const compound = (compounds as RuntimeIngredient[]).find((record) => candidates.has(clean(record.slug)))
  if (compound) return { label: config.label, record: compound, href: `/compounds/${clean(compound.slug)}/` }

  return { label: config.label, record: null, href: null }
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

export default async function RuntimeEvidenceComparison({ title, summary, left, right, goal }: Props) {
  const [leftSide, rightSide] = await Promise.all([resolveSide(left), resolveSide(right)])

  const rows = [
    {
      label: 'Evidence strength',
      values: [
        firstField(leftSide.record, ['evidence_grade', 'evidence_level', 'evidence_summary']),
        firstField(rightSide.record, ['evidence_grade', 'evidence_level', 'evidence_summary']),
      ],
    },
    {
      label: 'Human evidence',
      values: [
        firstField(leftSide.record, ['human_evidence', 'evidence_summary']),
        firstField(rightSide.record, ['human_evidence', 'evidence_summary']),
      ],
    },
    {
      label: 'Studied dose / dose context',
      values: [
        firstField(leftSide.record, ['typical_dosage', 'dosage', 'dose']),
        firstField(rightSide.record, ['typical_dosage', 'dosage', 'dose']),
      ],
    },
    {
      label: 'Forms / preparation',
      values: [
        firstField(leftSide.record, ['forms', 'available_forms', 'bioavailability_notes']),
        firstField(rightSide.record, ['forms', 'available_forms', 'bioavailability_notes']),
      ],
    },
    {
      label: 'Safety',
      values: [
        firstField(leftSide.record, ['safety', 'contraindications', 'side_effects']),
        firstField(rightSide.record, ['safety', 'contraindications', 'side_effects']),
      ],
    },
    {
      label: 'Interactions',
      values: [
        firstField(leftSide.record, ['interactions']),
        firstField(rightSide.record, ['interactions']),
      ],
    },
    {
      label: 'Mechanism context',
      values: [
        firstField(leftSide.record, ['mechanism', 'mechanisms']),
        firstField(rightSide.record, ['mechanism', 'mechanisms']),
      ],
    },
  ]

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
        <p className="text-lg leading-8 text-muted">{summary}</p>
        {goal ? <p className="text-sm leading-6 text-muted">Primary decision context: <strong className="text-ink">{goal}</strong>.</p> : null}
      </header>

      <section className="card-premium max-w-5xl space-y-4 p-6 sm:p-8" aria-labelledby="quick-verdict">
        <p className="eyebrow-label">Quick verdict</p>
        <h2 id="quick-verdict" className="text-2xl font-semibold text-ink">Start with the evidence, not the label</h2>
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

      <section className="card-premium max-w-5xl p-4 sm:p-6">
        <ComparisonTable
          title={`${leftSide.label} vs ${rightSide.label}: evidence, dose, and safety`}
          headers={['Dimension', leftSide.label, rightSide.label]}
          rows={rows}
        />
      </section>

      <section className="grid max-w-5xl gap-4 sm:grid-cols-2">
        {[leftSide, rightSide].map((side) => (
          <article key={side.label} className="card-premium space-y-3 p-5">
            <h2 className="text-xl font-semibold text-ink">{side.label}</h2>
            <p className="text-sm leading-6 text-muted">
              {side.record ? firstField(side.record, ['summary', 'short_description', 'description']) : 'A canonical record could not be resolved for this side of the comparison.'}
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
