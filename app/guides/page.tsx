import type { Metadata } from 'next'
import Link from 'next/link'
import { learnPosts } from '../learn/data'
import { SITE_URL } from '@/lib/navigation-config'

export const metadata: Metadata = {
  title: 'Supplement Guides — Problem-Solving Evidence-Informed Content',
  description:
    'Evidence-aware guides for sleep, stress, anxiety, focus, ADHD, depression, and cognitive performance. Comparisons, dosing context, and safety tradeoffs included.',
  alternates: { canonical: '/guides' },
  openGraph: {
    title: 'Supplement Guides — The Hippie Scientist',
    description:
      'Problem-solving supplement guides for anxiety, sleep, focus, stress, ADHD, and cognitive performance. Long-form, search-intent focused, evidence-graded.',
    url: '/guides',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Supplement Guides — The Hippie Scientist',
    description:
      'Evidence-informed guides for sleep, anxiety, focus, stress, ADHD, and cognitive performance.',
  },
}

const CONDITIONS = [
  {
    label: 'Anxiety',
    slug: 'anxiety',
    guides: [
      { href: '/guides/best-herbs-for-anxiety', title: 'Best Herbs for Anxiety', readingTime: '8 min', evidenceStrength: 'Moderate–Strong' },
      { href: '/guides/natural-anxiolytics-beyond-ashwagandha', title: 'Natural Anxiolytics Beyond Ashwagandha', readingTime: '7 min', evidenceStrength: 'Moderate' },
      { href: '/guides/natural-alternatives-to-anxiety-medication', title: 'Natural Alternatives to Anxiety Medication', readingTime: '9 min', evidenceStrength: 'Moderate' },
      { href: '/guides/best-supplements-for-overthinking', title: 'Best Supplements for Overthinking', readingTime: '6 min', evidenceStrength: 'Emerging' },
    ],
  },
  {
    label: 'Sleep',
    slug: 'sleep',
    guides: [
      { href: '/guides/best-supplements-for-sleep', title: 'Best Supplements for Sleep', readingTime: '10 min', evidenceStrength: 'Strong' },
      { href: '/guides/best-natural-sleep-aids-that-work', title: 'Best Natural Sleep Aids That Work', readingTime: '8 min', evidenceStrength: 'Moderate–Strong' },
      { href: '/guides/sleep-herbs-vs-melatonin', title: 'Sleep Herbs vs Melatonin', readingTime: '7 min', evidenceStrength: 'Moderate' },
      { href: '/guides/magnesium-vs-melatonin', title: 'Magnesium vs Melatonin', readingTime: '6 min', evidenceStrength: 'Moderate' },
      { href: '/guides/best-herbs-for-stress-and-anxiety-at-night', title: 'Best Herbs for Stress and Anxiety at Night', readingTime: '7 min', evidenceStrength: 'Moderate' },
    ],
  },
  {
    label: 'Focus & Cognition',
    slug: 'focus',
    guides: [
      { href: '/guides/adhd-supplements', title: 'ADHD Supplements Hub', readingTime: '10 min', evidenceStrength: 'Moderate' },
      { href: '/guides/best-nootropics-for-focus', title: 'Best Nootropics for Focus', readingTime: '9 min', evidenceStrength: 'Moderate' },
      { href: '/guides/best-supplements-for-focus', title: 'Best Supplements for Focus', readingTime: '8 min', evidenceStrength: 'Moderate' },
      { href: '/guides/focus-without-caffeine-crash', title: 'Focus Without the Caffeine Crash', readingTime: '7 min', evidenceStrength: 'Moderate' },
      { href: '/guides/supplements-for-brain-fog-and-fatigue', title: 'Supplements for Brain Fog and Fatigue', readingTime: '8 min', evidenceStrength: 'Emerging–Moderate' },
    ],
  },
  {
    label: 'Stress',
    slug: 'stress',
    guides: [
      { href: '/guides/best-supplements-for-stress', title: 'Best Supplements for Stress', readingTime: '9 min', evidenceStrength: 'Strong' },
      { href: '/guides/best-adaptogens-for-stress', title: 'Best Adaptogens for Stress', readingTime: '8 min', evidenceStrength: 'Moderate–Strong' },
      { href: '/guides/how-to-lower-cortisol-naturally', title: 'How to Lower Cortisol Naturally', readingTime: '8 min', evidenceStrength: 'Moderate' },
    ],
  },
  {
    label: 'Cognitive Performance',
    slug: 'cognition',
    guides: [
      { href: '/guides/best-supplements-for-fat-loss', title: 'Best Supplements for Fat Loss', readingTime: '9 min', evidenceStrength: 'Moderate' },
      { href: '/guides/natural-testosterone-boosters', title: 'Natural Testosterone Boosters', readingTime: '9 min', evidenceStrength: 'Moderate' },
    ],
  },
]

const SINGLE_HERB_GUIDES = [
  { href: '/guides/rhodiola-complete-guide', title: 'Complete Rhodiola Guide', subtitle: 'Forms, benefits, dosing & evidence — pillar of the Rhodiola hub' },
  { href: '/guides/rhodiola-energy', title: 'Rhodiola for Energy', subtitle: 'Sustained energy without the stimulant crash' },
  { href: '/guides/rhodiola-extract-vs-powder', title: 'Rhodiola: Extract vs Powder', subtitle: 'Which form actually works — absorption, cost & evidence' },
  { href: '/guides/rhodiola-sleep-stack', title: 'Rhodiola + Magnesium for Sleep', subtitle: 'The adaptogen stack for the "wired but tired" cycle' },
  { href: '/guides/turmeric-curcumin', title: 'Turmeric & Curcumin', subtitle: 'Bioavailability, anti-inflammatory evidence & forms' },
  { href: '/guides/elderberry', title: 'Elderberry for Colds & Flu', subtitle: 'Meta-analysis evidence, safety, and quality' },
  { href: '/guides/passionflower', title: 'Passionflower', subtitle: 'Evidence for anxiety and sleep, with honest limits' },
  { href: '/guides/kava', title: 'Kava (Harm Reduction)', subtitle: 'Anxiety evidence weighed against serious liver risk' },
]

const COMPARISONS = [
  { href: '/guides/magnesium-vs-melatonin', title: 'Magnesium vs Melatonin', subtitle: 'Relaxation support vs sleep-timing support' },
  { href: '/guides/sleep-herbs-vs-melatonin', title: 'Sleep Herbs vs Melatonin', subtitle: 'Herbals vs hormone for sleep onset' },
  { href: '/compare/rhodiola-vs-ashwagandha', title: 'Rhodiola vs Ashwagandha', subtitle: 'Performance adaptogen vs recovery adaptogen' },
  { href: '/compare', title: 'Browse All Comparisons', subtitle: 'Full side-by-side comparison index' },
]

const STACK_GUIDES = learnPosts.map((post) => ({
  href: `/learn/${post.slug}`,
  title: post.title,
  description: post.description,
  category: post.category,
  readingTime: post.readingTime,
}))

function GuidesCollectionJsonLd() {
  const allGuideLinks = CONDITIONS.flatMap((c) => c.guides)
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/guides/#webpage`,
        name: 'Supplement Guides',
        headline: 'Problem-solving supplement guides',
        description:
          'Evidence-aware guides for sleep, anxiety, focus, stress, ADHD, and cognitive performance. Includes comparisons, dosing context, and safety tradeoffs.',
        url: `${SITE_URL}/guides/`,
        isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
        mainEntity: { '@id': `${SITE_URL}/guides/#item-list` },
      },
      {
        '@type': 'ItemList',
        '@id': `${SITE_URL}/guides/#item-list`,
        name: 'The Hippie Scientist supplement guides',
        itemListElement: allGuideLinks.map((g, i) => ({
          '@type': 'ListItem',
          position: i + 1,
          url: `${SITE_URL}${g.href}`,
          name: g.title,
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

export default function GuidesPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-12 px-4 py-8 sm:px-6 sm:py-12 lg:px-8">
      <GuidesCollectionJsonLd />

      {/* Hero */}
      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
        <p className="eyebrow-label">Supplement guide library</p>
        <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-5xl">
          Practical supplement guides, consolidated.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          Start with a guide when you know the problem you are trying to solve. Every guide covers evidence strength,
          safety tradeoffs, dosing context, and related herbs before pointing toward buying decisions.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/goals"
            className="rounded-full border border-brand-900/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-white"
          >
            Browse goal-based decision pages
          </Link>
          <Link
            href="/compare"
            className="rounded-full border border-brand-900/15 px-4 py-2 text-sm font-medium text-ink transition hover:bg-ink hover:text-white"
          >
            Head-to-head comparisons
          </Link>
        </div>
      </section>

      {/* By condition */}
      {CONDITIONS.map((condition) => (
        <section key={condition.slug} className="space-y-4">
          <div className="flex items-baseline justify-between">
            <div>
              <p className="eyebrow-label">{condition.label}</p>
              <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
                Guides for {condition.label}
              </h2>
            </div>
            <Link
              href={`/goals/${condition.slug}`}
              className="hidden text-sm font-medium text-brand-700 hover:underline sm:block"
            >
              Goal page →
            </Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {condition.guides.map((guide) => (
              <Link
                key={guide.href}
                href={guide.href}
                className="group rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
              >
                <div className="flex items-center justify-between">
                  <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                    Guide
                  </p>
                  <span className="rounded-full bg-brand-50 px-2 py-0.5 text-[10px] font-semibold text-brand-800">
                    {guide.evidenceStrength}
                  </span>
                </div>
                <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink group-hover:text-brand-800">
                  {guide.title}
                </h3>
                <p className="mt-1 text-xs text-muted">{guide.readingTime} read</p>
              </Link>
            ))}
          </div>
        </section>
      ))}

      {/* Single-herb evidence guides */}
      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Single-herb evidence guides</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            Herb &amp; compound deep-dives
          </h2>
          <p className="mt-2 text-sm text-muted">
            Long-form, evidence-graded profiles for individual herbs — mechanism, dosing, safety, and product
            context. Includes the Rhodiola hub (pillar plus three focused angles).
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {SINGLE_HERB_GUIDES.map((g) => (
            <Link
              key={g.href}
              href={g.href}
              className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                Guide
              </p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-ink">{g.title}</h3>
              <p className="mt-1 text-xs text-muted">{g.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Comparisons */}
      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Comparisons</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            Head-to-head guides
          </h2>
          <p className="mt-2 text-sm text-muted">
            Compare two options before choosing. Covers mechanisms, evidence, dosing, and tradeoffs side-by-side.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {COMPARISONS.map((c) => (
            <Link
              key={c.href}
              href={c.href}
              className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                Compare
              </p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-ink">{c.title}</h3>
              <p className="mt-1 text-xs text-muted">{c.subtitle}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Stack & education guides (from learn section) */}
      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Stack guides</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            Practical supplement stack guides
          </h2>
          <p className="mt-2 text-sm text-muted">
            Long-form guides covering specific herb combinations with dosing context, timing, buying criteria, and safety notes.
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {STACK_GUIDES.map((guide) => (
            <Link
              key={guide.href}
              href={guide.href}
              className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
            >
              <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
                {guide.category} · {guide.readingTime}
              </p>
              <h3 className="mt-2 text-base font-semibold tracking-tight text-ink">{guide.title}</h3>
              <p className="mt-2 line-clamp-2 text-sm text-muted">{guide.description}</p>
            </Link>
          ))}
        </div>
      </section>

      {/* Harm reduction */}
      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Safety & harm reduction</p>
          <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
            Safety-first guides
          </h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          <Link
            href="/guides/psychedelic-adjacent-herbs"
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Safety · 10 min
            </p>
            <h3 className="mt-2 text-base font-semibold tracking-tight text-ink">
              Psychedelic-Adjacent Herbs
            </h3>
            <p className="mt-1 text-sm text-muted">
              Education on altered states, perception, and safety context without romanticizing risky use.
            </p>
          </Link>
          <Link
            href="/guides/kratom-7oh-withdrawal-management"
            className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/20 hover:bg-white"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Harm Reduction · 12 min
            </p>
            <h3 className="mt-2 text-base font-semibold tracking-tight text-ink">
              Kratom 7-OH Withdrawal Management
            </h3>
            <p className="mt-1 text-sm text-muted">
              Evidence-informed strategies for 7-OH withdrawal with symptom timeline and tapering approaches.
            </p>
          </Link>
        </div>
      </section>
    </div>
  )
}
