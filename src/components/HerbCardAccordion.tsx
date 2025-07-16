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
              variants={{ hidden: { opacity: 0, y: 10 }, visible: { opacity: 1, y: 0 } }}
              transition={{ staggerChildren: 0.05 }}
              className='mt-4 space-y-1'
            >
              <div><span className='font-medium text-gold'>Effects:</span> {herb.effects.join(', ')}</div>
              {herb.mechanismOfAction && (
                <div><span className='font-medium text-gold'>Mechanism:</span> {herb.mechanismOfAction}</div>
              )}
              {herb.preparation && (
                <div><span className='font-medium text-gold'>Preparation:</span> {herb.preparation}</div>
              )}
              {herb.onset && (
                <div><span className='font-medium text-gold'>Onset:</span> {herb.onset}</div>
              )}
              {herb.duration && (
                <div><span className='font-medium text-gold'>Duration:</span> {herb.duration}</div>
              )}
              {herb.intensity && (
                <div><span className='font-medium text-gold'>Intensity:</span> {herb.intensity}</div>
              )}
              {herb.region && (
                <div><span className='font-medium text-gold'>Region:</span> {herb.region}</div>
              )}
              {herb.legalStatus && (
                <div><span className='font-medium text-gold'>Legal:</span> {herb.legalStatus}</div>
              )}
              {herb.toxicityLD50 && (
                <div><span className='font-medium text-gold'>Toxicity LD50:</span> {herb.toxicityLD50}</div>
              )}
              {herb.tags.length > 0 && (
                <div className='flex flex-wrap gap-2 pt-2'>
                  {herb.tags.map(tag => (
                    <span
                      key={tag}
                      className='bg-emerald-700/30 text-emerald-200 px-3 py-1 rounded-full text-xs shadow-md hover:bg-emerald-600/50'
                    >
                      {decodeTag(tag)}
                    </span>
                  ))}
                </div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
