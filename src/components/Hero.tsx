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
      className='relative isolate overflow-hidden pt-16 pb-10 sm:pt-24 sm:pb-16 after:pointer-events-none after:absolute after:-bottom-14 after:left-0 after:h-16 after:w-full after:bg-gradient-to-b after:from-black/60 after:to-transparent'
      aria-labelledby='hero-title'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <div className='absolute inset-0 -z-10 pointer-events-none'>
        <ParticlesBackground />
        <HeroBackground />
        <FloatingElements />
      </div>

      <div className='relative z-10 mx-auto flex max-w-screen-lg flex-col items-center px-4 text-center sm:px-6'>
        <motion.h1
          id='hero-title'
          className='mb-3 text-5xl font-bold leading-tight tracking-tight text-balance gradient-text-animated sm:mb-4 sm:text-6xl md:text-7xl'
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
        >
          The Hippie Scientist
        </motion.h1>

        <motion.p
          className='max-w-2xl text-base text-white/80 sm:text-lg'
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1, duration: 0.6, ease: 'easeOut' }}
        >
          Psychedelic Botany &amp; Conscious Exploration
        </motion.p>

        <motion.div
          className='mt-6 w-full max-w-2xl sm:mt-8'
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.6, ease: 'easeOut' }}
        >
          <div className='rounded-2xl border border-white/10 bg-white/[0.04] p-4 sm:p-6'>
            <h2 className='sr-only'>About</h2>
            <p className='text-white/85'>
              Dive into a growing library of herbs, research, and DIY blend guides.
            </p>
          </div>
        </motion.div>

        <div className='mt-8 flex w-full flex-col items-center gap-6 sm:mt-10 sm:gap-8'>
          <div className='flex justify-center'>
            <RotatingHerbHero />
          </div>
          <StatsCounters className='mt-0' />
          <div className='flex flex-wrap items-center justify-center gap-4'>
            <Link
              to='/database'
              className='hover-glow rounded-md bg-black/30 px-6 py-3 text-white transition hover:shadow-glow backdrop-blur'
            >
              🌿 Browse Herbs
            </Link>
            <Link
              to='/blend'
              className='hover-glow rounded-md bg-black/30 px-6 py-3 text-white transition hover:shadow-glow backdrop-blur'
            >
              🧪 Build a Blend
            </Link>
          </div>
        </div>
      </div>
    </motion.section>
  )
}
