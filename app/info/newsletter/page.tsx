import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import EmailCapture from '../../../components/EmailCapture'
import NewsletterInterestSignup from '@/components/monetization/NewsletterInterestSignup'

const TITLE = 'Supplement Research Newsletter: Evidence Notes and Safety Checklists'
const DESCRIPTION =
  'Join The Hippie Scientist newsletter for evidence-first supplement notes, safety checklists, product-quality reminders, and plain-English research updates.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/newsletter/',
  openGraphType: 'article',
})

const archiveItems = [
  {
    title: 'How to read supplement safety labels',
    description: 'Medication context, dose transparency, serving-size tricks, and why product form matters before any buying decision.',
    href: '/learn/product-quality/',
  },
  {
    title: 'Evidence levels in plain English',
    description: 'How to separate human trials, mechanism background, traditional use, mixed findings, and marketing language.',
    href: '/learn/citation-explorer/',
  },
  {
    title: 'What to check before buying magnesium',
    description: 'Elemental dose, form differences, digestive tolerance, kidney-health cautions, and why labels can be confusing.',
    href: '/guides/sleep/magnesium-for-sleep/',
  },
]

const newsletterBenefits = [
  {
    title: 'Short research notes',
    body: 'Plain-English summaries of new or useful supplement evidence without turning every paper into a product recommendation.',
  },
  {
    title: 'Safety-first reminders',
    body: 'Practical prompts for interactions, stacking, dose form, product quality, and situations where extra caution makes sense.',
  },
  {
    title: 'New page alerts',
    body: 'Updates when major guides, comparison pages, infographics, and education tools are expanded or refreshed.',
  },
]

const faqItems = [
  {
    question: 'What is in the newsletter?',
    answer:
      'The newsletter focuses on supplement research notes, evidence-quality reminders, safety context, product-quality checks, and updates to major site guides.',
  },
  {
    question: 'Can I choose which research topics I receive?',
    answer:
      'Yes. The research-interest selector lets you choose Sleep, Stress, Anxiety, Focus, or General research. It stores a newsletter content preference rather than asking for symptoms or medical details.',
  },
  {
    question: 'Is the newsletter sales-focused?',
    answer:
      'No. The newsletter is designed as a research and education update. Any product or affiliate context should remain secondary to evidence, safety, and label-quality discussion.',
  },
  {
    question: 'Can I unsubscribe later?',
    answer:
      'Yes. Newsletter emails should include an unsubscribe option, and the privacy page explains how email subscriptions are handled.',
  },
]

export default function NewsletterArchivePage() {
  return (
    <div className='container-page py-10 space-y-10'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/info/newsletter'
        type='Article'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Newsletter', url: 'https://thehippiescientist.net/info/newsletter' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Newsletter' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Newsletter archive</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>
          Evidence-first supplement notes, without the hype cycle.
        </h1>
        <p className='text-reading mt-4 max-w-3xl'>
          The newsletter is for readers who want concise research updates, product-quality reminders,
          and safety-first supplement context without sales-first ranking language. Use this archive as a preview of the style.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/free-guide/' className='chip-readable px-4 py-2 text-sm font-semibold'>Free decision guide</Link>
          <Link href='/info/infographics/' className='chip-readable px-4 py-2 text-sm font-semibold'>Free infographics</Link>
          <Link href='/info/privacy/' className='chip-readable px-4 py-2 text-sm font-semibold'>Privacy policy</Link>
        </div>
      </section>

      <section className='grid gap-5 md:grid-cols-3'>
        {newsletterBenefits.map((benefit) => (
          <article key={benefit.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Why subscribe</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-[color:var(--hs-ink)]'>{benefit.title}</h2>
            <p className='mt-3 text-sm leading-7 text-[color:var(--hs-body)]'>{benefit.body}</p>
          </article>
        ))}
      </section>

      <EmailCapture
        headline='Get the next research note'
        description='Join for concise supplement evidence notes, product-quality reminders, and safety-first guide updates.'
        ctaLabel='Subscribe'
        location='newsletter-archive'
      />

      <NewsletterInterestSignup />

      <section className='section-frame p-6 sm:p-8' aria-labelledby='newsletter-archive-preview'>
        <p className='eyebrow-label'>Archive preview</p>
        <h2 id='newsletter-archive-preview' className='compact-heading mt-3'>Example topics readers care about</h2>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          {archiveItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              className='card-premium group flex min-h-[11rem] flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2'
            >
              <h3 className='text-base font-semibold text-[color:var(--hs-ink)]'>{item.title}</h3>
              <p className='mt-3 text-sm leading-6 text-[color:var(--hs-body)]'>{item.description}</p>
              <span className='mt-auto pt-4 text-sm font-bold text-[color:var(--hs-gold-ink)] group-hover:underline'>Read topic →</span>
            </Link>
          ))}
        </div>
      </section>

      <section className='section-frame p-6' aria-labelledby='newsletter-faq'>
        <p className='eyebrow-label'>Questions readers ask</p>
        <h2 id='newsletter-faq' className='compact-heading mt-3'>FAQ</h2>
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
