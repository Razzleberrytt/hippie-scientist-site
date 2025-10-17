import React, { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useHerbsFull } from '../data/herbs/herbsfull'
import { slugify } from '../utils/slugify'
import type { Herb } from '../types'
import { herbName, splitField } from '../utils/herb'
import { getResponsiveImageProps } from '../utils/images'

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
  const source = useHerbsFull()
  const [items, setItems] = useState<Herb[]>([])
  const [index, setIndex] = useState(0)
  const [paused, setPaused] = useState(false)
  const intervalRef = useRef<NodeJS.Timeout>()

  useEffect(() => {
    if (source.length === 0) return
    setItems(shuffle(source))
    setIndex(0)
  }, [source])

  useEffect(() => {
    if (reduceMotion) return
    if (items.length === 0) return
    intervalRef.current = setInterval(() => {
      if (!paused) {
        setIndex(i => (i + 1) % items.length)
      }
    }, INTERVAL)
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [items, paused, reduceMotion])

  const herb = items[index]
  if (!herb) return null

  const imageProps = getResponsiveImageProps(herb.image, {
    widths: [320, 420, 640],
    sizes: '(min-width: 1024px) 420px, (min-width: 768px) 360px, (min-width: 375px) 320px, 100vw',
  })

  const handleAdvance = () => {
    const statsRaw = localStorage.getItem('herbTapCounts')
    const stats = statsRaw ? JSON.parse(statsRaw) : {}
    stats[herb.id] = (stats[herb.id] || 0) + 1
    localStorage.setItem('herbTapCounts', JSON.stringify(stats))

    if (items.length === 0) return
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
        <div className='glass-card hover-glow absolute inset-0 flex w-full flex-col justify-center rounded-xl p-4 text-center shadow-lg'>
          {imageProps && (
            <img
              {...imageProps}
              alt={herbName(herb)}
              className='h-32 w-full rounded-md object-cover'
            />
          )}
          <h3
            className={`font-herb mt-3 ${
              herbName(herb).length > 20 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
            }`}
          >
            {herbName(herb)}
          </h3>
          {(() => {
            const effects = Array.isArray(herb.effects)
              ? herb.effects.slice(0, 3).join(', ')
              : herb.effects || ''
            return effects ? <p className='text-sand mt-1 text-sm'>{effects}</p> : null
          })()}
          <Link
            to={herb.slug ? `/herb/${herb.slug}` : `/herbs#${slugify(herbName(herb))}`}
            className='hover-glow text-sand mt-3 inline-block rounded-md bg-black/30 px-4 py-2 backdrop-blur-md hover:rotate-1'
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
    >
      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={herb.id}
          aria-label={`Herb preview: ${herbName(herb)}${(() => {
            const eff = splitField(herb.effects).slice(0, 2).join(', ')
            return eff ? ` – ${eff}` : ''
          })()}`}
          className='glass-card hover-glow absolute inset-0 flex w-full flex-col justify-center rounded-xl p-4 text-center shadow-lg'
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <button
            type='button'
            onClick={handleAdvance}
            className='flex w-full flex-col items-center bg-transparent p-0 text-center focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-emerald-400'
          >
            {imageProps && (
              <img
                {...imageProps}
                alt={herbName(herb)}
                className='h-32 w-full rounded-md object-cover'
              />
            )}
            <h3
              className={`font-herb mt-3 ${
                herbName(herb).length > 20 ? 'text-lg sm:text-xl' : 'text-xl sm:text-2xl'
              }`}
            >
              {herbName(herb)}
            </h3>
            {(() => {
              const effects = splitField(herb.effects).slice(0, 3).join(', ')
              return effects ? <p className='text-sand mt-1 text-sm'>{effects}</p> : null
            })()}
          </button>
          <Link
            to={herb.slug ? `/herb/${herb.slug}` : `/herbs#${slugify(herbName(herb))}`}
            className='hover-glow text-sand mt-3 inline-block rounded-md bg-black/30 px-4 py-2 backdrop-blur-md hover:rotate-1'
          >
            More Info
          </Link>
          <motion.div
            className='ring-psychedelic-pink/40 pointer-events-none absolute inset-0 rounded-xl ring-2 drop-shadow-[0_0_8px_#ff00ff] [will-change:filter]'
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
