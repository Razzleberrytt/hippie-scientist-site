import Link from 'next/link'

export type StackItem = {
  compound?: string
  compound_slug?: string
  display_name?: string
  dosage?: string
  timing?: string
  role?: 'anchor' | 'amplifier' | 'support' | 'optional' | 'finisher'
  evidence_tier?: string
  evidence_note?: string
  note?: string
  summary?: string
  safety_flags?: string[]
}

const formatCompoundName = (compound: string) =>
  compound
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const formatEvidence = (value?: string) =>
  String(value || 'Evidence tracked')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

export default function StackCard({ item }: { item: StackItem }) {
  const compoundSlug = item.compound_slug || item.compound || ''
  const displayName = item.display_name || formatCompoundName(compoundSlug)
  const safetyFlags = Array.isArray(item.safety_flags) ? item.safety_flags : []
  const evidenceNote = item.evidence_note || item.note || item.summary || 'Review dose, timing, and evidence context before use.'

  return (
    <article className='rounded-2xl border border-neutral-200 bg-white p-4 shadow-card transition hover:border-teal-200 hover:shadow-lg'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='text-lg font-bold leading-tight text-neutral-950'>{displayName}</h3>
          <p className='mt-2 text-sm leading-6 text-neutral-600'>{evidenceNote}</p>
        </div>
        <span className='shrink-0 rounded-full border border-teal-200 bg-teal-50 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-wide text-teal-700'>
          {formatEvidence(item.evidence_tier)}
        </span>
      </div>

      <div className='mt-4 grid gap-2 text-sm sm:grid-cols-2'>
        <p className='rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-700'>
          <span className='font-semibold text-neutral-950'>Dose</span> · {item.dosage || 'See profile'}
        </p>
        <p className='rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-neutral-700'>
          <span className='font-semibold text-neutral-950'>Timing</span> · {item.timing || 'Goal dependent'}
        </p>
      </div>

      <div className='mt-4 flex flex-wrap items-center gap-2'>
        {safetyFlags.length > 0 ? (
          <span className='rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-800'>
            Safety: {safetyFlags.slice(0, 2).join(', ')}
          </span>
        ) : (
          <span className='rounded-full border border-teal-200 bg-teal-50 px-3 py-1 text-xs font-semibold text-teal-800'>Safety context tracked</span>
        )}
        {compoundSlug ? (
          <Link href={`/compounds/${compoundSlug}`} className='text-xs font-bold text-teal-700 hover:text-teal-900'>
            Full profile →
          </Link>
        ) : null}
      </div>
    </article>
  )
}
