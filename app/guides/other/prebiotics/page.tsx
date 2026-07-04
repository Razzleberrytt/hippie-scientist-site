import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Prebiotics: Evidence, Types & Food Sources (2026 Guide)',
  description: 'Prebiotics feed your gut bacteria — but do supplements beat food? 8 cited studies on inulin, FOS, GOS, PHGG, and resistant starch.',
  path: '/guides/other/prebiotics/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Prebiotics vs probiotics — what\'s the difference?', answer: 'Probiotics are live bacteria you consume. Prebiotics are fibers that feed the bacteria already living in your gut. Gibson et al. (2017) ISAPP consensus defined prebiotics as "a substrate selectively utilized by host microorganisms conferring a health benefit" [1]. Probiotics seed, prebiotics feed. You need both for optimal gut health, but prebiotics may be more important long-term because they support resident microbiota.' },
  { question: 'Do prebiotic supplements work?', answer: 'Yes, but modestly. Inulin and FOS at 5-10 g/day consistently increase Bifidobacterium counts and SCFA production within 2 weeks [2]. Holscher et al. (2017) found prebiotic responders maintain elevated Bifidobacterium 12 weeks post-supplementation [3]. Effects are measurable but smaller than what a diverse, high-fiber diet provides. Supplements are useful when food fiber targets (25-35 g/day) cannot be met.' },
  { question: 'Best food sources of prebiotics?', answer: 'Garlic, onions, leeks, asparagus, Jerusalem artichokes, slightly green bananas (resistant starch), oats (beta-glucan), and legumes are richest [1]. Aim for variety — different fibers feed different species. 10-15 different plant foods per week supports the widest bacterial diversity. The Reynolds 2019 Lancet meta-analysis found 25-29 g/day fiber reduced all-cause mortality by 15-30% [4].' },
  { question: 'Why do prebiotics cause gas?', answer: 'Fermentation produces gas (hydrogen, methane, CO₂). Start at 1-2 g/day, increase by 1-2 g every 3-4 days over 2-3 weeks. Most adapt within 1-2 weeks [2]. Persistent bloating at low doses may indicate SIBO or IBS — consult a gastroenterologist. PHGG (partially hydrolyzed guar gum) is the best-tolerated prebiotic for sensitive guts [5].' },
  { question: 'Which prebiotic supplement is best?', answer: 'PHGG — best-tolerated, evidence for IBS [5]. Inulin/FOS — most studied for microbiome support, more gas [2]. GOS — gentler, supports immune function [6]. Resistant starch (green banana flour, potato starch) — metabolic health, 15-30 g/day. Start with PHGG if sensitive; inulin if fiber-tolerant. No supplement replicates the diversity of food fiber [4].' },
]

type RefProps = { n: number; text: string; url?: string }
function Ref({ n, text, url }: RefProps) { return (<li id={`ref-${n}`} className="text-xs leading-5 text-muted"><span className="font-semibold text-ink">[{n}]</span> {text}{url ? <> <a href={url} target="_blank" rel="noopener noreferrer" className="text-brand-700 underline hover:text-brand-800">→</a></> : null}</li>) }

export default function PrebioticsGuide() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Prebiotics: Evidence, Types & Food Sources" description="Prebiotics feed your gut bacteria. 8 cited studies on what works." url="https://thehippiescientist.net/guides/other/prebiotics" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Prebiotics' }]} />
      <FAQSchema pagePath="/guides/other/prebiotics/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 8 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Prebiotics: Feeding Your Gut Bacteria — Does It Matter?</h1><p className="text-lg leading-8 text-muted">The gut microbiome is one of the hottest areas in nutrition, and prebiotics — fibers that selectively feed beneficial bacteria — are central to the conversation. The 2017 ISAPP consensus formalized the definition [1]. But the gap between what prebiotics can do in controlled studies and what supplements promise on the label is substantial. Here&rsquo;s the evidence.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/prebiotics.jpg" alt="Prebiotic-rich foods: garlic, onions, asparagus, green bananas, and oats on a wood surface" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Prebiotic foods — superior to any supplement.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">Prebiotic fibers <strong>consistently increase Bifidobacterium and Lactobacillus counts</strong> and short-chain fatty acid (SCFA) production — this is well-established [2,3]. The Reynolds 2019 Lancet meta-analysis of 185 prospective studies and 58 clinical trials found 25-29 g/day fiber reduced all-cause mortality by 15-30% and cardiovascular mortality by 16-24% [4]. However, isolated prebiotic supplements have much less evidence than dietary fiber for hard outcomes. Most claims beyond bowel regularity and microbiome composition changes are extrapolations from association studies.</p></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Evidence by claim</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Increases beneficial bacteria — Strong evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Inulin and FOS at 5-10 g/day increase Bifidobacterium counts — confirmed across multiple human trials [2]. Holscher (2017, review in Gut Microbes) found prebiotic responders maintain elevated Bifidobacterium and butyrate production for 12 weeks post-supplementation [3]. PHGG at 5-10 g/day shows similar effects with better tolerability. The ISAPP consensus recognizes inulin, FOS, GOS, and lactulose as established prebiotics [1].</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Bowel regularity — Moderate evidence</h3><p className="mt-2 text-sm leading-7 text-muted">Inulin at 10-15 g/day increases stool bulk and frequency in constipation-prone individuals [2]. Effects are comparable to psyllium. The Lancet review confirmed fiber supplementation improves bowel function across populations [4]. Slow titration (1-2 g/week increase) minimizes bloating.</p></div>
          <div className="p-4 rounded-xl bg-amber-50/60"><h3 className="font-semibold text-ink">Immune function — Emerging evidence</h3><p className="mt-2 text-sm leading-7 text-muted">GOS supplementation (2-5 g/day) reduced winter infection incidence in some studies [6]. The mechanism: SCFAs (butyrate, propionate) signal through GPR43/GPR41 receptors on immune cells, promoting regulatory T-cell differentiation [1]. Evidence is preliminary; clinical significance for healthy adults unclear.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Prebiotic types compared</h2>
        <div className="overflow-x-auto"><table className="min-w-[720px] text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Type</th><th className="text-left py-3 pr-4">Best evidence</th><th className="text-left py-3 pr-4">Dose</th><th className="text-left py-3">Tolerability</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Inulin/FOS</td><td className="py-3 pr-4">Bifidobacterium ↑ [2]</td><td className="py-3 pr-4">5-10 g/day</td><td className="py-3">Moderate gas</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">PHGG</td><td className="py-3 pr-4">IBS symptoms ↓ [5]</td><td className="py-3 pr-4">5-10 g/day</td><td className="py-3">Well tolerated</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">GOS</td><td className="py-3 pr-4">Immune modulation [6]</td><td className="py-3 pr-4">2-5 g/day</td><td className="py-3">Well tolerated</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">Resistant starch</td><td className="py-3 pr-4">Insulin sensitivity [7]</td><td className="py-3 pr-4">15-30 g/day</td><td className="py-3">Moderate gas</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Prebiotic fibers reliably shift microbiome composition — this is real [1-3]. A high-fiber diet (25-35 g/day from diverse plant sources) provides greater benefit than any isolated supplement [4]. Prebiotic supplements are reasonable if you consistently fall short of fiber targets: start with PHGG if gut-sensitive, inulin if fiber-tolerant. Expect modest, not transformative, effects. A $20 bag of oats, beans, and vegetables will do more for your gut than a $40 jar of prebiotic powder [8].</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Prebiotic Selector</p>
        <div className="grid gap-3 sm:grid-cols-2">
          <div className="p-3 rounded-xl bg-white"><p className="text-sm font-semibold text-ink">Best: Food First</p><p className="mt-1 text-xs leading-5 text-muted">Garlic, onions, leeks, asparagus, oats, legumes, green bananas. 25-35 g fiber/day from 10-15 plant foods/week.</p></div>
          <div className="p-3 rounded-xl bg-white"><p className="text-sm font-semibold text-ink">Supplement If Needed</p><p className="mt-1 text-xs leading-5 text-muted">PHGG for sensitive gut. Inulin/FOS for general microbiome. GOS for immune. Start at 1-2 g, titrate up. Expect modest effects.</p></div>
        </div></section>

      <section className="card-premium p-6 space-y-3 max-w-4xl"><h2 className="text-xl font-semibold text-ink">References</h2><ol className="space-y-2 list-decimal list-inside text-xs leading-5 text-muted">
        <Ref n={1} text="Gibson GR, et al. (2017). Expert consensus: the International Scientific Association for Probiotics and Prebiotics (ISAPP) consensus on prebiotics. Nat Rev Gastroenterol Hepatol, 14(8): 491-502." url="https://pubmed.ncbi.nlm.nih.gov/28611480/" />
        <Ref n={2} text="Holscher HD. (2017). Dietary fiber and prebiotics and the gastrointestinal microbiota. Gut Microbes, 8(2): 172-184." url="https://pubmed.ncbi.nlm.nih.gov/28165863/" />
        <Ref n={3} text="Holscher HD, et al. (2015). Fiber supplementation influences gut microbiota and SCFA production. Am J Clin Nutr, 101(1): 55-64." url="https://pubmed.ncbi.nlm.nih.gov/25527752/" />
        <Ref n={4} text="Reynolds A, et al. (2019). Carbohydrate quality and human health: a Lancet systematic review and meta-analysis. Lancet, 393(10170): 434-445." url="https://pubmed.ncbi.nlm.nih.gov/30638909/" />
        <Ref n={5} text="Giannini EG, et al. (2006). Partially hydrolyzed guar gum in the treatment of irritable bowel syndrome. Dig Dis Sci, 51(6): 1104-1109." url="https://pubmed.ncbi.nlm.nih.gov/16858568/" />
        <Ref n={6} text="Vulevic J, et al. (2013). Galacto-oligosaccharides and immune function in elderly. Am J Clin Nutr, 98(6): 1490-1498." url="https://pubmed.ncbi.nlm.nih.gov/24088720/" />
        <Ref n={7} text="Robertson MD, et al. (2005). Resistant starch improves insulin sensitivity in healthy subjects. Diabetologia, 48(6): 1218-1225." url="https://pubmed.ncbi.nlm.nih.gov/15778869/" />
        <Ref n={8} text="Deehan EC, et al. (2020). Precision microbiome modulation with discrete dietary fiber structures. Cell Host Microbe, 27(3): 389-404." url="https://pubmed.ncbi.nlm.nih.gov/32101703/" />
      </ol></section>
      <EmailCapture headline="Get evidence reviews like this" description="8 cited studies. No hype." ctaLabel="Get the evidence" location="guide-prebiotics" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}