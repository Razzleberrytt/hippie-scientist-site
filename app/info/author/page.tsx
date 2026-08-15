import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import { buildPageMetadata } from '../../../src/lib/seo'

const TITLE = 'About the Author: Willie B. Randolph III'
const DESCRIPTION =
  'Learn who is responsible for The Hippie Scientist, how evidence is handled, what the author does not claim, how commercial incentives are separated from evidence grades, and how corrections are published.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/author/',
  openGraphType: 'profile',
})

const productionSteps = [
  {
    title: 'Start from structured evidence',
    body: 'Ingredient profiles begin from structured evidence, safety, dosing, interaction, formulation, citation, and visibility fields rather than from a marketing narrative.',
  },
  {
    title: 'Separate evidence classes',
    body: 'Human trials, systematic reviews, observational evidence, case reports, animal research, in-vitro work, and mechanism evidence remain distinguishable. Mechanism alone is not treated as a proven human outcome.',
  },
  {
    title: 'Keep uncertainty visible',
    body: 'Mixed or contradicting studies, population limits, preparation-specific findings, missing dose context, and safety uncertainty should remain visible instead of being flattened into a stronger claim.',
  },
  {
    title: 'Publish provenance',
    body: 'Review dates represent recorded review events, meaningful scientific corrections belong in a public ledger, and dataset releases use versioned changelogs rather than silent historical rewriting.',
  },
]

const trustLinks = [
  { href: '/info/editorial-policy/', title: 'Editorial & evidence policy', body: 'Exact grading, inclusion, conflict-resolution, safety, dosing, automation, and affiliate-independence rules.' },
  { href: '/learn/citation-explorer/', title: 'Citation Explorer', body: 'Search the structured studies and see design, sample size, population, outcome, limitations, and evidence direction.' },
  { href: '/evidence/evidence-report/', title: 'Evidence Report', body: 'Inspect the original-data report, dataset downloads, evidence distribution, and change-tracking system.' },
  { href: '/info/corrections/', title: 'Corrections', body: 'See how material scientific changes are recorded and submit a correction or missing study.' },
  { href: '/info/affiliate-disclosure/', title: 'Affiliate disclosure', body: 'See how monetized links are disclosed and kept separate from evidence grades and safety conclusions.' },
]

const faqItems = [
  {
    question: 'Who is responsible for The Hippie Scientist?',
    answer:
      'The Hippie Scientist is an independent project led by Willie B. Randolph III. The author is responsible for the project’s editorial systems, evidence presentation, transparency standards, and correction process.',
  },
  {
    question: 'Does the author claim medical or scientific credentials?',
    answer:
      'No professional medical, pharmacist, dietitian, or academic-research credential is implied by the author page. When qualified external review actually occurs, reviewer identity, qualifications, and review date are presented as separate recorded review information.',
  },
  {
    question: 'Can a supplement company pay to improve an evidence grade?',
    answer:
      'No. Evidence grades, safety conclusions, and source inclusion are governed by the published editorial rules. Affiliate commission or commercial relationships cannot raise an evidence grade or suppress a safety concern.',
  },
  {
    question: 'How are errors handled?',
    answer:
      'Material corrections to evidence grades, safety conclusions, dosing context, study interpretation, or citation attribution belong in the public corrections ledger. Readers can also submit missing studies or suspected errors.',
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
        <p className='eyebrow-label'>Editorial responsibility</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>
          Willie B. Randolph III, founder and independent author of The Hippie Scientist.
        </h1>
        <p className='text-reading mt-4 max-w-3xl'>
          The useful reason to know who is behind this project is accountability: who chose the methodology, who is
          responsible for correcting mistakes, what commercial incentives are allowed to influence, and what claims
          of expertise the site does — and does not — make.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/editorial-policy/' className='button-primary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            Read the exact evidence rules
          </Link>
          <Link href='/info/corrections/' className='button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            Corrections &amp; update history
          </Link>
          <Link href='/evidence/evidence-report/' className='button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            Inspect the evidence dataset
          </Link>
        </div>
      </section>

      <section className='grid gap-5 lg:grid-cols-2' aria-label='Author trust boundaries'>
        <article className='card-premium p-6 sm:p-7'>
          <p className='section-label'>What this establishes</p>
          <h2 className='mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hs-ink)]'>
            Methodology, transparency, and editorial responsibility
          </h2>
          <p className='mt-4 text-sm leading-7 text-[color:var(--hs-body)]'>
            The project publishes its grading rules, study-class hierarchy, inclusion and exclusion standards,
            correction process, data provenance, affiliate boundaries, and automation policy so readers can inspect
            the system instead of relying on biography as a proxy for reliability.
          </p>
        </article>
        <article className='card-premium p-6 sm:p-7'>
          <p className='section-label'>What this does not establish</p>
          <h2 className='mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hs-ink)]'>
            No implied clinical or academic credential
          </h2>
          <p className='mt-4 text-sm leading-7 text-[color:var(--hs-body)]'>
            The author page does not imply that Willie is a physician, pharmacist, dietitian, clinician, or academic
            researcher. Qualified external review is displayed only when a real page-specific review event has been
            recorded with reviewer identity, qualifications, and date.
          </p>
        </article>
      </section>

      <section aria-labelledby='workflow-title'>
        <p className='section-label'>Editorial workflow</p>
        <h2 id='workflow-title' className='mt-3 max-w-3xl font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>
          How evidence moves from source material to a public conclusion
        </h2>
        <div className='mt-7 grid gap-7 md:grid-cols-2 lg:grid-cols-4'>
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
        <div className='grid gap-8 lg:grid-cols-2 lg:gap-12'>
          <div>
            <p className='section-label'>Evidence independence</p>
            <h2 className='mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>
              Evidence rankings are not for sale.
            </h2>
            <p className='mt-4 max-w-2xl text-sm leading-7 text-[color:var(--hs-body)]'>
              Supplement companies cannot pay to raise an evidence grade, change which studies count, weaken a safety
              warning, or alter the scientific conclusion. Affiliate commission cannot influence an evidence grade or
              safety conclusion. Product-quality judgments, when used, remain separate from efficacy evidence.
            </p>
          </div>
          <div>
            <p className='section-label'>Funding &amp; conflicts</p>
            <h2 className='mt-3 max-w-2xl font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>
              Commercial relationships must remain visible and downstream of evidence.
            </h2>
            <p className='mt-4 max-w-2xl text-sm leading-7 text-[color:var(--hs-body)]'>
              Monetized links are disclosed. A commercial relationship does not create scientific support, and the
              absence of a commercial relationship does not make weak evidence strong. Material conflicts that could
              reasonably affect interpretation should be disclosed rather than hidden inside generic site copy.
            </p>
          </div>
        </div>
      </section>

      <section aria-labelledby='trust-pages-title'>
        <p className='section-label'>Verify the process</p>
        <h2 id='trust-pages-title' className='mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>
          Trust and research resources
        </h2>
        <div className='mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-5'>
          {trustLinks.map((item) => (
            <Link key={item.href} href={item.href} className='card-premium p-6 transition motion-safe:hover:-translate-y-0.5'>
              <h3 className='text-lg font-semibold tracking-tight text-ink'>{item.title}</h3>
              <p className='mt-3 text-sm leading-7 text-muted'>{item.body}</p>
              <span className='mt-5 inline-flex text-sm font-semibold text-[color:var(--tone-ink)]'>Open →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 sm:p-8' aria-labelledby='accountability-title'>
        <p className='section-label'>Accountability</p>
        <h2 id='accountability-title' className='mt-3 font-display text-3xl font-semibold tracking-[-0.035em] text-[color:var(--hs-ink)]'>
          A correction is more useful than an uncheckable claim of authority.
        </h2>
        <p className='mt-4 max-w-3xl text-sm leading-7 text-[color:var(--hs-body)]'>
          If a page misclassifies a study, overstates a finding, misses a safety source, or uses stale evidence, readers
          can flag it publicly through the correction workflow. Material scientific corrections are recorded rather
          than silently rewritten as though the earlier claim never existed.
        </p>
        <Link href='/info/corrections/' className='mt-5 inline-flex rounded-full bg-brand-800 px-5 py-2.5 text-sm font-bold text-white hover:bg-brand-900'>
          Review or submit corrections →
        </Link>
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
