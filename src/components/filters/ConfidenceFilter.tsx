import type { ConfidenceFilter as ConfidenceFilterValue } from '@/utils/filterModel'

type ConfidenceFilterProps = {
  value: ConfidenceFilterValue
  onChange: (value: ConfidenceFilterValue) => void
}

const OPTIONS: ConfidenceFilterValue[] = ['all', 'high', 'medium', 'low']

export default function ConfidenceFilter({ value, onChange }: ConfidenceFilterProps) {
  return (
    <section className='rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
      <h3 className='mb-2 text-sm font-semibold text-white'>Confidence</h3>
      <div className='flex flex-wrap gap-2'>
        {OPTIONS.map(option => {
          const active = value === option
          return (
            <button
              key={option}
              type='button'
              onClick={() => onChange(option)}
              className={`rounded-full border px-3 py-1 text-xs uppercase tracking-wide transition ${
                active
                  ? 'border-cyan-300/60 bg-cyan-500/20 text-cyan-100'
                  : 'border-white/15 bg-white/[0.03] text-white/80 hover:bg-white/10'
              }`}
            >
              {option}
            </button>
          )
        })}
      </div>
    </section>
  )
}
