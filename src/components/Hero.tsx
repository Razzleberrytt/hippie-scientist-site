import type { ReactNode } from 'react';
import { toHash } from '../lib/routing';

type HeroProps = { children?: ReactNode };

export default function Hero({ children }: HeroProps) {
  return (
    <section className="relative w-full py-10 sm:py-12 lg:py-14">
      <div className="mx-auto max-w-screen-xl px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl">
          <h1 className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl">
            The Hippie Scientist
          </h1>
          <p className="mt-3 text-base text-white/70 sm:text-lg">
            Psychedelic botany, mindful blends, and evidence-forward guidance for curious explorers.
          </p>
        </div>

        <div className="mt-5 flex flex-wrap items-center gap-3">
          <a href={toHash('/database')} className="btn-primary">🌿 Browse Herbs</a>
          <a href={toHash('/build')} className="btn-ghost">🧪 Build a Blend</a>
        </div>

        {children}
      </div>
    </section>
  );
}
