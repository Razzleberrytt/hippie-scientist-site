import { motion } from 'framer-motion'
import FloatingElements from './FloatingElements'
import HeroBackground from './HeroBackground'

export default function HeroSection() {
  return (
    <section className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-center sm:py-24'>
      <HeroBackground />
      <FloatingElements />
      <motion.div className='relative z-10 max-w-screen-sm'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='mb-4 font-display text-4xl font-bold text-white drop-shadow md:text-6xl'
        >
          The Hippie Scientist
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='mx-auto max-w-prose text-gray-200'
        >
          Psychedelic Botany &amp; Conscious Exploration
        </motion.p>
      </motion.div>
    </section>
  )
}
