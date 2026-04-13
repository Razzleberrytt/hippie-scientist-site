import { motion, useReducedMotion } from '@/lib/motion'
import HeroCTA from './HeroCTA'

export default function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className='hero-focus-glow relative mx-auto mt-2 max-w-6xl px-4 py-14 sm:mt-4 sm:px-6 sm:py-20'>
      <motion.div
        initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
        animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
        transition={reduceMotion ? undefined : { duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className='relative'
      >
        <div className='max-w-3xl space-y-6'>
          <p className='label-specimen'>Specimen No. 001 — Harm Reduction Research</p>
          <h1 className='font-display text-[2.2rem] leading-[0.95] tracking-[-0.02em] text-white sm:text-[4rem]'>
            Clarity before you <span className='text-cyan-300'>experiment</span>
          </h1>
          <p className='max-w-xl text-sm leading-relaxed text-white/70 sm:text-base'>
            Research signals, risk flags, and hard questions so you can make safer decisions.
          </p>
          <HeroCTA />
        </div>
      </motion.div>
    </section>
  )
}
