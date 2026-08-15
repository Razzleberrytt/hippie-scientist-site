import type { Metadata } from 'next'
import Link from 'next/link'

import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '@/src/lib/schema-graph'
import { SITE_URL, buildTwitterMetadata } from '@/src/lib/seo'

const PATH = '/guides/cognition/'
const TITLE = 'Cognition Supplements: Memory, Brain Fog & Evidence'
const DESCRIPTION = 'Research cognition supplements by the actual question: memory over time, brain fog and fatigue, choline options, creatine for brain health, or Lion’s Mane versus Bacopa.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: TITLE,
    description: 'Route cognition research by outcome and timescale instead of treating every nootropic as interchangeable.',
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: TITLE,
    description: 'Route cognition research by outcome and timescale instead of treating every nootropic as interchangeable.',
  }),
}

const START_HERE: IntentRoute[] = [
  {
    problem: 'I care about memory or learning over weeks, not instant stimulation',
    why: 'Bacopa is generally discussed in repeated-dose cognition research rather than as an acute stimulant.',
    cta: 'Bacopa vs Citicoline',
    href: '/guides/compare/bacopa-vs-citicoline/',
  },
  {
    problem: 'I am deciding between Lion’s Mane and Bacopa',
    why: 'Separate neurotrophic mechanism narratives from the human cognitive outcomes actually measured.',
    cta: 'Lion’s Mane vs Bacopa',
    href: '/guides/compare/lions-mane-vs-bacopa/',
  },
  {
    problem: 'I am comparing choline-related nootropics',
    why: 'Citicoline and Alpha-GPC have different evidence, dose, and safety records despite sharing a broad category.',
    cta: 'Citicoline vs Alpha-GPC',
    href: '/guides/compare/citicoline-vs-alpha-gpc/',
  },
  {
    problem: 'My main issue is brain fog plus fatigue',
    why: 'Brain fog is a symptom pattern, not a single supplement target; start with the broader causes-and-options guide.',
    cta: 'Brain Fog & Fatigue Guide',
    href: '/guides/other/supplements-for-brain-fog-and-fatigue/',
  },
  {
    problem: 'I want to understand creatine for brain health',
    why: 'Creatine cognition research should be kept separate from its much larger sports-performance evidence base.',
    cta: 'Creatine & Brain Health',
    href: '/guides/other/creatine-brain-health/',
  },
  {
    problem: 'I actually need immediate focus or alertness',
    why: 'Acute attention is a different intent from memory and longer-term cognition research.',
    cta: 'Focus Decision Hub',
    href: '/guides/focus/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/compare/lions-mane-vs-bacopa/',
    title: 'Lion’s Mane vs Bacopa',
    desc: 'A direct cognition comparison that keeps mechanism claims separate from human outcome evidence.',
  },
  {
    href: '/guides/compare/bacopa-vs-citicoline/',
    title: 'Bacopa vs Citicoline',
    desc: 'Compare an herbal memory intervention with a choline-related compound by evidence, dose, form, and safety.',
  },
  {
    href: '/guides/other/supplements-for-brain-fog-and-fatigue/',
    title: 'Supplements for Brain Fog & Fatigue',
    desc: 'Use the symptom pattern first instead of assuming brain fog is a nootropic deficiency.',
  },
  {
    href: '/guides/other/creatine-brain-health/',
    title: 'Creatine for Brain Health',
    desc: 'Cognition-specific creatine evidence without importing certainty from strength and performance research.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/compare/lions-mane-vs-bacopa/',
    title: 'Lion’s Mane vs Bacopa',
    desc: 'Emerging mushroom research versus a longer repeated-dose memory literature.',
  },
  {
    href: '/guides/compare/bacopa-vs-citicoline/',
    title: 'Bacopa vs Citicoline',
    desc: 'Different intervention types compared on human evidence, studied dose, form, and safety.',
  },
  {
    href: '/guides/compare/citicoline-vs-alpha-gpc/',
    title: 'Citicoline vs Alpha-GPC',
    desc: 'Two choline-related options compared without assuming category similarity means equivalent evidence.',
  },
]

const DEPTH_LINKS = [
  { href: '/herbs/bacopa/', title: 'Bacopa', kind: 'Herb profile' },
  { href: '/herbs/lions-mane/', title: 'Lion’s Mane', kind: 'Herb profile' },
  { href: '/compounds/cdp-choline/', title: 'Citicoline / CDP-Choline', kind: 'Compound profile' },
  { href: '/compounds/alpha-gpc/', title: 'Alpha-GPC', kind: 'Compound profile' },
  { href: '/compounds/creatine/', title: 'Creatine', kind: 'Compound profile' },
  { href: '/compounds/caffeine/', title: 'Caffeine', kind: 'Compound profile' },
]

export default function CognitionGuidePage() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: PATH,
    title: TITLE,
    description: DESCRIPTION,
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Cognition', url: `${SITE_URL}${PATH}` },
    ],
    itemListName: 'Cognition research decision paths',
    items: [...BEST_FIRST, ...COMPARISONS].map((item) => ({ name: item.title, url: `${SITE_URL}${item.href}` })),
  })

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <SchemaGraphScript graph={schemaGraph} />

      <nav className="mb-5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Cognition</span>
      </nav>

      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Decision guide</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Choose cognition research by the outcome you actually care about
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Memory over months, immediate attention, brain fog, and mechanistic “brain health” claims are different intents. Start with the question and timescale, then compare human evidence, dose, formulation, and safety.
        </p>
      </header>

      <section className="mt-10">
        <HubSectionHeading
          eyebrow="Start here"
          title="What are you trying to improve or understand?"
          sub="Pick the closest research question. Each path routes to a page built for that intent instead of a generic nootropic list."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      <section className="mt-14">
        <HubSectionHeading eyebrow="Best first reads" title="Build the evidence context first" />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      <section className="mt-14">
        <HubSectionHeading
          eyebrow="Compare & choose"
          title="Compare the shortlist symmetrically"
          sub="These pages put evidence, dose, form, safety, and interactions side by side before mechanism narratives."
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      <section className="mt-14 rounded-2xl border border-brand-900/10 bg-brand-50/60 p-6 dark:border-white/10 dark:bg-[var(--surface-subtle)]">
        <HubSectionHeading eyebrow="Evidence check" title="Do not collapse every cognition claim into one score" />
        <ul className="mt-4 grid gap-5 text-sm leading-7 text-muted sm:grid-cols-3">
          <li><strong className="block text-ink">Outcome</strong>Memory, reaction time, attention, executive function, and subjective brain fog are different endpoints.</li>
          <li><strong className="block text-ink">Timescale</strong>An acute stimulant study and a 12-week memory trial answer different questions.</li>
          <li><strong className="block text-ink">Population</strong>Healthy adults, sleep-deprived people, older adults, and diagnosed populations should not be generalized automatically.</li>
        </ul>
      </section>

      <section className="mt-14">
        <HubSectionHeading
          eyebrow="Research deeper"
          title="Cognition-relevant ingredient profiles"
          sub="Use the canonical profiles to inspect evidence summaries, studied dose, mechanisms, and safety after choosing the right intent."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {DEPTH_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-brand-900/12 bg-white p-4 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:hover:bg-white/10"
            >
              <span className="block text-[11px] font-bold uppercase tracking-widest text-muted">{item.kind}</span>
              <span className="mt-1 block text-sm font-semibold text-brand-800 dark:text-[var(--text-primary)]">{item.title} →</span>
            </Link>
          ))}
        </div>
      </section>

      <aside className="mt-14 rounded-2xl border-l-4 border-brand-700/50 bg-brand-50/70 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <strong>Boundary:</strong> persistent or worsening cognitive symptoms deserve evaluation for sleep, medication, mood, metabolic, neurological, or other causes. This hub is for research navigation, not diagnosis or treatment.
        </p>
      </aside>
    </div>
  )
}
