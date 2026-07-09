import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import EmailCapture from '../../../components/EmailCapture'

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

      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Newsletter archive</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          Evidence-first supplement notes, without the hype cycle.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          The newsletter is for readers who want concise research updates, product-quality reminders,
          and safety-first supplement context without sales-first ranking language. Use this archive as a preview of the style.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/free-guide/' className='chip-readable hover:bg-white transition'>Free decision guide</Link>
          <Link href='/info/infographics/' className='chip-readable hover:bg-white transition'>Free infographics</Link>
          <Link href='/info/privacy/' className='chip-readable hover:bg-white transition'>Privacy policy</Link>
        </div>
      </section>

      <section className='grid gap-5 md:grid-cols-3'>
        {newsletterBenefits.map((benefit) => (
          <article key={benefit.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Why subscribe</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-ink'>{benefit.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{benefit.body}</p>
          </article>
        ))}
      </section>

      <EmailCapture
        headline='Get the next research note'
        description='Join for concise supplement evidence notes, product-quality reminders, and safety-first guide updates.'
        ctaLabel='Subscribe'
        location='newsletter-archive'
      />

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Archive preview</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight text-ink'>Example topics readers care about</h2>
        <div className='mt-6 grid gap-4 md:grid-cols-3'>
          {archiveItems.map((item) => (
            <Link key={item.title} href={item.href} className='rounded-2xl border border-brand-900/10 bg-white/85 p-5 shadow-sm transition motion-safe:hover:-translate-y-0.5'>
              <h3 className='text-base font-semibold text-ink'>{item.title}</h3>
              <p className='mt-3 text-sm leading-6 text-muted'>{item.description}</p>
            </Link>
          ))}
        </div>
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
