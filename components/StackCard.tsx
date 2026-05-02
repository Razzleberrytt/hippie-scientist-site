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

export default function StackCard({ item }: { item: StackItem }) {
  const compoundSlug = item.compound_slug || item.compound || ''
  const displayName = item.display_name || formatCompoundName(compoundSlug)
  const safetyFlags = Array.isArray(item.safety_flags) ? item.safety_flags : []

  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
      <div className='flex items-start justify-between gap-3'>
        <h3 className='font-bold text-white'>{displayName}</h3>
        {item.role && (
          <span className='rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-100'>
            {item.role}
          </span>
        )}
      </div>
      <div className='mt-3 grid gap-2 text-sm text-white/70 sm:grid-cols-2'>
        {item.dosage && <p><strong className='text-white/85'>Dosage:</strong> {item.dosage}</p>}
        {item.timing && <p><strong className='text-white/85'>Timing:</strong> {item.timing}</p>}
        {item.evidence_tier && <p><strong className='text-white/85'>Evidence:</strong> {item.evidence_tier}</p>}
        {safetyFlags.length > 0 && <p><strong className='text-white/85'>Safety:</strong> {safetyFlags.join(', ')}</p>}
      </div>
    </div>
  )
}
