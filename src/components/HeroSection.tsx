import { motion } from 'framer-motion'
import HeroBackground from './HeroBackground'
import ParticlesBackground from './ParticlesBackground'
import FloatingElements from './FloatingElements'

export default function HeroSection() {
  return (
    <section className='relative flex min-h-[70vh] items-center justify-center overflow-hidden py-16 text-center'>
      <ParticlesBackground />
      <HeroBackground />
      <FloatingElements />
      <motion.div
        className='relative z-10 px-4'
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
      >
        <h1 className='text-gradient animate-ripple mb-4 font-display text-5xl md:text-6xl'>
          The Hippie Scientist
        </h1>
        <p className='text-lg text-opal'>Psychedelic Botany &amp; Conscious Exploration</p>
      </motion.div>
    </section>
  )
}
