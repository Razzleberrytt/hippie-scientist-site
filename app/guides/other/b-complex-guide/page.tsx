import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'B-Complex Vitamins Guide: Forms, Dosing & Benefits (2026)',
  description: 'B1 to B12 — which B vitamins matter, which forms are best absorbed, and when supplementation is actually warranted. Evidence-based guide.',
  path: '/guides/other/b-complex-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do I need a B-complex supplement?', answer: 'Depends on your diet. Vegans/vegetarians often need B12. Heavy drinkers need B1 (thiamine). Pregnant women need folate. Elderly need B12 (absorption declines). If you eat a varied diet with animal products, you likely get enough B vitamins. Energy drinks and supplements with "B-complex for energy" are marketing — B vitamins only improve energy if you were deficient to begin with.' },
  { question: 'Which form of B12 is best?', answer: 'Methylcobalamin is the active form and preferred over cyanocobalamin (cheaper, synthetic). Methylcobalamin is better retained and does not require conversion. Dose: 1,000-2,000 mcg/day for deficiency correction; 250-500 mcg for maintenance. Sublingual B12 may be better absorbed than oral for people with low stomach acid or pernicious anemia. B12 injections are for diagnosed deficiency.' },
  { question: 'Can you take too many B vitamins?', answer: 'B vitamins are water-soluble, so excess is excreted — but high doses still carry risks. B6 above 100 mg/day can cause irreversible peripheral neuropathy. B3 (niacin) above 500 mg causes flushing and can be hepatotoxic at high doses. B9 (folic acid) above 1,000 mcg can mask B12 deficiency. Most B-complexes stay within safe ranges, but check the label before taking multiple products.' },
  { question: 'Why does B-complex turn urine yellow?', answer: 'Riboflavin (B2) is fluorescent yellow. Your body absorbs what it needs and excretes the rest through urine. This is normal and harmless — it is not a sign that you are wasting money. The urine color change is from excess riboflavin, not from all B vitamins being excreted unused.' },
  { question: 'Best time to take B-complex?', answer: 'Morning, with food. B vitamins can be mildly stimulating (especially B12 and B6) and may interfere with sleep if taken in the evening. Taking with a meal reduces GI upset and improves absorption of fat-soluble B vitamins. Do not take on an empty stomach — can cause nausea.' },
]

const BCOMPLEX_REFS = [
  { n: 1, text: 'Kennedy DO. (2016). B vitamins and the brain: mechanisms, dose and efficacy — a review. Nutrients, 8(2): 68.', url: 'https://pubmed.ncbi.nlm.nih.gov/26828517/' },
  { n: 2, text: 'Institute of Medicine. (1998). Dietary Reference Intakes for Thiamin, Riboflavin, Niacin, B6, Folate, B12, Pantothenic Acid, Biotin, and Choline.', url: 'https://pubmed.ncbi.nlm.nih.gov/23193625/' },
  { n: 3, text: 'Smith AD, et al. (2018). Homocysteine and B vitamins in cognitive decline. Nutrients, 10(2): 217.', url: 'https://pubmed.ncbi.nlm.nih.gov/29439458/' },
  { n: 4, text: 'Obeid R, et al. (2019). Vitamin B12: from deficiency to supplementation. Nutrients, 11(8): 1844.', url: 'https://pubmed.ncbi.nlm.nih.gov/31408995/' },

]

export default function BComplexPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="B-Complex Vitamins Guide" description="B1 to B12 — which forms work and when to supplement." url="https://thehippiescientist.net/guides/other/b-complex-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'B-Complex Vitamins' }]} />
      <FAQSchema pagePath="/guides/other/b-complex-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 4 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">B-Complex Vitamins: Which Ones Actually Matter?</h1>
        <p className="text-lg leading-8 text-muted">B-complex supplements are marketed for energy, brain function, and metabolism. But B vitamins only improve these outcomes if you are deficient. For most people eating a varied diet, a B-complex provides expensive urine. Here is which B vitamins matter, which forms to choose, and when supplementation is warranted.</p>
      </section>

      <section className="card-premium p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Quick answer</h2>
        <p className="text-sm leading-7 text-muted">
          <strong>If you eat animal products, you probably do not need a B-complex</strong> — with exceptions: vegans (B12), heavy drinkers (B1), elderly (B12 absorption declines), pregnant women (folate), and people on metformin or PPIs (B12). The best evidence for B vitamins is correcting deficiencies [1]. For energy and cognitive enhancement in non-deficient people, evidence is weak. Choose methylated forms (methylcobalamin, methylfolate) over synthetic forms (cyanocobalamin, folic acid) — they are active and better utilized. Cost: $5-15/month for a quality B-complex.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · B Vitamin Quick Reference</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Vitamin</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best Form</th><th className="text-left py-2 pr-4 font-semibold text-ink">Who Needs It</th><th className="text-left py-2 font-semibold text-ink">RDA</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">B1 (Thiamine)</td><td className="py-2 pr-4">Benfotiamine</td><td className="py-2 pr-4">Heavy drinkers, diabetics</td><td className="py-2">1.2 mg</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">B2 (Riboflavin)</td><td className="py-2 pr-4">Riboflavin-5-phosphate</td><td className="py-2 pr-4">Migraine prevention (400 mg)</td><td className="py-2">1.3 mg</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">B3 (Niacin)</td><td className="py-2 pr-4">Nicotinic acid (flush) or niacinamide</td><td className="py-2 pr-4">Cholesterol (prescription doses)</td><td className="py-2">16 mg</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">B6 (Pyridoxine)</td><td className="py-2 pr-4">Pyridoxal-5-phosphate (P5P)</td><td className="py-2 pr-4">Deficiency only — toxicity risk</td><td className="py-2">1.3-1.7 mg</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">B9 (Folate)</td><td className="py-2 pr-4">Methylfolate (L-5-MTHF)</td><td className="py-2 pr-4">Pregnancy, MTHFR mutation</td><td className="py-2">400 mcg</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">B12 (Cobalamin)</td><td className="py-2 pr-4">Methylcobalamin</td><td className="py-2 pr-4">Vegans, elderly, metformin/PPI users</td><td className="py-2">2.4 mcg</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">The methylfolate note:</p><p className="mt-1 text-xs leading-5 text-muted">About 40-60% of the population has an MTHFR gene variant that reduces folic acid conversion. If you take a B-complex, choose one with methylfolate (not folic acid) and methylcobalamin (not cyanocobalamin). This is more important than the dose.</p></div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">A quality B-complex with methylated forms costs $10-15/month and is a reasonable insurance policy — especially for vegans, older adults, and anyone on metformin or PPIs. But for most omnivores, B-complex provides expensive urine. The best evidence for individual B vitamins (B12 for deficiency, B2 for migraine, B1 for alcohol-related deficiency) is condition-specific — not general wellness [1,2]. If you take one, take it in the morning with food.</p></section>
      <References refs={BCOMPLEX_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="B vitamins, forms, dosing — evidence, not expensive urine." ctaLabel="Get the evidence" location="guide-bcomplex" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}