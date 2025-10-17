import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { useHerbsFull } from '../data/herbs/herbsfull'
import type { Herb } from '../types'
import TagBadge from './TagBadge'
import { slugify } from '../utils/slugify'
import { decodeTag, tagVariant } from '../utils/format'
import { herbName, splitField } from '../utils/herb'
import { gradientClassName } from '../lib/classMap'
import { getResponsiveImageProps } from '../utils/images'

interface Props {
  fixedId?: string
}

export default function HeroFeaturedHerb({ fixedId = '' }: Props) {
  const [herb, setHerb] = useState<Herb | null>(null)
  const herbs = useHerbsFull()

  useEffect(() => {
    if (!herbs.length) return
    if (fixedId) {
      const selected = herbs.find(h => h.id === fixedId || h.name === fixedId)
      setHerb(selected ?? herbs[0])
      return
    }
    const psychedelic = herbs.filter(h => h.category.includes('Psychedelic'))
    const pool = psychedelic.length > 0 ? psychedelic : herbs
    setHerb(pool[Math.floor(Math.random() * pool.length)])
  }, [fixedId, herbs])

  if (!herb) {
    return (
      <div id='hero-featured-herb' className='mx-auto mt-8 max-w-xs text-center sm:max-w-sm'>
        Loading featured herb...
      </div>
    )
  }

  const tags = splitField(herb.tags).slice(0, 3)
  const accentGradient = gradientClassName(
    herb.category || herb.compoundClasses?.[0] || tags[0],
    'psychoactive'
  )
  const imageProps = getResponsiveImageProps(herb.image, {
    widths: [320, 384, 640],
    sizes: '(min-width: 640px) 384px, (min-width: 375px) 320px, 100vw',
  })

  return (
    <motion.div
      id='hero-featured-herb'
      className='mx-auto mt-8 max-w-xs sm:max-w-sm'
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.article
        whileHover={{ scale: 1.02 }}
        className='soft-border-glow relative overflow-hidden rounded-2xl p-4 text-center text-white shadow-lg backdrop-blur-md'
      >
        <div
          className={`pointer-events-none absolute inset-0 -z-10 opacity-70 blur-2xl ${accentGradient}`}
        />
        {imageProps && (
          <img
            {...imageProps}
            alt={herbName(herb)}
            className='h-32 w-full rounded-md object-cover'
          />
        )}
        <h3 className='font-herb mt-3 text-2xl text-lime-300'>{herbName(herb)}</h3>
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
        <motion.div whileTap={{ scale: 0.95 }}>
          <Link
            to={`/herb/${herb.slug || herb.id || slugify(herbName(herb))}`}
            className='hover-glow text-sand mt-3 inline-block rounded-md bg-black/30 px-4 py-2 backdrop-blur-md hover:bg-black/40'
          >
            More Info
          </Link>
        </motion.div>
        <motion.div
          className='pointer-events-none absolute inset-0 rounded-2xl border-2 border-fuchsia-500/40'
          animate={{ opacity: [0.6, 0.2, 0.6] }}
          transition={{ duration: 2.5, repeat: Infinity }}
        />
      </motion.article>
    </motion.div>
  )
}
