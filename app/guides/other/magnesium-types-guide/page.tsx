import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'
import { getRevenueProductSet } from '@/config/revenue-products'
import RecommendationSection from '@/components/RecommendationSection'

export const metadata: Metadata = buildPageMetadata({
  title: 'Magnesium Types Compared: Which Form Is Best? (2026 Guide)',
  description: 'Glycinate, citrate, oxide, threonate, malate — 7 magnesium types compared by absorption, best use, and evidence. Stop guessing which magnesium to take.',
  path: '/guides/other/magnesium-types-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Which type of magnesium is best absorbed?', answer: 'Magnesium glycinate and citrate are the best-absorbed oral forms [1]. Magnesium oxide is poorly absorbed (~4% bioavailability) [2]. Magnesium threonate was specifically developed to cross the blood-brain barrier and raise brain magnesium levels [3]. For general supplementation, glycinate offers the best balance of absorption and GI tolerability.' },
  { question: 'Which magnesium is best for sleep?', answer: 'Magnesium glycinate. The glycine component provides additional calming effects via glycine receptors in the brain [4]. Studies show 200-400 mg elemental magnesium before bed improves sleep onset and quality [5]. Magnesium threonate may also help via central nervous system effects but is significantly more expensive.' },
  { question: 'Which magnesium is best for anxiety?', answer: 'Magnesium glycinate or taurate. Both provide magnesium plus an anxiolytic amino acid (glycine or taurine). A 2017 systematic review found magnesium supplementation reduces subjective anxiety [6]. Evidence is moderate — effects are stronger in people with low baseline magnesium status.' },
  { question: 'Why does magnesium cause diarrhea?', answer: 'Unabsorbed magnesium draws water into the colon via osmosis — this is most common with citrate and oxide [2]. Magnesium glycinate is much better tolerated because glycine enhances absorption. If citrate causes GI issues, switch to glycinate or reduce the dose and split across the day.' },
  { question: 'How much magnesium should I take?', answer: 'The RDA is 310-420 mg/day for adults [7]. For specific goals: sleep 200-400 mg glycinate before bed, anxiety 200-300 mg glycinate split across the day, constipation 200-400 mg citrate, brain health 1,000-2,000 mg threonate. Stay under the tolerable upper intake level of 350 mg from supplements (excluding food sources) to avoid GI effects.' },
]

const MAGNESIUM_TYPES_REFS = [
  { n: 1, text: 'Schuchardt JP, Hahn A. (2017). Intestinal absorption and factors influencing bioavailability of magnesium. Curr Nutr Food Sci, 13(4): 260-278.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
  { n: 2, text: 'Firoz M, Graber M. (2001). Bioavailability of US commercial magnesium preparations. Magnes Res, 14(4): 257-262.', url: 'https://pubmed.ncbi.nlm.nih.gov/11794633/' },
  { n: 3, text: 'Slutsky I, et al. (2010). Enhancement of learning and memory by elevating brain magnesium. Neuron, 65(2): 165-177.', url: 'https://pubmed.ncbi.nlm.nih.gov/20152124/' },
  { n: 4, text: 'Kawai N, et al. (2015). The sleep-promoting and hypothermic effects of glycine. Neuropsychopharmacology, 40(6): 1405-1416.', url: 'https://pubmed.ncbi.nlm.nih.gov/25533534/' },
  { n: 5, text: 'Abbasi B, et al. (2012). Magnesium supplementation and primary insomnia. J Res Med Sci, 17(12): 1161-1169.', url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/' },
  { n: 6, text: 'Boyle NB, et al. (2017). The effects of magnesium on subjective anxiety — a systematic review. Nutrients, 9(5): 429.', url: 'https://pubmed.ncbi.nlm.nih.gov/28445426/' },
  { n: 7, text: 'Institute of Medicine. (1997). Dietary Reference Intakes for Calcium, Phosphorus, Magnesium, Vitamin D, and Fluoride. National Academies Press.', url: 'https://pubmed.ncbi.nlm.nih.gov/23115811/' },
  { n: 8, text: 'Nielsen FH. (2018). Magnesium deficiency and increased inflammation. J Inflamm Res, 11: 25-34.', url: 'https://pubmed.ncbi.nlm.nih.gov/29403302/' },
]

export default function MagnesiumTypesPage() {
  const magnesiumProducts = getRevenueProductSet('magnesium')
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Magnesium Types Compared" description="Glycinate, citrate, oxide, threonate — which magnesium is right for you?" url="https://thehippiescientist.net/guides/other/magnesium-types-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Magnesium Types Guide' }]} />
      <FAQSchema pagePath="/guides/other/magnesium-types-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 8 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Magnesium Types: Which Form Actually Works?</h1><p className="text-lg leading-8 text-muted">Magnesium glycinate, citrate, oxide, threonate, malate, taurate, chloride — the supplement aisle has never been more confusing. Each form claims unique benefits. But which claims are supported by evidence, and which are marketing? Here&rsquo;s a data-driven comparison of the 7 most common types, with absorption rates, best use cases, and dosing guidance.</p>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Magnesium Type Selector</p><p className="text-sm leading-7 text-muted"><strong>Sleep or anxiety?</strong> → Glycinate. <strong>Constipation?</strong> → Citrate. <strong>Brain health?</strong> → Threonate. <strong>Budget?</strong> → Glycinate. <strong>Avoid:</strong> Oxide (4% absorption). Take with food, split doses, pair with vitamin D.</p></section>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/magnesium-types-guide.jpg" alt="Different magnesium supplement forms compared" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Seven magnesium types — one clear winner for most people.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Magnesium types at a glance</h2>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Form</th><th className="text-left py-3 pr-4">Bioavailability</th><th className="text-left py-3 pr-4">Best for</th><th className="text-left py-3">Typical dose</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Glycinate (bisglycinate)</td><td className="py-3 pr-4">High [1]</td><td className="py-3 pr-4">Sleep, anxiety, general use</td><td className="py-3">200-400 mg</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Citrate</td><td className="py-3 pr-4">High [1]</td><td className="py-3 pr-4">Constipation, general use</td><td className="py-3">200-400 mg</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Threonate (L-threonate)</td><td className="py-3 pr-4">Moderate</td><td className="py-3 pr-4">Brain health, cognition [3]</td><td className="py-3">1,000-2,000 mg</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Malate</td><td className="py-3 pr-4">Moderate</td><td className="py-3 pr-4">Fibromyalgia, muscle pain</td><td className="py-3">200-400 mg</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Taurate</td><td className="py-3 pr-4">Moderate</td><td className="py-3 pr-4">Cardiovascular, anxiety</td><td className="py-3">200-400 mg</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Chloride</td><td className="py-3 pr-4">Moderate</td><td className="py-3 pr-4">Topical, baths (Epsom salt debate)</td><td className="py-3">N/A (topical)</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">Oxide</td><td className="py-3 pr-4">Very low (~4%) [2]</td><td className="py-3 pr-4">Not recommended</td><td className="py-3">N/A</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by form</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Glycinate — Best all-purpose choice</h3><p className="mt-2 text-sm leading-7 text-muted">Magnesium bound to glycine — the same amino acid that functions as an inhibitory neurotransmitter. High bioavailability [1], excellent GI tolerability, and the glycine component provides additional sleep and calming benefits [4]. The best first choice for sleep, anxiety, and general magnesium supplementation. Elemental magnesium content: ~14% (100 mg glycinate = ~14 mg elemental). Look for products labeled &ldquo;bisglycinate&rdquo; or &ldquo;chelated&rdquo; for maximum absorption.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Citrate — Best for constipation</h3><p className="mt-2 text-sm leading-7 text-muted">Well-absorbed [1] but draws water into the colon, making it effective for constipation. The laxative effect is a feature if you need it, a side effect if you don&rsquo;t. Often used in &ldquo;calm&rdquo; drink powders. Avoid if you have IBS-D or are taking magnesium for sleep (glycinate is better for that). Elemental content: ~16%.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Threonate — Brain-specific, expensive</h3><p className="mt-2 text-sm leading-7 text-muted">Developed by MIT researchers (Slutsky et al., 2010) to cross the blood-brain barrier and raise brain magnesium levels [3]. Animal studies show improved learning and memory. Human evidence is limited to small trials with cognitive improvement signals. Significantly more expensive ($20-40/month vs $5-10 for glycinate). Worth considering for cognitive goals but not as a first-line general magnesium supplement. Elemental content: ~8% — you need higher total doses to get meaningful elemental magnesium.</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Oxide — Avoid</h3><p className="mt-2 text-sm leading-7 text-muted">The cheapest and most common form in drugstore supplements — and the worst. Bioavailability is ~4% [2], meaning 96% passes through unabsorbed. It will raise magnesium levels in severely deficient people at high doses, but glycinate or citrate achieve the same effect at lower doses with fewer GI effects. Save your money.</p></div>
        </div>
      </section>

      {magnesiumProducts && (
        <RecommendationSection
          title="Magnesium glycinate picks"
          description="Glycinate is the all-purpose winner from the comparison above — well-absorbed, well-tolerated, and useful for sleep, anxiety, and general supplementation. These are sourcing starting points, not medical recommendations."
          products={magnesiumProducts.products}
        />
      )}

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">The magnesium deficiency problem</h2><p className="text-sm leading-7 text-muted">Up to 50% of the US population consumes less than the EAR for magnesium [8]. Deficiency is associated with increased inflammation, poor sleep, anxiety, and cardiovascular risk. Processed food diets, soil depletion, and certain medications (PPIs, diuretics) all contribute. Most people would benefit from increasing magnesium intake through diet (leafy greens, nuts, seeds, legumes) or supplementation — and the form matters. Glycinate is the best general-purpose choice; citrate if constipation is a goal; threonate if you are specifically targeting brain health and can afford the premium.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">For most people: <strong>magnesium glycinate at 200-400 mg/day</strong> is the best all-purpose choice — well-absorbed, well-tolerated, and the glycine component adds sleep/calming benefits [1,4,5]. If you have constipation: citrate. If you are specifically targeting brain health and budget is not a concern: threonate [3]. Avoid oxide — it is poorly absorbed and produces more GI side effects [2]. Regardless of form, split doses across the day to improve absorption and reduce GI effects. Take with food. Pair with vitamin D for optimal magnesium utilization [7].</p></section>
      <References refs={MAGNESIUM_TYPES_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Magnesium types, menopause, creatine — evidence, not marketing." ctaLabel="Get the evidence" location="guide-magnesium-types" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}