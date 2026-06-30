import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Sleep Supplement Guides & Natural Sleep Aids',
  description: 'Evidence-based guides on natural sleep aids: magnesium, melatonin, L-theanine, valerian, ashwagandha, and sleep hygiene strategies.',
  alternates: { canonical: `${SITE_URL}/guides/sleep/` },
  openGraph: { title: 'Sleep Supplement Guides', description: 'Natural sleep aids backed by evidence.', url: `${SITE_URL}/guides/sleep/`, type: 'website', images: ['/og-default.jpg'] },
}

const GUIDES = [
  { slug: 'best-supplements-for-sleep', title: 'Best Supplements for Sleep', desc: 'Evidence-graded review: magnesium glycinate, L-theanine, melatonin, valerian, and more.' },
  { slug: 'best-natural-sleep-aids-that-work', title: 'Best Natural Sleep Aids That Work', desc: 'Which natural sleep remedies actually have clinical evidence behind them.' },
  { slug: 'magnesium-for-sleep', title: 'Magnesium for Sleep', desc: 'How magnesium glycinate improves sleep quality, onset latency, and deep sleep.' },
  { slug: 'magnesium-types-for-sleep', title: 'Magnesium Types for Sleep', desc: 'Glycinate vs citrate vs threonate — which magnesium is best for sleep?' },
  { slug: 'magnesium-vs-melatonin', title: 'Magnesium vs Melatonin', desc: 'When to use each and how they work differently for sleep.' },
  { slug: 'sleep-herbs-vs-melatonin', title: 'Sleep Herbs vs Melatonin', desc: 'Valerian, passionflower, and lemon balm compared to melatonin.' },
  { slug: 'l-theanine-for-sleep', title: 'L-Theanine for Sleep', desc: 'How L-theanine promotes relaxation and improves sleep quality.' },
  { slug: 'ashwagandha-for-sleep', title: 'Ashwagandha for Sleep', desc: 'Ashwagandha\'s cortisol-lowering effect and its impact on sleep.' },
  { slug: 'ashwagandha-vs-magnesium-for-sleep', title: 'Ashwagandha vs Magnesium for Sleep', desc: 'Which to choose based on your sleep issue — stress vs muscle tension.' },
  { slug: 'best-herbs-for-sleep', title: 'Best Herbs for Sleep', desc: 'Valerian, passionflower, lemon balm, chamomile — evidence-graded.' },
  { slug: 'best-magnesium-for-sleep', title: 'Best Magnesium for Sleep', desc: 'Finding the right magnesium form and dose for your sleep needs.' },
  { slug: 'rhodiola-sleep-stack', title: 'Rhodiola Sleep Stack', desc: 'Combining rhodiola with magnesium and L-theanine for sleep support.' },
  { slug: 'sleep-stack-guide', title: 'Sleep Stack Guide', desc: 'How to combine supplements for sleep — timing, dosing, and safety.' },
  { slug: 'sleep-stack-magnesium-melatonin', title: 'Magnesium + Melatonin Sleep Stack', desc: 'Combined approach for sleep onset and sleep maintenance.' },
  { slug: 'sleep-best-supplements', title: 'Best Sleep Supplements', desc: 'Quick-reference guide to the top sleep supplements.' },
  { slug: 'melatonin-for-adhd-sleep', title: 'Melatonin for ADHD Sleep', desc: 'Melatonin strategies for ADHD-related sleep difficulties.' },
  { slug: 'sleep-and-adhd', title: 'Sleep and ADHD', desc: 'The ADHD-sleep connection and supplement strategies.' },
]

export default function SleepGuideIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <nav className="text-xs text-muted mb-4">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <span className="text-ink font-medium">Sleep</span>
      </nav>
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Sleep Supplement Guides</h1>
        <p className="mt-3 text-lg text-muted max-w-2xl">Natural sleep aids backed by clinical evidence — from magnesium to melatonin alternatives.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map(g => (
          <Link key={g.slug} href={`/guides/sleep/${g.slug}/`} className="rounded-xl border border-brand-900/10 bg-white p-5 transition hover:border-brand-700/30 hover:shadow-sm">
            <h3 className="font-semibold text-ink">{g.title}</h3>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{g.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
