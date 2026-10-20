import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'
import FaqJsonLd from '@/components/seo/FaqJsonLd'

const TITLE = 'Privacy Policy: How The Hippie Scientist Handles Site Data'
const DESCRIPTION =
  'Plain-English privacy policy for The Hippie Scientist, including analytics, cookies, email subscriptions, contact messages, affiliate links, and visitor rights.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/privacy/',
  openGraphType: 'article',
})

const privacyHighlights = [
  {
    title: 'No account required',
    body: 'Visitors can read the site without creating an account or submitting personal health information through the website.',
  },
  {
    title: 'Email is optional',
    body: 'Contact messages and newsletter signups are voluntary. Those systems only use the information readers choose to provide.',
  },
  {
    title: 'Third parties have their own rules',
    body: 'Analytics tools, email providers, affiliate networks, research links, and external websites may use their own privacy practices.',
  },
]

const dataCategories = [
  {
    title: 'Technical logs',
    body: 'Cloudflare and hosting systems may process IP address, browser type, referring page, and access timestamps for security, diagnostics, performance, and operations.',
  },
  {
    title: 'Analytics data',
    body: 'Google Analytics 4 (GA4) may run by default only when our server identifies a U.S. visit, no opt-out is stored, and no supported Do Not Track / Global Privacy Control signal blocks it. For visitors elsewhere or with unknown location, GA4 requires an affirmative choice. GA4 may process online identifiers, approximate location, device/browser details, and page interactions. You can turn it off through the footer Privacy settings control.',
  },
  {
    title: 'Contact data',
    body: 'If you email or message the site owner, your email address and message contents may be used to respond, review feedback, or correct site content.',
  },
  {
    title: 'Newsletter data',
    body: 'If you subscribe to Research Notes, your email address may be processed by the email platform used to deliver updates and unsubscribe links.',
  },
]

const faqItems = [
  {
    question: 'Do I need an account to use The Hippie Scientist?',
    answer:
      'No. The site is designed for public browsing and does not require user accounts to read herb, compound, guide, or education pages.',
  },
  {
    question: 'Does the site collect personal health information?',
    answer:
      'The website does not require readers to submit personal health information. If a reader voluntarily sends sensitive details by email, that message is handled as contact correspondence.',
  },
  {
    question: 'Can I unsubscribe from emails?',
    answer:
      'Yes. Newsletter emails should include an unsubscribe option through the email provider used for delivery.',
  },
]

export default function PrivacyPage() {
  return (
    <div className='container-page py-10 space-y-10'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/info/privacy'
        type='Article'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Privacy Policy', url: 'https://thehippiescientist.net/info/privacy' },
        ]}
      />
      <FaqJsonLd items={faqItems} />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Privacy' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Privacy</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>
          Privacy policy in plain English.
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          The Hippie Scientist is an educational research website. This page explains what information may be processed
          during normal browsing, email subscriptions, contact messages, affiliate links, and external research links.
        </p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/contact/' className='chip-readable hover:bg-white transition'>Contact</Link>
          <Link href='/info/affiliate-disclosure/' className='chip-readable hover:bg-white transition'>Affiliate disclosure</Link>
          <Link href='/info/newsletter/' className='chip-readable hover:bg-white transition'>Newsletter</Link>
        </div>
      </section>

      <section className='grid gap-5 md:grid-cols-3'>
        {privacyHighlights.map((item) => (
          <article key={item.title} className='card-premium p-6'>
            <p className='eyebrow-label'>Privacy highlight</p>
            <h2 className='mt-2 text-xl font-semibold tracking-tight text-ink'>{item.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted'>{item.body}</p>
          </article>
        ))}
      </section>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 shadow-sm sm:p-8'>
        <p className='eyebrow-label'>Information categories</p>
        <h2 className='mt-2 text-3xl font-semibold tracking-tight text-ink'>What may be processed</h2>
        <div className='mt-6 grid gap-4 md:grid-cols-2'>
          {dataCategories.map((item) => (
            <article key={item.title} className='rounded-2xl border border-brand-900/10 bg-white/80 p-5'>
              <h3 className='font-bold text-ink'>{item.title}</h3>
              <p className='mt-2 text-sm leading-7 text-muted'>{item.body}</p>
            </article>
          ))}
        </div>
      </section>

      <section className='grid gap-6 lg:grid-cols-[1.2fr_0.8fr]'>
        <div className='card-premium p-6 sm:p-8'>
          <p className='eyebrow-label'>Plain-English policy</p>
          <h2 className='mt-3 text-3xl font-semibold tracking-tight text-ink'>How information is handled</h2>
          <div className='mt-5 space-y-6 text-sm leading-7 text-muted sm:text-base'>
            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>1. Browsing and technical logs</h3>
              <p>
                The site does not require user registration or accounts. Hosting and security services may process basic technical logs to operate the site and protect it from abuse.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>2. Cookies, analytics, and affiliate attribution</h3>
              <p>
                Google Analytics 4 (GA4) may load by default on visits where Cloudflare confirms the visitor is in the United States. Outside the United States, or if the location cannot be confirmed, GA4 waits for you to affirmatively allow it using Privacy settings in the footer. When enabled, GA4 can set analytics cookies and collect pageview and device/usage information. To opt out at any time, select Privacy settings in the site footer and choose Turn off analytics. This stops further GA4 loading, removes accessible GA cookies, and remembers your choice. We also respect supported browser Do Not Track and Global Privacy Control signals. Other optional tracking, including Ahrefs analytics and certain attribution features, still requires separate affirmative consent. Visitors on translated pages can open the same opt-out control from their language footer; the dialog and this policy are currently written in English. Hosting/security logs and external websites have their own practices.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>3. Email and newsletter services</h3>
              <p>
                Contact messages and newsletter signups are voluntary. Email services may store the address you provide, send messages, and process unsubscribe requests according to their own policies.
              </p>
            </div>
            <div>
              <h3 className='text-lg font-bold text-ink mb-1'>4. External links</h3>
              <p>
                Links to research databases, retailers, affiliate partners, embedded services, or other websites may be governed by those external services and their own privacy practices.
              </p>
            </div>
          </div>
        </div>

        <aside className='card-premium h-fit p-6'>
          <p className='eyebrow-label'>Related pages</p>
          <div className='mt-4 space-y-3'>
            {[
              { href: '/info/disclaimer/', title: 'Disclaimer', body: 'How to use the site responsibly.' },
              { href: '/info/contact/', title: 'Contact', body: 'Send corrections, feedback, or privacy questions.' },
              { href: '/info/about/', title: 'About', body: 'Learn what the project is for.' },
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
