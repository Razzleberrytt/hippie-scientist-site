import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata, faqPageJsonLd, breadcrumbJsonLd, SITE_URL } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'FAQ',
  description:
    'Frequently asked questions about The Hippie Scientist and how to use the site. Evidence-based answers on herbs, compounds, and research methodology.',
  path: '/faq',
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
      'Start with the herb or compound libraries, then open detail pages and blog posts for more context. Use the information as a starting point for learning, not as a final authority for important health decisions.',
  },
  {
    question: 'Can herbs or compounds be risky?',
    answer:
      'Yes. Herbs and compounds may have side effects, medication interactions, contraindications, or other safety concerns. Always verify important decisions with a qualified professional.',
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
  pagePath: '/faq',
  questions: faqs.map(f => ({ question: f.question, answer: f.answer })),
})
const breadcrumbLd = breadcrumbJsonLd([
  { name: 'Home', url: SITE_URL },
  { name: 'FAQ', url: `${SITE_URL}/faq/` },
])

export default function FaqPage() {
  return (
    <div className='space-y-8 max-w-5xl mx-auto px-4 py-8'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8'>
        <p className='eyebrow-label'>FAQ</p>

        <h1 className='mt-2 text-3xl font-semibold text-ink sm:text-4xl'>
          Frequently asked questions
        </h1>

        {/* Reusable Schema.org JSON-LD for FAQPage + BreadcrumbList (static export safe) */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbLd) }} />

        <p className='mt-4 max-w-3xl text-base leading-7 text-ink/80 sm:text-lg'>
          Quick answers about what The Hippie Scientist is, how to use it, and
          what it is not.
        </p>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link
            href='/about'
            className='rounded-full bg-emerald-600 px-5 py-3 text-sm font-semibold text-white transition hover:bg-emerald-700 shadow-sm'
          >
            Read About
          </Link>

          <Link
            href='/contact'
            className='rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            Contact
          </Link>

          <Link
            href='/disclaimer'
            className='rounded-full border border-stone-200 px-5 py-3 text-sm font-semibold text-stone-700 transition hover:bg-stone-50 hover:text-stone-900'
          >
            Disclaimer
          </Link>
        </div>
      </section>

      <section className='grid gap-4 md:grid-cols-2'>
        {faqs.map(item => (
          <div key={item.question} className='card-premium p-6'>
            <h2 className='text-lg font-semibold text-ink'>
              {item.question}
            </h2>

            <p className='mt-3 text-sm leading-6 text-muted'>
              {item.answer}
            </p>
          </div>
        ))}
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='card-premium p-6 sm:p-8'>
          <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>
            Still need help?
          </p>

          <h2 className='mt-3 text-2xl font-semibold text-ink'>Use the main sections</h2>

          <div className='mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base'>
            <p>
              If you are browsing a topic, the fastest path is usually:
              libraries first, detail pages second, blog posts third.
            </p>

            <p>
              That gives you a simple overview first and more context after that.
            </p>
          </div>
        </div>

        <aside className='card-premium h-fit p-6'>
          <p className='text-xs font-semibold uppercase tracking-wider text-emerald-700'>
            Start here
          </p>

          <div className='mt-4 space-y-3'>
            <Link
              href='/herbs'
              className='block rounded-2xl border border-brand-900/10 px-4 py-4 transition hover:bg-stone-50/50 hover:border-brand-900/20'
            >
              <p className='text-sm font-semibold text-ink'>Herbs</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Browse plant profiles and summaries.
              </p>
            </Link>

            <Link
              href='/compounds'
              className='block rounded-2xl border border-brand-900/10 px-4 py-4 transition hover:bg-stone-50/50 hover:border-brand-900/20'
            >
              <p className='text-sm font-semibold text-ink'>Compounds</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Review constituents and quick notes.
              </p>
            </Link>

            <Link
              href='/blog'
              className='block rounded-2xl border border-brand-900/10 px-4 py-4 transition hover:bg-stone-50/50 hover:border-brand-900/20'
            >
              <p className='text-sm font-semibold text-ink'>Blog</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Read explainers, comparisons, and practical notes.
              </p>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}

