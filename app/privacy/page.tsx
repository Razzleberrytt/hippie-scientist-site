import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy',
  description:
    'Privacy information for The Hippie Scientist website.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          Privacy
        </p>

        <h1 className='mt-2 text-4xl font-bold tracking-tight sm:text-5xl'>
          Privacy information
        </h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75 sm:text-lg'>
          This page explains, in plain English, how The Hippie Scientist handles
          website privacy at a basic level.
        </p>

        <p className='mt-3 max-w-3xl text-sm leading-6 text-white/65 sm:text-base'>
          Replace any placeholder language below with your real practices if you
          use analytics, forms, newsletters, ads, or third-party embeds later.
        </p>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Basic use
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>General browsing</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            Visitors can read pages on this site without creating an account or
            logging in.
          </p>
        </div>

        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Contact
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Information you send</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            If you contact the site owner directly, you choose what information to
            share in that message.
          </p>
        </div>

        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Important note
          </p>

          <h2 className='mt-3 text-2xl font-semibold'>Update this page later</h2>

          <p className='mt-3 text-sm leading-6 text-white/70'>
            If you add analytics, forms, email signup tools, or embedded media,
            update this page so it stays accurate.
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='ds-card'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Suggested plain-English policy
          </p>

          <h2 className='mt-3 text-3xl font-semibold'>
            Keep this honest and simple
          </h2>

          <div className='mt-4 space-y-4 text-sm leading-7 text-white/75 sm:text-base'>
            <p>
              The Hippie Scientist is an informational website. At this stage, it
              does not ask visitors to create accounts or submit sensitive health
              information through the site itself.
            </p>

            <p>
              If you choose to contact the site owner by email or another listed
              method, the information you send may be used to respond to your
              message, review feedback, or correct site content.
            </p>

            <p>
              If analytics, contact forms, newsletters, advertising tools, or
              other third-party services are added later, this page should be
              updated to explain what is collected and why.
            </p>
          </div>
        </div>

        <aside className='ds-card h-fit'>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Related pages
          </p>

          <div className='mt-4 space-y-3'>
            <Link
              href='/about'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>About</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Learn what the project is for.
              </p>
            </Link>

            <Link
              href='/contact'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Contact</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Send corrections, feedback, or questions.
              </p>
            </Link>

            <Link
              href='/disclaimer'
              className='block rounded-2xl border border-white/10 px-4 py-4 transition hover:border-white/25 hover:bg-white/5'
            >
              <p className='text-sm font-semibold text-white'>Disclaimer</p>
              <p className='mt-1 text-sm leading-6 text-white/65'>
                Read the educational and medical disclaimer.
              </p>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
