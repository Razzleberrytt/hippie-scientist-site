'use client'

import Link from 'next/link'
import { motion, useScroll, useTransform } from 'framer-motion'
import { GlassCard } from '@/components/ui/GlassCard'
import { listContainer, listItem, springConfig } from '@/utils/springConfig'

const goals = [
  { title: 'Sleep better', href: '/best/sleep', tag: 'Night routine', copy: 'Relaxation, onset, and sleep quality options ranked by timing and safety.' },
  { title: 'Improve focus', href: '/best/focus', tag: 'Nootropic stack', copy: 'Cleaner attention, alertness, and calm-focus decisions without hype.' },
  { title: 'Lose fat', href: '/best/fat-loss', tag: 'Metabolic support', copy: 'Appetite, energy, and metabolic support with realistic expectations.' },
  { title: 'Reduce stress', href: '/best/stress', tag: 'Calm support', copy: 'Adaptogens and calming compounds sorted by usefulness and caution context.' },
  { title: 'Recover faster', href: '/best/recovery', tag: 'Training support', copy: 'Recovery, soreness, and consistency helpers for better routines.' },
  { title: 'Calm focus', href: '/best/calm-focus', tag: 'Balanced cognition', copy: 'Focus support without pushing stimulation too hard.' },
]

export default function HomepageV2({ featuredComparisons }: { featuredComparisons: string[] }) {
  const { scrollYProgress } = useScroll()
  const y = useTransform(scrollYProgress, [0, 0.3, 1], [16, 0, -8])
  const opacity = useTransform(scrollYProgress, [0, 0.12, 1], [0.9, 1, 1])

  return (
    <main className="mx-auto w-full max-w-7xl space-y-8 pb-[calc(6rem+env(safe-area-inset-bottom))] text-white">
      <section className="relative overflow-hidden rounded-[2.25rem] border border-brand/20 bg-glass-heavy p-5 shadow-glass backdrop-blur-md sm:p-8 lg:p-12">
        <div className="absolute -right-24 -top-24 h-80 w-80 rounded-full bg-brand/20 blur-3xl" />
        <div className="absolute -bottom-32 left-1/4 h-80 w-80 rounded-full bg-info/10 blur-3xl" />
        <div className="relative z-10 grid gap-8 lg:grid-cols-[1.08fr_0.92fr] lg:items-end">
          <motion.div initial={{ opacity: 0, y: 18 }} animate={{ opacity: 1, y: 0 }} transition={springConfig.gentle}>
            <p className="text-xs font-black uppercase tracking-[0.3em] text-brand/70">Evidence-first decision engine</p>
            <h1 className="mt-4 max-w-4xl text-5xl font-black leading-[0.9] tracking-[-0.08em] text-white sm:text-7xl lg:text-8xl">
              Find the right supplement stack for your goal
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-7 text-white/68 sm:text-lg">
              Start with the outcome, scan the stack, then open compound profiles for evidence, timing, dosage, and safety context.
            </p>
            <div className="mt-7 grid gap-3 sm:grid-cols-3">
              <Link href="/best/sleep" className="premium-button text-center">Sleep stack →</Link>
              <Link href="/best/focus" className="rounded-xl border border-brand/25 bg-white/[0.06] px-5 py-3 text-center text-sm font-bold text-white transition hover:bg-white/[0.1]">Focus stack →</Link>
              <Link href="/search" className="premium-button-warm text-center">Search library →</Link>
            </div>
          </motion.div>

          <GlassCard variant="frosted" className="p-5" enableShine={false}>
            <p className="text-xs font-black uppercase tracking-[0.22em] text-white/45">How decisions flow</p>
            <div className="mt-4 space-y-3">
              {['Choose a goal-based stack.', 'Scan Anchor / Amplifier / Support roles.', 'Open evidence and safety profiles before choosing.'].map((item, index) => (
                <div key={item} className="flex gap-3 rounded-2xl border border-white/10 bg-black/20 p-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-brand text-sm font-black text-black">{index + 1}</span>
                  <p className="text-sm font-semibold leading-6 text-white/72">{item}</p>
                </div>
              ))}
            </div>
          </GlassCard>
        </div>
      </section>

      <section id="goals" className="space-y-4">
        <div className="flex flex-wrap items-end justify-between gap-3">
          <div>
            <p className="text-xs font-black uppercase tracking-[0.24em] text-brand/60">Start with a goal</p>
            <h2 className="mt-2 text-4xl font-black tracking-[-0.06em] text-white">Goal-based stacks</h2>
          </div>
          <Link href="/search" className="text-sm font-black text-brand">Search everything →</Link>
        </div>
        <motion.div variants={listContainer} initial="hidden" animate="show" className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
          {goals.map((goal, index) => (
            <motion.div key={goal.href} variants={listItem} transition={{ ...springConfig.gentle, delay: index * 0.02 }}>
              <Link href={goal.href} className="group block">
                <GlassCard variant={index === 0 ? 'glow' : 'standard'} className="min-h-[210px] p-5 sm:p-6">
                  <p className="text-[11px] font-black uppercase tracking-[0.22em] text-brand/70">{goal.tag}</p>
                  <h3 className="mt-3 text-3xl font-black tracking-[-0.05em] text-white transition group-hover:text-brand">{goal.title}</h3>
                  <p className="mt-3 text-sm leading-6 text-white/64">{goal.copy}</p>
                  <div className="mt-5 border-t border-white/10 pt-4 text-sm font-black text-brand">Open stack →</div>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section className="grid gap-4 lg:grid-cols-[0.78fr_1.22fr] lg:items-start">
        <GlassCard variant="heavy" className="p-6" enableShine={false}>
          <p className="text-xs font-black uppercase tracking-[0.24em] text-info/70">Decision support</p>
          <h2 className="mt-3 text-4xl font-black tracking-[-0.06em] text-white">Compare before you buy anything</h2>
          <p className="mt-3 text-sm leading-6 text-white/64">Use comparisons when two options look similar but differ in timing, safety, stimulation, or evidence strength.</p>
        </GlassCard>
        <motion.div variants={listContainer} initial="hidden" animate="show" className="grid gap-3 sm:grid-cols-2">
          {featuredComparisons.map((slug, index) => (
            <motion.div key={slug} variants={listItem} transition={{ ...springConfig.gentle, delay: index * 0.02 }}>
              <Link href={`/compare/${slug}`} className="group block">
                <GlassCard variant="frosted" className="p-5">
                  <h3 className="text-xl font-black capitalize tracking-[-0.04em] text-white group-hover:text-brand">{slug.replace(/-/g, ' ').replace(' vs ', ' vs ')}</h3>
                  <p className="mt-2 text-sm leading-6 text-white/60">Fast practical difference check before opening full profiles.</p>
                </GlassCard>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <motion.div style={{ y, opacity }} className="fixed bottom-[calc(1rem+env(safe-area-inset-bottom))] left-1/2 z-40 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 lg:right-6 lg:left-auto lg:w-80 lg:translate-x-0">
        <Link href="/best/sleep" className="group block rounded-3xl border border-brand/35 bg-brand/15 p-2 shadow-glow backdrop-blur-xl">
          <div className="rounded-2xl bg-brand px-5 py-4 text-center text-sm font-black text-black transition group-hover:scale-[1.01]">Start with a goal →</div>
        </Link>
      </motion.div>
    </main>
  )
}
