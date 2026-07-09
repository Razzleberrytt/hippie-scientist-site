import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import { buildPageMetadata } from '../../../src/lib/seo'

const TITLE = 'About the Author: Willie B. Randolph III'
const DESCRIPTION =
  'Learn about Willie B. Randolph III, the independent author behind The Hippie Scientist, including editorial philosophy, evidence standards, corrections, and review workflow.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/author/',
  openGraphType: 'profile',
})

const productionSteps = [
  {
    title: 'Structured source data',
    body: 'Ingredient profiles begin from structured workbook fields for evidence, safety, mechanisms, dosing context, interactions, and visibility rules.',
  },
  {
    title: 'Evidence-grade language',
    body: 'Human trials and meta-analyses receive the most weight. Mechanism-only findings are labeled as background, not treated as proven outcomes.',
  },
  {
    title: 'Safety-first review',
    body: 'Interaction context, population cautions, legal status, and uncertainty are kept visible before product or sourcing sections.',
  },
]

const trustLinks = [
  { href: '/info/methodology/', title: 'Methodology', body: 'How evidence grades and editorial standards work.' },
  { href: '/learn/citation-explorer/', title: 'Citation explorer', body: 'How research sources are read before summaries are written.' },
  { href: '/info/affiliate-disclosure/', title: 'Affiliate disclosure', body: 'How monetized links stay separate from evidence language.' },
]

const faqItems = [
  {
    question: 'Who writes The Hippie Scientist?',
    answer:
      'The Hippie Scientist is an independent project led by Willie B. Randolph III, focused on building readable, evidence-aware pages about herbs, supplements, compounds, and related mechanisms.',
  },
  {
    question: 'How does the author handle uncertainty?',
    answer:
      'Pages are written to separate human outcome evidence, mechanism background, traditional use, mixed findings, and safety concerns instead of flattening everything into one confidence level.',
  },
  {
    question: 'How can readers send corrections?',
    answer:
      'Readers can use the contact page to send corrections, updated studies, broken links, or examples of wording that may need more careful context.',
  },
]

export default function AuthorPage() {
  const personJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Person',
    name: 'Willie B. Randolph III',
    url: 'https://thehippiescientist.net/info/author/',
    jobTitle: 'Founder and independent author',
    worksFor: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: 'https://thehippiescientist.net/',
    },
    knowsAbout: [
      'supplement research literacy',
      'herbal evidence synthesis',
      'compound profiles',
      'editorial content systems',
      'supplement safety context',
    ],
  }

  return (
    <div className='container-page py-10 space-y-10'>
      <JsonLd schema={personJsonLd} />
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/info/author'
        type='ProfilePage'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Author', url: 'https://thehippiescientist.net/info/author' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Author' },
        ]}
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Author</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          Willie B. Randolph III, independent author of The Hippie Scientist.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Willie builds The Hippie Scientist as an independent evidence-literacy project for readers who want herb,
          supplement, and compound pages that feel calmer, clearer, and less like marketing copy.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/about/' className='rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900'>
            About the project
          </Link>
          <Link href='/info/methodology/' className='rounded-full border border-brand-900/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50'>
            Editorial standards
          </Link>
          <Link href='/info/contact/' className='rounded-full border border-brand-900/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50'>
            Send a correction
          </Link>
        </div>
      </section>

      <section className='grid gap-5 md:grid-cols-3'>
        {productionSteps.map((step) => (
          <article key={step.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Editorial workflow</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-ink'>{step.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{step.body}</p>
          </article>
        ))}
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8'>
        <div className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-start'>
          <div>
            <p className='eyebrow-label'>Author philosophy</p>
            <h2 className='mt-2 text-3xl font-semibold tracking-tight text-ink'>Make supplement research readable without making it sound more certain than it is.</h2>
            <p className='mt-4 text-sm leading-7 text-muted'>
              The site is built around a simple editorial tension: readers need clear summaries, but supplement science is often mixed,
              dose-dependent, product-form-dependent, and sensitive to personal context. The author page exists so readers can quickly
              understand who is behind the project and how corrections are handled.
            </p>
          </div>
          <aside className='rounded-2xl border border-brand-900/10 bg-white/85 p-5'>
            <p className='text-xs font-bold uppercase tracking-[0.16em] text-brand-700'>Snapshot</p>
            <h3 className='mt-2 text-xl font-semibold text-ink'>Willie B. Randolph III</h3>
            <p className='mt-2 text-sm leading-7 text-muted'>
              Independent author, father of two, based in Oak Ridge, Tennessee, focused on building practical research systems and clear supplement education.
            </p>
          </aside>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-3'>
        {trustLinks.map((item) => (
          <Link key={item.href} href={item.href} className='card-premium p-6 transition motion-safe:hover:-translate-y-0.5'>
            <p className='eyebrow-label'>Trust page</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-ink'>{item.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{item.body}</p>
          </Link>
        ))}
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-white/90 p-6 shadow-sm'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink'>FAQ</h2>
        <div className='mt-4 grid gap-4'>
          {faqItems.map((item) => (
            <article key={item.question} className='rounded-2xl border border-brand-900/10 bg-brand-50/40 p-4'>
              <h3 className='font-bold text-ink'>{item.question}</h3>
              <p className='mt-2 text-sm leading-7 text-muted'>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
