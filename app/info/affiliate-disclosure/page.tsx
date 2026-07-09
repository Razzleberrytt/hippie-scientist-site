import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'
import AffiliateDisclosure from '../../../components/AffiliateDisclosure'
import { SafetyDisclaimerBox } from '@/components/monetization/SafetyDisclaimerBox'

const TITLE = 'Affiliate Disclosure: How Product Links Are Handled'
const DESCRIPTION =
  'Learn how The Hippie Scientist uses affiliate links while keeping editorial independence, evidence grading, safety context, and product-quality checks separate from monetization.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/affiliate-disclosure/',
  openGraphType: 'article',
})

const principles = [
  {
    title: 'Evidence before commerce',
    body: 'Ingredient summaries, evidence levels, and safety notes are written before product placement is considered. Affiliate availability cannot improve a rating or soften a caution.',
  },
  {
    title: 'Labels and link attributes',
    body: 'Monetized outbound links should be labeled in context and use sponsored, nofollow, noopener, and noreferrer attributes where appropriate.',
  },
  {
    title: 'Product links are starting points',
    body: 'A product link is not a personalized recommendation. Readers should still compare form, dose transparency, testing, and fit for their own context.',
  },
]

const separationChecks = [
  'Evidence summaries stay separate from product modules.',
  'Restricted or high-caution ingredients should not receive casual buying prompts.',
  'Product-quality checks matter even when a product is available through an affiliate program.',
  'Affiliate revenue does not change safety language, uncertainty language, or evidence grades.',
]

const faqItems = [
  {
    question: 'Does The Hippie Scientist use affiliate links?',
    answer:
      'Yes. Some outbound product links may earn a commission at no additional cost to the reader. Those links help support site hosting and research work.',
  },
  {
    question: 'Do affiliate links affect evidence grades?',
    answer:
      'No. Evidence grades, safety notes, and uncertainty language are editorial decisions. Product availability does not make a weak evidence base stronger.',
  },
  {
    question: 'How should readers use product links?',
    answer:
      'Treat product links as sourcing starting points. Compare labels, dose form, third-party testing, and safety context before buying anything.',
  },
]

export default function AffiliateDisclosurePage() {
  return (
    <div className='container-page py-10 space-y-10'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/info/affiliate-disclosure'
        type='Article'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Affiliate Disclosure', url: 'https://thehippiescientist.net/info/affiliate-disclosure' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Affiliate Disclosure' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Transparency</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>
          Affiliate disclosure: product links do not control the evidence.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          The Hippie Scientist may earn commissions from qualifying product links. Those relationships help support the site,
          but they do not determine rankings, safety language, evidence grades, or editorial conclusions.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/methodology/' className='chip-readable hover:bg-white transition'>Methodology</Link>
          <Link href='/learn/product-quality/' className='chip-readable hover:bg-white transition'>Product-quality guide</Link>
          <Link href='/info/free-guide/' className='chip-readable hover:bg-white transition'>Free decision guide</Link>
        </div>
      </section>

      <AffiliateDisclosure variant='full' />

      <section className='grid gap-5 md:grid-cols-3'>
        {principles.map((principle) => (
          <article key={principle.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Trust principle</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-ink'>{principle.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{principle.body}</p>
          </article>
        ))}
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Editorial separation</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight text-ink'>How product links are kept separate from evidence language</h2>
        <ul className='mt-6 grid gap-3 md:grid-cols-2'>
          {separationChecks.map((check) => (
            <li key={check} className='rounded-2xl border border-brand-900/10 bg-white/80 p-4 text-sm leading-6 text-muted'>
              {check}
            </li>
          ))}
        </ul>
      </section>

      <SafetyDisclaimerBox />

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
