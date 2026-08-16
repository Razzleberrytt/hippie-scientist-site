import type { Metadata } from 'next'
import Link from 'next/link'

import Disclaimer from '@/src/components/Disclaimer'
import { SITE_URL, breadcrumbJsonLd, buildTwitterMetadata } from '@/src/lib/seo'
import SchemaOrg from '@/components/SchemaOrg'

const PAGE_PATH = '/goals/metabolic-health/'

export const metadata: Metadata = {
  title: 'Metabolic Health Research: Berberine, Inositol & Cinnamon',
  description:
    'Start metabolic-health supplement research from the outcome, then move into the full evidence guide, canonical ingredient profiles, and safety context.',
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: 'Metabolic Health Research',
    description:
      'Use one clear starting point for metabolic-health supplement research, then continue into evidence, comparisons, and safety.',
    url: `${SITE_URL}${PAGE_PATH}`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Metabolic Health Research',
    description: 'Start with the goal, then continue into the full metabolic-health evidence guide and safety context.',
  }),
}

const breadcrumbs = breadcrumbJsonLd([
  { name: 'Home', url: `${SITE_URL}/` },
  { name: 'Goals', url: `${SITE_URL}/goals/` },
  { name: 'Metabolic Health Research', url: `${SITE_URL}${PAGE_PATH}` },
])

const nextSteps = [
  {
    href: '/guides/metabolic-health/',
    eyebrow: 'Full topic guide',
    title: 'Research metabolic health in depth',
    description:
      'Choose the actual question—blood sugar, insulin sensitivity, weight-loss claims, medication context, or a head-to-head comparison—then follow the relevant evidence path.',
  },
  {
    href: '/compounds/berberine/',
    eyebrow: 'Canonical profile',
    title: 'Inspect the Berberine evidence record',
    description:
      'Review the underlying human evidence, studied dose and form, safety, and interaction context before comparing alternatives.',
  },
  {
    href: '/safety-checker/',
    eyebrow: 'Safety first',
    title: 'Check combinations and medication context',
    description:
      'Screen ingredient combinations and documented or theoretical caution signals before treating a favorable comparison as clearance to combine products.',
  },
] as const

export default function MetabolicHealthGoalPage() {
  return (
    <main className="container-page space-y-10 py-10">
      <SchemaOrg schema={breadcrumbs} />

      <nav aria-label="Breadcrumb" className="text-sm text-muted">
        <Link href="/" className="hover:underline">Home</Link>
        <span aria-hidden="true"> / </span>
        <Link href="/goals/" className="hover:underline">Goals</Link>
        <span aria-hidden="true"> / </span>
        <span className="font-medium text-ink">Metabolic health</span>
      </nav>

      <header className="max-w-4xl space-y-4">
        <p className="eyebrow-label">Goal research hub</p>
        <h1 className="text-4xl font-bold tracking-tight text-ink sm:text-5xl">Metabolic health research</h1>
        <p className="text-lg leading-8 text-muted">
          Start with the outcome you are researching, not a supplement claim. This page is the front door; the full metabolic-health guide owns the deeper comparison logic, while canonical ingredient profiles own the underlying evidence records.
        </p>
      </header>

      <section className="grid gap-4 md:grid-cols-3" aria-label="Metabolic health research paths">
        {nextSteps.map((step) => (
          <Link
            key={step.href}
            href={step.href}
            className="card-premium block h-full p-6 transition hover:border-brand-700/20 hover:shadow-sm"
          >
            <p className="text-[10px] font-bold uppercase tracking-wider text-brand-700 dark:text-brand-200">
              {step.eyebrow}
            </p>
            <h2 className="mt-2 text-xl font-semibold text-ink">{step.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{step.description}</p>
            <span className="mt-4 inline-flex text-sm font-semibold text-brand-800 dark:text-brand-100">Open path →</span>
          </Link>
        ))}
      </section>

      <section className="max-w-5xl rounded-2xl border border-amber-500/20 bg-amber-50/60 p-5 text-sm leading-6 text-muted dark:bg-amber-950/10">
        <strong className="text-ink">Disease-treatment boundary:</strong> changes in metabolic markers do not make a supplement a substitute for diagnosis, prescribed treatment, or medication management. The site intentionally keeps those decisions outside this consumer research path.
      </section>

      <Disclaimer />
    </main>
  )
}
