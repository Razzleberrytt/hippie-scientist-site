import React, { useEffect, useState } from 'react'

export interface Option {
  label: string
  value: string
}

export default function CompoundTagFilter({
  options,
  onChange,
}: {
  options: Option[]
  onChange?: (v: string[]) => void
}) {
  const [active, setActive] = useState<string[]>([])

  const toggle = (val: string) => {
    setActive(prev => (prev.includes(val) ? prev.filter(v => v !== val) : [...prev, val]))
  }

  useEffect(() => {
    onChange?.(active)
  }, [active, onChange])

  return (
    <div className='no-scrollbar flex gap-2 overflow-x-auto py-2'>
      {options.map(opt => {
        const act = active.includes(opt.value)
        return (
          <button
            key={opt.value}
            type='button'
            onClick={() => toggle(opt.value)}
            className={`ds-pill whitespace-nowrap transition-all active:scale-90 motion-safe:hover:scale-[1.08] ${act ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 shadow-[0_0_8px_rgba(16,185,129,0.8)] ring-1 ring-emerald-400/40' : 'text-white/75 hover:border-white/25'}`}
          >
            {opt.label}
          </button>
        )
      })}
      {active.length > 0 && (
        <button
          type='button'
          onClick={() => setActive([])}
          className='ds-pill whitespace-nowrap border-rose-400/40 bg-rose-500/15 text-rose-100 transition-transform active:scale-90 motion-safe:hover:scale-[1.08]'
        >
          Clear
        </button>
      )}
    </div>
  )
}
