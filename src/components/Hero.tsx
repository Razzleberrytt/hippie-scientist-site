import type { ReactNode } from 'react';
import { motion, useReducedMotion } from 'framer-motion';
import BackgroundAurora from './BackgroundAurora';
import { toHash } from '../lib/routing';

type HeroProps = { children?: ReactNode };

export default function Hero({ children }: HeroProps) {
  const reduceMotion = useReducedMotion();
  return (
    <section
      className="relative rounded-[28px] backdrop-blur-md p-6 sm:p-8 md:p-10"
      style={{
        background: "rgba(20,24,28,0.55)",
        border: "1px solid rgba(255,255,255,0.08)",
        boxShadow:
          "0 10px 30px rgba(0,0,0,0.35), inset 0 1px 0 rgba(255,255,255,0.06)",
        overflow: "hidden",
        maxWidth: "min(100%, 1080px)",
        margin: "0 auto",
        contain: "paint",
      }}
    >
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
          <a href={toHash('/database')} className="btn-primary">🌿 Browse Herbs</a>
          <a href={toHash('/build')} className="btn-ghost">🧪 Build a Blend</a>
        </div>

        {children}
      </div>
    </section>
  );
}
