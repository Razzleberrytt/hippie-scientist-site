import type { Metadata } from 'next'
import Link from 'next/link'

import Disclaimer from '@/src/components/Disclaimer'
import { SITE_URL, breadcrumbJsonLd, buildTwitterMetadata } from '@/src/lib/seo'
import SchemaOrg from '@/components/SchemaOrg'

const PAGE_PATH = '/goals/metabolic-health/'

export const metadata: Metadata = {
  title: 'Metabolic Health Research: Berberine, Inositol & Cinnamon',
  description:
    'Research metabolic-health supplements through human evidence, studied dose and form, interaction context, and head-to-head comparisons without treating supplements as disease treatment.',
  alternates: { canonical: `${SITE_URL}${PAGE_PATH}` },
  openGraph: {
    title: 'Metabolic Health Research',
    description:
      'Start with Berberine, then compare evidence, formulation, and safety context across realistic metabolic-health alternatives.',
    url: `${SITE_URL}${PAGE_PATH}`,
    type: 'article',
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: 'Metabolic Health Research',
    description: 'Compare metabolic-health supplement evidence without turning marker research into disease-treatment advice.',
  }),
}

const breadcrumbs = breadcrumbJsonLd([
  { name: 'Home', url: `${SITE_URL}/` },
  { name: 'Goals', url: `${SITE_URL}/goals/` },
  { name: 'Metabolic Health Research', url: `${SITE_URL}${PAGE_PATH}` },
])

const researchChecks = [
  {
    title: 'Human endpoint',
    text: 'Check what was actually measured in people. Glucose, lipid, appetite, body-composition, and disease-treatment outcomes are not interchangeable.',
  },
  {
    title: 'Studied dose and form',
    text: 'Match conclusions to the formulation and dose represented in the evidence record instead of assuming every consumer product is equivalent.',
  },
  {
    title: 'Medication and safety context',
    text: 'Metabolic-health ingredients can overlap with medication-sensitive pathways. Review the canonical interaction record before treating a supplement as a simple wellness add-on.',
  },
]

const comparisons = [
  {
    href: '/guides/compare/berberine-vs-inositol/',
    label: 'Berberine vs Inositol',
    note: 'Compare two common metabolic-health research paths using evidence, dose, formulation, and safety context.',
  },
  {
    href: '/guides/compare/berberine-vs-cinnamon/',
    label: 'Berberine vs Cinnamon',
    note: 'Compare canonical records without assuming shared metabolic marketing means equivalent evidence.',
  },
]

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
          Start with Berberine because it anchors several of the site’s metabolic-health research paths, then compare realistic alternatives by human evidence, studied form, dose context, and safety. This hub is for evidence research—not diagnosis or disease treatment.
        </p>
      </header>

      <section className="card-premium max-w-4xl space-y-4 p-6 sm:p-8" aria-labelledby="start-berberine">
        <p className="eyebrow-label">Start here</p>
        <h2 id="start-berberine" className="text-2xl font-semibold text-ink">Inspect the Berberine evidence record first</h2>
        <p className="leading-7 text-muted">
          Use the canonical profile to establish what the site actually has for evidence, studied dose, formulations, safety, and interactions before moving into comparisons.
        </p>
        <Link href="/compounds/berberine/" className="font-semibold text-brand-800 hover:underline dark:text-brand-100">
          Open the Berberine profile →
        </Link>
      </section>

      <section className="max-w-5xl space-y-4">
        <div>
          <p className="eyebrow-label">Research filter</p>
          <h2 className="mt-2 text-2xl font-semibold text-ink">What to compare before drawing a conclusion</h2>
        </div>
        <div className="grid gap-4 md:grid-cols-3">
          {researchChecks.map((item) => (
            <article key={item.title} className="card-premium p-5">
              <h3 className="font-semibold text-ink">{item.title}</h3>
              <p className="mt-2 text-sm leading-6 text-muted">{item.text}</p>
            </article>
          ))}
        </div>
      </section>

      <section className="card-premium max-w-5xl space-y-5 p-6 sm:p-8" aria-labelledby="compare-options">
        <p className="eyebrow-label">Next step</p>
        <h2 id="compare-options" className="text-2xl font-semibold text-ink">Compare realistic alternatives</h2>
        <ul className="grid gap-4 sm:grid-cols-2">
          {comparisons.map((comparison) => (
            <li key={comparison.href}>
              <Link href={comparison.href} className="block h-full rounded-2xl border border-brand-900/10 bg-white/70 p-5 transition hover:border-brand-700/20 hover:shadow-sm dark:border-white/10 dark:bg-white/5">
                <span className="font-semibold text-brand-800 dark:text-brand-100">{comparison.label} →</span>
                <span className="mt-2 block text-sm leading-6 text-muted">{comparison.note}</span>
              </Link>
            </li>
          ))}
        </ul>
      </section>

      <section className="max-w-5xl rounded-2xl border border-amber-500/20 bg-amber-50/60 p-5 text-sm leading-6 text-muted dark:bg-amber-950/10">
        <strong className="text-ink">Disease-treatment boundary:</strong> changes in metabolic markers do not make a supplement a substitute for diagnosis, prescribed treatment, or medication management. The site intentionally keeps those decisions outside this consumer comparison path.
      </section>

      <section className="max-w-5xl">
        <Link href="/safety-checker/" className="font-semibold text-brand-800 hover:underline dark:text-brand-100">
          Check ingredient combinations in the Safety Checker →
        </Link>
      </section>

      <Disclaimer />
    </main>
  )
}
