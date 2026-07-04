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
  title: 'CoQ10: Heart, Energy & Statin Recovery (2026 Guide)',
  description: 'Coenzyme Q10 for heart failure, statin myopathy, migraines, and fertility. Evidence-based guide to ubiquinone vs ubiquinol, dosing, and who actually benefits.',
  path: '/guides/other/coq10-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Ubiquinone vs ubiquinol — which CoQ10 is better?', answer: 'Ubiquinol is the active form and better absorbed (2-3x higher blood levels than ubiquinone at the same dose). However, ubiquinone is cheaper and your body converts it to ubiquinol. For people over 40 (conversion declines with age) or those on statins, ubiquinol is preferred. For general use, ubiquinone at 200-300 mg/day is adequate and costs half as much.' },
  { question: 'Does CoQ10 help with statin side effects?', answer: 'Probably yes, but the evidence is mixed. A 2018 meta-analysis found CoQ10 reduced statin-associated muscle pain, but effect sizes were small and some trials showed no benefit. The mechanism is plausible — statins deplete CoQ10 by 20-40%. Given the low cost and excellent safety profile, CoQ10 at 200-300 mg/day is a reasonable trial for statin myalgia. If no benefit after 4 weeks, it is unlikely to help.' },
  { question: 'Does CoQ10 help heart failure?', answer: 'Yes — this is the strongest evidence for CoQ10. The Q-SYMBIO trial (2014, n=420) found 300 mg/day ubiquinone reduced all-cause mortality by 43% in heart failure patients over 2 years. This is one of the few supplement trials with a mortality endpoint. CoQ10 is now recommended in some heart failure guidelines as adjunctive therapy. This benefit is specific to heart failure — it does not prevent heart disease in healthy people.' },
  { question: 'Can young people benefit from CoQ10?', answer: 'Rarely. CoQ10 levels peak around age 20 and decline with age. Young healthy adults produce adequate CoQ10 endogenously. The main exceptions: statin users (statins deplete CoQ10), people with mitochondrial disorders, and possibly athletes seeking recovery support (weak evidence). For young healthy adults, CoQ10 supplementation is likely unnecessary.' },
  { question: 'When should I take CoQ10?', answer: 'With a fat-containing meal — CoQ10 is fat-soluble and absorption increases 2-3x with dietary fat. Split the dose (morning and evening) for more stable blood levels. Some people report mild insomnia with evening dosing — if so, take the full dose in the morning. Ubiquinol does not need to be split due to longer half-life.' },
]

const COQ10_REFS = [
  { n: 1, text: 'Mortensen SA, et al. (2014). Q-SYMBIO: CoQ10 in heart failure. JACC Heart Fail, 2(6): 641-649.', url: 'https://pubmed.ncbi.nlm.nih.gov/25282031/' },
  { n: 2, text: 'Banach M, et al. (2018). CoQ10 for statin-associated muscle symptoms. J Am Coll Cardiol, 71(11): 1233-1243.', url: 'https://pubmed.ncbi.nlm.nih.gov/29544607/' },
  { n: 3, text: 'Langsjoen PH, Langsjoen AM. (2014). CoQ10 ubiquinone vs ubiquinol. Biofactors, 30(1): 51-58.', url: 'https://pubmed.ncbi.nlm.nih.gov/18457840/' },
]

export default function CoQ10Page() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="CoQ10 Guide" description="Evidence for heart failure, statins, and mitochondrial health." url="https://thehippiescientist.net/guides/other/coq10-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'CoQ10' }]} />
      <FAQSchema pagePath="/guides/other/coq10-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 3 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">CoQ10: When It Matters and When It Does Not</h1><p className="text-lg leading-8 text-muted">Coenzyme Q10 is essential for mitochondrial energy production — every cell in your body uses it. Supplementation makes sense when levels are depleted: heart failure, statin use, aging, and mitochondrial disorders. For young healthy adults, your body produces all the CoQ10 it needs. Here is who actually benefits.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/coq10-guide.jpg" alt="CoQ10 softgels beside heart health concept" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">CoQ10 — when it matters and when it does not.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>CoQ10 at 200-300 mg/day is evidence-supported for heart failure (43% mortality reduction in Q-SYMBIO trial) [1] and reasonable for statin-associated muscle symptoms [2].</strong> For everyone else, benefit is unlikely. Ubiquinol is better absorbed but costs more — ubiquinone is fine for most people, especially under 50. Take with a fat-containing meal (2-3x better absorption). CoQ10 is most relevant for: heart failure patients, statin users with muscle pain, people over 50, and those with mitochondrial disorders. For young healthy adults, endogenous production is adequate. Cost: $15-30/month for ubiquinone, $30-50 for ubiquinol.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Who Benefits from CoQ10</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Population</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th className="text-left py-2 font-semibold text-ink">Recommendation</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Heart failure</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td><td className="py-2 pr-4">300 mg/day ubiquinone</td><td className="py-2">Adjunctive therapy</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Statin myalgia</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Mixed/Moderate</span></td><td className="py-2 pr-4">200-300 mg/day</td><td className="py-2">Worth trying (4-week trial)</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Migraine prevention</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2 pr-4">300 mg/day</td><td className="py-2">Second-line option</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Young healthy adults</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">None</span></td><td className="py-2 pr-4">N/A</td><td className="py-2">Not recommended</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">CoQ10 is one of the few supplements with a mortality benefit in a specific population — heart failure [1]. For statin myalgia, it is worth a 4-week trial [2]. For young healthy adults, skip it. Ubiquinone at 200-300 mg/day with a fat-containing meal is the most cost-effective approach for most people. This is a supplement where the evidence is unusually strong for specific medical uses and unusually weak for general wellness. Take it if you have a reason — not because the bottle says "heart health."</p></section>
      <References refs={COQ10_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="CoQ10, heart failure, statins — evidence over marketing." ctaLabel="Get the evidence" location="guide-coq10" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}