import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Anxiety & Stress Supplement Guides',
  description: 'Evidence-based guides on adaptogens, anxiolytics, and stress management: ashwagandha, L-theanine, rhodiola, magnesium, and more.',
  alternates: { canonical: `${SITE_URL}/guides/anxiety/` },
  openGraph: { title: 'Anxiety & Stress Guides', description: 'Adaptogens and anxiolytics backed by evidence.', url: `${SITE_URL}/guides/anxiety/`, type: 'website', images: ['/og-default.jpg'] },
}

const GUIDES = [
  { slug: 'best-herbs-for-anxiety', title: 'Best Herbs for Anxiety', desc: 'Ashwagandha, kava, passionflower, lemon balm — evidence-graded with safety warnings.' },
  { slug: 'best-adaptogens-for-stress', title: 'Best Adaptogens for Stress', desc: 'Ashwagandha, rhodiola, eleuthero, schisandra — how adaptogens work and when to use them.' },
  { slug: 'best-supplements-for-stress', title: 'Best Supplements for Stress', desc: 'Ashwagandha, rhodiola, phosphatidylserine, magnesium — evidence-graded review.' },
  { slug: 'best-supplements-for-overthinking', title: 'Best Supplements for Overthinking', desc: 'L-theanine, magnesium, lemon balm, ashwagandha — matched to your overthinking pattern.' },
  { slug: 'best-herbs-for-stress-and-anxiety-at-night', title: 'Best Herbs for Nighttime Anxiety', desc: 'Racing thoughts at bedtime? Evidence-based herb guide for anxiety-driven insomnia.' },
  { slug: 'how-to-lower-cortisol-naturally', title: 'How to Lower Cortisol Naturally', desc: 'Supplements and lifestyle strategies for managing chronically elevated cortisol.' },
  { slug: 'natural-anxiety-relief', title: 'Natural Anxiety Relief', desc: 'Evidence-informed overview of supplements and non-supplement approaches for anxiety.' },
  { slug: 'natural-anxiolytics-beyond-ashwagandha', title: 'Natural Anxiolytics Beyond Ashwagandha', desc: 'L-theanine, kava, kanna — calming botanicals compared with evidence-first analysis.' },
  { slug: 'natural-alternatives-to-anxiety-medication', title: 'Alternatives to Anxiety Medication', desc: 'Educational overview of supportive herbs and routines — not a replacement for prescribed treatment.' },
  { slug: 'ashwagandha-for-anxiety', title: 'Ashwagandha for Anxiety', desc: 'How ashwagandha reduces cortisol and supports stress resilience.' },
  { slug: 'l-theanine-for-anxiety', title: 'L-Theanine for Anxiety', desc: 'L-theanine\'s calming mechanism and evidence for anxiety relief.' },
  { slug: 'l-theanine-for-calm', title: 'L-Theanine for Calm', desc: 'Using L-theanine for calm focus without sedation.' },
  { slug: 'cbd-vs-ashwagandha-for-anxiety', title: 'CBD vs Ashwagandha for Anxiety', desc: 'Comparing two popular natural anxiolytics — mechanisms, evidence, and safety.' },
  { slug: 'anxiety-stack-guide', title: 'Anxiety Stack Guide', desc: 'How to combine supplements for anxiety — timing, safety, and synergy.' },
]

export default function AnxietyGuideIndex() {
  return (
    <div className="mx-auto max-w-4xl px-4 pb-24 pt-8">
      <nav className="text-xs text-muted mb-4">
        <Link href="/guides/" className="hover:text-ink">Guides</Link><span className="mx-1.5">/</span><span className="text-ink font-medium">Anxiety & Stress</span>
      </nav>
      <header className="mb-10">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Anxiety & Stress Guides</h1>
        <p className="mt-3 text-lg text-muted max-w-2xl">Adaptogens, anxiolytics, and stress management — evidence-graded with safety context.</p>
      </header>
      <div className="grid gap-4 sm:grid-cols-2">
        {GUIDES.map(g => (
          <Link key={g.slug} href={`/guides/anxiety/${g.slug}/`} className="rounded-xl border border-brand-900/10 bg-white p-5 transition hover:border-brand-700/30 hover:shadow-sm">
            <h3 className="font-semibold text-ink">{g.title}</h3>
            <p className="mt-1.5 text-sm text-muted leading-relaxed">{g.desc}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
