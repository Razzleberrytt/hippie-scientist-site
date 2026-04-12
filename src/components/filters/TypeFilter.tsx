import { useEffect, useState } from 'react'

const MORE_FILTERS_EVENT = 'filters:more-toggle'
const ADVANCED_LABELS = new Set(['Research signal'])

type TypeFilterProps = {
  label: string
  options: string[]
  value: string
  onChange: (value: string) => void
}

function useMoreFiltersOpen() {
  const [open, setOpen] = useState(() => {
    if (typeof window === 'undefined') return false
    return window.localStorage.getItem('filters:more-open') === 'true'
  })

  useEffect(() => {
    if (typeof window === 'undefined') return undefined

    const handleChange = (event: Event) => {
      const detail = (event as CustomEvent<{ open?: boolean }>).detail
      if (typeof detail?.open === 'boolean') {
        setOpen(detail.open)
      }
    }

    window.addEventListener(MORE_FILTERS_EVENT, handleChange as EventListener)
    return () => window.removeEventListener(MORE_FILTERS_EVENT, handleChange as EventListener)
  }, [])

  return open
}

export default function TypeFilter({ label, options, value, onChange }: TypeFilterProps) {
  const isAdvanced = ADVANCED_LABELS.has(label)
  const moreFiltersOpen = useMoreFiltersOpen()

  if (isAdvanced && !moreFiltersOpen) return null

  return (
    <label className='block rounded-2xl border border-white/10 bg-white/[0.03] p-3'>
      <span className='mb-2 block text-sm font-semibold text-white'>{label}</span>
      <select
        value={value}
        onChange={event => onChange(event.target.value)}
        className='w-full rounded-xl border border-white/15 bg-black/40 px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-violet-400/35'
      >
        <option value='all'>All</option>
        {options.map(option => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </select>
    </label>
  )
}
