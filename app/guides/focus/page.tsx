import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/src/lib/seo'

export const metadata: Metadata = {
  title: 'Focus & Cognition Supplement Guides',
  description: 'Nootropics, focus stacks, and cognitive enhancement guides: L-theanine, caffeine, citicoline, bacopa, rhodiola, and more.',
  alternates: { canonical: `${SITE_URL}/guides/focus/` },
  openGraph: { title: 'Focus & Cognition Guides', description: 'Nootropics and cognitive enhancement backed by evidence.', url: `${SITE_URL}/guides/focus/`, type: 'website', images: ['/og-default.jpg'] },
}

const GUIDES = [
  { slug: 'best-nootropics-for-focus', title: 'Best Nootropics for Focus', desc: 'Evidence-graded: L-theanine + caffeine, citicoline, bacopa, lion\'s mane, rhodiola.' },
  { slug: 'best-supplements-for-focus', title: 'Best Supplements for Focus', desc: 'L-theanine, citicoline, bacopa, rhodiola, creatine — with dosing and stacking notes.' },
  { slug: 'focus-without-caffeine-crash', title: 'Focus Without the Caffeine Crash', desc: 'How to get steady all-day focus — L-theanine stack, calmer nootropics, timing habits.' },
  { slug: 'l-theanine-vs-caffeine-for-focus', title: 'L-Theanine vs Caffeine for Focus', desc: 'How they work together and when to use each alone.' },
  { slug: 'l-theanine-without-caffeine', title: 'L-Theanine Without Caffeine', desc: 'Using L-theanine solo for calm, focused attention.' },
  { slug: 'best-supplements-for-focus', title: 'Best Focus Supplements', desc: 'Quick-reference guide to evidence-backed focus enhancers.' },
]

export default function FocusGuideIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <nav className="text-xs text-muted mb-4"><Link href="/guides/" className="hover:text-ink">Guides</Link><span className="mx-1.5">/</span><span className="text-ink font-medium">Focus & Cognition</span></nav>
      <header className="mb-10"><h1 className="text-3xl font-bold text-ink sm:text-4xl">Focus & Cognition Guides</h1><p className="mt-3 text-lg text-muted max-w-2xl">Nootropics and cognitive enhancement strategies backed by clinical research.</p></header>
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map(g => (<Link key={g.slug} href={`/guides/focus/${g.slug}/`} className="rounded-xl border border-brand-900/10 bg-white p-5 transition hover:border-brand-700/30 hover:shadow-sm"><h3 className="font-semibold text-ink">{g.title}</h3><p className="mt-1.5 text-sm text-muted leading-relaxed">{g.desc}</p></Link>))}
      </div>
    </div>
  )
}
