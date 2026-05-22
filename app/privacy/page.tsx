import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy information for The Hippie Scientist website.',
  alternates: {
    canonical: '/privacy',
  },
}

export default function PrivacyPage() {
  return (
    <div className='space-y-8'>
      <section className='compact-section section-rhythm-balanced'>
        <p className='eyebrow-label'>Privacy</p>

        <h1 className='compact-heading'>Privacy information</h1>

        <p className='compact-copy max-w-3xl'>
          The Hippie Scientist is an educational research website. This page explains how privacy is handled in plain language.
        </p>
      </section>

      <section className='grid gap-4 lg:grid-cols-3'>
        <div className='compact-card'>
          <p className='eyebrow-label'>General browsing</p>
          <h2 className='mt-3 text-2xl font-semibold tracking-tight text-ink'>No account required</h2>
          <p className='mt-3 text-sm leading-6 text-ink/75'>
            Visitors can read the site without creating an account or submitting personal health information through the website.
          </p>
        </div>

        <div className='compact-card'>
          <p className='eyebrow-label'>Contact</p>
          <h2 className='mt-3 text-2xl font-semibold tracking-tight text-ink'>Information you send</h2>
          <p className='mt-3 text-sm leading-6 text-ink/75'>
            If you email the site owner, the information you choose to send may be used to respond, review feedback, or correct site content.
          </p>
        </div>

        <div className='compact-card'>
          <p className='eyebrow-label'>Third parties</p>
          <h2 className='mt-3 text-2xl font-semibold tracking-tight text-ink'>External services</h2>
          <p className='mt-3 text-sm leading-6 text-ink/75'>
            Links to outside sites, research sources, affiliate partners, or embedded services may be governed by their own privacy practices.
          </p>
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='compact-card'>
          <p className='eyebrow-label'>Plain-English policy</p>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight text-ink'>How information is handled</h2>

          <div className='mt-5 space-y-4 text-sm leading-7 text-ink/75 sm:text-base'>
            <p>
              The Hippie Scientist publishes educational content about herbs, compounds, mechanisms, evidence, and related wellness research topics.
            </p>

            <p>
              The site does not provide medical care, does not create user accounts, and does not ask visitors to submit sensitive health information through the website.
            </p>

            <p>
              Basic technical information may be processed by hosting, security, analytics, search, or embedded third-party services needed to operate and improve the site.
            </p>

            <p>
              If affiliate links are used, they may direct visitors to third-party websites. Those websites control their own checkout, tracking, privacy, and data practices.
            </p>
          </div>
        </div>

        <aside className='compact-card h-fit'>
          <p className='eyebrow-label'>Related pages</p>

          <div className='mt-4 space-y-3'>
            <Link href='/about' className='compact-card block transition hover:-translate-y-0.5'>
              <p className='text-sm font-semibold text-ink'>About</p>
              <p className='mt-1 text-sm leading-6 text-ink/65'>Learn what the project is for.</p>
            </Link>

            <Link href='/contact' className='compact-card block transition hover:-translate-y-0.5'>
              <p className='text-sm font-semibold text-ink'>Contact</p>
              <p className='mt-1 text-sm leading-6 text-ink/65'>Send corrections, feedback, or questions.</p>
            </Link>

            <Link href='/disclaimer' className='compact-card block transition hover:-translate-y-0.5'>
              <p className='text-sm font-semibold text-ink'>Disclaimer</p>
              <p className='mt-1 text-sm leading-6 text-ink/65'>Read the educational and medical disclaimer.</p>
            </Link>
          </div>
        </aside>
      </section>
    </div>
  )
}
