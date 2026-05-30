import type { Metadata } from 'next'
import Link from 'next/link'
import { canonicalGuidePages } from '../seo-entry-pages'

export const metadata: Metadata = {
  title: 'Supplement Guides',
  description:
    'Evidence-aware supplement guides for sleep, stress, focus, anxiety, gut health, joint support, and product-quality decisions.',
  alternates: { canonical: '/guides' },
}

const priorityRoutes = new Set([
  'guides/best-supplements-for-sleep',
  'guides/best-supplements-for-stress',
  'guides/best-herbs-for-anxiety',
  'guides/best-nootropics-for-focus',
  'guides/best-supplements-for-gut-health',
  'guides/best-supplements-for-joint-support',
  'guides/best-supplements-for-blood-pressure-support',
  'guides/natural-testosterone-boosters',
  'guides/focus-without-caffeine-crash',
  'guides/supplements-for-brain-fog-and-fatigue',
])

const featuredGuides = canonicalGuidePages
  .filter((page) => priorityRoutes.has(page.route))
  .sort((a, b) => a.h1.localeCompare(b.h1))

const curatedStaticGuides = [
  {
    href: '/guides/magnesium-vs-melatonin',
    title: 'Magnesium vs Melatonin',
    intro: 'Compare relaxation support against sleep-timing support before choosing a nighttime option.',
  },
  {
    href: '/guides/focus-without-caffeine-crash',
    title: 'Focus Without the Caffeine Crash',
    intro: 'A practical guide for cleaner attention support without piling on more stimulants.',
  },
  {
    href: '/guides/supplements-for-brain-fog-and-fatigue',
    title: 'Supplements for Brain Fog and Fatigue',
    intro: 'A skeptical decision guide for fatigue, mental clarity, and recovery-related support.',
  },
  {
    href: '/guides/best-natural-sleep-aids-that-work',
    title: 'Best Natural Sleep Aids That Work',
    intro: 'A sleep-support guide that keeps evidence strength, timing, and safety tradeoffs visible.',
  },
]

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Supplement guide library</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
          Practical supplement guides, consolidated.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Start with a guide when you know the problem you are trying to solve, then move into
          goal pages, comparisons, safety context, and ingredient profiles before buying.
        </p>
      </section>

      <section className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {featuredGuides.map((guide) => (
          <Link
            key={guide.route}
            href={`/${guide.route}`}
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Guide
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">
              {guide.h1}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
              {guide.intro}
            </p>
          </Link>
        ))}
        {curatedStaticGuides.map((guide) => (
          <Link
            key={guide.href}
            href={guide.href}
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Curated guide
            </p>
            <h2 className="mt-2 text-lg font-semibold tracking-tight text-ink">
              {guide.title}
            </h2>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
              {guide.intro}
            </p>
          </Link>
        ))}
      </section>
    </div>
  )
}
