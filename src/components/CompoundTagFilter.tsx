import React, { useEffect, useState } from 'react'
import { motion } from '@/lib/motion'

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
          <motion.button
            key={opt.value}
            type='button'
            onClick={() => toggle(opt.value)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            animate={
              act
                ? { scale: [1, 1.15, 1], boxShadow: '0 0 8px rgba(16,185,129,0.8)' }
                : { scale: 1, boxShadow: 'none' }
            }
            transition={{ type: 'spring', stiffness: 220, damping: 12 }}
            className={`ds-pill whitespace-nowrap transition ${act ? 'border-emerald-400/60 bg-emerald-500/20 text-emerald-100 ring-1 ring-emerald-400/40' : 'text-white/75 hover:border-white/25'}`}
          >
            {opt.label}
          </motion.button>
        )
      })}
      {active.length > 0 && (
        <motion.button
          type='button'
          onClick={() => setActive([])}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 220, damping: 12 }}
          className='ds-pill whitespace-nowrap border-rose-400/40 bg-rose-500/15 text-rose-100'
        >
          Clear
        </motion.button>
      )}
    </div>
  )
}
