import type { ReactNode } from 'react';
import { toHash } from '../lib/routing';

type HeroProps = { children?: ReactNode };

export default function Hero({ children }: HeroProps) {
  return (
    <section className="relative">
      <div className="mx-auto max-w-6xl px-4">
        <div className="pt-6 sm:pt-8 pb-8 sm:pb-10">
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-white">
            The Hippie Scientist
          </h1>
          <p className="mt-3 max-w-2xl text-base sm:text-lg text-white/70">
            Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
          </p>

          <div className="mt-5 flex flex-wrap items-center gap-3">
            <a href={toHash('/database')} className="btn-primary">🌿 Browse Herbs</a>
            <a href={toHash('/build')} className="btn-ghost">🧪 Build a Blend</a>
          </div>
        </div>
        {children}
      </div>
    </section>
  );
}
