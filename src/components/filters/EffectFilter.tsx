import { useEffect, useMemo, useState } from 'react'

const MORE_FILTERS_EVENT = 'filters:more-toggle'

type EffectFilterProps = {
  options: string[]
  selected: string[]
  onToggle: (effect: string) => void
}

export default function EffectFilter({ options, selected, onToggle }: EffectFilterProps) {
  const [expanded, setExpanded] = useState(false)
  const [moreFiltersOpen, setMoreFiltersOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('filters:more-open') === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail
      if (typeof detail?.open === 'boolean') {
        setMoreFiltersOpen(detail.open)
      }
    }

    window.addEventListener(MORE_FILTERS_EVENT, handleChange as EventListener)
    return () => window.removeEventListener(MORE_FILTERS_EVENT, handleChange as EventListener)
  }, [])

  const hasOverflow = options.length > 16
  const visible = useMemo(() => {
    if (expanded || !hasOverflow) return options
    return options.slice(0, 16)
  }, [expanded, hasOverflow, options])

  if (!moreFiltersOpen) return null

  return (
    <section className='browse-shell p-3'>
      <div className='mb-2 flex items-center justify-between gap-2'>
        <h3 className='section-label'>Effect tags</h3>
        {hasOverflow && (
          <button
            type='button'
            onClick={() => setExpanded(value => !value)}
            className='text-xs text-white/70 underline underline-offset-4 hover:text-white'
          >
            {expanded ? 'Show less' : `Show all (${options.length})`}
          </button>
        )}
      </div>
      <div className='flex flex-wrap gap-1.5'>
        {visible.map(effect => {
          const active = selected.includes(effect)
          return (
            <button
              key={effect}
              type='button'
              onClick={() => onToggle(effect)}
              className={`rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${
                active
                  ? 'border-[var(--accent-teal)]/40 bg-[var(--accent-teal)]/8 text-[var(--accent-teal)]'
                  : 'border-white/12 bg-transparent text-white/55 hover:border-white/24 hover:text-white/80'
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
