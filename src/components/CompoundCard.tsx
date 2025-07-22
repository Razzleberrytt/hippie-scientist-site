import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import type { CompoundEntry } from '../data/compounds'
import TagBadge from './TagBadge'
import { slugify } from '../utils/slugify'

export default function CompoundCard({ compound }: { compound: CompoundEntry }) {
  return (
    <motion.article
      whileHover={{ scale: 1.03 }}
      className='glass-card hover-glow flex flex-col rounded-lg p-4 text-left'
    >
      <h2 className='mb-1 text-lg font-bold text-white'>{compound.name}</h2>
      <div className='mb-2 flex flex-wrap gap-2'>
        <TagBadge label={compound.type} />
        <TagBadge label={compound.psychoactivity} variant='blue' />
      </div>
      <p className='mb-2 text-sm text-sand'>{compound.description}</p>
      <div className='mt-auto flex flex-wrap gap-1'>
        {compound.foundIn.map(h => (
          <Link
            key={h}
            to={`/database#${slugify(h)}`}
            className='tag-pill bg-space-dark/70 text-sand hover-glow'
          >
            {h}
          </Link>
        ))}
      </div>
    </motion.article>
  )
}
