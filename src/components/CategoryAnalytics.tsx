import React from 'react'
import { herbs } from '../data/herbs'

const MIN_COUNT = 5

export default function CategoryAnalytics() {
  const counts = React.useMemo(() => {
    const c: Record<string, number> = {}
    herbs.forEach(h => {
      const main = h.category.split('/')[0].trim()
      c[main] = (c[main] || 0) + 1
    })
    return c
  }, [])

  const entries = React.useMemo(
    () => Object.entries(counts).sort((a, b) => b[1] - a[1]),
    [counts]
  )

  const [showAll, setShowAll] = React.useState(false)

  const display = React.useMemo(
    () =>
      showAll ? entries : entries.filter(([, count]) => count >= MIN_COUNT),
    [entries, showAll]
  )

  const hasMore = React.useMemo(
    () => entries.some(([, count]) => count < MIN_COUNT),
    [entries]
  )

  const max = Math.max(...entries.map(([, c]) => c))

  return (
    <div
      className='relative space-y-2'
      onMouseEnter={() => setShowAll(true)}
      onMouseLeave={() => setShowAll(false)}
    >
      {display.map(([cat, count]) => (
        <div key={cat} className='flex items-center gap-2'>
          <span className='w-40 text-sm'>{cat}</span>
          <div className='flex-1 bg-slate-700/50 h-2 rounded'>
            <div
              className='h-2 rounded bg-fuchsia-500'
              style={{ width: `${(count / max) * 100}%` }}
            />
          </div>
          <span className='text-sm'>{count}</span>
        </div>
      ))}
      {hasMore && !showAll && (
        <div className='pointer-events-none text-center text-xs text-moss'>
          Hover to show more
        </div>
      )}
    </div>
  )
}
