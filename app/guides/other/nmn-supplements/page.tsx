import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'NMN Supplements: Evidence, Benefits & Safety (2026 Review)',
  description: 'NMN (nicotinamide mononucleotide) is the most hyped longevity supplement of the decade. Here\'s what the human evidence actually shows — and what\'s still just mouse data.',
  path: '/guides/other/nmn-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Does NMN actually extend lifespan?', answer: 'In mice, yes — NMN extends healthspan and modestly extends lifespan. In humans, we simply don\'t know yet. Human trials show NMN raises NAD+ levels and improves some biomarkers (insulin sensitivity, walking speed in older adults), but no human lifespan data exists. The longest human trial to date is 12 weeks. Anyone claiming NMN has been proven to extend human life is extrapolating from animal data.' },
  { question: 'What\'s the difference between NMN, NR, and NAD+?', answer: 'NAD+ is the active molecule your cells use for energy production and DNA repair. NMN (nicotinamide mononucleotide) and NR (nicotinamide riboside) are both precursors — your body converts them into NAD+. NMN is one step closer to NAD+ in the synthesis pathway. Oral NAD+ supplements have poor bioavailability. Most evidence favors NMN or NR over direct NAD+ supplementation.' },
  { question: 'How much NMN should I take?', answer: 'Human studies use 250-900 mg/day, typically in a single morning dose. The most replicated effective dose in clinical trials is 500 mg/day. Higher doses (900+ mg) haven\'t consistently shown additional benefit. Start at 250 mg and assess tolerance. Take in the morning — some users report sleep disruption with evening dosing.' },
  { question: 'Is NMN safe?', answer: 'Short-term safety data (up to 12 weeks) is reassuring — no serious adverse events in published trials. Mild side effects include headache, GI discomfort, and restlessness. Long-term safety beyond 12 weeks is unknown. The FDA has questioned NMN\'s status as a dietary supplement, and regulatory status varies by country. People with hormone-sensitive conditions should consult a clinician before use.' },
  { question: 'Is NMN better than just taking niacin (vitamin B3)?', answer: 'Niacin can raise NAD+ through a different pathway (Preiss-Handler), but it\'s less efficient at raising tissue NAD+ levels than NMN and causes unpleasant flushing at effective doses. NMN bypasses the rate-limiting step in NAD+ synthesis. However, niacin is dramatically cheaper and has decades of safety data. For most people, the evidence doesn\'t clearly favor NMN over niacin for general health.' },
]

export default function NMNGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="NMN Supplements: Evidence & Safety Review" description="NMN is 2026's most hyped longevity supplement — here's what the human evidence actually shows." url="https://thehippiescientist.net/guides/other/nmn-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'NMN Supplements' }]} />
      <FAQSchema pagePath="/guides/other/nmn-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">NMN: The Longevity Molecule — What We Actually Know</h1>
        <p className="text-lg leading-8 text-muted">Nicotinamide mononucleotide (NMN) is the most hyped anti-aging supplement since resveratrol. Promoted by David Sinclair, sold by dozens of direct-to-consumer brands, and the subject of intense longevity community interest. Human evidence is emerging — but it's still mostly mouse data, small trials, and biomarker changes rather than hard outcomes.</p>
      </section>

      <section className="card-premium p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Quick answer</h2>
        <p className="text-sm leading-7 text-muted">NMN <strong>reliably raises NAD+ levels</strong> in humans at doses of 250-900 mg/day. This is well-established across multiple trials. What's unclear is whether raising NAD+ in healthy adults produces meaningful health benefits. Some studies show improved insulin sensitivity, modest walking speed improvements in older adults, and better sleep quality. Others show no significant benefit over placebo. NMN is not harmful in short-term use and the biology is plausible — but calling it a proven longevity intervention overstates the current evidence.</p>
      </section>

      <section className="card-premium p-6 space-y-5 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">The evidence by claim</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Raises NAD+ levels — Strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Multiple randomized controlled trials confirm NMN increases blood NAD+ levels. A 2023 trial found 500 mg/day for 4 weeks increased NAD+ by roughly 40%. This is the most consistent finding in the literature and the biological basis for all downstream claims.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Insulin sensitivity and metabolic health — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">A 2021 Science paper showed NMN improved muscle insulin sensitivity in prediabetic women. A 2024 trial found improved hepatic insulin sensitivity. Effect sizes are modest but consistent across studies. This is the strongest clinical signal beyond NAD+ elevation.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Physical function in older adults — Emerging evidence</h3><p className="mt-2 text-sm leading-7 text-muted">A 2024 trial in older adults found NMN maintained walking speed and improved sleep quality vs placebo over 12 weeks. A small trial in amateur runners showed improved aerobic capacity. These are encouraging but preliminary — sample sizes are small and effect sizes modest.</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Lifespan extension in humans — No evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Zero human trials have measured lifespan or healthspan as outcomes. The excitement comes from mouse studies showing NMN mitigates age-related decline. Mice are not humans. The longest human NMN trial is 12 weeks. Extrapolating lifespan claims from murine data is scientifically irresponsible.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">NMN vs NR vs Niacin: what's the difference?</h2>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Factor</th><th className="text-left py-3 pr-4">NMN</th><th className="text-left py-3 pr-4">NR</th><th className="text-left py-3">Niacin (B3)</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">NAD+ pathway</td><td className="py-3 pr-4">Direct precursor (1 step)</td><td className="py-3 pr-4">Precursor (2 steps)</td><td className="py-3">Preiss-Handler pathway</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Human evidence</td><td className="py-3 pr-4">10+ small trials</td><td className="py-3 pr-4">15+ small trials</td><td className="py-3">Decades of data</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Typical dose</td><td className="py-3 pr-4">250-500 mg/day</td><td className="py-3 pr-4">300-1000 mg/day</td><td className="py-3">15-500 mg/day</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Cost/month</td><td className="py-3 pr-4">$30-60</td><td className="py-3 pr-4">$20-40</td><td className="py-3">$3-10</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">Side effects</td><td className="py-3 pr-4">Mild GI, headache</td><td className="py-3 pr-4">Mild GI, fatigue</td><td className="py-3">Flushing, itching, hepatotoxic at high doses</td></tr>
        </tbody></table></div>
        <p className="text-sm leading-7 text-muted">Niacin is dramatically cheaper and has robust safety data, but causes uncomfortable flushing and is less efficient at raising tissue NAD+. NR has more human trials than NMN but the evidence quality is similar. NMN has stronger mechanistic rationale (one step closer to NAD+) and better PR. No head-to-head human trial has compared NMN vs NR for clinical outcomes.</p>
      </section>

      <section className="rounded-2xl border-2 border-amber-400 bg-amber-50 p-6 max-w-4xl">
        <p className="text-sm font-black uppercase tracking-wider text-amber-900">Safety & Regulatory Status</p>
        <div className="mt-3 space-y-3 text-sm leading-7 text-amber-900">
          <p><strong>FDA status:</strong> NMN's regulatory status in the US is contested. The FDA has questioned whether NMN can be sold as a dietary supplement since it was investigated as a drug first. As of 2026, it remains available but the regulatory situation is unstable.</p>
          <p><strong>Long-term safety:</strong> Unknown. The longest trial is 12 weeks. No serious adverse events have been reported at studied doses, but the absence of long-term data should concern anyone considering indefinite daily use.</p>
          <p><strong>Drug interactions:</strong> Not well-studied. Theoretical interactions with diabetes medications (additive glucose-lowering) and chemotherapy (NMN may protect cancer cells as well as healthy cells — a significant concern).</p>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">NMN is a scientifically interesting molecule with a plausible mechanism and consistent biomarker data. It reliably raises NAD+ levels. Whether this translates to meaningful health benefits in healthy humans is unproven. The cost ($30-60/month) is not trivial for an unproven intervention.</p>
        <p className="text-sm leading-7 text-muted">If you're interested in the longevity space and have disposable income, NMN at 250-500 mg/day is a reasonable — if speculative — addition to a health routine. If you're looking for proven interventions, exercise, sleep, and not smoking have far stronger evidence for extending healthspan than any supplement on the market.</p>
      </section>

      <EmailCapture headline="Get evidence reviews like this" description="We track supplement claims against clinical evidence. No hype, no affiliate bias." ctaLabel="Get the evidence" location="guide-nmn" />

      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between">
        <Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link>
        <Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link>
      </div>
    </div>
  )
}