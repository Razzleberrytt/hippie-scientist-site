import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import Magnetic from './Magnetic';
import { toHash } from '../lib/routing';

type HeroProps = { children?: ReactNode };

export default function Hero({ children }: HeroProps) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="mx-auto max-w-screen-md w-full px-4 py-8">
      <div
        className="relative overflow-hidden rounded-3xl bg-white/6 dark:bg-white/6 backdrop-blur-xl ring-1 ring-white/15 shadow-[inset_0_1px_0_rgba(255,255,255,.25),0_20px_40px_-20px_rgba(0,0,0,.6)] [mask-image:radial-gradient(120%_120%_at_50%_0%,black_40%,transparent_100%)]"
      >
        <div aria-hidden className="pointer-events-none absolute inset-0 rounded-3xl">
          <div
            className="absolute inset-px rounded-[calc(theme(borderRadius.3xl)-1px)] bg-gradient-to-br from-white/12 via-white/6 to-white/2"
          />
        </div>

        <div className="relative p-6 sm:p-8">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl"
          >
            The Hippie Scientist
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 10 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.06 }}
            className="mt-4 text-base text-white/80 sm:text-lg"
          >
            Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
          </motion.p>

          <div className="mt-5 flex flex-wrap gap-3">
            <Magnetic strength={12}>
              <a
                href={toHash('/database')}
                className="inline-flex items-center gap-2 rounded-2xl bg-emerald-500/85 px-4 py-2.5 text-sm font-semibold text-black shadow-lg shadow-emerald-900/30 transition hover:bg-emerald-400/90"
              >
                🌿 Browse Herbs
              </a>
            </Magnetic>
            <Magnetic strength={12}>
              <a
                href={toHash('/build')}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/20 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10"
              >
                🧪 Build a Blend
              </a>
            </Magnetic>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
