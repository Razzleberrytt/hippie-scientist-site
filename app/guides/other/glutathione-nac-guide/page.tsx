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
  title: 'NAC & Glutathione: The Master Antioxidant System (2026 Guide)',
  description: 'N-acetylcysteine (NAC) and glutathione — your body\'s master antioxidant. Evidence-based guide to liver, lungs, brain, and why oral glutathione is poorly absorbed.',
  path: '/guides/other/glutathione-nac-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Should I take NAC or glutathione?', answer: 'NAC is preferred for most people. NAC is a precursor — your body converts it to glutathione as needed, maintaining normal regulatory control. Oral glutathione has poor bioavailability (mostly broken down in the gut). Liposomal glutathione may improve absorption but costs significantly more. For most goals (liver, lungs, antioxidant), NAC at 600-1,200 mg/day is better supported by evidence and more cost-effective.' },
  { question: 'What is NAC actually good for?', answer: 'NAC has strong evidence for: acetaminophen overdose (FDA-approved IV formulation), COPD exacerbation reduction (600 mg 2x/day), and polycystic ovary syndrome (improves insulin sensitivity). Moderate evidence for: OCD and trichotillomania (as adjunct to SSRIs), contrast-induced nephropathy prevention, and male fertility. Weak evidence for most "detox" and general wellness claims. NAC is a specific tool, not a general health tonic.' },
  { question: 'Can NAC help with hangovers?', answer: 'Possibly, if taken before drinking — not after. NAC replenishes glutathione depleted by alcohol metabolism. A small study found 600 mg NAC before alcohol reduced next-day hangover severity. It does not work as a morning-after cure. More importantly, taking NAC after heavy drinking may worsen liver damage in animal models (reoxygenation injury) — the timing matters. Do not rely on NAC to make heavy drinking safe.' },
  { question: 'Does NAC help with COVID or respiratory infections?', answer: 'NAC was studied extensively during COVID-19 for its mucolytic and antioxidant effects. Results were mixed — some trials showed reduced severity, others showed no benefit. The strongest respiratory evidence is for COPD (reduces exacerbations by ~25%) and as a mucolytic in chronic bronchitis. For colds and flu, evidence is weak. NAC is not a replacement for vaccination or standard care.' },
  { question: 'Is NAC safe long-term?', answer: 'Generally well-tolerated at 600-1,200 mg/day. Side effects: nausea, vomiting, GI upset (more common at higher doses). Rare but serious: anaphylactoid reactions with IV NAC. NAC chelates zinc and copper — long-term use may deplete these minerals. The FDA has questioned NAC\'s status as a dietary supplement since it was approved as a drug first — it remains available but regulatory status is contested.' },
]

const NAC_REFS = [
  { n: 1, text: 'Samuni Y, et al. (2013). The chemistry and biological activities of N-acetylcysteine. Biochim Biophys Acta, 1830(8): 4117-4129.', url: 'https://pubmed.ncbi.nlm.nih.gov/23618697/' },
  { n: 2, text: 'Decramer M, et al. (2005). NAC reduces COPD exacerbations. Lancet, 365(9470): 1552-1560.', url: 'https://pubmed.ncbi.nlm.nih.gov/15866312/' },
  { n: 3, text: 'Grant JE, et al. (2016). NAC in trichotillomania and OCD. JAMA Psychiatry, 73(6): 611-617.', url: 'https://pubmed.ncbi.nlm.nih.gov/27123741/' },
  { n: 4, text: 'Forman HJ, et al. (2009). Glutathione: overview of protective roles. Mol Aspects Med, 30(1-2): 1-12.', url: 'https://pubmed.ncbi.nlm.nih.gov/18796312/' },
]

export default function GlutathioneNACPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="NAC & Glutathione Guide" description="Master antioxidant system explained." url="https://thehippiescientist.net/guides/other/glutathione-nac-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'NAC & Glutathione' }]} />
      <FAQSchema pagePath="/guides/other/glutathione-nac-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 4 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">NAC &amp; Glutathione: Your Body&apos;s Master Antioxidant System</h1><p className="text-lg leading-8 text-muted">Glutathione is your body&apos;s most important intracellular antioxidant — it neutralizes free radicals, supports liver detoxification, and regulates immune function. NAC (N-acetylcysteine) is the precursor that replenishes it. But most glutathione supplements are a waste of money — here&apos;s why, and what actually works.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/glutathione-nac-guide.jpg" alt="NAC capsules on a clinical surface" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">NAC & Glutathione — your master antioxidant system.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Take NAC at 600-1,200 mg/day, not oral glutathione.</strong> NAC is well-absorbed and your body converts exactly what it needs to glutathione [1]. Oral glutathione is largely destroyed in the gut — liposomal forms may work but cost 5-10x more with weaker evidence. NAC has specific clinical evidence for COPD (reduces exacerbations 25%) [2], OCD/trichotillomania (adjunct to SSRIs) [3], and acetaminophen overdose (FDA-approved). For general antioxidant support, NAC is the evidence-based choice. Cost: $10-20/month.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · NAC Evidence</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Condition</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th className="text-left py-2 font-semibold text-ink">NNT</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">COPD exacerbations</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td><td className="py-2 pr-4">600 mg 2x/day</td><td className="py-2">~8</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Acetaminophen overdose</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong (IV)</span></td><td className="py-2 pr-4">Hospital protocol</td><td className="py-2">N/A</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">OCD/Trichotillomania</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2 pr-4">1,200-2,400 mg/day</td><td className="py-2">~5</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">General detox</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-red-100 px-2 py-0.5 text-xs font-bold text-red-800">Weak</span></td><td className="py-2 pr-4">N/A</td><td className="py-2">Marketing, not science</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">NAC at 600-1,200 mg/day is the evidence-based way to support glutathione levels [1]. It has specific clinical evidence for COPD [2] and OCD [3] — but for most people, it is not a necessary supplement. Skip oral glutathione supplements — they are poorly absorbed and overpriced. If you drink alcohol regularly, have a respiratory condition, or take medications metabolized by the liver, NAC is worth discussing with your doctor. For everyone else, your body produces all the glutathione it needs from a normal diet [4].</p></section>
      <References refs={NAC_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="NAC, glutathione, antioxidants — evidence over marketing." ctaLabel="Get the evidence" location="guide-nac" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}