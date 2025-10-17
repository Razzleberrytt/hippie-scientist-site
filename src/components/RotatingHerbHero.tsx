import React, { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useHerbsFull } from '../data/herbs/herbsfull'
import { slugify } from '../utils/slugify'
import type { Herb } from '../types'
import TagBadge from './TagBadge'
import { decodeTag, tagVariant } from '../utils/format'
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

export default function RotatingHerbHero() {
  const source = useHerbsFull()
  const [items, setItems] = useState<Herb[]>([])
  const [index, setIndex] = useState(0)
  const [loading, setLoading] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)

  const scheduleNext = () => {
    const delay = 8000 + Math.random() * 2000
    timerRef.current = setTimeout(() => {
      setIndex(i => (items.length ? (i + 1) % items.length : 0))
    }, delay)
  }

  useEffect(() => {
    if (!source.length) return
    setItems(shuffle(source))
    setIndex(0)
  }, [source])

  useEffect(() => {
    if (!items.length) return
    if (loading) setLoading(false)
    scheduleNext()
    return () => {
      if (timerRef.current) clearTimeout(timerRef.current)
    }
  }, [items, index])

  if (loading) {
    return <div className='text-sand mx-auto mt-8 text-center'>Loading featured herb...</div>
  }

  const herb = items[index]
  const tags = splitField(herb.tags).slice(0, 3)
  const imageProps = getResponsiveImageProps(herb.image, {
    widths: [320, 384, 640],
    sizes: '(min-width: 640px) 384px, (min-width: 375px) 320px, 100vw',
  })

  return (
    <div className='relative mx-auto mt-8 flex max-w-xs justify-center sm:max-w-sm'>
      <AnimatePresence mode='wait'>
        <motion.article
          key={herb.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className='bg-psychedelic-gradient/30 soft-border-glow relative overflow-hidden rounded-2xl p-4 text-center text-white shadow-lg backdrop-blur-md'
        >
          {imageProps && (
            <img
              {...imageProps}
              alt={herbName(herb)}
              className='h-32 w-full rounded-md object-cover'
            />
          )}
          <h3 className='font-herb mt-3 text-2xl text-lime-300 drop-shadow-[0_0_6px_rgba(163,255,134,0.8)]'>
            {herbName(herb)}
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
            const effects = splitField(herb.effects).slice(0, 3).join(', ')
            return effects ? <p className='text-sand mt-1 text-sm'>{effects}</p> : null
          })()}
          <motion.div
            className='pointer-events-none absolute inset-0 rounded-2xl border-2 border-fuchsia-500/40'
            animate={{ opacity: [0.6, 0.2, 0.6] }}
            transition={{ duration: 2.5, repeat: Infinity }}
          />
        </motion.article>
      </AnimatePresence>
    </div>
  )
}
