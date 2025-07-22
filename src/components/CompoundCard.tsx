import React, { useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import InfoTooltip from './InfoTooltip'
import TagBadge from './TagBadge'
import { Compound } from '../data/compounds'
import { slugify } from '../utils/slugify'

const classColors: Record<string, string> = {
  alkaloid: 'purple',
  terpene: 'green',
  glycoside: 'yellow',
  phenethylamine: 'pink',
  tryptamine: 'blue',
}

export default function CompoundCard({ compound }: { compound: Compound }) {
  const [expanded, setExpanded] = useState(false)
  const colorKey = Object.keys(classColors).find(k =>
    compound.class.toLowerCase().includes(k)
  )
  const variant = colorKey ? classColors[colorKey] : 'purple'
  return (
    <motion.article
      id={slugify(compound.name)}
      layout
      onClick={() => setExpanded(e => !e)}
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.98 }}
      tabIndex={0}
      className='glass-card hover-glow cursor-pointer rounded-xl p-4 text-left focus:outline-none focus-visible:ring-2 focus-visible:ring-psychedelic-pink'
    >
      <h2 className='text-xl font-bold text-white'>{compound.name}</h2>
      <p className='text-sm text-moss'>
        <TagBadge label={compound.class} variant={variant} className='mr-2' />
      </p>
      {compound.effects.length > 0 && (
        <p className='mt-1 text-sm text-sand'>Effects: {compound.effects.join(', ')}</p>
      )}
      {compound.notes && <p className='mt-1 text-xs italic text-sand'>{compound.notes}</p>}
      {compound.sourceHerbs.length > 0 && !expanded && (
        <p className='mt-1 text-sm text-sand'>
          Source:{' '}
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
      {compound.toxicityWarning && (
        <InfoTooltip text={compound.toxicityWarning}>
          <span className='mt-1 inline-flex items-center text-red-400'>☣️</span>
        </InfoTooltip>
      )}
      {expanded && (
        <motion.div
          layout
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ type: 'spring', stiffness: 80, damping: 16 }}
          className='mt-2 space-y-1 text-sm text-sand'
        >
          {compound.mechanismOfAction && (
            <p>
              <strong>Mechanism:</strong> {compound.mechanismOfAction}
            </p>
          )}
          {compound.psychoactiveEffects?.length && (
            <p>
              <strong>Effects:</strong> {compound.psychoactiveEffects.join(', ')}
            </p>
          )}
          {(compound.foundInHerbs ?? compound.sourceHerbs).length > 0 && (
            <p>
              <strong>Found In:</strong>{' '}
              {(compound.foundInHerbs ?? compound.sourceHerbs).map((h, i) => (
                <React.Fragment key={h}>
                  {i > 0 && ', '}
                  <Link to={`/herbs/${h}`} className='underline'>
                    {h.replace(/-/g, ' ')}
                  </Link>
                </React.Fragment>
              ))}
            </p>
          )}
        </motion.div>
      )}
      <Link
        to={`/database?herbs=${compound.sourceHerbs.join(',')}`}
        className='tag-pill mt-2 inline-block'
      >
        🧬 Source Herb
      </Link>
    </motion.article>
  )
}
