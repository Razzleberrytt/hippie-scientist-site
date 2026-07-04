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
  title: 'Green Tea Extract (EGCG): Benefits, Risks & Dosing (2026)',
  description: 'Green tea extract and EGCG for metabolism, brain health, and longevity. Evidence review with critical safety warning about liver toxicity at high doses.',
  path: '/guides/other/green-tea-egcg-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Does green tea extract help with weight loss?', answer: 'Modestly. A 2021 meta-analysis found green tea catechins increased energy expenditure by ~4-5% and fat oxidation. The effect is small — roughly 1-2 kg additional weight loss over 12 weeks compared to placebo. This is not a weight loss drug. The effect is most consistent when combined with caffeine. Decaffeinated green tea extract has weaker or null effects on metabolism.' },
  { question: 'Is green tea extract safe for the liver?', answer: 'Yes at low doses, NO at high doses. Green tea extract has been linked to dozens of cases of acute liver injury, particularly when taken on an empty stomach or at high doses (above 800 mg EGCG/day). The risk is low but real. Take with food, do not exceed 400 mg EGCG/day from supplements, and stop immediately if you develop jaundice, dark urine, or abdominal pain. Green tea as a beverage is safe — the concentrated extracts are the concern.' },
  { question: 'How much EGCG is in a cup of green tea?', answer: 'About 50-100 mg per cup. A typical green tea extract capsule provides 200-400 mg EGCG — equivalent to 4-8 cups of tea, but without the protective food matrix. This concentration difference is why extracts carry liver risk that tea does not. Drinking 3-5 cups of green tea daily provides catechins safely. You would need to drink 20+ cups to match a high-dose extract.' },
  { question: 'Does green tea prevent cancer?', answer: 'Observational studies show green tea drinkers have lower cancer rates, but randomized trials are inconsistent and generally negative. The 2020 Cochrane review found insufficient evidence to recommend green tea for cancer prevention. The observational benefit is likely confounded by healthier lifestyles among tea drinkers. Green tea is a healthy beverage — not a proven cancer preventative.' },
  { question: 'Green tea vs matcha vs extract — which is best?', answer: 'Matcha (whole powdered leaf) provides the most catechins per gram — roughly 3x more EGCG than steeped green tea. Matcha also provides L-theanine and chlorophyll that extracts lack. Green tea extract is the most convenient but carries the liver risk at high doses. Recommendation: drink matcha or green tea for health benefits; use extract only if you have a specific goal and stay under 400 mg EGCG/day with food.' },
]

const GREENTEA_REFS = [
  { n: 1, text: 'Hursel R, et al. (2021). Green tea catechin and caffeine on energy expenditure. Obes Rev, 12(7): e573-e581.', url: 'https://pubmed.ncbi.nlm.nih.gov/21366839/' },
  { n: 2, text: 'Mazzanti G, et al. (2009). Hepatotoxicity from green tea. Eur J Clin Pharmacol, 65(4): 331-341.', url: 'https://pubmed.ncbi.nlm.nih.gov/19198822/' },
  { n: 3, text: 'Boehm K, et al. (2020). Green tea for cancer prevention. Cochrane Database Syst Rev, (3): CD005004.', url: 'https://pubmed.ncbi.nlm.nih.gov/32154958/' },
]

export default function GreenTeaEGCGPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Green Tea EGCG Guide" description="Evidence and safety review of green tea extract." url="https://thehippiescientist.net/guides/other/green-tea-egcg-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Green Tea Extract' }]} />
      <FAQSchema pagePath="/guides/other/green-tea-egcg-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 3 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Green Tea Extract: Benefits With a Liver Warning</h1><p className="text-lg leading-8 text-muted">Green tea is one of the healthiest beverages in the world. Green tea extract concentrates its catechins 10-20x — which sounds good until you learn about the liver toxicity cases. Here is what the evidence shows, and why the dose makes the difference between benefit and risk.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/green-tea-egcg-guide.jpg" alt="Fresh green tea leaves beside matcha and a steaming cup" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Green tea extract — benefits with a liver warning.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Drink green tea — do not megadose green tea extract.</strong> Green tea as a beverage (3-5 cups/day) is safe and provides 150-500 mg catechins. Green tea extract above 400 mg EGCG/day carries a small but real risk of acute liver injury [2]. The weight loss effect is modest (~1-2 kg) and not worth the liver risk at high doses [1]. If you take green tea extract, stay under 400 mg EGCG/day, take with food, and stop immediately at any sign of liver stress. Matcha provides the best of both worlds — concentrated catechins without the extract-related liver risk.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Green Tea Forms</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Form</th><th className="text-left py-2 pr-4 font-semibold text-ink">EGCG per serving</th><th className="text-left py-2 pr-4 font-semibold text-ink">Liver Risk</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best For</th><th className="text-left py-2 font-semibold text-ink">Cost/mo</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Steeped green tea</td><td className="py-2 pr-4">50-100 mg/cup</td><td className="py-2 pr-4 text-emerald-700">None</td><td className="py-2 pr-4">General health</td><td className="py-2">$5-10</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Matcha powder</td><td className="py-2 pr-4">150-200 mg/serving</td><td className="py-2 pr-4 text-emerald-700">None</td><td className="py-2 pr-4">Concentrated catechins + L-theanine</td><td className="py-2">$15-25</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Green tea extract</td><td className="py-2 pr-4">200-800 mg/capsule</td><td className="py-2 pr-4 text-red-600">Significant above 800 mg</td><td className="py-2 pr-4">Convenience (use with caution)</td><td className="py-2">$10-20</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">Green tea is a healthy beverage. Green tea extract is a concentrated supplement with a documented, dose-dependent liver injury risk [2]. The weight loss effect is too small to justify the risk at high doses [1]. Drink matcha for the best combination of catechins, L-theanine, and safety. If you take extract, stay under 400 mg EGCG/day with food. The green tea story is a perfect example of why "natural" does not mean "safe at any dose."</p></section>
      <References refs={GREENTEA_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Green tea, EGCG, liver safety — evidence over marketing." ctaLabel="Get the evidence" location="guide-green-tea" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}