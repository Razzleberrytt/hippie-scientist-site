import React, { useEffect, useState, useRef } from 'react'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import herbs from '../data/herbs'
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

  const handleTouch = () => setPaused(p => !p)

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
          {herb.effects?.length > 0 && (
            <p className='mt-1 text-sm text-sand'>{herb.effects.slice(0, 3).join(', ')}</p>
          )}
          <Link
            to={`/herbs/${herb.id}`}
            className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:rotate-1'
          >
            Learn More
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
      onTouchStart={handleTouch}
    >
      <AnimatePresence exitBeforeEnter>
        <motion.div
          key={herb.id}
          className='glass-card hover-glow inset-0 flex w-full flex-col justify-center rounded-xl p-4 text-center shadow-lg'
          style={{ position: 'absolute', top: 0, left: 0 }}
          initial={reduceMotion ? false : { opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -10 }}
          transition={{ duration: 0.6 }}
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
          {herb.effects?.length > 0 && (
            <p className='mt-1 text-sm text-sand'>{herb.effects.slice(0, 3).join(', ')}</p>
          )}
          <Link
            to={`/herbs/${herb.id}`}
            className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:rotate-1'
          >
            Learn More
          </Link>
          <motion.div
            key={index}
            className='absolute bottom-0 left-0 h-1 w-full bg-forest-green/40'
            initial={{ width: 0 }}
            animate={{ width: '100%' }}
            transition={{ duration: INTERVAL / 1000, ease: 'linear' }}
          />
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
