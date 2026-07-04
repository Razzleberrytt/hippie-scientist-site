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
  title: 'Apple Cider Vinegar: Evidence, Benefits & Dosing (2026 Guide)',
  description: 'ACV for weight loss, blood sugar, and digestion — what does the evidence actually show? Review of clinical trials with dosing, safety, and the mother.',
  path: '/guides/other/apple-cider-vinegar/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Does apple cider vinegar help with weight loss?', answer: 'Modestly. A 2018 RCT (n=39) found 2 tbsp (30 mL) ACV daily for 12 weeks reduced body weight by 2.6 lbs vs placebo [1]. A 2009 Japanese trial (n=155) found 15-30 mL daily reduced BMI by 0.4-0.7 kg/m2 over 12 weeks [2]. Effect sizes are small. ACV is not a weight loss solution — it is a modest adjunct to diet and exercise. The mechanism may involve delayed gastric emptying and modest appetite suppression via acetic acid.' },
  { question: 'Does ACV lower blood sugar?', answer: 'Yes — this is the best-supported benefit. Acetic acid (the active component) reduces postprandial glucose by 20-34% when consumed before or with a carbohydrate-containing meal [3]. The mechanism: delayed gastric emptying and increased glucose uptake by skeletal muscle. This is most relevant for people with insulin resistance or prediabetes. Take 1-2 tbsp diluted in water before high-carb meals.' },
  { question: 'Should I drink ACV straight or diluted?', answer: 'Always dilute. Undiluted ACV is acidic enough (pH 2-3) to erode tooth enamel and irritate the esophagus. Mix 1-2 tbsp in 8 oz (240 mL) of water. Drink through a straw to minimize tooth contact. Rinse mouth with plain water afterward. Do not brush teeth immediately — softened enamel needs 30 minutes to remineralize. ACV in capsule form avoids dental issues but may be less effective.' },
  { question: 'What does the mother do?', answer: 'The mother is a sediment of acetic acid bacteria and cellulose — the byproduct of fermentation. It contains probiotics (Acetobacter species) and enzymes. Whether the mother provides benefits beyond filtered ACV is unclear — most clinical trials used standard ACV, not mother-containing varieties. The mother is not harmful but its contribution to ACV\'s effects is theoretical. If you buy ACV with the mother, shake before use to distribute it.' },
  { question: 'When is the best time to take ACV?', answer: 'Before or with meals — particularly high-carbohydrate meals. The glucose-lowering effect lasts about 2-4 hours. Do not take on an empty stomach (can cause nausea). Do not take right before bed (reflux risk if you lie down). Morning or lunch doses are best. Start with 1 tsp and work up to 1-2 tbsp to assess GI tolerance.' },
]

const ACV_REFS = [
  { n: 1, text: 'Khezri SS, et al. (2018). Apple cider vinegar on weight and metabolic profile. J Funct Foods, 43: 95-102.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
  { n: 2, text: 'Kondo T, et al. (2009). Vinegar intake reduces body weight in obese Japanese. Biosci Biotechnol Biochem, 73(8): 1837-1843.', url: 'https://pubmed.ncbi.nlm.nih.gov/19661687/' },
  { n: 3, text: 'Johnston CS, et al. (2004). Vinegar improves insulin sensitivity to a high-carbohydrate meal. Diabetes Care, 27(1): 281-282.', url: 'https://pubmed.ncbi.nlm.nih.gov/14694010/' },
  { n: 4, text: 'Petsiou EI, et al. (2014). Vinegar and insulin sensitivity in T2D. Diabetes Care, 37(5): e107-e108.', url: 'https://pubmed.ncbi.nlm.nih.gov/24757246/' },
  { n: 5, text: 'Ostman E, et al. (2005). Vinegar lowers glucose and insulin responses. Eur J Clin Nutr, 59(9): 983-988.', url: 'https://pubmed.ncbi.nlm.nih.gov/16015276/' },

]

export default function AppleCiderVinegarPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Apple Cider Vinegar Guide" description="Evidence-based review of ACV for weight loss, blood sugar, and digestion." url="https://thehippiescientist.net/guides/other/apple-cider-vinegar" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Apple Cider Vinegar' }]} />
      <FAQSchema pagePath="/guides/other/apple-cider-vinegar/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 5 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Apple Cider Vinegar: What the Evidence Actually Shows</h1>
        <p className="text-lg leading-8 text-muted">Apple cider vinegar has been a folk remedy for centuries. In the last decade, it became a wellness trend — promoted for weight loss, blood sugar control, digestion, and detoxification. Some of these claims have evidence. Most do not. Here is what the clinical trials actually show.</p>
      
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/apple-cider-vinegar.jpg" alt="Apple cider vinegar bottle beside fresh apples on wood" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Apple cider vinegar — evidence over trends.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Quick answer</h2>
        <p className="text-sm leading-7 text-muted">
          <strong>The best evidence for ACV is blood sugar control</strong> — 1-2 tbsp before high-carb meals reduces postprandial glucose by 20-34% [3]. <strong>Weight loss evidence is modest</strong> — ~2-3 lbs over 12 weeks in small trials [1,2]. <strong>Detoxification claims are unfounded</strong> — your liver handles detoxification, not vinegar. <strong>Dosing:</strong> 1-2 tbsp (15-30 mL) diluted in 8 oz water, taken before meals. Always dilute — undiluted ACV erodes tooth enamel. Gut health claims (probiotics from the mother) are theoretical with limited evidence. ACV is a cheap, safe adjunct to diet — not a miracle cure.
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · ACV Evidence</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Claim</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Effect Size</th><th className="text-left py-2 font-semibold text-ink">Dose</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Blood sugar control</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Moderate-Strong</span></td><td className="py-2 pr-4">20-34% glucose reduction</td><td className="py-2">1-2 tbsp before meals</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Weight loss</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Modest</span></td><td className="py-2 pr-4">~2-3 lbs over 12 weeks</td><td className="py-2">1-2 tbsp daily</td></tr>
              <tr><td className="py-2 pr-4 font-medium text-ink">Detoxification</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">None</span></td><td className="py-2 pr-4">N/A</td><td className="py-2">N/A</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200">
          <p className="text-xs font-semibold text-ink">ACV safety rules:</p>
          <p className="mt-1 text-xs leading-5 text-muted">Always dilute (1-2 tbsp in 8 oz water). Use a straw to protect teeth. Rinse mouth afterward — wait 30 min before brushing. Don&apos;t take before bed (reflux). Don&apos;t take undiluted shots (esophageal damage). Capsules avoid dental issues but evidence for efficacy is weaker. At $5-10/month, ACV is one of the cheapest evidence-based supplements.</p>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">Apple cider vinegar is a cheap, safe, and moderately effective supplement for blood sugar control — the best-supported benefit. Weight loss effects are small but statistically significant. Take 1-2 tbsp diluted in water before carbohydrate-containing meals. Always dilute — undiluted ACV damages teeth and esophagus. At $5-10/month, ACV has a favorable risk-benefit ratio for people with prediabetes or insulin resistance. It is not a detoxifier, fat burner, or miracle cure.</p>
      </section>
      <References refs={ACV_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Apple cider vinegar, blood sugar, weight loss — evidence over trends." ctaLabel="Get the evidence" location="guide-acv" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}