import React, { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { herbs } from '../data/herbs'
import { metaCategory } from '../hooks/useFilteredHerbs'

interface Props {
  selected: string[]
  onChange?: (cats: string[]) => void
}

export default function CategoryFilter({ selected, onChange }: Props) {
  const [open, setOpen] = useState(false)
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

  const list = (
    <div className='flex flex-wrap gap-2'>
      {Object.entries(counts)
        .sort((a, b) => b[1] - a[1])
        .map(([cat, count]) => (
          <button
            key={cat}
            type='button'
            onClick={() => toggle(cat)}
            className={`tag-pill max-w-[7rem] truncate ${selected.includes(cat) ? 'ring-2 ring-emerald-400' : ''}`}
          >
            {cat} ({count})
          </button>
        ))}
    </div>
  )

  return (
    <div>
      <div className='sm:hidden'>
        <button type='button' onClick={() => setOpen(o => !o)} className='tag-pill mb-2'>
          {open ? 'Hide Categories' : 'Show Categories'}
        </button>
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key='cats'
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className='overflow-hidden'
            >
              {list}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <div className='hidden sm:block'>{list}</div>
    </div>
  )
}
