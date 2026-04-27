import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'FAQ',
  description:
    'Frequently asked questions about The Hippie Scientist and how to use the site.',
  alternates: {
    canonical: '/faq',
  },
}

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

export default function FaqPage() {
  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          FAQ
        </p>

        <h1 className='mt-2 text-4xl font-bold tracking-tight sm:text-5xl'>
          Frequently asked questions
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75 sm:text-lg'>
          Quick answers about what The Hippie Scientist is, how to use it, and
          what it is not.
        </p>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link
            href='/about'
            className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90'
          >
            Read About
          </Link>

          <Link
            href='/contact'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Contact
          </Link>

          <Link
            href='/disclaimer'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Disclaimer
          </Link>
        </div>
      </section>

      <section className='grid gap-4'>
        {faqs.map(item => (
          <div key={item.question} className='ds-card'>
            <h2 className='text-2xl font-semibold tracking-tight'>
              {item.question}
            </h2>

            <p className='mt-4 text-sm leading-7 text-white/75 sm:text-base'>
              {item.answer}
            </p>
          </div>
        ))}
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Still need help?
          </p>

          <h2 className='mt-3 text-3xl font-semibold'>Use the main sections</h2>

          <div className='mt-4 space-y-4 text-sm leading-7 text-white/75 sm:text-base'>
            <p>
              If you are browsing a topic, the fastest path is usually:
              libraries first, detail pages second, blog posts third.
            </p>

            <p>
              That gives you a simple overview first and more context after that.
            </p>
          </div>
        </div>

        <aside className='ds-card h-fit'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Start here
          </p>

          <div className='mt-4 space-y-3'>
            <Link
              href='/herbs'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Herbs</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Browse plant profiles and summaries.
              </p>
            </Link>

            <Link
              href='/compounds'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Compounds</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Review constituents and quick notes.
              </p>
            </Link>

            <Link
              href='/blog'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Blog</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Read explainers, comparisons, and practical notes.
              </p>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
