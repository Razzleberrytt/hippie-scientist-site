import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
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

export default function HerbCardAccordion({ herb }: Props) {
  const [open, setOpen] = useState(false)

  const toggle = () => setOpen(v => !v)

  const handleKey = (e: React.KeyboardEvent<HTMLDivElement>) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault()
      toggle()
    }
  }

  const containerVariants = {
    hidden: {},
    visible: { transition: { staggerChildren: 0.05 } },
  }

  const itemVariants = {
    hidden: { opacity: 0, y: 8 },
    visible: { opacity: 1, y: 0 },
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
      aria-expanded={open}
      className='cursor-pointer overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-purple-950/40 via-fuchsia-900/30 to-sky-900/40 p-6 shadow-xl backdrop-blur-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl focus:outline-none'
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
          ▶
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
            className='overflow-hidden text-sm text-sand'
          >
            <motion.div
              variants={containerVariants}
              initial='hidden'
              animate='visible'
              exit='hidden'
              className='mt-4 space-y-2'
            >
              <motion.div variants={itemVariants}>
                <span className='font-semibold text-lime-300'>Category:</span>{' '}
                <TagBadge
                  label={herb.category}
                  variant={categoryColors[herb.category] || 'purple'}
                  className='ml-1'
                />
              </motion.div>
              <motion.div variants={itemVariants}>
                <span className='font-semibold text-lime-300'>Effects:</span>{' '}
                {herb.effects.join(', ')}
              </motion.div>
              {herb.description && (
                <motion.div variants={itemVariants}>{herb.description}</motion.div>
              )}
              {herb.mechanismOfAction && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Mechanism:</span>{' '}
                  {herb.mechanismOfAction}
                </motion.div>
              )}
              {herb.therapeuticUses && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Therapeutic Uses:</span>{' '}
                  {herb.therapeuticUses}
                </motion.div>
              )}
              {herb.sideEffects && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Side Effects:</span>{' '}
                  {herb.sideEffects}
                </motion.div>
              )}
              {herb.contraindications && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Contraindications:</span>{' '}
                  {herb.contraindications}
                </motion.div>
              )}
              {herb.drugInteractions && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Drug Interactions:</span>{' '}
                  {herb.drugInteractions}
                </motion.div>
              )}
              {herb.preparation && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Preparation:</span>{' '}
                  {herb.preparation}
                </motion.div>
              )}
              {herb.pharmacokinetics && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Pharmacokinetics:</span>{' '}
                  {herb.pharmacokinetics}
                </motion.div>
              )}
              {herb.onset && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Onset:</span> {herb.onset}
                </motion.div>
              )}
              {herb.duration && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Duration:</span> {herb.duration}
                </motion.div>
              )}
              {herb.intensity && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Intensity:</span> {herb.intensity}
                </motion.div>
              )}
              {herb.region && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Region:</span> {herb.region}
                </motion.div>
              )}
              {herb.legalStatus && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Legal Status:</span>{' '}
                  {herb.legalStatus}
                </motion.div>
              )}
              {herb.toxicity && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Toxicity:</span> {herb.toxicity}
                </motion.div>
              )}
              {herb.toxicityLD50 && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Toxicity LD50:</span>{' '}
                  {herb.toxicityLD50}
                </motion.div>
              )}
              {herb.safetyRating != null && (
                <motion.div variants={itemVariants}>
                  <span className='font-semibold text-lime-300'>Safety Rating:</span>{' '}
                  {herb.safetyRating}
                </motion.div>
              )}
              {herb.tags.length > 0 && (
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
