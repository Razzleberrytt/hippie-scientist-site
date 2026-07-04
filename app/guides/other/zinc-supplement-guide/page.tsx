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
  title: 'Zinc Supplements: Benefits, Forms & Dosing (2026 Guide)',
  description: 'Zinc picolinate, gluconate, citrate — which form is best? Evidence-based guide to zinc for immunity, testosterone, skin, and when to supplement.',
  path: '/guides/other/zinc-supplement-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Which form of zinc is best absorbed?', answer: 'Zinc picolinate and zinc citrate have the highest bioavailability [1]. Zinc gluconate is slightly less absorbed but well-tolerated and widely available. Zinc oxide is poorly absorbed (similar to magnesium oxide) — avoid it. Zinc monomethionine (OptiZinc) claims superior absorption but the evidence is limited to manufacturer studies.' },
  { question: 'How much zinc should I take daily?', answer: 'RDA: 11 mg (men), 8 mg (women). For deficiency correction: 25-50 mg/day for 4-12 weeks, then reduce to maintenance. Upper tolerable limit: 40 mg/day from supplements. Taking more than 50 mg/day long-term can cause copper deficiency, immune suppression, and GI effects. Always pair zinc supplementation with 1-2 mg copper if taking above 30 mg/day for more than a few weeks.' },
  { question: 'Does zinc help with colds?', answer: 'Yes, modestly. A 2017 meta-analysis found zinc lozenges (75+ mg/day) reduced cold duration by 33% when started within 24 hours of symptoms [2]. The effect is most consistent for zinc acetate and gluconate lozenges providing 75-100 mg/day in divided doses. Zinc nasal sprays have been linked to permanent anosmia — avoid them. For prevention, evidence is weaker.' },
  { question: 'Can I take zinc on an empty stomach?', answer: 'Not recommended — zinc commonly causes nausea on an empty stomach. Take with food. However, zinc competes with iron and calcium for absorption. Take zinc at a different meal from high-calcium foods or iron supplements. Phytates in whole grains and legumes inhibit zinc absorption — if your diet is high in these, you may need more zinc.' },
  { question: 'Who is most at risk for zinc deficiency?', answer: 'Vegetarians/vegans (phytates inhibit absorption), pregnant women, elderly, people with GI disorders (Crohn\'s, celiac), alcoholics, and those taking long-term PPIs. Deficiency symptoms: impaired immune function, slow wound healing, hair loss, taste changes, and in men, low testosterone.' },
]

const ZINC_REFS = [
  { n: 1, text: 'Wegmüller R, et al. (2014). Zinc bioavailability from citrate, gluconate, and oxide. J Nutr, 144(2): 132-136.', url: 'https://pubmed.ncbi.nlm.nih.gov/24259556/' },
  { n: 2, text: 'Hemilä H. (2017). Zinc lozenges and the common cold: a meta-analysis. JRSM Open, 8(5): 2054270417694291.', url: 'https://pubmed.ncbi.nlm.nih.gov/28515951/' },
  { n: 3, text: 'Prasad AS. (2013). Discovery of human zinc deficiency. J Am Coll Nutr, 28(3): 257-265.', url: 'https://pubmed.ncbi.nlm.nih.gov/20150599/' },
  { n: 4, text: 'Hemila H. (2011). Zinc lozenges and the common cold. Open Respir Med J, 5: 51-58.', url: 'https://pubmed.ncbi.nlm.nih.gov/21769305/' },
  { n: 5, text: 'Prasad AS. (2013). Discovery of human zinc deficiency. J Am Coll Nutr, 28(3): 257-265.', url: 'https://pubmed.ncbi.nlm.nih.gov/20150599/' },

]

export default function ZincPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Zinc Supplement Guide" description="Zinc forms, dosing, immunity, and deficiency." url="https://thehippiescientist.net/guides/other/zinc-supplement-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Zinc Supplements' }]} />
      <FAQSchema pagePath="/guides/other/zinc-supplement-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 5 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Zinc: The Essential Mineral Most People Get Wrong</h1><p className="text-lg leading-8 text-muted">Zinc is required for over 300 enzymatic reactions — immunity, DNA synthesis, wound healing, and testosterone production. Yet 17% of the global population is zinc deficient [3], and most supplements use the wrong form at the wrong dose. Here&rsquo;s what you need to know.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/zinc-supplement-guide.jpg" alt="Zinc capsules and zinc-rich foods — pumpkin seeds and oysters" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Zinc — the right form, at the right dose, for the right reason.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Take 15-25 mg zinc picolinate or citrate daily with food, paired with 1-2 mg copper if taking for more than a few weeks.</strong> Avoid zinc oxide (poor absorption). For colds: zinc acetate or gluconate lozenges at 75-100 mg/day in divided doses, started within 24 hours of symptoms — reduces duration by ~33% [2]. Do not take on an empty stomach (nausea). Do not combine with high-calcium meals or iron supplements (competes for absorption). Zinc is one of the most evidence-supported supplements — when taken in the right form at the right dose for the right reason.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Zinc Form Selector</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Form</th><th className="text-left py-2 pr-4 font-semibold text-ink">Absorption</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best For</th><th className="text-left py-2 pr-4 font-semibold text-ink">Elemental %</th><th className="text-left py-2 font-semibold text-ink">GI Tolerance</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Picolinate</td><td className="py-2 pr-4 text-emerald-700 font-semibold">Best</td><td className="py-2 pr-4">General supplementation</td><td className="py-2 pr-4">~20%</td><td className="py-2">Good</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Citrate</td><td className="py-2 pr-4 text-emerald-700 font-semibold">Excellent</td><td className="py-2 pr-4">General, similar to picolinate</td><td className="py-2 pr-4">~34%</td><td className="py-2">Good</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Gluconate</td><td className="py-2 pr-4 text-amber-700 font-semibold">Good</td><td className="py-2 pr-4">Cold lozenges, budget</td><td className="py-2 pr-4">~14%</td><td className="py-2">Good</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Acetate</td><td className="py-2 pr-4 text-amber-700 font-semibold">Good</td><td className="py-2 pr-4">Cold lozenges (best studied)</td><td className="py-2 pr-4">~30%</td><td className="py-2">Moderate</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Oxide</td><td className="py-2 pr-4 text-red-600 font-semibold">Poor</td><td className="py-2 pr-4">Avoid — not recommended</td><td className="py-2 pr-4">~80%</td><td className="py-2">Poor</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">Key reminders:</p><p className="mt-1 text-xs leading-5 text-muted">Take with food (prevents nausea). Separate from calcium and iron (competing absorption). Pair with 1-2 mg copper if taking 30+ mg zinc long-term. For colds: start lozenges within 24 hours of symptoms, 75-100 mg/day in divided doses for the duration of the cold. Do not use nasal zinc sprays.</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Zinc picolinate or citrate at 15-25 mg/day is the best general supplementation strategy. Test levels if you suspect deficiency (vegetarian, GI disorder, elderly, pregnant). For colds: zinc acetate lozenges at 75-100 mg/day. Avoid oxide. Pair long-term zinc with copper. Total cost: $3-8/month for quality zinc — one of the best values in supplementation.</p></section>
      <References refs={ZINC_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Zinc forms, dosing, colds — evidence, not marketing." ctaLabel="Get the evidence" location="guide-zinc" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}