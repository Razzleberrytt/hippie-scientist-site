import React from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import InfoTooltip from './InfoTooltip'
import TagBadge from './TagBadge'
import { Compound } from '../data/compounds'

const classColors: Record<string, string> = {
  alkaloid: 'purple',
  terpene: 'green',
  glycoside: 'yellow',
  phenethylamine: 'pink',
  tryptamine: 'blue',
}

export default function CompoundCard({ compound }: { compound: Compound }) {
  const colorKey = Object.keys(classColors).find(k =>
    compound.class.toLowerCase().includes(k)
  )
  const variant = colorKey ? classColors[colorKey] : 'purple'
  return (
    <motion.article
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      tabIndex={0}
      className='glass-card hover-glow rounded-xl p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-psychedelic-pink'
    >
      <h2 className='text-xl font-bold text-white'>{compound.name}</h2>
      <p className='text-sm text-moss'>
        <TagBadge label={compound.class} variant={variant} className='mr-2' />
      </p>
      {compound.effects.length > 0 && (
        <p className='mt-1 text-sm text-sand'>Effects: {compound.effects.join(', ')}</p>
      )}
      {compound.notes && <p className='mt-1 text-xs italic text-sand'>{compound.notes}</p>}
      {compound.toxicityWarning && (
        <InfoTooltip text={compound.toxicityWarning}>
          <span className='mt-1 inline-flex items-center text-red-400'>☣️</span>
        </InfoTooltip>
      )}
      {compound.sourceHerbs.length > 0 && (
        <p className='mt-2 text-xs text-sand'>
          Herbs:
          {compound.sourceHerbs.map((h, i) => (
            <React.Fragment key={h}>
              {i > 0 && ', '}
              <Link to={`/herbs/${h}`} className='underline'>
                {h.replace(/-/g, ' ')}
              </Link>
            </React.Fragment>
          ))}
        </p>
      )}
      <Link
        to={`/database?herbs=${compound.sourceHerbs.join(',')}`}
        className='tag-pill mt-2 inline-block'
      >
        Source Herbs
      </Link>
    </motion.article>
  )
}
