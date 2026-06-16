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

const SLUG_MAPPING: Record<string, string> = {
  'citicoline': 'cdp-choline',
  'collagen': 'collagen-peptides',
  'green-tea-extract-egcg': 'green-tea-extract',
  'rhodiola-rosea': 'rhodiola',
}

export default function StackCard({
  item,
  entityType = 'compound',
  affiliateUrl,
  affiliateLabel,
}: {
  item: StackItem
  entityType?: 'herb' | 'compound'
  affiliateUrl?: string
  affiliateLabel?: string
}) {
  const rawSlug = item.compound_slug || item.compound || ''
  const compoundSlug = SLUG_MAPPING[rawSlug] || rawSlug
  const displayName = item.display_name || formatCompoundName(compoundSlug)
  const evidence = item.evidence_tier || item.evidence_grade || 'Limited'
  const dosage = item.dosage_range || item.dosage || 'See profile'

  return (
    <article className='rounded-2xl border border-neutral-200/60 bg-white p-6 shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition duration-200 motion-safe:hover:-translate-y-[1px] hover:shadow-[0_6px_20px_rgba(0,0,0,0.06)] flex flex-col justify-between'>
      <div>
        <div className='flex items-start justify-between gap-3'>
          <h3 className='text-base font-bold leading-tight text-ink'>{displayName}</h3>
          <EvidenceBadge value={evidence} />
        </div>

        <p className='mt-3 rounded-xl border border-neutral-200 bg-neutral-50 px-3 py-2 text-sm text-neutral-700'>
          <span className='font-semibold text-ink'>Dose</span> · {dosage}
        </p>
      </div>

      <div className='mt-4 flex flex-col gap-2'>
        {compoundSlug ? (
          <Link href={entityType === 'herb' ? `/herbs/${compoundSlug}` : `/compounds/${compoundSlug}`} className='text-sm font-bold text-teal-700 hover:text-teal-900'>
            Full profile →
          </Link>
        ) : null}

        {affiliateUrl ? (
          <a
            href={affiliateUrl}
            target="_blank"
            rel="nofollow sponsored noopener noreferrer"
            className="inline-flex w-full items-center justify-center rounded-full bg-brand-950 px-3.5 py-2 text-xs font-bold text-white transition hover:bg-brand-900"
          >
            {affiliateLabel || 'Shop sourcing options'} →
          </a>
        ) : null}
      </div>
    </article>
  )
}
