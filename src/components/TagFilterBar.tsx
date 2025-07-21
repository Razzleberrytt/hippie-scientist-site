import React, { useEffect, useMemo, useState } from 'react'
import { motion } from 'framer-motion'
import { decodeTag } from '../utils/format'
import { canonicalTag } from '../utils/tagUtils'
import { herbs } from '../../herbsfull'

interface Props {
  /**
   * Optional list of tags to display. If omitted the tags will
   * be generated from the global herbs dataset.
   */
  tags?: string[]
  onChange?: (tags: string[]) => void
}

export default function TagFilterBar({ tags, onChange }: Props) {
  const unique = useMemo(() => {
    if (tags && tags.length) return Array.from(new Set(tags))
    const all = herbs.flatMap(h => h.tags ?? [])
    return Array.from(new Set(all.map(canonicalTag)))
  }, [tags])
  const [activeTags, setActiveTags] = useState<string[]>([])

  const toggle = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  useEffect(() => {
    onChange?.(activeTags)
  }, [activeTags, onChange])

  return (
    <div className='flex gap-2 overflow-x-auto py-2 no-scrollbar'>
      {unique.map(tag => {
        const active = activeTags.includes(tag)
        return (
          <motion.button
            type='button'
            key={tag}
            onClick={() => toggle(tag)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            animate={active ? { scale: [1, 1.15, 1], boxShadow: '0 0 8px rgba(16,185,129,0.8)' } : { scale: 1, boxShadow: 'none' }}
            transition={{ type: 'spring', stiffness: 300 }}
            className={`tag-pill whitespace-nowrap ${active ? 'bg-emerald-700/70 text-white ring-2 ring-emerald-400' : 'bg-space-dark/70 text-sand'}`}
          >
            {decodeTag(tag)}
          </motion.button>
        )
      })}
      {activeTags.length > 0 && (
        <motion.button
          type='button'
          onClick={() => setActiveTags([])}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          className='tag-pill whitespace-nowrap bg-rose-700/70 text-white'
        >
          Clear Filters
        </motion.button>
      )}
    </div>
  )
}
