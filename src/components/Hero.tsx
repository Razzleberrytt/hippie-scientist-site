import { motion, useReducedMotion } from '@/lib/motion'
import Tilt from './Tilt'
import HeroCTA from './HeroCTA'

export default function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className='relative mx-auto mt-4 max-w-4xl px-4 py-10 sm:mt-6 sm:px-6 sm:py-14'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 grid place-items-center'
      >
        <div className='animate-breathe from-emerald-500/10 to-indigo-500/8 size-[54rem] rounded-full bg-gradient-to-br via-fuchsia-500/10 blur-[130px]' />
      </div>

      <Tilt maxTilt={4} perspective={900} className='relative'>
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 16, scale: 0.99 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
          className='shadow-halo border-white/12 relative overflow-hidden rounded-[24px] border bg-white/[0.04] backdrop-blur-2xl sm:rounded-[28px]'
        >
          <div
            className='pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.1] via-transparent to-violet-300/[0.1]'
            aria-hidden
          />
          <div
            className='pointer-events-none absolute inset-[1px] rounded-[23px] border border-white/10 sm:rounded-[27px]'
            aria-hidden
          />
          <div
            className='pointer-events-none absolute -top-24 left-0 right-0 h-48 bg-gradient-to-b from-white/[0.06] to-transparent'
            aria-hidden
          />

          <div className='relative space-y-8 p-5 sm:space-y-12 sm:p-10'>
            <div className='space-y-3 sm:space-y-5'>
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
                className='text-[2.15rem] font-semibold leading-[1.02] tracking-[-0.02em] text-white sm:text-[4.2rem]'
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
                className='max-w-xl text-[0.95rem] leading-[1.6] text-white/80 sm:text-base'
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
