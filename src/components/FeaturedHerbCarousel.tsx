import React, { useEffect, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import herbs from '../data/herbs'

const featured = herbs.slice(0, 5)

export default function FeaturedHerbCarousel() {
  const [index, setIndex] = useState(0)

  useEffect(() => {
    const id = setInterval(() => {
      setIndex(i => (i + 1) % featured.length)
    }, 6000)
    return () => clearInterval(id)
  }, [])

  const herb = featured[index]

  return (
    <div className='relative mx-auto mt-8 max-w-md'>
      <AnimatePresence mode='wait'>
        <motion.div
          key={herb.id}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.6 }}
          className='glass-card cursor-pointer overflow-hidden rounded-xl p-4 shadow-lg'
          whileHover={{ scale: 1.03, rotate: 0.5 }}
        >
          {herb.image && (
            <img src={herb.image} alt={herb.name} className='h-40 w-full rounded-md object-cover' />
          )}
          <h3 className='mt-3 font-herb text-2xl'>{herb.name}</h3>
          {herb.description && (
            <p className='mt-1 line-clamp-2 text-sm text-sand'>{herb.description}</p>
          )}
          <Link
            to={`/herbs/${herb.id}`}
            className='hover-glow mt-3 inline-block rounded-md bg-black/30 px-4 py-2 text-sand backdrop-blur-md hover:rotate-1'
          >
            Learn More
          </Link>
        </motion.div>
      </AnimatePresence>
    </div>
  )
}
