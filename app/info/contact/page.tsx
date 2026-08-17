import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'

const TITLE = 'Contact The Hippie Scientist: Corrections, Feedback, and Research Notes'
const DESCRIPTION =
  'Contact The Hippie Scientist for research corrections, broken page reports, evidence updates, feature suggestions, and thoughtful partnership inquiries.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/contact/',
  openGraphType: 'article',
})

const contactReasons = [
  {
    title: 'Research corrections',
    body: 'Send updated studies, broken citations, outdated wording, or places where a claim needs softer context.',
  },
  {
    title: 'Technical issues',
    body: 'Report broken links, page rendering problems, missing metadata, mobile layout bugs, or confusing navigation.',
  },
  {
    title: 'Feature ideas',
    body: 'Suggest comparison pages, pathway visualizations, filters, tool improvements, or educational resources readers would actually use.',
  },
]

const messageChecklist = [
  'Include the page URL when reporting a correction or bug.',
  'Quote the specific sentence or section if the issue is editorial.',
  'Share a source link when suggesting new evidence.',
  'Separate urgent personal questions from general site feedback.',
]

const faqItems = [
  {
    question: 'What kind of feedback is most useful?',
    answer:
      'The most useful feedback includes the page URL, the sentence or feature being discussed, and a source or clear description of the problem.',
  },
  {
    question: 'Can I suggest a new comparison page?',
    answer:
      'Yes. Suggestions for compare pages, guide pages, filters, and tool improvements are welcome, especially when they match common reader goals.',
  },
  {
    question: 'Can The Hippie Scientist answer personal supplement questions?',
    answer:
      'The site can organize educational information, but it cannot replace individualized professional guidance. Personal decisions should be checked in the right personal context.',
  },
]

export default function ContactPage() {
  return (
    <div className='container-page py-10 space-y-10'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/info/contact'
        type='ContactPage'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Contact', url: 'https://thehippiescientist.net/info/contact' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Contact' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Contact</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>
          Send corrections, feedback, and research notes.
        </h1>
        <p className='text-reading mt-4 max-w-3xl'>
          The Hippie Scientist improves when readers report unclear wording, outdated research, broken links,
          confusing pages, or useful ideas for future comparison tools. Specific feedback is the easiest to act on.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/about/' className='chip-readable px-4 py-2 text-sm font-semibold'>About the project</Link>
          <Link href='/info/methodology/' className='chip-readable px-4 py-2 text-sm font-semibold'>Methodology</Link>
          <Link href='/info/disclaimer/' className='chip-readable px-4 py-2 text-sm font-semibold'>Disclaimer</Link>
        </div>
      </section>

      <section className='grid gap-5 md:grid-cols-3'>
        {contactReasons.map((reason) => (
          <article key={reason.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Best for</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-[color:var(--hs-ink)]'>{reason.title}</h2>
            <p className='mt-3 text-sm leading-7 text-[color:var(--hs-body)]'>{reason.body}</p>
          </article>
        ))}
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='card-premium p-6 sm:p-8'>
          <p className='eyebrow-label'>Primary contact</p>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight text-[color:var(--hs-ink)]'>Reach The Hippie Scientist</h2>
          <div className='mt-5 space-y-4 text-sm leading-7 text-[color:var(--hs-body)] sm:text-base'>
            <p>
              Email:{' '}
              <a
                href='mailto:randolphwillie77@gmail.com'
                className='font-semibold text-[color:var(--hs-gold-ink)] underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'
              >
                randolphwillie77@gmail.com
              </a>
            </p>
            <p>
              The project focuses on evidence-informed summaries of herbs, compounds, pathways, mechanisms,
              product-quality checks, and related wellness research topics.
            </p>
            <div className='rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] p-4'>
              <p className='font-bold text-[color:var(--hs-ink)]'>Helpful details to include</p>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-[color:var(--hs-body)]'>
                {messageChecklist.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        <aside className='card-premium h-fit p-6'>
          <p className='eyebrow-label'>Explore first</p>
          <div className='mt-4 divide-y divide-[color:var(--hs-hairline)]'>
            {[
              { href: '/learn/citation-explorer/', title: 'Citation explorer', body: 'Understand how research sources are interpreted.' },
              { href: '/learn/product-quality/', title: 'Product quality', body: 'Check labels, forms, testing, and buying context.' },
              { href: '/safety-checker/', title: 'Safety checker', body: 'Use the educational safety workflow before stacking.' },
            ].map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className='block py-4 first:pt-0 last:pb-0 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'
              >
                <p className='text-sm font-semibold text-[color:var(--hs-ink)]'>{item.title}</p>
                <p className='mt-1 text-sm leading-6 text-[color:var(--hs-body)]'>{item.body}</p>
              </Link>
            ))}
          </div>
        </aside>
      </section>

      <section className='section-frame p-6' aria-labelledby='contact-faq'>
        <p className='eyebrow-label'>Questions readers ask</p>
        <h2 id='contact-faq' className='compact-heading mt-3'>FAQ</h2>
        <div className='mt-5 grid gap-4'>
          {faqItems.map((item) => (
            <article key={item.question} className='rounded-2xl border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] p-4'>
              <h3 className='font-bold text-[color:var(--hs-ink)]'>{item.question}</h3>
              <p className='mt-2 text-sm leading-7 text-[color:var(--hs-body)]'>{item.answer}</p>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
