import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '../../../lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const TITLE = 'Terms of Service | The Hippie Scientist'
const DESCRIPTION =
  'Terms for using The Hippie Scientist, including educational-use limits, acceptable use, third-party services, intellectual property, and site changes.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/terms/',
  openGraphType: 'article',
})

const effectiveDate = 'October 6, 2026'

const sections = [
  {
    title: '1. Educational use only',
    body:
      'The Hippie Scientist provides educational research summaries, evidence references, tools, and general information. The site does not provide medical diagnosis, treatment, prescribing, emergency care, legal advice, or individualized professional advice. Important health decisions should be checked with an appropriately qualified professional who can evaluate your circumstances.',
  },
  {
    title: '2. No guarantee of outcomes or completeness',
    body:
      'Research changes, source quality varies, and reasonable reviewers can interpret uncertain evidence differently. The site is designed to show uncertainty rather than eliminate it. Information may be corrected, expanded, withdrawn, or become outdated. No specific health, financial, commercial, or other outcome is promised.',
  },
  {
    title: '3. Your use of the site',
    body:
      'You may browse and use public site features for lawful personal, educational, journalistic, or research purposes. Do not misuse the site to interfere with its operation, evade security controls, impersonate another person, introduce malicious code, overload services, or use automated access in a way that materially harms availability for other readers.',
  },
  {
    title: '4. External services and links',
    body:
      'The site may link to research databases, publishers, retailers, affiliate partners, email providers, social platforms, or other third-party services. Those services are controlled by their own operators and may apply separate terms, privacy practices, eligibility rules, pricing, availability, and technical requirements. A link or integration does not transfer responsibility for a third-party service to The Hippie Scientist.',
  },
  {
    title: '5. Affiliate and commercial links',
    body:
      'Some links may be affiliate links and may generate a commission if a qualifying transaction occurs. Affiliate relationships do not change the site’s stated evidence standards. Availability, pricing, product composition, and merchant claims can change and should be independently checked before purchase.',
  },
  {
    title: '6. Content and intellectual property',
    body:
      'Unless a page states otherwise, original site text, organization, graphics, interfaces, and other original materials are protected by applicable intellectual-property law. You may link to public pages and make ordinary fair-use quotations with attribution. Structured data, licensed material, third-party trademarks, research papers, and externally sourced materials may have separate rights or reuse conditions.',
  },
  {
    title: '7. Availability and changes',
    body:
      'The site may add, remove, change, suspend, or discontinue pages, tools, integrations, or features. Maintenance, hosting failures, provider outages, security events, legal requirements, or research corrections can affect availability. These Terms may also be updated as the site changes; the effective date above identifies the current published version.',
  },
  {
    title: '8. Disclaimer of warranties',
    body:
      'To the extent permitted by applicable law, the site and its public information are provided on an “as is” and “as available” basis. The Hippie Scientist does not promise that every page will be error-free, uninterrupted, complete, current, or suitable for a particular purpose.',
  },
  {
    title: '9. Limitation of liability',
    body:
      'To the extent permitted by applicable law, The Hippie Scientist is not responsible for indirect, incidental, special, consequential, or similar losses arising from reliance on site information, third-party services, unavailable features, or decisions made using public educational content. Nothing in these Terms excludes liability that cannot lawfully be excluded.',
  },
  {
    title: '10. Contact',
    body:
      'Questions about these Terms, corrections, permissions, or site operation can be sent through the site’s contact page.',
  },
]

export default function TermsPage() {
  return (
    <div className='container-page py-10 space-y-10'>
      <AuthorityJsonLd
        title={TITLE}
        description={DESCRIPTION}
        url='https://thehippiescientist.net/info/terms'
        type='Article'
        breadcrumbs={[
          { name: 'Home', url: 'https://thehippiescientist.net' },
          { name: 'Info', url: 'https://thehippiescientist.net/info' },
          { name: 'Terms of Service', url: 'https://thehippiescientist.net/info/terms' },
        ]}
      />

      <AuthorityBreadcrumbs
        items={[
          { label: 'Home', href: '/' },
          { label: 'Info', href: '/info' },
          { label: 'Terms of Service' },
        ]}
      />

      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Site terms</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>
          Terms of Service
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          These Terms describe the basic rules for using The Hippie Scientist and the limits of what this
          educational research site provides.
        </p>
        <p className='mt-4 text-sm font-medium text-muted'>Effective: {effectiveDate}</p>
        <div className='mt-6 flex flex-wrap gap-3'>
          <Link href='/info/privacy/' className='chip-readable hover:bg-white transition'>Privacy policy</Link>
          <Link href='/info/disclaimer/' className='chip-readable hover:bg-white transition'>Educational disclaimer</Link>
          <Link href='/info/contact/' className='chip-readable hover:bg-white transition'>Contact</Link>
        </div>
      </section>

      <section className='card-premium p-6 sm:p-8'>
        <p className='eyebrow-label'>Agreement</p>
        <h2 className='mt-3 text-3xl font-semibold tracking-tight text-ink'>Using the site</h2>
        <p className='mt-4 max-w-4xl text-sm leading-7 text-muted sm:text-base'>
          By accessing or using the public website, you agree to these Terms and to use the site lawfully.
          If you do not agree, do not use the site. These Terms apply to the website and first-party site
          features; third-party services apply their own terms when you leave the site or authorize an integration.
        </p>
      </section>

      <section className='grid gap-5 lg:grid-cols-2'>
        {sections.map((section) => (
          <article key={section.title} className='card-premium p-6'>
            <h2 className='text-xl font-semibold tracking-tight text-ink'>{section.title}</h2>
            <p className='mt-3 text-sm leading-7 text-muted sm:text-base'>{section.body}</p>
            {section.title.startsWith('10.') && (
              <Link href='/info/contact/' className='mt-4 inline-flex text-sm font-bold text-brand-800 hover:text-brand-950'>
                Open contact page →
              </Link>
            )}
          </article>
        ))}
      </section>

      <section className='rounded-2xl border border-brand-900/10 bg-brand-50/50 p-6 shadow-sm'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink'>Related policies</h2>
        <p className='mt-3 text-sm leading-7 text-muted'>
          The Privacy Policy explains data handling, while the Disclaimer explains the educational and medical-use
          boundaries in more detail. The Affiliate Disclosure explains commercial-link relationships.
        </p>
        <div className='mt-4 flex flex-wrap gap-3'>
          <Link href='/info/privacy/' className='chip-readable hover:bg-white transition'>Privacy</Link>
          <Link href='/info/disclaimer/' className='chip-readable hover:bg-white transition'>Disclaimer</Link>
          <Link href='/info/affiliate-disclosure/' className='chip-readable hover:bg-white transition'>Affiliate disclosure</Link>
        </div>
      </section>
    </div>
  )
}
