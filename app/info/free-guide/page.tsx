import type { Metadata } from 'next'
import Link from 'next/link'
import { SEO_GUIDE_ROUTES } from '../../../src/lib/canonical-routes'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import AffiliateDisclosure from '../../../components/AffiliateDisclosure'
import NewsletterSignup from '../../../components/NewsletterSignup'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'

const TITLE = 'Free Supplement Decision Guide: Evidence, Safety, and Product Quality'
const DESCRIPTION =
  'Get a free evidence-aware supplement decision guide for sleep, stress, focus, brain fog, fatigue, calming support, product quality, and stacking safety.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/free-guide/',
  openGraphType: 'article',
})

const guideSections = [
  {
    title: 'Sleep',
    body: 'Compare wind-down support, next-day grogginess risk, sedative combinations, timing, and product form before buying.',
    href: SEO_GUIDE_ROUTES.sleep,
  },
  {
    title: 'Stress',
    body: 'Separate calming options from adaptogen-style options while keeping mental health care and medication context visible.',
    href: SEO_GUIDE_ROUTES.stress,
  },
  {
    title: 'Focus and brain fog',
    body: 'Sort stimulant-forward, non-stimulant, and deficiency-context options without ignoring possible root causes.',
    href: SEO_GUIDE_ROUTES.focus,
  },
]

const checklistItems = [
  'Define the goal before choosing an ingredient.',
  'Check evidence quality and whether the studied outcome matches your use case.',
  'Compare dose form, standardization, and product transparency.',
  'Review interaction and stacking concerns before combining products.',
  'Prefer simpler experiments over complicated multi-product routines.',
]

const faqItems = [
  {
    question: 'What is the free supplement decision guide?',
    answer:
      'It is a simple evidence-aware checklist for comparing supplements by goal, evidence quality, product form, safety context, and stacking risk before buying.',
  },
  {
    question: 'Is the guide personalized advice?',
    answer:
      'No. It is an educational framework for organizing questions and avoiding overconfident decisions. Individual context still matters.',
  },
  {
    question: 'What should I do after reading the guide?',
    answer:
      'Start with the goal page, read the relevant herb or compound profile, check product quality, and avoid adding multiple new products at once.',
  },
]

export default function FreeGuidePage() {
  return (
    <div className='container-page py-10 space-y-10'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/info/free-guide'
        type='Article'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Free Guide', url: 'https://thehippiescientist.net/info/free-guide' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Free Guide' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Free guide</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>
          Supplement decision guide: choose by evidence, not hype.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Use this guide to compare supplements without turning limited evidence, product marketing,
          or forum anecdotes into overconfident decisions. It gives readers a practical framework for
          goal fit, safety context, product quality, and stacking risk.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/learn/citation-explorer/' className='chip-readable hover:bg-white transition'>Citation explorer</Link>
          <Link href='/learn/product-quality/' className='chip-readable hover:bg-white transition'>Product quality</Link>
          <Link href='/learn/interactions/' className='chip-readable hover:bg-white transition'>Interaction framework</Link>
        </div>
      </section>

      <NewsletterSignup location='free-guide' />

      <section className='grid gap-4 md:grid-cols-3'>
        {guideSections.map((section) => (
          <article key={section.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Goal pathway</p>
            <h2 className='mt-2 text-xl font-semibold text-ink'>{section.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{section.body}</p>
            <Link href={section.href} className='mt-4 inline-flex text-sm font-bold text-brand-800 hover:underline'>
              Read guide
            </Link>
          </article>
        ))}
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8'>
        <div className='max-w-3xl space-y-3'>
          <p className='eyebrow-label'>Decision checklist</p>
          <h2 className='text-3xl font-semibold tracking-tight text-ink'>What the guide helps you check first</h2>
          <p className='text-sm leading-7 text-muted'>
            The best supplement decision is usually a slower decision. This checklist keeps the process grounded
            in goal fit, evidence quality, product transparency, and conservative comparison.
          </p>
        </div>
        <ol className='mt-6 grid gap-3 md:grid-cols-2'>
          {checklistItems.map((item, index) => (
            <li key={item} className='rounded-2xl border border-brand-900/10 bg-white/80 p-4 text-sm leading-6 text-muted'>
              <span className='mr-2 font-bold text-brand-800'>{index + 1}.</span>{item}
            </li>
          ))}
        </ol>
      </section>

      <SafetyDisclaimerBox />
      <AffiliateDisclosure variant='full' />

      <section className='card-premium p-6 sm:p-8'>
        <p className='eyebrow-label'>What you get</p>
        <h2 className='mt-2 text-2xl font-semibold text-ink'>A practical checklist you can use immediately</h2>
        <p className='mt-3 max-w-3xl text-sm leading-7 text-muted'>
          The free checklist is a static, printable resource for medication-review prompts, dose and form checks,
          stacking-risk questions, and quality markers before buying. It is built to slow down the decision,
          not push readers toward a product.
        </p>
        <div className='mt-5 flex flex-wrap gap-3'>
          <Link href='/info/methodology/' className='chip-readable hover:bg-white transition'>Methodology</Link>
          <Link href='/info/affiliate-disclosure/' className='chip-readable hover:bg-white transition'>Affiliate disclosure</Link>
          <Link href='/info/infographics/' className='chip-readable hover:bg-white transition'>Free infographics</Link>
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
