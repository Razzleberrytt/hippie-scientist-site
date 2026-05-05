'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { springConfig } from '@/utils/springConfig'

const goals = [
  { title: 'Sleep', href: '/best/sleep', description: 'Anchor compounds for sleep onset, amplifiers for depth.' },
  { title: 'Stress', href: '/best/stress', description: 'Calm baseline + adaptogen amplification.' },
  { title: 'Focus', href: '/best/focus', description: 'Cognitive anchors with precision enhancers.' },
]

export default function HomepageV2() {
  const reduceMotion = useReducedMotion()

  return (
    <main className="mx-auto w-full max-w-6xl space-y-14">

      <section className="space-y-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig.gentle}
        >
          <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">
            Find evidence-based supplement stacks for your goals
          </h1>
          <p className="mt-3 max-w-2xl text-base text-muted">
            Built around Anchor, Amplifier, and Support roles — so you know what works, why it works, and how to use it.
          </p>
        </motion.div>

        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => (
            <Link key={goal.href} href={goal.href}>
              <div className="rounded-3xl border border-neutral-200 bg-white p-6 shadow-soft hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-ink">{goal.title}</h3>
                <p className="mt-2 text-sm text-muted">{goal.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-brand">Explore →</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-6 text-sm text-muted">
          <span>100% cited</span>
          <span>No industry bias</span>
          <span>Decision-first structure</span>
        </div>
      </section>

    </main>
  )
}
