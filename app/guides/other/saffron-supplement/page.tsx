import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Saffron for Depression & Mood: Evidence Review (2026)',
  description: 'Saffron (Crocus sativus) shows surprising evidence for mild-moderate depression. 6 cited studies on mood, anxiety, and how it compares to antidepressants.',
  path: '/guides/other/saffron-supplement/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Does saffron actually work for depression?', answer: 'Yes — surprisingly well in small trials. A 2013 meta-analysis of 5 RCTs found saffron (30 mg/day) was as effective as fluoxetine and imipramine for mild-moderate depression with fewer side effects [1]. A 2019 systematic review confirmed these findings. Effect sizes are moderate (Cohen\'s d ≈ 0.6-0.8). However, most trials are from Iran (where saffron is culturally significant), small (n=30-60), and short-term (6-12 weeks). Larger, independent replication trials are needed.' },
  { question: 'How does saffron work for mood?', answer: 'Saffron\'s active compounds — crocin, crocetin, and safranal — modulate serotonin, dopamine, and norepinephrine reuptake, similar to how SSRIs work [2]. Crocin has additional anti-inflammatory and antioxidant effects that may contribute. The mechanism is pharmacologically plausible and distinct from placebo. Saffron is not just a spice with mood effects — it has measurable neurochemical activity.' },
  { question: 'How much saffron for depression?', answer: '30 mg/day of standardized saffron extract (minimum 2% safranal or crocin), taken in divided doses (15 mg twice daily). This is the most studied dose. Do not use culinary saffron — potency varies dramatically and you would need grams (impossibly expensive). Use a standardized extract. Effects appear at 4-6 weeks. Cost: $15-30/month for quality extract.' },
  { question: 'Is saffron safe?', answer: 'Generally safe at studied doses (30 mg/day). Doses above 5 grams are toxic and can cause miscarriage — do not confuse supplement doses with culinary amounts. Side effects: mild GI upset, dizziness, dry mouth. Theoretical risk of serotonin syndrome when combined with SSRIs/SNRIs — do not combine without prescriber approval. Pregnancy: avoid at supplement doses.' },
  { question: 'Can saffron replace antidepressants?', answer: 'No — saffron has been studied as an adjunct or alternative for mild-moderate depression in small trials. It has not been studied for severe depression, bipolar depression, or suicidal ideation. If you take prescription antidepressants, discuss any changes with your prescriber. Saffron is a promising supplement, not a proven replacement for standard of care.' },
]

const SAFFRON_REFS = [
  { n: 1, text: 'Hausenblas HA, et al. (2013). Saffron for depression: meta-analysis of RCTs. J Integr Med, 11(6): 377-383.', url: 'https://pubmed.ncbi.nlm.nih.gov/24299602/' },
  { n: 2, text: 'Lopresti AL, Drummond PD. (2014). Saffron for depression: systematic review. Hum Psychopharmacol, 29(6): 517-527.', url: 'https://pubmed.ncbi.nlm.nih.gov/25335842/' },
  { n: 3, text: 'Akhondzadeh S, et al. (2005). Crocus sativus in mild-moderate depression. BMC Complement Altern Med, 5: 18.', url: 'https://pubmed.ncbi.nlm.nih.gov/15972035/' },
  { n: 4, text: 'Kell G, et al. (2017). Saffron for adolescent anxiety-depression. J Affect Disord, 224: 146-150.', url: 'https://pubmed.ncbi.nlm.nih.gov/28578182/' },
  { n: 5, text: 'Moshiri E, et al. (2006). Crocus sativus vs fluoxetine in depression. Prog Neuropsychopharmacol Biol Psychiatry, 31(2): 439-442.', url: 'https://pubmed.ncbi.nlm.nih.gov/17174461/' },
  { n: 6, text: 'Marx W, et al. (2019). Saffron for depression, anxiety: systematic review. Nutr Neurosci, 22(7): 457-468.', url: 'https://pubmed.ncbi.nlm.nih.gov/29433395/' },
]

export default function SaffronPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Saffron for Depression" description="Evidence review of saffron for mood and depression." url="https://thehippiescientist.net/guides/other/saffron-supplement" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Saffron' }]} />
      <FAQSchema pagePath="/guides/other/saffron-supplement/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 6 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Saffron for Depression: The Spice That Might Actually Work</h1><p className="text-lg leading-8 text-muted">Saffron is the most expensive spice in the world — and one of the most surprisingly evidence-supported supplements for mood. Multiple RCTs have compared it head-to-head against fluoxetine (Prozac) with comparable results for mild-moderate depression. Here is the evidence.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Saffron extract at 30 mg/day shows moderate antidepressant effects comparable to fluoxetine in small RCTs</strong> [1,2,5]. The evidence is stronger than most herbal antidepressants but weaker than prescription standards. Most trials are from a single country (Iran), small (n=30-60), and short-term (6-12 weeks). The mechanism — serotonin, dopamine, norepinephrine reuptake modulation — is pharmacologically plausible [2]. Saffron is not a replacement for antidepressants but is one of the better-evidenced herbal options for mild-moderate depression. Use standardized extract (not culinary saffron). Do not combine with SSRIs without prescriber approval.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Saffron Evidence</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Metric</th><th className="text-left py-2 font-semibold text-ink">Saffron (30 mg/day)</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Studied for</td><td className="py-2">Mild-moderate depression, anxiety</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Effect vs placebo</td><td className="py-2">Moderate (Cohen&apos;s d ~0.6-0.8)</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">vs fluoxetine (Prozac)</td><td className="py-2">Comparable in small trials</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Mechanism</td><td className="py-2">Serotonin/dopamine/norepinephrine reuptake modulation</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Onset</td><td className="py-2">4-6 weeks</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Cost/mo</td><td className="py-2">$15-30 (standardized extract)</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Evidence grade</td><td className="py-2"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate (small, geographically limited trials)</span></td></tr>
        </tbody></table></div><div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">Important caveats:</p><p className="mt-1 text-xs leading-5 text-muted">Most saffron depression trials come from Iran, where high-quality saffron is accessible and culturally significant. Independent replication in other populations is needed. The trials are small and short-term. Culinary saffron is not a substitute for standardized extract. And most importantly: saffron has theoretical serotonergic activity — do not combine with SSRIs/SNRIs without prescriber approval (serotonin syndrome risk).</p></div></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">Saffron is one of the most evidence-supported herbal antidepressants — the head-to-head data against fluoxetine is unusual for a botanical supplement [1,5]. However, the evidence comes primarily from small Iranian trials and needs independent replication. For mild-moderate depression, saffron extract at 30 mg/day is a reasonable, evidence-informed option — with prescriber oversight and careful attention to serotonergic drug interactions. At $15-30/month, it is less expensive than many prescription antidepressants and has fewer side effects at studied doses.</p></section>
      <References refs={SAFFRON_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Saffron, depression, mood — evidence over trends." ctaLabel="Get the evidence" location="guide-saffron" />
      <div className="pt-4 border-t flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border px-4 py-2 text-sm font-bold transition">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold hover:underline">Herb library →</Link></div>
    </div>
  )
}