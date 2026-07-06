import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'

export const metadata: Metadata = {
  title: 'Sleep Supplement Guides & Natural Sleep Aids',
  description:
    'Choose the right natural sleep support based on what is actually keeping you awake — racing thoughts, physical tension, stress, or timing. Evidence-based, decision-first guides.',
  alternates: { canonical: `${SITE_URL}/guides/sleep/` },
  openGraph: {
    title: 'Sleep Supplement Guides',
    description: 'Match the right natural sleep aid to the reason you cannot sleep.',
    url: `${SITE_URL}/guides/sleep/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

// Decision-first routing: match the reason you can't sleep to the right first guide.
const START_HERE: IntentRoute[] = [
  {
    problem: 'Racing thoughts at bedtime',
    why: 'A calming amino acid quiets mental chatter without sedation.',
    cta: 'L-Theanine for Sleep',
    href: '/guides/sleep/l-theanine-for-sleep/',
  },
  {
    problem: 'Physical tension or a restless body',
    why: 'Magnesium relaxes muscles and calms an overactive nervous system.',
    cta: 'Magnesium for Sleep',
    href: '/guides/sleep/magnesium-for-sleep/',
  },
  {
    problem: 'Not sure which magnesium to buy',
    why: 'Glycinate, citrate, threonate and oxide are not interchangeable for sleep.',
    cta: 'Magnesium Types for Sleep',
    href: '/guides/sleep/magnesium-types-for-sleep/',
  },
  {
    problem: 'Stress-related insomnia',
    why: 'An adaptogen that lowers cortisol over weeks, not a same-night fix.',
    cta: 'Ashwagandha for Sleep',
    href: '/guides/sleep/ashwagandha-for-sleep/',
  },
  {
    problem: 'Comparing your options',
    why: 'A mineral and a circadian signal solve different problems.',
    cta: 'Magnesium vs Melatonin',
    href: '/guides/sleep/magnesium-vs-melatonin/',
  },
  {
    problem: 'You want a full plan',
    why: 'How to combine supplements safely — timing, dosing, and stacking.',
    cta: 'Sleep Stack Guide',
    href: '/guides/sleep/sleep-stack-guide/',
  },
  {
    problem: 'ADHD-related sleep issues',
    why: 'Delayed sleep and stimulant timing need a different approach.',
    cta: 'Sleep & ADHD',
    href: '/guides/adhd/sleep-and-adhd/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/sleep/best-supplements-for-sleep/',
    title: 'Best Supplements for Sleep',
    desc: 'The evidence-graded overview — start here if you are not sure what you need.',
  },
  {
    href: '/guides/sleep/magnesium-for-sleep/',
    title: 'Magnesium for Sleep',
    desc: 'The best-evidenced, lowest-risk first pick for most people.',
  },
  {
    href: '/guides/sleep/l-theanine-for-sleep/',
    title: 'L-Theanine for Sleep',
    desc: 'For a busy mind at lights-out — calm without grogginess.',
  },
  {
    href: '/guides/sleep/sleep-stack-guide/',
    title: 'Sleep Stack Guide',
    desc: 'How to combine options into one coherent, safe routine.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/sleep/magnesium-vs-melatonin/',
    title: 'Magnesium vs Melatonin',
    desc: 'Nervous-system calm vs circadian timing — which problem is yours?',
  },
  {
    href: '/guides/sleep/sleep-herbs-vs-melatonin/',
    title: 'Sleep Herbs vs Melatonin',
    desc: 'Valerian, passionflower and lemon balm compared to melatonin.',
  },
  {
    href: '/guides/sleep/ashwagandha-vs-magnesium-for-sleep/',
    title: 'Ashwagandha vs Magnesium for Sleep',
    desc: 'Stress-driven insomnia vs physical tension.',
  },
  {
    href: '/guides/sleep/magnesium-types-for-sleep/',
    title: 'Magnesium Types for Sleep',
    desc: 'Glycinate vs citrate vs threonate vs oxide, ranked for sleep.',
  },
]

// Full library — kept, but secondary to the decision sections above.
const ALL_GUIDES = [
  { slug: 'best-supplements-for-sleep', title: 'Best Supplements for Sleep' },
  { slug: 'best-natural-sleep-aids-that-work', title: 'Best Natural Sleep Aids That Work' },
  { slug: 'sleep-best-supplements', title: 'Best Sleep Supplements (Quick Reference)' },
  { slug: 'magnesium-for-sleep', title: 'Magnesium for Sleep' },
  { slug: 'best-magnesium-for-sleep', title: 'Best Magnesium for Sleep' },
  { slug: 'magnesium-types-for-sleep', title: 'Magnesium Types for Sleep' },
  { slug: 'l-theanine-for-sleep', title: 'L-Theanine for Sleep' },
  { slug: 'ashwagandha-for-sleep', title: 'Ashwagandha for Sleep' },
  { slug: 'best-herbs-for-sleep', title: 'Best Herbs for Sleep' },
  { slug: 'rhodiola-sleep-stack', title: 'Rhodiola Sleep Stack' },
  { slug: 'sleep-stack-guide', title: 'Sleep Stack Guide' },
  { slug: 'sleep-stack-magnesium-melatonin', title: 'Magnesium + Melatonin Sleep Stack' },
  { slug: 'magnesium-vs-melatonin', title: 'Magnesium vs Melatonin' },
  { slug: 'sleep-herbs-vs-melatonin', title: 'Sleep Herbs vs Melatonin' },
  { slug: 'ashwagandha-vs-magnesium-for-sleep', title: 'Ashwagandha vs Magnesium for Sleep' },
]

const ADHD_SLEEP = [
  { href: '/guides/adhd/sleep-and-adhd/', title: 'Sleep & ADHD' },
  { href: '/guides/adhd/melatonin-for-adhd-sleep/', title: 'Melatonin for ADHD Sleep' },
]

export default function SleepGuideIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <nav className="mb-4 text-xs text-muted">
        <Link href="/guides/" className="hover:text-ink">
          Guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Sleep</span>
      </nav>

      {/* Hero */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Sleep Supplement Guides</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Supplements work best when they match the actual reason you cannot sleep. Tell us what is
          keeping you awake and we will point you to the right guide first.
        </p>
      </header>

      {/* Start Here — decision routing */}
      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What is keeping you awake?"
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
          title="Deciding between two options?"
          sub="These make a clear call instead of saying “both may help.”"
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      {/* ADHD sleep */}
      <section className="mb-12">
        <HubSectionHeading eyebrow="ADHD & sleep" title="ADHD-related sleep problems" />
        <div className="flex flex-wrap gap-3">
          {ADHD_SLEEP.map((g) => (
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
          <span className="font-bold">A note on matching the tool to the problem.</span> Supplements are
          most useful when matched to the actual sleep issue. A calming amino acid (L-theanine), a
          mineral (magnesium), an adaptogen (ashwagandha), and a circadian signal (melatonin) solve
          different problems — and none of them replaces consistent sleep habits or care for a
          diagnosed sleep disorder.
        </p>
      </section>

      {/* All guides — secondary */}
      <section>
        <HubSectionHeading eyebrow="Full library" title="All sleep guides" />
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {ALL_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/sleep/${g.slug}/`}
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
