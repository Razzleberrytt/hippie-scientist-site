import type { Metadata } from 'next'
import Link from 'next/link'
import AffiliateDisclosure from '../../components/AffiliateDisclosure'
import EmailCapture from '../../components/EmailCapture'

export const metadata: Metadata = {
  title: { absolute: 'About The Hippie Scientist | Evidence-First Supplement Research' },
  description:
    'Learn how The Hippie Scientist approaches herbs, compounds, evidence quality, affiliate disclosure, and founder-led supplement research.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-12'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>About</p>

        <h1 className='mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          About The Hippie Scientist
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          The Hippie Scientist is a founder-led research site for people who want clearer supplement information without hype. It organizes herbs, compounds, safety context, and evidence notes so readers can compare claims before they buy, try, or share anything.
        </p>

        <div className='mt-7 flex flex-wrap gap-3'>
          <Link
            href='/herbs'
            className='rounded-full bg-brand-800 px-5 py-3 text-sm font-semibold text-white transition hover:bg-brand-900'
          >
            Browse herbs
          </Link>

          <Link
            href='/compounds'
            className='rounded-full border border-brand-900/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50'
          >
            Browse compounds
          </Link>

          <Link
            href='/goals'
            className='rounded-full border border-brand-900/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50'
          >
            Goal guides
          </Link>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.1fr_0.9fr]'>
        <article className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm sm:p-8'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Founder story</p>
          <h2 className='mt-3 text-2xl font-semibold text-ink'>Built for careful explorers</h2>
          <div className='mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base'>
            <p>
              The project started from a simple frustration: most supplement content is either sales copy, scattered forum advice, or dense research language that is hard to use in real decisions.
            </p>
            <p>
              The Hippie Scientist is built to sit between those extremes. It translates research context into plain English while keeping uncertainty, safety, and product-quality questions visible.
            </p>
          </div>
        </article>

        <article className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm sm:p-8'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Evidence philosophy</p>
          <h2 className='mt-3 text-2xl font-semibold text-ink'>Evidence before enthusiasm</h2>
          <p className='mt-4 text-sm leading-7 text-muted sm:text-base'>
            Human evidence, plausible mechanisms, traditional use, and safety signals are not the same thing. The site tries to separate those layers instead of flattening every interesting compound into a recommendation.
          </p>
        </article>
      </section>

      <section className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm sm:p-8'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>Methodology</p>
        <h2 className='mt-3 text-2xl font-semibold text-ink'>How pages are built</h2>
        <div className='mt-5 grid gap-4 md:grid-cols-3'>
          {[
            {
              title: 'Start with structured data',
              body: 'Profiles are organized from workbook-backed fields, generated JSON, and route-safe static pages.',
            },
            {
              title: 'Keep safety visible',
              body: 'Contraindications, medication context, and uncertainty are surfaced before buying or protocol decisions.',
            },
            {
              title: 'Prefer conservative claims',
              body: 'When evidence is limited, mixed, or mechanism-only, the language should say that plainly.',
            },
          ].map((item) => (
            <article key={item.title} className='rounded-2xl border border-brand-900/10 bg-white/70 p-5'>
              <h3 className='text-base font-semibold text-ink'>{item.title}</h3>
              <p className='mt-3 text-sm leading-6 text-muted'>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <AffiliateDisclosure />

      <EmailCapture
        headline='Follow the research as the library improves'
        description='Get occasional updates when new evidence guides, comparison pages, and sourcing notes are published.'
        location='about'
      />

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950'>
        <p className='font-semibold'>Medical disclaimer</p>
        <p className='mt-1'>
          All content on this site is educational. It is not intended as medical advice, diagnosis, or treatment. Always consult a qualified healthcare professional before making decisions about supplements, medications, or health interventions.
        </p>
      </section>
    </div>
  )
}
