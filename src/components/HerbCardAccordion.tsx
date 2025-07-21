import React, { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Herb } from '../types/Herb'
import TagBadge from './TagBadge'
import InfoTooltip from './InfoTooltip'
import { decodeTag, tagVariant } from '../utils/format'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import { Star } from 'lucide-react'

interface Props {
  herb: Herb
}

export default function HerbCardAccordion({ herb }: Props) {
  const [expanded, setExpanded] = useState(false)
  const { toggle, isFavorite } = useHerbFavorites()

  const toggleExpanded = () => setExpanded(prev => !prev)
  const safeTags = Array.isArray(herb.tags) ? herb.tags : []
  const safeEffects = Array.isArray(herb.effects) ? herb.effects : []
  const favorite = isFavorite(herb.id)

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
      className='bg-psychedelic-gradient/30 relative cursor-pointer overflow-hidden rounded-2xl p-4 text-white shadow-lg backdrop-blur-md transition-all hover:shadow-intense'
    >
      <motion.div
        className='pointer-events-none absolute inset-0 rounded-2xl border-2 border-fuchsia-500/40'
        animate={expanded ? { opacity: 1, scale: 1.05 } : { opacity: 0 }}
        transition={{ duration: 0.6, ease: 'easeInOut' }}
      />
      <button
        type='button'
        onClick={e => {
          e.stopPropagation()
          toggle(herb.id)
        }}
        className='absolute right-3 top-3 rounded-full bg-black/40 p-1 text-sand backdrop-blur-md hover:bg-white/10'
        aria-label='Toggle favorite'
      >
        <Star className={`h-5 w-5 ${favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      </button>
      <h2 className='text-xl font-bold text-lime-300'>{herb.name || 'Unknown Herb'}</h2>
      <p className='text-sm italic text-sand'>{herb.scientificName || 'Unknown species'}</p>

      <div className='mt-2 text-sm text-white'>
        <strong>Effects:</strong> {safeEffects.length > 0 ? safeEffects.join(', ') : 'Unknown'}
      </div>

      <div className='mt-2 text-sm text-white'>
        <strong>Description:</strong> {herb.description || 'No description provided.'}
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
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <span role='img' aria-label='Mechanism'>
                🧠
              </span>{' '}
              {herb.mechanismOfAction || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <span role='img' aria-label='Pharmacokinetics'>
                ⏳
              </span>{' '}
              {herb.pharmacokinetics || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <span role='img' aria-label='Toxicity'>
                🧪
              </span>{' '}
              {herb.toxicityLD50 || herb.toxicity || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <span role='img' aria-label='Region'>
                🌎
              </span>{' '}
              {herb.region || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <strong>Therapeutic Uses:</strong> {herb.therapeuticUses || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <strong>Side Effects:</strong> {herb.sideEffects || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <strong>Contraindications:</strong> {herb.contraindications || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <strong>Drug Interactions:</strong> {herb.drugInteractions || 'Unknown'}
            </motion.p>
            <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
              <strong>Legal Status:</strong> {herb.legalStatus || 'Unknown'}
            </motion.p>
            {herb.dosage && (
              <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
                <strong>Dosage:</strong> {herb.dosage}
              </motion.p>
            )}
            {herb.onset && (
              <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
                <strong>Onset:</strong> {herb.onset}
              </motion.p>
            )}
            {herb.duration && (
              <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
                <strong>Duration:</strong> {herb.duration}
              </motion.p>
            )}
            {herb.intensity && (
              <motion.p variants={itemVariants} className='whitespace-pre-wrap break-words'>
                <strong>Intensity:</strong> {herb.intensity}
              </motion.p>
            )}
            <motion.p
              variants={itemVariants}
              className={`inline-flex items-center gap-1 rounded px-2 py-0.5 text-${ratingColor}-300`}
            >
              <span>{ratingIcon}</span>
              <span>{rating || 'Unknown'}</span>
            </motion.p>
            {Array.isArray(herb.sources) && herb.sources.length > 0 && (
              <motion.div variants={itemVariants}>
                <strong>Sources:</strong>
                <ul className='list-inside list-disc space-y-1 pl-4'>
                  {herb.sources.map(src => (
                    <li key={src} className='whitespace-pre-wrap break-words'>
                      {src.startsWith('http') ? (
                        <a
                          href={src}
                          target='_blank'
                          rel='noopener noreferrer'
                          className='text-sky-300 underline'
                        >
                          {src}
                        </a>
                      ) : (
                        src
                      )}
                    </li>
                  ))}
                </ul>
              </motion.div>
            )}
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
