import React, { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Herb } from '../types/Herb'
import TagBadge from './TagBadge'
import InfoTooltip from './InfoTooltip'
import CompoundBadge from './CompoundBadge'
import { decodeTag, tagVariant } from '../utils/format'
import { useHerbFavorites } from '../hooks/useHerbFavorites'
import { Star } from 'lucide-react'
import { slugify } from '../utils/slugify'
import { herbBlurbs } from '../../blurbs'

interface Props {
  herb: Herb
}

export default function HerbCardAccordion({ herb }: Props) {
  const [expanded, setExpanded] = useState(false)
  const cardRef = useRef<HTMLDivElement>(null)
  const { toggle, isFavorite } = useHerbFavorites()

  const toggleExpanded = () => setExpanded(prev => !prev)

  useEffect(() => {
    if (expanded && cardRef.current) {
      const rect = cardRef.current.getBoundingClientRect()
      const viewH = window.innerHeight || document.documentElement.clientHeight
      if (rect.bottom > viewH || rect.top < 0) {
        cardRef.current.scrollIntoView({ behavior: 'smooth', block: 'nearest' })
      }
    }
  }, [expanded])
  const safeTags = Array.isArray(herb.tags) ? herb.tags : []
  const safeEffects = Array.isArray(herb.effects) ? herb.effects : []
  const safeCompounds = Array.isArray((herb as any).compounds)
    ? (herb as any).compounds
    : []
  const favorite = isFavorite(herb.id)

  const containerVariants = {
    open: { transition: { staggerChildren: 0.08, delayChildren: 0.15 } },
    collapsed: { transition: { staggerDirection: -1, staggerChildren: 0.05 } },
  }

  const itemVariants = {
    open: { opacity: 1, y: 0, scale: 1 },
    collapsed: { opacity: 0, y: -8, scale: 0.95 },
  }

  return (
    <motion.article
      ref={cardRef}
      layout
      transition={{ layout: { type: 'spring', stiffness: 200, damping: 20 } }}
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
      id={slugify(herb.name)}
      role='button'
      tabIndex={0}
      aria-expanded={expanded}
      className='bg-psychedelic-gradient/30 soft-border-glow group relative cursor-pointer overflow-hidden rounded-2xl p-4 text-white shadow-lg backdrop-blur-md transition-all hover:shadow-intense focus:outline-none'
    >
      <motion.div
        className='pointer-events-none absolute inset-0 rounded-2xl border-2 border-fuchsia-500/40'
        animate={expanded ? { opacity: 1, scale: 1.05 } : { opacity: 0 }}
        transition={{ duration: 0.4, ease: 'easeInOut' }}
      />
      <button
        type='button'
        onClick={e => {
          e.stopPropagation()
          toggle(herb.id)
        }}
        className='hover-glow absolute right-3 top-3 rounded-full bg-black/40 p-1 text-sand backdrop-blur-md hover:bg-white/10'
        aria-label='Toggle favorite'
      >
        <Star className={`h-5 w-5 ${favorite ? 'fill-yellow-400 text-yellow-400' : ''}`} />
      </button>
      <div className='flex items-center gap-2'>
        <span
          className='text-xl font-bold text-lime-300 transition group-hover:drop-shadow-[0_0_6px_rgba(163,255,134,0.8)] group-hover:text-lime-200'
        >
          {herb.name || 'Unknown Herb'}
        </span>
      </div>
      <p className='text-sm italic text-sand'>{herb.scientificName || 'Unknown species'}</p>
      {herbBlurbs[herb.name] && (
        <p className='mt-1 text-sm italic text-gray-300'>
          {herbBlurbs[herb.name]}
        </p>
      )}

      <div className='mt-2 text-sm text-white'>
        <strong>Effects:</strong> {safeEffects.length > 0 ? safeEffects.join(', ') : 'Unknown'}
      </div>

      <div className='mt-2 text-sm text-white'>
        <strong>Description:</strong> {herb.description || 'No description provided.'}
      </div>

      <div className='mt-2 flex max-w-full flex-wrap gap-2'>
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
            transition={{ type: 'spring', stiffness: 200, damping: 24 }}
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
            {safeCompounds.length > 0 && (
              <motion.div
                variants={itemVariants}
                className='flex flex-wrap items-center gap-1'
              >
                <strong className='mr-1'>Active Compounds:</strong>
                {safeCompounds.map(c => (
                  <CompoundBadge key={c} name={c} />
                ))}
              </motion.div>
            )}
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
