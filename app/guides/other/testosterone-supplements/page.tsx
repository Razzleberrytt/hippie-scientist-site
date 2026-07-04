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
  title: 'Testosterone Support Supplements: What Actually Works (2026)',
  description: 'Ashwagandha, zinc, vitamin D, magnesium, tongkat ali — evidence-graded review of supplements for testosterone support. Most "test boosters" don\'t work.',
  path: '/guides/other/testosterone-supplements/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'Do testosterone boosters actually work?', answer: 'Most commercial "test boosters" do not work. They are proprietary blends of underdosed ingredients with no clinical evidence. The supplements with actual evidence for supporting testosterone (primarily in deficient men) are: zinc (corrects deficiency), vitamin D (corrects deficiency), magnesium (supports free testosterone), and ashwagandha (modest increases in some studies). Tongkat ali and fenugreek show mixed results.' },
  { question: 'How much can ashwagandha increase testosterone?', answer: 'Modestly. Studies show 14-17% increases in testosterone in men taking 300-600 mg KSM-66 ashwagandha for 8-12 weeks [1]. The mechanism: reduces cortisol, which can suppress testosterone when chronically elevated. Effects are stronger in stressed men with elevated baseline cortisol. Not comparable to exogenous testosterone or TRT.' },
  { question: 'Does zinc increase testosterone?', answer: 'Only if you are deficient. Zinc is essential for testosterone synthesis. Zinc deficiency suppresses testosterone; correcting deficiency restores it. Supplementing zinc when levels are normal does not increase testosterone further. Dose: 25-50 mg/day if deficient. Test zinc levels before supplementing — excess zinc can cause copper deficiency.' },
  { question: 'Can supplements replace TRT?', answer: 'No. Testosterone replacement therapy is prescription medication for diagnosed hypogonadism. Supplements may modestly support testosterone in deficient men but cannot produce the supraphysiological levels achieved by TRT. If you have low testosterone symptoms, get tested (total + free T, SHBG, LH, FSH). Supplements are supportive, not replacement therapy.' },
  { question: 'What lifestyle factors matter most for testosterone?', answer: 'Sleep, body composition, and exercise matter far more than any supplement. Sleep deprivation (under 5 hours/night) reduces testosterone by 10-15% [2]. Obesity — aromatase in fat tissue converts testosterone to estrogen. Resistance training — squats and deadlifts produce acute testosterone increases. Fix these before spending money on supplements.' },
]

const TESTO_REFS = [
  { n: 1, text: 'Lopresti AL, et al. (2019). Ashwagandha and testosterone. Am J Mens Health, 13(2): 1557988319835985.', url: 'https://pubmed.ncbi.nlm.nih.gov/30854916/' },
  { n: 2, text: 'Leproult R, Van Cauter E. (2011). Sleep deprivation and testosterone. JAMA, 305(21): 2173-2174.', url: 'https://pubmed.ncbi.nlm.nih.gov/21632481/' },
  { n: 3, text: 'Prasad AS, et al. (1996). Zinc and testosterone. Nutrition, 12(5): 344-348.', url: 'https://pubmed.ncbi.nlm.nih.gov/8875519/' },
  { n: 4, text: 'Pilz S, et al. (2011). Vitamin D and testosterone. Horm Metab Res, 43(3): 223-225.', url: 'https://pubmed.ncbi.nlm.nih.gov/21154195/' },
]

export default function TestosteronePage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Testosterone Supplements Guide" description="Evidence-graded review of testosterone support supplements." url="https://thehippiescientist.net/guides/other/testosterone-supplements" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Testosterone Supplements' }]} />
      <FAQSchema pagePath="/guides/other/testosterone-supplements/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 4 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Testosterone Supplements: What Actually Works</h1><p className="text-lg leading-8 text-muted">The "test booster" industry is a $2 billion market built on proprietary blends, before-and-after photos, and ingredients dosed at 5% of studied levels. The reality: a few supplements modestly support testosterone in deficient men. Most do nothing. Here&rsquo;s what the evidence shows — and what is just good marketing.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted">The supplements with evidence for testosterone support are: <strong>zinc</strong> (corrects deficiency — no benefit if levels normal [3]), <strong>vitamin D</strong> (corrects deficiency — strong correlation with T levels [4]), <strong>ashwagandha</strong> (14-17% increase in stressed men [1]), and <strong>magnesium</strong> (increases free T by reducing SHBG binding). The biggest factors are lifestyle: sleep, body fat, and resistance training [2]. Most commercial "test boosters" combine underdosed ingredients in a proprietary blend — you cannot know if you are getting studied doses. Buy individual supplements at studied doses instead.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Testosterone Supplement Evidence</p>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Supplement</th><th className="text-left py-2 pr-4 font-semibold text-ink">Mechanism</th><th className="text-left py-2 pr-4 font-semibold text-ink">Evidence</th><th className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th className="text-left py-2 font-semibold text-ink">Who Benefits</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Zinc</td><td className="py-2 pr-4">Enzyme cofactor for T synthesis</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Strong</span></td><td className="py-2 pr-4">25-50 mg/day</td><td className="py-2">Deficient men only</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Vitamin D</td><td className="py-2 pr-4">Nuclear receptor-mediated T production</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-bold text-emerald-800">Moderate</span></td><td className="py-2 pr-4">2,000-5,000 IU</td><td className="py-2">Deficient men (&lt;30 ng/mL)</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Ashwagandha</td><td className="py-2 pr-4">Cortisol reduction → less T suppression</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Moderate</span></td><td className="py-2 pr-4">300-600 mg KSM-66</td><td className="py-2">Stressed men, high cortisol</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">Magnesium</td><td className="py-2 pr-4">Lowers SHBG, increases free T</td><td className="py-2 pr-4"><span className="inline-flex items-center rounded-full bg-amber-100 px-2 py-0.5 text-xs font-bold text-amber-800">Limited</span></td><td className="py-2 pr-4">200-400 mg glycinate</td><td className="py-2">Active men, deficient</td></tr>
        </tbody></table></div>
        <div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">The lifestyle foundation (free):</p><p className="mt-1 text-xs leading-5 text-muted">Sleep 7-8 hours (under 5 hrs = 10-15% T reduction). Maintain healthy body fat (adipose aromatase converts T → estrogen). Resistance train 3×/week. Manage chronic stress. Fix these before spending on supplements. Test total + free T, SHBG, and vitamin D before supplementing — target deficiencies, not normal levels.</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">For most men, the best "testosterone booster" is sleep, exercise, and body composition — not supplements [2]. Fix deficiencies first (zinc, vitamin D) — test, don&rsquo;t guess. Ashwagandha at 300-600 mg may modestly support testosterone in stressed men with high cortisol [1]. Avoid commercial test booster blends — they underdose ingredients and overpromise results. Total monthly cost for evidence-based supplements: $15-30. The rest is marketing.</p></section>
      <References refs={TESTO_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Testosterone, zinc, ashwagandha — evidence, not marketing." ctaLabel="Get the evidence" location="guide-testosterone" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}