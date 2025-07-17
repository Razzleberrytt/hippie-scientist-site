import React, { useState, useCallback, KeyboardEvent } from 'react'
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

const panelVariants = {
  open: { opacity: 1, height: 'auto' },
  collapsed: { opacity: 0, height: 0 },
}

const chevronVariants = {
  open: { rotate: 90 },
  closed: { rotate: 0 },
}

function HerbCardAccordion({ herb }: Props) {
  const [open, setOpen] = useState(false)

  const toggle = useCallback(() => setOpen(v => !v), [])

  const handleKey = useCallback(
    (e: KeyboardEvent<HTMLDivElement>) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault()
        toggle()
      }
    },
    [toggle]
  )

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
      className='cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-fuchsia-900/30 to-sky-900/40 p-6 shadow-lg backdrop-blur-xl transition-transform duration-300 hover:scale-105 hover:shadow-intense hover:ring-2 hover:ring-fuchsia-400/60 focus:outline-none focus-visible:ring-2 focus-visible:ring-fuchsia-400/60'
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
          animate={open ? 'open' : 'closed'}
          variants={chevronVariants}
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
            variants={panelVariants}
            transition={{ duration: 0.45, ease: [0.4, 0, 0.2, 1] }}
            className='mt-4 overflow-hidden text-sm text-sand'
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
                <motion.div
                  variants={itemVariants}
                  className='flex flex-wrap items-center gap-2'
                >
                  <span className='font-semibold text-lime-300'>Effects:</span>
                  {herb.effects.map(effect => (
                    <TagBadge
                      key={effect}
                      label={effect}
                      variant={tagVariant(effect)}
                    />
                  ))}
                </motion.div>
              )}
              {(
                [
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
                ] as (keyof Herb)[]
              ).map(key => {
                const value = herb[key]
                if (!value) return null
                return (
                  <motion.div key={key} variants={itemVariants}>
                    <span className='font-semibold text-lime-300'>
                      {String(key).replace(/([A-Z])/g, ' $1') + ':'}
                    </span>{' '}
                    {String(value)}
                  </motion.div>
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

export default React.memo(HerbCardAccordion)
