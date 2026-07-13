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
  title: 'Anxiety & Stress Supplement Guides',
  description:
    'Choose the right natural support based on the kind of anxiety or stress you have — overthinking, situational nerves, chronic stress, or nighttime worry. Evidence-based, decision-first guides.',
  alternates: { canonical: `${SITE_URL}/guides/anxiety/` },
  openGraph: {
    title: 'Anxiety & Stress Guides',
    description: 'Match the right adaptogen or anxiolytic to the kind of anxiety you have.',
    url: `${SITE_URL}/guides/anxiety/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

// Decision-first routing: match the kind of anxiety/stress to the right first guide.
const START_HERE: IntentRoute[] = [
  {
    problem: 'Overthinking — a mind that won’t switch off',
    why: 'Calming supports matched to the overthinking pattern.',
    cta: 'Supplements for Overthinking',
    href: '/guides/anxiety/best-supplements-for-overthinking/',
  },
  {
    problem: 'Situational nerves before a specific event',
    why: 'Fast, non-sedating calm for a presentation, exam, or flight.',
    cta: 'L-Theanine for Anxiety',
    href: '/guides/anxiety/l-theanine-for-anxiety/',
  },
  {
    problem: 'Chronic, ongoing baseline anxiety',
    why: 'An adaptogen that lowers cortisol and baseline stress over weeks.',
    cta: 'Ashwagandha for Anxiety',
    href: '/guides/anxiety/ashwagandha-for-anxiety/',
  },
  {
    problem: 'Racing thoughts keeping you up at night',
    why: 'Calming herbs matched to anxiety-driven insomnia.',
    cta: 'Herbs for Nighttime Anxiety',
    href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/',
  },
  {
    problem: 'Chronically elevated stress / high cortisol',
    why: 'Supplement and lifestyle strategies to bring cortisol down.',
    cta: 'How to Lower Cortisol',
    href: '/guides/anxiety/how-to-lower-cortisol-naturally/',
  },
  {
    problem: 'You want a full plan',
    why: 'How to combine anxiety supports safely — timing and synergy.',
    cta: 'Anxiety Stack Guide',
    href: '/guides/anxiety/anxiety-stack-guide/',
  },
  {
    problem: 'Comparing your options',
    why: 'Two popular anxiolytics, side by side with the evidence.',
    cta: 'CBD vs Ashwagandha',
    href: '/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/anxiety/natural-anxiety-relief/',
    title: 'Natural Anxiety Relief',
    desc: 'The evidence-informed overview — start here if you are not sure what you need.',
  },
  {
    href: '/guides/anxiety/ashwagandha-for-anxiety/',
    title: 'Ashwagandha for Anxiety',
    desc: 'The best-studied adaptogen for chronic, cortisol-driven anxiety.',
  },
  {
    href: '/guides/anxiety/l-theanine-for-anxiety/',
    title: 'L-Theanine for Anxiety',
    desc: 'Fast, non-sedating calm for in-the-moment nerves.',
  },
  {
    href: '/guides/anxiety/anxiety-stack-guide/',
    title: 'Anxiety Stack Guide',
    desc: 'How to combine options into one coherent, safe routine.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/',
    title: 'CBD vs Ashwagandha for Anxiety',
    desc: 'Two popular anxiolytics — mechanisms, evidence, and safety.',
  },
  {
    href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/',
    title: 'Natural Anxiolytics Beyond Ashwagandha',
    desc: 'L-theanine, kava, kanna — calming botanicals compared.',
  },
  {
    href: '/guides/anxiety/best-adaptogens-for-stress/',
    title: 'Best Adaptogens for Stress',
    desc: 'Ashwagandha, rhodiola, eleuthero, schisandra — when to use which.',
  },
  {
    href: '/guides/anxiety/natural-alternatives-to-anxiety-medication/',
    title: 'Alternatives to Anxiety Medication',
    desc: 'An educational overview — not a replacement for prescribed treatment.',
  },
]

const DEPTH_LINKS = [
  { href: '/herbs/ashwagandha/', title: 'Ashwagandha', kind: 'Herb profile' },
  { href: '/compounds/l-theanine/', title: 'L-Theanine', kind: 'Compound profile' },
  { href: '/compounds/kava/', title: 'Kava', kind: 'Compound profile' },
  { href: '/herbs/rhodiola/', title: 'Rhodiola Rosea', kind: 'Herb profile' },
  { href: '/compounds/magnesium-glycinate/', title: 'Magnesium Glycinate', kind: 'Compound profile' },
  { href: '/compounds/cannabidiol/', title: 'CBD (Cannabidiol)', kind: 'Compound profile' },
  { href: '/herbs/kanna/', title: 'Kanna', kind: 'Herb profile' },
  { href: '/herbs/schisandra/', title: 'Schisandra', kind: 'Herb profile' },
  { href: '/herbs/eleuthero/', title: 'Eleuthero', kind: 'Herb profile' },
  { href: '/compounds/lemon-balm/', title: 'Lemon Balm', kind: 'Compound profile' },
  { href: '/compounds/passionflower/', title: 'Passionflower', kind: 'Compound profile' },
  { href: '/herbs/holy-basil/', title: 'Holy Basil (Tulsi)', kind: 'Herb profile' },
]

const ANXIETY_REFS = [
  { n: 1, text: 'Chandrasekhar K, et al. (2012). A prospective, randomized, double-blind, placebo-controlled study of Withania somnifera (ashwagandha) in reducing stress and anxiety. Indian J Psychol Med, 34(3): 255-262.', url: 'https://pubmed.ncbi.nlm.nih.gov/23439798/' },
  { n: 2, text: 'Hidese S, et al. (2019). Effects of L-theanine administration on stress-related symptoms and cognitive functions in healthy adults. Nutrients, 11(10): 2362.', url: 'https://pubmed.ncbi.nlm.nih.gov/31581491/' },
  { n: 3, text: 'Sarris J, et al. (2020). Kava for generalised anxiety disorder: A 16-week double-blind, randomised, placebo-controlled study. Aust N Z J Psychiatry, 54(3): 288-297.', url: 'https://pubmed.ncbi.nlm.nih.gov/31665900/' },
  { n: 4, text: 'Panossian A, Wikman G. (2010). Effects of adaptogens on the central nervous system and the molecular mechanisms associated with their stress-protective activity. Pharmaceuticals, 3(1): 188-224.', url: 'https://pubmed.ncbi.nlm.nih.gov/27713248/' },
]

// Full library — kept, but secondary to the decision sections above.
const ALL_GUIDES = [
  { slug: 'natural-anxiety-relief', title: 'Natural Anxiety Relief' },
  { slug: 'best-herbs-for-anxiety', title: 'Best Herbs for Anxiety' },
  { slug: 'best-supplements-for-stress', title: 'Best Supplements for Stress' },
  { slug: 'best-adaptogens-for-stress', title: 'Best Adaptogens for Stress' },
  { slug: 'best-supplements-for-overthinking', title: 'Best Supplements for Overthinking' },
  { slug: 'best-herbs-for-stress-and-anxiety-at-night', title: 'Best Herbs for Nighttime Anxiety' },
  { slug: 'how-to-lower-cortisol-naturally', title: 'How to Lower Cortisol Naturally' },
  { slug: 'natural-anxiolytics-beyond-ashwagandha', title: 'Natural Anxiolytics Beyond Ashwagandha' },
  { slug: 'natural-alternatives-to-anxiety-medication', title: 'Alternatives to Anxiety Medication' },
  { slug: 'ashwagandha-for-anxiety', title: 'Ashwagandha for Anxiety' },
  { slug: 'l-theanine-for-anxiety', title: 'L-Theanine for Anxiety' },
  { slug: 'l-theanine-for-calm', title: 'L-Theanine for Calm' },
  { slug: 'cbd-vs-ashwagandha-for-anxiety', title: 'CBD vs Ashwagandha for Anxiety' },
  { slug: 'anxiety-stack-guide', title: 'Anxiety Stack Guide' },
]

export default function AnxietyGuideIndex() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: '/guides/anxiety/',
    title: 'Anxiety & Stress Supplement Guides',
    description:
      'Choose the right natural support based on the kind of anxiety or stress you have — overthinking, situational nerves, chronic stress, or nighttime worry.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Anxiety & Stress', url: `${SITE_URL}/guides/anxiety/` },
    ],
    itemListName: 'Anxiety & Stress Supplement Guides',
    items: ALL_GUIDES.map((g) => ({ name: g.title, url: `/guides/anxiety/${g.slug}/` })),
  })

  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <SchemaGraphScript graph={schemaGraph} />
      <nav className="mb-4 text-xs text-muted">
        <Link href="/guides/" className="hover:text-ink">
          Guides
        </Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Anxiety &amp; Stress</span>
      </nav>

      {/* Hero */}
      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Anxiety &amp; Stress Guides</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          Different kinds of anxiety need different tools. Tell us what yours feels like and we will
          point you to the right guide first.
        </p>
      </header>

      {/* Start Here — decision routing */}
      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What kind of anxiety do you have?"
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
          eyebrow="Compare & choose"
          title="Deciding between options?"
          sub="These weigh the alternatives instead of listing everything."
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      {/* Editorial note */}
      <section className="mb-12 rounded-xl border-l-4 border-brand-700/40 bg-brand-50/60 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <span className="font-bold">A note on matching the tool to the problem.</span> Acute,
          in-the-moment nerves and chronic, cortisol-driven stress respond to different supports — a
          fast anxiolytic like L-theanine versus a slow adaptogen like ashwagandha. None of these
          replaces care for a diagnosed anxiety disorder; if anxiety is severe or persistent, talk to
          a clinician.
        </p>
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Research deeper"
          title="Anxiety-relevant ingredient profiles"
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

      {/* All guides — secondary */}
      <section className="mb-12">
        <HubSectionHeading eyebrow="Full library" title="All anxiety & stress guides" />
        <ul className="grid gap-x-6 gap-y-2 sm:grid-cols-2">
          {ALL_GUIDES.map((g) => (
            <li key={g.slug}>
              <Link
                href={`/guides/anxiety/${g.slug}/`}
                className="text-sm font-medium text-brand-800 hover:underline dark:text-[var(--text-primary)]"
              >
                {g.title}
              </Link>
            </li>
          ))}
        </ul>
      </section>
      <References refs={ANXIETY_REFS} />
    </div>
  )
}
