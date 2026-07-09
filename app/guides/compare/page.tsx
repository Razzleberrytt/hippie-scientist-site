import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Suspense } from 'react'
import Link from 'next/link'
import { CompareTableSkeleton } from '@/components/skeletons'
import { PremiumCallout, PremiumCard, PremiumHero, PremiumSectionHeader } from '@/components/ui/PremiumVisual'
import { getCompounds } from '../../../src/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list } from '@/lib/display-utils'

import { buildPageMetadata, SEO_YEAR, SITE_URL } from '../../../src/lib/seo'
import { buildCompareHubSchemaGraph } from '../../../src/lib/schema-graph'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'

const CompareTableClient = dynamic(
  () => import('@/components/compare-table-client').then(mod => ({ default: mod.CompareTableClient })),
  { loading: () => <CompareTableSkeleton /> },
)

export const metadata: Metadata = buildPageMetadata({
  title: `Herb & Supplement Comparison Center ${SEO_YEAR}`,
  description:
    'Compare herbs and supplements side-by-side by evidence strength, mechanism, stimulation profile, safety, and dosing. Evidence-based decision support.',
  path: '/guides/compare/',
})

type CompareCategory = {
  label: string
  pairs: { slug: string; label: string }[]
}

const FEATURED_CATEGORIES: CompareCategory[] = [
  {
    label: 'Adaptogens',
    pairs: [
      { slug: 'ashwagandha-vs-rhodiola', label: 'Ashwagandha vs Rhodiola' },
      { slug: 'ashwagandha-vs-eleuthero', label: 'Ashwagandha vs Eleuthero' },
      { slug: 'reishi-vs-ashwagandha', label: 'Reishi vs Ashwagandha' },
      { slug: 'bacopa-vs-rhodiola', label: 'Bacopa vs Rhodiola' },
    ],
  },
  {
    label: 'Cognitive',
    pairs: [
      { slug: 'bacopa-vs-lions-mane', label: "Bacopa vs Lion's Mane" },
      { slug: 'bacopa-vs-ginkgo-biloba', label: 'Bacopa vs Ginkgo Biloba' },
      { slug: 'alpha-gpc-vs-cdp-choline', label: 'Alpha-GPC vs CDP-Choline' },
      { slug: 'caffeine-vs-l-theanine-vs-bacopa-for-focus', label: 'Caffeine vs L-Theanine vs Bacopa' },
    ],
  },
  {
    label: 'Sleep',
    pairs: [
      { slug: 'melatonin-vs-valerian', label: 'Melatonin vs Valerian' },
      { slug: 'valerian-vs-passionflower', label: 'Valerian vs Passionflower' },
      { slug: 'glycine-vs-melatonin', label: 'Glycine vs Melatonin' },
      { slug: 'melatonin-vs-l-theanine', label: 'Melatonin vs L-Theanine' },
      { slug: 'l-theanine-vs-magnesium', label: 'L-Theanine vs Magnesium' },
    ],
  },
  {
    label: 'Athletic',
    pairs: [
      { slug: 'creatine-vs-beta-alanine', label: 'Creatine vs Beta-Alanine' },
      { slug: 'creatine-vs-bcaa', label: 'Creatine vs BCAAs' },
      { slug: 'creatine-vs-caffeine', label: 'Creatine vs Caffeine' },
      { slug: 'cordyceps-vs-beta-alanine', label: 'Cordyceps vs Beta-Alanine' },
    ],
  },
  {
    label: 'Immune',
    pairs: [
      { slug: 'echinacea-vs-elderberry', label: 'Echinacea vs Elderberry' },
      { slug: 'vitamin-d-vs-magnesium', label: 'Vitamin D vs Magnesium' },
      { slug: 'vitamin-d-vs-vitamin-d3', label: 'Vitamin D vs Vitamin D3' },
      { slug: 'quercetin-vs-resveratrol', label: 'Quercetin vs Resveratrol' },
    ],
  },
  {
    label: 'Gut & Cardiovascular',
    pairs: [
      { slug: 'turmeric-vs-ginger', label: 'Turmeric vs Ginger' },
      { slug: 'curcumin-vs-boswellia', label: 'Curcumin vs Boswellia' },
      { slug: 'hawthorn-vs-coq10', label: 'Hawthorn vs CoQ10' },
      { slug: 'berberine-vs-metformin', label: 'Berberine vs Metformin' },
    ],
  },
]

const popularComparisonPairs = [
  { label: 'Melatonin vs Magnesium', href: '/guides/compare/melatonin-vs-magnesium/' },
  { label: 'Sleep herbs vs Melatonin', href: '/guides/compare/sleep-herbs-vs-melatonin/' },
  { label: 'Rhodiola vs Ashwagandha', href: '/guides/compare/rhodiola-vs-ashwagandha/' },
  { label: 'Ashwagandha vs L-Theanine vs Magnesium', href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/' },
  { label: 'Caffeine vs L-Theanine vs Bacopa for Focus', href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/' },
  { label: 'Dynamic Ingredient Comparison Matrix', href: '/guides/compare/dynamic/' },
]

const goalStarterPaths = [
  {
    goal: 'Sleep',
    title: 'Need help sleeping? Start with timing and next-day grogginess.',
    href: '/guides/compare/melatonin-vs-magnesium/',
    cta: 'Compare sleep options',
  },
  {
    goal: 'Stress & calm',
    title: 'Choosing between adaptogens? Compare steadiness, stimulation, and safety.',
    href: '/guides/compare/rhodiola-vs-ashwagandha/',
    cta: 'Compare stress support',
  },
  {
    goal: 'Focus',
    title: 'Need cleaner focus? Compare stimulation, onset, and evidence strength.',
    href: '/guides/compare/caffeine-vs-l-theanine-vs-bacopa-for-focus/',
    cta: 'Compare focus options',
  },
  {
    goal: 'Calm + sleep',
    title: 'Balancing relaxation and sleep? Compare calming options side by side.',
    href: '/guides/compare/ashwagandha-vs-l-theanine-vs-magnesium/',
    cta: 'Compare calming options',
  },
  {
    goal: 'Inflammation',
    title: 'Comparing anti-inflammatory paths? Start with mechanism and safety fit.',
    href: '/guides/compare/curcumin-vs-boswellia/',
    cta: 'Compare inflammation options',
  },
  {
    goal: 'Performance',
    title: 'Need energy or training support? Compare performance tradeoffs first.',
    href: '/guides/compare/creatine-vs-caffeine/',
    cta: 'Compare performance options',
  },
]

const guidanceCards = [
  {
    title: 'Scan evidence first',
    body: 'Start with evidence strength and mechanism confidence, then decide whether weaker evidence is still acceptable for your goal.',
  },
  {
    title: 'Map safety and profile fit',
    body: 'Check caution flags, stimulation or sedation profile, and tolerance risk before focusing on convenience or trend.',
  },
  {
    title: 'Use tradeoffs, not hype',
    body: 'Compare onset, duration, and cost/value side by side. Fast effects or lower cost can come with tradeoffs in certainty or tolerability.',
  },
]

export default async function ComparePage() {
  const compounds = await getCompounds()
  const safeCompounds = compounds
    .filter((compound: Record<string, unknown>) => compound.slug && isClean(compound.name || compound.displayName || compound.slug))
    .map((compound: Record<string, unknown>) => ({
      slug: compound.slug,
      name: formatDisplayLabel(compound.displayName || compound.name || compound.slug),
      summary: cleanSummary(compound.summary || compound.description, 'compound'),
      effects: list(compound.primary_effects || compound.effects).slice(0, 4),
      evidence_tier: formatDisplayLabel(compound.evidence_tier || compound.evidenceTier || compound.evidence_grade),
      time_to_effect: formatDisplayLabel(compound.time_to_effect),
      role: formatDisplayLabel(compound.role),
      safety_flags: list(compound.safety_flags || compound.safetyNotes || compound.contraindications).slice(0, 3),
      complexity: formatDisplayLabel(compound.complexity),
      cost: formatDisplayLabel(compound.cost),
    }))

  const schemaGraph = buildCompareHubSchemaGraph({
    path: '/guides/compare/',
    title: `Compare Supplements Side by Side ${SEO_YEAR} – Evidence & Safety`,
    description: 'Compare herbs and supplements by evidence strength, mechanism, stimulation profile, safety, and dosing. Free research tool.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Compare', url: `${SITE_URL}/guides/compare/` },
    ],
    comparisonPairs: popularComparisonPairs.map(pair => ({
      name: pair.label,
      url: pair.href,
    })),
  })

  return (
    <div className="library-index-page mx-auto max-w-6xl space-y-7 px-4 py-7 sm:space-y-8 sm:py-10">
      <SchemaGraphScript graph={schemaGraph} />
      <PremiumHero
        eyebrow="Evidence-informed comparison"
        title="Herb & Supplement Comparison Center"
        description="Compare herbs and supplements by evidence strength, mechanism, stimulation profile, safety, and dosing. Each comparison page shows data-backed tradeoffs — not marketing claims."
        actions={[
          { href: '#start-by-goal', label: 'Start by goal' },
          { href: '#featured-comparisons', label: 'Browse categories', variant: 'secondary' },
        ]}
      >
        <div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm">
          <Image
            src="/images/guides/compare-hub.jpg"
            alt="Herbs and supplement bottles arranged side by side for comparison"
            width={1536}
            height={700}
            priority
            className="h-auto w-full"
          />
        </div>
      </PremiumHero>

      <section className="grid gap-4 md:grid-cols-3">
        {guidanceCards.map((card) => (
          <PremiumCard key={card.title} as="article" className="p-5">
            <h2 className="text-base font-semibold text-ink">{card.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{card.body}</p>
          </PremiumCard>
        ))}
      </section>

      <section id="start-by-goal" className="space-y-5 scroll-mt-24">
        <PremiumSectionHeader
          eyebrow="Start by goal"
          title="Pick the decision you are actually trying to make"
          description="Not sure which comparison to open first? Start with the goal, then use the side-by-side page to check evidence, timing, safety, and fit."
        />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {goalStarterPaths.map((path) => (
            <Link
              key={path.href}
              href={path.href}
              className="library-content-card rounded-2xl border border-brand-900/10 bg-white/90 p-4 shadow-sm transition hover:border-brand-300 hover:shadow dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <p className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-100">{path.goal}</p>
              <h2 className="mt-2 text-base font-semibold leading-6 text-ink">{path.title}</h2>
              <p className="mt-3 text-xs font-bold text-brand-700 dark:text-brand-100">{path.cta} →</p>
            </Link>
          ))}
        </div>
      </section>

      <section id="featured-comparisons" className="space-y-7 scroll-mt-24">
        <PremiumSectionHeader
          eyebrow="Browse by category"
          title="Browse by supplement category"
          description="Already know the type of supplement you are comparing? Use these grouped lists to jump into nearby options by family, mechanism, or use case."
        />
        {FEATURED_CATEGORIES.map((cat) => (
          <div key={cat.label} className="space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-200">{cat.label}</h3>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
              {cat.pairs.map((pair) => (
                <li key={pair.slug}>
                  <Link
                    href={`/guides/compare/${pair.slug}/`}
                    className="library-content-card block rounded-2xl border border-brand-900/10 bg-white/90 px-4 py-3 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-300 hover:shadow dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <span className="block truncate">{pair.label}</span>
                    <span className="mt-1 block text-xs font-bold text-brand-700 dark:text-brand-100">Compare →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <PremiumCard as="section" className="p-5">
        <h2 className="text-xl font-semibold text-ink">Flagship comparison pages</h2>
        <p className="mt-2 text-sm leading-6 text-muted">Broad, high-intent pages with the most detailed evidence and safety breakdowns.</p>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted sm:grid-cols-2">
          {popularComparisonPairs.map(pair => (
            <li key={pair.href}>
              <Link href={pair.href} className="font-semibold text-brand-800 hover:underline dark:text-brand-100 dark:hover:text-white">{pair.label}</Link>
            </li>
          ))}
        </ul>
      </PremiumCard>

      <PremiumCallout tone="caution">
        <p className="font-semibold uppercase tracking-wide text-amber-900 dark:text-amber-100">Use this cautiously.</p>
        <p className="mt-2 text-amber-950/90 dark:text-amber-50/90">
          This page is educational and does not replace medical advice. Evidence strength reflects research signal quality, not guaranteed outcomes, and individual response varies. Review medications, health conditions, pregnancy or nursing status, and clinician guidance before using supplements.
        </p>
      </PremiumCallout>

      <PremiumCard as="section" className="p-5">
        <p className="eyebrow-label">Decision next step</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">Use comparisons to choose a safer path</h2>
        <div className="mt-4 grid gap-3 text-sm leading-6 text-muted md:grid-cols-4">
          <Link href="/guides/" className="rounded-xl border border-brand-900/10 p-4 font-semibold text-ink transition hover:bg-brand-50 dark:border-white/10 dark:hover:bg-white/10">
            Start from your goal
          </Link>
          <Link href="/guides/compare/dynamic/" className="rounded-xl border border-brand-900/10 p-4 font-semibold text-ink transition hover:bg-brand-50 dark:border-white/10 dark:hover:bg-white/10">
            Open dynamic matrix
          </Link>
          <Link href="/safety-checker/" className="rounded-xl border border-brand-900/10 p-4 font-semibold text-ink transition hover:bg-brand-50 dark:border-white/10 dark:hover:bg-white/10">
            Check safety context
          </Link>
          <Link href="/learn/product-quality/" className="rounded-xl border border-brand-900/10 p-4 font-semibold text-ink transition hover:bg-brand-50 dark:border-white/10 dark:hover:bg-white/10">
            Review product quality
          </Link>
        </div>
      </PremiumCard>

      <section id="comparison-table" className="space-y-4 scroll-mt-24">
        <PremiumSectionHeader
          eyebrow="Comparison table"
          title="Scan for fit, then read deeper"
          description="The table is meant to narrow options, not finalize a decision. Follow up by reading the individual compound pages, safety notes, and cited research context where available."
        />
        <Suspense fallback={<CompareTableSkeleton />}>
          <CompareTableClient compounds={safeCompounds} />
        </Suspense>
      </section>
    </div>
  )
}
