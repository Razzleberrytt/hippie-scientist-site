import { useEffect, useState } from 'react'
import type { ConfidenceFilter as ConfidenceFilterValue } from '@/utils/filterModel'

type ConfidenceFilterProps = {
  value: ConfidenceFilterValue
  onChange: (value: ConfidenceFilterValue) => void
}

const OPTIONS: ConfidenceFilterValue[] = ['all', 'high', 'medium', 'low']
const MORE_FILTERS_EVENT = 'filters:more-toggle'

export default function ConfidenceFilter({ value, onChange }: ConfidenceFilterProps) {
  const [moreOpen, setMoreOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('filters:more-open') === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail
      if (typeof detail?.open === 'boolean') {
        setMoreOpen(detail.open)
      }
    }

    window.addEventListener(MORE_FILTERS_EVENT, handleChange as EventListener)
    return () => window.removeEventListener(MORE_FILTERS_EVENT, handleChange as EventListener)
  }, [])

  const toggleMoreFilters = () => {
    const next = !moreOpen
    setMoreOpen(next)
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('filters:more-open', String(next))
      window.dispatchEvent(new CustomEvent(MORE_FILTERS_EVENT, { detail: { open: next } }))
    }
  }

  return (
    <section className='rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
      <button
        type='button'
        onClick={toggleMoreFilters}
        className='flex w-full items-center justify-between gap-2 rounded-xl border border-white/15 bg-white/[0.03] px-3 py-2 text-left transition hover:bg-white/10'
        aria-expanded={moreOpen}
      >
        <span className='text-sm font-semibold text-white'>More filters</span>
        <span className='text-xs text-white/70'>{moreOpen ? 'Hide' : 'Show'}</span>
      </button>

      {moreOpen && (
        <div className='mt-3'>
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
        </div>
      )}
    </section>
  )
}
