import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Omega-3 Quality Guide: EPA, DHA, and What to Buy (2026)',
  description: 'Not all fish oil is equal. Evidence-based guide to EPA/DHA ratios, triglyceride vs ethyl ester forms, oxidation, sustainability, and what actually matters.',
  path: '/guides/other/omega-3-quality-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'How much EPA and DHA should I take?', answer: 'For general health: 250-500 mg combined EPA+DHA daily. For cardiovascular risk reduction: 1,000-2,000 mg. For triglyceride lowering: 2,000-4,000 mg (prescription doses). The key metric is total EPA+DHA, not total fish oil. Many cheap products are only 30% EPA+DHA — you need to take 3× as many pills to get the studied dose. Look for 60%+ EPA+DHA concentration.' },
  { question: 'Triglyceride vs ethyl ester — which is better?', answer: 'Triglyceride (rTG) form is better absorbed — roughly 30% higher bioavailability than ethyl ester (EE). Most premium brands use rTG. EE is cheaper and common in drugstore brands. The difference matters at high doses. For general health at low doses (500 mg), the practical difference is small. Check the label: "triglyceride form" or "rTG" = better; no mention = probably EE.' },
  { question: 'How do I know if my fish oil is rancid?', answer: 'Cut open a capsule and smell it. Fresh fish oil smells mildly oceanic. Rancid oil smells distinctly fishy, sour, or "off." Oxidation degrades EPA/DHA and produces harmful lipid peroxides. Buy from brands that publish peroxide values (less than 5 meq/kg is fresh). Store in a dark, cool place — heat and light accelerate oxidation. Refrigerate liquid fish oil.' },
  { question: 'Is algae oil as good as fish oil?', answer: 'Yes, for DHA. Algae oil is the original source of DHA in the marine food chain. It provides comparable DHA levels without fishy burps, heavy metal concerns, or sustainability issues. Algae oil typically has less EPA than fish oil — if you need high EPA (for mood or cardiovascular goals), fish oil or a combined product may be better. Algae is the best choice for vegetarians/vegans.' },
  { question: 'Do I need to worry about mercury in fish oil?', answer: 'No — mercury is water-soluble and partitions into fish protein, not oil. Multiple independent tests show negligible mercury in fish oil supplements. PCB and dioxin contamination is possible but rare in quality products. Look for third-party testing (IFOS, ConsumerLab, NSF) or molecular distillation. The benefits of omega-3s outweigh contamination risks for quality products.' },
]

const OMEGA3_REFS = [
  { n: 1, text: 'GISSI-Prevenzione Investigators. (1999). Dietary supplementation with n-3 PUFA and vitamin E after MI. Lancet, 354(9177): 447-455.', url: 'https://pubmed.ncbi.nlm.nih.gov/10465168/' },
  { n: 2, text: 'Dyerberg J, et al. (2010). Bioavailability of marine n-3 fatty acid formulations. Prostaglandins Leukot Essent Fatty Acids, 83(3): 137-141.', url: 'https://pubmed.ncbi.nlm.nih.gov/20638827/' },
  { n: 3, text: 'Nicholls SJ, et al. (2020). Omega-3 fatty acids and cardiovascular outcomes. JAMA, 324(22): 2268-2280.', url: 'https://pubmed.ncbi.nlm.nih.gov/33190147/' },
  { n: 4, text: 'IFOS (International Fish Oil Standards). Consumer reports on oxidation and purity testing.', url: 'https://www.ifosprogram.com/' },
]

export default function Omega3QualityPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Omega-3 Quality Guide" description="EPA/DHA ratios, rTG vs EE, oxidation, and what to buy." url="https://thehippiescientist.net/guides/other/omega-3-quality-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Omega-3 Quality' }]} />
      <FAQSchema pagePath="/guides/other/omega-3-quality-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 4 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Omega-3: What Actually Matters When You Buy</h1><p className="text-lg leading-8 text-muted">The fish oil aisle is confusing by design — proprietary blends, misleading "total oil" claims, and marketing terms that obscure what actually matters. The only numbers you need: EPA+DHA content per serving, triglyceride vs ethyl ester form, and oxidation freshness. Everything else is noise. Here&rsquo;s how to cut through it.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Look for 60%+ EPA+DHA concentration in triglyceride (rTG) form from a brand that publishes third-party oxidation testing.</strong> Ignore "total fish oil" — a 1,000 mg pill with 30% concentration gives you only 300 mg EPA+DHA. A 1,000 mg pill at 80% gives you 800 mg. Both are "1,000 mg fish oil" on the label. The concentration determines how many pills you need to reach an effective dose. For general health, 500 mg EPA+DHA/day is sufficient. For cardiovascular risk, 1,000-2,000 mg. For triglycerides, 2,000-4,000 mg (prescription typically). Vegetarians: algae oil provides DHA; EPA is lower but some algae products now match fish oil EPA levels.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Omega-3 Quality Checklist</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">What to Check</th><th className="text-left py-2 pr-4 font-semibold text-ink">Good</th><th className="text-left py-2 font-semibold text-ink">Avoid</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">EPA+DHA concentration</td><td className="py-2 pr-4 text-emerald-700">60%+ of total oil</td><td className="py-2 text-red-600">Under 40% (most drugstore brands)</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Molecular form</td><td className="py-2 pr-4 text-emerald-700">Triglyceride (rTG)</td><td className="py-2 text-red-600">Ethyl ester (unless budget-constrained)</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Freshness</td><td className="py-2 pr-4 text-emerald-700">Peroxide &lt;5 meq/kg (published)</td><td className="py-2 text-red-600">No oxidation data available</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Third-party testing</td><td className="py-2 pr-4 text-emerald-700">IFOS, ConsumerLab, NSF certified</td><td className="py-2 text-red-600">No third-party verification</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Sustainability</td><td className="py-2 pr-4 text-emerald-700">MSC certified or algae-based</td><td className="py-2 text-red-600">Unknown sourcing, endangered species</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">The math:</p><p className="mt-1 text-xs leading-5 text-muted">A drugstore 1,000 mg fish oil at 30% EPA+DHA = 300 mg active. You need 4 pills to hit 1,200 mg EPA+DHA. A premium 1,000 mg at 80% = 800 mg active — 1.5 pills to hit 1,200 mg. Premium often costs less per gram of actual EPA+DHA. Always calculate cost per gram of EPA+DHA, not cost per pill.</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Omega-3 supplements are one of the most evidence-supported categories in nutrition [1,3]. The quality variation is enormous — from 30% concentration drugstore brands to 90%+ pharmaceutical-grade products. For most people: choose a triglyceride-form fish oil at 60%+ EPA+DHA, verified by third-party testing, stored properly. Algae oil is an excellent DHA source for vegetarians. Krill oil is overpriced — no outcome benefit over standard fish oil despite phospholipid marketing. Brands that publish IFOS reports: Nordic Naturals, Wiley's, Viva Naturals, Sports Research.</p></section>
      <References refs={OMEGA3_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Omega-3 quality, EPA/DHA, rTG vs EE — evidence, not marketing." ctaLabel="Get the evidence" location="guide-omega3" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}