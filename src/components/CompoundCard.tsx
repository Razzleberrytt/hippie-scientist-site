import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { CompoundEntry } from '../data/compounds/compounds'
import TagBadge from './TagBadge'

interface HerbRef {
  name: string
  slug?: string
}

export interface CompoundWithRefs extends CompoundEntry {
  herbsFound: HerbRef[]
  effectClass?: string
}

export default function CompoundCard({ compound }: { compound: CompoundWithRefs }) {
  return (
    <motion.article
      whileHover={{ scale: 1.03 }}
      title={compound.herbsFound.map(h => h.name).join(', ')}
      className='glassmorphic-card hover-glow flex flex-col rounded-lg border border-emerald-600/40 p-4 text-left'
    >
      <h2 className='mb-1 text-lg font-bold text-emerald-300 drop-shadow-glow'>{compound.name}</h2>
      <div className='mb-2 flex flex-wrap gap-2'>
        <TagBadge label={compound.type} />
        {compound.effectClass && <TagBadge label={compound.effectClass} variant='blue' />}
      </div>
      <p className='mb-2 text-sm text-sand'>{compound.description}</p>
      <p className='mb-2 text-sm text-sand'>{compound.mechanismOfAction}</p>
      <div className='mt-auto flex flex-wrap gap-1'>
        {compound.herbsFound.map(h =>
          h.slug ? (
            <Link
              key={h.name}
              to={`/herbs/${h.slug}`}
              className='tag-pill bg-space-dark/70 text-sand hover-glow transition-colors duration-300 dark:bg-gray-800 dark:text-gray-200'
            >
              {h.name}
            </Link>
          ) : (
            <span
              key={h.name}
              className='tag-pill bg-space-dark/70 text-sand dark:bg-gray-800 dark:text-gray-200'
            >
              {h.name}
            </span>
          )
        )}
      </div>
    </motion.article>
  )
}
