import type { ReactNode } from 'react';
import { toHash } from '../lib/routing';

type HeroProps = { children?: ReactNode };

export default function Hero({ children }: HeroProps) {
  return (
    <section className="relative z-10 mx-auto max-w-4xl px-4 pt-10 pb-8 text-text sm:px-6 sm:pt-16 sm:pb-12">
      <div className="space-y-4 sm:space-y-6">
        <div className="space-y-3 sm:space-y-4">
          <h1 className="text-3xl font-bold tracking-tight sm:text-5xl">The Hippie Scientist</h1>
          <p className="max-w-2xl text-base text-mute sm:text-lg">
            Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
          </p>
        </div>
        <div className="rounded-2xl bg-card/70 p-4 shadow-ring ring-1 ring-white/10 sm:p-5">
          <p className="text-sm leading-relaxed text-text/90 sm:text-base">
            Dive into a growing library of plant profiles, cultural context, and DIY formulation research to support safe, curious experimentation.
          </p>
        </div>
        <div className="flex flex-wrap gap-3">
          <a
            href={toHash('/database')}
            className="inline-flex items-center justify-center rounded-full bg-brand-500/80 px-5 py-2 text-sm font-semibold text-black shadow-soft ring-1 ring-brand-500/30 transition hover:bg-brand-500"
          >
            🌿 Browse Herbs
          </a>
          <a
            href={toHash('/build')}
            className="inline-flex items-center justify-center rounded-full border border-white/10 bg-white/5 px-5 py-2 text-sm font-medium text-text/90 transition hover:border-white/20 hover:bg-white/10"
          >
            🧪 Build a Blend
          </a>
        </div>
      </div>
      {children}
    </section>
  );
}
