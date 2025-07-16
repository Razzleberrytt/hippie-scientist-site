import { motion } from 'framer-motion'
import FloatingElements from './FloatingElements'
import HeroBackground from './HeroBackground'

export default function HeroSection() {
  return (
    <section className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-center sm:py-24'>
      <HeroBackground />
      <FloatingElements />
      <motion.div
        className='relative z-10 max-w-screen-sm'
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 1 }}
      >
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1 }}
          className='mb-4 bg-gradient-to-br from-nebula-pink via-galactic-blue to-neon-green bg-clip-text font-display text-5xl font-bold text-transparent neon-shadow sm:text-7xl'
        >
          The Hippie Scientist
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.3 }}
          className='mx-auto max-w-prose text-gray-200'
        >
          Psychedelic Botany &amp; Conscious Exploration
        </motion.p>
      </motion.div>
    </section>
  )
}
