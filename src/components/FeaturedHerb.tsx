import { useEffect, useState } from 'react'
import type { Herb } from '../types'
import HerbCard from './HerbCard'
import { motion } from 'framer-motion'

export default function FeaturedHerb({ herbs }: { herbs: Herb[] }) {
  const [herb, setHerb] = useState<Herb | null>(null)

  useEffect(() => {
    if (herbs.length) {
      setHerb(herbs[Math.floor(Math.random() * herbs.length)])
    }
  }, [herbs])

  if (!herb) return null

  return (
    <motion.div className='mx-auto max-w-sm py-8' initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
      <h2 className='mb-4 text-center font-display text-xl text-lichen'>Featured Herb</h2>
      <HerbCard herb={herb} />
    </motion.div>
  )
}
