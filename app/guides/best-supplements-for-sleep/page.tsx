import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

const PAGE_URL = `${SITE_URL}/guides/best-supplements-for-sleep`

export const metadata: Metadata = {
  title: 'Best Supplements for Sleep — Evidence-Based Guide',
  description:
    'Evidence-graded review of the best sleep supplements: magnesium glycinate, L-theanine, melatonin, valerian, ashwagandha, and more. Mechanisms, dosing, safety, and decision framework.',
  alternates: { canonical: '/guides/best-supplements-for-sleep' },
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
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Evidence-based sleep guide</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Best Supplements for Sleep
          </h1>
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
          <div className="mt-6 rounded-xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-900">
            <strong>Evidence approach:</strong> Grades reflect human clinical evidence quality (A = strong
            RCTs, B = moderate RCTs/mixed results, C = preliminary/traditional). All safety notes are
            conservative. This is educational context, not personal medical advice.
          </div>
        </section>

        {/* Decision Framework */}
        <section id="match" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Start here</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Match supplement to sleep problem
          </h2>
          <p className="text-sm text-muted">
            Sleep problems are not homogeneous. A mismatch between supplement and cause is the most
            common reason supplements fail.
          </p>
          <div className="grid gap-4 sm:grid-cols-2">
            {[
              { problem: 'Trouble falling asleep', suggestion: 'Melatonin (low dose) + L-Theanine', href: '/compounds/melatonin' },
              { problem: 'Waking during the night', suggestion: 'Magnesium Glycinate + Ashwagandha (if stress-driven)', href: '/compounds/magnesium-glycinate' },
              { problem: 'Racing thoughts at bedtime', suggestion: 'L-Theanine + Passionflower', href: '/compounds/l-theanine' },
              { problem: '"Wired but tired" / cortisol issues', suggestion: 'Ashwagandha (long-term) + Magnesium', href: '/herbs/ashwagandha' },
              { problem: 'Jet lag or shift work', suggestion: 'Melatonin (timed precisely to destination)', href: '/compounds/melatonin' },
              { problem: 'Muscle tension / physical restlessness', suggestion: 'Magnesium Glycinate (evening)', href: '/compounds/magnesium-glycinate' },
            ].map((row) => (
              <div key={row.problem} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-semibold uppercase tracking-wider text-muted">Problem</p>
                <p className="mt-1 text-sm font-semibold text-ink">{row.problem}</p>
                <p className="mt-2 text-xs font-bold uppercase tracking-wider text-brand-700">Best option</p>
                <Link href={row.href} className="mt-1 block text-sm font-medium text-brand-800 hover:underline">
                  {row.suggestion}
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Individual profiles */}
        <section id="profiles" className="scroll-mt-20 space-y-6">
          <div>
            <p className="eyebrow-label">Evidence profiles</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Sleep supplement profiles
            </h2>
          </div>
          <div className="space-y-5">
            {SLEEP_SUPPLEMENTS.map((s) => (
              <div key={s.name} className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link href={s.href} className="text-xl font-semibold text-brand-800 hover:underline">
                    {s.name}
                  </Link>
                  <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">
                    {s.badge}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="font-semibold text-ink">Mechanism</p>
                    <p className="mt-0.5 text-muted">{s.mechanism}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Best for</p>
                    <p className="mt-0.5 text-muted">{s.bestFor}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Evidence</p>
                    <p className="mt-0.5 text-muted">{s.evidence}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Typical dose</p>
                    <p className="mt-0.5 text-muted">{s.dose}</p>
                  </div>
                  <div className="sm:col-span-2">
                    <p className="font-semibold text-ink">Safety</p>
                    <p className="mt-0.5 text-muted">{s.safety}</p>
                  </div>
                </div>
                <Link href={s.href} className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline">
                  Full profile →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* Stacking guide */}
        <section id="stacking" className="scroll-mt-20 space-y-5">
          <div>
            <p className="eyebrow-label">Combinations</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Evidence-informed stacking guide
            </h2>
            <p className="mt-2 text-sm text-muted">
              These combinations are commonly used, generally well-tolerated, and have mechanistic rationale.
              Always start with single supplements to establish your individual response first.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {STACKING_GUIDE.map((row) => (
              <div key={row.stack} className="rounded-2xl border border-brand-900/10 bg-white/90 p-5 shadow-sm">
                <p className="text-xs font-bold uppercase tracking-wider text-brand-700">{row.stack}</p>
                <p className="mt-2 text-sm font-semibold text-ink">{row.combo}</p>
                <p className="mt-2 text-xs leading-relaxed text-muted">{row.notes}</p>
              </div>
            ))}
          </div>
        </section>

        {/* What NOT to do */}
        <section id="mistakes" className="scroll-mt-20 rounded-[1.65rem] border border-red-100 bg-red-50/60 p-6 space-y-3">
          <h2 className="text-xl font-semibold text-red-900">Common mistakes to avoid</h2>
          <ul className="space-y-2 text-sm text-red-800">
            <li>• <strong>High-dose melatonin:</strong> More is not better — 0.5 mg is often as effective as 10 mg for circadian support with fewer side effects.</li>
            <li>• <strong>Random stacking:</strong> Adding 4–5 supplements without identifying your root sleep problem. Start with one.</li>
            <li>• <strong>Expecting instant valerian effects:</strong> Valerian takes 2–4 weeks of consistent use in many studies.</li>
            <li>• <strong>Using sleep supplements as a substitute for sleep hygiene:</strong> No supplement compensates for screen exposure before bed, inconsistent schedules, or caffeine after noon.</li>
            <li>• <strong>Ignoring magnesium form:</strong> Magnesium oxide is cheap but poorly absorbed. Glycinate or L-threonate for sleep/cognition.</li>
          </ul>
        </section>

        {magnesiumProducts && (
          <RecommendationSection products={magnesiumProducts.products} />
        )}

        {/* Related */}
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
          <Link href="/guides/magnesium-vs-melatonin" className="hover:text-brand-800">Magnesium vs Melatonin →</Link>
          <Link href="/compare/sleep-herbs-vs-melatonin" className="hover:text-brand-800">Sleep Herbs vs Melatonin →</Link>
          <Link href="/guides/magnesium-for-sleep" className="hover:text-brand-800">Magnesium for Sleep Guide →</Link>
          <Link href="/compare/magnesium-glycinate-vs-l-threonate-for-sleep" className="hover:text-brand-800">Glycinate vs L-Threonate →</Link>
          <Link href="/guides" className="hover:text-brand-800">All Guides →</Link>
        </nav>
      </div>
      </ArticleLayout>
    </>
  )
}
