import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, buildTwitterMetadata } from '@/src/lib/seo'

import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '@/src/lib/schema-graph'

const PATH = '/guides/stress/'
const TITLE = 'Stress Supplement Decision Hub'
const DESCRIPTION = 'Route stress-support research by pattern: acute tension, chronic overload, poor sleep, fatigue, cortisol concerns, or supplement-stacking risk.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: TITLE,
    description:
      'Choose a stress-support strategy based on what your stress actually feels like, not a generic ranked list.',
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: TITLE,
    description: 'Choose a stress-support strategy based on what your stress actually feels like, not a generic ranked list.',
  }),
}

const START_HERE: IntentRoute[] = [
  {
    problem: 'I feel wired, tense, or overstimulated right now',
    why: 'Start with timing, evidence limits, and safety for an amino acid studied in stress contexts.',
    href: '/guides/anxiety/l-theanine-for-anxiety/',
    cta: 'L-Theanine for Anxiety',
  },
  {
    problem: 'My stress has been elevated for weeks or months',
    why: 'Compare longer-term options without treating every adaptogen as interchangeable.',
    href: '/guides/anxiety/best-adaptogens-for-stress/',
    cta: 'Best Adaptogens for Stress',
  },
  {
    problem: 'Stress is keeping me awake',
    why: 'Focus on nighttime fit, interaction risk, and possible next-day sedation.',
    href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/',
    cta: 'Herbs for Nighttime Stress',
  },
  {
    problem: 'I feel depleted, foggy, or burned out',
    why: 'Separate calming support from more activating options and consider whether persistent fatigue needs evaluation.',
    href: '/guides/anxiety/best-supplements-for-stress/',
    cta: 'Best Supplements for Stress',
  },
  {
    problem: 'I am mainly worried about high cortisol',
    why: 'Use a broader decision guide that puts sleep, habits, testing limits, and supplement evidence in context.',
    href: '/guides/anxiety/how-to-lower-cortisol-naturally/',
    cta: 'How to Lower Cortisol',
  },
  {
    problem: 'I want to combine multiple options',
    why: 'Check overlapping effects, medication interactions, and whether a stack is necessary before combining products.',
    href: '/safety-checker/',
    cta: 'Supplement Safety Checker',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/anxiety/best-supplements-for-stress/',
    title: 'Best Supplements for Stress',
    desc: 'A decision-oriented overview of common options, evidence strength, safety, and who should be cautious.',
  },
  {
    href: '/guides/anxiety/best-adaptogens-for-stress/',
    title: 'Best Adaptogens for Stress',
    desc: 'Compare slower, longer-term options by evidence and fit instead of assuming one adaptogen works for everyone.',
  },
  {
    href: '/guides/anxiety/natural-anxiety-relief/',
    title: 'Natural Anxiety Relief',
    desc: 'Start here when stress and anxiety overlap or the pattern is not yet clear.',
  },
  {
    href: '/guides/anxiety/how-to-lower-cortisol-naturally/',
    title: 'How to Lower Cortisol Naturally',
    desc: 'Put cortisol concerns in context before treating a symptom, wearable reading, or single test as a diagnosis.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/compare/rhodiola-vs-ashwagandha/',
    title: 'Rhodiola vs Ashwagandha',
    desc: 'Compare a generally more activating profile with a generally more calming one, including evidence and safety tradeoffs.',
  },
  {
    href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
    title: 'Ashwagandha vs L-Theanine vs Magnesium',
    desc: 'Longer-term stress support, shorter-term calming context, and mineral support compared symmetrically.',
  },
  {
    href: '/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/',
    title: 'CBD vs Ashwagandha',
    desc: 'Different evidence bases, timelines, product-quality concerns, and interaction profiles.',
  },
]

const DEPTH_LINKS = [
  { href: '/herbs/ashwagandha/', title: 'Ashwagandha', kind: 'Herb profile' },
  { href: '/herbs/rhodiola/', title: 'Rhodiola Rosea', kind: 'Herb profile' },
  { href: '/compounds/l-theanine/', title: 'L-Theanine', kind: 'Compound profile' },
  { href: '/compounds/magnesium-glycinate/', title: 'Magnesium Glycinate', kind: 'Compound profile' },
  { href: '/herbs/schisandra/', title: 'Schisandra', kind: 'Herb profile' },
  { href: '/herbs/holy-basil/', title: 'Holy Basil (Tulsi)', kind: 'Herb profile' },
]

const ALL_GUIDES = [
  { href: '/guides/anxiety/best-supplements-for-stress/', title: 'Best Supplements for Stress' },
  { href: '/guides/anxiety/best-adaptogens-for-stress/', title: 'Best Adaptogens for Stress' },
  { href: '/guides/anxiety/how-to-lower-cortisol-naturally/', title: 'How to Lower Cortisol Naturally' },
  { href: '/guides/anxiety/l-theanine-for-anxiety/', title: 'L-Theanine for Anxiety' },
  { href: '/guides/anxiety/ashwagandha-for-anxiety/', title: 'Ashwagandha for Anxiety' },
  { href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/', title: 'Herbs for Stress at Night' },
  { href: '/guides/anxiety/anxiety-stack-guide/', title: 'Anxiety & Stress Stack Guide' },
  { href: '/guides/anxiety/natural-anxiety-relief/', title: 'Natural Anxiety Relief' },
]

export default function StressGuidePage() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: PATH,
    title: TITLE,
    description: DESCRIPTION,
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Stress', url: `${SITE_URL}${PATH}` },
    ],
    itemListName: 'Stress supplement decision paths',
    items: [...BEST_FIRST, ...COMPARISONS].map(item => ({
      name: item.title,
      url: `${SITE_URL}${item.href}`,
    })),
  })

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <SchemaGraphScript graph={schemaGraph} />
      <nav className="mb-5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">
          Guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Stress</span>
      </nav>

      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Decision guide</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Choose stress support by the kind of stress you have
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Acute pressure, chronic overload, poor sleep, and burnout are not the same problem. Start with the pattern that fits best, then compare evidence and safety before choosing anything.
        </p>
        <p className="mt-3 text-sm leading-7 text-muted">
          This is a routing hub, not a product ranking or diagnosis. Each path leads to the page where evidence strength, dosing context, interactions, and limitations can be evaluated in full.
        </p>
      </header>

      <section className="mt-10">
        <HubSectionHeading
          eyebrow="Start here"
          title="What does your stress feel like?"
          sub="Choose the closest pattern. Each path leads to the page that explains the evidence, limitations, and safety context in full."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      <section className="mt-14">
        <HubSectionHeading
          eyebrow="Best first reads"
          title="Build context before choosing"
          sub="These guides help separate the type of problem from the supplement category being marketed for it."
        />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      <section className="mt-14">
        <HubSectionHeading
          eyebrow="Compare & choose"
          title="Weigh common options side by side"
          sub="Use a comparison when you already have a shortlist and need a clearer tradeoff."
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      <section className="mt-14 rounded-2xl border border-brand-900/10 bg-brand-50/60 p-6 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
        <HubSectionHeading eyebrow="Decision check" title="Three questions before you choose" />
        <ol className="grid gap-5 text-sm leading-7 text-muted sm:grid-cols-3">
          <li>
            <strong className="block text-ink">1. Is the pattern acute or persistent?</strong>
            A short-lived stressful event and weeks of poor sleep or fatigue call for different next steps.
          </li>
          <li>
            <strong className="block text-ink">2. What kind of evidence applies?</strong>
            Human stress outcomes, mechanistic plausibility, and traditional use should not be treated as equal support.
          </li>
          <li>
            <strong className="block text-ink">3. What could make it a poor fit?</strong>
            Review medications, sedation, pregnancy, underlying conditions, and duplicated ingredients before adding a product.
          </li>
        </ol>
        <div className="mt-5 flex flex-wrap gap-4 text-sm font-semibold">
          <Link href="/learn/evidence-literacy/" className="text-brand-800 hover:underline">
            Learn how evidence grades work →
          </Link>
          <Link href="/info/supplement-safety-checklist/" className="text-brand-800 hover:underline">
            Review the safety checklist →
          </Link>
        </div>
      </section>

      <section className="mt-14">
        <HubSectionHeading
          eyebrow="Research deeper"
          title="Stress-relevant ingredient profiles"
          sub="Use the monographs to inspect evidence summaries, mechanisms, cautions, and related compounds after selecting a guide."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEPTH_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-brand-900/12 bg-white p-4 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:hover:bg-white/10"
            >
              <span className="block text-[11px] font-bold uppercase tracking-widest text-muted">{item.kind}</span>
              <span className="mt-1 block text-sm font-semibold text-brand-800 dark:text-[var(--text-primary)]">
                {item.title} →
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="mt-14">
        <HubSectionHeading eyebrow="Full library" title="All stress decision guides" />
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {ALL_GUIDES.map((item) => (
            <li key={item.href}>
              <Link href={item.href} className="text-sm font-medium text-brand-800 hover:underline dark:text-[var(--text-primary)]">
                {item.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <aside className="mt-14 rounded-2xl border-l-4 border-brand-700/50 bg-brand-50/70 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <strong>Safety note:</strong> Persistent stress, severe anxiety, chest pain, major sleep disruption, or worsening mood deserves professional evaluation. Supplements can interact with prescriptions and are not a substitute for treatment. Read the full{' '}
          <Link href="/info/disclaimer/" className="font-semibold text-brand-800 underline">
            medical disclaimer
          </Link>
          .
        </p>
      </aside>
    </div>
  )
}
