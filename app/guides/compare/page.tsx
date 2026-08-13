import type { Metadata } from 'next'
import dynamic from 'next/dynamic'
import Image from 'next/image'
import { Suspense } from 'react'
import Link from 'next/link'
import { CompareTableSkeleton } from '@/components/skeletons'
import { PremiumCallout, PremiumCard, PremiumHero, PremiumSectionHeader } from '@/components/ui/PremiumVisual'
import { getCompounds } from '../../../src/lib/runtime-data'
import { cleanSummary, formatDisplayLabel, isClean, list } from '@/lib/display-utils'
import { isBuiltComparisonSlug } from '@/lib/comparison-utils'

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

type ComparePair = { slug: string; label: string; note?: string }
type CompareCategory = {
  label: string
  blurb: string
  pairs: ComparePair[]
}

const FEATURED_CATEGORIES: CompareCategory[] = [
  {
    label: 'Energy & focus',
    blurb: 'Compare common caffeine sources and focus stacks by dose transparency, stimulation profile, and the evidence behind their non-caffeine compounds.',
    pairs: [
      { slug: 'coffee-vs-green-tea', label: 'Coffee vs Green Tea', note: 'Everyday caffeine + polyphenol tradeoffs' },
      { slug: 'coffee-vs-guarana', label: 'Coffee vs Guarana', note: 'Beverage vs concentrated botanical stimulant' },
      { slug: 'guarana-vs-guayusa', label: 'Guarana vs Guayusa', note: 'Two naturally caffeinated botanicals' },
      { slug: 'guarana-vs-yerba-mate', label: 'Guarana vs Yerba Mate', note: 'Caffeine source and preparation differences' },
      { slug: 'caffeine-vs-l-theanine', label: 'Caffeine vs L-Theanine', note: 'Stimulation vs calm-focus context' },
      { slug: 'caffeine-vs-l-theanine-vs-bacopa-for-focus', label: 'Caffeine vs L-Theanine vs Bacopa', note: 'Fast stimulation vs slower support' },
    ],
  },
  {
    label: 'Stress, mood & adaptogens',
    blurb: 'Compare botanicals used around stress and mood while keeping stimulation level, evidence quality, and medication interactions visible.',
    pairs: [
      { slug: 'rhodiola-vs-ashwagandha', label: 'Rhodiola vs Ashwagandha', note: 'More stimulating vs more calming adaptogen profile' },
      { slug: 'american-ginseng-vs-asian-ginseng', label: 'American vs Asian Ginseng', note: 'Closely related species with different practical profiles' },
      { slug: 'st-johns-wort-vs-saffron', label: "St. John’s Wort vs Saffron", note: 'Mood evidence with interaction burden front and center' },
      { slug: 'ashwagandha-vs-l-theanine-vs-magnesium', label: 'Ashwagandha vs L-Theanine vs Magnesium', note: 'Three different calm-support approaches' },
    ],
  },
  {
    label: 'Sleep & evening use',
    blurb: 'Compare sleep-oriented options by timing, next-day effects, and whether the evidence is about circadian timing, relaxation, or broader sleep support.',
    pairs: [
      { slug: 'melatonin-vs-magnesium', label: 'Melatonin vs Magnesium' },
      { slug: 'sleep-herbs-vs-melatonin', label: 'Sleep Herbs vs Melatonin' },
      { slug: 'melatonin-vs-valerian-vs-magnesium-for-sleep', label: 'Melatonin vs Valerian vs Magnesium' },
    ],
  },
  {
    label: 'Botanical chemistry',
    blurb: 'Closely related herbs compared through shared constituents and preparation-specific safety rather than assuming similar chemistry makes them interchangeable.',
    pairs: [
      { slug: 'coptis-vs-goldenseal', label: 'Coptis vs Goldenseal', note: 'Berberine-rich botanicals with different context' },
      { slug: 'coptis-vs-phellodendron', label: 'Coptis vs Phellodendron', note: 'Specialist berberine / alkaloid comparison' },
      { slug: 'oregano-vs-thyme', label: 'Oregano vs Thyme', note: 'Thymol/carvacrol chemistry and preparation differences' },
    ],
  },
  {
    label: 'Metabolic & inflammation',
    blurb: 'Evidence and safety comparisons for popular metabolic and anti-inflammatory choices, including where supplement and medication contexts are not equivalent.',
    pairs: [
      { slug: 'berberine-vs-metformin', label: 'Berberine vs Metformin' },
      { slug: 'berberine-vs-inositol', label: 'Berberine vs Inositol' },
      { slug: 'curcumin-vs-boswellia-vs-omega-3', label: 'Curcumin vs Boswellia vs Omega-3' },
    ],
  },
  {
    label: 'High-caution comparisons',
    blurb: 'These pages are especially safety-oriented. A superficial similarity does not make the substances equivalent, interchangeable, or appropriate to combine.',
    pairs: [
      { slug: 'kanna-vs-ssris', label: 'Kanna vs SSRIs' },
      { slug: 'kava-vs-alcohol', label: 'Kava vs Alcohol' },
    ],
  },
]

const builtFeaturedCategories = FEATURED_CATEGORIES
  .map(category => ({
    ...category,
    pairs: category.pairs.filter(pair => isBuiltComparisonSlug(pair.slug)),
  }))
  .filter(category => category.pairs.length > 0)

const popularComparisonPairs = [
  { slug: 'coffee-vs-green-tea', label: 'Coffee vs Green Tea' },
  { slug: 'st-johns-wort-vs-saffron', label: "St. John’s Wort vs Saffron" },
  { slug: 'rhodiola-vs-ashwagandha', label: 'Rhodiola vs Ashwagandha' },
  { slug: 'american-ginseng-vs-asian-ginseng', label: 'American vs Asian Ginseng' },
  { slug: 'melatonin-vs-magnesium', label: 'Melatonin vs Magnesium' },
  { slug: 'coptis-vs-goldenseal', label: 'Coptis vs Goldenseal' },
]
  .filter(pair => isBuiltComparisonSlug(pair.slug))
  .map(pair => ({ ...pair, href: `/guides/compare/${pair.slug}/` }))

const goalStarterPaths = [
  {
    goal: 'Energy',
    title: 'Choosing a daily caffeine source? Compare dose, stimulation, and non-caffeine chemistry.',
    href: '/guides/compare/coffee-vs-green-tea/',
    cta: 'Compare Coffee & Green Tea',
  },
  {
    goal: 'Sleep',
    title: 'Need help sleeping? Start with timing, evidence, and next-day effects.',
    href: '/guides/compare/melatonin-vs-magnesium/',
    cta: 'Compare sleep options',
  },
  {
    goal: 'Stress & calm',
    title: 'Choosing between adaptogens? Compare stimulation, steadiness, and safety.',
    href: '/guides/compare/rhodiola-vs-ashwagandha/',
    cta: 'Compare stress support',
  },
  {
    goal: 'Mood',
    title: 'Looking at mood-oriented botanicals? Start with evidence and medication interactions.',
    href: '/guides/compare/st-johns-wort-vs-saffron/',
    cta: 'Compare mood botanicals',
  },
  {
    goal: 'Metabolic',
    title: 'Comparing berberine with other metabolic options? Keep medication context explicit.',
    href: '/guides/compare/berberine-vs-metformin/',
    cta: 'Compare metabolic options',
  },
  {
    goal: 'Build your own',
    title: 'Already know the two ingredients? Use the research matrix to scan them side by side.',
    href: '/guides/compare/dynamic/',
    cta: 'Open comparison matrix',
  },
]

const guidanceCards = [
  {
    title: 'Scan evidence first',
    body: 'Start with evidence strength and mechanism confidence, then decide whether weaker evidence is still acceptable for your goal.',
  },
  {
    title: 'Map safety and profile fit',
    body: 'Check caution flags, stimulation or sedation profile, and interaction risk before focusing on convenience or trend.',
  },
  {
    title: 'Use tradeoffs, not hype',
    body: 'Compare onset, duration, preparation, and evidence side by side. Similar labels do not make two ingredients interchangeable.',
  },
]

const compareFaqs = [
  {
    question: 'What does "strong evidence" mean on this site?',
    answer:
      'Strong evidence means human clinical trials — ideally randomized and controlled — consistently support the effect. Moderate evidence has fewer or smaller human trials, limited evidence relies mostly on mechanism or small studies, and traditional or preliminary tiers rely on historical use or early-stage research rather than confirmed clinical outcomes.',
  },
  {
    question: 'Why do two supplements compare differently depending on the goal?',
    answer:
      'Mechanism relevance shifts with the goal. Two botanicals can overlap chemically but differ in stimulation, preparation, safety, or the outcomes actually studied in humans. The comparison pages are designed to make those tradeoffs visible rather than declare a universal winner.',
  },
  {
    question: 'Does a higher price mean better quality?',
    answer:
      'Not necessarily. Price often reflects extraction method, standardization, or dose form rather than efficacy. Check the actual dose and standardized-extract percentage against what was used in supporting research before assuming a pricier product performs better.',
  },
  {
    question: 'Can these comparisons replace medical advice?',
    answer:
      'No. Comparisons here are educational and summarize published research patterns, not individualized guidance. Review current medications, health conditions, and pregnancy or nursing status with a clinician or pharmacist before starting or combining supplements.',
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
    title: 'Compare Supplements Side by Side: Evidence & Safety',
    description: 'Compare herbs and supplements by evidence strength, mechanism, stimulation profile, safety, and dosing. Free research tool.',
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Compare', url: `${SITE_URL}/guides/compare/` },
    ],
    comparisonPairs: popularComparisonPairs.map(pair => ({
      name: pair.label,
      url: pair.href,
    })),
    faqQuestions: compareFaqs,
  })

  return (
    <div className="library-index-page mx-auto max-w-6xl space-y-7 px-4 py-7 sm:space-y-8 sm:py-10">
      <SchemaGraphScript graph={schemaGraph} />
      <PremiumHero
        eyebrow="Evidence-informed comparison"
        title="Herb & Supplement Comparison Center"
        description="Compare real, published side-by-side guides by evidence, chemistry, safety, stimulation profile, and preparation. Every featured link below resolves to a comparison page that actually exists."
        actions={[
          { href: '#start-by-goal', label: 'Start by goal' },
          { href: '#featured-comparisons', label: 'Browse comparisons', variant: 'secondary' },
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
          description="Use a curated comparison when one exists, or open the research matrix when you already know the two ingredients you want to inspect."
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
          eyebrow="Browse real comparison pages"
          title="Curated comparisons"
          description="These are published routes, grouped by the decision they help clarify. New comparison pages automatically stay off this hub until their route is actually built."
        />
        {builtFeaturedCategories.map((cat) => (
          <div key={cat.label} className="space-y-3">
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-brand-700 dark:text-brand-200">{cat.label}</h3>
              <p className="mt-1 text-sm leading-6 text-muted">{cat.blurb}</p>
            </div>
            <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {cat.pairs.map((pair) => (
                <li key={pair.slug}>
                  <Link
                    href={`/guides/compare/${pair.slug}/`}
                    className="library-content-card flex h-full flex-col justify-between rounded-2xl border border-brand-900/10 bg-white/90 px-4 py-4 text-sm font-semibold text-ink shadow-sm transition hover:border-brand-300 hover:shadow dark:border-white/10 dark:bg-white/5 dark:hover:bg-white/10"
                  >
                    <span className="block text-pretty leading-6">{pair.label}</span>
                    {pair.note ? <span className="mt-2 block text-xs font-normal leading-5 text-muted">{pair.note}</span> : null}
                    <span className="mt-3 block text-xs font-bold text-brand-700 dark:text-brand-100">Compare →</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}
      </section>

      <PremiumCard as="section" className="p-5">
        <p className="eyebrow-label">Good places to start</p>
        <h2 className="mt-2 text-xl font-semibold text-ink">Featured decision pages</h2>
        <p className="mt-2 text-sm leading-6 text-muted">A small set of useful entry points across energy, mood, stress, sleep, and botanical chemistry.</p>
        <ul className="mt-4 grid gap-2 text-sm leading-6 text-muted sm:grid-cols-2 lg:grid-cols-3">
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
        <h2 className="mt-2 text-xl font-semibold text-ink">Use comparisons to choose a safer research path</h2>
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

      <section id="faq" className="space-y-4 scroll-mt-24">
        <PremiumSectionHeader
          eyebrow="Questions"
          title="How to read these comparisons"
          description="What the evidence tiers mean, and what a comparison can and cannot tell you."
        />
        <div className="grid gap-3 sm:grid-cols-2">
          {compareFaqs.map((item) => (
            <PremiumCard key={item.question} as="article" className="p-5">
              <h3 className="text-base font-semibold text-ink">{item.question}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.answer}</p>
            </PremiumCard>
          ))}
        </div>
      </section>

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
