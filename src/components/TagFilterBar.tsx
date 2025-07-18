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

const TagFilterBar: React.FC<Props> = ({ tags, selected, onChange }) => {
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
          layout
          whileTap={{ scale: 0.95 }}
          key={tag}
          type='button'
          onClick={() => toggle(tag)}
          className={clsx('flex-shrink-0 focus:outline-none')}
        >
          <TagBadge
            label={decodeTag(tag)}
            variant={selected.includes(tag) ? 'green' : tagVariant(tag)}
            className={clsx(selected.includes(tag) && 'ring-1 ring-emerald-300')}
          />
        </motion.button>
      ))}
    </div>
  )
}

export default TagFilterBar
