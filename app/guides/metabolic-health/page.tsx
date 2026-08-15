import type { Metadata } from 'next'
import Link from 'next/link'

import { DecisionRouter, type IntentRoute } from '@/components/guides/DecisionRouter'
import { GuideCardGrid, type GuideCard } from '@/components/guides/GuideCardGrid'
import { HubSectionHeading } from '@/components/guides/HubSectionHeading'
import SchemaGraphScript from '@/components/seo/SchemaGraphScript'
import { buildGuideHubSchemaGraph } from '@/src/lib/schema-graph'
import { SITE_URL, buildTwitterMetadata } from '@/src/lib/seo'

const PATH = '/guides/metabolic-health/'
const TITLE = 'Metabolic Health Supplements: Berberine, Inositol & Evidence'
const DESCRIPTION = 'Research metabolic-health supplements by intent: blood sugar, PCOS-related insulin resistance, weight-loss claims, cinnamon comparisons, medication safety, and what berberine evidence actually supports.'

export const metadata: Metadata = {
  title: TITLE,
  description: DESCRIPTION,
  alternates: { canonical: `${SITE_URL}${PATH}` },
  openGraph: {
    title: TITLE,
    description: 'Use evidence and medication context to navigate berberine and related metabolic-health research.',
    url: `${SITE_URL}${PATH}`,
    type: 'website',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: TITLE,
    description: 'Use evidence and medication context to navigate berberine and related metabolic-health research.',
  }),
}

const START_HERE: IntentRoute[] = [
  {
    problem: 'I am comparing berberine and inositol for insulin sensitivity',
    why: 'Their evidence is concentrated in different populations and their interaction burdens are not equivalent.',
    cta: 'Berberine vs Inositol',
    href: '/guides/compare/berberine-vs-inositol/',
  },
  {
    problem: 'I am deciding between berberine and cinnamon',
    why: 'Shared blood-sugar marketing does not mean equivalent evidence, preparation, dose, or medication risk.',
    cta: 'Berberine vs Cinnamon',
    href: '/guides/compare/berberine-vs-cinnamon/',
  },
  {
    problem: 'I keep seeing “nature’s Ozempic” claims',
    why: 'The 2026 weight-loss evidence supports a much narrower conclusion than GLP-1 marketing comparisons imply.',
    cta: 'Berberine for Weight Loss',
    href: '/guides/other/berberine-weight-loss/',
  },
  {
    problem: 'I want to compare berberine with metformin',
    why: 'A prescription medicine and a supplement should not be framed as interchangeable consumer choices; use the evidence and safety comparison instead.',
    cta: 'Berberine vs Metformin',
    href: '/guides/compare/berberine-vs-metformin/',
  },
  {
    problem: 'I take glucose-lowering or other regular medication',
    why: 'Berberine has clinically relevant interaction concerns, so medication review comes before supplement optimization.',
    cta: 'Safety Checker',
    href: '/safety-checker/',
  },
]

const BEST_FIRST: GuideCard[] = [
  {
    href: '/guides/compare/berberine-vs-inositol/',
    title: 'Berberine vs Inositol',
    desc: 'Compare insulin-sensitivity evidence, populations, tolerability, dosing context, and interaction burden.',
  },
  {
    href: '/guides/other/berberine-weight-loss/',
    title: 'Berberine for Weight Loss',
    desc: 'A 2026 evidence review that separates modest trial effects from “nature’s Ozempic” marketing.',
  },
  {
    href: '/guides/compare/berberine-vs-cinnamon/',
    title: 'Berberine vs Cinnamon',
    desc: 'Two popular metabolic options compared using canonical human evidence, dose, form, and safety data.',
  },
]

const COMPARISONS: GuideCard[] = [
  {
    href: '/guides/compare/berberine-vs-inositol/',
    title: 'Berberine vs Inositol',
    desc: 'General glycaemic research versus a stronger PCOS-centered inositol evidence context.',
  },
  {
    href: '/guides/compare/berberine-vs-cinnamon/',
    title: 'Berberine vs Cinnamon',
    desc: 'Compare evidence strength and interaction context instead of relying on shared “blood sugar support” positioning.',
  },
  {
    href: '/guides/compare/berberine-vs-metformin/',
    title: 'Berberine vs Metformin',
    desc: 'An educational evidence comparison that keeps a prescription drug and a supplement in their proper clinical categories.',
  },
]

const DEPTH_LINKS = [
  { href: '/compounds/berberine/', title: 'Berberine', kind: 'Compound profile' },
  { href: '/compounds/inositol/', title: 'Inositol', kind: 'Compound profile' },
  { href: '/herbs/cinnamon/', title: 'Cinnamon', kind: 'Herb profile' },
]

export default function MetabolicHealthGuidePage() {
  const schemaGraph = buildGuideHubSchemaGraph({
    path: PATH,
    title: TITLE,
    description: DESCRIPTION,
    breadcrumbs: [
      { name: 'Home', url: `${SITE_URL}/` },
      { name: 'Guides', url: `${SITE_URL}/guides/` },
      { name: 'Metabolic Health', url: `${SITE_URL}${PATH}` },
    ],
    itemListName: 'Metabolic health evidence decision paths',
    items: [...BEST_FIRST, ...COMPARISONS].map((item) => ({ name: item.title, url: `${SITE_URL}${item.href}` })),
  })

  return (
    <div className="mx-auto max-w-5xl px-4 pb-24 pt-8 sm:px-6">
      <SchemaGraphScript graph={schemaGraph} />

      <nav className="mb-5 text-xs text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="hover:text-ink">Guides</Link>
        <span className="mx-1.5">/</span>
        <span className="font-medium text-ink">Metabolic Health</span>
      </nav>

      <header className="max-w-3xl">
        <p className="text-xs font-bold uppercase tracking-[0.18em] text-brand-700">Decision guide</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Metabolic-health research without collapsing every question into “lower blood sugar”
        </h1>
        <p className="mt-5 text-lg leading-8 text-muted">
          Blood-glucose control, PCOS-associated insulin resistance, body weight, lipid markers, and medication management are different outcomes. Start with the actual question, then compare human evidence and safety rather than supplement popularity.
        </p>
      </header>

      <section className="mt-10">
        <HubSectionHeading
          eyebrow="Start here"
          title="What metabolic-health question are you researching?"
          sub="Choose the closest intent. The next page keeps population, dose, formulation, and medication risk attached to the evidence."
        />
        <DecisionRouter items={START_HERE} />
      </section>

      <section className="mt-14">
        <HubSectionHeading eyebrow="Best first reads" title="Start with the strongest existing research paths" />
        <GuideCardGrid cards={BEST_FIRST} />
      </section>

      <section className="mt-14">
        <HubSectionHeading
          eyebrow="Compare & choose"
          title="Compare alternatives without treating them as equivalents"
          sub="These comparisons surface human evidence, dose, formulation, safety, and interactions side by side."
        />
        <GuideCardGrid cards={COMPARISONS} />
      </section>

      <section className="mt-14 rounded-2xl border border-amber-500/20 bg-amber-50/60 p-6 dark:bg-amber-950/10">
        <HubSectionHeading eyebrow="Safety boundary" title="Medication context can matter more than supplement ranking" />
        <p className="mt-3 text-sm leading-7 text-muted">
          If you use diabetes medicines, anticoagulants, immunosuppressants, or other regular prescriptions, do not interpret a favorable supplement comparison as clearance to combine products. Check the exact medication interaction and discuss changes with the relevant clinician or pharmacist.
        </p>
        <Link href="/safety-checker/" className="mt-4 inline-flex font-semibold text-brand-800 hover:underline">Open the Safety Checker →</Link>
      </section>

      <section className="mt-14">
        <HubSectionHeading
          eyebrow="Research deeper"
          title="Core metabolic-health profiles"
          sub="Use the canonical profiles for the underlying evidence summary, studied dose, mechanisms, and safety data."
        />
        <div className="grid gap-3 sm:grid-cols-3">
          {DEPTH_LINKS.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-xl border border-brand-900/12 bg-white p-4 transition hover:border-brand-700/30 hover:bg-brand-50 dark:border-white/10 dark:bg-[var(--surface-card)] dark:hover:bg-white/10"
            >
              <span className="block text-[11px] font-bold uppercase tracking-widest text-muted">{item.kind}</span>
              <span className="mt-1 block text-sm font-semibold text-brand-800 dark:text-[var(--text-primary)]">{item.title} →</span>
            </Link>
          ))}
        </div>
      </section>
    </div>
  )
}
