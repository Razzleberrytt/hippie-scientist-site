type StackItem = {
  compound: string
  dosage: string
  timing: string
  role: string
}

export default function StackCard({ item }: { item: StackItem }) {
  return (
    <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4'>
      <div className='flex items-center justify-between'>
        <h3 className='font-bold text-white capitalize'>{item.compound.replace(/-/g, ' ')}</h3>
        <span className='text-xs uppercase text-emerald-200'>{item.role}</span>
      </div>
      <div className='mt-2 text-sm text-white/70'>
        <p><strong>Dosage:</strong> {item.dosage}</p>
        <p><strong>Timing:</strong> {item.timing}</p>
      </div>
    </div>
  )
}
