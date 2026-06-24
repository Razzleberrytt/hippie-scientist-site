import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/navigation-config'

export const metadata: Metadata = {
  title: 'Supplement Guides — Practical Choosing Guides',
  description:
    'Practical supplement guides organized by anxiety, sleep, stress, and focus. Compare options, understand safety tradeoffs, and choose what to read next.',
  alternates: { canonical: '/guides/' },
  openGraph: {
    title: 'Supplement Guides — The Hippie Scientist',
    description:
      'The main guide library for choosing supplements by goal, comparing options, and checking safety tradeoffs before buying.',
    url: '/guides',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Supplement Guides — The Hippie Scientist',
    description:
      'Practical choosing guides for sleep, anxiety, stress, and focus supplements.',
  },
}

const GOAL_GUIDES = [
  {
    label: 'Anxiety',
    slug: 'anxiety',
    goalHref: '/goals/anxiety',
    description: 'Start here when the question is calm, worry, overthinking, or anxiety-support tradeoffs.',
    guides: [
      { href: '/guides/best-herbs-for-anxiety', title: 'Best Herbs for Anxiety', meta: 'Herbal shortlist · 8 min' },
      { href: '/guides/natural-anxiolytics-beyond-ashwagandha', title: 'Natural Anxiolytics Beyond Ashwagandha', meta: 'Alternatives · 7 min' },
      { href: '/guides/best-supplements-for-overthinking', title: 'Best Supplements for Overthinking', meta: 'Calm thinking · 6 min' },
    ],
  },
  {
    label: 'Sleep',
    slug: 'sleep',
    goalHref: '/goals/sleep',
    description: 'Use these when the problem is sleep onset, sleep quality, or choosing between common sleep aids.',
    guides: [
      { href: '/guides/best-supplements-for-sleep', title: 'Best Supplements for Sleep', meta: 'Main guide · 10 min' },
      { href: '/guides/best-natural-sleep-aids-that-work', title: 'Best Natural Sleep Aids That Work', meta: 'Shortlist · 8 min' },
      { href: '/guides/magnesium-vs-melatonin', title: 'Magnesium vs Melatonin', meta: 'Comparison · 6 min' },
    ],
  },
  {
    label: 'Stress',
    slug: 'stress',
    goalHref: '/goals/stress',
    description: 'For stress load, adaptogens, cortisol-adjacent claims, and calmer recovery decisions.',
    guides: [
      { href: '/guides/best-supplements-for-stress', title: 'Best Supplements for Stress', meta: 'Main guide · 9 min' },
      { href: '/guides/best-adaptogens-for-stress', title: 'Best Adaptogens for Stress', meta: 'Adaptogens · 8 min' },
      { href: '/guides/how-to-lower-cortisol-naturally', title: 'How to Lower Cortisol Naturally', meta: 'Context · 8 min' },
    ],
  },
  {
    label: 'Focus',
    slug: 'focus',
    goalHref: '/goals/focus',
    description: 'Use these for attention, ADHD-adjacent support, nootropics, and avoiding stimulant-heavy choices.',
    guides: [
      { href: '/guides/best-supplements-for-focus', title: 'Best Supplements for Focus', meta: 'Main guide · 8 min' },
      { href: '/guides/best-nootropics-for-focus', title: 'Best Nootropics for Focus', meta: 'Nootropics · 9 min' },
      { href: '/guides/focus-without-caffeine-crash', title: 'Focus Without the Caffeine Crash', meta: 'Stimulant-light · 7 min' },
    ],
  },
]

const COMPARISONS = [
  { href: '/guides/magnesium-vs-melatonin', title: 'Magnesium vs Melatonin', subtitle: 'Relaxation support vs sleep-timing support' },
  { href: '/guides/sleep-herbs-vs-melatonin', title: 'Sleep Herbs vs Melatonin', subtitle: 'Herbals vs hormone for sleep onset' },
  { href: '/compare/rhodiola-vs-ashwagandha', title: 'Rhodiola vs Ashwagandha', subtitle: 'Performance adaptogen vs recovery adaptogen' },
  { href: '/compare', title: 'Browse All Comparisons', subtitle: 'Full side-by-side comparison index' },
]

const SAFETY_GUIDES = [
  {
    href: '/guides/psychedelic-adjacent-herbs',
    title: 'Psychedelic-Adjacent Herbs',
    subtitle: 'Safety context for altered-state-adjacent herbs without romanticizing risky use.',
    meta: 'Safety · 10 min',
  },
  {
    href: '/guides/kratom-7oh-withdrawal-management',
    title: 'Kratom 7-OH Withdrawal Management',
    subtitle: 'Evidence-informed withdrawal education, symptom timelines, and conservative taper context.',
    meta: 'Harm reduction · 12 min',
  },
]

const LIBRARY_MAP = [
  { label: 'Goals', href: '/goals', description: 'Problem decision pages.' },
  { label: 'Guides', href: '/guides', description: 'Practical choosing guides.' },
  { label: 'Articles', href: '/articles', description: 'Research notes and education.' },
  { label: 'Herbs & compounds', href: '/herbs', description: 'Reference database.' },
  { label: 'Compare', href: '/compare', description: 'Direct side-by-side pages.' },
]

function GuidesCollectionJsonLd() {
  const allGuideLinks = [
    ...GOAL_GUIDES.flatMap((goal) => goal.guides),
    ...COMPARISONS,
    ...SAFETY_GUIDES,
  ]
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/guides/#webpage`,
        name: 'Supplement Guides',
        headline: 'Practical supplement choosing guides',
        description:
          'The main guide library for choosing supplements by goal, comparing options, and checking safety tradeoffs before buying.',
        url: `${SITE_URL}/guides/`,
        isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
        mainEntity: { '@id': `${SITE_URL}/guides/#item-list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/guides/#item-list`,
        name: 'The Hippie Scientist practical supplement guides',
        itemListElement: allGuideLinks.map((guide, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}${guide.href}`,
          name: guide.title,
        })),
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}

function LibraryCard({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`card-premium p-5 sm:p-6 ${className}`}>
      {children}
    </div>
  )
}

export default function GuidesPage() {
  return (
    <div className="library-index-page mx-auto max-w-6xl space-y-8 px-4 py-6 sm:space-y-10 sm:px-6 sm:py-12 lg:px-8">
      <GuidesCollectionJsonLd />

      <section className="hero-shell rounded-[1.25rem] border border-brand-900/10 p-5 shadow-card sm:rounded-[2rem] sm:p-10 dark:border-white/10">
        <p className="eyebrow-label">Main guide library</p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Practical supplement guides for choosing what fits.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Use this page when you already know the problem and want a practical next read. Guides help you compare options,
          check safety tradeoffs, and avoid turning every supplement question into a rabbit hole.
        </p>
        <div className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-5">
          {LIBRARY_MAP.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="library-nav-card rounded-2xl border border-brand-900/10 bg-white/70 p-3 transition hover:border-brand-700/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <span className="block text-sm font-bold text-ink">{item.label}</span>
              <span className="mt-1 block text-xs leading-5 text-muted">{item.description}</span>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="library-section-header">
          <p className="eyebrow-label">Start by goal</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Choose the problem first.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
            Goals are the decision pages. Guides are the deeper practical reads once you know the direction.
          </p>
        </div>

        <div className="grid gap-4 lg:grid-cols-2">
          {GOAL_GUIDES.map((goal) => (
            <LibraryCard key={goal.slug}>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div>
                  <p className="eyebrow-label">{goal.label}</p>
                  <h3 className="mt-2 text-xl font-semibold text-ink">Guides for {goal.label}</h3>
                  <p className="mt-2 text-sm leading-7 text-muted">{goal.description}</p>
                </div>
                <Link
                  href={goal.goalHref}
                  className="inline-flex shrink-0 items-center justify-center rounded-full border border-brand-900/15 px-3 py-2 text-xs font-bold text-brand-800 hover:bg-brand-50 dark:border-white/15 dark:text-brand-100 dark:hover:bg-white/10"
                >
                  Goal page →
                </Link>
              </div>

              <div className="mt-5 space-y-2">
                {goal.guides.map((guide) => (
                  <Link
                    key={guide.href}
                    href={guide.href}
                    className="library-content-card flex items-start justify-between gap-3 rounded-2xl border border-brand-900/10 bg-white/70 p-3 transition hover:border-brand-700/20 hover:bg-white dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold leading-6 text-ink">{guide.title}</span>
                      <span className="mt-0.5 block text-xs text-muted">{guide.meta}</span>
                    </span>
                    <span className="mt-0.5 text-sm font-bold text-brand-700 dark:text-brand-200">→</span>
                  </Link>
                ))}
              </div>
            </LibraryCard>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="library-section-header">
          <p className="eyebrow-label">Compare</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Head-to-head choosing guides.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
            Use comparisons when you are deciding between two options and want mechanism, evidence, timing, and tradeoffs side by side.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMPARISONS.map((comparison) => (
            <Link
              key={comparison.href}
              href={comparison.href}
              className="library-content-card card-premium block p-5"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200">Compare</p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-ink">{comparison.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{comparison.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="space-y-4">
        <div className="library-section-header">
          <p className="eyebrow-label">Safety first</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Safety and harm-reduction guides.</h2>
          <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
            These pages are educational and conservative. They should not be mixed into buying-oriented recommendation flows.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {SAFETY_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="library-content-card rounded-2xl border border-rose-700/15 bg-rose-50/70 p-5 shadow-sm transition hover:border-rose-700/25 hover:bg-rose-50 dark:border-rose-200/20 dark:bg-rose-950/25 dark:hover:bg-rose-950/35"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-rose-800 dark:text-rose-200">{guide.meta}</p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-rose-950 dark:text-rose-50">{guide.title}</h3>
              <p className="mt-2 text-sm leading-6 text-rose-900 dark:text-rose-100/85">{guide.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/70 p-5 text-sm leading-7 text-muted dark:border-white/10 dark:bg-white/5">
        Looking for deeper research notes, mechanisms, individual herb writeups, or education-heavy posts? Use the{' '}
        <Link href="/articles" className="font-bold text-brand-800 underline underline-offset-4 dark:text-brand-100">
          articles archive
        </Link>
        . This page stays focused on practical choosing guides.
      </section>
    </div>
  )
}
