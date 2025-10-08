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
      className='hero-section relative mx-auto w-full max-w-6xl px-4 pt-6 pb-12 sm:pt-8 pb-safe'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ParticlesBackground />
      <HeroBackground />
      <FloatingElements />

      <div className='relative z-10 mx-auto flex w-full max-w-4xl flex-col items-center gap-10'>
        <motion.div
          className='w-full rounded-2xl border border-white/10 bg-white/[0.04] p-6 backdrop-blur-sm md:p-10'
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <p className='text-white/85 text-base md:text-lg'>Psychedelic Botany &amp; Conscious Exploration</p>
          <p className='mt-1 max-w-2xl text-sm text-white/70 md:text-base'>
            Dive into a growing library of herbs, research, and DIY blend guides.
          </p>
        </motion.div>

        <div className='flex flex-col items-center gap-6'>
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
