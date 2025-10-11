import type { ReactNode } from 'react'
import { toHash } from '../lib/routing'

type HeroProps = { children?: ReactNode }

export default function Hero({ children }: HeroProps) {
  return (
    <section className="relative overflow-hidden">
      <div className="mx-auto max-w-6xl px-4 pt-10 pb-12 md:pt-14 md:pb-16">
        <h1 className="text-4xl md:text-6xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-br from-sky-300 to-emerald-300">
          The Hippie Scientist
        </h1>
        <p className="mt-3 text-base md:text-lg text-white/70 max-w-2xl">
          Psychedelic Botany &amp; Conscious Exploration.
        </p>

        <div className="mt-6 rounded-2xl border border-white/10 bg-white/5 p-4 md:p-5 shadow-sm">
          <p className="text-white/80">
            Dive into a growing library of herbs, research, and DIY blend guides.
          </p>
        </div>

        <div className="mt-6 flex flex-wrap gap-3">
          <a href={toHash('/database')} className="rounded-xl px-4 py-2 bg-emerald-600/80 hover:bg-emerald-500 text-white font-medium shadow">
            🌿 Browse Herbs
          </a>
          <a href={toHash('/build')} className="rounded-xl px-4 py-2 bg-white/10 hover:bg-white/15 text-white font-medium border border-white/15">
            🧪 Build a Blend
          </a>
        </div>

        {children}
      </div>
    </section>
  )
}
