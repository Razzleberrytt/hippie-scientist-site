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
    <section className='relative mx-auto mt-4 max-w-3xl px-4 py-7 sm:mt-6 sm:px-6 sm:py-10'>
      <div
        aria-hidden
        className='pointer-events-none absolute inset-0 -z-10 grid place-items-center'
      >
        <div className='animate-breathe size-[52rem] rounded-full bg-gradient-to-br from-emerald-500/15 via-fuchsia-500/10 to-indigo-500/15 blur-3xl' />
      </div>

      <Tilt maxTilt={6} perspective={900} className='relative'>
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 18, scale: 0.985 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0, scale: 1 }}
          transition={reduceMotion ? undefined : { duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className='shadow-halo border-white/12 bg-white/6 relative overflow-hidden rounded-[24px] border backdrop-blur-xl sm:rounded-[28px]'
        >
          <div
            className='pointer-events-none absolute -top-24 left-0 right-0 h-48 bg-gradient-to-b from-white/10 to-transparent'
            aria-hidden
          />

          <div className='relative space-y-5 p-5 sm:space-y-6 sm:p-8'>
            <motion.h1
              initial={reduceMotion ? undefined : { opacity: 0, y: 12 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={
                reduceMotion ? undefined : { delay: 0.05, duration: 0.4, ease: [0.22, 1, 0.36, 1] }
              }
              className='text-[2rem] font-semibold leading-[1.03] tracking-tight text-white sm:text-6xl'
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
              className='text-white/78 max-w-2xl text-[0.95rem] leading-relaxed sm:text-base'
            >
              Psychedelic botany, mindful blends, and evidence-forward guidance for curious
              explorers.
            </motion.p>

            <div>
              <HeroCTA />
            </div>

            <nav
              aria-label='Site stats'
              className='grid grid-cols-1 gap-2 sm:flex sm:flex-wrap sm:gap-2.5'
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
