import type { Metadata } from 'next'
import Link from 'next/link'
import Image from 'next/image'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import RecommendationSection from '@/components/RecommendationSection'
import { getRevenueProductSet } from '@/config/revenue-products'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Sleep Supplements: Evidence-Based Guide to What Works (2026)',
  description: 'Melatonin, magnesium, L-theanine, glycine, valerian, and more — evidence-graded comparison of sleep supplements with dosing, timing, and side effects.',
  path: '/guides/other/sleep-supplements-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What is the best supplement for sleep?', answer: 'There is no universal best supplement. Cognitive behavioral therapy for insomnia (CBT-I) is the recommended first-line treatment for chronic insomnia. Melatonin may fit circadian-timing problems better than general insomnia; evidence for magnesium, L-theanine, and glycine is promising in places but remains limited or population-specific.' },
  { question: 'Is melatonin safe for long-term use?', answer: 'Short-term use appears relatively safe for many adults, but long-term safety is not established. Melatonin can cause sleepiness, headache, dizziness, or nausea and may interact with medicines. Pregnancy, breastfeeding, epilepsy, blood-thinner use, and use in children require professional guidance.' },
  { question: 'Can I combine sleep supplements?', answer: 'Do not assume that a combination is safer or more effective because its ingredients use different mechanisms. Combination evidence is sparse, and alcohol, sedatives, antihistamines, and prescription sleep medicines can increase impairment. Review combinations with a clinician or pharmacist and change only one variable at a time.' },
  { question: 'Does magnesium reliably treat insomnia?', answer: 'Not reliably. A review in older adults found only three small randomized trials with low- to very-low-quality evidence. Magnesium may be more relevant when intake or status is low, but magnesium glycinate has not been established as a general treatment for sleep-maintenance insomnia.' },
  { question: 'When should sleep problems be medically evaluated?', answer: 'Seek evaluation for persistent insomnia, loud snoring or breathing pauses, severe daytime sleepiness, restless legs, mood deterioration, or sleep problems that affect driving or safety. Supplements do not diagnose sleep apnea, circadian disorders, medication effects, or other underlying conditions.' },
]

const SLEEP_REFS = [
  { n: 1, text: 'National Center for Complementary and Integrative Health. Sleep Disorders and Complementary Health Approaches: Usefulness and Safety.', url: 'https://www.nccih.nih.gov/health/sleep-disorders-and-complementary-health-approaches' },
  { n: 2, text: 'Sateia MJ, et al. (2017). Clinical Practice Guideline for the Pharmacologic Treatment of Chronic Insomnia in Adults. Journal of Clinical Sleep Medicine, 13(2): 307-349.', url: 'https://pubmed.ncbi.nlm.nih.gov/27998379/' },
  { n: 3, text: 'Ferracioli-Oda E, et al. (2013). Meta-analysis: melatonin for the treatment of primary sleep disorders. PLoS ONE, 8(5): e63773.', url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
  { n: 4, text: 'National Center for Complementary and Integrative Health. Melatonin: What You Need To Know.', url: 'https://www.nccih.nih.gov/health/melatonin-what-you-need-to-know' },
  { n: 5, text: 'Mah J, Pitre T. (2021). Oral magnesium supplementation for insomnia in older adults: a systematic review and meta-analysis. BMC Complementary Medicine and Therapies, 21: 125.', url: 'https://pubmed.ncbi.nlm.nih.gov/33865376/' },
  { n: 6, text: 'NIH Office of Dietary Supplements. Magnesium: Health Professional Fact Sheet.', url: 'https://ods.od.nih.gov/factsheets/Magnesium-HealthProfessional/' },
  { n: 7, text: 'Bulman A, et al. (2025). The effects of L-theanine consumption on sleep outcomes: a systematic review and meta-analysis. Sleep Medicine Reviews, 81: 102076.', url: 'https://pubmed.ncbi.nlm.nih.gov/40056718/' },
  { n: 8, text: 'Razak MA, et al. (2023). The effect of glycine administration on the characteristics of physiological systems in human adults: a systematic review. Frontiers in Nutrition, 10: 1208472.', url: 'https://pubmed.ncbi.nlm.nih.gov/37851316/' },
]

export default function SleepSupplementsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Sleep Supplements Guide" description="Evidence-graded comparison of melatonin, magnesium, L-theanine, and more." url="https://thehippiescientist.net/guides/other/sleep-supplements-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Sleep Supplements' }]} />
      <FAQSchema pagePath="/guides/other/sleep-supplements-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 8 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Sleep Supplements: What the Evidence Can—and Cannot—Tell You</h1><p className="text-lg leading-8 text-muted">Sleep onset, circadian timing, sleep apnea, medication effects, and chronic insomnia are different problems. This guide separates modest or preliminary supplement signals from established care and helps identify when a product is unlikely to address the real cause.</p>
        <figure className="mt-6"><div className="overflow-hidden rounded-2xl border border-brand-900/10 shadow-sm bg-white"><Image src="/images/guides/sleep-supplements-guide.jpg" alt="Sleep supplements beside chamomile tea and lavender" width={1536} height={1024} priority className="w-full h-auto" /></div><figcaption className="mt-3 text-center text-sm text-muted">Sleep supplements — match the supplement to the problem.</figcaption></figure></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>No supplement is a first-line treatment for chronic insomnia.</strong> CBT-I has the strongest guideline support. Melatonin has a clearer role in circadian-timing problems and, on average, produces only modest changes in general insomnia outcomes. Evidence for magnesium is low quality and population-specific; L-theanine shows small subjective improvements but still needs better trials in clinical insomnia; glycine evidence is preliminary [1-3,5,7,8].</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Evidence and Fit</p><p className="text-sm leading-7 text-muted">Use this table to narrow the question, not to self-diagnose or build a stack.</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Option</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence signal</th><th className="text-left py-2 pr-4 font-semibold text-ink">Possible fit</th><th className="text-left py-2 font-semibold text-ink">Main limitation</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">CBT-I</td><td className="py-2 pr-4">Guideline-supported</td><td className="py-2 pr-4">Chronic insomnia</td><td className="py-2">Requires access and participation</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Melatonin</td><td className="py-2 pr-4">Modest, context-dependent</td><td className="py-2 pr-4">Circadian timing; some sleep-onset problems</td><td className="py-2">Not a broad chronic-insomnia solution [1-4]</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">L-theanine</td><td className="py-2 pr-4">Small subjective improvements</td><td className="py-2 pr-4">Healthy adults with sleep complaints</td><td className="py-2">Pure-product and clinical-insomnia evidence remains limited [7]</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Magnesium</td><td className="py-2 pr-4">Low to very-low certainty</td><td className="py-2 pr-4">Possible low intake or deficiency context</td><td className="py-2">Not established for sleep maintenance [5,6]</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Glycine</td><td className="py-2 pr-4">Preliminary</td><td className="py-2 pr-4">Research interest only</td><td className="py-2">Small studies with high risk of bias [8]</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Start by identifying the sleep problem and screening for an underlying disorder. Treat melatonin as a circadian signal with modest average effects, not a universal sedative. Do not present magnesium, L-theanine, glycine, or their combinations as established treatments for sleep-maintenance insomnia. If symptoms are persistent or impair safety, move to clinical assessment and CBT-I rather than adding more products [1,2].</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">A safer decision sequence</h2><ol className="list-decimal space-y-3 pl-5 text-sm leading-7 text-muted"><li><strong className="text-ink">Screen the pattern:</strong> onset, schedule shift, breathing symptoms, restless legs, pain, medication effects, or mood symptoms.</li><li><strong className="text-ink">Review safety first:</strong> medicines, pregnancy or breastfeeding, epilepsy, kidney function, alcohol, and other sedatives can change the risk.</li><li><strong className="text-ink">Avoid stacking:</strong> combination benefits are not established. If a clinician agrees that a trial is reasonable, change one variable at a time and stop for next-day impairment or other adverse effects.</li></ol></section>

      <section className="rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-7 text-amber-950 dark:border-amber-400/20 dark:bg-amber-950/30 dark:text-amber-100"><h2 className="text-xl font-semibold">Safety checks that belong before a cart</h2><ul className="mt-3 list-disc space-y-2 pl-5"><li>Supplemental magnesium can cause diarrhea and interact with some medicines; toxicity risk rises with impaired kidney function. The adult upper limit from supplements and medicines is 350 mg/day unless a clinician recommends otherwise [6].</li><li>Long-term melatonin safety is not established. Medication use, epilepsy, pregnancy, breastfeeding, and use in children warrant professional guidance [4].</li><li>Avoid driving or hazardous work after anything that causes next-day sleepiness. Do not combine sleep products with alcohol or prescription sedatives without clinical review.</li></ul><Link href="/info/disclaimer/" className="mt-3 inline-flex font-semibold underline underline-offset-4">Read the health-information disclaimer</Link></section>
      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
        <div className="space-y-4">
          {FAQS.map((faq) => (
            <div key={faq.question} className="rounded-xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-semibold text-ink">{faq.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{faq.answer}</p>
            </div>
          ))}
        </div>
      </section>

      <section className="card-premium p-6 space-y-3 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Related reading</h2>
        <p className="text-sm leading-7 text-muted">Deeper guides for each part of a sleep stack:</p>
        <ul className="grid gap-2 sm:grid-cols-2 text-sm font-semibold text-brand-800">
          <li><Link href="/guides/sleep/best-natural-sleep-aids-that-work/" className="hover:underline">Best natural sleep aids that work →</Link></li>
          <li><Link href="/guides/sleep/sleep-stack-guide/" className="hover:underline">How to build a sleep stack →</Link></li>
          <li><Link href="/guides/other/melatonin-dosage-guide/" className="hover:underline">Melatonin dosage guide →</Link></li>
          <li><Link href="/guides/other/magnesium-types-guide/" className="hover:underline">Magnesium types guide →</Link></li>
          <li><Link href="/compounds/magnesium-glycinate/" className="hover:underline">Magnesium glycinate profile →</Link></li>
          <li><Link href="/compounds/l-theanine/" className="hover:underline">L-theanine compound profile →</Link></li>
        </ul>
      </section>

      <div className="max-w-4xl">
        <RecommendationSection
          title="Magnesium sourcing examples—only when magnesium fits"
          description="These are product-quality starting points, not sleep-treatment rankings. Magnesium has low-certainty insomnia evidence and is most relevant when intake or status may be low. Check elemental magnesium, kidney function, medication interactions, and the 350 mg/day supplemental upper limit before buying."
          products={getRevenueProductSet('magnesium')?.products ?? []}
        />
      </div>

      <References refs={SLEEP_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Sleep supplements, melatonin, magnesium — evidence over marketing." ctaLabel="Get the evidence" location="guide-sleep" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}
