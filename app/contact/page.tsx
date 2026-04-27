import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Contact',
  description:
    'Contact The Hippie Scientist for site feedback, corrections, and general questions.',
  alternates: {
    canonical: '/contact',
  },
}

export default function ContactPage() {
  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          Contact
        </p>

        <h1 className='mt-2 text-4xl font-bold tracking-tight sm:text-5xl'>
          Get in touch
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75 sm:text-lg'>
          Use this page for general questions, corrections, feedback, and site
          improvement ideas.
        </p>

        <p className='mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base'>
          The easiest way to start is by adding your preferred contact method
          below. Until then, this page can still explain what kinds of messages
          are helpful.
        </p>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Good reasons to reach out
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Corrections</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            If you spot a mistake, outdated statement, broken page, or confusing
            wording, send it along.
          </p>
        </div>

        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Helpful feedback
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Suggestions</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            Request a feature, suggest a better layout, or recommend a topic that
            would make the libraries more useful.
          </p>
        </div>

        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Important note
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Not medical advice</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            Please do not use this site as a substitute for professional medical
            care or urgent support.
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Add your contact details here
          </p>

          <h2 className='mt-3 text-3xl font-semibold'>Replace this block with your real contact info</h2>

          <div className='mt-4 space-y-4 text-sm leading-7 text-white/75 sm:text-base'>
            <p>
              Edit this page and replace the placeholder text below with the way
              you want people to contact you.
            </p>

            <div className='rounded-2xl border border-white/10 bg-white/[0.03] p-4'>
              <p className='font-medium text-white'>Example options</p>
              <ul className='mt-3 list-disc space-y-2 pl-5 text-white/70'>
                <li>Email: yourname@example.com</li>
                <li>Instagram: @yourhandle</li>
                <li>Contact form link</li>
                <li>GitHub profile link</li>
              </ul>
            </div>

            <p>
              Keep whatever contact method you actually check. One reliable option
              is better than five ignored ones.
            </p>
          </div>
        </div>

        <aside className='ds-card h-fit'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Explore the site
          </p>

          <div className='mt-4 space-y-3'>
            <Link
              href='/about'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>About</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Learn what the project is for and how to use it.
              </p>
            </Link>

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
                Review constituents and research notes.
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
