import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { herbs } from '../data/masterList'
import { slugify } from '../utils/slugify'
import type { Herb } from '../types'
import TagBadge from './TagBadge'
import { decodeTag, tagVariant } from '../utils/format'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const variants = {
  enter: (d: number) => ({ x: d > 0 ? 100 : -100, opacity: 0 }),
  center: { x: 0, opacity: 1 },
  exit: (d: number) => ({ x: d > 0 ? -100 : 100, opacity: 0 }),
}

export default function RotatingHerbHero() {
  const [items, setItems] = useState<Herb[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [direction, setDirection] = useState(1)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scheduleNext = () => {
    const delay = 6000 + Math.random() * 2000
    timerRef.current = setTimeout(() => {
      setDirection(1)
      setIndex(i => (i + 1) % items.length)
    }, delay)
  }

  const resetTimer = () => {
    if (timerRef.current) clearTimeout(timerRef.current)
    scheduleNext()
  }

  const handlePrev = () => {
    setDirection(-1)
    setIndex(i => (i - 1 + items.length) % items.length)
    resetTimer()
  }

  const handleNext = () => {
    setDirection(1)
    setIndex(i => (i + 1) % items.length)
    resetTimer()
  }

  useEffect(() => {
    setItems(shuffle(herbs))
  }, [])

  useEffect(() => {
    if (!items.length) return
    if (loading) setLoading(false)
    resetTimer()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [items, index])

  if (loading) {
    return (
      <div className='mx-auto mt-8 text-center text-sand'>Loading featured herb...</div>
    )
  }

  const herb = items[index]
  const tags = Array.isArray(herb.tags) ? herb.tags.slice(0, 3) : []

  return (
    <div className='relative mx-auto mt-8 flex max-w-xs justify-center sm:max-w-sm'>
      <button
        aria-label='Previous herb'
        onClick={handlePrev}
        className='absolute left-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-md hover:scale-110'
      >
        <ChevronLeft className='h-5 w-5' />
      </button>
      <button
        aria-label='Next herb'
        onClick={handleNext}
        className='absolute right-0 top-1/2 z-10 -translate-y-1/2 rounded-full bg-black/30 p-2 text-white backdrop-blur-md hover:scale-110'
      >
        <ChevronRight className='h-5 w-5' />
      </button>
      <AnimatePresence custom={direction} mode='wait'>
        <motion.article
          key={herb.id}
          custom={direction}
          variants={variants}
          initial='enter'
          animate='center'
          exit='exit'
          transition={{
            x: { type: 'spring', stiffness: 120, damping: 20 },
            opacity: { duration: 0.2 },
          }}
          className='relative overflow-hidden rounded-2xl border border-white/20 bg-white/10 p-4 text-center text-white backdrop-blur'
        >
          <motion.div
            className='absolute inset-0 -z-10 rounded-2xl bg-gradient-to-br from-fuchsia-600/20 via-emerald-600/10 to-sky-600/20 blur-2xl'
            animate={{ opacity: [0.5, 0.8, 0.5], scale: [1, 1.05, 1] }}
            transition={{ duration: 10, ease: 'easeInOut', repeat: Infinity }}
          />
          {herb.image && (
            <img src={herb.image} alt={herb.name} className='h-32 w-full rounded-md object-cover' />
          )}
          <motion.h3
            className='mt-3 font-herb text-2xl text-lime-300 drop-shadow-[0_0_6px_rgba(163,255,134,0.8)]'
            initial={{ y: 10, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            {herb.name}
          </motion.h3>
          {tags.length > 0 && (
            <motion.div
              className='mt-1 flex flex-wrap justify-center gap-1'
              initial={{ y: 10, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              transition={{ delay: 0.3 }}
            >
              {tags.map(tag => (
                <TagBadge
                  key={tag}
                  label={decodeTag(tag)}
                  variant={tagVariant(tag)}
                  className='text-xs'
                />
              ))}
            </motion.div>
          )}
          {(() => {
            const effects = Array.isArray(herb.effects)
              ? herb.effects.slice(0, 3).join(', ')
              : herb.effects || ''
            return effects ? (
              <motion.p
                className='mt-1 text-sm text-sand'
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.4 }}
              >
                {effects}
              </motion.p>
            ) : null
          })()}
          <motion.div whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.95 }}>
            <Link
              to={`/herb/${herb.slug || herb.id || slugify(herb.name)}`}
              className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:bg-black/40'
            >
              More Info
            </Link>
          </motion.div>
        </motion.article>
      </AnimatePresence>
    </div>
  )
}
