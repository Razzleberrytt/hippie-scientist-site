import React from 'react'
import { motion } from 'framer-motion'
import HerbList from './HerbList'
import { useLocalStorage } from '../hooks/useLocalStorage'
import { decodeTag } from '../utils/format'
import { canonicalTag } from '../utils/tagUtils'
import type { Herb } from '../types'

interface Props {
  /** Full list of herbs to filter */
  herbs: Herb[]
}

/**
 * TagFilterBar renders a row of tag buttons that can be toggled on/off.
 * Selected tags are saved to localStorage so the filter persists across page reloads.
 * The component also renders the filtered list of herb entries below the tag bar.
 */
export default function TagFilterBar({ herbs }: Props) {
  const [activeTags, setActiveTags] = useLocalStorage<string[]>(
    'hs-active-tags',
    []
  )

  const allTags = React.useMemo(() => {
    const t = herbs.reduce<string[]>((acc, h) => acc.concat(h.tags || []), [])
    return Array.from(new Set(t.map(canonicalTag)))
  }, [herbs])

  const toggle = (tag: string) => {
    setActiveTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  const clearAll = () => setActiveTags([])

  const filteredHerbs = React.useMemo(() => {
    if (activeTags.length === 0) return herbs
    return herbs.filter(h =>
      h.tags?.some(t => activeTags.includes(canonicalTag(t)))
    )
  }, [herbs, activeTags])

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 10 },
    visible: { opacity: 1, y: 0 },
  }

  return (
    <>
      <motion.div
        variants={containerVariants}
        initial='hidden'
        animate='visible'
        className='no-scrollbar flex gap-2 overflow-x-auto py-2'
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
            Clear All
          </motion.button>
        )}
      </motion.div>
      <HerbList herbs={filteredHerbs} />
    </>
  )
}
