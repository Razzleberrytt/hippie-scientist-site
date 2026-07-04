import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Intermittent Fasting Supplements: What Helps and What Breaks a Fast (2026)',
  description: 'Electrolytes, BCAAs, creatine, black coffee, MCT oil — which supplements break a fast and which support it? Evidence-based guide to fasting supplementation.',
  path: '/guides/other/intermittent-fasting-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What supplements break a fast?', answer: 'Anything with calories breaks a fast in the strict sense. BCAAs (4 cal/g), collagen (4 cal/g), protein powder, MCT oil (9 cal/g), and gummy vitamins (sugar) all contain calories and technically break a fast. Black coffee, plain tea, and water with electrolytes (no sugar) do not. The practical question is whether 10-50 calories from supplements meaningfully reduces fasting benefits — and for most people, it probably does not, though the evidence is limited.' },
  { question: 'Should I take electrolytes while fasting?', answer: 'Yes, especially sodium, potassium, and magnesium. Fasting increases electrolyte excretion (particularly during the first 3-5 days as insulin drops and the kidneys excrete more sodium). Symptoms of electrolyte deficiency — headache, fatigue, muscle cramps — are often misattributed to hunger. LMNT or DIY salt + potassium chloride in water is a good strategy. Magnesium glycinate at night supports sleep during fasting.' },
  { question: 'Does creatine break a fast?', answer: 'Technically yes — creatine monohydrate has negligible calories but the insulin response to creatine is minimal. Most fasting experts consider creatine acceptable during a fast because it does not meaningfully affect blood glucose, ketone production, or autophagy. Take it with water. If you want to be strict, take it during your eating window.' },
  { question: 'What about black coffee during fasting?', answer: 'Black coffee (no sugar, no cream) does not break a fast and may enhance some fasting benefits by promoting autophagy and ketone production. Caffeine also suppresses appetite. However, coffee can irritate an empty stomach — if this happens, reduce to one cup or switch to green tea. Avoid bulletproof coffee (butter + MCT oil) — that is 200-400 calories and fully breaks a fast.' },
  { question: 'Do I need supplements specifically for fasting?', answer: 'No — there is no category of "fasting supplements" that has evidence. Electrolytes are the most important. A basic multivitamin during your eating window covers micronutrient gaps. Protein powder helps meet protein targets in a compressed eating window. Everything else is optional and should be evaluated on its own evidence, not because it is marketed for fasting.' },
]

const IF_REFS = [
  { n: 1, text: 'Anton SD, et al. (2018). Flipping the metabolic switch: understanding health benefits of fasting. Obesity, 26(2): 254-268.', url: 'https://pubmed.ncbi.nlm.nih.gov/29086496/' },
  { n: 2, text: 'Varady KA, et al. (2022). Clinical application of intermittent fasting for weight loss. Nat Rev Endocrinol, 18(5): 309-321.', url: 'https://pubmed.ncbi.nlm.nih.gov/35194134/' },
  { n: 3, text: 'Mattson MP, et al. (2017). Impact of intermittent fasting on health and disease processes. Ageing Res Rev, 39: 46-58.', url: 'https://pubmed.ncbi.nlm.nih.gov/27810402/' },
]

export default function IntermittentFastingPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Intermittent Fasting Supplements" description="Which supplements break a fast and which support it?" url="https://thehippiescientist.net/guides/other/intermittent-fasting-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Intermittent Fasting & Supplements' }]} />
      <FAQSchema pagePath="/guides/other/intermittent-fasting-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl">
        <p className="eyebrow-label">Evidence Review · 3 References</p>
        <h1 className="text-5xl font-bold tracking-tight text-ink">Intermittent Fasting Supplements: What Helps and What Breaks a Fast</h1>
        <p className="text-lg leading-8 text-muted">Intermittent fasting has moved from niche biohacking to mainstream nutrition. The supplement industry has responded with fasting-specific products, but most are unnecessary. The real questions are simpler: which supplements support the fast, which break it, and which should you time to your eating window? Here is the evidence-based guide.</p>
      </section>

      <section className="card-premium p-6 space-y-4">
        <h2 className="text-2xl font-semibold">Quick answer</h2>
        <p className="text-sm leading-7 text-muted">
          <strong>Safe during fasting:</strong> electrolytes (sodium, potassium, magnesium), black coffee, plain tea, water, creatine (minimal insulin effect). <strong>Break a fast:</strong> BCAAs, protein powder, collagen, MCT oil, bone broth, gummy vitamins, anything with calories. <strong>Take during eating window:</strong> multivitamin, vitamin D, omega-3, zinc (absorb better with food). The most important supplement during fasting is electrolytes — fasting increases sodium excretion, and deficiency causes headache, fatigue, and cramps that are often misattributed to hunger [1].
        </p>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Fasting Supplement Guide</p>
        <div className="overflow-x-auto">
          <table className="min-w-full text-sm">
            <thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Supplement</th><th className="text-left py-2 pr-4 font-semibold text-ink">Breaks Fast?</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best Timing</th><th className="text-left py-2 font-semibold text-ink">Note</th></tr></thead>
            <tbody className="text-muted">
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Electrolytes</td><td className="py-2 pr-4 text-emerald-700 font-semibold">No</td><td className="py-2 pr-4">Anytime</td><td className="py-2">Most important during fasting</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Black coffee / tea</td><td className="py-2 pr-4 text-emerald-700 font-semibold">No</td><td className="py-2 pr-4">Morning</td><td className="py-2">May enhance autophagy</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Creatine</td><td className="py-2 pr-4 text-amber-700 font-semibold">Technically yes</td><td className="py-2 pr-4">Either</td><td className="py-2">Minimal insulin effect</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">BCAAs / Protein</td><td className="py-2 pr-4 text-red-600 font-semibold">Yes</td><td className="py-2 pr-4">Eating window</td><td className="py-2">Stimulates mTOR, breaks fast</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">MCT oil</td><td className="py-2 pr-4 text-red-600 font-semibold">Yes</td><td className="py-2 pr-4">Eating window</td><td className="py-2">Pure calories (9 cal/g)</td></tr>
              <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Multivitamin</td><td className="py-2 pr-4 text-amber-700 font-semibold">Depends</td><td className="py-2 pr-4">Eating window</td><td className="py-2">Better absorbed with food</td></tr>
              <tr><td className="py-2 pr-4 font-medium text-ink">Vitamin D / Omega-3</td><td className="py-2 pr-4 text-amber-700 font-semibold">Depends</td><td className="py-2 pr-4">Eating window</td><td className="py-2">Fat-soluble — need dietary fat</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200">
          <p className="text-xs font-semibold text-ink">The electrolyte recipe:</p>
          <p className="mt-1 text-xs leading-5 text-muted">1/4 tsp salt (575 mg sodium) + 1/8 tsp potassium chloride (350 mg) + 200-400 mg magnesium glycinate (at night). Costs pennies per day. Commercial electrolyte products work too (LMNT, etc.) but are 30x more expensive for the same minerals.</p>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2>
        <p className="text-sm leading-7 text-muted">The most important supplement during intermittent fasting is electrolytes [1]. Everything else is secondary. Take fat-soluble vitamins (D, omega-3) and food-dependent supplements (zinc, multivitamin) during your eating window. Creatine and black coffee are acceptable during fasting for most people. BCAAs and protein powder break a fast — save them for your eating window. No fasting-specific supplement product is necessary — the category is marketing, not science [2,3].</p>
      </section>
      <References refs={IF_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Fasting, electrolytes, supplements — evidence, not marketing." ctaLabel="Get the evidence" location="guide-intermittent-fasting" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}