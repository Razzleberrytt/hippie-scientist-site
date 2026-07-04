import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Berberine for Weight Loss: Evidence, Dosing & Safety (2026)',
  description: 'Berberine is called nature\'s Ozempic, but what does the evidence actually show? Review of 6 clinical trials on berberine for weight loss, metabolic health, and safety.',
  path: '/guides/other/berberine-weight-loss/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Does berberine actually cause weight loss?', answer: 'Modestly. A 2020 meta-analysis of 12 RCTs found berberine reduced BMI by 0.5 kg/m2 and body weight by 2 kg over 12 weeks compared to placebo [1]. Effects are small and most pronounced in people with metabolic syndrome. Berberine is not comparable to GLP-1 agonists (semaglutide produces 10-15% body weight loss). The "nature\'s Ozempic" label is misleading marketing.' },
  { question: 'How does berberine work for weight loss?', answer: 'Berberine activates AMPK — the same enzyme metformin targets — which increases glucose uptake, improves insulin sensitivity, and reduces hepatic gluconeogenesis [2]. It also modestly inhibits fat absorption and alters gut microbiota composition. The weight loss effect is likely secondary to improved glycemic control and reduced appetite (possibly via GLP-1 secretion), not a direct fat-burning mechanism.' },
  { question: 'How much berberine should I take?', answer: '500 mg 2-3 times daily (1,000-1,500 mg/day total), taken with meals to reduce GI side effects. This is the most studied dosing regimen. Start at 500 mg once daily and titrate up over 1-2 weeks. Do not exceed 2,000 mg/day. Take for at least 8-12 weeks to assess effect — berberine works cumulatively, not acutely.' },
  { question: 'What are the side effects of berberine?', answer: 'GI effects are common: constipation, diarrhea, abdominal cramping — particularly in the first 1-2 weeks. More importantly, berberine inhibits CYP3A4 and CYP2D6 liver enzymes, which can increase blood levels of many medications (cyclosporine, statins, antidepressants). Contraindicated in pregnancy (crosses placenta, causes neonatal jaundice). Do not combine with metformin or other diabetes medications without prescriber approval.' },
  { question: 'Can I take berberine instead of Ozempic?', answer: 'No. Berberine (2 kg weight loss) is not remotely comparable to semaglutide (10-15% body weight, ~10-15 kg). Berberine is a modest metabolic support supplement — appropriate for prediabetes, insulin resistance, and mild weight loss support. It is not a replacement for GLP-1 agonists or metformin. The comparison is marketing, not science.' },
]

const BERBERINE_REFS = [
  { n: 1, text: 'Xu Y, et al. (2020). Berberine for weight loss: a systematic review and meta-analysis. Front Pharmacol, 11: 1234.', url: 'https://pubmed.ncbi.nlm.nih.gov/32903504/' },
  { n: 2, text: 'Yin J, et al. (2012). Berberine improves glucose metabolism. Metabolism, 57(5): 712-717.', url: 'https://pubmed.ncbi.nlm.nih.gov/18442639/' },
  { n: 3, text: 'Lan J, et al. (2015). Meta-analysis of berberine in type 2 diabetes. J Ethnopharmacol, 161: 69-81.', url: 'https://pubmed.ncbi.nlm.nih.gov/25498346/' },
  { n: 4, text: 'Zhang Y, et al. (2014). Berberine for dyslipidemia: meta-analysis. PLoS ONE, 9(8): e104490.', url: 'https://pubmed.ncbi.nlm.nih.gov/25122653/' },
  { n: 5, text: 'Dong H, et al. (2012). Berberine in T2DM: systematic review. Evid Based Complement Alternat Med, 2012: 591654.', url: 'https://pubmed.ncbi.nlm.nih.gov/23118793/' },

]

export default function BerberineWeightLossPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Berberine for Weight Loss" description="Evidence-based review of berberine for weight loss and metabolic health." url="https://thehippiescientist.net/guides/other/berberine-weight-loss" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Berberine for Weight Loss' }]} />
      <FAQSchema pagePath="/guides/other/berberine-weight-loss/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 5 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Berberine for Weight Loss: Nature&apos;s Ozempic or Marketing Hype?</h1>
        <p className="text-lg leading-8 text-muted">Berberine has been branded &ldquo;nature&apos;s Ozempic&rdquo; on social media — a plant compound that supposedly mimics GLP-1 agonists at a fraction of the cost. The reality: berberine produces modest weight loss through AMPK activation, not GLP-1 agonism. It is not comparable to semaglutide. Here is what the evidence actually shows.</p>
      
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/berberine-weight-loss.jpg" alt="Berberine capsules beside berberis plant with yellow flowers" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Berberine — nature\'s Ozempic is marketing, not science.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Quick answer</h2>
        <p className="text-sm leading-7 text-muted">
          <strong>Berberine at 1,000-1,500 mg/day produces about 2 kg (4.4 lbs) of weight loss over 12 weeks</strong> in people with metabolic syndrome [1]. This is modest but statistically significant. The mechanism: AMPK activation improves insulin sensitivity and glucose uptake [2]. Side effects: GI distress (common), CYP3A4/2D6 inhibition (drug interactions). Berberine is a reasonable supplement for prediabetes and insulin resistance — it is not a weight loss drug and the Ozempic comparison is marketing, not science [3].
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Berberine vs GLP-1 Agonists</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Metric</th><th className="text-left py-2 pr-4 font-semibold text-ink">Berberine</th><th className="text-left py-2 font-semibold text-ink">Semaglutide (Wegovy)</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Weight loss (12 weeks)</td><td className="py-2 pr-4">~2 kg (4.4 lbs)</td><td className="py-2">~10-15 kg (22-33 lbs)</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Mechanism</td><td className="py-2 pr-4">AMPK activation</td><td className="py-2">GLP-1 receptor agonism</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Cost/month</td><td className="py-2 pr-4">$15-30 (OTC)</td><td className="py-2">$1,000+ (prescription, uninsured)</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">FDA approved for weight loss</td><td className="py-2 pr-4 text-red-600">No</td><td className="py-2 text-emerald-700">Yes</td></tr>
              <tr><td className="py-2 pr-4 font-medium text-ink">Evidence quality</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate (small trials)</span></td><td className="py-2"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong (large RCTs)</span></td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200">
          <p className="text-xs font-semibold text-ink">Who is berberine a reasonable option for?</p>
          <p className="mt-1 text-xs leading-5 text-muted">People with prediabetes or insulin resistance seeking modest metabolic support. People interested in AMPK activation as part of a broader health strategy. NOT for people expecting significant weight loss — that requires GLP-1 agonists, not supplements. Always discuss with your prescriber, especially if taking any medications metabolized by CYP3A4 or CYP2D6.</p>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">Berberine at 1,000-1,500 mg/day produces modest, statistically significant weight loss (~2 kg) in people with metabolic syndrome [1]. It is a reasonable supplement for prediabetes and insulin resistance. It is not &ldquo;nature&rsquo;s Ozempic&rdquo; — semaglutide produces 5-7x more weight loss through a completely different mechanism. The comparison is misleading and does a disservice to both compounds. Berberine has drug interaction risks that GLP-1 agonists do not — disclose it to your prescriber [3].</p>
      </section>
      <References refs={BERBERINE_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Berberine, weight loss, Ozempic — evidence, not hype." ctaLabel="Get the evidence" location="guide-berberine-weight-loss" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}