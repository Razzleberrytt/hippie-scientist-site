import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'About',
  description:
    'Learn what The Hippie Scientist is, what it covers, and how to use it responsibly.',
  alternates: {
    canonical: '/about',
  },
}

export default function AboutPage() {
  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          About
        </p>

        <h1 className='mt-2 text-4xl font-bold tracking-tight sm:text-5xl'>
          What this site is for
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75 sm:text-lg'>
          The Hippie Scientist is a plain-English, science-first educational site
          about herbs, compounds, and related research notes.
        </p>

        <p className='mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base'>
          The goal is to make complicated topics easier to browse and understand
          without pretending internet content is the same thing as personal
          medical advice.
        </p>

        <div className='mt-6 flex flex-wrap gap-3'>
          <Link
            href='/herbs'
            className='rounded-full bg-white px-5 py-3 text-sm font-semibold text-black transition hover:opacity-90'
          >
            Browse herbs
          </Link>

          <Link
            href='/compounds'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Browse compounds
          </Link>

          <Link
            href='/blog'
            className='rounded-full border border-white/15 px-5 py-3 text-sm font-semibold text-white transition hover:border-white/30 hover:bg-white/5'
          >
            Read the blog
          </Link>
        </div>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            What you will find
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Structured profiles</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            Herb and compound pages are meant to be easy to scan, with summaries,
            mechanisms, safety notes, and related reading where available.
          </p>
        </div>

        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            How to use it
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Start broad, then narrow</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            Use the libraries to explore a topic, then open specific detail pages
            and blog posts for more context.
          </p>
        </div>

        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Important note
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Educational only</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            This site is for education and research context. It is not diagnosis,
            treatment, or personal medical advice.
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            What the project is trying to do
          </p>

          <h2 className='mt-3 text-3xl font-semibold'>Readable science communication</h2>

          <div className='mt-4 space-y-4 text-sm leading-7 text-white/75 sm:text-base'>
            <p>
              A lot of herb and supplement information online is either too vague,
              too salesy, or too technical to be useful for beginners.
            </p>

            <p>
              This project tries to sit in the middle: clear enough for normal
              readers, but organized enough to still be useful for deeper study.
            </p>

            <p>
              Over time, the site can keep improving with better summaries, better
              navigation, and more complete profile pages.
            </p>
          </div>
        </div>

        <aside className='ds-card h-fit'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Good starting points
          </p>

          <div className='mt-4 space-y-3'>
            <Link
              href='/herbs'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Herb library</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Browse plant profiles and quick summaries.
              </p>
            </Link>

            <Link
              href='/compounds'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Compound library</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Review constituents, classes, and concise notes.
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
