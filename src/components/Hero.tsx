import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import HeroBackground from './HeroBackground'
import ParticlesBackground from './ParticlesBackground'
import FloatingElements from './FloatingElements'
import RotatingHerbCard from './RotatingHerbCard'
import StatsCounters from './StatsCounters'

export default function Hero() {
  return (
    <motion.section
      className='hero-section pb-safe'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ParticlesBackground />
      <HeroBackground />
      <FloatingElements />

      <div className='relative z-10 flex flex-1 flex-col items-center justify-center gap-4'>
        <motion.div
          className='mx-auto max-w-2xl space-y-1'
          initial={{ opacity: 0, y: 20, scale: 0.95 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
        >
          <h1 className='text-gradient font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl'>
            The Hippie Scientist
          </h1>
          <p className='text-opal text-base sm:text-lg md:text-xl'>Psychedelic Botany &amp; Conscious Exploration</p>
        </motion.div>

        <div className='mt-2'>
          <RotatingHerbCard />
        </div>
      </div>

      <div className='relative z-10 mb-4 flex flex-col items-center gap-4'>
        <StatsCounters className='mt-0' />
        <Link
          to='/database'
          className='hover-glow inline-block rounded-md bg-black/30 px-6 py-3 text-white backdrop-blur-md hover:rotate-1'
        >
          🌿 Browse Database
        </Link>
      </div>
    </motion.section>
  )
}
