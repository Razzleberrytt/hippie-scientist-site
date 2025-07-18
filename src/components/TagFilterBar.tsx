import React from 'react'
import clsx from 'clsx'
import { motion } from 'framer-motion'
import TagBadge from './TagBadge'
import { decodeTag, tagVariant } from '../utils/format'

interface Props {
  tags: string[]
  selected: string[]
  onChange: (tags: string[]) => void
}

export default function TagFilterBar({ tags, selected, onChange }: Props) {
  const toggle = (tag: string) => {
    if (selected.includes(tag)) {
      onChange(selected.filter(t => t !== tag))
    } else {
      onChange([...selected, tag])
    }
  }

  return (
    <div className='flex flex-wrap gap-2 overflow-x-auto pb-4'>
      {tags.map(tag => (
        <motion.button
          key={tag}
          type='button'
          onClick={() => toggle(tag)}
          whileHover={{ scale: 1.1 }}
          whileTap={{ scale: 0.95 }}
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
