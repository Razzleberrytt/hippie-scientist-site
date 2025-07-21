import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { decodeTag } from '../utils/format'

interface Props {
  tags: string[]
  onChange?: (tags: string[]) => void
}

export default function TagFilterBar({ tags, onChange }: Props) {
  const unique = Array.from(new Set(tags))
  const [activeTags, setActiveTags] = useState<string[]>([])

  const toggle = (tag: string) => {
    setActiveTags(prev => (prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]))
  }

  useEffect(() => {
    onChange?.(activeTags)
  }, [activeTags, onChange])

  return (
    <div className='flex gap-2 overflow-x-auto py-2'>
      {unique.map(tag => {
        const active = activeTags.includes(tag)
        return (
          <motion.button
            type='button'
            key={tag}
            onClick={() => toggle(tag)}
            whileTap={{ scale: 0.95 }}
            whileHover={{ scale: 1.05 }}
            className={`whitespace-nowrap rounded-full border px-3 py-1 text-sm backdrop-blur-md ${
              active ? 'bg-emerald-600/80 text-white shadow-lg' : 'bg-space-dark/70 text-sand'
            }`}
          >
            {decodeTag(tag)}
          </motion.button>
        )
      })}
    </div>
  )
}
