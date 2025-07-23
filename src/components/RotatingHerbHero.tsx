import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { herbs } from '../data/herbs/herbsfull'
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

export default function RotatingHerbHero() {
  const [items, setItems] = useState<Herb[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const [paused, setPaused] = useState(false)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scheduleNext = () => {
    const delay = 5000 + Math.random() * 5000
    timerRef.current = setTimeout(() => {
      if (!paused) {
        setIndex(i => (i + 1) % items.length)
      }
    }, delay)
  }

  useEffect(() => {
    setItems(shuffle(herbs))
  }, [])

  useEffect(() => {
    if (!items.length) return
    if (loading) setLoading(false)
    scheduleNext()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [items, index, paused])

  if (loading) {
    return <div className='mx-auto mt-8 text-center text-sand'>Loading featured herb...</div>
  }

  const herb = items[index]
  const tags = Array.isArray(herb.tags) ? herb.tags.slice(0, 3) : []

  return (
    <div
      className='relative mx-auto mt-8 flex max-w-xs justify-center sm:max-w-sm'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => {
        setPaused(false)
        scheduleNext()
      }}
    >
      <AnimatePresence mode='wait'>
        <motion.article
          key={herb.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          whileHover={{ rotateX: -3, rotateY: 3 }}
          className='bg-psychedelic-gradient/30 soft-border-glow group relative overflow-hidden rounded-2xl p-4 text-center text-white shadow-lg backdrop-blur-md'
        >
          {herb.image && (
            <img src={herb.image} alt={herb.name} className='h-32 w-full rounded-md object-cover' />
          )}
          <h3 className='mt-3 font-herb text-2xl text-lime-300 drop-shadow-[0_0_6px_rgba(163,255,134,0.8)]'>
            {herb.name}
          </h3>
          {tags.length > 0 && (
            <div className='mt-1 flex flex-wrap justify-center gap-1'>
              {tags.map(tag => (
                <TagBadge
                  key={tag}
                  label={decodeTag(tag)}
                  variant={tagVariant(tag)}
                  className='text-xs'
                />
              ))}
            </div>
          )}
          {(() => {
            const effects = Array.isArray(herb.effects)
              ? herb.effects.slice(0, 3).join(', ')
              : herb.effects || ''
            return effects ? <p className='mt-1 text-sm text-sand'>{effects}</p> : null
          })()}
          <div className='mt-3 opacity-0 transition-opacity group-hover:opacity-100'>
            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Link
                to={`/herb/${herb.slug || herb.id || slugify(herb.name)}`}
                className='hover-glow inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:bg-black/40'
              >
                More Info
              </Link>
            </motion.div>
          </div>
          <motion.div
            className='pointer-events-none absolute inset-0 rounded-2xl border-2 border-fuchsia-500/40'
            animate={{
              opacity: [0.6, 0.2, 0.6],
              boxShadow: ['0 0 8px #e879f9', '0 0 16px #e879f9', '0 0 8px #e879f9'],
            }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </motion.article>
      </AnimatePresence>
    </div>
  )
}
