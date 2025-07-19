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

const INTERVAL = 6000

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

  return (
    <motion.div
      aria-live='polite'
      className='relative mx-auto mt-6 max-w-sm h-96'
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
      onTouchStart={handleTouch}
    >
      <AnimatePresence mode='wait'>
        <motion.div
          key={herb.id}
          className='glass-card hover-glow absolute inset-0 flex flex-col rounded-xl p-4 shadow-lg'
          initial={reduceMotion ? false : { opacity: 0, y: 20 }}
          animate={reduceMotion ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduceMotion ? { opacity: 0 } : { opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
        >
          {herb.image && (
            <img
              src={herb.image}
              alt={herb.name}
              className='h-32 w-full rounded-md object-cover'
            />
          )}
          <h3 className='mt-3 font-herb text-2xl'>{herb.name}</h3>
          {herb.effects?.length > 0 && (
            <p className='mt-1 text-sm text-sand'>{herb.effects.slice(0, 3).join(', ')}</p>
          )}
          <Link
            to={`/herbs/${herb.id}`}
            className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:rotate-1'
          >
            Learn More
          </Link>
        </motion.div>
      </AnimatePresence>
    </motion.div>
  )
}
