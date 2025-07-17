import React from 'react'
import clsx from 'clsx'
import { decodeTag, tagVariant } from '../utils/format'
import TagBadge from './TagBadge'
import { decodeTag } from '../utils/format'

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
    <div className='flex overflow-x-auto gap-2 pb-4'>
      {tags.map(tag => (
        <button
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
          className={clsx(
            'flex-shrink-0 bg-emerald-700/30 text-emerald-200 px-3 py-1 rounded-full text-xs shadow-md hover:bg-emerald-600/50 transition',
            selected.includes(tag) && 'ring-1 ring-emerald-300 bg-emerald-600/50'
          )}
        >
          {decodeTag(tag)}
        </button>
      ))}
    </div>
  )
}

export default TagFilterBar
