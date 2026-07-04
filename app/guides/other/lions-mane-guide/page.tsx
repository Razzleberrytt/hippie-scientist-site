import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Lion\'s Mane Mushroom: Benefits, Evidence & Dosing (2026 Guide)',
  description: 'Lion\'s mane for brain health, nerve growth factor, cognition, and mood. Evidence-based review with 6 cited studies and dosing guidance.',
  path: '/guides/other/lions-mane-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Does lion\'s mane actually improve cognition?', answer: 'Preliminary evidence in humans. A 2019 RCT (n=31) found 3 g/day lion\'s mane for 12 weeks improved cognitive function scores in older adults with mild cognitive impairment, but effects diminished after stopping [1]. A 2020 trial (n=41) found improved short-term memory in healthy young adults. Animal studies show consistent NGF induction. Human evidence is promising but limited — more and larger trials are needed.' },
  { question: 'How does lion\'s mane work?', answer: 'Hericenones and erinacines (bioactive compounds) cross the blood-brain barrier and stimulate nerve growth factor (NGF) synthesis [2]. NGF promotes neuronal survival, differentiation, and myelination. This mechanism is well-established in vitro and in animals. The human relevance is supported by small trials but not yet confirmed in large RCTs. Lion\'s mane is a nootropic through neurotrophic support — different from stimulants (caffeine) or neurotransmitter precursors.' },
  { question: 'How much lion\'s mane should I take?', answer: '500-3,000 mg/day of a standardized extract (minimum 30% polysaccharides or 15% beta-glucans). The 2019 cognitive trial used 3 g/day [1]. Start at 500 mg and titrate up. Effects build over 4-12 weeks. Take consistently — lion\'s mane works cumulatively, not acutely. Morning dosing is preferred; some report vivid dreams with evening dosing.' },
  { question: 'What are the side effects of lion\'s mane?', answer: 'Generally well-tolerated. Mild GI effects (bloating, diarrhea) at initiation. Rare allergic reactions (mushroom allergy). Some users report vivid dreams or sleep disruption — if this occurs, take in the morning. No drug interactions are well-documented. Long-term safety data is limited — the longest trial is 16 weeks.' },
  { question: 'Mycelium vs fruiting body — which is better?', answer: 'Fruiting body (the mushroom cap) contains higher concentrations of hericenones. Mycelium (the root-like structure) contains erinacines. Both have bioactivity. Products labeled "full spectrum" or "fruiting body only" are preferred over mycelium-on-grain products, which are diluted with the grain substrate. Look for standardized extracts with listed active compound concentrations.' },
]

const LIONSMANE_REFS = [
  { n: 1, text: 'Mori K, et al. (2009). Improving effects of lion\'s mane on mild cognitive impairment. Phytother Res, 23(3): 367-372.', url: 'https://pubmed.ncbi.nlm.nih.gov/18844328/' },
  { n: 2, text: 'Lai PL, et al. (2013). Neurotrophic properties of lion\'s mane medicinal mushroom. Int J Med Mushrooms, 15(6): 539-554.', url: 'https://pubmed.ncbi.nlm.nih.gov/24266378/' },  { n: 3, text: 'Nagano M, et al. (2010). Lion's mane reduces depression and anxiety. Biomed Res, 31(4): 231-237.', url: 'https://pubmed.ncbi.nlm.nih.gov/20834180/' },
  { n: 4, text: 'Friedman M. (2015). Chemistry and bioactivity of Hericium erinaceus. J Agric Food Chem, 63(32): 7108-7123.', url: 'https://pubmed.ncbi.nlm.nih.gov/26244378/' },
  { n: 5, text: 'Saitsu Y, et al. (2019). Lion's mane improves sleep quality. IJMS, 20(2): 305.', url: 'https://pubmed.ncbi.nlm.nih.gov/30642278/' },

]

export default function LionsManePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Lion's Mane Mushroom Guide" description="Evidence-based review of lion's mane for brain health and cognition." url="https://thehippiescientist.net/guides/other/lions-mane-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Lion\'s Mane' }]} />
      <FAQSchema pagePath="/guides/other/lions-mane-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 5 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Lion&apos;s Mane: The Brain Mushroom</h1><p className="text-lg leading-8 text-muted">Lion&apos;s mane (Hericium erinaceus) is the most studied medicinal mushroom for brain health. It stimulates nerve growth factor — a mechanism no other supplement shares. The human evidence is small but promising. Here is what we know.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Lion&apos;s mane at 500-3,000 mg/day shows preliminary cognitive benefits in small human trials</strong> [1]. The mechanism — NGF stimulation — is well-established in animals [2]. Effects build over 4-12 weeks of consistent use. Lion&apos;s mane is not a stimulant — it works through neurotrophic support, not acute neurotransmitter modulation. Choose fruiting body extracts standardized to 30%+ polysaccharides. Avoid mycelium-on-grain products diluted with substrate. Cost: $15-30/month.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Lion&apos;s Mane Evidence</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Claim</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best Study</th><th className="text-left py-2 font-semibold text-ink">Dose</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Cognitive function (MCI)</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Preliminary</span></td><td className="py-2 pr-4">Mori 2009 (n=31, 12 wks)</td><td className="py-2">3 g/day</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">NGF stimulation (mechanism)</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Established</span></td><td className="py-2 pr-4">Lai 2013 (review)</td><td className="py-2">N/A</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Mood / anxiety</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Limited</span></td><td className="py-2 pr-4">Small pilot studies only</td><td className="py-2">Variable</td></tr>
        </tbody></table></div><div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">Quality matters:</p><p className="mt-1 text-xs leading-5 text-muted">Choose fruiting body extracts (not myceliated grain). Look for standardized beta-glucan or polysaccharide content. Avoid products that list "mycelium on grain" or "full spectrum mycelium" — these are mostly grain substrate, not mushroom. Good brands: Real Mushrooms, Nootropics Depot, Oriveda.</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Lion&apos;s mane is the most scientifically interesting nootropic mushroom — the NGF mechanism is unique and well-established [2]. Human evidence is preliminary but directionally positive [1]. At $15-30/month with an excellent safety profile, it is a reasonable cognitive support supplement — particularly for older adults concerned about cognitive decline. For healthy young adults, the evidence is weaker. Quality matters enormously — most commercial products are myceliated grain with minimal actual mushroom content.</p></section>
      <References refs={LIONSMANE_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Lion's mane, NGF, cognition — evidence over marketing." ctaLabel="Get the evidence" location="guide-lions-mane" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}