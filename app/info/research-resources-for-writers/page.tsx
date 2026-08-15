import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Resources for Writers & Journalists',
  description: 'Evidence-report data, methodology, citation guidance, reusable graphics, and contact routes for writers covering supplements and botanical research.',
  path: '/info/research-resources-for-writers/',
  openGraphType: 'article',
})

const resources = [
  {
    title: 'Supplement Evidence Report',
    href: '/evidence/evidence-report/',
    description: 'Current evidence-label distribution across the public research library, with transparent scope and caveats.',
  },
  {
    title: 'Research methodology',
    href: '/info/methodology/',
    description: 'How evidence is categorized, how conflicts are handled, and what the grades are intended to mean.',
  },
  {
    title: 'Evidence Checker',
    href: '/evidence/evidence-checker/',
    description: 'A fast way to inspect evidence strength for individual research topics before quoting a claim.',
  },
  {
    title: 'Infographics and visual resources',
    href: '/info/infographics/',
    description: 'Reusable visual research assets. Follow the attribution shown with each published graphic.',
  },
]

export default function ResearchResourcesForWritersPage() {
  return (
    <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6 lg:px-8">
      <header className="max-w-3xl">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">Writer & journalist resources</p>
        <h1 className="mt-3 text-4xl font-bold tracking-tight text-slate-950 sm:text-5xl">Research resources you can verify and cite</h1>
        <p className="mt-5 text-lg leading-8 text-slate-700">
          Start with the underlying research asset, not a promotional pitch. These resources are designed to make scope, methodology,
          caveats, and source trails easy to inspect before you cite The Hippie Scientist.
        </p>
      </header>

      <section className="mt-10 grid gap-5 md:grid-cols-2" aria-labelledby="resources-heading">
        <h2 id="resources-heading" className="sr-only">Research resources</h2>
        {resources.map((resource) => (
          <article key={resource.href} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-xl font-semibold text-slate-950">
              <Link className="underline decoration-emerald-300 underline-offset-4 hover:decoration-emerald-600" href={resource.href}>
                {resource.title}
              </Link>
            </h3>
            <p className="mt-3 leading-7 text-slate-700">{resource.description}</p>
          </article>
        ))}
      </section>

      <section className="mt-12 rounded-3xl bg-slate-950 p-7 text-white sm:p-9" aria-labelledby="citation-heading">
        <h2 id="citation-heading" className="text-2xl font-semibold">Citation guidance</h2>
        <div className="mt-4 space-y-3 text-slate-200">
          <p>For aggregate statistics, cite the named Evidence Report and include the date you accessed it. The dataset changes as records are reviewed.</p>
          <p>For a claim about a specific ingredient, cite the ingredient page and preferably the primary study or review linked beside that claim.</p>
          <p>Do not describe Hippie Scientist evidence grades as medical guidelines or externally validated clinical ratings. They are a transparent editorial framework.</p>
        </div>
      </section>

      <section className="mt-12 grid gap-8 lg:grid-cols-2">
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">What makes a useful pitch to us</h2>
          <p className="mt-3 leading-7 text-slate-700">
            Corrections, missing primary studies, reproducible data issues, and evidence changes are welcome. Product placement offers do not change evidence grades.
          </p>
        </div>
        <div>
          <h2 className="text-2xl font-semibold text-slate-950">Press and supporting-data questions</h2>
          <p className="mt-3 leading-7 text-slate-700">
            Use the <Link className="font-medium text-emerald-800 underline underline-offset-4" href="/info/contact/">contact page</Link> and identify the article,
            deadline, and exact statistic or research object you need verified. That makes it easier to return the underlying source trail rather than a generic quote.
          </p>
        </div>
      </section>
    </main>
  )
}
