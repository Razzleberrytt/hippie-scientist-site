import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/navigation-config'

export const metadata: Metadata = {
  title: 'Supplement Guides — By Health Goal',
  description: 'Evidence-based supplement guides organized by health goal: ADHD, sleep, anxiety, stress, focus, cognition, and individual herb deep-dives.',
  alternates: { canonical: `${SITE_URL}/guides/` },
  openGraph: {
    title: 'Supplement Guides — The Hippie Scientist',
    description: 'Browse supplement guides by health goal. ADHD, sleep, anxiety, focus — evidence-graded with safety context.',
    url: `${SITE_URL}/guides/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

const SECTIONS = [
  {
    title: 'ADHD',
    href: '/guides/adhd/',
    desc: 'Supplements, nutrients, and strategies for attention and executive function — 22 evidence-based guides.',
    color: 'border-l-blue-500',
    articles: ['Best supplements for ADHD', 'Magnesium for ADHD', 'Omega-3 and ADHD', 'ADHD blood tests', 'Sleep and ADHD'],
  },
  {
    title: 'Sleep',
    href: '/guides/sleep/',
    desc: 'Natural sleep aids, melatonin alternatives, and sleep hygiene — 17 guides with clinical evidence.',
    color: 'border-l-indigo-500',
    articles: ['Best supplements for sleep', 'Magnesium for sleep', 'Magnesium vs melatonin', 'Sleep stack guide', 'Herbs for sleep'],
  },
  {
    title: 'Anxiety & Stress',
    href: '/guides/anxiety/',
    desc: 'Adaptogens, anxiolytics, and stress management — 14 evidence-graded guides with safety warnings.',
    color: 'border-l-amber-500',
    articles: ['Best herbs for anxiety', 'Best adaptogens for stress', 'How to lower cortisol', 'Ashwagandha for anxiety', 'L-theanine for calm'],
  },
  {
    title: 'Focus & Cognition',
    href: '/guides/focus/',
    desc: 'Nootropics, focus stacks, and cognitive enhancement — 6 guides on getting more from your brain.',
    color: 'border-l-emerald-500',
    articles: ['Best nootropics for focus', 'Focus without caffeine crash', 'L-theanine vs caffeine', 'Best focus supplements'],
  },
  {
    title: 'Herb Profiles',
    href: '/guides/herbs/',
    desc: 'Deep-dive monographs on individual herbs — ashwagandha, kava, passionflower, rhodiola, turmeric.',
    color: 'border-l-green-600',
    articles: ['Ashwagandha complete guide', 'Kava guide', 'Rhodiola guide', 'Turmeric & curcumin', 'Passionflower guide'],
  },
  {
    title: 'Comparisons',
    href: '/guides/compare/',
    desc: 'Head-to-head supplement comparisons — ashwagandha vs rhodiola, melatonin vs valerian, and more.',
    color: 'border-l-rose-500',
    articles: ['Ashwagandha vs L-theanine vs magnesium', 'Melatonin vs valerian vs magnesium', 'Rhodiola vs ashwagandha', 'Kava vs alcohol'],
  },
  {
    title: 'Best Supplements',
    href: '/guides/best/',
    desc: 'Curated recommendations for specific needs — blood pressure, fat loss, joint support, gut health.',
    color: 'border-l-purple-500',
    articles: ['Best for blood pressure', 'Best for fat loss', 'Best for joint support', 'Best for gut health'],
  },
]

export default function GuidesHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Supplement Guides</h1>
        <p className="mt-3 text-lg text-muted max-w-2xl">
          Evidence-based guides organized by health goal. Every guide is referenced to published research — no marketing, no bro-science.
        </p>
      </header>

      <div className="grid gap-8 md:grid-cols-2">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`rounded-2xl border border-brand-900/10 bg-white p-6 transition hover:shadow-md hover:border-brand-700/20 ${section.color} border-l-4`}
          >
            <h2 className="text-xl font-bold text-ink">{section.title}</h2>
            <p className="mt-2 text-sm text-muted leading-relaxed">{section.desc}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {section.articles.map((a) => (
                <span key={a} className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs text-brand-700 font-medium">{a}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-brand-900/10 bg-brand-50/50 p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Browse by database</h2>
        <p className="mt-2 text-muted">Prefer to search structured data? Explore 290 herbs and 557 active compounds.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/herbs/" className="rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white hover:bg-brand-800 transition">Browse Herbs →</Link>
          <Link href="/compounds/" className="rounded-full border border-brand-700 px-6 py-2.5 text-sm font-semibold text-brand-700 hover:bg-brand-50 transition">Browse Compounds →</Link>
        </div>
      </div>
    </div>
  )
}
