import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Prebiotics: Benefits, Sources & Evidence Review (2026)',
  description: 'Prebiotics feed your gut bacteria — but do supplements work better than food? Evidence review of inulin, FOS, GOS, and resistant starch for gut health.',
  path: '/guides/other/prebiotics/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What\'s the difference between prebiotics and probiotics?', answer: 'Probiotics are live bacteria you consume. Prebiotics are fibers that feed the bacteria already living in your gut. Think of it like a garden: probiotics are seeds, prebiotics are fertilizer. You need both for optimal gut health, but prebiotics may be more important long-term because they support your existing microbiome rather than introducing transient strains.' },
  { question: 'Do prebiotic supplements work?', answer: 'Yes, but modestly. Inulin and FOS at 5-10 g/day consistently increase Bifidobacterium counts and short-chain fatty acid production within 2-4 weeks. Effects are measurable but smaller than what you get from a diverse, high-fiber diet. Prebiotic supplements are useful for people who cannot reach 25-35 g of daily fiber through food alone.' },
  { question: 'What are the best food sources of prebiotics?', answer: 'Garlic, onions, leeks, asparagus, Jerusalem artichokes, slightly green bananas, oats, and legumes are the richest sources. Aim for variety — different fibers feed different bacterial species. A diet with 10-15 different plant foods per week supports the widest range of gut bacteria. Supplements can fill gaps but should not replace food diversity.' },
  { question: 'Do prebiotics cause gas and bloating?', answer: 'Yes, especially at first. Fermentation of prebiotic fibers produces gas as a byproduct. Start at 1-2 g/day and increase by 1-2 g every 3-4 days over 2-3 weeks. Most people adapt within 1-2 weeks. If bloating persists at low doses, you may have SIBO or IBS and should consult a gastroenterologist before continuing.' },
  { question: 'Which prebiotic supplement is best?', answer: 'Partially hydrolyzed guar gum (PHGG) is the best-tolerated and has evidence for IBS. Inulin and FOS are the most studied for general microbiome support but cause more gas. GOS (galacto-oligosaccharides) is gentler and supports immune function. Start with PHGG if you have a sensitive gut; inulin if you tolerate fiber well and want the most studied option.' },
]

export default function PrebioticsGuidePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Prebiotics: Benefits, Sources & Evidence" description="Prebiotics feed your gut bacteria — but do supplements work better than food?" url="https://thehippiescientist.net/guides/other/prebiotics" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Prebiotics' }]} />
      <FAQSchema pagePath="/guides/other/prebiotics/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review</p><h1 className="text-5xl font-bold tracking-tight text-ink">Prebiotics: Feeding Your Gut Bacteria — Does It Matter?</h1><p className="text-lg leading-8 text-muted">The gut microbiome is one of the hottest areas in nutrition science, and prebiotics — fibers that feed beneficial bacteria — are central to the conversation. But the gap between what prebiotics can do and what supplements promise is substantial. Here's what the evidence actually shows.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">Prebiotic fibers <strong>consistently increase beneficial bacteria</strong> (Bifidobacterium, Lactobacillus) and short-chain fatty acid production in the colon. This is well-established. Whether this translates to meaningful health improvements — better digestion, stronger immunity, reduced disease risk — is less clear. The strongest evidence is for improved bowel regularity and modest immune support. Most other claims (weight loss, mood, skin, longevity) are based on mechanistic reasoning rather than direct clinical evidence. Food sources of prebiotics (garlic, onions, oats, legumes) are superior to supplements because they provide fiber diversity, micronutrients, and phytochemicals that isolated fibers cannot replicate.</p></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by claim</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Increases beneficial bacteria — Strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Inulin, FOS, and GOS at 5-10 g/day reliably increase Bifidobacterium and Lactobacillus counts in human trials. This is the most consistent finding in prebiotic research. PHGG shows similar effects with better tolerability. Effects appear within 2 weeks and are sustained with continued intake.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Bowel regularity — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Prebiotic fibers increase stool bulk and frequency in constipation-prone individuals. Inulin at 10-15 g/day is most studied. Effects are comparable to other soluble fibers like psyllium. Start low to avoid bloating.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Immune function — Emerging evidence</h3><p className="mt-2 text-sm leading-7 text-muted">GOS supplementation has been shown to reduce winter infection incidence in some studies. The mechanism involves short-chain fatty acid signaling to immune cells. Evidence is preliminary and the clinical significance for healthy adults is unclear.</p></div>
          <div className="p-4 rounded-xl bg-red-50/60"><h3 className="font-semibold text-ink">Weight loss, mood, skin, longevity — No direct evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Claims about prebiotics for weight loss, mental health, skin health, or longevity are extrapolations from gut-brain axis and microbiome association studies. No randomized trials demonstrate these outcomes from prebiotic supplementation alone.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Prebiotic types compared</h2>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Type</th><th className="text-left py-3 pr-4">Best for</th><th className="text-left py-3 pr-4">Dose</th><th className="text-left py-3">Tolerance</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Inulin/FOS</td><td className="py-3 pr-4">General microbiome</td><td className="py-3 pr-4">5-10 g/day</td><td className="py-3">Moderate gas</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">PHGG</td><td className="py-3 pr-4">IBS, sensitive gut</td><td className="py-3 pr-4">5-10 g/day</td><td className="py-3">Very well tolerated</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">GOS</td><td className="py-3 pr-4">Immune, gentle</td><td className="py-3 pr-4">2-5 g/day</td><td className="py-3">Well tolerated</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">Resistant starch</td><td className="py-3 pr-4">Metabolic health</td><td className="py-3 pr-4">15-30 g/day</td><td className="py-3">Moderate gas</td></tr>
        </tbody></table></div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Food vs. supplements</h2><p className="text-sm leading-7 text-muted">A diet rich in garlic, onions, leeks, asparagus, oats, legumes, and slightly green bananas provides prebiotic fibers plus vitamins, minerals, polyphenols, and fiber diversity that no supplement can match. The target is 25-35 g of total fiber daily from 10-15 different plant foods per week.</p><p className="text-sm leading-7 text-muted">Prebiotic supplements are reasonable if you consistently fall short of fiber targets and cannot increase food intake. Start with PHGG if you have a sensitive gut, inulin if you tolerate fiber well. Expect modest, not transformative, effects. A $20 bag of oats, beans, and vegetables will do more for your gut microbiome than a $40 jar of prebiotic powder.</p></section>
      <EmailCapture headline="Get evidence reviews like this" description="No hype, no affiliate bias. Just evidence." ctaLabel="Get the evidence" location="guide-prebiotics" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}