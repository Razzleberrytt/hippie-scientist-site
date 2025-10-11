import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BackgroundAurora from './BackgroundAurora';
import Aurora from './effects/Aurora';
import Floaters from './effects/Floaters';
import { toHash } from '../lib/routing';
import { useTrippy } from '../lib/trippy';

type HeroProps = { children?: ReactNode };

export default function Hero({ children }: HeroProps) {
  const reduceMotion = useReducedMotion();
  const { trippy, enabled } = useTrippy();

  return (
    <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-emerald-500/10 via-sky-500/5 to-fuchsia-500/10 py-10 sm:py-14">
      <BackgroundAurora />
      {trippy && enabled && (
        <>
          <Aurora />
          <Floaters />
          <div className="pointer-events-none absolute inset-0 bg-noisy" aria-hidden />
        </>
      )}
      <div className="container-page relative z-10">
        <div className="max-w-3xl">
          <motion.h1
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
          >
            The Hippie Scientist
          </motion.h1>
          <motion.p
            initial={reduceMotion ? false : { opacity: 0, y: 8 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={reduceMotion ? { duration: 0 } : { delay: 0.05 }}
            className="mt-3 text-base text-white/80 sm:text-lg"
          >
            Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
          </motion.p>
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={toHash('/database')} className="btn-primary">🌿 Browse Herbs</a>
          <a href={toHash('/build')} className="btn-ghost">🧪 Build a Blend</a>
        </div>

        {children}
      </div>
    </section>
  );
}
