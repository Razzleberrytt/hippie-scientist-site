import React, { useState, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronRight, Star } from 'lucide-react'
import type { Herb } from '../types'
import { decodeTag, tagVariant, safetyColorClass } from '../utils/format'
import TagBadge from './TagBadge'
import { useHerbFavorites } from '../hooks/useHerbFavorites'

interface Props {
  herb: Herb
}

const categoryColors: Record<string, Parameters<typeof TagBadge>[0]['variant']> = {
  Oneirogen: 'blue',
  'Dissociative / Sedative': 'purple',
  'Empathogen / Euphoriant': 'pink',
  'Ritual / Visionary': 'green',
  Other: 'yellow',
}

const containerVariants = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.05 } },
}

const itemVariants = {
  hidden: { opacity: 0, y: 10 },
  visible: { opacity: 1, y: 0 },
}

export default function HerbCardAccordion({ herb }: Props) {
  const [open, setOpen] = useState(false)
  const toggle = () => setOpen(v => !v)
  const { isFavorite, toggle: toggleFavorite } = useHerbFavorites()

  const handleKey = (e: KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      exit={{ opacity: 0, scale: 0.9 }}
      onClick={toggle}
      onKeyDown={handleKey}
      tabIndex={0}
      role='button'
      aria-expanded={open}
      whileHover={{ scale: 1.03, rotateX: 1, rotateY: -1 }}
      whileTap={{ scale: 0.97 }}
      transition={{ layout: { duration: 0.4, ease: 'easeInOut' } }}
      className='relative cursor-pointer overflow-hidden rounded-2xl bg-black/20 p-4 sm:p-6 ring-1 ring-white/10 shadow-xl backdrop-blur-lg transition-all hover:shadow-2xl focus:outline-none'
    >
      <motion.span
        initial={{ opacity: 0, y: -4 }}
        whileHover={{ opacity: 1, y: 0 }}
        whileTap={{ opacity: 1, y: 0 }}
        className='pointer-events-none absolute right-4 top-2 text-xs text-sand'
      >
        + More Info
      </motion.span>
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h3 className='font-herb text-lg sm:text-xl text-white'>{herb.name}</h3>
          {herb.scientificName && <p className='text-xs italic text-sand'>{herb.scientificName}</p>}
          <div className='mt-1 flex flex-wrap items-center gap-2 text-sm text-sand'>
            {herb.category && (
              <TagBadge label={herb.category} variant={categoryColors[herb.category] || 'purple'} />
            )}
            {herb.effects?.length > 0 && <span>{herb.effects.join(', ')}</span>}
          </div>
        </div>
        <div className='flex items-center gap-2'>
          <button
            type='button'
            onClick={e => {
              e.stopPropagation()
              toggleFavorite(herb.id)
            }}
            aria-label={isFavorite(herb.id) ? 'Remove favorite' : 'Add favorite'}
            className='rounded-md p-1 text-yellow-400 hover:bg-white/10'
          >
            <Star fill={isFavorite(herb.id) ? 'currentColor' : 'none'} size={18} />
          </button>
          <motion.span
            layout
            initial={false}
            animate={{ rotate: open ? 90 : 0 }}
            transition={{ duration: 0.3 }}
            className='text-cyan-200 transition-transform'
          >
            <ChevronRight size={18} />
          </motion.span>
        </div>
      </div>

      <div className='mt-2 flex flex-wrap gap-2'>
        {herb.tags.slice(0, 3).map(tag => (
          <TagBadge
            key={tag}
            label={decodeTag(tag)}
            variant={tagVariant(tag)}
            className={open ? 'animate-pulse' : ''}
          />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            layout
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className='mt-4 overflow-hidden text-sm sm:text-base text-sand'
          >
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              className='space-y-2'
            >
              {[
                'description',
                'mechanismOfAction',
                'therapeuticUses',
                'sideEffects',
                'contraindications',
                'drugInteractions',
                'preparation',
                'pharmacokinetics',
                'onset',
                'duration',
                'intensity',
                'region',
                'legalStatus',
                'safetyRating',
                'toxicity',
                'toxicityLD50',
              ].map(key => {
                const raw = (herb as any)[key]
                const value = raw && raw !== 'No description provided.' && raw !== '' ? raw : 'N/A'
                return (
                  <motion.div key={key} variants={itemVariants}>
                    <span className='font-semibold text-lime-300'>
                      {key.replace(/([A-Z])/g, ' $1') + ':'}
                    </span>{' '}
                    {key === 'safetyRating' ? (
                      <span className={typeof raw === 'number' ? safetyColorClass(raw) : ''}>
                        {value}
                      </span>
                    ) : (
                      value
                    )}
                  </motion.div>
                )
              })}

              {herb.tags?.length > 0 && (
                <motion.div variants={itemVariants} className='flex flex-wrap gap-2 pt-2'>
                  {herb.tags.map(tag => (
                    <TagBadge
                      key={tag}
                      label={decodeTag(tag)}
                      variant={tagVariant(tag)}
                      className={open ? 'animate-pulse' : ''}
                    />
                  ))}
                </motion.div>
              )}
              <motion.div variants={itemVariants} className='pt-2'>
                <Link
                  to={`/herbs/${herb.id}`}
                  onClick={e => e.stopPropagation()}
                  className='text-comet underline'
                >
                  View full page
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
