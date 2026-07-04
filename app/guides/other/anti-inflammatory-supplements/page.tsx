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
  title: 'Anti-Inflammatory Supplements: Evidence Review (2026)',
  description: 'Turmeric, omega-3, ginger, boswellia, and quercetin — evidence-graded comparison of the best anti-inflammatory supplements for joints, gut, and systemic inflammation.',
  path: '/guides/other/anti-inflammatory-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What is the best natural anti-inflammatory?', answer: 'Turmeric/curcumin has the strongest human evidence for joint inflammation [1]. Omega-3 fatty acids have the broadest evidence — cardiovascular, joint, and systemic inflammatory markers. Ginger shows promise for muscle soreness and menstrual pain. Boswellia has specific evidence for OA knee pain. None replace NSAIDs for acute pain, but all have better long-term safety profiles.' },
  { question: 'Can I replace ibuprofen with turmeric?', answer: 'Not for acute pain. Curcumin\'s anti-inflammatory effect builds over weeks and is much milder than NSAIDs. For chronic inflammatory conditions (OA), curcumin at 500-1,500 mg/day with bioavailability enhancement (piperine or phytosome) may allow some people to reduce NSAID use. Discuss with your doctor — do not stop prescribed medications without medical guidance.' },
  { question: 'How much omega-3 for inflammation?', answer: '2,000-4,000 mg EPA+DHA/day for anti-inflammatory effects — higher than general health doses. This typically requires 4-8 standard fish oil capsules or 2-4 high-concentration ones. Prescription omega-3 (Lovaza, Vascepa) provides 2,000-4,000 mg in fewer pills. Effects on inflammatory markers are dose-dependent and appear at 4-12 weeks.' },
  { question: 'What causes chronic inflammation?', answer: 'Obesity (adipose tissue secretes pro-inflammatory cytokines), poor diet (high in processed foods, sugar, seed oils), chronic stress (elevated cortisol disrupts immune regulation), sleep deprivation, smoking, and sedentary behavior. Supplements can modestly reduce inflammatory markers, but addressing the underlying cause is far more effective.' },
  { question: 'Can I stack anti-inflammatory supplements?', answer: 'Yes, with caution. Curcumin + omega-3 is a well-studied combination for joint health — they work through different pathways (NF-kB/COX vs membrane lipid modulation). Adding ginger or boswellia is generally safe. Monitor for bleeding risk if combining multiple supplements with blood-thinning effects (omega-3, curcumin, ginger all have mild antiplatelet activity).' },
]

const ANTI_INFLAM_REFS = [
  { n: 1, text: 'Daily JW, et al. (2016). Efficacy of turmeric extracts and curcumin for arthritis. J Med Food, 19(8): 717-729.', url: 'https://pubmed.ncbi.nlm.nih.gov/27533649/' },
  { n: 2, text: 'Calder PC. (2017). Omega-3 fatty acids and inflammatory processes. Biochem Soc Trans, 45(5): 1105-1115.', url: 'https://pubmed.ncbi.nlm.nih.gov/28900017/' },
  { n: 3, text: 'Mashhadi NS, et al. (2013). Ginger and inflammation. Int J Prev Med, 4(Suppl 1): S36-S42.', url: 'https://pubmed.ncbi.nlm.nih.gov/23717767/' },  { n: 4, text: 'Mashhadi NS, et al. (2013). Ginger and inflammation. Int J Prev Med, 4(S1): S36-S42.', url: 'https://pubmed.ncbi.nlm.nih.gov/23717767/' },
  { n: 5, text: 'Kimmatkar N, et al. (2003). Boswellia for knee OA. Phytomedicine, 10(1): 3-7.', url: 'https://pubmed.ncbi.nlm.nih.gov/12622457/' },
  { n: 6, text: 'Li Y, et al. (2015). Quercetin and inflammation. Nutrients, 8(3): 167.', url: 'https://pubmed.ncbi.nlm.nih.gov/26999193/' },

]

export default function AntiInflammatoryPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Anti-Inflammatory Supplements" description="Turmeric, omega-3, ginger — evidence-graded comparison." url="https://thehippiescientist.net/guides/other/anti-inflammatory-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Anti-Inflammatory Supplements' }]} />
      <FAQSchema pagePath="/guides/other/anti-inflammatory-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 6 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Anti-Inflammatory Supplements: What the Evidence Shows</h1><p className="text-lg leading-8 text-muted">Chronic inflammation underlies nearly every modern disease — cardiovascular, metabolic, neurodegenerative, and autoimmune. The supplement industry has responded with dozens of "anti-inflammatory" products. Some have evidence. Most don&rsquo;t. Here&rsquo;s the evidence-graded comparison of the five best-studied options.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/anti-inflammatory-supplements.jpg" alt="Turmeric root, omega-3 capsules, and ginger — anti-inflammatory supplements" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Anti-inflammatory supplements — evidence-graded, from strongest to weakest.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">The best evidence supports <strong>omega-3 fatty acids</strong> (broadest anti-inflammatory evidence, cardiovascular and joint outcomes [2]), <strong>curcumin</strong> (strongest joint-specific evidence, needs bioavailability enhancement [1]), and <strong>ginger</strong> (muscle soreness and menstrual pain [3]). Boswellia has OA-specific evidence. Quercetin is mechanistically interesting but human evidence is limited. No supplement replaces the anti-inflammatory effect of weight loss, exercise, sleep, and a whole-foods diet. Start with omega-3 and curcumin — they cover the most ground with the strongest evidence.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Anti-Inflammatory Supplements</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Supplement</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best For</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th className="text-left py-2 font-semibold text-ink">Note</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Omega-3 (EPA/DHA)</td><td className="py-2 pr-4">Systemic, CV, joint</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td><td className="py-2 pr-4">2-4 g EPA+DHA</td><td className="py-2">Mild blood thinning</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Curcumin (Turmeric)</td><td className="py-2 pr-4">Joint (OA), general</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td><td className="py-2 pr-4">500-1500 mg</td><td className="py-2">Needs piperine/phytosome</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Ginger</td><td className="py-2 pr-4">Muscle soreness, menstrual</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2 pr-4">1-2 g/day</td><td className="py-2">Well tolerated</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Boswellia</td><td className="py-2 pr-4">Knee OA</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2 pr-4">300-500 mg AKBA</td><td className="py-2">Fast onset (days-weeks)</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Quercetin</td><td className="py-2 pr-4">Allergy, mast cell</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Limited</span></td><td className="py-2 pr-4">500-1000 mg</td><td className="py-2">Poor bioavailability</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">Recommended stack:</p><p className="mt-1 text-xs leading-5 text-muted">Omega-3 (2 g EPA+DHA) + curcumin (500 mg with piperine) as the core. Add ginger for muscle soreness or boswellia for OA-specific joint pain. Total: $25-40/month for the core two. This is one of the better-evidenced supplement stacks — both have outcome data, not just biomarker changes.</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Omega-3 fatty acids at 2-4 g EPA+DHA/day and curcumin at 500-1,500 mg/day (with bioavailability enhancement) are the two best-evidenced anti-inflammatory supplements [1,2]. They work through different pathways and can be safely combined. Ginger and boswellia are second-line options with specific use cases. No supplement replaces the anti-inflammatory effect of weight loss, exercise, sleep, and a whole-foods diet — but for people with chronic inflammatory conditions, this stack is one of the most evidence-supported interventions in the supplement world.</p></section>
      <References refs={ANTI_INFLAM_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Anti-inflammatory, omega-3, curcumin — evidence, not hype." ctaLabel="Get the evidence" location="guide-anti-inflammatory" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}