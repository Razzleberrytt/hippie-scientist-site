import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Melatonin Dosing: Why Less Is More (2026 Guide)',
  description: 'Most melatonin is overdosed at 3-10 mg. Evidence shows 0.3-1 mg is equally effective with fewer side effects. The complete dosing guide.',
  path: '/guides/other/melatonin-dosage-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Why is most melatonin overdosed?', answer: 'The original 1995 MIT patent for melatonin used 0.3-0.5 mg — the physiological dose. But because melatonin is not patentable as a natural hormone, manufacturers produced higher doses (3-10 mg) to differentiate their products. The clinical evidence consistently shows that 0.3-1 mg is as effective as higher doses for sleep onset, with far fewer side effects (morning grogginess, vivid dreams, next-day impairment). The melatonin industry is built on a dosing mistake.' },
  { question: 'What dose of melatonin should I take for sleep?', answer: '0.3-1 mg, taken 1-2 hours before bed. This produces physiological blood levels (50-200 pg/mL) matching your body\'s natural nighttime melatonin. Higher doses (3-10 mg) produce supraphysiological levels (10-50x normal) that desensitize melatonin receptors over time and cause morning grogginess. Start at 0.3 mg — you can always take more, but you cannot un-take an overdose.' },
  { question: 'Does melatonin work for jet lag?', answer: 'Yes — this is the best-supported use. Take 0.5-5 mg at the target bedtime in your new time zone for 3-5 days after arrival. Eastward travel (phase advance) is harder to adjust to than westward travel. Melatonin is more effective for jet lag than for chronic insomnia because jet lag is a circadian misalignment problem, which is exactly what melatonin evolved to regulate.' },
  { question: 'Is melatonin safe for children?', answer: 'Short-term use appears safe at low doses (0.5-3 mg) for children with sleep disorders, particularly ADHD and autism-related sleep issues. Long-term safety data in children is limited. Melatonin is a hormone — pediatric use should be supervised by a physician. Do not use melatonin as a "sleep gummy" for healthy children with occasional sleep issues — behavioral interventions (consistent bedtime, no screens) should be first-line.' },
  { question: 'Can you build tolerance to melatonin?', answer: 'No — melatonin does not produce tolerance or dependence. Unlike benzodiazepines or z-drugs, melatonin is not a sedative. It is a chronobiotic — it regulates your circadian clock rather than forcing sleep. However, chronic high-dose use (10+ mg) can desensitize melatonin receptors, making your endogenous melatonin less effective. This is reversible by stopping or reducing the dose.' },
]

const MELATONIN_REFS = [
  { n: 1, text: 'Zhdanova IV, et al. (2001). Melatonin doses for sleep. J Clin Endocrinol Metab, 86(1): 129-134.', url: 'https://pubmed.ncbi.nlm.nih.gov/11231984/' },
  { n: 2, text: 'Ferracioli-Oda E, et al. (2013). Melatonin for primary sleep disorders. PLoS ONE, 8(5): e63773.', url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
  { n: 3, text: 'Herxheimer A, Petrie KJ. (2002). Melatonin for jet lag. Cochrane Database Syst Rev, (2): CD001520.', url: 'https://pubmed.ncbi.nlm.nih.gov/12076414/' },
]

export default function MelatoninDosingPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Melatonin Dosing Guide" description="Why 0.3 mg works better than 10 mg." url="https://thehippiescientist.net/guides/other/melatonin-dosage-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Melatonin Dosing' }]} />
      <FAQSchema pagePath="/guides/other/melatonin-dosage-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 3 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Melatonin: Why You Are Probably Taking Too Much</h1><p className="text-lg leading-8 text-muted">The melatonin in your medicine cabinet is almost certainly overdosed. The original MIT research used 0.3 mg. Drugstore melatonin is 3-10 mg — up to 30 times the studied effective dose. Here is why less is more, and how to dose melatonin correctly.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Take 0.3-1 mg of melatonin, not 3-10 mg.</strong> Low-dose melatonin produces physiological blood levels that naturally trigger sleep onset [1]. High-dose melatonin (3-10 mg) produces supraphysiological levels (10-50x normal) — it still works, but causes morning grogginess, vivid dreams, and receptor desensitization with chronic use. The meta-analyses consistently show that melatonin works for sleep onset latency (falling asleep faster) but the dose-response curve is flat — more is not better [2]. For jet lag: 0.5-5 mg at target bedtime for 3-5 days [3]. Cost: $5-10/month for properly dosed melatonin.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Melatonin Dosing by Use</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Use Case</th><th className="text-left py-2 pr-4 font-semibold text-ink">Optimal Dose</th><th className="text-left py-2 pr-4 font-semibold text-ink">Timing</th><th className="text-left py-2 font-semibold text-ink">Duration</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Sleep onset (can not fall asleep)</td><td className="py-2 pr-4">0.3-1 mg</td><td className="py-2 pr-4">1-2 hrs before bed</td><td className="py-2">Ongoing as needed</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Jet lag (eastward)</td><td className="py-2 pr-4">3-5 mg</td><td className="py-2 pr-4">At target bedtime</td><td className="py-2">3-5 days after arrival</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Jet lag (westward)</td><td className="py-2 pr-4">0.5-3 mg</td><td className="py-2 pr-4">At target bedtime</td><td className="py-2">2-4 days after arrival</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Shift work</td><td className="py-2 pr-4">1-3 mg</td><td className="py-2 pr-4">Before daytime sleep</td><td className="py-2">During night shifts</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Children (physician supervised)</td><td className="py-2 pr-4">0.5-3 mg</td><td className="py-2 pr-4">30-60 min before bed</td><td className="py-2">As directed by physician</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Bottom line</h2><p className="text-sm leading-7 text-muted">Most melatonin is overdosed at 3-10 mg. The evidence supports 0.3-1 mg for sleep onset [1,2]. Higher doses do not work better — they just cause more side effects. If your melatonin gives you morning grogginess, reduce the dose, not increase it. The best value: buy 1 mg tablets and break them in half. Or buy liquid melatonin and measure 0.3-0.5 mg. This will cost $5-10/month and work as well as the 10 mg capsules that cost 3x more with 3x the side effects.</p></section>
      <References refs={MELATONIN_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Melatonin dosing — less is more." ctaLabel="Get the evidence" location="guide-melatonin-dosing" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}