import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BackgroundAurora from './BackgroundAurora';
import Magnetic from './Magnetic';
import { toHash } from '../lib/routing';

type HeroProps = { children?: ReactNode };

export default function Hero({ children }: HeroProps) {
  const reduceMotion = useReducedMotion();
  return (
    <section className="animated-border">
      <div className="glass relative overflow-hidden rounded-[27px] p-6 sm:p-8 md:p-10">
        <BackgroundAurora />
        <div className="relative z-10">
        <motion.h1
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-4xl sm:text-5xl font-extrabold tracking-tight"
        >
          The Hippie Scientist
        </motion.h1>
        <motion.p
          initial={reduceMotion ? false : { opacity: 0, y: 8 }}
          whileInView={{ opacity: 1, y: 0 }}
          transition={reduceMotion ? { duration: 0 } : { delay: 0.05 }}
          className="mt-4 text-base text-neutral-100/80 sm:text-lg"
        >
          Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
        </motion.p>

          <div className="mt-6 flex flex-wrap items-center gap-3">
            <Magnetic strength={12}>
              <a href={toHash('/database')} className="btn-primary">🌿 Browse Herbs</a>
            </Magnetic>
            <Magnetic strength={12}>
              <a href={toHash('/build')} className="btn-ghost">🧪 Build a Blend</a>
            </Magnetic>
          </div>

          {children}
        </div>
      </div>
    </section>
  );
}
