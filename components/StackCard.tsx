export type StackItem = {
  compound?: string
  compound_slug?: string
  display_name?: string
  dosage?: string
  timing?: string
  role?: 'anchor' | 'amplifier' | 'support' | 'optional' | 'finisher'
  evidence_tier?: string
  safety_flags?: string[]
}

const formatCompoundName = (compound: string) =>
  compound
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const formatRole = (role?: string) =>
  String(role || '')
    .replace(/[-_]/g, ' ')
    .replace(/\b\w/g, char => char.toUpperCase())

export default function StackCard({ item }: { item: StackItem }) {
  const compoundSlug = item.compound_slug || item.compound || ''
  const displayName = item.display_name || formatCompoundName(compoundSlug)
  const safetyFlags = Array.isArray(item.safety_flags) ? item.safety_flags : []

  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4 transition hover:border-emerald-300/25 hover:bg-white/[0.045]'>
      <div className='flex items-start justify-between gap-3'>
        <div className='min-w-0'>
          <h3 className='text-lg font-black leading-tight text-white'>{displayName}</h3>
          {item.role ? <p className='mt-1 text-xs font-bold uppercase tracking-[0.16em] text-emerald-100/60'>{formatRole(item.role)}</p> : null}
        </div>
        {item.evidence_tier ? (
          <span className='shrink-0 rounded-full border border-white/10 bg-black/20 px-2.5 py-1 text-[0.68rem] font-bold text-white/55'>
            {item.evidence_tier}
          </span>
        ) : null}
      </div>

      <div className='mt-4 grid gap-2 text-sm text-white/70 sm:grid-cols-2'>
        {item.dosage && (
          <p className='rounded-xl border border-white/8 bg-black/15 px-3 py-2'>
            <span className='font-bold text-white/85'>Dose</span> · {item.dosage}
          </p>
        )}
        {item.timing && (
          <p className='rounded-xl border border-white/8 bg-black/15 px-3 py-2'>
            <span className='font-bold text-white/85'>Timing</span> · {item.timing}
          </p>
        )}
      </div>

      {safetyFlags.length > 0 ? (
        <p className='mt-3 rounded-xl border border-amber-300/20 bg-amber-300/[0.06] px-3 py-2 text-xs leading-5 text-amber-50/80'>
          <span className='font-bold text-amber-100'>Safety:</span> {safetyFlags.slice(0, 2).join(', ')}
        </p>
      ) : null}
    </div>
  )
}
