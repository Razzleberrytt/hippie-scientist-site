import { useState } from 'react'
import type { Herb } from '../types'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ChevronDown } from 'lucide-react'
import clsx from 'clsx'
import { useFavorites } from '../hooks/useFavorites'

interface Props {
  herb: Herb
}

export default function HerbCard({ herb }: Props) {
  const [open, setOpen] = useState(false)
  const { toggle, isFavorite } = useFavorites()

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2 }}
      className='relative rounded-xl bg-midnight-blue/60 p-4 shadow ring-1 ring-white/10 backdrop-blur'
    >
      <button
        onClick={() => toggle(herb.id)}
        className='absolute right-3 top-3 text-pink-400'
        aria-label='Toggle favorite'
      >
        <Heart
          className={clsx('h-5 w-5 transition', isFavorite(herb.id) ? 'fill-pink-400' : 'fill-transparent')}
        />
      </button>
      <button
        type='button'
        onClick={() => setOpen(o => !o)}
        aria-expanded={open}
        className='block w-full text-left'
      >
        <h3 className='font-display text-lg text-lichen'>{herb.name}</h3>
        {herb.scientificName && (
          <p className='text-sm italic text-gray-400'>{herb.scientificName}</p>
        )}
        <div className='mt-2 flex flex-wrap gap-1'>
          {herb.tags.map(tag => (
            <span key={tag} className='tag-pill'>
              {tag}
            </span>
          ))}
        </div>
        <div className='mt-2 flex justify-between text-xs text-gray-400'>
          <span>{herb.intensity}</span>
          <span>{herb.legalStatus}</span>
        </div>
        <ChevronDown
          className={clsx('mx-auto mt-2 h-4 w-4 transition-transform', open && 'rotate-180')}
        />
      </button>
      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key='content'
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.3 }}
            className='overflow-hidden pt-2 text-sm text-gray-300'
          >
            {herb.description && <p className='mb-2'>{herb.description}</p>}
            {herb.effects.length > 0 && (
              <ul className='ml-4 list-disc'>
                {herb.effects.map(e => (
                  <li key={e}>{e}</li>
                ))}
              </ul>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}
