import { motion, useReducedMotion } from '@/lib/motion'
import Tilt from './Tilt'
import HeroCTA from './HeroCTA'

export default function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className='hero-focus-glow relative mx-auto mt-2 max-w-6xl px-4 py-16 sm:mt-4 sm:px-6 sm:py-24'>

      <Tilt maxTilt={4} perspective={900} className='relative'>
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.99 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className='relative'
        >
          <div className='relative space-y-10 py-6 sm:space-y-14 sm:py-10'>
            <div className='space-y-2.5 sm:space-y-4.5'>
              <motion.p
                initial={reduceMotion ? undefined : { opacity: 0, y: 10 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className='text-xs font-semibold uppercase tracking-[0.24em] text-white/65'
              >
                The Hippie Scientist
              </motion.p>
              <motion.h1
                initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={
                  reduceMotion
                    ? undefined
                    : { delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
                className='max-w-4xl text-[2.4rem] font-semibold leading-[0.97] tracking-[-0.025em] text-white sm:text-[4.75rem]'
              >
                Clarity before you experiment
              </motion.h1>
              <motion.p
                initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={
                  reduceMotion
                    ? undefined
                    : { delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
                }
                className='max-w-2xl text-[0.88rem] leading-[1.45] text-white/68 sm:text-[0.95rem]'
              >
                Research signals, risk flags, and hard questions — before you put anything in your
                body.
              </motion.p>
            </div>

            <HeroCTA />
          </div>
        </motion.div>
      </Tilt>
    </section>
  )
}
