import type { Metadata } from 'next'
import Link from 'next/link'
import StructuredData from '@/components/StructuredData'
import { SITE_URL } from '@/lib/navigation-config'

const PAGE_URL = `${SITE_URL}/guides/best-herbs-for-anxiety`

export const metadata: Metadata = {
  title: 'Best Herbs for Anxiety — Evidence-Based Guide',
  description:
    'Evidence-graded review of the best herbs for anxiety: ashwagandha, kava, passionflower, lemon balm, valerian, and lavender. Mechanisms, dosing, safety, drug interactions, and decision framework.',
  alternates: { canonical: '/guides/best-herbs-for-anxiety' },
  openGraph: {
    title: 'Best Herbs for Anxiety — Evidence-Based Guide',
    description:
      'Which herbs actually help with anxiety? Ashwagandha, kava, passionflower, lemon balm — evidence-graded with dosing, safety, and interaction warnings.',
    url: '/guides/best-herbs-for-anxiety',
    type: 'article',
  },
}

const ANXIETY_HERBS = [
  {
    name: 'Ashwagandha (KSM-66)',
    mechanism: 'HPA axis regulation; cortisol reduction via withanolides; GABAergic modulation; anti-inflammatory effects on stress pathways',
    evidence: 'B — multiple RCTs show statistically significant reductions in perceived stress (PSS) and cortisol in stressed, non-clinical populations',
    dose: '300–600 mg standardized extract (≥5% withanolides) once or twice daily; effects emerge over 4–8 weeks',
    safety: 'Generally safe; very rare hepatotoxicity at high doses; caution with thyroid medications and immunosuppressants',
    bestFor: 'Chronic stress-related anxiety, HPA dysregulation, generalized anxiety in healthy adults',
    href: '/herbs/ashwagandha',
    badge: 'Moderate–Strong',
    interactions: 'Thyroid meds, sedatives, immunosuppressants',
  },
  {
    name: 'Kava (Piper methysticum)',
    mechanism: 'Kavalactones modulate GABA-A receptors; reduce limbic system excitability; non-sedating anxiolytic effect at moderate doses',
    evidence: 'B — Cochrane review (2003) found significant benefit for GAD; aqueous extracts safer than ethanolic',
    dose: '70–250 mg kavalactones per dose, 1–3× daily using aqueous (water-based) extract only',
    safety: 'CAUTION — rare but serious hepatotoxicity risk with ethanolic/acetone extracts and daily high-dose use; avoid with alcohol, liver disease, medications metabolized by CYP1A2/2D6/3A4',
    bestFor: 'Acute anxiety relief; social anxiety; short-term episodic use only',
    href: '/guides/kava',
    badge: 'Moderate (with significant safety caveats)',
    interactions: 'Alcohol, benzodiazepines, antidepressants, hepatotoxic drugs',
  },
  {
    name: 'Passionflower',
    mechanism: 'Increases brain GABA levels; mild MAOI activity; flavonoids (chrysin) have anxiolytic properties',
    evidence: 'C–B — small RCTs comparable to oxazepam for GAD; limited large studies',
    dose: '250–500 mg extract or 1–2 cups tea, taken 30–60 min before stressful events or at bedtime',
    safety: 'Well-tolerated; mild sedation possible; use caution with sedatives and anticoagulants',
    bestFor: 'Mild to moderate anxiety; anxiety + sleep overlap; episodic situational anxiety',
    href: '/herbs/passionflower',
    badge: 'Emerging–Moderate',
    interactions: 'Sedatives, anticoagulants (theoretical)',
  },
  {
    name: 'Lemon Balm (Melissa officinalis)',
    mechanism: 'GABA-T inhibition (increases GABA); mild acetylcholinesterase inhibition; rosmarinic acid with anxiolytic effects',
    evidence: 'C — small positive RCTs for anxiety and mood; generally used in combination with valerian',
    dose: '300–600 mg standardized extract (≥5% rosmarinic acid); often combined with valerian',
    safety: 'Very safe; mild sedation at high doses; may alter thyroid hormone levels with high long-term use',
    bestFor: 'Mild anxiety; anxiety + cognitive fog overlap; combination with valerian for sleep-anxiety',
    href: '/herbs/melissa-officinalis',
    badge: 'Emerging',
    interactions: 'Thyroid medications (theoretical at high doses)',
  },
  {
    name: 'Lavender (Silexan)',
    mechanism: 'Calcium channel modulation by linalool and linalool acetate; reduces 5-HT1A serotonin reuptake; limbic system effects',
    evidence: 'B — oral Silexan (80 mg lavender oil) has RCT evidence comparable to lorazepam 0.5 mg for GAD',
    dose: 'Oral Silexan 80 mg/day (standardized lavender oil capsules); 6–10 week trials',
    safety: 'Safe orally at studied doses; avoid raw lavender oil orally (different composition)',
    bestFor: 'Generalized anxiety; when pharmaceutical anxiolytics are not appropriate',
    href: '/compounds/lavender',
    badge: 'Moderate',
    interactions: 'Sedatives (additive effect)',
  },
]

const HERB_CHOICE_FRAMEWORK = [
  { scenario: 'Chronic daily anxiety / stress', recommendation: 'Ashwagandha (long-term, 8+ weeks)', note: 'Addresses root HPA dysregulation rather than just symptoms' },
  { scenario: 'Acute / situational anxiety', recommendation: 'Passionflower or Lavender (Silexan)', note: 'Faster onset, better for episodic use' },
  { scenario: 'Anxiety + sleep disruption', recommendation: 'Passionflower + Magnesium Glycinate', note: 'Addresses both arms without heavy sedation' },
  { scenario: 'Social anxiety (short-term use only)', recommendation: 'Kava (aqueous extract, low dose)', note: 'Effective but significant safety caveats; not for daily long-term use' },
  { scenario: 'Mild anxiety + brain fog', recommendation: 'Lemon Balm + Ashwagandha', note: 'Lemon balm offers mild cognitive support alongside anxiolysis' },
]

export default function BestHerbsForAnxietyPage() {
  return (
    <>
      <StructuredData
        pageUrl={PAGE_URL}
        headline="Best Herbs for Anxiety — Evidence-Based Guide"
        description="Evidence-graded guide to the best herbs for anxiety including ashwagandha, kava, passionflower, lemon balm, and lavender. Covers mechanisms, evidence quality, dosing, safety, and drug interactions."
        datePublished="2026-06-16"
        dateModified="2026-06-16"
        breadcrumbs={[
          { label: 'Home', href: '/' },
          { label: 'Guides', href: '/guides' },
          { label: 'Best Herbs for Anxiety', href: '/guides/best-herbs-for-anxiety' },
        ]}
      />

      <div className="mx-auto max-w-4xl space-y-14 px-4 pb-16 pt-8 sm:px-6 lg:px-8">

        {/* Hero */}
        <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10">
          <p className="eyebrow-label">Anxiety herb guide</p>
          <h1 className="mt-3 text-3xl font-bold tracking-tight text-ink sm:text-4xl">
            Best Herbs for Anxiety
          </h1>
          <p className="mt-4 text-sm leading-7 text-muted sm:text-base">
            The herbal anxiety market is enormous and mostly noise. A handful of plants have credible
            clinical evidence — but they work via different mechanisms, at different timescales, and
            with very different safety profiles. This guide covers the five best-supported options
            honestly: what they do, what the evidence actually shows, who they are appropriate for,
            and when they are not.
          </p>
          <div className="mt-5 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-900">
            <strong>Important:</strong> Herbs for anxiety are educational context, not a substitute for
            evaluation of an anxiety disorder. If symptoms significantly impair your functioning, speak
            with a healthcare provider. Drug interactions (especially kava) are real and serious.
          </div>
        </section>

        {/* Decision framework */}
        <section className="space-y-4">
          <p className="eyebrow-label">Start here</p>
          <h2 className="text-2xl font-semibold tracking-tight text-ink">
            Match herb to anxiety pattern
          </h2>
          <div className="overflow-x-auto rounded-[1.65rem] border border-brand-900/10 bg-white shadow-sm">
            <table className="min-w-[600px] w-full text-sm border-collapse">
              <thead>
                <tr className="border-b border-brand-900/10 bg-brand-50/50">
                  <th className="text-left p-4 font-semibold text-ink">Your situation</th>
                  <th className="text-left p-4 font-semibold text-ink">Best herb choice</th>
                  <th className="text-left p-4 font-semibold text-ink">Note</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-brand-900/10">
                {HERB_CHOICE_FRAMEWORK.map((row) => (
                  <tr key={row.scenario}>
                    <td className="p-4 font-medium text-ink">{row.scenario}</td>
                    <td className="p-4 text-brand-700 font-medium">{row.recommendation}</td>
                    <td className="p-4 text-muted">{row.note}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </section>

        {/* Herb profiles */}
        <section className="space-y-6">
          <div>
            <p className="eyebrow-label">Evidence profiles</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-tight text-ink">
              Herb-by-herb evidence review
            </h2>
          </div>
          <div className="space-y-5">
            {ANXIETY_HERBS.map((h) => (
              <div key={h.name} className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <Link href={h.href} className="text-xl font-semibold text-brand-800 hover:underline">
                    {h.name}
                  </Link>
                  <span className="rounded-full bg-brand-50 px-3 py-0.5 text-xs font-semibold text-brand-800">
                    {h.badge}
                  </span>
                </div>
                <div className="mt-4 grid gap-3 sm:grid-cols-2 text-sm">
                  <div>
                    <p className="font-semibold text-ink">Mechanism</p>
                    <p className="mt-0.5 text-muted">{h.mechanism}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Best for</p>
                    <p className="mt-0.5 text-muted">{h.bestFor}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Evidence</p>
                    <p className="mt-0.5 text-muted">{h.evidence}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Typical dose</p>
                    <p className="mt-0.5 text-muted">{h.dose}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Safety</p>
                    <p className="mt-0.5 text-muted">{h.safety}</p>
                  </div>
                  <div>
                    <p className="font-semibold text-ink">Key interactions</p>
                    <p className="mt-0.5 text-muted">{h.interactions}</p>
                  </div>
                </div>
                <Link href={h.href} className="mt-4 inline-block text-xs font-semibold text-brand-700 hover:underline">
                  Full profile →
                </Link>
              </div>
            ))}
          </div>
        </section>

        {/* What evidence can't tell you */}
        <section className="rounded-[1.65rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm space-y-3">
          <h2 className="text-xl font-semibold text-ink">What the evidence can't tell you</h2>
          <ul className="space-y-2 text-sm text-muted list-none">
            <li>• Most herb anxiety trials last 4–12 weeks on non-clinical (subclinical) populations. Effects in clinical anxiety disorders may differ significantly.</li>
            <li>• Standardization varies wildly between products. A 300 mg ashwagandha capsule with 1% withanolides is not the same as KSM-66 with 5%.</li>
            <li>• Kava's safety data is heavily preparation-dependent. The Cochrane review supporting its use was on aqueous extracts; most of the hepatotoxicity reports involve ethanolic or acetone extracts.</li>
            <li>• Individual response varies substantially. Someone with HPA dysregulation may see dramatic benefit from ashwagandha; someone with pure GABA dysregulation may not.</li>
          </ul>
        </section>

        {/* Related guides */}
        <nav className="flex flex-wrap gap-4 text-sm font-semibold text-brand-700">
          <Link href="/guides/natural-anxiolytics-beyond-ashwagandha" className="hover:text-brand-800">Anxiolytics Beyond Ashwagandha →</Link>
          <Link href="/guides/natural-alternatives-to-anxiety-medication" className="hover:text-brand-800">Natural Alternatives to Anxiety Meds →</Link>
          <Link href="/guides/kava" className="hover:text-brand-800">Kava Safety Guide →</Link>
          <Link href="/guides/best-supplements-for-overthinking" className="hover:text-brand-800">Supplements for Overthinking →</Link>
          <Link href="/guides" className="hover:text-brand-800">All Guides →</Link>
        </nav>
      </div>
    </>
  )
}
