import Link from 'next/link'
import { EvidenceBadge } from '@/components/ui'

export type StackItem = {
  compound?: string
  compound_slug?: string
  display_name?: string
  dosage?: string
  dosage_range?: string
  timing?: string
  role?: 'anchor' | 'amplifier' | 'support' | 'optional' | 'finisher'
  evidence_tier?: string
  evidence_grade?: string
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

export default function StackCard({ item }: { item: StackItem }) {
  const compoundSlug = item.compound_slug || item.compound || ''
  const displayName = item.display_name || formatCompoundName(compoundSlug)
  const evidence = item.evidence_tier || item.evidence_grade || 'Limited'
  const dosage = item.dosage_range || item.dosage || 'See profile'

  return (
    <article className='rounded-2xl border border-neutral-200 bg-white p-4 shadow-card transition hover:border-teal-200 hover:shadow-lg'>
      <div className='flex items-start justify-between gap-3'>
        <h3 className='text-base font-bold leading-tight text-ink'>{displayName}</h3>
        <EvidenceBadge value={evidence} />
      </div>

      <p className='mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700'>
        <span className='font-semibold text-ink'>Dose</span> · {dosage}
      </p>

      {compoundSlug ? (
        <Link href={`/compounds/${compoundSlug}`} className='mt-4 inline-block text-sm font-bold text-teal-700 hover:text-teal-900'>
          Full profile →
        </Link>
      ) : null}
    </article>
  )
}
