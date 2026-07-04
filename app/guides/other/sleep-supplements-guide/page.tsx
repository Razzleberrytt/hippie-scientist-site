import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FAQSchema from '@/components/seo/FAQSchema'
import References from '@/components/References'
import EmailCapture from '../../../../components/EmailCapture'

export const metadata: Metadata = buildPageMetadata({
  title: 'Sleep Supplements: Evidence-Based Guide to What Works (2026)',
  description: 'Melatonin, magnesium, L-theanine, glycine, valerian, and more — evidence-graded comparison of sleep supplements with dosing, timing, and side effects.',
  path: '/guides/other/sleep-supplements-guide/',
  openGraphType: 'article',
})

const FAQS = [
  { question: 'What is the best supplement for sleep?', answer: 'Depends on your sleep problem. Sleep onset (can\'t fall asleep): melatonin (0.3-1 mg) or L-theanine (200 mg). Sleep maintenance (can\'t stay asleep): magnesium glycinate (200-400 mg) or glycine (3 g). Racing mind: L-theanine or magnesium. Circadian disruption: melatonin. The most broadly effective, lowest-risk starting point is magnesium glycinate + L-theanine.' },
  { question: 'Is melatonin safe for long-term use?', answer: 'Low-dose melatonin (0.3-1 mg) appears safe for long-term use in adults. High-dose melatonin (5-10 mg) produces supraphysiological levels (10-50x normal) and can cause morning grogginess, vivid dreams, and hormone disruption. Most commercial melatonin is overdosed at 3-10 mg. Start at 0.3-1 mg. Melatonin is a hormone — treat it accordingly.' },
  { question: 'Can I combine sleep supplements?', answer: 'Yes, many are safely combined with complementary mechanisms. Magnesium glycinate + L-theanine is an evidence-supported, well-tolerated combination. Melatonin + magnesium targets different systems (timing vs relaxation). Avoid combining multiple GABAergic sedatives (kava + valerian + passionflower + alcohol) — additive CNS depression risk. Start one at a time before stacking.' },
  { question: 'Do sleep supplements cause morning grogginess?', answer: 'Some do. Melatonin above 1-3 mg commonly causes grogginess. Diphenhydramine (Benadryl, ZzzQuil) causes significant next-day impairment and is not recommended for regular use. Magnesium glycinate and L-theanine rarely cause grogginess at standard doses. Glycine at 3 g actually improves next-day alertness in some studies.' },
  { question: 'What sleep hygiene changes work better than supplements?', answer: 'Consistent sleep-wake schedule (same time every day). Darkness (blackout curtains, no screens 1 hour before bed). Cool room (65-68 F/18-20 C). No caffeine after 2 PM. No alcohol within 3 hours of bed. Exercise during the day. These lifestyle factors have stronger evidence than any supplement [1]. Supplements should complement, not replace, sleep hygiene.' },
]

const SLEEP_REFS = [
  { n: 1, text: 'Walker MP. (2017). Why We Sleep: Unlocking the Power of Sleep and Dreams. Scribner.', url: '' },
  { n: 2, text: 'Ferracioli-Oda E, et al. (2013). Melatonin for primary sleep disorders: meta-analysis. PLoS ONE, 8(5): e63773.', url: 'https://pubmed.ncbi.nlm.nih.gov/23691095/' },
  { n: 3, text: 'Abbasi B, et al. (2012). Magnesium supplementation and primary insomnia. J Res Med Sci, 17(12): 1161-1169.', url: 'https://pubmed.ncbi.nlm.nih.gov/23853635/' },
]

export default function SleepSupplementsPage() {
  return (
    <div className="container-page py-10 space-y-10">
      <AuthorityJsonLd title="Sleep Supplements Guide" description="Evidence-graded comparison of melatonin, magnesium, L-theanine, and more." url="https://thehippiescientist.net/guides/other/sleep-supplements-guide" type="Article" />
      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Guides', href: '/guides/' }, { label: 'Sleep Supplements' }]} />
      <FAQSchema pagePath="/guides/other/sleep-supplements-guide/" questions={FAQS} />

      <section className="space-y-5 max-w-4xl"><p className="eyebrow-label">Evidence Review · 3 References</p><h1 className="text-5xl font-bold tracking-tight text-ink">Sleep Supplements: What Actually Works</h1><p className="text-lg leading-8 text-muted">One-third of adults do not get enough sleep. The supplement industry has responded with melatonin gummies, magnesium drinks, and "sleep stacks" — but which ones have evidence? Here is an evidence-graded comparison of the most common sleep supplements, matched to specific sleep problems.</p></section>

      <section className="card-premium p-6 space-y-4"><h2 className="text-2xl font-semibold">Quick answer</h2><p className="text-sm leading-7 text-muted"><strong>Match the supplement to your sleep problem, not the marketing.</strong> For sleep onset (can&apos;t fall asleep): low-dose melatonin (0.3-1 mg) or L-theanine (200 mg). For sleep maintenance (can&apos;t stay asleep): magnesium glycinate (200-400 mg). For racing mind: L-theanine + magnesium. For circadian disruption (jet lag, shift work): melatonin [2]. Avoid diphenhydramine (Benadryl/ZzzQuil) for regular use — it causes tolerance and next-day impairment. Sleep hygiene (consistent schedule, dark room, no screens) has stronger evidence than any supplement [1].</p></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl border-l-4 border-brand-700 bg-brand-50/30"><p className="text-xs font-bold uppercase tracking-wider text-brand-700">At a Glance · Sleep Supplement Selector</p><div className="overflow-x-auto"><table className="min-w-full text-sm"><thead><tr className="border-b"><th className="text-left py-2 pr-4 font-semibold text-ink">Sleep Problem</th><th className="text-left py-2 pr-4 font-semibold text-ink">Best Supplement</th><th className="text-left py-2 pr-4 font-semibold text-ink">Dose</th><th className="text-left py-2 font-semibold text-ink">Timing</th></tr></thead><tbody className="text-muted">
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Can&apos;t fall asleep</td><td className="py-2 pr-4">Melatonin (0.3-1 mg)</td><td className="py-2 pr-4">0.3-1 mg</td><td className="py-2">1-2 hrs before bed</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Can&apos;t stay asleep</td><td className="py-2 pr-4">Magnesium glycinate</td><td className="py-2 pr-4">200-400 mg</td><td className="py-2">Evening</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Racing mind at night</td><td className="py-2 pr-4">L-Theanine</td><td className="py-2 pr-4">200 mg</td><td className="py-2">30-60 min before bed</td></tr>
          <tr className="border-b"><td className="py-2 pr-4 font-medium text-ink">Jet lag / shift work</td><td className="py-2 pr-4">Melatonin</td><td className="py-2 pr-4">0.5-5 mg</td><td className="py-2">Target bedtime at destination</td></tr>
          <tr><td className="py-2 pr-4 font-medium text-ink">General sleep quality</td><td className="py-2 pr-4">Magnesium + L-Theanine</td><td className="py-2 pr-4">200 mg + 200 mg</td><td className="py-2">Evening</td></tr>
        </tbody></table></div><div className="mt-3 p-3 rounded-lg bg-white border border-brand-200"><p className="text-xs font-semibold text-ink">The melatonin mistake:</p><p className="mt-1 text-xs leading-5 text-muted">Most drugstore melatonin is 3-10 mg — 10-30x the physiological dose. Low-dose (0.3-1 mg) is equally effective for sleep onset with fewer side effects. The dose-response curve for melatonin is flat — more is not better. If your melatonin gives you morning grogginess, the dose is too high, not too low.</p></div></section>

      <section className="card-premium p-6 space-y-4 max-w-4xl"><h2 className="text-2xl font-semibold tracking-tight text-ink">Bottom line</h2><p className="text-sm leading-7 text-muted">The best sleep supplements are matched to specific sleep problems: melatonin for timing issues, magnesium for tension-driven insomnia, L-theanine for racing mind. The combination of magnesium glycinate + L-theanine is the most broadly applicable, lowest-risk starting point. Avoid high-dose melatonin (over 1-3 mg) — the side effects (grogginess, vivid dreams) outweigh the benefits. Sleep hygiene (consistent schedule, dark cool room, no screens) has stronger evidence than any supplement [1]. Supplements support sleep — they do not replace the fundamentals.</p></section>
      <References refs={SLEEP_REFS} />
      <EmailCapture headline="Get evidence reviews like this" description="Sleep supplements, melatonin, magnesium — evidence over marketing." ctaLabel="Get the evidence" location="guide-sleep" />
      <div className="pt-4 border-t border-brand-900/10 flex items-center justify-between"><Link href="/guides/" className="inline-flex rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-4 py-2 text-sm font-bold text-ink transition hover:bg-brand-50">← Back to guides</Link><Link href="/herbs/" className="text-sm font-bold text-brand-800 hover:underline">Herb library →</Link></div>
    </div>
  )
}