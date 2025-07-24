import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import HeroBackground from './HeroBackground'
import ParticlesBackground from './ParticlesBackground'
import FloatingElements from './FloatingElements'
import RotatingHerbHero from './RotatingHerbHero'
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

      <div className='soft-border-glow relative z-10 mx-auto mt-6 w-full max-w-xl rounded-xl border border-lime-400/30 bg-white/10 p-6 shadow-xl backdrop-blur'>
        <div className='flex flex-col items-center justify-center gap-4'>
          <motion.div
            className='mx-auto max-w-2xl space-y-1'
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
          >
            <h1
              id='site-title'
              className='text-gradient font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl'
            >
              The Hippie Scientist
            </h1>
            <p className='text-base text-opal sm:text-lg md:text-xl'>
              Psychedelic Botany &amp; Conscious Exploration
            </p>
          </motion.div>

          <div className='mt-2 flex justify-center'>
            <RotatingHerbHero />
          </div>
        </div>

        <div className='mt-6 flex flex-col items-center gap-4'>
          <StatsCounters className='mt-0' />
          <div className='flex flex-wrap items-center justify-center gap-4'>
            <Link
              to='/database'
              className='hover-glow rounded-md bg-black/30 px-6 py-3 text-white backdrop-blur transition hover:shadow-glow'
            >
              🌿 Browse Herbs
            </Link>
            <Link
              to='/blend'
              className='hover-glow rounded-md bg-black/30 px-6 py-3 text-white backdrop-blur transition hover:shadow-glow'
            >
              🧪 Build a Blend
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
