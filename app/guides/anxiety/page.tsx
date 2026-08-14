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
  title: 'Anxiety Supplements: Evidence, Safety & Interactions',
  description:
    'Compare natural anxiety and stress supports by symptom pattern, evidence, timescale, and safety — without treating short-term stress findings as proof of anxiety relief.',
  alternates: { canonical: `${SITE_URL}/guides/anxiety/` },
  openGraph: {
    title: 'Anxiety & Stress Guides',
    description: 'Compare anxiety and stress supports by evidence, timescale, and safety.',
    url: `${SITE_URL}/guides/anxiety/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

// Decision-first routing: match the kind of anxiety/stress to the right first guide.
const START_HERE: IntentRoute[] = [
  {
    problem: 'Overthinking — a mind that won’t switch off',
    why: 'Compare calming-support evidence without assuming every stress finding translates to anxiety relief.',
    cta: 'Supplements for Overthinking',
    href: '/guides/anxiety/best-supplements-for-overthinking/',
  },
  {
    problem: 'Situational nerves before a specific event',
    why: 'Acute anxiety evidence for L-theanine is inconsistent; this guide separates attention and stress findings from anxiety claims.',
    cta: 'L-Theanine for Anxiety',
    href: '/guides/anxiety/l-theanine-for-anxiety/',
  },
  {
    problem: 'Chronic, ongoing baseline anxiety',
    why: 'Repeated-dose ashwagandha trials are more relevant here than instant-relief claims, but study populations and formulations still vary.',
    cta: 'Ashwagandha for Anxiety',
    href: '/guides/anxiety/ashwagandha-for-anxiety/',
  },
  {
    problem: 'Racing thoughts keeping you up at night',
    why: 'Review sleep- and stress-related evidence with medication, sedation, and next-day safety in view.',
    cta: 'Herbs for Nighttime Anxiety',
    href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/',
  },
  {
    problem: 'Chronically elevated stress / high cortisol',
    why: 'Separate cortisol findings from perceived-stress outcomes and keep lifestyle and supplement evidence distinct.',
    cta: 'How to Lower Cortisol',
    href: '/guides/anxiety/how-to-lower-cortisol-naturally/',
  },
  {
    problem: 'You want a full plan',
    why: 'Review how common combinations are discussed, with timing, interaction, and safety boundaries kept visible.',
    cta: 'Anxiety Stack Guide',
    href: '/guides/anxiety/anxiety-stack-guide/',
  },
  {
    problem: 'Comparing your options',
    why: 'Put two popular options side by side without assuming either is universally better.',
    cta: 'CBD vs Ashwagandha',
    href: '/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/anxiety/best-herbs-for-anxiety/',
    title: 'Best Herbs for Anxiety',
    desc: 'Compare calming herbs by the outcomes actually studied, with medication and safety boundaries kept visible.',
  },
  {
    href: '/guides/anxiety/natural-anxiety-relief/',
    title: 'Natural Anxiety Relief',
    desc: 'The evidence-informed overview — start here if you are not sure what you need.',
  },
  {
    href: '/guides/anxiety/ashwagandha-for-anxiety/',
    title: 'Ashwagandha for Anxiety',
    desc: 'Repeated-use trial evidence for stress and anxiety symptoms, plus formulation, safety, and certainty limits.',
  },
  {
    href: '/guides/anxiety/l-theanine-for-anxiety/',
    title: 'L-Theanine for Anxiety',
    desc: 'Separate the short-term attention and stress signal from the much less consistent anxiety evidence.',
  },
  {
    href: '/guides/anxiety/anxiety-stack-guide/',
    title: 'Anxiety Stack Guide',
    desc: 'How common combinations are discussed while keeping interactions, timing, and uncertainty visible.',
  },
  {
    href: '/guides/anxiety/best-adaptogens-for-stress/',
    title: 'Best Adaptogens for Stress',
    desc: 'Direct human stress evidence, preparation-specific limits, and safety compared without HPA-axis shortcuts.',
  },
  {
    href: '/guides/anxiety/how-to-lower-cortisol-naturally/',
    title: 'How to Lower Cortisol Naturally',
    desc: 'Separate everyday stress management from medical cortisol excess, testing, and biomarker marketing.',
  },
  {
    href: '/guides/anxiety/best-herbs-for-stress-and-anxiety-at-night/',
    title: 'Herbs for Nighttime Stress & Anxiety',
    desc: 'Nighttime intent with same-night claims, repeated-dose evidence, sedation, and insomnia boundaries kept distinct.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/anxiety/cbd-vs-ashwagandha-for-anxiety/',
    title: 'CBD vs Ashwagandha for Anxiety',
    desc: 'Two popular options compared by mechanisms, human evidence, uncertainty, and safety.',
  },
  {
    href: '/guides/anxiety/natural-anxiolytics-beyond-ashwagandha/',
    title: 'Natural Anxiolytics Beyond Ashwagandha',
    desc: 'L-theanine, kava, kanna, and other options compared without treating popularity as proof.',
  },
  {
    href: '/guides/anxiety/best-adaptogens-for-stress/',
    title: 'Best Adaptogens for Stress',
    desc: 'Compare ashwagandha, rhodiola, eleuthero, and schisandra by the outcomes and populations actually studied.',
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
  {
    n: 1,
    text: 'Arumugam V, Vijayakumar V, Balakrishnan A, et al. (2024). Effects of Ashwagandha (Withania somnifera) on stress and anxiety: a systematic review and meta-analysis. Explore (NY), 20(6): 103062.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/39348746/',
  },
  {
    n: 2,
    text: 'Gerolymos C, Saddier E, Boyer L, Fond G. (2026). Cognitive and affective effects of L-Theanine: a systematic review and meta-analysis of 31 randomized trials. Molecular Psychiatry. Online ahead of print.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/42410082/',
  },
  {
    n: 3,
    text: 'Sarris J, et al. (2020). Kava for generalised anxiety disorder: a 16-week double-blind, randomised, placebo-controlled study. Aust N Z J Psychiatry, 54(3): 288-297.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/31665900/',
  },
  {
    n: 4,
    text: 'Albalawi AA. (2025). Dual impact of Ashwagandha: significant cortisol reduction but no effects on perceived stress — a systematic review and meta-analysis. Nutrition and Health, 31(4): 1395-1408.',
    url: 'https://pubmed.ncbi.nlm.nih.gov/40746175/',
  },
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
      'Compare natural anxiety and stress supports by symptom pattern, evidence, timescale, and safety.',
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

      <header className="mb-10">
        <h1 className="text-3xl font-bold tracking-tight text-ink sm:text-4xl">Anxiety &amp; Stress Guides</h1>
        <p className="mt-3 max-w-2xl text-lg leading-8 text-muted">
          “Stress,” “acute stress,” and an anxiety disorder are not interchangeable outcomes. Use the
          pattern below to find the most relevant guide, then check what population, preparation,
          duration, and outcome the human evidence actually studied before treating a result as
          personally applicable.
        </p>
      </header>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Start here"
          title="What kind of anxiety or stress are you dealing with?"
          sub="Pick the closest description — each routes you to a guide that separates the evidence from the marketing shorthand."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      <section className="mb-12">
        <HubSectionHeading eyebrow="Best first reads" title="If you only read a few" />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      <section className="mb-12">
        <HubSectionHeading
          eyebrow="Compare & choose"
          title="Deciding between options?"
          sub="These compare human evidence, uncertainty, and safety instead of assuming a winner."
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      <section className="mb-12 rounded-xl border-l-4 border-brand-700/40 bg-brand-50/60 p-5 dark:bg-[var(--surface-subtle)]">
        <p className="text-sm leading-7 text-ink dark:text-[var(--text-secondary)]">
          <span className="font-bold">What the newer reviews change.</span> The July 2026
          L-theanine meta-analysis pooled 31 randomized trials and found a short-term attention
          signal, but anxiety effects were inconsistent and generally non-significant; the acute
          stress reduction was modest and sensitive to studies at high risk of bias. That does not
          support calling L-theanine a guaranteed “fast anxiolytic.” Ashwagandha has a larger
          repeated-dose anxiety/stress literature, but reviews still report substantial between-study
          heterogeneity, formulation differences, and unresolved long-term safety questions. A 2025
          meta-analysis also found cortisol reduction without a clear perceived-stress benefit,
          which is why this hub keeps biomarker changes separate from how people actually feel.
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
