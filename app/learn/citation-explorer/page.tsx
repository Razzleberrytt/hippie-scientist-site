import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import { buildPageMetadata } from '../../../src/lib/seo'
import { getPublicEvidenceDataset } from '@/lib/public-evidence-dataset'
import CitationExplorerClient from './CitationExplorerClient'

const TITLE = 'Human Trial & Scientific Citation Explorer'
const DESCRIPTION =
  'Search and filter the trials, reviews, observational studies, preclinical sources, doses, populations, outcomes, limitations, and evidence directions behind The Hippie Scientist research database.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/learn/citation-explorer/',
  openGraphType: 'article',
})

const faqItems = [
  {
    question: 'What does “supports,” “mixed,” or “contradicts” mean?',
    answer: 'Those labels describe how a structured study relationship is used for a particular ingredient or claim context. They are kept separate so conflicting evidence is visible instead of averaged away.',
  },
  {
    question: 'Does a study appearing here prove an ingredient works?',
    answer: 'No. Study design, sample size, population, dose, formulation, outcome, limitations, replication, and disagreement with other studies all affect confidence. The explorer exposes those details rather than treating citation count as proof.',
  },
  {
    question: 'Why are animal, cell, or mechanism studies included?',
    answer: 'They can be useful research context and help explain plausibility, but the explorer labels them separately from direct human evidence so they are not mistaken for clinical efficacy evidence.',
  },
]

export default async function CitationExplorerPage() {
  const dataset = await getPublicEvidenceDataset()
  const metrics = dataset.metrics

  return (
    <div className="container-page space-y-10 py-10">
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url="https://thehippiescientist.net/learn/citation-explorer"
        type="Article"
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Education', url: 'https://thehippiescientist.net/learn' },
          { name: 'Citation Explorer', url: 'https://thehippiescientist.net/learn/citation-explorer' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs items={[{ label: 'Home', href: '/' }, { label: 'Education', href: '/learn' }, { label: 'Citation Explorer' }]} />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="eyebrow-label">Public study database · v{dataset.datasetVersion}</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">Search the evidence behind the ingredient profiles.</h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          Explore the structured studies attached to currently indexable ingredient profiles, including study class,
          sample size, dose, duration, population, outcome, limitations, safety reporting, and whether a source
          supports, complicates, or contradicts a claim context.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/info/editorial-policy/" className="chip-readable transition hover:bg-white">Evidence rules</Link>
          <Link href="/evidence/evidence-report/" className="chip-readable transition hover:bg-white">State of Supplement Evidence 2026</Link>
          <a href="/evidence/evidence-report/dataset.csv" className="chip-readable transition hover:bg-white" download>Download CSV</a>
          <a href="/evidence/evidence-report/dataset.json" className="chip-readable transition hover:bg-white" download>Download JSON</a>
        </div>
      </section>

      <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4" aria-label="Citation Explorer coverage">
        <div className="card-premium p-5"><p className="eyebrow-label">Structured studies</p><p className="mt-2 text-3xl font-bold text-ink">{metrics.studyCount.toLocaleString()}</p></div>
        <div className="card-premium p-5"><p className="eyebrow-label">Human evidence sources</p><p className="mt-2 text-3xl font-bold text-ink">{metrics.humanStudyCount.toLocaleString()}</p></div>
        <div className="card-premium p-5"><p className="eyebrow-label">Human trials</p><p className="mt-2 text-3xl font-bold text-ink">{metrics.humanTrialCount.toLocaleString()}</p></div>
        <div className="card-premium p-5"><p className="eyebrow-label">Mixed/discordant entities</p><p className="mt-2 text-3xl font-bold text-ink">{metrics.disagreementStudyCount.toLocaleString()}</p></div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 text-sm leading-7 text-muted">
        <strong className="text-ink">Scope note:</strong> This explorer is generated from currently indexable runtime
        records. A missing study is not evidence that no study exists, and missing structured safety data is not a
        declaration of safety. <Link href="/info/corrections/" className="font-semibold text-brand-700 hover:underline">Submit a correction or missing study →</Link>
      </section>

      <CitationExplorerClient studies={dataset.studies} />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white p-6 shadow-sm sm:p-8">
        <p className="eyebrow-label">Dataset citation</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">Cite this evidence dataset</h2>
        <p className="mt-3 max-w-4xl rounded-xl bg-brand-50/60 p-4 font-mono text-xs leading-6 text-ink">{dataset.citationText}</p>
        <p className="mt-3 text-sm leading-7 text-muted">
          Stable study IDs prefer PMID, then DOI, then source URL, then a normalized title fallback. Ingredient
          relationships are represented separately from study identity so the same paper can be interpreted in more
          than one ingredient or outcome context without duplicating the paper itself.
        </p>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">FAQ</h2>
        <div className="mt-4 grid gap-4">
          {faqItems.map(item => <article key={item.question} className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4"><h3 className="font-bold text-ink">{item.question}</h3><p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p></article>)}
        </div>
      </section>
    </div>
  )
}
