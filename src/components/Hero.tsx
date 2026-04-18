import { motion, useReducedMotion } from '@/lib/motion'
import HeroCTA from './HeroCTA'

export default function Hero() {
  const reduceMotion = useReducedMotion()

  const staggerVariants = {
    hidden: {},
    show: {
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const childVariants = {
    hidden: { opacity: 0, y: 10 },
    show: {
      opacity: 1,
      y: 0,
      transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] },
    },
  }

  return (
    <div className='relative mx-auto mt-2 max-w-6xl px-4 pb-6 pt-10 sm:mt-4 sm:px-6 sm:pb-10 sm:pt-16'>
      <div className="relative before:pointer-events-none before:absolute before:inset-0 before:rounded-[1.75rem] before:bg-[conic-gradient(from_180deg_at_50%_50%,rgba(14,207,179,0.22)_0deg,rgba(167,139,250,0.2)_130deg,rgba(14,207,179,0.08)_260deg,rgba(14,207,179,0.22)_360deg)] before:opacity-70 before:[mask:linear-gradient(#fff_0_0)_content-box,linear-gradient(#fff_0_0)] before:[mask-composite:xor] before:p-px before:animate-[spin_18s_linear_infinite]">
        <section className='premium-panel relative overflow-hidden rounded-[1.75rem] px-5 py-7 sm:px-10 sm:py-12'>
          <div className='pointer-events-none absolute -left-12 -top-12 h-72 w-72 rounded-full bg-violet-500/15 blur-[80px] animate-[pulse_4s_ease-in-out_infinite]' />
          <div className='pointer-events-none absolute -bottom-16 -right-8 h-64 w-64 rounded-full bg-teal-400/12 blur-[64px]' />

          <motion.div
            initial={reduceMotion ? undefined : { opacity: 0, y: 14 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            transition={reduceMotion ? undefined : { duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            className='relative grid gap-8 lg:grid-cols-[1fr_auto] lg:items-end'
          >
            <motion.div
              className='space-y-5'
              variants={staggerVariants}
              initial={reduceMotion ? undefined : 'hidden'}
              animate={reduceMotion ? undefined : 'show'}
            >
              <motion.p variants={childVariants} className='section-label'>
                The Hippie Scientist · Research Archive
              </motion.p>
              <motion.h1
                variants={childVariants}
                className='tracking-tight text-white'
                style={{
                  fontFamily: 'var(--font-display)',
                  fontSize: 'clamp(2.6rem, 5.5vw, 5rem)',
                  lineHeight: 0.92,
                }}
              >
                Precision-first field guide for{' '}
                <span
                  className='text-[var(--accent-teal)]'
                  style={{ textShadow: '0 0 32px rgba(14,207,179,0.4)' }}
                >
                  psychoactive botanicals
                </span>
              </motion.h1>
              <motion.p variants={childVariants} className='max-w-xl text-base leading-relaxed text-white/70 sm:text-lg'>
                Evidence-weighted herb and compound profiles with safety framing, mechanism context,
                and practical decision tools for careful exploration.
              </motion.p>
              <motion.div variants={childVariants}>
                <HeroCTA />
              </motion.div>
            </motion.div>

            <motion.div
              variants={reduceMotion ? undefined : childVariants}
              initial={reduceMotion ? undefined : 'hidden'}
              animate={reduceMotion ? undefined : 'show'}
              transition={reduceMotion ? undefined : { delay: 0.1 }}
              className='browse-shell relative border-0 border-l-2 border-l-[var(--accent-teal)]/30 bg-transparent p-4 pl-5 shadow-none sm:p-5 sm:pl-6 lg:max-w-[300px]'
            >
              <p className='section-label'>Live Archive</p>
              <div className='mt-3 space-y-2 text-sm text-white/85'>
                <p>Herbs, compounds, interactions, and blend scenarios.</p>
                <p className='text-white/62'>Built for responsible decisions, not hype cycles.</p>
              </div>
            </motion.div>
          </motion.div>
        </section>
      </div>
    </div>
  )
}
