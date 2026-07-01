import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'
import AffiliateDisclosure from '@/components/AffiliateDisclosure'
import EmailCapture from '@/components/EmailCapture'

const PAGE_URL = `${SITE_URL}/guides/anxiety/best-supplements-for-stress`

export const metadata: Metadata = {
  title: 'Best Supplements for Stress: Ashwagandha, Rhodiola, Magnesium & More',
  description:
    'Evidence-graded review of the best stress supplements: ashwagandha, rhodiola, phosphatidylserine, magnesium, and L-theanine. Mechanisms, dosing, safety, and when each works.',
  alternates: { canonical: '/guides/anxiety/best-supplements-for-stress/' },
  openGraph: {
    title: 'Best Supplements for Stress: Ashwagandha, Rhodiola, Magnesium & More',
    description:
      'Which supplements actually reduce stress? Ashwagandha, rhodiola, magnesium, phosphatidylserine — evidence-graded with dosing, safety, and stacking notes.',
    url: '/guides/anxiety/best-supplements-for-stress/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const STRESS_SUPPLEMENTS = [
  {
    name: 'Ashwagandha (KSM-66 / Sensoril)',
    mechanism: 'Withanolides regulate the HPA axis; reduce cortisol (measured) and DHEA-S ratios; GABAergic activity promotes relaxation; anti-inflammatory via NF-κB pathway',
    evidence: 'B–A — multiple double-blind RCTs; KSM-66 specifically shows significant reductions in serum cortisol and PSS scores in stressed adults',
    dose: '300–600 mg standardized extract (KSM-66 ≥5% withanolides or Sensoril ≥10%) — morning or evening; allow 4–8 weeks',
    safety: 'Generally well-tolerated; rare liver injury has been reported; use caution with thyroid medications, immunosuppressants, pregnancy, or autoimmune conditions',
    bestFor: 'Chronic psychological stress; HPA dysregulation; cortisol-driven sleep disruption; sustained adaptogen strategy',
    href: '/guides/herbs/ashwagandha',
    badge: 'Moderate–Strong',
  },
  {
    name: 'Rhodiola Rosea',
    mechanism: 'Salidroside and rosavins activate AMPK; modulate serotonin, norepinephrine, and dopamine; reduce cortisol and stress-induced fatigue; upregulate heat shock proteins',
    evidence: 'B — RCTs show improved stress resilience, reduced mental fatigue, and improved mood under demanding conditions',
    dose: '200–400 mg (≥3% rosavins, ≥1% salidroside) in the morning, before stressful events or before training',
    safety: 'Well-tolerated; stimulating — may disrupt sleep if taken late; rare GI effects',
    bestFor: 'Acute stress performance; mental fatigue from sustained demands; cognitive performance under stress',
    href: '/herbs/rhodiola',
    badge: 'Moderate',
  },
  {
    name: 'Phosphatidylserine (PS)',
    mechanism: 'Structural phospholipid supporting neuronal membrane function; blunts cortisol response to exercise and psychological stress; modulates HPA signaling',
    evidence: 'B — RCTs show cortisol blunting and mood improvements under exercise/psychological stress; well-documented in exercise performance literature',
    dose: '100–400 mg/day (sunflower-derived preferred); effects build over 4–6 weeks',
    safety: 'Generally well-tolerated; choose sunflower-derived over bovine-derived; use normal caution with medications or health conditions',
    bestFor: 'Exercise-induced stress; cortisol-sensitive individuals; cognitive stress response',
    href: '/compounds/phosphatidylserine',
    badge: 'Moderate',
  },
  {
    name: 'Magnesium Glycinate',
    mechanism: 'NMDA receptor antagonism reduces CNS excitability; supports GABAergic inhibition; cofactor for 300+ enzymatic reactions including cortisol synthesis and HPA regulation',
    evidence: 'B — magnesium deficiency (common in stressed populations) amplifies stress responses; supplementation in deficient individuals consistently reduces stress markers',
    dose: '200–400 mg elemental magnesium (glycinate form) in the evening; builds over weeks',
    safety: 'Generally well-tolerated; GI loose stools at high doses; avoid high-dose magnesium in severe kidney disease unless supervised',
    bestFor: 'Stress + sleep overlap; muscle tension from stress; magnesium-insufficient individuals',
    href: '/compounds/magnesium-glycinate',
    badge: 'Moderate',
  },
  {
    name: 'L-Theanine',
    mechanism: 'Increases alpha brain wave activity; modulates GABA, glutamate, and glycine; reduces physiological stress arousal without causing sedation at typical doses',
    evidence: 'B — multiple RCTs showing reduced salivary cortisol, heart rate, and self-reported stress; acute and sustained effects',
    dose: '100–200 mg as needed or daily; can be combined with caffeine (2:1 theanine:caffeine ratio)',
    safety: 'Generally well-tolerated; use extra caution with sedatives, blood pressure medication, pregnancy/breastfeeding, or psychiatric medication',
    bestFor: 'Acute situational stress; stress-related cognitive impairment; daily background stress reduction',
    href: '/guides/herbs/l-theanine',
    badge: 'Moderate',
  },
]

const HEADINGS: Heading[] = [
  { id: 'stress-pattern', text: 'Choose by stress pattern', level: 2 },
  { id: 'profiles', text: 'Supplement profiles', level: 2 },
  { id: 'stacks', text: 'Recommended stacks', level: 2 },
]

export default function BestSupplementsForStressPage() {
  const toc = <TableOfContents headings={HEADINGS} />
  const ashwagandhaProducts = getRevenueProductSet('ashwagandha')
  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Supplements for Stress: Ashwagandha, Rhodiola, Magnesium & More"
        description="Evidence-graded guide to the best supplements for stress including ashwagandha, rhodiola, phosphatidylserine, magnesium, and L-theanine. Mechanisms, dosing, safety, and stacking."
        datePublished="2026-06-16"
        dateModified="2026-06-26"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Supplements for Stress', href: '/guides/anxiety/best-supplements-for-stress' },
        ]}
      />

      <ArticleLayout toc={toc} zone="supplement">
      <div className="space-y-14">
        <AffiliateDisclosure variant="compact" className="mb-6" />

        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Stress supplements guide</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Best Supplements for Stress
          </h1>
          <p className="mt-2 text-xs text-muted">Last updated June 26, 2026</p>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Stress supplements are only useful when matched to the type of stress and the mechanism
            driving it. Chronic HPA dysregulation requires a different intervention than acute
            situational stress or exercise-induced cortisol spikes. This guide covers five
            evidence-backed options with honest assessments of what each actually does — and when
            each is the better choice.
          </p>
          <div className="mt-6 rounded-xl border border-brand-900/10 bg-brand-50 p-4 text-sm text-brand-950">
            <strong>Fastest useful choice:</strong> for chronic daily stress, start with{' '}
            <Link href="/guides/herbs/ashwagandha" className="font-semibold text-brand-800 hover:underline">ashwagandha</Link>;
            for pressure and fatigue, compare{' '}
            <Link href="/herbs/rhodiola" className="font-semibold text-brand-800 hover:underline">rhodiola</Link>;
            for acute stress without sedation, start with{' '}
            <Link href="/guides/herbs/l-theanine" className="font-semibold text-brand-800 hover:underline">L-theanine</Link>.
          </div>
        </section>

        {/* Type of stress framework */}
        <section id="stress-pattern" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Match to stress type</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Choose by stress pattern</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { type: 'Chronic daily stress / burnout', best: 'Ashwagandha (HPA regulation)', href: '/guides/herbs/ashwagandha' },
              { type: 'Stress-impaired performance', best: 'Rhodiola (acute stress resilience)', href: '/herbs/rhodiola' },
              { type: 'Exercise-induced cortisol spike', best: 'Phosphatidylserine (blunts cortisol response)', href: '/compounds/phosphatidylserine' },
              { type: 'Stress + poor sleep', best: 'Magnesium Glycinate (evening)', href: '/compounds/magnesium-glycinate' },
              { type: 'Acute situational anxiety/stress', best: 'L-Theanine (fast-acting, no sedation)', href: '/guides/herbs/l-theanine' },
              { type: '"Wired but tired" pattern', best: 'Ashwagandha + Magnesium stack', href: '/guides/rhodiola-sleep-stack' },
            ].map((row) => (
              <div key={row.type} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Stress pattern</p>
                <p className="mt-1 text-sm font-semibold text-ink">{row.type}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-700">Best choice</p>
                <Link href={row.href} className="mt-1 block text-sm font-medium text-brand-800 hover:underline">{row.best}</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Profiles */}
        <section id="profiles" className="scroll-mt-20 space-y-6">
          <div>
            <p className="eyebrow-label">Evidence profiles</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Supplement profiles</h2>
          </div>
          <div className="space-y-5">
            {STRESS_SUPPLEMENTS.map((s) => (
              <div key={s.name} className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link href={s.href} className="text-xl font-semibold text-brand-800 hover:underline">{s.name}</Link>
                  <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">{s.badge}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <div><p className="font-semibold text-ink">Mechanism</p><p className="mt-0.5 text-muted">{s.mechanism}</p></div>
                  <div><p className="font-semibold text-ink">Best for</p><p className="mt-0.5 text-muted">{s.bestFor}</p></div>
                  <div><p className="font-semibold text-ink">Evidence</p><p className="mt-0.5 text-muted">{s.evidence}</p></div>
                  <div><p className="font-semibold text-ink">Typical dose</p><p className="mt-0.5 text-muted">{s.dose}</p></div>
                  <div className="sm:col-span-2"><p className="font-semibold text-ink">Safety</p><p className="mt-0.5 text-muted">{s.safety}</p></div>
                </div>
                <Link href={s.href} className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline">Full profile →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Key stacks */}
        <section id="stacks" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Combinations</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Recommended stacks</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { goal: 'Chronic stress foundation', combo: 'Ashwagandha 600 mg + Magnesium Glycinate 300 mg', note: 'HPA axis + downstream relaxation. Most comprehensive chronic stress stack. 8+ weeks.' },
              { goal: 'High-performance under pressure', combo: 'Rhodiola 200 mg (AM) + L-Theanine 200 mg (as needed)', note: 'Rhodiola for acute stress resilience; theanine for real-time stress buffering without sedation.' },
              { goal: 'Stress + cognitive impairment', combo: 'Ashwagandha 300 mg + Phosphatidylserine 200 mg + Citicoline 250 mg', note: 'Addresses both HPA dysregulation and cognitive stress response. Long-term strategy.' },
              { goal: 'Stress + sleep disruption', combo: 'Ashwagandha 300 mg (PM) + Magnesium Glycinate 400 mg (PM)', note: 'Evening dosing targets the nighttime cortisol elevation pattern. Allow 4–8 weeks.' },
            ].map((s) => (
              <div key={s.goal} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{s.goal}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{s.combo}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{s.note}</p>
              </div>
            ))}
          </div>
        </section>

        {ashwagandhaProducts && (
          <RecommendationSection products={ashwagandhaProducts.products} />
        )}

        <EmailCapture location="guides-best-supplements-for-stress" className="mt-6" />

        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
          <Link href="/guides/herbs/ashwagandha" className="hover:text-brand-800">Ashwagandha Evidence Guide →</Link>
          <Link href="/guides/herbs/l-theanine" className="hover:text-brand-800">L-Theanine for Acute Stress →</Link>
          <Link href="/guides/how-to-lower-cortisol-naturally" className="hover:text-brand-800">How to Lower Cortisol Naturally →</Link>
          <Link href="/guides/compare/rhodiola-vs-ashwagandha" className="hover:text-brand-800">Rhodiola vs Ashwagandha →</Link>
          <Link href="/guides/rhodiola-complete-guide" className="hover:text-brand-800">Complete Rhodiola Guide →</Link>
          <Link href="/guides/" className="hover:text-brand-800">All Guides →</Link>
        </nav>
      </div>
      </ArticleLayout>
    </>
  )
}
