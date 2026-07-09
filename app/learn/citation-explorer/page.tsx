import type { Metadata } from 'next'
import Link from 'next/link'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import { buildPageMetadata } from '../../../src/lib/seo'

const TITLE = 'Scientific Citation Explorer: How We Read Supplement Research'
const DESCRIPTION =
  'Learn how The Hippie Scientist reads citations, human trials, mechanism studies, sample size, study design, dose realism, and evidence confidence before summarizing supplement research.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/learn/citation-explorer/',
  openGraphType: 'article',
})

const evidenceLayers = [
  {
    title: 'Human outcomes first',
    body: 'Human outcome studies usually carry more weight than mechanism-only reasoning. A pathway can explain why an idea is plausible, but it should not do all the work by itself.',
  },
  {
    title: 'Dose realism matters',
    body: 'A study is more useful when the dose, extract form, timing, and population resemble how readers might realistically encounter the ingredient.',
  },
  {
    title: 'Safety changes the tone',
    body: 'Even promising research deserves careful wording when there are interaction concerns, sedative overlap, stimulant load, liver cautions, or poor product-quality signals.',
  },
]

const confidenceChecks = [
  'Was the study done in humans, animals, cells, or a mixed evidence base?',
  'Does the study measure the outcome readers care about, or only a biomarker?',
  'Is the dose achievable with normal supplement products?',
  'Is the population similar to the intended use case?',
  'Do safety notes change how strongly the page should summarize the finding?',
]

const faqItems = [
  {
    question: 'What makes a citation useful for a supplement page?',
    answer:
      'A useful citation directly studies a relevant outcome, uses a realistic dose and product form, clearly describes the population, and reports limitations or adverse events.',
  },
  {
    question: 'Why are mechanism studies still included?',
    answer:
      'Mechanism studies can explain biological plausibility and help readers understand pathways. They are helpful background, but they should not be treated as proof of a real-world outcome by themselves.',
  },
  {
    question: 'How should mixed evidence be handled?',
    answer:
      'Mixed evidence should reduce certainty. A good summary explains what appears consistent, what remains uncertain, and where softer wording is more appropriate.',
  },
]

export default function CitationExplorerPage() {
  return (
    <div className="container-page py-10 space-y-10">
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

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Education', href: '/learn' },
          { label: 'Citation Explorer' },
        ]}
      />

      <section className="rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="eyebrow-label">Evidence verification</p>
        <h1 className="mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl">
          Scientific citation explorer for supplement research.
        </h1>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">
          This page explains how citations are read before a research summary becomes confident or cautious.
          The goal is to separate human outcome evidence, mechanism background, dose realism, safety context,
          and marketing language so readers can understand the evidence layer behind the page.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/info/methodology/" className="chip-readable hover:bg-white transition">Editorial methodology</Link>
          <Link href="/learn/efficacy-model/" className="chip-readable hover:bg-white transition">Efficacy modeler</Link>
          <Link href="/learn/explorer/" className="chip-readable hover:bg-white transition">Pathway explorer</Link>
        </div>
      </section>

      <section className="grid gap-5 lg:grid-cols-3">
        {evidenceLayers.map((layer) => (
          <article key={layer.title} className="card-premium p-6">
            <p className="eyebrow-label">Evidence layer</p>
            <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">{layer.title}</h2>
            <p className="mt-3 text-sm leading-7 text-muted">{layer.body}</p>
          </article>
        ))}
      </section>

      <section className="rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8">
        <div className="max-w-3xl space-y-3">
          <p className="eyebrow-label">Citation quality checklist</p>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">Five questions before reading a citation too strongly</h2>
          <p className="text-sm leading-7 text-muted">
            A citation can be real and still be easy to over-read. These checks keep the wording on the site
            proportional to the actual evidence.
          </p>
        </div>
        <ol className="mt-6 grid gap-3 md:grid-cols-2">
          {confidenceChecks.map((check, index) => (
            <li key={check} className="rounded-2xl border border-brand-900/10 bg-white/80 p-4 text-sm leading-6 text-muted">
              <span className="mr-2 font-bold text-brand-800">{index + 1}.</span>{check}
            </li>
          ))}
        </ol>
      </section>

      <section className="card-premium p-6 sm:p-8">
        <p className="eyebrow-label">How this supports page quality</p>
        <h2 className="mt-2 text-2xl font-semibold tracking-tight text-ink">
          Better citation reading makes better educational pages.
        </h2>
        <p className="mt-3 max-w-3xl text-sm leading-7 text-muted">
          Search traffic is only useful if the page earns trust after the click. The citation workflow keeps
          high-intent pages from sounding like product copy: stronger phrases need stronger evidence layers,
          and uncertain findings should be labeled as uncertain.
        </p>
        <div className="mt-5 flex flex-wrap gap-3">
          <Link href="/learn/product-quality/" className="chip-readable hover:bg-white transition">Product-quality guide</Link>
          <Link href="/learn/interactions/" className="chip-readable hover:bg-white transition">Interaction framework</Link>
          <Link href="/evidence/evidence-checker/" className="chip-readable hover:bg-white transition">Evidence checker</Link>
        </div>
      </section>

      <section className="rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm">
        <h2 className="text-2xl font-semibold tracking-tight text-ink">FAQ</h2>
        <div className="mt-4 grid gap-4">
          {faqItems.map((item) => (
            <article key={item.question} className="rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4">
              <h3 className="font-bold text-ink">{item.question}</h3>
              <p className="mt-2 text-sm leading-7 text-muted">{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
