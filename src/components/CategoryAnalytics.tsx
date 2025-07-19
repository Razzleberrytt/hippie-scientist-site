import React, { useState, useMemo } from 'react'
import InfoTooltip from './InfoTooltip'
import { herbs } from '../data/herbs'

export default function CategoryAnalytics() {
  const counts = useMemo(() => {
    const c: Record<string, number> = {}
    herbs.forEach(h => {
      const main = h.category.split('/')[0].trim()
      c[main] = (c[main] || 0) + 1
    })
    return c
  }, [])
  const entries = useMemo(() => Object.entries(counts).sort((a, b) => b[1] - a[1]), [counts])
  const [showAll, setShowAll] = useState(false)
  const [filter, setFilter] = useState('')
  const filtered = useMemo(
    () => entries.filter(([c]) => c.toLowerCase().includes(filter.toLowerCase())),
    [entries, filter]
  )
  const list = showAll ? filtered : filtered.slice(0, 12)
  const max = Math.max(...entries.map(([, c]) => c))
  return (
    <div className='space-y-3'>
      <div className='flex items-center gap-2'>
        <input
          type='text'
          placeholder='Find category'
          value={filter}
          onChange={e => setFilter(e.target.value)}
          className='w-36 flex-1 rounded-md bg-space-dark/50 px-2 py-1 text-sm backdrop-blur-md'
        />
        <button type='button' onClick={() => setShowAll(a => !a)} className='tag-pill'>
          {showAll ? 'Collapse' : 'Show All'}
        </button>
      </div>
      <div className='space-y-2'>
        {list.map(([cat, count]) => (
          <div key={cat} className='flex items-center gap-2'>
            <InfoTooltip text={`${count} herbs`}>
              <span className='w-40 truncate text-sm'>{cat}</span>
            </InfoTooltip>
            <div className='h-2 flex-1 rounded bg-slate-700/50'>
              <div
                className='h-2 rounded bg-fuchsia-500'
                style={{ width: `${(count / max) * 100}%` }}
              />
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
