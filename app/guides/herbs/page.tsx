import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Herb Deep-Dive Guides',
  description: 'In-depth profiles on individual herbs: ashwagandha, kava, passionflower, rhodiola, turmeric, elderberry, and L-theanine.',
  alternates: { canonical: `${SITE_URL}/guides/herbs/` },
  openGraph: { title: 'Herb Deep-Dive Guides', description: 'Comprehensive profiles on evidence-backed herbs.', url: `${SITE_URL}/guides/herbs/`, type: 'website', images: ['/og-default.jpg'] },
}

const GUIDES = [
  { slug: 'ashwagandha', title: 'Ashwagandha — Complete Guide', desc: 'Full monograph: stress, sleep, cortisol, thyroid, athletic performance, and safety.' },
  { slug: 'l-theanine', title: 'L-Theanine — Complete Guide', desc: 'Mechanism, dosing, and evidence for calm focus, sleep, and anxiety.' },
  { slug: 'kava', title: 'Kava — Complete Guide', desc: 'Kavalactones, safety, tradition, and clinical evidence for anxiety.' },
  { slug: 'passionflower', title: 'Passionflower — Complete Guide', desc: 'GABAergic calming herb for sleep and anxiety — evidence and preparation.' },
  { slug: 'rhodiola-complete-guide', title: 'Rhodiola — Complete Guide', desc: 'Adaptogenic support for fatigue, cognition, and stress resilience.' },
  { slug: 'rhodiola-energy', title: 'Rhodiola for Energy', desc: 'Using rhodiola for physical and mental fatigue.' },
  { slug: 'rhodiola-extract-vs-powder', title: 'Rhodiola Extract vs Powder', desc: 'Forms, standardization, and which to choose.' },
  { slug: 'turmeric-curcumin', title: 'Turmeric & Curcumin Guide', desc: 'Absorption, dosing, and evidence for inflammation and pain.' },
  { slug: 'elderberry', title: 'Elderberry Guide', desc: 'Immune support evidence, safety, and preparation methods.' },
  { slug: 'melatonin-vs-valerian', title: 'Melatonin vs Valerian for Sleep', desc: 'Comparing two popular natural sleep aids.' },
]

export default function HerbsGuideIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <nav className="text-xs text-muted mb-4"><Link href="/guides/" className="hover:text-ink">Guides</Link><span className="mx-1.5">/</span><span className="text-ink font-medium">Herb Profiles</span></nav>
      <header className="mb-10"><h1 className="text-3xl font-bold text-ink sm:text-4xl">Herb Deep-Dive Guides</h1><p className="mt-3 text-lg text-muted max-w-2xl">Comprehensive, evidence-referenced profiles on the most researched herbs.</p></header>
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map(g => (<Link key={g.slug} href={`/guides/herbs/${g.slug}/`} className="rounded-xl border border-brand-900/10 bg-white p-5 transition hover:border-brand-700/30 hover:shadow-sm"><h3 className="font-semibold text-ink">{g.title}</h3><p className="mt-1.5 text-sm text-muted leading-relaxed">{g.desc}</p></Link>))}
      </div>
    </div>
  )
}
