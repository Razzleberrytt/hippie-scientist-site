import React from 'react'
import { motion } from 'framer-motion'
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

  return (
    <div className='no-scrollbar flex gap-2 overflow-x-auto py-2'>
      {allTags.map(tag => {
        const active = activeTags.includes(tag)
        return (
          <motion.button
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
            className={`tag-pill hover-glow whitespace-nowrap transition-colors duration-300 ${active ? 'bg-emerald-700/70 text-white ring-2 ring-emerald-400 dark:bg-emerald-800' : 'bg-space-dark/70 text-sand dark:bg-gray-800 dark:text-gray-200'}`}
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
          className='tag-pill hover-glow whitespace-nowrap bg-rose-700/70 text-white dark:bg-rose-800 transition-colors duration-300'
        >
          Clear Filters
        </motion.button>
      )}
    </div>
  )
}
