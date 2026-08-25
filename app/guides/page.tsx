import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
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
  },
  {
    title: 'ADHD',
    href: '/guides/adhd/',
    desc: 'Supplements, nutrients, and strategies for attention and executive function — 22 evidence-based guides.',
  },
  {
    title: 'Sleep',
    href: '/guides/sleep/',
    desc: 'Natural sleep aids, melatonin alternatives, and sleep hygiene — 17 guides with clinical evidence.',
  },
  {
    title: 'Stress',
    href: '/guides/stress/',
    desc: 'Evidence-aware guides for acute tension, chronic overload, burnout, adaptogens, and stress-support decisions.',
  },
  {
    title: 'Anxiety',
    href: '/guides/anxiety/',
    desc: 'Evidence-graded guides for anxious thoughts, physical tension, and calm — with safety warnings kept visible.',
  },
  {
    title: 'Focus & Cognition',
    href: '/guides/focus/',
    desc: 'Nootropics, focus stacks, and cognitive enhancement — 6 guides on getting more from your brain.',
  },
  {
    title: 'Metabolic Health',
    href: '/guides/metabolic-health/',
    desc: 'Blood sugar, insulin sensitivity, weight-loss claims, medication context, and metabolic supplement comparisons kept tied to human evidence.',
  },
  {
    title: 'Herb Guides',
    href: '/guides/herbs/',
    desc: 'Deep-dive monographs on individual herbs — ashwagandha, kava, passionflower, rhodiola, turmeric.',
  },
  {
    title: 'Comparisons',
    href: '/guides/compare/',
    desc: 'Head-to-head supplement comparisons — ashwagandha vs rhodiola, melatonin vs valerian, and more.',
  },
  {
    title: 'Best Supplements',
    href: '/guides/best/',
    desc: 'Curated recommendations for specific needs — blood pressure, fat loss, joint support, gut health.',
  },
  {
    title: 'Science Foundations',
    href: '/learn/',
    desc: 'Research literacy, neuroscience, interactions, and product quality explainers that make the rest of the library easier to evaluate.',
  },
  {
    title: 'Supplement Topic Guides',
    href: '/guides/other/',
    desc: 'Form and quality guides, popular supplement categories, goal-based routines, advanced compounds, and harm reduction — organized by the decision you are making.',
  },
]

export default function LibraryHub() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 pb-24 pt-4 sm:pt-6">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { label: 'Evidence Library' },
        ]}
      />

      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Guides, comparisons &amp; explainers</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Evidence Library</h1>
        <p className="text-reading mt-4 max-w-3xl">
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

      <section aria-labelledby="evidence-library-sections">
        <div className="max-w-3xl">
          <p className="eyebrow-label">Browse by subject</p>
          <h2 id="evidence-library-sections" className="compact-heading mt-3">Choose the question you are trying to answer.</h2>
        </div>

        <div className="mt-5 grid gap-4 md:grid-cols-2 lg:gap-5">
          {SECTIONS.map((section) => (
            <Link
              key={section.href}
              href={section.href}
              className="card-premium group flex min-h-[11rem] flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2 sm:p-6"
            >
              <h3 className="text-xl font-semibold leading-snug tracking-tight text-[color:var(--hs-ink)]">{section.title}</h3>
              <p className="mt-3 text-sm leading-6 text-[color:var(--hs-body)]">{section.desc}</p>
              <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[color:var(--hs-gold-ink)]">
                Explore section
                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
              </span>
            </Link>
          ))}
        </div>
      </section>

      <section className="section-frame p-5 text-center sm:p-8" aria-labelledby="reference-databases-heading">
        <p className="eyebrow-label">Structured reference</p>
        <h2 id="reference-databases-heading" className="compact-heading mt-3">Browse the reference databases</h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[color:var(--hs-body)] sm:text-base">
          Prefer structured profiles? Browse the published herb and compound libraries, where public eligibility rules keep source inventory separate from what readers can actually browse.
        </p>
        <div className="mt-5 flex flex-col justify-center gap-3 sm:flex-row">
          <Link href="/herbs/" className="button-primary inline-flex min-h-11 items-center justify-center px-6 py-2.5 text-sm font-semibold">
            Browse Herbs
          </Link>
          <Link
            href="/compounds/"
            className="inline-flex min-h-11 items-center justify-center rounded-full border border-[color:var(--hs-hairline-strong)] bg-[color:var(--surface-card)] px-6 py-2.5 text-sm font-semibold text-[color:var(--hs-ink)] transition hover:border-[color:var(--hs-gold)] hover:text-[color:var(--hs-gold-ink)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
          >
            Browse Compounds
          </Link>
        </div>
      </section>
    </div>
  )
}
