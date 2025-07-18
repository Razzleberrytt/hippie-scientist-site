import React, { useEffect } from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import TagBadge from './TagBadge'
import { decodeTag, tagVariant } from '../utils/format'
import { useLocalStorage } from '../hooks/useLocalStorage'

interface Props {
  tags: string[]
  onChange?: (tags: string[]) => void
  storageKey?: string
}

export default function TagFilterBar({ tags, onChange, storageKey = 'tagFilters' }: Props) {
  const [selected, setSelected] = useLocalStorage<string[]>(storageKey, [])

  useEffect(() => {
    onChange?.(selected)
  }, [selected, onChange])

  const toggle = (tag: string) => {
    setSelected(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    )
  }

  return (
    <div className='sticky top-16 z-10 flex flex-wrap gap-2 overflow-x-auto pb-4 backdrop-blur-md bg-black/30 rounded-xl px-2'>
      {tags.map(tag => (
        <motion.button
          key={tag}
          type='button'
          onClick={() => toggle(tag)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
          animate={{ opacity: selected.includes(tag) ? 1 : 0.6 }}
          aria-pressed={selected.includes(tag)}
          className='flex-shrink-0 focus:outline-none'
        >
          <TagBadge
            label={decodeTag(tag)}
            variant={selected.includes(tag) ? 'green' : tagVariant(tag)}
            className={clsx(selected.includes(tag) && 'ring-1 ring-emerald-400')}
          />
        </motion.button>
      ))}
    </div>
  )
}
