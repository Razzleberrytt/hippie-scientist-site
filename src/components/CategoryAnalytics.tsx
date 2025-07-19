import React from 'react'
import { herbs } from '../data/herbs'

export default function CategoryAnalytics() {
  const counts = React.useMemo(() => {
    const c: Record<string, number> = {}
    herbs.forEach(h => {
      const main = h.category.split('/')[0].trim()
      c[main] = (c[main] || 0) + 1
    })
    return c
  }, [])
  const max = Math.max(...Object.values(counts))
  return (
    <div className='space-y-2'>
      {Object.entries(counts).map(([cat, count]) => (
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
    </div>
  )
}
