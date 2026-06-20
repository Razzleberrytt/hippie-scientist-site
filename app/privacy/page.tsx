import type { Metadata } from 'next'
import Link from 'next/link'

export const metadata: Metadata = {
  title: 'Privacy Policy',
  description:
    'Privacy policy for The Hippie Scientist — how we handle data, cookies, and any affiliate links on this site, written in clear plain English.',
  alternates: {
    canonical: '/privacy/',
  },
  robots: {
    index: true,
    follow: true,
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

          <div className='mt-5 space-y-6 text-sm leading-7 text-ink/75 sm:text-base'>
            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>1. Information We Collect</h3>
              <p>
                The Hippie Scientist does not require user registration or accounts. We do not collect personal health information. We process:
              </p>
              <ul className='list-disc list-inside mt-2 space-y-1 ml-4'>
                <li><strong>Technical Logs:</strong> IP address, browser type, referring pages, and access timestamps collected by Cloudflare hosting for security and operations.</li>
                <li><strong>Analytics Data:</strong> Basic interaction events, geographic regions, and page view metrics tracked anonymously via Google Analytics 4 (if enabled).</li>
                <li><strong>Contact Data:</strong> Any email address and message contents you choose to send when contacting us.</li>
              </ul>
            </div>

            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>2. Cookies and Tracking</h3>
              <p>
                This site uses cookies and local storage to analyze site usage (if you opt in via Privacy settings) and to support affiliate link attribution. Affiliate networks (e.g. Amazon Associates) use their own tracking parameters and cookies to attribute purchases; they control their own privacy practices. We do not store full affiliate click histories in browser localStorage. Anonymous interaction events may be sent to consented analytics (GA4) when enabled. You can manage or block cookies via your browser settings or the Privacy settings control in the footer.
              </p>
            </div>

            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>3. GDPR Compliance (EU & UK Visitors)</h3>
              <p>
                Under the General Data Protection Regulation (GDPR), EU/UK residents have the right to access, rectify, or erase any personal data we hold (e.g., email communications), or object to its processing. Since we do not store user profiles or user accounts, we hold no database of user identities. For inquiries, contact us at <a href='mailto:support@thehippiescientist.net' className='text-emerald-700 hover:underline'>support@thehippiescientist.net</a>.
              </p>
            </div>

            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>4. Email Subscriptions</h3>
              <p>
                If you subscribe to Research Notes via the footer email form, your email address is transmitted to Mailchimp (an Intuit company) and stored there. We use it only to send evidence summaries and occasional long-form research notes. You can unsubscribe at any time via the link in any email we send. We do not sell or share your email address with other parties. Mailchimp's privacy practices are governed by <a href='https://www.intuit.com/privacy/statement/' className='text-emerald-700 hover:underline' rel='noopener noreferrer' target='_blank'>their own privacy statement</a>.
              </p>
            </div>

            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>5. CCPA Compliance (California Residents)</h3>
              <p>
                Under the California Consumer Privacy Act (CCPA), California consumers have the right to know what personal information is collected, request its deletion, and opt-out of any potential sale or sharing of personal data. The Hippie Scientist does not sell, lease, or share personal data to third parties for monetary gain.
              </p>
            </div>
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
