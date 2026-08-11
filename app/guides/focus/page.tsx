import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'
import References from '@/components/References'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '../../../src/lib/schema-graph'

export const metadata: Metadata = {
  title: 'Focus & Cognition Supplement Guides',
  description:
    'Compare focus supports by the problem you are trying to solve — acute attention, caffeine tradeoffs, or slower memory support — with current evidence and safety context.',
  alternates: { canonical: `${SITE_URL}/guides/focus/` },
  openGraph: {
    title: 'Focus & Cognition Guides',
    description: 'Compare focus supports by evidence, timescale, and tradeoffs.',
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
    why: 'Combination trials report some task-specific attention benefits from caffeine plus L-theanine, but not a guaranteed smoother response.',
    cta: 'L-Theanine vs Caffeine for Focus',
    href: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
  },
  {
    problem: 'You want steady focus without the crash',
    why: 'Compare caffeine dose and timing with non-caffeine strategies instead of assuming another supplement fixes the dip.',
    cta: 'Focus Without the Caffeine Crash',
    href: '/guides/focus/focus-without-caffeine-crash/',
  },
  {
    problem: 'You want calm focus without a stimulant',
    why: 'Recent trial meta-analysis found a short-term attention signal for L-theanine in healthy adults, while effects remain task-specific.',
    cta: 'L-Theanine Without Caffeine',
    href: '/guides/focus/l-theanine-without-caffeine/',
  },
  {
    problem: 'Comparing the main options',
    why: 'Caffeine has the clearest acute attention evidence; L-theanine findings are task-specific, while bacopa is studied with repeated use.',
    cta: 'Caffeine vs L-Theanine vs Bacopa',
    href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
  },
  {
    problem: 'Focus problems tied to ADHD',
    why: 'ADHD deserves a separate evidence and safety pathway; supplements are not substitutes for established ADHD treatment.',
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
    desc: 'A studied pairing with task-specific short-term effects — plus the uncertainty and tradeoffs that matter.',
  },
  {
    href: '/guides/focus/focus-without-caffeine-crash/',
    title: 'Focus Without the Crash',
    desc: 'Compare caffeine timing, dose, and non-caffeine strategies without promising an all-day supplement fix.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/focus/l-theanine-vs-caffeine-for-focus/',
    title: 'L-Theanine vs Caffeine',
    desc: 'What the acute attention evidence supports for each, where the combination may help, and where uncertainty remains.',
  },
  {
    href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
    title: 'Caffeine vs L-Theanine vs Bacopa',
    desc: 'Compare an acute stimulant, a task-specific amino-acid signal, and a repeatedly dosed memory herb by timeframe and evidence.',
  },
]

// Focus-related ADHD routes — a different problem that overlaps with attention.
const ADHD_FOCUS = [
  { href: '/guides/adhd/adhd-stack-guide/', title: 'ADHD Stack Guide' },
  { href: '/guides/adhd/l-theanine-for-adhd/', title: 'L-Theanine for ADHD' },
  { href: '/guides/adhd/best-supplements-for-adhd/', title: 'Best Supplements for ADHD' },
]

const DEPTH_LINKS = [
  { href: '/compounds/l-theanine/', title: 'L-Theanine', kind: 'Compound profile' },
  { href: '/compounds/caffeine/', title: 'Caffeine', kind: 'Compound profile' },
  { href: '/herbs/bacopa/', title: 'Bacopa Monnieri', kind: 'Herb profile' },
  { href: '/compounds/alpha-gpc/', title: 'Alpha-GPC', kind: 'Compound profile' },
  { href: '/compounds/cdp-choline/', title: 'Citicoline / CDP-Choline', kind: 'Compound profile' },
  { href: '/compounds/l-tyrosine/', title: 'L-Tyrosine', kind: 'Compound profile' },
  { href: '/compounds/creatine/', title: 'Creatine', kind: 'Compound profile' },
  { href: '/herbs/rhodiola/', title: 'Rhodiola Rosea', kind: 'Herb profile' },
]

const FOCUS_REFS = [
  {
    n: 1,
    text: 'Kløve K, Petersen A. (2025). A systematic review and meta-analysis of the acute effect of caffeine on attention. Psychopharmacology, 242(9): 1909-1930.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40335666/',
  },
  {
    n: 2,
    text: 'Payne ER, Aceves-Martins M, Dubost J, et al. (2025). Effects of tea or its bioactive compounds L-theanine or L-theanine plus caffeine on cognition, sleep, and mood in healthy participants: a systematic review and meta-analysis of randomized controlled trials. Nutrition Reviews, 83(10): 1873-1891.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40314930/',
  },
  {
    n: 3,
    text: 'Gerolymos C, Saddier E, Boyer L, Fond G. (2026). Cognitive and affective effects of L-Theanine: a systematic review and meta-analysis of 31 randomized trials. Molecular Psychiatry. Online ahead of print.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
  },
  {
    n: 4,
    text: 'Kongkeaw C, Dilokthornsakul P, Thanarangsarit P, et al. (2014). Meta-analysis of randomized controlled trials on cognitive effects of Bacopa monnieri extract. J Ethnopharmacol, 151(1): 528-535.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/24484449/',
  },
]

// Full library — kept, but secondary to the decision sections above.
const ALL_GUIDES = [
  { slug: 'best-nootropics-for-focus', title: 'Best Nootropics for Focus' },
  { slug: 'focus-without-caffeine-crash', title: 'Focus Without the Caffeine Crash' },
  { slug: 'l-theanine-vs-caffeine-for-focus', title: 'L-Theanine vs Caffeine for Focus' },
  { slug: 'l-theanine-without-caffeine', title: 'L-Theanine Without Caffeine' },
]

export default function FocusGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/focus/',
    title: 'Focus & Cognition Supplement Guides',
    description:
      'Compare focus supports by the problem you are trying to solve — acute attention, caffeine tradeoffs, or slower memory support.',
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

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Focus &amp; Cognition Guides</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Focus studies do not support one universal “best” nootropic. Caffeine has the clearest
          evidence for an acute attention effect in healthy adults; L-theanine and caffeine-plus-
          L-theanine findings vary by task; and options such as bacopa are studied over repeated use
          rather than as instant stimulants. Start with the problem and timescale, then check dose,
          safety, and how closely the study population matches you.
        </p>
      </header>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What is getting in the way of focus?"
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
          title="Deciding between options?"
          sub="These compare the evidence and tradeoffs instead of forcing a winner when the data do not justify one."
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="ADHD & focus"
          title="Focus problems tied to ADHD"
          sub="ADHD is not the same as everyday distraction. Use the dedicated pages for evidence and safety context, and do not treat supplements as replacements for established ADHD care."
        />
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

      <section className="mb-12 rounded-xl border-l-4 border-brand-700/40 bg-brand-50/60 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <span className="font-bold">What the newer reviews change.</span> A 2025 meta-analysis of
          31 double-blind, placebo-controlled caffeine trials in 1,455 rested, healthy adults found
          small acute improvements in both attention accuracy and reaction time. A separate 2025
          review of L-theanine, caffeine, and their combination found some small-to-moderate
          first-two-hour differences on specific cognitive and mood tasks, but its confidence
          intervals often showed uncertainty about the size or direction of the effect. A 2026
          L-theanine meta-analysis found a short-term choice-reaction-time benefit after 200 mg in
          healthy adults, while broader effects were not uniform across outcomes. The pairing is
          studied, but the evidence does not show that it reliably smooths focus across tasks. The
          2025 tea/theanine review also included industry-linked authors, so the cautious framing is
          intentional.
        </p>
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Research deeper"
          title="Focus-relevant ingredient profiles"
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

      <section className="mb-12">
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
      <References refs={FOCUS_REFS} />
    </div>
  )
}
