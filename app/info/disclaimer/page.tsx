import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../src/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'

const TITLE = 'Educational Disclaimer: How to Use This Supplement Research Site'
const DESCRIPTION =
  'Read the educational disclaimer for The Hippie Scientist, including limits of supplement research content, safety context, professional guidance, and responsible use of site information.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/disclaimer/',
  openGraphType: 'article',
})

const boundaries = [
  {
    title: 'Educational context only',
    body: 'The site organizes research, definitions, mechanisms, safety notes, and product-quality questions. It does not know a reader’s full personal history.',
  },
  {
    title: 'No personal diagnosis or treatment',
    body: 'Pages should not be used to diagnose, treat, or manage a personal condition. They are starting points for learning and better questions.',
  },
  {
    title: 'Professional context still matters',
    body: 'Medication use, pregnancy, chronic conditions, lab results, and serious symptoms require more context than a public webpage can provide.',
  },
]

const responsibleUse = [
  'Use pages to learn terms, compare evidence quality, and organize questions.',
  'Check the full ingredient profile before relying on a summary card or table.',
  'Be especially cautious when combining sedating, stimulating, serotonergic, anticoagulant, or liver-metabolized products.',
  'Verify important decisions with qualified support that understands your situation.',
]

const faqItems = [
  {
    question: 'Is The Hippie Scientist medical advice?',
    answer:
      'No. The site is an educational reference for research literacy, supplement context, and safety questions. It is not a substitute for individualized professional guidance.',
  },
  {
    question: 'Can I use the site to choose a supplement?',
    answer:
      'You can use the site to organize questions, compare evidence, and understand caution areas. Personal decisions should still account for health history, medication context, and professional input when relevant.',
  },
  {
    question: 'Why does the site repeat safety language?',
    answer:
      'Safety language is repeated because readers often land on one page from search. Important limitations need to remain visible without assuming someone read the whole site first.',
  },
]

export default function DisclaimerPage() {
  return (
    <div className='container-page py-10 space-y-10'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/info/disclaimer'
        type='Article'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Disclaimer', url: 'https://thehippiescientist.net/info/disclaimer' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Disclaimer' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Disclaimer</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>
          Educational disclaimer: use the site as research context, not personal instruction.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          The Hippie Scientist is an educational website. It helps readers understand supplement research,
          mechanisms, safety questions, and product-quality tradeoffs, but it cannot evaluate anyone’s full personal situation.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/methodology/' className='chip-readable hover:bg-white transition'>Methodology</Link>
          <Link href='/learn/interactions/' className='chip-readable hover:bg-white transition'>Interaction framework</Link>
          <Link href='/info/contact/' className='chip-readable hover:bg-white transition'>Contact</Link>
        </div>
      </section>

      <section className='grid gap-5 md:grid-cols-3'>
        {boundaries.map((boundary) => (
          <article key={boundary.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Boundary</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-ink'>{boundary.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{boundary.body}</p>
          </article>
        ))}
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Responsible use</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight text-ink'>How to read supplement research pages carefully</h2>
        <ul className='mt-6 grid gap-3 md:grid-cols-2'>
          {responsibleUse.map((item) => (
            <li key={item} className='rounded-2xl border border-brand-900/10 bg-white/80 p-4 text-sm leading-6 text-muted'>
              {item}
            </li>
          ))}
        </ul>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='card-premium p-6 sm:p-8'>
          <p className='eyebrow-label'>What this means in practice</p>
          <h2 className='mt-3 text-2xl font-semibold tracking-tight text-ink'>Read carefully and verify important decisions</h2>
          <div className='mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base'>
            <p>
              This site is meant to help you browse topics, understand basic terms, and organize research.
            </p>
            <p>
              It is not a replacement for licensed medical care, pharmacist guidance, poison control, emergency help,
              or personalized clinical evaluation.
            </p>
            <p>
              Before acting on anything important, especially around pregnancy, chronic illness, medication use,
              or serious symptoms, verify it with qualified support that can review your situation.
            </p>
          </div>
        </div>

        <aside className='card-premium h-fit p-6'>
          <p className='eyebrow-label'>Helpful links</p>
          <div className='mt-4 space-y-3'>
            {[
              { href: '/info/about/', title: 'About', body: 'Learn what the project is for.' },
              { href: '/learn/product-quality/', title: 'Product quality', body: 'Review label and sourcing questions.' },
              { href: '/safety-checker/', title: 'Safety checker', body: 'Use the educational safety workflow.' },
            ].map((item) => (
              <Link key={item.href} href={item.href} className='block rounded-2xl border border-brand-900/10 px-4 py-4 transition hover:bg-stone-50/50 hover:border-brand-900/20'>
                <p className='text-sm font-semibold text-ink'>{item.title}</p>
                <p className='mt-1 text-sm leading-6 text-muted'>{item.body}</p>
              </Link>
            ))}
          </div>
        </aside>
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
