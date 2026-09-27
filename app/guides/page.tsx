import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { SITE_URL } from '@/lib/navigation-config'
import { AtlasComparisonCallout } from '@/components/guides/AtlasComparisonCallout'
import { buildTwitterMetadata } from '@/lib/seo'

export const metadata: Metadata = {
  title: 'Guides & Topic Hubs — Mental Health, Sleep, ADHD & More',
  description: 'Browse The Hippie Scientist guides by clear topic: mental health, ADHD, sleep, anxiety, stress, focus, substance use, supplement comparisons, and practical decision guides.',
  alternates: { canonical: `${SITE_URL}/guides/` },
  openGraph: {
    title: 'Guides & Topic Hubs — The Hippie Scientist',
    description: 'Browse mental health, ADHD, sleep, anxiety, substance-use, comparison, and supplement guides from one clear starting point.',
    url: `${SITE_URL}/guides/`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Guides & Topic Hubs — The Hippie Scientist',
    description: 'Browse mental health, ADHD, sleep, anxiety, substance-use, comparison, and supplement guides from one clear starting point.',
  }),
}

const GUIDE_GROUPS = [
  {
    title: 'Health & mental health',
    description: 'Start here when your question is about a condition, symptom pattern, or functional goal.',
    items: [
      {
        title: 'Mental Health',
        href: '/guides/mental-health/',
        desc: 'OCD, BPD, personality disorders, relationships, treatment evidence, safety, and stigma-aware explainers.',
      },
      {
        title: 'ADHD',
        href: '/guides/adhd/',
        desc: 'Attention, executive function, nutrients, supplements, and treatment context.',
      },
      {
        title: 'Sleep',
        href: '/guides/sleep/',
        desc: 'Sleep aids, insomnia evidence, melatonin alternatives, and practical sleep decisions.',
      },
      {
        title: 'Anxiety',
        href: '/guides/anxiety/',
        desc: 'Evidence-graded guides for anxious thoughts, physical tension, and calm.',
      },
      {
        title: 'Stress',
        href: '/guides/stress/',
        desc: 'Acute tension, chronic overload, burnout, adaptogens, and stress-support decisions.',
      },
      {
        title: 'Focus & Cognition',
        href: '/guides/focus/',
        desc: 'Nootropics, cognitive performance, stimulant tradeoffs, and focus support.',
      },
      {
        title: 'Metabolic Health',
        href: '/guides/metabolic-health/',
        desc: 'Blood sugar, insulin sensitivity, weight-loss claims, and medication context.',
      },
    ],
  },
  {
    title: 'Substances & supplement decisions',
    description: 'Use these when you are comparing options, researching a substance, or deciding what kind of product to investigate.',
    items: [
      {
        title: 'Substance Use & Harm Reduction',
        href: '/guides/substance-use/',
        desc: 'Dependence, withdrawal, overdose risk, kratom-derived opioids, tianeptine, and emerging psychoactives.',
      },
      {
        title: 'Comparisons',
        href: '/guides/compare/',
        desc: 'Head-to-head comparisons by evidence, safety, form, dose, and practical tradeoffs.',
      },
      {
        title: 'Best Supplements',
        href: '/guides/best/',
        desc: 'Evidence-aware roundups organized around a specific need or decision.',
      },
      {
        title: 'Herb Guides',
        href: '/guides/herbs/',
        desc: 'Long-form practical guides for important botanicals and extracts.',
      },
      {
        title: 'Supplement Topic Guides',
        href: '/guides/other/',
        desc: 'Forms, quality, routines, advanced compounds, and topics that do not fit a single goal.',
      },
    ],
  },
  {
    title: 'Learn how to evaluate the evidence',
    description: 'Use these when you want to understand why studies conflict, how evidence is graded, or how to check safety before acting.',
    items: [
      {
        title: 'Science Foundations',
        href: '/learn/',
        desc: 'Research literacy, neuroscience, interactions, and product-quality explainers.',
      },
      {
        title: 'Research Library',
        href: '/research/',
        desc: 'Browse studies, evidence tools, reports, citations, and methodology.',
      },
      {
        title: 'Safety Checker',
        href: '/safety-checker/',
        desc: 'Check interaction signals, contraindication context, and important uncertainty.',
      },
    ],
  },
]

function GuideCard({ title, href, desc }: { title: string; href: string; desc: string }) {
  return (
    <Link
      href={href}
      className="card-premium group flex min-h-[9.5rem] flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2"
    >
      <h3 className="text-lg font-semibold leading-snug tracking-tight text-[color:var(--hs-ink)]">{title}</h3>
      <p className="mt-2 text-sm leading-6 text-[color:var(--hs-body)]">{desc}</p>
      <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-[color:var(--hs-gold-ink)]">
        Explore
        <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
      </span>
    </Link>
  )
}

export default function GuidesHub() {
  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 pb-24 pt-4 sm:pt-6">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { label: 'Guides' },
        ]}
      />

      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Evidence Library · Browse by topic</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Guides</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Start with the subject you care about. Mental health, ADHD, sleep, anxiety, supplement decisions, comparisons, and research tools each have a clear home.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-2" aria-label="Featured guides">
        <Link href="/guides/mental-health/avoidant-borderline-personality-disorders-couples/" className="card-premium group p-6">
          <p className="eyebrow-label">New mental health research</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Avoidant + Borderline Personality Disorders in Couples</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            What the research actually shows about attachment, withdrawal, reassurance, conflict cycles, relationship stability, and treatment — without turning the pairing into a stereotype.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
            Read the relationship research guide <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>

        <Link href="/guides/substance-use/" className="card-premium group p-6">
          <p className="eyebrow-label">Evidence cluster</p>
          <h2 className="mt-3 text-2xl font-semibold tracking-tight text-ink">Substance Use, Dependence & Harm Reduction</h2>
          <p className="mt-3 text-sm leading-6 text-muted">
            Mitragynine, 7-OH, MGM-15, mitragynine pseudoindoxyl, tianeptine, withdrawal evidence, novel psychoactives, and risk-reduction research.
          </p>
          <span className="mt-5 inline-flex items-center gap-2 text-sm font-bold text-brand-700">
            Explore substance-use research <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
          </span>
        </Link>
      </section>

      {GUIDE_GROUPS.map((group) => (
        <section key={group.title} aria-labelledby={`group-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
          <div className="max-w-3xl">
            <h2
              id={`group-${group.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="compact-heading"
            >
              {group.title}
            </h2>
            <p className="mt-2 text-sm leading-6 text-muted">{group.description}</p>
          </div>
          <div className="mt-4 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
            {group.items.map((item) => <GuideCard key={item.href} {...item} />)}
          </div>
        </section>
      ))}

      <AtlasComparisonCallout
        title="Compare botanicals across anxiety, sleep, and focus goals"
        description="Use the Botanical Activity Atlas to filter the structured library by calming, sleep-related, stimulating, cognition, chemistry, evidence strength, noticeability, and safety signals."
        href="/tools/botanical-activity-atlas/?sort=evidence"
        cta="Compare botanicals by evidence"
        secondaryHref="/safety-checker/"
        secondaryCta="Check interaction risk"
      />

      <section className="section-frame p-5 text-center sm:p-8" aria-labelledby="reference-databases-heading">
        <p className="eyebrow-label">Looking for one ingredient?</p>
        <h2 id="reference-databases-heading" className="compact-heading mt-3">Browse the reference databases</h2>
        <p className="mx-auto mt-3 max-w-3xl text-sm leading-6 text-[color:var(--hs-body)] sm:text-base">
          Guides answer broader questions. Browse the published herb and compound libraries when you already know the ingredient you want to look up. We keep source inventory separate from what readers can actually browse.
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
