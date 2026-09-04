import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL, buildTwitterMetadata } from '@/lib/seo'

import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '../../../lib/schema-graph'

export const metadata: Metadata = {
  title: 'Sleep Supplements: Evidence, Timing & Safety',
  description:
    'Compare sleep supplements by the problem you are trying to solve, human evidence, timing, safety, and next-day effects. Covers melatonin, magnesium, herbs, and non-supplement options.',
  alternates: { canonical: `${SITE_URL}/guides/sleep/` },
  openGraph: {
    title: 'Sleep Supplements: Evidence, Timing & Safety',
    description: 'Compare sleep aids by evidence, timing, safety, and next-day effects.',
    url: `${SITE_URL}/guides/sleep/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Sleep Supplements: Evidence, Timing & Safety',
    description: 'Compare sleep aids by evidence, timing, safety, and next-day effects.',
  }),
}

const START_HERE: IntentRoute[] = [
  {
    problem: 'Racing thoughts at bedtime',
    why: 'Review the limited sleep evidence for a calming amino acid that is not a conventional sedative.',
    cta: 'L-Theanine for Sleep',
    href: '/guides/sleep/l-theanine-for-sleep/',
  },
  {
    problem: 'Physical tension or a restless body',
    why: 'Check whether magnesium fits your situation, especially if low intake or deficiency may be relevant.',
    cta: 'Magnesium for Sleep',
    href: '/guides/sleep/magnesium-for-sleep/',
  },
  {
    problem: 'Waking up tired after short or light sleep',
    why: 'Glycine is a sleep-quality experiment, not a knockout sedative.',
    cta: 'Glycine for Sleep',
    href: '/guides/sleep/glycine-for-sleep/',
  },
  {
    problem: 'Not sure which magnesium to buy',
    why: 'Glycinate, citrate, threonate and oxide are not interchangeable for sleep.',
    cta: 'Magnesium Types for Sleep',
    href: '/guides/sleep/magnesium-types-for-sleep/',
  },
  {
    problem: 'Choosing glycinate vs L-threonate',
    why: 'A buyer-intent comparison keeps premium forms from sounding automatically better.',
    cta: 'Glycinate vs L-Threonate',
    href: '/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/',
  },
  {
    problem: 'Stress-related insomnia',
    why: 'Explore an adaptogen studied for stress and sleep over weeks, not as a same-night sedative.',
    cta: 'Ashwagandha for Sleep',
    href: '/guides/sleep/ashwagandha-for-sleep/',
  },
  {
    problem: 'Trending sleep supplements sound convincing',
    why: 'Apigenin needs a reality check before it becomes another overstacked sleep trend.',
    cta: 'Apigenin for Sleep',
    href: '/guides/sleep/apigenin-for-sleep/',
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
    desc: 'What the evidence shows, who may be more likely to benefit, and when magnesium is a poor fit.',
  },
  {
    href: '/guides/sleep/glycine-for-sleep/',
    title: 'Glycine for Sleep',
    desc: 'For sleep-quality and next-day tiredness questions — not a knockout sedative.',
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
    href: '/guides/sleep/magnesium-glycinate-vs-l-threonate-for-sleep/',
    title: 'Magnesium Glycinate vs L-Threonate',
    desc: 'Simple, lower-cost first trial vs premium cognition-branded magnesium.',
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

const RESEARCH_ARTICLES: GuideCard[] = [
  {
    href: '/articles/saffron-for-sleep/',
    title: 'Saffron for Sleep',
    desc: 'Meta-analyses, randomized trials, and the newer 2025 moderate-insomnia study — with effect-size limits intact.',
  },
  {
    href: '/articles/tart-cherry-for-sleep/',
    title: 'Tart Cherry for Sleep',
    desc: 'The 2025 systematic review, small positive insomnia pilots, and recent null trials compared side by side.',
  },
  {
    href: '/articles/chamomile-for-sleep/',
    title: 'Chamomile for Sleep',
    desc: 'What the 2024 meta-analysis actually found, including outcomes that did not improve.',
  },
  {
    href: '/articles/lavender-for-sleep/',
    title: 'Lavender for Sleep',
    desc: 'The 2026 meta-analysis of 11 randomized trials, with aromatherapy, measurement and formulation limits preserved.',
  },
  {
    href: '/articles/passionflower-for-sleep/',
    title: 'Passionflower for Sleep',
    desc: 'Direct insomnia PSG evidence, the older tea trial and the newer standardized-extract RCT separated by endpoint and formulation.',
  },
  {
    href: '/articles/l-tryptophan-for-sleep/',
    title: 'L-Tryptophan for Sleep',
    desc: 'Why the modern synthesis points more toward wake-after-sleep-onset than a blanket sleep-latency claim.',
  },
  {
    href: '/articles/5-htp-for-sleep/',
    title: '5-HTP for Sleep',
    desc: 'A small 2024 older-adult RCT, very limited insomnia evidence, and the serotonergic safety context.',
  },
  {
    href: '/articles/sleep-supplement-formulations/',
    title: 'Why Formulations Are Not Interchangeable',
    desc: 'Why one magnesium salt, branded extract, juice, tea, or proprietary blend cannot validate an entire ingredient class.',
  },
]

const SLEEP_SCIENCE: GuideCard[] = [
  {
    href: '/articles/sleep-onset-vs-sleep-maintenance/',
    title: 'Sleep Onset vs Sleep Maintenance',
    desc: 'SOL, WASO, total sleep time and sleep efficiency — learn which endpoint a study actually changed.',
  },
  {
    href: '/articles/subjective-vs-objective-sleep/',
    title: 'Subjective vs Objective Sleep',
    desc: 'Why insomnia can feel severe even when polysomnography or wearable changes look smaller.',
  },
  {
    href: '/articles/why-sleep-studies-disagree/',
    title: 'Why Sleep Studies Disagree',
    desc: 'Nine reasons apparently conflicting trials can be answering different questions rather than cancelling each other out.',
  },
  {
    href: '/articles/sleep-trackers-accuracy/',
    title: 'How Accurate Are Sleep Trackers?',
    desc: 'The 2025–2026 evidence on wearables, actigraphy, sleep stages and systematic measurement bias.',
  },
  {
    href: '/articles/sleep-regularity-health/',
    title: 'Sleep Regularity',
    desc: 'Why day-to-day timing stability is emerging as a sleep-health dimension separate from duration.',
  },
  {
    href: '/articles/weekend-catch-up-sleep/',
    title: 'Weekend Catch-Up Sleep',
    desc: 'Partial recovery versus social jet lag: why sleeping in can help without fully erasing chronic sleep debt.',
  },
  {
    href: '/articles/caffeine-and-sleep-timing/',
    title: 'Caffeine and Sleep Timing',
    desc: 'Dose × timing evidence, including newer controlled trials and meta-analyses of sleep disruption.',
  },
  {
    href: '/articles/alcohol-and-sleep/',
    title: 'Alcohol and Sleep',
    desc: 'Why faster sedation does not equal better sleep, including the 2025 dose-response REM meta-analysis.',
  },
  {
    href: '/articles/cannabis-cannabinoids-and-sleep/',
    title: 'Cannabis and Sleep',
    desc: 'Randomized insomnia signals, weak CBD-only results, objective sleep-architecture limits and recreational-use contradictions.',
  },
  {
    href: '/articles/nicotine-vaping-and-sleep/',
    title: 'Nicotine, Vaping and Sleep',
    desc: 'Vaping associations, smoking-cessation withdrawal and why temporary quit-related insomnia does not mean nicotine improves sleep.',
  },
  {
    href: '/articles/morning-light-and-sleep-timing/',
    title: 'Morning Light and Sleep Timing',
    desc: 'Circadian phase shifting, recent insomnia meta-analyses, and why the clock time of light exposure changes its effect.',
  },
  {
    href: '/articles/melatonin-timing-vs-dose/',
    title: 'Melatonin Timing vs Dose',
    desc: 'The 2024 dose-response meta-analysis and 2026 review-of-reviews explain why clock time, indication and formulation matter alongside milligrams.',
  },
  {
    href: '/articles/blue-light-screens-and-sleep/',
    title: 'Blue Light, Screens and Sleep',
    desc: 'Mechanism is real, intervention evidence is mixed, and bedtime screens affect sleep through more than wavelength alone.',
  },
  {
    href: '/articles/sleep-temperature-and-cooling/',
    title: 'Sleep Temperature and Cooling',
    desc: 'Heat reliably matters, but randomized cooling-bedding evidence does not support assuming every cooling product improves sleep.',
  },
  {
    href: '/articles/time-restricted-eating-and-sleep/',
    title: 'Time-Restricted Eating and Sleep',
    desc: 'Recent meta-analyses disagree in informative ways: controlled trials do not establish a dependable sleep benefit from fasting windows.',
  },
  {
    href: '/articles/exercise-timing-and-sleep/',
    title: 'Exercise Timing and Sleep',
    desc: 'The 2026 morning-vs-evening review: flexible timing, with intensity and proximity to bed as the bigger variables.',
  },
  {
    href: '/articles/naps-and-nighttime-sleep/',
    title: 'Naps and Nighttime Sleep',
    desc: 'Sleep pressure, nap timing, cognitive benefits and the very different logic of shift-work napping.',
  },
  {
    href: '/articles/insomnia-vs-sleep-deprivation/',
    title: 'Insomnia vs Sleep Deprivation',
    desc: 'Same tired feeling, different bottleneck: adequate sleep opportunity is the key distinction.',
  },
]

const WHEN_SUPPLEMENTS_ARE_NOT_THE_MAIN_QUESTION: GuideCard[] = [
  {
    href: '/articles/cbt-i-vs-sleep-supplements/',
    title: 'CBT-I vs Sleep Supplements',
    desc: 'For chronic insomnia, CBT-I is the evidence benchmark; supplements answer narrower questions.',
  },
  {
    href: '/articles/sleep-apnea-vs-insomnia/',
    title: 'Sleep Apnea vs Insomnia',
    desc: 'COMISA can combine insomnia with obstructive sleep apnea, and sedation does not treat airway obstruction.',
  },
  {
    href: '/articles/restless-legs-iron-and-sleep/',
    title: 'Restless Legs, Iron and Sleep',
    desc: 'Why RLS can masquerade as insomnia and why AASM guidance centers ferritin and transferrin saturation rather than blind iron use.',
  },
]

const ALL_GUIDES = [
  { slug: 'best-supplements-for-sleep', title: 'Best Supplements for Sleep' },
  { slug: 'best-natural-sleep-aids-that-work', title: 'Best Natural Sleep Aids That Work' },
  { slug: 'magnesium-for-sleep', title: 'Magnesium for Sleep' },
  { slug: 'best-magnesium-for-sleep', title: 'Best Magnesium for Sleep' },
  { slug: 'magnesium-types-for-sleep', title: 'Magnesium Types for Sleep' },
  { slug: 'magnesium-glycinate-vs-l-threonate-for-sleep', title: 'Magnesium Glycinate vs L-Threonate for Sleep' },
  { slug: 'glycine-for-sleep', title: 'Glycine for Sleep' },
  { slug: 'apigenin-for-sleep', title: 'Apigenin for Sleep' },
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

const DEPTH_LINKS = [
  { href: '/compounds/l-theanine-sleep/', title: 'L-Theanine for Sleep', kind: 'Compound profile' },
  { href: '/compounds/glycine-sleep/', title: 'Glycine for Sleep', kind: 'Compound profile' },
  { href: '/compounds/magnesium-glycinate/', title: 'Magnesium Glycinate', kind: 'Compound profile' },
  { href: '/compounds/tryptophan/', title: 'Tryptophan', kind: 'Compound profile' },
  { href: '/compounds/5-htp/', title: '5-HTP', kind: 'Compound profile' },
  { href: '/herbs/ashwagandha/', title: 'Ashwagandha', kind: 'Herb profile' },
  { href: '/herbs/valerian/', title: 'Valerian', kind: 'Herb profile' },
  { href: '/herbs/passiflora-incarnata/', title: 'Passionflower', kind: 'Herb profile' },
]

export default function SleepGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/sleep/',
    title: 'Sleep Supplement Guides & Natural Sleep Aids',
    description:
      'Choose the right natural sleep support based on what is actually keeping you awake — racing thoughts, physical tension, stress, or timing.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Sleep', url: `${SITE_URL}/guides/sleep/` },
    ],
    itemListName: 'Sleep Supplement Guides and Research',
    items: [
      ...ALL_GUIDES.map((g) => ({ name: g.title, url: `/guides/sleep/${g.slug}/` })),
      ...RESEARCH_ARTICLES.map((g) => ({ name: g.title, url: g.href })),
      ...SLEEP_SCIENCE.map((g) => ({ name: g.title, url: g.href })),
      ...WHEN_SUPPLEMENTS_ARE_NOT_THE_MAIN_QUESTION.map((g) => ({ name: g.title, url: g.href })),
    ],
  })

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <SchemaGraphScript graph={schemaGraph} />
      <nav className="mb-4 text-xs text-muted">
        <Link href="/guides/" className="hover:text-ink">
          Guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Sleep</span>
      </nav>

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Sleep Supplement Guides</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Supplements work best when they match the actual reason you cannot sleep. Tell us what is
          keeping you awake and we will point you to the right guide first.
        </p>
      </header>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What is keeping you awake?"
          sub="Pick the description that fits best — each routes you to the most relevant guide."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      <section className="mb-12">
        <HubSectionHeading eyebrow="Best first reads" title="If you only read a few" />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Comparisons"
          title="Deciding between two options?"
          sub="These make a clear call instead of saying “both may help.”"
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Ingredient research"
          title="Evidence reviews beyond the usual shortlist"
          sub="Systematic reviews, randomized trials, null findings and safety limits kept in the same frame."
        />
        <GuideCardGrid cards={RESEARCH_ARTICLES} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Sleep science"
          title="Understand the measurements and upstream variables"
          sub="Onset, maintenance, study design, wearables, regularity, catch-up sleep, caffeine, alcohol, cannabis, nicotine, light, temperature, meal timing, exercise, naps and the difference between insomnia and simply not getting enough sleep."
        />
        <GuideCardGrid cards={SLEEP_SCIENCE} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Check the bottleneck"
          title="When another supplement may be the wrong next move"
          sub="Persistent insomnia, abnormal breathing and restless legs each have evidence pathways that a larger sleep stack can miss."
        />
        <GuideCardGrid cards={WHEN_SUPPLEMENTS_ARE_NOT_THE_MAIN_QUESTION} />
      </section>

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

      <section className="mb-12 rounded-xl border-l-4 border-brand-700/40 bg-brand-50/60 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <span className="font-bold">A note on matching the tool to the problem.</span> Supplements are
          most useful to evaluate in the context of the actual sleep issue. L-theanine, magnesium,
          ashwagandha, and melatonin have different evidence, safety considerations, and plausible
          roles — they are not interchangeable. None replaces consistent sleep habits or care for a
          diagnosed sleep disorder. Review the{' '}
          <Link href="/info/supplement-safety-checklist/" className="font-semibold text-brand-800 underline">
            supplement safety checklist
          </Link>{' '}
          before starting a new product, and use the{' '}
          <Link href="/learn/evidence-literacy/" className="font-semibold text-brand-800 underline">
            evidence literacy guide
          </Link>{' '}
          to interpret study claims.
        </p>
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Research deeper"
          title="Sleep ingredient profiles"
          sub="Use these monographs after choosing a guide to check safety notes, evidence context, and related compounds."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEPTH_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="rounded-xl border border-brand-900/12 bg-white p-4 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:hover:bg-white/10"
            >
              <span className="block text-[11px] font-bold uppercase tracking-widest text-muted">{link.kind}</span>
              <span className="mt-1 block text-sm font-semibold text-brand-800 dark:text-[var(--text-primary)]">
                {link.title} →
              </span>
            </Link>
          ))}
        </div>
      </section>

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