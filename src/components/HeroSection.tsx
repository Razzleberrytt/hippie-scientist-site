import { motion } from 'framer-motion'
import HeroBackground from './HeroBackground'
import ParticlesBackground from './ParticlesBackground'
import FloatingElements from './FloatingElements'
import ScrollDownHint from './ScrollDownHint'
import FeaturedHerbTeaser from './FeaturedHerbTeaser'

export default function HeroSection() {
  return (
    <motion.section
      className='relative flex min-h-[70vh] flex-col items-center justify-center overflow-hidden px-4 text-center md:min-h-screen'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
    >
      <ParticlesBackground />
      <HeroBackground />
      <FloatingElements />
      <motion.div
        className='relative z-10 space-y-2'
        initial={{ opacity: 0, y: 40, scale: 0.95 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 1, delay: 0.2 }}
      >
        <h1 className='text-gradient mb-4 font-display text-5xl md:text-7xl'>
          The Hippie Scientist
        </h1>
        <p className='text-lg text-opal md:text-xl'>Psychedelic Botany &amp; Conscious Exploration</p>
      </motion.div>
      <div className='relative z-10'>
        <FeaturedHerbTeaser />
      </div>
      <ScrollDownHint />
    </motion.section>
  )
}
