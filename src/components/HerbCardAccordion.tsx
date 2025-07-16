import { useState } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import type { Herb } from '../types'
import { decodeTag } from '../utils/format'

interface Props {
  herb: Herb
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
    hidden: { opacity: 0, y: 10 },
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
      className='cursor-pointer backdrop-blur-xl bg-white/10 border border-white/20 rounded-2xl shadow-lg p-6 transition-all duration-300 hover:shadow-xl hover:ring-1 hover:ring-emerald-400/50 focus:outline-none'
    >
      <div className='flex items-start justify-between gap-4'>
        <div className='min-w-0'>
          <h3 className='font-display text-xl text-gold'>{herb.name}</h3>
          {herb.scientificName && (
            <p className='text-sm italic text-sand'>{herb.scientificName}</p>
          )}
          {herb.description && (
            <p className='mt-1 truncate text-sm text-sand/80'>{herb.description}</p>
          )}
        </div>
        <motion.span
          initial={false}
          animate={{ rotate: open ? 90 : 0 }}
          className='text-sand/70'
        >
          ▶
        </motion.span>
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
              className='mt-4 space-y-1'
            >
              <motion.div variants={itemVariants}>
                <span className='font-medium text-gold'>Category:</span> {herb.category}
              </motion.div>
              <motion.div variants={itemVariants}>
                <span className='font-medium text-gold'>Effects:</span> {herb.effects.join(', ')}
              </motion.div>
              {herb.mechanismOfAction && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Mechanism:</span> {herb.mechanismOfAction}
                </motion.div>
              )}
              {herb.therapeuticUses && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Therapeutic Uses:</span> {herb.therapeuticUses}
                </motion.div>
              )}
              {herb.sideEffects && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Side Effects:</span> {herb.sideEffects}
                </motion.div>
              )}
              {herb.contraindications && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Contraindications:</span> {herb.contraindications}
                </motion.div>
              )}
              {herb.drugInteractions && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Drug Interactions:</span> {herb.drugInteractions}
                </motion.div>
              )}
              {herb.preparation && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Preparation:</span> {herb.preparation}
                </motion.div>
              )}
              {herb.pharmacokinetics && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Pharmacokinetics:</span> {herb.pharmacokinetics}
                </motion.div>
              )}
              {herb.onset && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Onset:</span> {herb.onset}
                </motion.div>
              )}
              {herb.intensity && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Intensity:</span> {herb.intensity}
                </motion.div>
              )}
              {herb.region && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Region:</span> {herb.region}
                </motion.div>
              )}
              {herb.legalStatus && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Legal Status:</span> {herb.legalStatus}
                </motion.div>
              )}
              {herb.toxicity && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Toxicity:</span> {herb.toxicity}
                </motion.div>
              )}
              {herb.toxicityLD50 && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Toxicity LD50:</span> {herb.toxicityLD50}
                </motion.div>
              )}
              {herb.safetyRating != null && (
                <motion.div variants={itemVariants}>
                  <span className='font-medium text-gold'>Safety Rating:</span> {herb.safetyRating}
                </motion.div>
              )}
              {herb.tags.length > 0 && (
                <motion.div variants={itemVariants} className='flex flex-wrap gap-2 pt-2'>
                  {herb.tags.map(tag => (
                    <motion.span
                      key={tag}
                      variants={itemVariants}
                      className='bg-emerald-700/30 text-emerald-200 px-3 py-1 rounded-full text-xs shadow-md hover:bg-emerald-600/50'
                    >
                      {decodeTag(tag)}
                    </motion.span>
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
