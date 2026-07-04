import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Protein Powder Guide: Whey, Casein, Plant & Collagen Compared (2026)',
  description: 'Whey, casein, soy, pea, collagen — which protein powder fits your goals? Evidence-based comparison of types, absorption rates, and when to use each.',
  path: '/guides/other/protein-powder-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Which protein powder is best?', answer: 'Whey protein has the strongest evidence for muscle protein synthesis — it is fast-absorbing, rich in leucine, and the most studied. Casein is slower-digesting — better before bed. Plant proteins (soy, pea) are nearly equivalent when leucine content is matched. Collagen is not a complete protein — do not use it as your primary protein source. Whey isolate is best if lactose intolerant; whey concentrate if budget-conscious.' },
  { question: 'How much protein do I actually need?', answer: 'RDA: 0.8 g/kg. Athletes and active adults: 1.2-2.0 g/kg. Older adults: 1.2-1.6 g/kg (muscle preservation). Per meal: 20-40 g to maximize muscle protein synthesis. More is not better — protein above 40 g/meal is oxidized for energy, not used for muscle. Spread intake across 3-4 meals. The total daily amount matters more than timing for most people.' },
  { question: 'Does protein powder cause kidney damage?', answer: 'No, in people with healthy kidneys. High protein intake increases glomerular filtration rate — this is a normal physiological response, not damage. In people with existing kidney disease, protein restriction may be necessary under medical guidance. For healthy adults, protein intakes up to 2-3 g/kg show no adverse kidney effects in long-term studies.' },
  { question: 'Whey vs plant protein — is there a difference?', answer: 'Whey is superior for muscle protein synthesis due to higher leucine content and faster absorption. However, plant proteins (soy, pea, rice blends) can match whey when leucine content is equalized — either through larger servings or leucine supplementation. The practical difference is small. Plant proteins are a good choice for vegans or those with dairy intolerance. Soy protein has the best amino acid profile among plant options.' },
  { question: 'When should I take protein powder?', answer: 'Within 2 hours post-workout (the anabolic window is wider than previously thought). Before bed — casein provides sustained amino acid release overnight. Between meals if total daily protein is low. The most important factor is total daily protein intake, not precise timing. First priority: hit your total. Second priority: spread across meals. Third: post-workout timing.' },
]

const PROTEIN_REFS = [
  { n: 1, text: 'Morton RW, et al. (2018). Protein supplementation and resistance training: systematic review and meta-analysis. Br J Sports Med, 52(6): 376-384.', url: 'https://pubmed.ncbi.nlm.nih.gov/28698222/' },
  { n: 2, text: 'Schoenfeld BJ, Aragon AA. (2018). How much protein can the body use for muscle building? J Int Soc Sports Nutr, 15: 10.', url: 'https://pubmed.ncbi.nlm.nih.gov/29497353/' },  { n: 4, text: 'Cermak NM, et al. (2012). Protein supplementation and resistance training. Am J Clin Nutr, 96(6): 1454-1464.', url: 'https://pubmed.ncbi.nlm.nih.gov/23134885/' },
  { n: 5, text: 'Gorissen SH, et al. (2018). Plant-based protein amino acid composition. Nutrients, 10(12): 1971.', url: 'https://pubmed.ncbi.nlm.nih.gov/30544977/' },
  { n: 6, text: 'Devries MC, Phillips SM. (2015). Supplemental protein for muscle mass. Front Nutr, 2: 14.', url: 'https://pubmed.ncbi.nlm.nih.gov/25984521/' },

]

export default function ProteinPowderPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Protein Powder Guide" description="Whey, casein, plant, collagen — which protein fits your goals?" url="https://thehippiescientist.net/guides/other/protein-powder-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Protein Powder Guide' }]} />
      <FAQSchema pagePath="/guides/other/protein-powder-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 5 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Protein Powder: Whey, Casein, Plant &amp; Collagen Compared</h1><p className="text-lg leading-8 text-muted">Protein powder is the most studied, most evidence-supported supplement category in existence. But the differences between whey, casein, plant, and collagen are real — and they matter for your goals. Here is how to choose, with the evidence.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Whey protein is the best all-purpose choice</strong> — fast absorption, high leucine (2.5-3 g/serving), strongest evidence for muscle protein synthesis [1]. <strong>Casein is best before bed</strong> — slow digestion, sustained amino acid release. <strong>Plant blends (soy + pea + rice) are good vegan alternatives</strong> — slightly less effective than whey but the difference is small when total protein and leucine are matched. <strong>Collagen is not a complete protein</strong> — use it for skin/joint goals, not muscle. Daily target: 1.2-2.0 g/kg depending on activity level [2].</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Protein Types Compared</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Type</th><th className="text-left py-2 pr-4 font-semibold text-ink">Absorption</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best For</th><th className="text-left py-2 pr-4 font-semibold text-ink">$/serving</th><th className="text-left py-2 font-semibold text-ink">Leucine</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Whey Isolate</td><td className="py-2 pr-4 text-emerald-700">Fast (1-2 hrs)</td><td className="py-2 pr-4">Post-workout, lactose-free</td><td className="py-2 pr-4">$0.80-1.20</td><td className="py-2">2.5-3 g</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Whey Concentrate</td><td className="py-2 pr-4 text-amber-700">Medium-fast</td><td className="py-2 pr-4">Budget, general use</td><td className="py-2 pr-4">$0.50-0.80</td><td className="py-2">2-2.5 g</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Casein</td><td className="py-2 pr-4 text-amber-700">Slow (6-8 hrs)</td><td className="py-2 pr-4">Before bed, between meals</td><td className="py-2 pr-4">$0.70-1.00</td><td className="py-2">2-2.5 g</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Plant Blend</td><td className="py-2 pr-4 text-amber-700">Medium</td><td className="py-2 pr-4">Vegan, dairy-free</td><td className="py-2 pr-4">$0.60-1.00</td><td className="py-2">1.5-2.5 g</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Collagen</td><td className="py-2 pr-4 text-red-600">Medium</td><td className="py-2 pr-4">Skin, joints (NOT muscle)</td><td className="py-2 pr-4">$0.80-1.50</td><td className="py-2">0.5-0.8 g</td></tr>
        </tbody></table></div><div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">One scoop = 20-30 g protein. Target 1.6 g/kg for muscle growth.</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Whey protein (isolate or concentrate) is the best-supported, best-value protein supplement [1]. Plant blends are a good vegan alternative. Casein for overnight. Collagen is not a muscle-building protein — it has its own evidence for skin and joints, but do not count it toward your daily protein target. Cost: $15-35/month for whey. Most people benefit from protein supplementation because most people undereat protein — but whole food sources (chicken, eggs, Greek yogurt, tofu) are equally effective and provide more micronutrients [2].</p></section>
      <References refs={PROTEIN_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Protein, whey, casein, plant — evidence over marketing." ctaLabel="Get the evidence" location="guide-protein" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}