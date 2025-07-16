import { motion } from 'framer-motion'
import FloatingElements from './FloatingElements'
import HeroBackground from './HeroBackground'

export default function HeroSection() {
  return (
    <section className='relative flex min-h-screen items-center justify-center overflow-hidden px-6 py-10 text-center sm:py-20'>
      <HeroBackground />
      <FloatingElements />
      <div className='relative z-10 w-full max-w-screen-md space-y-4'>
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className='text-gradient drop-shadow-lg text-5xl sm:text-6xl md:text-8xl'
        >
          The Hippie Scientist
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className='mx-auto max-w-prose text-xl text-gray-100 drop-shadow-md sm:text-2xl'
        >
          Psychedelic Botany &amp; Conscious Exploration
        </motion.p>
      </div>
    </section>
  )
}
