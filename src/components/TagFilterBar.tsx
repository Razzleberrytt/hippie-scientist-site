import React, { useEffect, useMemo, useState } from 'react'
import clsx from 'clsx'
import { AnimatePresence, motion } from 'framer-motion'
import TagBadge from './TagBadge'
import { decodeTag, tagVariant, tagCategory, TagCategory, normalizeTag } from '../utils/format'
import { canonicalTag } from '../utils/tagUtils'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface Props {
  tags: string[]
  onChange?: (tags: string[]) => void
  storageKey?: string
  counts?: Record<string, number>
}

const CATEGORY_ORDER: TagCategory[] = [
  'Effect',
  'Preparation',
  'Safety',
  'Chemistry',
  'Region',
  'Other',
]

export default function TagFilterBar({
  tags,
  onChange,
  storageKey = 'tagFilters',
  counts = {},
}: Props) {
  const [selected, setSelected] = useLocalStorage<string[]>(storageKey, [])
  const [expanded, setExpanded] = useState<Record<TagCategory, boolean>>({
    Effect: true,
    Preparation: false,
    Safety: false,
    Chemistry: false,
    Region: false,
    Other: false,
  })
  const [showMore, setShowMore] = useState<Record<TagCategory, boolean>>({
    Effect: false,
    Preparation: false,
    Safety: false,
    Chemistry: false,
    Region: false,
    Other: false,
  })

  useEffect(() => {
    onChange?.(selected)
  }, [selected, onChange])

  const grouped = useMemo(() => {
    const map: Record<TagCategory, string[]> = {
      Effect: [],
      Preparation: [],
      Safety: [],
      Chemistry: [],
      Region: [],
      Other: [],
    }
    tags.forEach(t => {
      const canon = canonicalTag(normalizeTag(t))
      const cat = tagCategory(canon)
      if (!map[cat].includes(canon)) map[cat].push(canon)
    })
    return map
  }, [tags])

  const toggle = (tag: string) => {
    const canon = canonicalTag(tag)
    setSelected(prev => (prev.includes(canon) ? prev.filter(t => t !== canon) : [...prev, canon]))
  }

  const labelFor = (cat: TagCategory) => {
    switch (cat) {
      case 'Effect':
        return '⚡ Effects'
      case 'Preparation':
        return '🌿 Preparation'
      case 'Safety':
        return '⚠️ Safety'
      case 'Chemistry':
        return '🧪 Chemistry'
      case 'Region':
        return '📍 Region'
      default:
        return '✨ Other'
    }
  }

  const renderTags = (cat: TagCategory) => {
    const list = grouped[cat] || []
    const limit = 12
    const display = showMore[cat] ? list : list.slice(0, limit)
    return (
      <>
        <div className='tag-list'>
          {display.map(tag => (
            <motion.button
              key={tag}
              type='button'
              onClick={() => toggle(tag)}
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              animate={{ opacity: selected.includes(tag) ? 1 : 0.6 }}
              aria-pressed={selected.includes(tag)}
              tabIndex={0}
              className='flex-shrink-0 focus:outline-none'
              title={
                counts[tag]
                  ? `${decodeTag(normalizeTag(tag))} — used in ${counts[tag]} herbs`
                  : decodeTag(normalizeTag(tag))
              }
            >
              <TagBadge
                label={decodeTag(normalizeTag(tag))}
                variant={selected.includes(tag) ? 'green' : tagVariant(tag)}
                className={clsx(selected.includes(tag) && 'ring-1 ring-emerald-400')}
              />
            </motion.button>
          ))}
          {list.length > limit && (
            <motion.button
              type='button'
              whileHover={{ scale: 1.05 }}
              onClick={() => setShowMore(m => ({ ...m, [cat]: !m[cat] }))}
              tabIndex={0}
              className='tag-pill mt-2'
            >
              {showMore[cat] ? 'Show Less' : 'Show More'}
            </motion.button>
          )}
        </div>
      </>
    )
  }

  return (
    <div className='sticky top-16 z-20 space-y-3 bg-black/30 backdrop-blur-md p-2 rounded-xl sm:static sm:bg-transparent sm:p-0'>
      {CATEGORY_ORDER.map(cat => (
        <div key={cat} className='tag-section'>
          <button
            type='button'
            className='tag-label'
            tabIndex={0}
            onClick={() => setExpanded(e => ({ ...e, [cat]: !e[cat] }))}
            aria-expanded={expanded[cat]}
          >
            {labelFor(cat)}
            <motion.span animate={{ rotate: expanded[cat] ? 90 : 0 }} className='ml-1 text-xs'>
              ▶
            </motion.span>
          </button>
          <AnimatePresence initial={false}>
            {expanded[cat] && (
              <motion.div
                key='content'
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: 'auto', opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
              >
                {renderTags(cat)}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      ))}
    </div>
  )
}
