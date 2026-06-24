import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import {
  BestForCard,
  ComparisonCard,
  InternalLinkCard,
  MethodologyStrip,
  NotBestForCard,
  ProductPickCard,
  SafetyBadge,
  SectionHeader,
} from '@/components/ui/clinical-apothecary'

const PAGE_URL = `${SITE_URL}/guides/best-supplements-for-sleep`

export const metadata: Metadata = {
  title: 'Best Supplements for Sleep — Evidence-Based Guide',
  description:
    'Evidence-graded review of the best sleep supplements: magnesium glycinate, L-theanine, melatonin, valerian, ashwagandha, and more. Mechanisms, dosing, safety, and decision framework.',
  alternates: { canonical: '/guides/best-supplements-for-sleep/' },
  openGraph: {
    title: 'Best Supplements for Sleep — Evidence-Based Guide',
    description:
      'Which sleep supplements actually work? Magnesium, melatonin, L-theanine, valerian, ashwagandha — evidence-graded with dosing, safety, and stacking notes.',
    url: '/guides/best-supplements-for-sleep',
    type: 'article',
  },
}

const SLEEP_SUPPLEMENTS = [
  {
    name: 'Magnesium Glycinate',
    mechanism: 'NMDA receptor antagonism + GABAergic support; reduces CNS excitability and muscle tension',
    evidence: 'B – consistent benefit in older adults and those with suboptimal magnesium status; moderate in healthy populations',
    dose: '200–400 mg elemental magnesium 60–90 min before bed',
    safety: 'Well-tolerated; GI upset at high doses; avoid in severe kidney disease',
    bestFor: 'Stress-induced sleep disruption, muscle tension, waking during the night',
    href: '/compounds/magnesium-glycinate',
    badge: 'Moderate–Strong',
  },
  {
    name: 'L-Theanine',
    mechanism: 'Increases alpha-wave brain activity; modulates GABA and glutamate; reduces stress-related arousal without sedation',
    evidence: 'B – consistent evidence for relaxation and sleep quality; less data on sleep onset',
    dose: '100–200 mg taken 30–60 min before bed; often stacked with magnesium',
    safety: 'Very well-tolerated; no dependency; safe long-term',
    bestFor: 'Racing thoughts, anxiety-driven wakefulness, improving sleep quality',
    href: '/compounds/l-theanine',
    badge: 'Moderate',
  },
  {
    name: 'Melatonin',
    mechanism: 'MT1/MT2 receptor agonist in the suprachiasmatic nucleus; signals circadian "sleep phase" onset',
    evidence: 'A for jet lag and delayed sleep phase; B for general sleep onset latency',
    dose: '0.5–1 mg for circadian support; up to 3 mg for general onset — doses above 1 mg show diminishing returns in most studies',

    safety: 'Short-term: excellent. Long-term high-dose: caution; potential endogenous suppression at high doses',
    bestFor: 'Jet lag, shift work, delayed sleep phase, trouble falling asleep',
    href: '/compounds/melatonin',
    badge: 'Strong (circadian)',
  },
  {
    name: 'Ashwagandha (KSM-66)',
    mechanism: 'HPA axis modulation; cortisol reduction; GABAergic activity via withanolides',
    evidence: 'B – clinically studied extract KSM-66 shows improvements in sleep quality and anxiety in stressed populations',
    dose: '300–600 mg standardized extract (≥5% withanolides) in the evening',
    safety: 'Generally safe; rare hepatotoxicity at very high doses; caution in thyroid disorders — may raise T3/T4 levels; consult a clinician if on thyroid medication',

    bestFor: 'Stress-driven sleep problems; "wired but tired" pattern; cortisol-driven waking',
    href: '/herbs/ashwagandha',
    badge: 'Moderate',
  },
  {
    name: 'Valerian Root',
    mechanism: 'GABA-A receptor modulation via valerenic acid; mild sedative effect',
    evidence: 'C–B – mixed RCT results; preparation and standardization heavily affect outcomes',
    dose: '300–600 mg of standardized extract (0.8% valerenic acid) 30–60 min before bed',
    safety: 'Generally safe; occasional paradoxical stimulation; not for use with sedatives or alcohol; not recommended during pregnancy or for children',

    bestFor: 'Sleep onset difficulty; works best in combination with hops or lemon balm',
    href: '/herbs/valerian',
    badge: 'Emerging–Moderate',
  },
  {
    name: 'Passionflower',
    mechanism: 'Increases GABA levels; mild anxiolytic and sedative effect',
    evidence: 'C–B – small studies show reduced anxiety and improved sleep quality; limited large RCTs',
    dose: '250–500 mg extract or 1–2 cups passionflower tea before bed',
    safety: 'Well-tolerated; use caution with sedative medications',
    bestFor: 'Anxiety-related sleep disruption; mild insomnia; relaxation before bed',
    href: '/guides/passionflower',

    badge: 'Emerging',
  },
]

const STACKING_GUIDE = [
  {
    stack: 'Stress + Racing Thoughts',
    combo: 'Magnesium Glycinate 300 mg + L-Theanine 200 mg',
    notes: 'Widely used, well-tolerated. Magnesium handles muscle tension and CNS excitability; L-theanine quiets cognitive overactivation.',
  },
  {
    stack: 'Trouble Falling Asleep',
    combo: 'Melatonin 0.5–1 mg + L-Theanine 100–200 mg',
    notes: 'Melatonin sets the sleep signal; L-theanine reduces pre-sleep anxiety. Use low melatonin dose first.',
  },
  {
    stack: '"Wired but Tired" (HPA Dysregulation)',
    combo: 'Ashwagandha 300–600 mg (evening) + Magnesium Glycinate 300 mg',
    notes: 'Ashwagandha addresses cortisol-driven arousal; magnesium handles the physical tension component. Allow 4–8 weeks for full effect.',
  },
  {
    stack: 'General Sleep Quality',
    combo: 'Magnesium Glycinate 200 mg + Passionflower 250 mg',
    notes: 'Gentle herbal stack for mild insomnia without significant next-day sedation.',
  },
]

const HEADINGS: Heading[] = [
  { id: 'match', text: 'Match supplement to sleep problem', level: 2 },
  { id: 'profiles', text: 'Sleep supplement profiles', level: 2 },
  { id: 'stacking', text: 'Evidence-informed stacking guide', level: 2 },
  { id: 'mistakes', text: 'Common mistakes to avoid', level: 2 },
]

export default function BestSupplementsForSleepPage() {
  const magnesiumProducts = getRevenueProductSet('magnesium')
  const toc = <TableOfContents headings={HEADINGS} />
  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Supplements for Sleep — Evidence-Based Guide"
        description="Evidence-graded review of the best sleep supplements including magnesium glycinate, L-theanine, melatonin, ashwagandha, and valerian. Includes mechanisms, dosing, safety, and stacking recommendations."
        datePublished="2026-06-16"
        dateModified="2026-06-16"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Supplements for Sleep', href: '/guides/best-supplements-for-sleep' },
        ]}
      />

      <ArticleLayout toc={toc} zone="supplement">
      <div className="space-y-14">

        {/* Hero */}
        <section className="rounded-lg border border-brand-900/10 bg-white/85 p-6 shadow-sm sm:p-10 dark:bg-[var(--surface-card-strong)]">
          <SectionHeader
            eyebrow="Evidence-based sleep guide"
            title="Best Supplements for Sleep"
            as="h1"
          />
          <p className="mt-2 text-xs text-muted">
            Written and reviewed by{' '}
            <Link href="/author" className="font-medium text-brand-700 hover:underline">Will Thomas</Link>
            {' '}· Last updated June 2026
          </p>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Most sleep supplements are oversold. A small number have credible evidence behind them —
            and which one is right depends heavily on <em>why</em> you can't sleep. This guide covers
            the six best-supported options, their mechanisms, evidence grades, dosing context, safety
            limits, and how to combine them intelligently.
          </p>
          <MethodologyStrip
            className="mt-6"
            description="Grades reflect human clinical evidence quality (A = strong RCTs, B = moderate RCTs/mixed results, C = preliminary/traditional). All safety notes are conservative. This is educational context, not personal medical advice."
          />
        </section>

        {/* Decision Framework */}
        <section id="match" className="scroll-mt-20 space-y-4">
          <SectionHeader
            eyebrow="Start here"
            title="Match supplement to sleep problem"
            subtitle="Sleep problems are not homogeneous. A mismatch between supplement and cause is the most common reason supplements fail."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { problem: 'Trouble falling asleep', suggestion: 'Melatonin (low dose) + L-Theanine', href: '/compounds/melatonin' },
              { problem: 'Waking during the night', suggestion: 'Magnesium Glycinate + Ashwagandha (if stress-driven)', href: '/compounds/magnesium-glycinate' },
              { problem: 'Racing thoughts at bedtime', suggestion: 'L-Theanine + Passionflower', href: '/compounds/l-theanine' },
              { problem: '"Wired but tired" / cortisol issues', suggestion: 'Ashwagandha (long-term) + Magnesium', href: '/herbs/ashwagandha' },
              { problem: 'Jet lag or shift work', suggestion: 'Melatonin (timed precisely to destination)', href: '/compounds/melatonin' },
              { problem: 'Muscle tension / physical restlessness', suggestion: 'Magnesium Glycinate (evening)', href: '/compounds/magnesium-glycinate' },
            ].map((row) => (
              <BestForCard key={row.problem} title={row.problem}>
                <p className="mt-3 text-xs font-bold uppercase tracking-[0.12em] text-brand-700">Best option</p>
                <Link href={row.href} className="mt-1 block text-sm font-semibold text-brand-800 hover:underline">
                  {row.suggestion}
                </Link>
              </BestForCard>
            ))}
          </div>
        </section>

        {/* Individual profiles */}
        <section id="profiles" className="scroll-mt-20 space-y-6">
          <SectionHeader
            eyebrow="Evidence profiles"
            title="Sleep supplement profiles"
          />
          <div className="space-y-5">
            {SLEEP_SUPPLEMENTS.map((s) => (
              <ProductPickCard
                key={s.name}
                href={s.href}
                title={s.name}
                evidence={s.badge}
                mechanism={s.mechanism}
                bestFor={s.bestFor}
                dose={s.dose}
                safety={s.safety}
              >
                <div className="mt-4 rounded-lg border border-brand-900/10 bg-white/60 p-4 dark:bg-[var(--surface-subtle)]">
                  <p className="font-semibold text-ink">Evidence</p>
                  <p className="mt-1 text-sm leading-6 text-muted">{s.evidence}</p>
                </div>
              </ProductPickCard>
            ))}
          </div>
        </section>

        {/* Stacking guide */}
        <section id="stacking" className="scroll-mt-20 space-y-5">
          <SectionHeader
            eyebrow="Combinations"
            title="Evidence-informed stacking guide"
            subtitle="These combinations are commonly used, generally well-tolerated, and have mechanistic rationale. Always start with single supplements to establish your individual response first."
          />
          <div className="grid gap-4 sm:grid-cols-2">
            {STACKING_GUIDE.map((row) => (
              <ComparisonCard
                key={row.stack}
                eyebrow={row.stack}
                title={row.combo}
                description={row.notes}
              />
            ))}
          </div>
        </section>

        {/* What NOT to do */}
        <section id="mistakes" className="scroll-mt-20 space-y-4">
          <div className="flex flex-wrap items-center gap-3">
            <h2 className="text-xl font-semibold text-red-950">Common mistakes to avoid</h2>
            <SafetyBadge level="avoid" label="Safety-sensitive" />
          </div>
          <div className="grid gap-3">
            <NotBestForCard title="High-dose melatonin" description="More is not better — 0.5 mg is often as effective as 10 mg for circadian support with fewer side effects." />
            <NotBestForCard title="Random stacking" description="Adding 4–5 supplements without identifying your root sleep problem. Start with one." />
            <NotBestForCard title="Expecting instant valerian effects" description="Valerian takes 2–4 weeks of consistent use in many studies." />
            <NotBestForCard title="Using sleep supplements as a substitute for sleep hygiene" description="No supplement compensates for screen exposure before bed, inconsistent schedules, or caffeine after noon." />
            <NotBestForCard title="Ignoring magnesium form" description="Magnesium oxide is cheap but poorly absorbed. Glycinate or L-threonate for sleep/cognition." />
          </div>
        </section>

        {magnesiumProducts && (
          <RecommendationSection products={magnesiumProducts.products} />
        )}

        {/* Related */}
        <nav className="grid gap-3 sm:grid-cols-2" aria-label="Related sleep guides">
          <InternalLinkCard href="/guides/magnesium-vs-melatonin" title="Magnesium vs Melatonin" />
          <InternalLinkCard href="/compare/sleep-herbs-vs-melatonin" title="Sleep Herbs vs Melatonin" />
          <InternalLinkCard href="/guides/magnesium-for-sleep" title="Magnesium for Sleep Guide" />
          <InternalLinkCard href="/compare/magnesium-glycinate-vs-l-threonate-for-sleep" title="Glycinate vs L-Threonate" />
          <InternalLinkCard href="/guides" title="All Guides" />
        </nav>
      </div>
      </ArticleLayout>
    </>
  )
}
