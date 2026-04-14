import { motion, useReducedMotion } from '@/lib/motion'
import HeroCTA from './HeroCTA'

export default function Hero() {
  const reduceMotion = useReducedMotion()

  return (
    <section className='relative mx-auto mt-2 max-w-6xl px-4 pb-6 pt-10 sm:mt-4 sm:px-6 sm:pb-10 sm:pt-16'>
      <div className='premium-panel overflow-hidden px-5 py-7 sm:px-10 sm:py-12'>
        <div className='pointer-events-none absolute -left-16 -top-24 h-56 w-56 rounded-full bg-violet-400/20 blur-3xl' />
        <div className='pointer-events-none absolute -bottom-24 right-0 h-56 w-56 rounded-full bg-cyan-300/20 blur-3xl' />
        <motion.div
          initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
          animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
          transition={reduceMotion ? undefined : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
          className='relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end'
        >
          <div className='space-y-5'>
            <p className='section-label'>The Hippie Scientist · Research Archive</p>
            <h1 className='font-display text-[2.4rem] leading-[0.9] tracking-[-0.025em] text-white sm:text-[4.5rem]'>
              Precision-first field guide for <span className='text-cyan-300'>psychoactive botanicals</span>
            </h1>
            <p className='max-w-2xl text-sm leading-relaxed text-white/78 sm:text-lg'>
              Evidence-weighted herb and compound profiles with safety framing, mechanism context,
              and practical decision tools for careful exploration.
            </p>
            <HeroCTA />
          </div>
          <div className='browse-shell relative p-4 sm:p-5 lg:max-w-[280px]'>
            <p className='section-label'>Live Archive</p>
            <div className='mt-3 space-y-2 text-sm text-white/85'>
              <p>Herbs, compounds, interactions, and blend scenarios.</p>
              <p className='text-white/62'>Built for responsible decisions, not hype cycles.</p>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  )
}
