import React, { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import herbs from '../data/herbs'
import type { Herb } from '../types'

interface Props {
  fixedId?: string
}

export default function FeaturedHerbTeaser({ fixedId = '' }: Props) {
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

  if (!herb) return null

  return (
    <motion.div
      id='featured-herb'
      className='glass-card mx-auto mt-6 max-w-sm rounded-xl p-4 shadow-lg'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      {herb.image && (
        <img
          src={herb.image}
          alt={herb.name}
          className='h-32 w-full rounded-md object-cover'
        />
      )}
      <h3 className='mt-3 font-herb text-2xl'>{herb.name}</h3>
      {(() => {
        const effects = Array.isArray(herb.effects)
          ? herb.effects.slice(0, 3).join(', ')
          : (herb.effects || '')
        return effects ? <p className='mt-1 text-sm text-sand'>{effects}</p> : null
      })()}
      <Link
        to={`/herbs/${herb.id}`}
        className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:rotate-1'
      >
        Learn More
      </Link>
    </motion.div>
  )
}
