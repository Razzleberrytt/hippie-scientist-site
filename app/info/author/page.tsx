import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
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
    <div className='container-page space-y-10 py-8 sm:space-y-12 sm:py-10'>
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

      <section className='hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Author</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>
          Willie B. Randolph III, independent author of The Hippie Scientist.
        </h1>
        <p className='text-reading mt-4 max-w-3xl'>
          Willie builds The Hippie Scientist as an independent evidence-literacy project for readers who want herb,
          supplement, and compound pages that feel calmer, clearer, and less like marketing copy.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/about/' className='button-primary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            About the project
          </Link>
          <Link href='/info/methodology/' className='button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            Editorial standards
          </Link>
          <Link href='/info/contact/' className='button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            Send a correction
          </Link>
        </div>
      </section>

      <section aria-labelledby='workflow-title'>
        <p className='section-label'>Editorial workflow</p>
        <h2 id='workflow-title' className='mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>
          How a page moves from source material to publication
        </h2>
        <div className='mt-7 grid gap-7 md:grid-cols-3'>
          {productionSteps.map((step, index) => (
            <article key={step.title} className='border-t border-[color:var(--hs-hairline)] pt-4'>
              <p aria-hidden='true' className='font-mono text-[0.64rem] font-bold tracking-[0.12em] text-[color:var(--hs-gold-ink)]'>
                {String(index + 1).padStart(2, '0')}
              </p>
              <h3 className='mt-3 font-display text-xl font-semibold tracking-[-0.025em] text-[color:var(--hs-ink)]'>{step.title}</h3>
              <p className='mt-3 text-sm leading-7 text-[color:var(--hs-body)]'>{step.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='border-y border-[color:var(--hs-hairline)] py-8 sm:py-10'>
        <div className='grid gap-8 lg:grid-cols-[1.25fr_0.75fr] lg:gap-12'>
          <div>
            <p className='section-label'>Author philosophy</p>
            <h2 className='mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>
              Make supplement research readable without making it sound more certain than it is.
            </h2>
            <p className='mt-4 max-w-2xl text-sm leading-7 text-[color:var(--hs-body)]'>
              The site is built around a simple editorial tension: readers need clear summaries, but supplement science is often mixed,
              dose-dependent, product-form-dependent, and sensitive to personal context. The author page exists so readers can quickly
              understand who is behind the project and how corrections are handled.
            </p>
          </div>
          <aside className='border-l-2 border-[color:color-mix(in_srgb,var(--hs-gold)_45%,transparent)] pl-5 lg:self-end'>
            <p className='font-mono text-[0.64rem] font-bold uppercase tracking-[0.14em] text-[color:var(--hs-gold-ink)]'>Snapshot</p>
            <h3 className='mt-3 font-display text-xl font-semibold text-[color:var(--hs-ink)]'>Willie B. Randolph III</h3>
            <p className='mt-2 text-sm leading-7 text-[color:var(--hs-body)]'>
              Independent author, father of two little girls, based in Oak Ridge, Tennessee, focused on building practical research systems and clear supplement education.
            </p>
          </aside>
        </div>
      </section>

      <section aria-labelledby='trust-pages-title'>
        <p className='section-label'>Verify the process</p>
        <h2 id='trust-pages-title' className='mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>
          Trust pages
        </h2>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          {trustLinks.map((item) => (
            <Link key={item.href} href={item.href} className='card-premium p-6 transition motion-safe:hover:-translate-y-0.5'>
              <h3 className='text-xl font-semibold tracking-tight text-ink'>{item.title}</h3>
              <p className='mt-3 text-sm leading-7 text-muted'>{item.body}</p>
              <span className='mt-5 inline-flex text-sm font-semibold text-[color:var(--tone-ink)]'>Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className='border-t border-[color:var(--hs-hairline)] pt-8 sm:pt-10' aria-labelledby='author-faq-title'>
        <p className='section-label'>Reader questions</p>
        <h2 id='author-faq-title' className='mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>FAQ</h2>
        <div className='mt-5 divide-y divide-[color:var(--hs-hairline)]'>
          {faqItems.map((item) => (
            <article key={item.question} className='py-5 first:pt-0 last:pb-0'>
              <h3 className='font-display text-lg font-semibold text-[color:var(--hs-ink)]'>{item.question}</h3>
              <p className='mt-2 max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]'>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
