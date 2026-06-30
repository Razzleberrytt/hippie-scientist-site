import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'
import { ArticleLayout, TableOfContents } from '@/components/articles'
import type { Heading } from '@/components/articles'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

const PAGE_URL = `${SITE_URL}/guides/best-adaptogens-for-stress`

export const metadata: Metadata = {
  title: 'Best Adaptogens for Stress — Evidence-Based Guide',
  description:
    'Evidence-graded guide to the best adaptogens for stress: ashwagandha, rhodiola, eleuthero, schisandra, and holy basil. How adaptogens work, key differences, dosing, and safety.',
  alternates: { canonical: '/guides/best-adaptogens-for-stress/' },
  openGraph: {
    title: 'Best Adaptogens for Stress — Evidence-Based Guide',
    description:
      'Which adaptogens actually work for stress? Ashwagandha, rhodiola, eleuthero, schisandra — evidence-graded with honest assessments of mechanisms, dosing, and safety.',
    url: '/guides/best-adaptogens-for-stress/',
    type: 'article',
    images: ['/og-default.jpg'],
  },
}

const ADAPTOGENS = [
  {
    name: 'Ashwagandha (Withania somnifera)',
    origin: 'Ayurvedic medicine',
    primaryAction: 'HPA axis regulator — reduces cortisol and stress reactivity',
    mechanism: 'Withanolides modulate cortisol synthesis; GABAergic activity; NF-κB anti-inflammatory; thyroid-stimulating effects in some models',
    evidence: 'B–A — strongest clinical evidence of any adaptogen; KSM-66 shows significant cortisol reduction and PSS score improvements in multiple double-blind RCTs',
    dose: '300–600 mg/day (KSM-66 or Sensoril standardized extract); best taken evening for sleep benefit or morning for cortisol regulation',
    timeline: '4–8 weeks for full benefit',
    safety: 'Generally safe; rare hepatotoxicity at very high doses; caution with thyroid disease, immunosuppressants',
    bestFor: 'Chronic stress, burnout, HPA dysregulation, "wired but tired" pattern',
    href: '/herbs/ashwagandha',
    badge: 'Moderate–Strong',
  },
  {
    name: 'Rhodiola Rosea',
    origin: 'Scandinavian and Russian traditional medicine',
    primaryAction: 'Stress performance enhancer — boosts resilience and reduces fatigue',
    mechanism: 'Salidroside and rosavins activate AMPK; modulate serotonin, norepinephrine, dopamine; upregulate heat shock proteins and anti-fatigue enzymes',
    evidence: 'B — RCTs show reduced mental fatigue, improved cognitive performance under stress, and mood improvements; strongest effects in high-stress/demanding conditions',
    dose: '200–400 mg (≥3% rosavins, ≥1% salidroside) in the morning or before demanding tasks',
    timeline: 'Some benefit acute; sustained benefit after 2–4 weeks',
    safety: 'Well-tolerated; activating — can disrupt sleep if taken late; rare GI effects',
    bestFor: 'Stress-driven fatigue, performance under pressure, cognitive stress resilience',
    href: '/herbs/rhodiola',
    badge: 'Moderate',
  },
  {
    name: 'Eleuthero (Eleutherococcus senticosus)',
    origin: 'Russian and Chinese traditional medicine; "Siberian ginseng"',
    primaryAction: 'Non-specific stress resistance enhancer',
    mechanism: 'Eleutherosides modulate stress hormones; adaptogenic via HPA and sympathetic nervous system; mild immunomodulatory',
    evidence: 'C–B — earlier Soviet military research (methodologically weak); some modern RCTs show anti-fatigue effects; less studied than ashwagandha or rhodiola',
    dose: '300–1200 mg root extract; often cycled (6 weeks on, 2 weeks off)',
    timeline: '2–4 weeks',
    safety: 'Generally safe; may interact with digoxin and some medications; avoid with high blood pressure',
    bestFor: 'General stress resistance; physical endurance support; as part of adaptogen rotation',
    href: '/herbs/eleuthero',
    badge: 'Emerging–Moderate',
  },
  {
    name: 'Schisandra Berry (Schisandra chinensis)',
    origin: 'Traditional Chinese medicine',
    primaryAction: 'Hepatoprotective adaptogen with stress and fatigue modulation',
    mechanism: 'Schisandrins modulate cortisol, liver enzymes, and mitochondrial function; antioxidant; adaptogenic via HPA axis regulation',
    evidence: 'C — limited high-quality human RCTs; animal studies positive; some human data on physical performance and cortisol; used clinically in TCM',
    dose: '500–2000 mg dried fruit extract; often as part of formula',
    timeline: '4–8 weeks',
    safety: 'Generally safe; may interact with CYP3A4-metabolized drugs (weak inhibitor); avoid in epilepsy',
    bestFor: 'Liver support + stress overlap; TCM-oriented protocols; as part of formula',
    href: '/herbs/schisandra',
    badge: 'Emerging',
  },
  {
    name: 'Holy Basil (Ocimum sanctum / Tulsi)',
    origin: 'Ayurvedic medicine',
    primaryAction: 'Adaptogen with anxiety-reducing and anti-inflammatory profile',
    mechanism: 'Eugenol and ursolic acid modulate COX-2; adaptogenic via cortisol modulation; anxiolytic via GABAergic and serotonergic pathways; blood sugar modulation',
    evidence: 'C–B — small RCTs show reduced anxiety and cognitive stress; anti-inflammatory markers; well-tolerated; limited high-powered trials',
    dose: '300–600 mg leaf extract (2.5% ursolic acid) twice daily with food; also consumed as tea',
    timeline: '4–6 weeks',
    safety: 'Very well-tolerated; may modulate blood sugar (monitor if diabetic); mild anticoagulant effect',
    bestFor: 'Mild anxiety + stress; Ayurvedic contexts; blood sugar-stress overlap',
    href: '/herbs/holy-basil',
    badge: 'Emerging–Moderate',
  },
]

const HEADINGS: Heading[] = [
  { id: 'glance', text: 'Adaptogen at a glance', level: 2 },
  { id: 'profiles', text: 'Adaptogen profiles', level: 2 },
  { id: 'stacking', text: 'Stacking adaptogens', level: 2 },
]

export default function BestAdaptogensForStressPage() {
  const ashwagandhaProducts = getRevenueProductSet('ashwagandha')
  const toc = <TableOfContents headings={HEADINGS} />
  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Adaptogens for Stress — Evidence-Based Guide"
        description="Evidence-graded guide to the best adaptogens for stress including ashwagandha, rhodiola, eleuthero, schisandra, and holy basil. Covers mechanisms, evidence quality, dosing, timelines, and safety."
        datePublished="2026-06-16"
        dateModified="2026-06-16"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Adaptogens for Stress', href: '/guides/best-adaptogens-for-stress' },
        ]}
      />

      <ArticleLayout toc={toc} zone="supplement">
      <div className="space-y-14">

        {/* Hero */}
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Adaptogen guide</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Best Adaptogens for Stress
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            Adaptogens are a pharmacological category of plant compounds that increase non-specific
            resistance to stress — physical, chemical, and biological. They don't eliminate stress;
            they modulate how the body responds to it. The evidence quality across the category varies
            enormously. This guide covers the five best-supported options with honest evidence grades.
          </p>
          <div className="mt-5 rounded-xl border border-brand-100 bg-brand-50/60 p-4 text-sm text-brand-900">
            <strong>Defining "adaptogen":</strong> Adaptogens must be non-toxic at normal doses,
            have a non-specific stress response, and normalize physiological function regardless of
            the direction of deviation. Not all herbs marketed as adaptogens meet this classical
            definition rigorously.
          </div>
        </section>

        {/* Fastest useful choice */}
        <section className="rounded-[1.65rem] border border-brand-700/20 bg-brand-50/60 p-6 shadow-sm">
          <p className="eyebrow-label">Fastest useful choice</p>
          <h2 className="mt-2 text-xl font-semibold tracking-tight text-ink">If you only try one thing: ashwagandha</h2>
          <p className="mt-3 text-sm leading-7 text-muted sm:text-base">
            <strong>Ashwagandha (KSM-66 or Sensoril, 300–600&nbsp;mg/day) is the fastest useful choice among adaptogens for chronic stress</strong>{' '}
            — meaning fastest in the sense of "lowest time-to-meaningful-benefit," not acute effect.
            Allow 4–8 weeks of consistent daily use. It will not lower cortisol in an hour; that is
            not how adaptogens work. If you need something for an acute stress spike, see{' '}
            <Link href="/compounds/l-theanine" className="font-semibold text-brand-700 hover:underline">
              L-theanine
            </Link>
            . For the deep dive, see the{' '}
            <Link href="/guides/herbs/ashwagandha" className="font-semibold text-brand-700 hover:underline">
              ashwagandha article
            </Link>
            .
          </p>
        </section>

        {/* Quick comparison */}
        <section id="glance" className="scroll-mt-20 space-y-4">
          <p className="eyebrow-label">Quick comparison</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">Adaptogen at a glance</h2>
          <div className="overflow-x-auto rounded-[1.65rem] border border-brand-900/10 bg-white shadow-sm">
            <table className="min-w-[700px] w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-brand-900/10 bg-brand-50/50">
                  <th className="text-left p-4 font-semibold text-ink">Adaptogen</th>
                  <th className="text-left p-4 font-semibold text-ink">Primary action</th>
                  <th className="text-left p-4 font-semibold text-ink">Evidence</th>
                  <th className="text-left p-4 font-semibold text-ink">Timeline</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                {ADAPTOGENS.map((a) => (
                  <tr key={a.name}>
                    <td className="p-4 font-medium text-ink">{a.name.split(' (')[0]}</td>
                    <td className="p-4 text-muted">{a.primaryAction}</td>
                    <td className="p-4">
                      <span className="rounded-full bg-brand-50 px-2 py-0.5 text-xs font-semibold text-brand-800">{a.badge}</span>
                    </td>
                    <td className="p-4 text-muted">{a.timeline}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Detailed profiles */}
        <section id="profiles" className="scroll-mt-20 space-y-6">
          <div>
            <p className="eyebrow-label">Evidence profiles</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">Adaptogen profiles</h2>
          </div>
          <div className="space-y-5">
            {ADAPTOGENS.map((a) => (
              <div key={a.name} className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <Link href={a.href} className="text-xl font-semibold text-brand-800 hover:underline">{a.name}</Link>
                    <p className="mt-0.5 text-xs text-muted">{a.origin}</p>
                  </div>
                  <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">{a.badge}</span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <div><p className="font-semibold text-ink">Mechanism</p><p className="mt-0.5 text-muted">{a.mechanism}</p></div>
                  <div><p className="font-semibold text-ink">Best for</p><p className="mt-0.5 text-muted">{a.bestFor}</p></div>
                  <div><p className="font-semibold text-ink">Evidence</p><p className="mt-0.5 text-muted">{a.evidence}</p></div>
                  <div><p className="font-semibold text-ink">Typical dose</p><p className="mt-0.5 text-muted">{a.dose}</p></div>
                  <div className="sm:col-span-2"><p className="font-semibold text-ink">Safety</p><p className="mt-0.5 text-muted">{a.safety}</p></div>
                </div>
                <Link href={a.href} className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline">Full profile →</Link>
              </div>
            ))}
          </div>
        </section>

        {/* Combination guidance */}
        <section id="stacking" className="scroll-mt-20 rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm space-y-4">
          <h2 className="text-xl font-semibold text-ink">Stacking adaptogens: principles</h2>
          <ul className="space-y-2 text-sm text-muted">
            <li>• <strong>Don't stack without a reason:</strong> Ashwagandha alone is often sufficient for chronic stress; adding rhodiola is only additive if there's also acute fatigue or performance stress.</li>
            <li>• <strong>Ashwagandha + Rhodiola</strong> is the most commonly used combination and is mechanistically complementary (HPA axis regulation + anti-fatigue). Well-tolerated.</li>
            <li>• <strong>Cycling:</strong> Some practitioners cycle adaptogens (6 weeks on, 1–2 weeks off) but evidence for this is largely traditional, not clinical.</li>
            <li>• <strong>Standardization:</strong> Two "ashwagandha" products can be 5–10× different in withanolide content. Always check the standardized extract label.</li>
          </ul>
        </section>

        {/* Safety */}
        <section className="rounded-[1.65rem] border border-amber-200 bg-amber-50/70 p-6 shadow-sm">
          <p className="eyebrow-label">Safety &amp; medication notes</p>
          <h2 className="mt-2 text-xl font-semibold text-amber-900">Before you start an adaptogen</h2>
          <ul className="mt-3 space-y-2 text-sm text-amber-900">
            <li>• <strong>Pregnancy &amp; breastfeeding:</strong> avoid ashwagandha, and treat most adaptogens as not established as safe without clinician guidance.</li>
            <li>• <strong>Ashwagandha:</strong> rare hepatotoxicity reported; caution with thyroid disease, autoimmune conditions, and immunosuppressants.</li>
            <li>• <strong>Rhodiola:</strong> activating — may worsen insomnia or agitation, caution in bipolar disorder, and possible interaction with antidepressants.</li>
            <li>• <strong>Eleuthero</strong> may raise blood pressure and interact with digoxin; <strong>schisandra</strong> can affect CYP3A4-metabolized drugs; <strong>holy basil</strong> may lower blood sugar.</li>
            <li>• If you take medication for blood pressure, mood, thyroid, or blood sugar, confirm compatibility before starting.</li>
          </ul>
        </section>

        {ashwagandhaProducts && (
          <RecommendationSection products={ashwagandhaProducts.products} />
        )}

        {/* Related */}
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
          <Link href="/guides/anxiety" className="hover:text-brand-800">Stress goal hub →</Link>
          <Link href="/guides/herbs/ashwagandha" className="hover:text-brand-800">Ashwagandha Article →</Link>
          <Link href="/guides/best-supplements-for-stress" className="hover:text-brand-800">Best Supplements for Stress →</Link>
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
