export type StackItem = {
  compound: string
  dosage: string
  timing: string
  role: 'anchor' | 'amplifier' | 'support' | 'finisher'
}

const formatCompoundName = (compound: string) =>
  compound
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

export default function StackCard({ item }: { item: StackItem }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
      <div className='flex items-start justify-between gap-3'>
        <h3 className='font-bold text-white'>{formatCompoundName(item.compound)}</h3>
        <span className='rounded-full border border-emerald-300/20 bg-emerald-300/10 px-2.5 py-1 text-[0.68rem] font-bold uppercase tracking-[0.16em] text-emerald-100'>
          {item.role}
        </span>
      </div>
      <div className='mt-3 grid gap-2 text-sm text-white/70 sm:grid-cols-2'>
        <p><strong className='text-white/85'>Dosage:</strong> {item.dosage}</p>
        <p><strong className='text-white/85'>Timing:</strong> {item.timing}</p>
      </div>
    </div>
  )
}
