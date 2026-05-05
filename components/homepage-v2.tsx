'use client'

import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { springConfig } from '@/utils/springConfig'

const goals = [
  { title: 'Sleep better', href: '/best/sleep', description: 'Improve sleep latency and quality with evidence-based options.' },
  { title: 'Improve focus', href: '/best/focus', description: 'Enhance attention and cognitive clarity without overstimulation.' },
  { title: 'Reduce stress', href: '/best/stress', description: 'Calm the nervous system with well-studied compounds.' },
]

export default function HomepageV2() {
  const reduceMotion = useReducedMotion()

  return (
    <main className="mx-auto w-full max-w-6xl space-y-10">

      <section className="space-y-6">
        <motion.div
          initial={reduceMotion ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={springConfig.gentle}
        >
          <h1 className="text-4xl font-bold tracking-tight text-neutral-950 sm:text-5xl">
            Find evidence-based supplement stacks for your goals
          </h1>
          <p className="mt-3 max-w-2xl text-base text-neutral-600">
            Explore supplements through a calm, evidence-first lens. Start with your goal, then evaluate safety, mechanisms, and real-world usefulness.
          </p>
        </motion.div>

        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {goals.map(goal => (
            <Link key={goal.href} href={goal.href}>
              <div className="rounded-3xl border border-neutral-200 bg-white p-5 shadow-card hover:shadow-lg transition">
                <h3 className="text-lg font-bold text-neutral-950">{goal.title}</h3>
                <p className="mt-2 text-sm text-neutral-600">{goal.description}</p>
                <span className="mt-4 inline-block text-sm font-semibold text-teal-700">Explore →</span>
              </div>
            </Link>
          ))}
        </div>

        <div className="flex flex-wrap gap-4 text-sm text-neutral-500">
          <span>✔ Evidence-based</span>
          <span>✔ Safety-aware</span>
          <span>✔ No hype</span>
        </div>
      </section>

    </main>
  )
}
