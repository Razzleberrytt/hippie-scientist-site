import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Adaptogens Compared: Ashwagandha, Rhodiola, Holy Basil & More (2026)',
  description: 'Which adaptogen fits your stress pattern? Evidence-based comparison of ashwagandha, rhodiola, holy basil, eleuthero, and schisandra.',
  path: '/guides/other/adaptogens-compared/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What is an adaptogen?', answer: 'Adaptogens are herbs that help the body adapt to stress and maintain homeostasis. The term was coined in 1947 by Russian scientist N.V. Lazarev. Formal criteria: they must be non-toxic, produce a non-specific resistance to stressors, and have a normalizing effect regardless of the direction of the pathological state [1]. The best-studied adaptogens are ashwagandha, rhodiola, holy basil, eleuthero, and schisandra.' },
  { question: 'Which adaptogen is best for anxiety?', answer: 'Ashwagandha has the strongest evidence for anxiety reduction. A 2019 RCT (n=60) found 240 mg ashwagandha reduced anxiety scores by 44% vs placebo [2]. Kava also shows efficacy for GAD [3]. For daytime anxiety, ashwagandha is better; for sleep-related anxiety, add passionflower or valerian.' },
  { question: 'Which adaptogen is best for fatigue?', answer: 'Rhodiola rosea is best for fatigue and burnout. A 2012 systematic review found rhodiola consistently reduced fatigue symptoms [4]. It is stimulating — avoid in the evening. For chronic, cortisol-driven fatigue, ashwagandha may be better. For post-illness fatigue, eleuthero has traditional use but limited modern evidence.' },
  { question: 'Can I take ashwagandha and rhodiola together?', answer: 'Generally yes — they have complementary profiles (calming vs stimulating) and are commonly stacked [1]. Take ashwagandha in the evening, rhodiola in the morning. However, both affect the HPA axis and thyroid function. Start one at a time, assess for 2-4 weeks, then add the other.' },
  { question: 'How long do adaptogens take to work?', answer: 'Adaptogens work cumulatively — effects typically appear at 2-4 weeks of daily use [1]. Acute effects are rare. This is fundamentally different from anxiolytics (benzodiazepines) or stimulants (caffeine). If you do not notice benefit after 8 weeks, the adaptogen is likely not a fit for your stress pattern.' },
]

const ADAPTOGENS_REFS = [
  { n: 1, text: 'Panossian A, Wikman G. (2010). Effects of adaptogens on the central nervous system. Pharmaceuticals, 3(1): 188-224.', url: 'https://pubmed.ncbi.nlm.nih.gov/27713248/' },
  { n: 2, text: 'Lopresti AL, et al. (2019). Ashwagandha for stress and anxiety: a randomized controlled trial. Medicine, 98(37): e17186.', url: 'https://pubmed.ncbi.nlm.nih.gov/31517876/' },
  { n: 3, text: 'Sarris J, et al. (2013). Kava for generalized anxiety disorder. J Clin Psychopharmacol, 33(5): 643-648.', url: 'https://pubmed.ncbi.nlm.nih.gov/23942365/' },
  { n: 4, text: 'Ishaque S, et al. (2012). Rhodiola rosea for physical and mental fatigue: systematic review. BMC Complement Altern Med, 12: 70.', url: 'https://pubmed.ncbi.nlm.nih.gov/22643043/' },
  { n: 5, text: 'Chandrasekhar K, et al. (2012). Ashwagandha root extract in reducing stress and anxiety. Indian J Psychol Med, 34(3): 255-262.', url: 'https://pubmed.ncbi.nlm.nih.gov/23439798/' },
  { n: 6, text: 'Olsson EM, et al. (2009). Rhodiola rosea for stress-related fatigue. Planta Med, 75(2): 105-112.', url: 'https://pubmed.ncbi.nlm.nih.gov/19016404/' },
  { n: 7, text: 'Panossian A, et al. (2012). Adaptogens stimulate neuropeptide Y and Hsp72. Pharmaceuticals, 5(6): 578-590.', url: 'https://pubmed.ncbi.nlm.nih.gov/' },
]

export default function AdaptogensComparedPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Adaptogens Compared" description="Ashwagandha vs rhodiola vs holy basil — which adaptogen fits your stress pattern?" url="https://thehippiescientist.net/guides/other/adaptogens-compared" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Adaptogens Compared' }]} />
      <FAQSchema pagePath="/guides/other/adaptogens-compared/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 7 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Adaptogens Compared: Find Your Stress Pattern Match</h1><p className="text-lg leading-8 text-muted">Adaptogens are the most interesting category in herbal medicine — herbs that help your body adapt to stress without overstimulating or sedating. But &ldquo;adaptogen&rdquo; is a category, not a prescription. Different adaptogens fit different stress patterns. Ashwagandha calms the overactivated; rhodiola energizes the depleted; holy basil modulates the anxious inflammatory response. Here&rsquo;s how to choose — with evidence for each.</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Adaptogens at a glance</h2>
        <div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-3 pr-4">Adaptogen</th><th className="text-left py-3 pr-4">Best for</th><th className="text-left py-3 pr-4">Direction</th><th className="text-left py-3">Evidence</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Ashwagandha</td><td className="py-3 pr-4">Anxiety, cortisol, sleep</td><td className="py-3 pr-4">Calming</td><td className="py-3">Strong [2,5]</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Rhodiola</td><td className="py-3 pr-4">Fatigue, burnout, focus</td><td className="py-3 pr-4">Stimulating</td><td className="py-3">Moderate [4,6]</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Holy Basil (Tulsi)</td><td className="py-3 pr-4">General stress, inflammation</td><td className="py-3 pr-4">Neutral</td><td className="py-3">Limited</td></tr>
          <tr className="border-b"><td className="py-3 pr-4 font-medium text-ink">Eleuthero</td><td className="py-3 pr-4">Endurance, immune stress</td><td className="py-3 pr-4">Mildly stimulating</td><td className="py-3">Limited</td></tr>
          <tr><td className="py-3 pr-4 font-medium text-ink">Schisandra</td><td className="py-3 pr-4">Liver stress, focus</td><td className="py-3 pr-4">Mildly stimulating</td><td className="py-3">Preliminary</td></tr>
        </tbody></table></div></section>

      <section className="card-premium p-6 space-y-5 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">The three stress patterns</h2>
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Pattern 1: Wired but tired (high cortisol, anxious)</h3><p className="mt-2 text-sm leading-7 text-muted">You feel simultaneously exhausted and unable to relax. Cortisol is elevated, sleep is disrupted, and your mind races at night. <strong>Best fit: Ashwagandha.</strong> Reduces cortisol by 27% in clinical trials [2,5]. Take 240-600 mg in the evening. Monitor thyroid function if taken long-term. The calming effect builds over 2-4 weeks. Avoid rhodiola with this pattern — it will worsen the &ldquo;wired&rdquo; feeling.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Pattern 2: Burned out and depleted (low cortisol, fatigued)</h3><p className="mt-2 text-sm leading-7 text-muted">You are exhausted, unmotivated, and struggling to get through the day. Stress has depleted your reserves rather than overactivating them. <strong>Best fit: Rhodiola.</strong> Improves mental and physical fatigue in multiple trials [4,6]. Take 200-400 mg in the morning. Do not take in the evening — it is stimulating. Effects appear within 1-2 weeks. If you also have anxiety, add ashwagandha in the evening.</p></div>
          <div className="p-4 rounded-xl bg-brand-50/60"><h3 className="font-semibold text-ink">Pattern 3: General life stress (functional, managing)</h3><p className="mt-2 text-sm leading-7 text-muted">You are managing stress reasonably well but want additional support. No dominant symptom — just the cumulative wear of modern life. <strong>Best fit: Holy basil or ashwagandha at lower doses.</strong> Holy basil has anti-inflammatory and mild anxiolytic effects but less clinical trial data than ashwagandha. A morning holy basil tea is a gentle introduction to adaptogens. Ashwagandha at 120-240 mg is appropriate if sleep or anxiety are the primary concerns.</p></div>
        </div>
      </section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">Adaptogens are not interchangeable. Match the herb to your stress pattern: <strong>ashwagandha for the anxious-overactivated</strong> [2,5], <strong>rhodiola for the fatigued-depleted</strong> [4,6], and <strong>holy basil for general maintenance</strong>. Start one at a time for 2-4 weeks before assessing. Most people benefit from ashwagandha first — it has the strongest evidence base and addresses the most common stress pattern. The adaptogen category is real, clinically relevant, and underutilized.</p></section>
      <References refs={ADAPTOGENS_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Adaptogens, stacking safety, evidence — not marketing." ctaLabel="Get the evidence" location="guide-adaptogens" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}