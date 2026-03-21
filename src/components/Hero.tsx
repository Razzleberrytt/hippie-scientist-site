import { motion, useReducedMotion } from 'framer-motion'
import Tilt from './Tilt'
import StatPill from './StatPill'
import HeroCTA from './HeroCTA'

type HeroCounts = {
  herbs: number
  compounds: number
  articles: number
}

type HeroProps = {
  counts?: HeroCounts
}

export default function Hero({ counts }: HeroProps) {
  const reduceMotion = useReducedMotion()
  const { herbs = 0, compounds = 0, articles = 0 } = counts ?? {}

  return (
    <section className='relative mx-auto mt-6 max-w-3xl px-4 py-8 sm:mt-8 sm:px-6 sm:py-12'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 grid place-items-center'
      >
        <div className='animate-breathe from-emerald-500/14 via-fuchsia-500/8 to-indigo-500/14 size-[56rem] rounded-full bg-gradient-to-br blur-[120px]' />
      </div>

      <Tilt maxTilt={6} perspective={900} className='relative'>
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.985 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className='shadow-halo relative overflow-hidden rounded-[24px] border border-white/10 bg-white/[0.045] backdrop-blur-2xl sm:rounded-[28px]'
        >
          <div
            className='pointer-events-none absolute inset-0 bg-gradient-to-br from-white/[0.08] via-transparent to-violet-300/[0.07]'
            aria-hidden
          />
          <div
            className='pointer-events-none absolute -top-24 left-0 right-0 h-48 bg-gradient-to-b from-white/[0.08] to-transparent'
            aria-hidden
          />

          <div className='relative space-y-8 p-6 sm:space-y-10 sm:p-10'>
            <motion.h1
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                reduceMotion ? undefined : { delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
              className='text-[2.15rem] font-semibold leading-[1.04] tracking-tight text-white sm:text-6xl'
            >
              The Hippie <br className='hidden sm:block' /> Scientist
            </motion.h1>
            <motion.p
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                reduceMotion ? undefined : { delay: 0.12, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
              className='max-w-2xl text-[1rem] leading-[1.75] text-white/80 sm:text-lg'
            >
              Evidence-forward herbal guidance for mindful explorers—from psychedelic botany to
              practical blend craft.
            </motion.p>

            <div>
              <HeroCTA />
            </div>

            <nav
              aria-label='Site stats'
              className='grid grid-cols-1 gap-3 sm:grid-cols-3 sm:gap-3.5'
            >
              <StatPill to='/herbs' value={herbs} label='psychoactive herbs' testId='pill-herbs' />
              <StatPill
                to='/compounds'
                value={compounds}
                label='active compounds'
                testId='pill-compounds'
              />
              <StatPill to='/blog' value={articles} label='articles' testId='pill-articles' />
            </nav>
          </div>
        </motion.div>
      </Tilt>
    </section>
  )
}
