import React from 'react'
import { motion } from 'framer-motion'
import { spring, fadeInUp } from '../utils/motionConfig'
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
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0, transition: { staggerChildren: 0.05 } },
  }

  const itemVariants = fadeInUp

  return (
    <motion.div
      variants={containerVariants}
      initial='hidden'
      animate='visible'
      className='no-scrollbar flex items-center gap-2 overflow-x-auto py-2'
    >
      <span className='pl-1 pr-2 text-xs font-semibold text-opal'>
        {activeTags.length > 0 ? `Filtered (${activeTags.length})` : 'Filter Tags'}
      </span>
      {allTags.map(tag => {
        const active = activeTags.includes(tag)
        return (
          <motion.button
            variants={itemVariants}
            type='button'
            key={tag}
            aria-pressed={active}
            aria-label={`${active ? 'Remove' : 'Add'} filter ${decodeTag(tag)}`}
            onClick={() => toggle(tag)}
            whileTap={{ scale: 0.9 }}
            whileHover={{ scale: 1.08 }}
            animate={
              active
                ? {
                    scale: [1, 1.15, 1],
                    boxShadow: '0 0 8px rgba(16,185,129,0.8)',
                  }
                : { scale: 1, boxShadow: 'none' }
            }
            transition={{
              ...spring,
              repeat: active ? Infinity : 0,
              repeatType: 'mirror',
              duration: 1.2,
            }}
            className={`tag-pill hover-glow whitespace-nowrap transition-colors duration-300 ${active ? 'bg-emerald-700/70 text-white ring-2 ring-emerald-400 dark:bg-emerald-800' : 'bg-space-dark/70 text-sand dark:bg-gray-800 dark:text-gray-200'}`}
          >
            {decodeTag(tag)}
          </motion.button>
        )
      })}
      {activeTags.length > 0 && (
        <motion.button
          type='button'
          aria-label='Clear all filters'
          onClick={clearAll}
          whileTap={{ scale: 0.9 }}
          whileHover={{ scale: 1.08 }}
          transition={spring}
          className='tag-pill hover-glow whitespace-nowrap bg-rose-700/70 text-white transition-colors duration-300 dark:bg-rose-800'
        >
          Clear Filters
        </motion.button>
      )}
    </motion.div>
  )
}
