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
  title: 'Probiotic Strains Guide: Which One Actually Works? (2026)',
  description: 'Not all probiotics are equal. Evidence-based guide to Lactobacillus, Bifidobacterium, Saccharomyces strains — which work for IBS, diarrhea, immunity, and mood.',
  path: '/guides/other/probiotic-strains-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Which probiotic strain is best?', answer: '"Best" depends on what you\'re treating. Lactobacillus rhamnosus GG has the strongest evidence for antibiotic-associated diarrhea [1]. Bifidobacterium infantis 35624 for IBS [2]. Saccharomyces boulardii for traveler\'s diarrhea and C. difficile prevention. Lactobacillus plantarum 299v for bloating. There is no single "best" probiotic — strain specificity matters more than CFU count.' },
  { question: 'How many CFUs do I need?', answer: '5-50 billion CFU/day is the studied range for most conditions. Higher CFU does not mean better — strain identity and clinical evidence matter more. Antibiotic-associated diarrhea: 5-10 billion. IBS: 10-25 billion. General gut health: 10-20 billion. Products claiming 100+ billion CFU are marketing-driven — no evidence they outperform lower doses for most outcomes.' },
  { question: 'Do probiotics survive stomach acid?', answer: 'It depends on the strain and formulation. Lactobacillus and Bifidobacterium species are relatively acid-resistant. Enteric-coated capsules improve survival. Taking with food (especially fat-containing meals) buffers stomach acid. Saccharomyces boulardii is a yeast — inherently acid-resistant. Freeze-dried probiotics are stable at room temperature; some require refrigeration.' },
  { question: 'Should I take probiotics with antibiotics?', answer: 'Yes, but separate by 2-3 hours. Saccharomyces boulardii and Lactobacillus rhamnosus GG have the strongest evidence for preventing antibiotic-associated diarrhea [1]. Start on day 1 of antibiotics and continue for 1-2 weeks after. Do not take simultaneously — the antibiotic will kill the probiotic. Probiotics are not recommended for immunocompromised patients.' },
  { question: 'Are probiotic foods as good as supplements?', answer: 'Fermented foods (yogurt, kefir, kimchi, sauerkraut) provide diverse bacterial strains plus beneficial metabolites — something supplements cannot replicate. However, strain identity and CFU counts in foods are uncontrolled and variable. For specific clinical outcomes (IBS, AAD), supplements with studied strains at studied doses are more reliable. For general health, fermented foods are an excellent (and cheaper) foundation.' },
]

const PROBIOTIC_REFS = [
  { n: 1, text: 'Hempel S, et al. (2012). Probiotics for the prevention of antibiotic-associated diarrhea. JAMA, 307(18): 1959-1969.', url: 'https://pubmed.ncbi.nlm.nih.gov/22570464/' },
  { n: 2, text: 'Ford AC, et al. (2014). Efficacy of probiotics in irritable bowel syndrome. Am J Gastroenterol, 109(10): 1547-1561.', url: 'https://pubmed.ncbi.nlm.nih.gov/25091171/' },
  { n: 3, text: 'McFarland LV. (2010). Saccharomyces boulardii: a review. Gastroenterol, 138(5): 1846-1854.', url: 'https://pubmed.ncbi.nlm.nih.gov/20303902/' },
  { n: 4, text: 'Hill C, et al. (2014). The ISAPP consensus on probiotics. Nat Rev Gastroenterol Hepatol, 11(8): 506-514.', url: 'https://pubmed.ncbi.nlm.nih.gov/24912386/' },  { n: 5, text: 'Szajewska H, et al. (2015). Probiotics for acute gastroenteritis. J Pediatr Gastroenterol Nutr, 60(5): 593-601.', url: 'https://pubmed.ncbi.nlm.nih.gov/25855939/' },
  { n: 6, text: 'Sanders ME, et al. (2019). Probiotics and prebiotics: ISAPP consensus. Nat Rev Gastroenterol Hepatol, 16(10): 605-616.', url: 'https://pubmed.ncbi.nlm.nih.gov/31296969/' },

]

export default function ProbioticStrainsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Probiotic Strains Guide" description="Which probiotic strains actually work for IBS, diarrhea, immunity, and mood?" url="https://thehippiescientist.net/guides/other/probiotic-strains-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Probiotic Strains' }]} />
      <FAQSchema pagePath="/guides/other/probiotic-strains-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 6 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Probiotic Strains: Which Ones Actually Work?</h1><p className="text-lg leading-8 text-muted">The probiotic aisle has become a CFU arms race — 50 billion, 100 billion, 200 billion. But strain identity matters far more than CFU count. A specific strain at 5 billion CFU with clinical evidence outperforms a generic blend at 100 billion CFU with none. Here
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/probiotic-strains-guide.jpg" alt="Probiotic capsules beside yogurt, kimchi, and kombucha" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Probiotic strains — match the strain to the condition.</figcaption></figure>&rsquo;s which strains have human evidence — and for what.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">Probiotics are <strong>strain-specific, condition-specific interventions</strong> — not general gut health tonics. The strongest evidence exists for: antibiotic-associated diarrhea (L. rhamnosus GG, S. boulardii; NNT = 13) [1], IBS (B. infantis 35624) [2], and traveler&rsquo;s diarrhea (S. boulardii) [3]. For general gut health in healthy adults, evidence is weak — a diverse fiber-rich diet likely outperforms any probiotic. Match the strain to the condition. Ignore CFU count as a primary decision metric. Most generic "digestive health" blends have no specific clinical evidence for their specific formulation.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Probiotic Strain Selector</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Condition</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best Strain</th><th className="text-left py-2 pr-4 font-semibold text-ink">CFU</th><th className="text-left py-2 font-semibold text-ink">Evidence</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Antibiotic-associated diarrhea</td><td className="py-2 pr-4">S. boulardii, L. rhamnosus GG</td><td className="py-2 pr-4">5-10 billion</td><td className="py-2"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">IBS (overall symptoms)</td><td className="py-2 pr-4">B. infantis 35624</td><td className="py-2 pr-4">10-25 billion</td><td className="py-2"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Bloating & gas</td><td className="py-2 pr-4">L. plantarum 299v</td><td className="py-2 pr-4">10-25 billion</td><td className="py-2"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Constipation</td><td className="py-2 pr-4">B. lactis BB-12</td><td className="py-2 pr-4">25-50 billion</td><td className="py-2"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Traveler\'s diarrhea</td><td className="py-2 pr-4">S. boulardii</td><td className="py-2 pr-4">5 billion (preventive)</td><td className="py-2"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">General gut health</td><td className="py-2 pr-4">Fermented foods over supplements</td><td className="py-2 pr-4">N/A</td><td className="py-2"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Weak</span></td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">The probiotic rule:</p><p className="mt-1 text-xs leading-5 text-muted">Match strain to condition. Separate from antibiotics by 2-3 hours. Continue 1-2 weeks after antibiotics. Give 4-8 weeks to assess effect. If no benefit by week 8, the strain is not a match for your microbiome. Fermented foods (yogurt, kefir, kimchi) provide diverse bacteria plus metabolites — a better foundation than any single supplement [4].</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Probiotics work — for specific conditions with specific strains at studied doses. The evidence is strongest for antibiotic-associated diarrhea (NNT=13), IBS, and traveler&rsquo;s diarrhea [1,2,3]. For general gut health, fermented foods and a high-fiber diet provide greater benefit at lower cost than any supplement [4]. When buying: look for named strains (not just species), studied CFU ranges, and third-party verification. Avoid proprietary blends that hide individual strain amounts. The best probiotic is the one matched to your specific condition — not the one with the biggest number on the bottle.</p></section>
      <References refs={PROBIOTIC_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Probiotic strains, IBS, diarrhea — evidence, not CFU marketing." ctaLabel="Get the evidence" location="guide-probiotics" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}