import { useMemo, useState } from 'react'

type EffectFilterProps = {
  options: string[]
  selected: string[]
  onToggle: (effect: string) => void
}

export default function EffectFilter({ options, selected, onToggle }: EffectFilterProps) {
  const [expanded, setExpanded] = useState(false)
  const hasOverflow = options.length > 18
  const visible = useMemo(() => {
    if (expanded || !hasOverflow) return options
    return options.slice(0, 18)
  }, [expanded, hasOverflow, options])

  return (
    <section className='rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
      <div className='mb-2 flex items-center justify-between gap-2'>
        <h3 className='text-sm font-semibold text-white'>Effects</h3>
        {hasOverflow && (
          <button
            type='button'
            onClick={() => setExpanded(value => !value)}
            className='text-xs text-white/75 underline underline-offset-4 hover:text-white'
          >
            {expanded ? 'Show less' : `Show all (${options.length})`}
          </button>
        )}
      </div>
      <div className='flex flex-wrap gap-2'>
        {visible.map(effect => {
          const active = selected.includes(effect)
          return (
            <button
              key={effect}
              type='button'
              onClick={() => onToggle(effect)}
              className={`rounded-full border px-3 py-1 text-xs transition ${
                active
                  ? 'border-violet-300/60 bg-violet-500/25 text-violet-100 shadow-[0_0_14px_rgba(139,92,246,0.3)]'
                  : 'border-white/15 bg-white/[0.03] text-white/80 hover:bg-white/10'
              }`}
            >
              {effect}
            </button>
          )
        })}
      </div>
    </section>
  )
}
