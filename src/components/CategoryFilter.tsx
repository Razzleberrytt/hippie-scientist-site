import React from 'react'
import { herbs } from '../data/herbs'
import { metaCategory } from '../hooks/useFilteredHerbs'

interface Props {
  selected: string[]
  onChange?: (cats: string[]) => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  const counts = React.useMemo(() => {
    const c: Record<string, number> = {}
    herbs.forEach(h => {
      const m = metaCategory(h.category)
      c[m] = (c[m] || 0) + 1
    })
    return c
  }, [])

  const toggle = (cat: string) => {
    const next = selected.includes(cat) ? selected.filter(c => c !== cat) : [...selected, cat]
    onChange?.(next)
  }

  return (
    <div className='flex flex-wrap gap-2'>
      {Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, count]) => (
          <button
            key={cat}
            type='button'
            onClick={() => toggle(cat)}
            className={`tag-pill ${selected.includes(cat) ? 'ring-2 ring-emerald-400' : ''}`}
          >
            {cat} ({count})
          </button>
        ))}
    </div>
  )
}
