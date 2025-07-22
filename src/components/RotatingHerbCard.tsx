import React, { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { herbs } from '../data/herbsfull'
import { slugify } from '../utils/slugify'
import type { Herb } from '../types'

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

const INTERVAL = 4500

export default function RotatingHerbCard() {
  const reduceMotion = useReducedMotion()
  const [items] = useState<Herb[]>(() => shuffle(herbs))
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (reduceMotion) return
    intervalRef.current = setInterval(() => {
      if (!paused) {
        setIndex(i => (i + 1) % items.length)
      }
    }, INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [paused, reduceMotion, items])

  const herb = items[index]
  if (!herb) return null

  const handleAdvance = () => {
    const statsRaw = localStorage.getItem('herbTapCounts')
    const stats = statsRaw ? JSON.parse(statsRaw) : {}
    stats[herb.id] = (stats[herb.id] || 0) + 1
    localStorage.setItem('herbTapCounts', JSON.stringify(stats))

    setIndex(i => {
      let next = Math.floor(Math.random() * items.length)
      if (next === i) next = (i + 1) % items.length
      return next
    })
  }

  if (reduceMotion) {
    return (
      <div
        aria-live='polite'
        className='relative mx-auto mt-6 flex min-h-[16rem] min-w-[280px] justify-center'
      >
        <div
          className='glass-card hover-glow inset-0 flex w-full flex-col justify-center rounded-xl p-4 text-center shadow-lg'
          style={{ position: 'absolute', top: 0, left: 0 }}
        >
          {herb.image && (
            <img src={herb.image} alt={herb.name} className='h-32 w-full rounded-md object-cover' />
          )}
          <h3
            className={`mt-3 font-herb ${
              herb.name.length > 20 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {herb.name}
          </h3>
          {(() => {
            const effects = Array.isArray(herb.effects)
              ? herb.effects.slice(0, 3).join(', ')
              : (herb.effects || '')
            return effects ? (
              <p className='mt-1 text-sm text-sand'>{effects}</p>
            ) : null
          })()}
          <Link
            to={
              herb.slug
                ? `/herb/${herb.slug}`
                : `/database#${slugify(herb.name)}`
            }
            className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:rotate-1'
          >
            More Info
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div
      aria-live='polite'
      className='relative mx-auto mt-6 flex min-h-[16rem] min-w-[280px] justify-center'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onClick={handleAdvance}
      onTouchStart={handleAdvance}
      onKeyDown={e => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault()
          handleAdvance()
        }
      }}
      role='button'
      tabIndex={0}
    >
      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={herb.id}
          aria-label={`Herb preview: ${herb.name}${(() => {
            const eff = Array.isArray(herb.effects)
              ? herb.effects.slice(0, 2).join(', ')
              : (herb.effects || '')
            return eff ? ` – ${eff}` : ''
          })()}`}
          className='glass-card hover-glow inset-0 flex w-full flex-col justify-center rounded-xl p-4 text-center shadow-lg'
          style={{ position: 'absolute', top: 0, left: 0 }}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          {herb.image && (
            <img src={herb.image} alt={herb.name} className='h-32 w-full rounded-md object-cover' />
          )}
          <h3
            className={`mt-3 font-herb ${
              herb.name.length > 20 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {herb.name}
          </h3>
          {(() => {
            const effects = Array.isArray(herb.effects)
              ? herb.effects.slice(0, 3).join(', ')
              : (herb.effects || '')
            return effects ? (
              <p className='mt-1 text-sm text-sand'>{effects}</p>
            ) : null
          })()}
          <Link
            to={
              herb.slug
                ? `/herb/${herb.slug}`
                : `/database#${slugify(herb.name)}`
            }
            className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:rotate-1'
          >
            More Info
          </Link>
          <motion.div
            className='pointer-events-none absolute inset-0 rounded-xl ring-2 ring-psychedelic-pink/40 drop-shadow-[0_0_8px_#ff00ff]'
            style={{ willChange: 'filter' }}
            animate={{ filter: ['hue-rotate(0deg)', 'hue-rotate(360deg)'] }}
            transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
          />
          <div className='absolute bottom-2 left-2 right-2 h-2 rounded-full bg-gray-300'>
            <motion.div
              key={index}
              className='h-full rounded-full bg-purple-500'
              initial={{ width: 0 }}
              animate={{ width: '100%' }}
              transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
            />
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
