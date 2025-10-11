import { motion } from 'framer-motion'
import { Link } from 'react-router-dom'
import HeroBackground from './HeroBackground'
import RotatingHerbHero from './RotatingHerbHero'
import StatsCounters from './StatsCounters'

export default function Hero() {
  return (
    <motion.section
      className='relative z-0 overflow-hidden pb-12 sm:pb-16'
      style={{ paddingTop: 'calc(var(--headerH, 64px) + 32px)' }}
      aria-labelledby='hero-title'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <HeroBackground />

      <div className='relative z-10 mx-auto flex max-w-screen-lg flex-col items-center px-4 text-center sm:px-6'>
        <motion.h1
          id='hero-title'
          className='mb-3 text-4xl font-extrabold tracking-tight text-balance gradient-text-animated sm:mb-4 sm:text-5xl md:text-6xl'
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
          className='mt-4 w-full max-w-2xl md:mt-5'
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

        <div className='mt-6 flex w-full flex-col items-center sm:mt-8'>
          <div className='flex justify-center'>
            <RotatingHerbHero />
          </div>
          <StatsCounters />
          <div className='mt-6 flex flex-wrap items-center justify-center gap-4 md:mt-8'>
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
