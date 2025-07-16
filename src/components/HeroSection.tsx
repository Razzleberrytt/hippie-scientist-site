import { motion } from 'framer-motion'
import FloatingElements from './FloatingElements'
import HeroBackground from './HeroBackground'

export default function HeroSection() {
  return (
    <section className='relative flex min-h-screen flex-col items-center justify-center overflow-hidden text-center'>
      <HeroBackground />
      <FloatingElements />
      <motion.h1
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className='mb-4 bg-cosmic-forest bg-clip-text font-display text-6xl font-bold text-transparent md:text-8xl'
      >
        The Hippie Scientist
      </motion.h1>
      <motion.p
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.2 }}
        className='max-w-xl text-xl text-gray-200 md:text-2xl'
      >
        Psychedelic Botany &amp; Conscious Exploration
      </motion.p>
    </section>
  )
}
