import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'

export default function HeroSection() {
  return (
    <motion.section
      id='hero'
      initial={{ opacity: 0, y: 40 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8 }}
      className='relative flex min-h-hero flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-forest-green via-lichen to-deep-indigo px-4 py-24 text-center text-white dark:from-space-gray dark:via-space-gray dark:to-space-dark'
    >
      <h1 className='font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl'>The Hippie Scientist</h1>
      <p className='mt-4 max-w-prose text-base sm:text-lg md:text-xl'>Psychedelic Botany &amp; Conscious Exploration</p>
      <div className='mt-6 flex flex-wrap justify-center gap-4'>
        <Link
          to='/database'
          className='rounded-md bg-cosmic-purple px-6 py-3 text-sm font-medium shadow hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple'
        >
          🌿 Browse Herbs
        </Link>
        <Link
          to='/blend'
          className='rounded-md bg-psychedelic-pink px-6 py-3 text-sm font-medium shadow hover:shadow-glow focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-psychedelic-pink'
        >
          🧪 Build a Blend
        </Link>
      </div>
    </motion.section>
  )
}
