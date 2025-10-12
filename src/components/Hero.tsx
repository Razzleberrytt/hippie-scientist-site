import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BackgroundAurora from './BackgroundAurora';
import { toHash } from '../lib/routing';

type HeroProps = { children?: ReactNode };

export default function Hero({ children }: HeroProps) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="relative mx-auto mt-8 max-w-3xl overflow-hidden rounded-3xl bg-gradient-to-b from-white/5 via-white/10 to-transparent p-6 backdrop-blur-xl ring-1 ring-white/10 shadow-[0_0_50px_rgba(0,0,0,0.2)] sm:p-10">
      <BackgroundAurora />
      <div className="relative z-10">
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className={`text-4xl font-bold text-white drop-shadow-lg sm:text-5xl lg:text-6xl ${reduceMotion ? "" : "animate-hue"}`}
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

        <div className="mt-6 flex flex-wrap items-center gap-3">
          <a href={toHash('/database')} className="btn-primary">🌿 Browse Herbs</a>
          <a href={toHash('/build')} className="btn-ghost">🧪 Build a Blend</a>
        </div>

        {children}
      </div>
    </section>
  );
}
