import { motion } from 'framer-motion'
import HeroBackground from './HeroBackground'
import ParticlesBackground from './ParticlesBackground'

export default function HeroSection() {
  return (
    <section className='relative flex min-h-screen items-center justify-center overflow-hidden text-center'>
      <ParticlesBackground />
      <HeroBackground />
      <motion.div
        className='relative z-10 px-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className='text-gradient mb-4 font-display text-5xl md:text-6xl'>
          The Hippie Scientist
        </h1>
        <p className='text-lg text-opal'>Psychedelic Botany &amp; Conscious Exploration</p>
      </motion.div>
    </section>
  )
}
