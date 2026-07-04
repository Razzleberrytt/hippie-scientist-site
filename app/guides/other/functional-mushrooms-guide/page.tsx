import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Functional Mushrooms Guide: Lion\'s Mane, Reishi, Cordyceps Compared (2026)',
  description: 'Lion\'s mane for brain, reishi for immunity, cordyceps for energy — evidence-based comparison of the 5 most important functional mushrooms.',
  path: '/guides/other/functional-mushrooms-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Which medicinal mushroom is best?', answer: 'Depends on your goal. Lion\'s mane: brain health, nerve growth factor. Reishi: immune modulation, sleep. Cordyceps: energy, endurance. Chaga: antioxidant, immune. Turkey tail: immune (PSK/PSP), adjunct cancer therapy (prescription in Japan). There is no single best mushroom — each has distinct bioactives and evidence profiles.' },
  { question: 'Fruiting body vs mycelium — which to buy?', answer: 'Fruiting body (the mushroom cap) contains higher concentrations of the bioactives studied in most research. Mycelium-on-grain products are mostly grain substrate with minimal mushroom material — they are far less potent and should be avoided. Look for products labeled "fruiting body only" with standardized beta-glucan content (minimum 30%). Good brands publish third-party testing for beta-glucans and starch content.' },
  { question: 'How long do mushrooms take to work?', answer: 'Mushrooms work cumulatively — effects typically appear at 4-12 weeks of daily use. They are not acute interventions. Lion\'s mane cognitive effects build over 4-8 weeks. Reishi immune effects are gradual. Cordyceps may show more rapid energy effects (1-2 weeks). Consistency matters more than dose.' },
  { question: 'Can I take multiple mushrooms together?', answer: 'Yes — multi-mushroom blends are common and generally safe. Lion\'s mane + cordyceps (brain + energy) is a popular combination. Reishi + turkey tail (immune support) is another. Each mushroom has distinct mechanisms with no known negative interactions. Start one at a time to assess individual response before stacking.' },
  { question: 'Are mushroom supplements safe?', answer: 'Generally well-tolerated. Side effects: mild GI effects (bloating), rare allergic reactions (mushroom allergy). Reishi can have mild blood-thinning effects — caution with anticoagulants. Lion\'s mane may cause vivid dreams. Choose products tested for heavy metals — mushrooms concentrate environmental contaminants.' },
]

const MUSHROOM_REFS = [
  { n: 1, text: 'Mori K, et al. (2009). Lion\'s mane and mild cognitive impairment. Phytother Res, 23(3): 367-372.', url: 'https://pubmed.ncbi.nlm.nih.gov/18844328/' },
  { n: 2, text: 'Wachtel-Galor S, et al. (2011). Reishi mushroom: immune modulation. Herbal Medicine, CRC Press.', url: 'https://pubmed.ncbi.nlm.nih.gov/22593926/' },
  { n: 3, text: 'Chen S, et al. (2010). Cordyceps and exercise performance. J Altern Complement Med, 16(5): 585-590.', url: 'https://pubmed.ncbi.nlm.nih.gov/20569027/' },
  { n: 4, text: 'Lai PL, et al. (2013). Neurotrophic properties of lion\'s mane. Int J Med Mushrooms, 15(6): 539-554.', url: 'https://pubmed.ncbi.nlm.nih.gov/24266378/' },
]

export default function FunctionalMushroomsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Functional Mushrooms Guide" description="Lion's mane, reishi, cordyceps — evidence-based comparison." url="https://thehippiescientist.net/guides/other/functional-mushrooms-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Functional Mushrooms' }]} />
      <FAQSchema pagePath="/guides/other/functional-mushrooms-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 4 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Functional Mushrooms: Lion&apos;s Mane, Reishi, Cordyceps &amp; Beyond</h1><p className="text-lg leading-8 text-muted">Medicinal mushrooms have been used for millennia in Traditional Chinese Medicine. Modern research has identified specific bioactive compounds — beta-glucans, triterpenes, hericenones — with measurable effects on brain, immune, and energy systems. Here is a practical guide to the five most important functional mushrooms.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>For brain health: lion&apos;s mane</strong> — stimulates nerve growth factor, best evidence for cognition [1,4]. <strong>For immunity: reishi and turkey tail</strong> — beta-glucan immune modulation [2]. <strong>For energy: cordyceps</strong> — may improve exercise performance through ATP production [3]. <strong>For overall antioxidant support: chaga</strong> — highest ORAC score of any food but human evidence is limited. Quality matters enormously — fruiting body extracts are superior to mycelium-on-grain products. Look for standardized beta-glucan content (minimum 30%). Cost: $15-30/month per mushroom. Avoid blends that hide individual mushroom amounts.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Mushroom Selector</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Mushroom</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best For</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th className="text-left py-2 font-semibold text-ink">Key Bioactive</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Lion&apos;s Mane</td><td className="py-2 pr-4">Brain, NGF, cognition</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Preliminary</span></td><td className="py-2 pr-4">500-3,000 mg</td><td className="py-2">Hericenones, erinacines</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Reishi</td><td className="py-2 pr-4">Immune, sleep, stress</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2 pr-4">1,000-3,000 mg</td><td className="py-2">Triterpenes, beta-glucans</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Cordyceps</td><td className="py-2 pr-4">Energy, endurance</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2 pr-4">1,000-3,000 mg</td><td className="py-2">Cordycepin, adenosine</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Chaga</td><td className="py-2 pr-4">Antioxidant, immune</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Limited</span></td><td className="py-2 pr-4">500-1,500 mg</td><td className="py-2">Polysaccharides, betulin</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Turkey Tail</td><td className="py-2 pr-4">Immune, adjunct cancer therapy</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td><td className="py-2 pr-4">1,000-3,000 mg</td><td className="py-2">PSK, PSP (protein-bound polysaccharides)</td></tr>
        </tbody></table></div><div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">Fruiting body &gt; mycelium:</p><p className="mt-1 text-xs leading-5 text-muted">Most commercial mushroom supplements are myceliated grain — the mushroom is grown on grain and the whole mass (mostly grain) is powdered. True fruiting body extracts are more expensive but contain 5-10x the bioactive compounds. Look for "fruiting body only" and standardized beta-glucan content. Brands that meet these standards: Real Mushrooms, Nootropics Depot, Oriveda.</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">How beta-glucans work</h2><p className="text-sm leading-7 text-muted">The primary bioactive in all medicinal mushrooms is beta-glucans — long-chain polysaccharides that bind to dectin-1 and CR3 receptors on immune cells, triggering trained immunity without causing inflammation. This is fundamentally different from direct immune stimulants. Beta-glucan content (minimum 25% for fruiting body) is the most important quality metric. Starch content should be under 5% — high starch indicates grain filler.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">Functional mushrooms are the most evidence-supported category in the medicinal food space. Lion&apos;s mane for brain [1,4], reishi for immune [2], cordyceps for energy [3], turkey tail for immune (prescription-grade in Japan). Quality is the single biggest variable — cheap myceliated grain products have minimal bioactivity. Invest in fruiting body extracts from reputable brands. Start one mushroom at a time to assess effect. Expect gradual, cumulative benefits — mushrooms are not acute interventions. Cost: $15-30/month for a quality single-mushroom extract.</p></section>
      <References refs={MUSHROOM_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Mushrooms, brain health, immunity — evidence over marketing." ctaLabel="Get the evidence" location="guide-mushrooms" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}