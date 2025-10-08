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
      className='hero-section relative mx-auto w-full max-w-6xl px-4 pt-6 pb-10 sm:pt-8 pb-safe'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ParticlesBackground />
      <HeroBackground />
      <FloatingElements />

      <div className='relative z-10 mx-auto mt-6 w-full max-w-xl rounded-xl border border-emerald-500/40 bg-white/10 p-6 shadow-xl backdrop-blur soft-border-glow'>
        <motion.div
          className='absolute inset-0 -z-10 rounded-xl bg-gradient-to-br from-emerald-500/30 via-emerald-600/20 to-transparent animate-gradient'
          aria-hidden='true'
        />
        <div className='flex flex-col items-center justify-center gap-4'>
          <div className='mx-auto max-w-2xl space-y-1 text-center'>
            <motion.h1
              className='text-gradient font-display text-4xl leading-tight sm:text-5xl md:text-6xl lg:text-7xl'
              initial={{ opacity: 0, x: -60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8 }}
            >
              The Hippie Scientist
            </motion.h1>
            <motion.p
              className='text-opal text-base sm:text-lg md:text-xl'
              initial={{ opacity: 0, x: 60 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, delay: 0.1 }}
            >
              Psychedelic Botany &amp; Conscious Exploration
            </motion.p>
            <motion.p
              className='text-sand text-sm sm:text-base md:text-lg'
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.2 }}
            >
              Dive into a growing library of herbs, research and DIY blend guides.
            </motion.p>
          </div>

          <div className='mt-4 flex justify-center'>
            <RotatingHerbHero />
          </div>
        </div>

        <div className='mt-6 flex flex-col items-center gap-4'>
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
