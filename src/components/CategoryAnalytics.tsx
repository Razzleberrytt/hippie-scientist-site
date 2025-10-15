import React, { type CSSProperties } from 'react'
import { motion } from 'framer-motion'
import { herbs } from '../data/herbs/herbsfull'

const TOP_N = 5

export default function CategoryAnalytics() {
  const counts = React.useMemo(() => {
    const c: Record<string, number> = {}
    herbs.forEach(h => {
      const main = h.category.split('/')[0].trim()
      c[main] = (c[main] || 0) + 1
    })
    return c
  }, [])

  const entries = React.useMemo(() => Object.entries(counts).sort((a, b) => b[1] - a[1]), [counts])

  const [expanded, setExpanded] = React.useState(false)

  const display = React.useMemo(
    () => (expanded ? entries : entries.slice(0, TOP_N)),
    [entries, expanded]
  )

  const hasMore = entries.length > TOP_N

  const max = Math.max(...entries.map(([, c]) => c))

  return (
    <motion.div layout className='space-y-2'>
      {display.map(([cat, count]) => (
        <motion.div key={cat} layout className='flex items-center gap-2'>
          <span className='w-40 text-sm'>{cat}</span>
          <div className='h-2 flex-1 rounded bg-gray-200 transition-colors duration-300 dark:bg-gray-700'>
            <div
              className='h-2 rounded bg-pink-500 transition-colors duration-300 dark:bg-pink-400 [width:var(--category-width)]'
              style={{ '--category-width': `${(count / max) * 100}%` } as CSSProperties}
            />
          </div>
          <span className='text-sm'>{count}</span>
        </motion.div>
      ))}
      {hasMore && (
        <motion.button
          layout
          type='button'
          onClick={() => setExpanded(e => !e)}
          className='mx-auto block text-xs text-moss hover:underline'
        >
          {expanded ? 'Show Less' : 'Show More'}
        </motion.button>
      )}
    </motion.div>
  )
}
