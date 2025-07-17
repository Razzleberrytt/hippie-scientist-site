import { motion } from 'framer-motion'
import FloatingElements from './FloatingElements'
import HeroBackground from './HeroBackground'

export default function HeroSection() {
  return (
    <section className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-16 text-center sm:py-24'>
      <HeroBackground />
      <FloatingElements />
      <motion.div className='relative z-10 max-w-screen-md'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='text-gradient mb-6 font-display text-5xl font-bold drop-shadow md:text-7xl'
        >
          The Hippie Scientist
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='mx-auto max-w-prose text-lg text-spore md:text-xl'
        >
          Exploring altered states of consciousness through botany
        </motion.p>
      </motion.div>
    </section>
  )
}
