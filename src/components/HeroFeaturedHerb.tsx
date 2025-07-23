import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import herbData from '../data/herbData'
const herbs = herbData.filter(h => 'slug' in h) as any[]
import type { Herb } from '../types'
import TagBadge from './TagBadge'
import { slugify } from '../utils/slugify'
import { decodeTag, tagVariant } from '../utils/format'

interface Props {
  fixedId?: string
}

export default function HeroFeaturedHerb({ fixedId = '' }: Props) {
  const [herb, setHerb] = useState<Herb | null>(null)

  useEffect(() => {
    if (fixedId) {
      const selected = herbs.find(h => h.id === fixedId || h.name === fixedId)
      setHerb(selected ?? herbs[0])
      return
    }
    const psychedelic = herbs.filter(h => h.category.includes('Psychedelic'))
    const pool = psychedelic.length > 0 ? psychedelic : herbs
    setHerb(pool[Math.floor(Math.random() * pool.length)])
  }, [fixedId])

  if (!herb) {
    return (
      <div id='hero-featured-herb' className='mx-auto mt-8 max-w-xs text-center sm:max-w-sm'>
        Loading featured herb...
      </div>
    )
  }

  const tags = Array.isArray(herb.tags) ? herb.tags.slice(0, 3) : []

  return (
    <motion.div
      id='hero-featured-herb'
      className='mx-auto mt-8 max-w-xs sm:max-w-sm'
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
    >
      <motion.article
        whileHover={{ scale: 1.02 }}
        className='bg-psychedelic-gradient/30 soft-border-glow relative overflow-hidden rounded-2xl p-4 text-center text-white shadow-lg backdrop-blur-md'
      >
        {herb.image && (
          <img src={herb.image} alt={herb.name} className='h-32 w-full rounded-md object-cover' />
        )}
        <h3 className='mt-3 font-herb text-2xl text-lime-300'>{herb.name}</h3>
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
        <motion.div whileTap={{ scale: 0.95 }}>
          <Link
            to={`/herb/${herb.slug || herb.id || slugify(herb.name)}`}
            className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:bg-black/40'
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
