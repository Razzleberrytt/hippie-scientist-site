import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '../../../src/lib/schema-graph'

export const metadata: Metadata = {
  title: 'Focus & Cognition Supplement Guides',
  description:
    'Match the right focus support to why your attention slips — energy crashes, caffeine jitters, or slow-building memory. Evidence-based, decision-first nootropic guides.',
  alternates: { canonical: `${SITE_URL}/guides/focus/` },
  openGraph: {
    title: 'Focus & Cognition Guides',
    description: 'Match the right nootropic to the reason your focus slips.',
    url: `${SITE_URL}/guides/focus/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

// Decision-first routing: match the reason your focus slips to the right first guide.
const START_HERE: IntentRoute[] = [
  {
    problem: 'You want to know what actually works',
    why: 'An evidence-graded overview before you spend on anything.',
    cta: 'Best Nootropics for Focus',
    href: '/guides/focus/best-nootropics-for-focus/',
  },
  {
    problem: 'Caffeine gives you jitters or a crash',
    why: 'L-theanine smooths caffeine into calm, steady focus.',
    cta: 'L-Theanine vs Caffeine for Focus',
    href: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
  },
  {
    problem: 'You want steady focus without the crash',
    why: 'Timing, calmer nootropics, and habits that avoid the afternoon dip.',
    cta: 'Focus Without the Caffeine Crash',
    href: '/guides/focus/focus-without-caffeine-crash/',
  },
  {
    problem: 'You want calm focus without a stimulant',
    why: 'L-theanine on its own for quiet, unforced attention.',
    cta: 'L-Theanine Without Caffeine',
    href: '/guides/focus/l-theanine-without-caffeine/',
  },
  {
    problem: 'Comparing the main options',
    why: 'Fast stimulant vs calm amino acid vs slow-building memory herb.',
    cta: 'Caffeine vs L-Theanine vs Bacopa',
    href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
  },
  {
    problem: 'Focus problems tied to ADHD',
    why: 'Attention, stimulant timing, and stacking need a different plan.',
    cta: 'ADHD Stack Guide',
    href: '/guides/adhd/adhd-stack-guide/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/focus/best-nootropics-for-focus/',
    title: 'Best Nootropics for Focus',
    desc: 'The evidence-graded overview — start here if you are not sure what you need.',
  },
  {
    href: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
    title: 'L-Theanine + Caffeine',
    desc: 'The most reliable everyday focus pairing — and when to use each alone.',
  },
  {
    href: '/guides/focus/focus-without-caffeine-crash/',
    title: 'Focus Without the Crash',
    desc: 'Steady all-day attention without the caffeine rollercoaster.',
  },
  {
    href: '/guides/focus/best-supplements-for-focus/',
    title: 'Best Supplements for Focus',
    desc: 'Quick reference with dosing and stacking notes.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
    title: 'L-Theanine vs Caffeine',
    desc: 'How they work together, and when to reach for each alone.',
  },
  {
    href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
    title: 'Caffeine vs L-Theanine vs Bacopa',
    desc: 'Fast alertness vs calm focus vs slow-building memory — pick by timeframe.',
  },
]

// Focus-related ADHD routes — a different problem that overlaps with attention.
const ADHD_FOCUS = [
  { href: '/guides/adhd/adhd-stack-guide/', title: 'ADHD Stack Guide' },
  { href: '/guides/adhd/l-theanine-for-adhd/', title: 'L-Theanine for ADHD' },
  { href: '/guides/adhd/best-supplements-for-adhd/', title: 'Best Supplements for ADHD' },
]

// Full library — kept, but secondary to the decision sections above.
const ALL_GUIDES = [
  { slug: 'best-nootropics-for-focus', title: 'Best Nootropics for Focus' },
  { slug: 'best-supplements-for-focus', title: 'Best Supplements for Focus' },
  { slug: 'focus-without-caffeine-crash', title: 'Focus Without the Caffeine Crash' },
  { slug: 'l-theanine-vs-caffeine-for-focus', title: 'L-Theanine vs Caffeine for Focus' },
  { slug: 'l-theanine-without-caffeine', title: 'L-Theanine Without Caffeine' },
]

export default function FocusGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/focus/',
    title: 'Focus & Cognition Supplement Guides',
    description:
      'Match the right focus support to why your attention slips — energy crashes, caffeine jitters, or slow-building memory.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Focus & Cognition', url: `${SITE_URL}/guides/focus/` },
    ],
    itemListName: 'Focus & Cognition Supplement Guides',
    items: ALL_GUIDES.map((g) => ({ name: g.title, url: `/guides/focus/${g.slug}/` })),
  })

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <SchemaGraphScript graph={schemaGraph} />
      <nav className="mb-4 text-xs text-muted">
        <Link href="/guides/" className="hover:text-ink">
          Guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Focus &amp; Cognition</span>
      </nav>

      {/* Hero */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Focus &amp; Cognition Guides</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          The right focus supplement depends on why your attention slips — an energy dip, caffeine
          jitters, or memory that builds slowly. Tell us what is getting in the way and we will point
          you to the right guide first.
        </p>
      </header>

      {/* Start Here — decision routing */}
      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What is getting in the way of focus?"
          sub="Pick the description that fits best — each routes you to the most relevant guide."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      {/* Best first pages */}
      <section className="mb-12">
        <HubSectionHeading eyebrow="Best first reads" title="If you only read a few" />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      {/* Comparison guides */}
      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Comparisons"
          title="Deciding between options?"
          sub="These make a clear call instead of saying “both may help.”"
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      {/* ADHD & focus */}
      <section className="mb-12">
        <HubSectionHeading eyebrow="ADHD & focus" title="Focus problems tied to ADHD" />
        <div className="flex flex-wrap gap-3">
          {ADHD_FOCUS.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="rounded-full border border-brand-900/12 bg-white px-4 py-2 text-sm font-semibold text-brand-800 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:text-[var(--text-primary)]"
            >
              {g.title} →
            </Link>
          ))}
        </div>
      </section>

      {/* Editorial note */}
      <section className="mb-12 rounded-xl border-l-4 border-brand-700/40 bg-brand-50/60 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <span className="font-bold">A note on matching the tool to the problem.</span> Focus
          supplements work on different timescales. Caffeine and L-theanine act within an hour; bacopa
          builds memory over weeks; creatine and L-tyrosine mostly help when you are stressed or
          sleep-deprived. None of them replaces sleep, movement, and a workload you can actually
          sustain — and stimulants can amplify anxiety at higher doses.
        </p>
      </section>

      {/* All guides — secondary */}
      <section>
        <HubSectionHeading eyebrow="Full library" title="All focus guides" />
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {ALL_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/focus/${g.slug}/`}
                className="text-sm font-medium text-brand-800 hover:underline dark:text-[var(--text-primary)]"
              >
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
