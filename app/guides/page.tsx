import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/navigation-config'

export const metadata: Metadata = {
  title: 'Evidence Library — Supplements, Science & Mental Health',
  description: 'One evidence library for guides, articles, and explainers covering ADHD, sleep, anxiety, focus, mental health, herbs, supplements, and research literacy.',
  alternates: { canonical: `${SITE_URL}/guides/` },
  openGraph: {
    title: 'Evidence Library — The Hippie Scientist',
    description: 'Browse citation-rich guides, mental health explainers, supplement comparisons, and science foundations in one organized library.',
    url: `${SITE_URL}/guides/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
}

const SECTIONS = [
  {
    title: 'Mental Health',
    href: '/guides/mental-health/',
    desc: 'OCD, BPD, and every named DSM-5-TR personality disorder — citation-rich guides covering diagnosis, differential diagnosis, treatment, safety, and stigma.',
    color: 'border-l-cyan-600',
    articles: ['OCD', 'Borderline personality disorder', 'Personality disorders overview', 'OCD vs OCPD', 'Avoidant personality disorder'],
  },
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
    title: 'Herb Guides',
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
  {
    title: 'Science Foundations',
    href: '/learn/',
    desc: 'Research literacy, neuroscience, interactions, and product quality explainers that make the rest of the library easier to evaluate.',
    color: 'border-l-teal-600',
    articles: ['Evidence literacy', 'How to read scientific studies', 'Neuroscience glossary', 'Interactions', 'Product quality'],
  },
  {
    title: 'Other & Harm Reduction',
    href: '/guides/other/healthy-dipping-tobacco-alternatives/',
    desc: 'Evidence-informed guides that sit outside the main goal clusters, including tobacco replacement, peptides, and psychoactive harm reduction.',
    color: 'border-l-stone-500',
    articles: ['Dipping tobacco alternatives', 'Kratom 7-OH withdrawal', 'Psychedelic-adjacent herbs', 'Brain fog and fatigue'],
  },
]

export default function LibraryHub() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8">
      <header className="mb-12">
        <h1 className="text-3xl font-bold text-ink sm:text-4xl">Evidence Library</h1>
        <p className="mt-3 max-w-2xl text-lg text-muted">
          Guides, articles, mental health explainers, comparisons, and science foundations — organized as one connected library instead of separate content silos.
        </p>
      </header>

      <div className="grid gap-0 border-y border-brand-900/10 md:grid-cols-2 md:gap-6 md:border-0">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`border-b border-brand-900/10 py-6 transition hover:bg-brand-50/30 md:rounded-lg md:border md:border-l-4 md:bg-white md:p-6 md:hover:border-brand-700/20 ${section.color}`}
          >
            <h2 className="text-xl font-bold text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{section.desc}</p>
            <div className="mt-4 flex flex-wrap gap-1.5">
              {section.articles.map((article) => (
                <span key={article} className="border-b border-brand-900/10 px-0.5 py-1 text-xs font-medium text-brand-700 md:rounded-full md:border-0 md:bg-brand-50 md:px-2.5 md:py-0.5">{article}</span>
              ))}
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-brand-900/10 bg-brand-50/50 p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Browse the reference databases</h2>
        <p className="mt-2 text-muted">Prefer structured profiles? Explore 290 herbs and 557 active compounds.</p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/herbs/" className="rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800">Browse Herbs →</Link>
          <Link href="/compounds/" className="rounded-full border border-brand-700 px-6 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">Browse Compounds →</Link>
        </div>
      </div>
    </div>
  )
}
