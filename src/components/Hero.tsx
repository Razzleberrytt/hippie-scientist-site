import { motion } from 'framer-motion'
import HeroBackground from './HeroBackground'
import ParticlesBackground from './ParticlesBackground'
import FloatingElements from './FloatingElements'
import FeaturedHerbTeaser from './FeaturedHerbTeaser'

export default function Hero() {
  return (
    <motion.section
      className='relative flex flex-col items-center justify-start overflow-hidden gap-4 px-4 pt-6 text-center md:min-h-screen-nav md:justify-center md:pt-12'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ParticlesBackground />
      <HeroBackground />
      <FloatingElements />
      <motion.div
        className='relative z-10 mx-auto max-w-2xl space-y-1'
        initial={{ opacity: 0, y: 20, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.2, ease: 'easeOut' }}
      >
        <h1 className='text-gradient font-display text-4xl sm:text-5xl md:text-6xl lg:text-7xl'>
          The Hippie Scientist
        </h1>
        <p className='text-opal text-base sm:text-lg md:text-xl'>Psychedelic Botany &amp; Conscious Exploration</p>
      </motion.div>
      <div className='relative z-10 mt-4'>
        <FeaturedHerbTeaser fixedId='Cannabis sativa' />
      </div>
    </motion.section>
  )
}
