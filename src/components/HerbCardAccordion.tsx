import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Herb } from '../types/Herb'
import TagBadge from './TagBadge'
import InfoTooltip from './InfoTooltip'
import { decodeTag, tagVariant } from '../utils/format'

interface Props {
  herb: Herb;
}

export default function HerbCardAccordion({ herb }: Props) {
  const [expanded, setExpanded] = useState(false)

  const toggleExpanded = () => setExpanded(prev => !prev)
  const safeTags = Array.isArray(herb.tags) ? herb.tags : []
  const safeEffects = Array.isArray(herb.effects) ? herb.effects : []

  const rating = String(herb.safetyRating || 'unknown').toLowerCase()
  let ratingColor = 'gray'
  let ratingIcon = '❓'
  if (rating.includes('high')) {
    ratingColor = 'green'
    ratingIcon = '✅'
  } else if (rating.includes('low')) {
    ratingColor = 'red'
    ratingIcon = '☠️'
  } else if (rating.includes('medium')) {
    ratingColor = 'yellow'
    ratingIcon = '⚠️'
  }

  const containerVariants = {
    open: { transition: { staggerChildren: 0.05, delayChildren: 0.1 } },
    collapsed: {},
  }

  const itemVariants = {
    open: { opacity: 1, y: 0 },
    collapsed: { opacity: 0, y: -4 },
  }

  return (
    <motion.article
      layout
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={toggleExpanded}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          toggleExpanded()
        }
      }}
      role='button'
      tabIndex={0}
      aria-expanded={expanded}
      className='relative cursor-pointer overflow-hidden rounded-2xl bg-psychedelic-gradient/30 p-4 text-white shadow-lg backdrop-blur-md transition-all hover:shadow-intense'
    >
      <motion.div
        className='pointer-events-none absolute inset-0 rounded-2xl border-2 border-fuchsia-500/40'
        animate={expanded ? { opacity: 1, scale: 1.05 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <h2 className='text-xl font-bold text-lime-300'>{herb.name || 'Unknown Herb'}</h2>
      <p className='italic text-sand text-sm'>{herb.scientificName || 'Unknown species'}</p>

      <div className='mt-2 text-sm text-white'>
        <strong>Effects:</strong>{' '}
        {safeEffects.length > 0 ? safeEffects.join(', ') : 'Unknown'}
      </div>

      <div className='mt-2 text-sm text-white'>
        <strong>Description:</strong>{' '}
        {herb.description || 'No description provided.'}
      </div>

      <div className='mt-2 flex flex-wrap gap-2'>
        {safeTags.map(tag => (
          <TagBadge key={tag} label={decodeTag(tag)} variant={tagVariant(tag)} />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {expanded && (
          <motion.div
            layout
            variants={containerVariants}
            initial='collapsed'
            animate='open'
            exit='collapsed'
            transition={{ type: 'spring', stiffness: 70, damping: 20 }}
            className='mt-4 space-y-2 text-sm text-sand'
          >
            <motion.p variants={itemVariants}>
              <strong>Mechanism:</strong> {herb.mechanismOfAction || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Pharmacokinetics:</strong> {herb.pharmacokinetics || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Therapeutic Uses:</strong> {herb.therapeuticUses || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Side Effects:</strong> {herb.sideEffects || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Contraindications:</strong> {herb.contraindications || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Drug Interactions:</strong> {herb.drugInteractions || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Region:</strong> {herb.region || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants}>
              <strong>Legal Status:</strong> {herb.legalStatus || 'Unknown'}
            </motion.p>
            <motion.p
              variants={itemVariants}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-${ratingColor}-300`}
            >
              <span>{ratingIcon}</span>
              <span>{rating || 'Unknown'}</span>
            </motion.p>
            {herb.slug && (
              <motion.div variants={itemVariants}>
                <InfoTooltip text='Open full herb page'>
                  <Link to={`/herbs/${herb.slug}`} className='text-sky-300 underline'>
                    View Full Herb
                  </Link>
                </InfoTooltip>
              </motion.div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.article>
  )
}