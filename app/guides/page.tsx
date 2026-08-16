import type { Metadata } from 'next'
import Link from 'next/link'
import { SITE_URL } from '@/lib/navigation-config'
import { AtlasComparisonCallout } from '@/components/guides/AtlasComparisonCallout'
import { buildTwitterMetadata } from '@/src/lib/seo'

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
  twitter: buildTwitterMetadata({
    title: 'Evidence Library — The Hippie Scientist',
    description: 'Browse citation-rich guides, mental health explainers, supplement comparisons, and science foundations in one organized library.',
  }),
}

const SECTIONS = [
  {
    title: 'Mental Health',
    href: '/guides/mental-health/',
    desc: 'OCD, BPD, and every named DSM-5-TR personality disorder — citation-rich guides covering diagnosis, differential diagnosis, treatment, safety, and stigma.',
    color: 'border-l-cyan-600',
  },
  {
    title: 'ADHD',
    href: '/guides/adhd/',
    desc: 'Supplements, nutrients, and strategies for attention and executive function — 22 evidence-based guides.',
    color: 'border-l-blue-500',
  },
  {
    title: 'Sleep',
    href: '/guides/sleep/',
    desc: 'Natural sleep aids, melatonin alternatives, and sleep hygiene — 17 guides with clinical evidence.',
    color: 'border-l-indigo-500',
  },
  {
    title: 'Stress',
    href: '/guides/stress/',
    desc: 'Evidence-aware guides for acute tension, chronic overload, burnout, adaptogens, and stress-support decisions.',
    color: 'border-l-orange-500',
  },
  {
    title: 'Anxiety',
    href: '/guides/anxiety/',
    desc: 'Evidence-graded guides for anxious thoughts, physical tension, and calm — with safety warnings kept visible.',
    color: 'border-l-amber-500',
  },
  {
    title: 'Focus & Cognition',
    href: '/guides/focus/',
    desc: 'Nootropics, focus stacks, and cognitive enhancement — 6 guides on getting more from your brain.',
    color: 'border-l-emerald-500',
  },
  {
    title: 'Metabolic Health',
    href: '/guides/metabolic-health/',
    desc: 'Blood sugar, insulin sensitivity, weight-loss claims, medication context, and metabolic supplement comparisons kept tied to human evidence.',
    color: 'border-l-lime-600',
  },
  {
    title: 'Herb Guides',
    href: '/guides/herbs/',
    desc: 'Deep-dive monographs on individual herbs — ashwagandha, kava, passionflower, rhodiola, turmeric.',
    color: 'border-l-green-600',
  },
  {
    title: 'Comparisons',
    href: '/guides/compare/',
    desc: 'Head-to-head supplement comparisons — ashwagandha vs rhodiola, melatonin vs valerian, and more.',
    color: 'border-l-rose-500',
  },
  {
    title: 'Best Supplements',
    href: '/guides/best/',
    desc: 'Curated recommendations for specific needs — blood pressure, fat loss, joint support, gut health.',
    color: 'border-l-purple-500',
  },
  {
    title: 'Science Foundations',
    href: '/learn/',
    desc: 'Research literacy, neuroscience, interactions, and product quality explainers that make the rest of the library easier to evaluate.',
    color: 'border-l-teal-600',
  },
  {
    title: 'Supplement Topic Guides',
    href: '/guides/other/',
    desc: 'Form and quality guides, popular supplement categories, goal-based routines, advanced compounds, and harm reduction — organized by the decision you are making.',
    color: 'border-l-stone-500',
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

      <AtlasComparisonCallout
        title="Compare botanicals across anxiety, sleep, and focus goals"
        description="Use the Botanical Activity Atlas to filter the same structured library by calming, sleep-related, stimulating, cognition, chemistry, evidence strength, noticeability, and safety signals. It is the fastest way to compare options before opening individual guides."
        href="/tools/botanical-activity-atlas/?sort=evidence"
        cta="Compare botanicals by evidence"
        secondaryHref="/safety-checker/"
        secondaryCta="Check interaction risk"
      />

      <div className="grid gap-0 border-y border-brand-900/10 md:grid-cols-2 md:gap-6 md:border-0">
        {SECTIONS.map((section) => (
          <Link
            key={section.href}
            href={section.href}
            className={`border-b border-brand-900/10 py-6 transition hover:bg-brand-50/30 md:rounded-lg md:border md:border-l-4 md:bg-white md:p-6 md:hover:border-brand-700/20 ${section.color}`}
          >
            <h2 className="text-xl font-bold text-ink">{section.title}</h2>
            <p className="mt-2 text-sm leading-relaxed text-muted">{section.desc}</p>
          </Link>
        ))}
      </div>

      <div className="mt-16 rounded-2xl border border-brand-900/10 bg-brand-50/50 p-8 text-center">
        <h2 className="text-xl font-bold text-ink">Browse the reference databases</h2>
        <p className="mt-2 text-muted">
          Prefer structured profiles? Browse the published herb and compound libraries, where public eligibility rules keep source inventory separate from what readers can actually browse.
        </p>
        <div className="mt-4 flex justify-center gap-3">
          <Link href="/herbs/" className="rounded-full bg-brand-700 px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-800">Browse Herbs →</Link>
          <Link href="/compounds/" className="rounded-full border border-brand-700 px-6 py-2.5 text-sm font-semibold text-brand-700 transition hover:bg-brand-50">Browse Compounds →</Link>
        </div>
      </div>
    </div>
  )
}
