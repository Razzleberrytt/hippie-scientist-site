import React from 'react'
import { motion } from '@/lib/motion'
import { decodeTag } from '../utils/format'

interface Props {
  /**
   * List of all unique tags available for filtering.
   */
  allTags: string[]
  /**
   * Currently active tags used for filtering.
   */
  activeTags: string[]
  /**
   * Toggle a tag on/off in the parent state.
   */
  onToggleTag: (tag: string) => void
}

export default function TagFilterBar({ allTags, activeTags, onToggleTag }: Props) {
  const toggle = (tag: string) => {
    onToggleTag(tag)
  }

  const clearAll = () => {
    activeTags.forEach(t => onToggleTag(t))
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='scrollbar-none flex gap-2 overflow-x-auto py-2'
    >
      {allTags.map(tag => {
        const active = activeTags.includes(tag)
        return (
          <motion.button
            variants={itemVariants}
            type='button'
            key={tag}
            onClick={() => toggle(tag)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            animate={
              active
                ? { scale: [1, 1.15, 1], boxShadow: '0 0 8px rgba(16,185,129,0.8)' }
                : { scale: 1, boxShadow: 'none' }
            }
            transition={{ type: 'spring', stiffness: 220, damping: 12 }}
            className={`whitespace-nowrap rounded-full border px-3 py-1.5 text-xs font-medium transition-all duration-150 ${active ? 'border-[var(--accent-teal)]/40 bg-[var(--accent-teal)]/8 text-[var(--accent-teal)]' : 'border-white/12 bg-transparent text-white/55 hover:border-white/24 hover:text-white/80'}`}
          >
            {decodeTag(tag)}
          </motion.button>
        )
      })}
      {activeTags.length > 0 && (
        <motion.button
          type='button'
          onClick={clearAll}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          transition={{ type: 'spring', stiffness: 220, damping: 12 }}
          className='whitespace-nowrap rounded-full border border-white/12 bg-transparent px-3 py-1.5 text-xs font-medium text-white/55 transition-all duration-150 hover:border-white/24 hover:text-white/80'
        >
          Clear Filters
        </motion.button>
      )}
    </motion.div>
  )
}
