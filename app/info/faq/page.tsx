import type { Metadata } from 'next'
import Link from 'next/link'
import JsonLd from '@/components/seo/JsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import { buildPageMetadata, faqPageJsonLd, breadcrumbJsonLd, SITE_URL } from '../../../src/lib/seo'
import References from '@/components/References'

export const metadata: Metadata = buildPageMetadata({
  title: 'Supplement Research FAQ',
  description:
    'Frequently asked questions about The Hippie Scientist and how to use the site. Evidence-based answers on herbs, compounds, and research methodology.',
  path: '/info/faq',
})

const faqs = [
  {
    question: 'What is this site for?',
    answer:
      'The Hippie Scientist is an educational website focused on herbs, compounds, and related research notes written in plain English.',
  },
  {
    question: 'Is this medical advice?',
    answer:
      'No. The site is for education and research context only. It is not diagnosis, treatment, or personal medical advice.',
  },
  {
    question: 'How should I use the site?',
    answer:
      'Start with the herb or compound libraries, then open detail pages and blog posts for more context. Use the information as a starting point for learning, not as a final authority for important health choices.',
  },
  {
    question: 'Can herbs or compounds be risky?',
    answer:
      'Yes. Herbs and compounds may have side effects, medication interactions, contraindications, or other safety concerns. Always verify important safety questions with a qualified professional.',
  },
  {
    question: 'What if I find an error?',
    answer:
      'Use the Contact page to send corrections, broken links, confusing wording, or update suggestions.',
  },
  {
    question: 'Can I request a topic?',
    answer:
      'Yes. Topic ideas, feature suggestions, and requests for better explanations are all useful feedback.',
  },
  {
    question: 'Does the site cover everything about a topic?',
    answer:
      'Not always. Some pages are still brief, and some profiles are more complete than others. The site can keep improving over time.',
  },
  {
    question: 'What should I do in an urgent medical situation?',
    answer:
      'Do not rely on website content for urgent symptoms or emergencies. Contact a qualified medical professional or emergency service right away.',
  },
]

const faqLd = faqPageJsonLd({
  pagePath: '/info/faq',
  questions: faqs.map(f => ({ question: f.question, answer: f.answer })),
})
const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Home', url: SITE_URL },
  { name: 'Info', url: `${SITE_URL}/info/` },
  { name: 'FAQ', url: `${SITE_URL}/info/faq/` },
])

const FAQ_REFS = [
  { n: 1, text: 'Gibson GR, et al. (2017). ISAPP consensus on prebiotics. Nat Rev Gastroenterol Hepatol, 14(8): 491-502.', url: 'https://pubmed.ncbi.nlm.nih.gov/28611480/' },
]

export default function FaqPage() {
  return (
    <div className='container-page space-y-8 py-8 sm:space-y-10 sm:py-10'>
      <JsonLd schema={faqLd} />
      <JsonLd schema={breadcrumbLd} />
      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info/' },
          { label: 'FAQ' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>FAQ</p>
        <h1 className='heading-premium mt-5 max-w-4xl'>Frequently asked questions</h1>
        <p className='text-reading mt-4 max-w-3xl'>
          Quick answers about what The Hippie Scientist is, how to use it, where its limits are, and what to do when a question needs more than a public research page.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/about/' className='button-primary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            Read About
          </Link>
          <Link href='/info/contact/' className='button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            Contact
          </Link>
          <Link href='/info/disclaimer/' className='button-secondary inline-flex min-h-11 items-center rounded-full px-5 py-2.5 text-sm font-semibold'>
            Disclaimer
          </Link>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2' aria-label='Frequently asked questions'>
        {faqs.map(item => (
          <article key={item.question} className='card-premium p-6'>
            <h2 className='text-lg font-semibold text-[color:var(--hs-ink)]'>{item.question}</h2>
            <p className='mt-3 text-sm leading-6 text-[color:var(--hs-body)]'>{item.answer}</p>
          </article>
        ))}
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='card-premium p-6 sm:p-8'>
          <p className='eyebrow-label'>Still need help?</p>
          <h2 className='mt-3 text-2xl font-semibold text-[color:var(--hs-ink)]'>Use the main research paths</h2>
          <div className='mt-4 space-y-4 text-sm leading-7 text-[color:var(--hs-body)] sm:text-base'>
            <p>
              If you are browsing a topic, the fastest path is usually the structured libraries first, detail pages second, and longer research notes after that.
            </p>
            <p>
              That gives you a quick orientation before you move into the deeper evidence and safety context.
            </p>
          </div>
        </div>

        <aside className='card-premium h-fit p-6'>
          <p className='eyebrow-label'>Start here</p>
          <div className='mt-4 divide-y divide-[color:var(--hs-hairline)]'>
            {[
              { href: '/herbs/', title: 'Herbs', body: 'Browse plant profiles and summaries.' },
              { href: '/compounds/', title: 'Compounds', body: 'Review constituents and quick notes.' },
              { href: '/articles/', title: 'Articles', body: 'Research notes, evidence reviews, and practical context.' },
            ].map(item => (
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

      <References refs={FAQ_REFS} />
    </div>
  )
}