import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: { absolute: 'About The Hippie Scientist | Evidence-First Supplement Research' },
  description:
    'Learn how The Hippie Scientist approaches herb and supplement research — plain English, science-first, with honest disclaimers and evidence context.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <div className='mx-auto max-w-5xl space-y-8 px-4 py-8 sm:py-12'>
      <section className='rounded-[2rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-10'>
        <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>
          About
        </p>

        <h1 className='mt-3 text-4xl font-bold tracking-tight text-ink sm:text-5xl'>
          About The Hippie Scientist
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          The Hippie Scientist is a plain-English, science-first educational site
          about herbs, compounds, and related research notes. The goal is to make
          complicated topics easier to browse without pretending that internet
          content replaces personal medical advice.
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
            href='/blog'
            className='rounded-full border border-brand-900/20 px-5 py-3 text-sm font-semibold text-ink transition hover:border-brand-700 hover:bg-brand-50'
          >
            Read the blog
          </Link>
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>
            What you will find
          </p>

          <h2 className='mt-3 text-xl font-semibold text-ink'>Structured profiles</h2>

          <p className='mt-3 text-sm leading-6 text-muted'>
            Herb and compound pages are easy to scan, with summaries,
            mechanisms, safety notes, and related reading where available.
          </p>
        </div>

        <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>
            How to use it
          </p>

          <h2 className='mt-3 text-xl font-semibold text-ink'>Start broad, then narrow</h2>

          <p className='mt-3 text-sm leading-6 text-muted'>
            Use the libraries to explore a topic, then open specific detail pages
            and blog posts for more context.
          </p>
        </div>

        <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>
            Important note
          </p>

          <h2 className='mt-3 text-xl font-semibold text-ink'>Educational only</h2>

          <p className='mt-3 text-sm leading-6 text-muted'>
            This site is for education and research context. It is not diagnosis,
            treatment, or personal medical advice.
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm sm:p-8'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>
            What the project is trying to do
          </p>

          <h2 className='mt-3 text-2xl font-semibold text-ink'>Readable science communication</h2>

          <div className='mt-4 space-y-4 text-sm leading-7 text-muted sm:text-base'>
            <p>
              A lot of herb and supplement information online is either too vague,
              too salesy, or too technical to be useful for beginners.
            </p>

            <p>
              This project tries to sit in the middle: clear enough for normal
              readers, but organized enough to still be useful for deeper study.
            </p>

            <p>
              Over time, the site keeps improving with better summaries, better
              navigation, and more complete profile pages.
            </p>
          </div>
        </div>

        <aside className='rounded-[1.5rem] border border-brand-900/10 bg-white/85 p-6 shadow-sm h-fit'>
          <p className='text-xs font-bold uppercase tracking-[0.18em] text-brand-700'>
            Good starting points
          </p>

          <div className='mt-4 space-y-3'>
            <Link
              href='/herbs'
              className='block rounded-2xl border border-brand-900/10 bg-white/80 px-4 py-4 transition hover:border-brand-700/20 hover:bg-white hover:-translate-y-0.5 shadow-sm'
            >
              <p className='text-sm font-semibold text-ink'>Herb library</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Browse plant profiles and quick summaries.
              </p>
            </Link>

            <Link
              href='/compounds'
              className='block rounded-2xl border border-brand-900/10 bg-white/80 px-4 py-4 transition hover:border-brand-700/20 hover:bg-white hover:-translate-y-0.5 shadow-sm'
            >
              <p className='text-sm font-semibold text-ink'>Compound library</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Review constituents, classes, and concise notes.
              </p>
            </Link>

            <Link
              href='/blog'
              className='block rounded-2xl border border-brand-900/10 bg-white/80 px-4 py-4 transition hover:border-brand-700/20 hover:bg-white hover:-translate-y-0.5 shadow-sm'
            >
              <p className='text-sm font-semibold text-ink'>Blog</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Read explainers, comparisons, and practical notes.
              </p>
            </Link>

            <Link
              href='/goals'
              className='block rounded-2xl border border-brand-900/10 bg-white/80 px-4 py-4 transition hover:border-brand-700/20 hover:bg-white hover:-translate-y-0.5 shadow-sm'
            >
              <p className='text-sm font-semibold text-ink'>Goal guides</p>
              <p className='mt-1 text-sm leading-6 text-muted'>
                Find options by what you are trying to support.
              </p>
            </Link>
          </div>
        </aside>
      </section>

      <section className='rounded-2xl border border-amber-900/15 bg-amber-50/70 p-5 text-sm leading-6 text-amber-950'>
        <p className='font-semibold'>Disclaimer</p>
        <p className='mt-1'>
          All content on this site is educational. It is not intended as medical
          advice, diagnosis, or treatment. Always consult a qualified healthcare
          professional before making decisions about supplements, medications, or
          health interventions.
        </p>
      </section>
    </div>
  )
}
