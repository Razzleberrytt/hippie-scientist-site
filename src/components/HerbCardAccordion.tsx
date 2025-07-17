import React, { useState, KeyboardEvent } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { ChevronRight } from 'lucide-react'
import type { Herb } from '../types'
import { decodeTag, tagVariant } from '../utils/format'
import TagBadge from './TagBadge'

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
      onClick={toggle}
      onKeyDown={handleKey}
      tabIndex={0}
      role='button'
      aria-expanded={open}
      className='cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-fuchsia-900/30 to-sky-900/40 p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:ring-2 hover:ring-fuchsia-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60'
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h3 className='font-display text-xl text-opal'>{herb.name}</h3>
          {herb.scientificName && (
            <p className='text-xs italic text-sand'>{herb.scientificName}</p>
          )}
        </div>
        <motion.span
          initial={false}
          animate={{ rotate: open ? 90 : 0 }}
          className='text-cyan-200 transition-transform'
        >
          <ChevronRight size={18} />
        </motion.span>
      </div>

      <div className='mt-2 flex flex-wrap gap-2'>
        {herb.tags.slice(0, 2).map(tag => (
          <TagBadge key={tag} label={decodeTag(tag)} variant={tagVariant(tag)} />
        ))}
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key='content'
            initial='collapsed'
            animate='open'
            exit='collapsed'
            variants={{
              open: { opacity: 1, height: 'auto' },
              collapsed: { opacity: 0, height: 0 },
            }}
            transition={{ duration: 0.4, ease: 'easeInOut' }}
            className='overflow-hidden text-sm text-sand mt-4'
          >
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              className='space-y-2'
            >
              {herb.category && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Category:</span>{' '}
                  <TagBadge
                    label={herb.category}
                    variant={categoryColors[herb.category] || 'purple'}
                    className='ml-1'
                  />
                </motion.div>
              )}
              {herb.effects?.length > 0 && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Effects:</span>{' '}
                  {herb.effects.join(', ')}
                </motion.div>
              )}
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
                'toxicity',
                'toxicityLD50',
                'safetyRating',
              ].map(key => {
                const value = (herb as any)[key]
                return (
                  value && (
                    <motion.div key={key} variants={itemVariants}>
                      <span className='font-semibold text-lime-300'>
                        {key.replace(/([A-Z])/g, ' $1') + ':'}
                      </span>{' '}
                      {value}
                    </motion.div>
                  )
                )
              })}

              {herb.tags?.length > 0 && (
                <motion.div variants={itemVariants} className='flex flex-wrap gap-2 pt-2'>
                  {herb.tags.map(tag => (
                    <TagBadge key={tag} label={decodeTag(tag)} variant={tagVariant(tag)} />
                  ))}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
