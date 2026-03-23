import { Link } from 'react-router-dom'
import type { ConfidenceLevel } from '@/utils/calculateConfidence'
import type { CompoundCompleteness, HerbCompleteness } from '@/utils/getDataCompleteness'

type Entity = 'herb' | 'compound'

type DataTrustPanelProps = {
  entity: Entity
  confidence: ConfidenceLevel
  completeness: HerbCompleteness | CompoundCompleteness
}

type FieldStatus = {
  label: string
  present: boolean
}

function confidenceBadgeClass(level: ConfidenceLevel) {
  if (level === 'high') {
    return 'border-emerald-300/50 bg-emerald-500/15 text-emerald-100'
  }
  if (level === 'medium') {
    return 'border-amber-300/45 bg-amber-500/15 text-amber-100'
  }
  return 'border-rose-300/50 bg-rose-500/15 text-rose-100'
}

function completenessTone(score: number) {
  if (score >= 75) return 'text-emerald-200'
  if (score >= 50) return 'text-amber-200'
  return 'text-rose-200'
}

function getFieldStatuses(
  entity: Entity,
  completeness: HerbCompleteness | CompoundCompleteness
): FieldStatus[] {
  if (entity === 'herb') {
    const herb = completeness as HerbCompleteness
    return [
      { label: 'Mechanism', present: herb.hasMechanism },
      { label: 'Effects', present: herb.hasEffects },
      { label: 'Active compounds', present: herb.hasActiveCompounds },
      { label: 'Contraindications', present: herb.hasContraindications },
    ]
  }

  const compound = completeness as CompoundCompleteness
  return [
    { label: 'Mechanism', present: compound.hasMechanism },
    { label: 'Effects', present: compound.hasEffects },
    { label: 'Safety', present: compound.hasSafety },
    { label: 'Associated herbs', present: compound.hasHerbs },
  ]
}

function getExplanation(
  entity: Entity,
  completeness: HerbCompleteness | CompoundCompleteness
): string {
  const fieldStatuses = getFieldStatuses(entity, completeness)
  const present = fieldStatuses.filter(field => field.present)
  const missing = fieldStatuses.filter(field => !field.present)

  if (present.length >= 4) {
    return 'This entry has relatively complete structured data.'
  }

  if (present.length <= 1) {
    return 'This entry is currently sparse and should be treated as incomplete.'
  }

  const presentText = present.map(field => field.label.toLowerCase()).join(', ')
  if (missing.some(field => field.label === 'Safety' || field.label === 'Contraindications')) {
    return `This entry has ${presentText} data but limited safety information.`
  }

  return `This entry has ${presentText} data, with some missing core fields.`
}

function FieldList({ fields, emptyText }: { fields: FieldStatus[]; emptyText: string }) {
  if (fields.length === 0) {
    return <p className='text-xs text-white/65'>{emptyText}</p>
  }

  return (
    <ul className='space-y-1.5'>
      {fields.map(field => (
        <li key={field.label} className='flex items-center gap-2 text-sm text-white/90'>
          <span aria-hidden='true' className='text-base leading-none'>
            {field.present ? '✓' : '•'}
          </span>
          <span>{field.label}</span>
        </li>
      ))}
    </ul>
  )
}

export default function DataTrustPanel({ entity, confidence, completeness }: DataTrustPanelProps) {
  const fieldStatuses = getFieldStatuses(entity, completeness)
  const presentFields = fieldStatuses.filter(field => field.present)
  const missingFields = fieldStatuses.filter(field => !field.present)
  const explanation = getExplanation(entity, completeness)

  return (
    <section className='mt-4 rounded-2xl border border-white/15 bg-white/5 p-4 shadow-[0_8px_30px_rgba(0,0,0,0.25)] backdrop-blur-xl'>
      <div className='flex flex-wrap items-center justify-between gap-2'>
        <h2 className='text-sm font-semibold uppercase tracking-[0.16em] text-white/75'>
          Data trust
        </h2>
        <span
          className={`rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-wide ${confidenceBadgeClass(confidence)}`}
        >
          Confidence: {confidence}
        </span>
      </div>

      <div className='mt-3 flex flex-wrap items-center justify-between gap-2'>
        <p className='text-sm text-white/80'>Completeness score</p>
        <p className={`text-sm font-semibold ${completenessTone(completeness.completenessScore)}`}>
          {completeness.completenessScore}%
        </p>
      </div>

      <p className='mt-3 text-sm text-white/85'>{explanation}</p>

      <div className='mt-4 grid gap-3 sm:grid-cols-2'>
        <div className='rounded-xl border border-emerald-300/25 bg-emerald-500/10 p-3'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-emerald-100'>
            Present data
          </p>
          <FieldList fields={presentFields} emptyText='No core fields are populated.' />
        </div>
        <div className='rounded-xl border border-amber-300/25 bg-amber-500/10 p-3'>
          <p className='mb-2 text-xs font-semibold uppercase tracking-wide text-amber-100'>
            Missing data
          </p>
          <FieldList fields={missingFields} emptyText='No key fields are currently missing.' />
        </div>
      </div>

      <div className='mt-4'>
        <Link
          to='/methodology'
          className='text-xs text-cyan-100 underline decoration-dotted underline-offset-4 transition hover:text-cyan-50'
        >
          How confidence works
        </Link>
      </div>
    </section>
  )
}
