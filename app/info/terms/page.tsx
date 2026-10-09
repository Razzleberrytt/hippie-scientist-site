import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'
import AuthorityJsonLd from '@/components/seo/AuthorityJsonLd'
import AuthorityBreadcrumbs from '@/components/navigation/AuthorityBreadcrumbs'

const TITLE = 'Terms of Service | The Hippie Scientist'
const DESCRIPTION =
  'Terms for using The Hippie Scientist educational research website, including responsible use, content attribution, external links, and contact information.'

export const metadata: Metadata = buildPageMetadata({
  title: TITLE,
  description: DESCRIPTION,
  path: '/info/terms/',
  openGraphType: 'article',
})

const sections = [
  {
    title: '1. Purpose and scope',
    paragraphs: [
      'The Hippie Scientist publishes educational information about supplements, herbs, compounds, research methods, and safety questions. You may browse the public pages for personal learning and research.',
      'Content is provided for general information, not for diagnosing, preventing, or treating an individual medical condition. The site does not establish a professional–patient relationship or replace advice from a qualified health professional.',
    ],
  },
  {
    title: '2. Use research responsibly',
    paragraphs: [
      'Research findings may be incomplete, conflicting, outdated, or relevant only to particular study populations, preparations, or outcomes. Citations, evidence grades, and research-only records have different levels of review; an indexed paper is not an endorsement or a proven health claim.',
      'Do not treat experimental substances, study doses, mechanisms, or general safety information as personalized directions. Consult an appropriate professional about individual medical decisions, medication interactions, or urgent symptoms.',
    ],
  },
  {
    title: '3. Permitted use and attribution',
    paragraphs: [
      'You may read and share links to public pages. Do not use the site to misrepresent research evidence, impersonate the site, disrupt its services, or attempt unauthorized access.',
      'Original site materials, illustrations, and compilations may be protected by applicable rights; third-party studies and images retain their own rights. For quoting, citing, or reusing site research materials, consult the content licensing and attribution policy. A public data endpoint does not grant rights to third-party publications.',
    ],
  },
  {
    title: '4. External services and commercial links',
    paragraphs: [
      'The site may link to research databases, publishers, retailers, social platforms, and other third parties. Those services have their own terms, policies, availability, and accuracy practices. A link is not a guarantee or endorsement.',
      'Some retailer links may be affiliate links. Applicable disclosures explain how these links are identified and why commercial relationships do not determine scientific conclusions or rankings.',
    ],
  },
  {
    title: '5. Privacy and communications',
    paragraphs: [
      'Reading the public website does not require an account. Optional contact messages, newsletter signups, technical logging, cookies, and analytics are described in the Privacy Policy.',
      'If you send a correction, question, or other message, please avoid including private medical details unless necessary. Submission does not create an individualized advice relationship.',
    ],
  },
  {
    title: '6. Availability and changes',
    paragraphs: [
      'We work to keep resources accessible, evidence-aware, and correctable, but pages, features, external destinations, and source records may change or become unavailable. Information is presented with its stated limitations rather than as a guarantee of uninterrupted availability or any particular result.',
      'These Terms may be revised as the site evolves. The current version and its effective date will appear on this page. Material content corrections are documented separately.',
    ],
  },
]

export default function TermsPage() {
  return (
    <div className='container-page space-y-8 py-10'>
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
      <AuthorityBreadcrumbs items={[
        { label: 'Home', href: '/' },
        { label: 'Info', href: '/info/' },
        { label: 'Terms of Service' },
      ]} />

      <header className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Site information</p>
        <h1 className='mt-3 max-w-4xl text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>Terms of Service</h1>
        <p className='mt-4 max-w-3xl text-base leading-7 text-muted sm:text-lg'>
          These Terms explain how visitors may use The Hippie Scientist and where the limits of its
          educational research content apply.
        </p>
        <p className='mt-4 text-sm text-muted'>Effective October 9, 2026</p>
        <nav className='mt-6 flex flex-wrap gap-3' aria-label='Related site policies'>
          <Link href='/info/privacy/' className='chip-readable hover:bg-white transition'>Privacy policy</Link>
          <Link href='/info/disclaimer/' className='chip-readable hover:bg-white transition'>Educational disclaimer</Link>
          <Link href='/info/contact/' className='chip-readable hover:bg-white transition'>Contact</Link>
        </nav>
      </header>

      <div className='space-y-5' aria-label='Terms of Service sections'>
        {sections.map((section) => (
          <section key={section.title} className='card-premium p-6 sm:p-8'>
            <h2 className='text-2xl font-semibold tracking-tight text-ink'>{section.title}</h2>
            <div className='mt-4 space-y-4'>
              {section.paragraphs.map((paragraph) => (
                <p key={paragraph} className='text-sm leading-7 text-muted sm:text-base'>{paragraph}</p>
              ))}
            </div>
          </section>
        ))}
      </div>

      <section className='rounded-[2rem] border border-brand-900/10 bg-brand-50/60 p-6 sm:p-8'>
        <h2 className='text-2xl font-semibold tracking-tight text-ink'>Other policies and questions</h2>
        <p className='mt-3 leading-7 text-muted'>
          For additional details, review the <Link className='font-semibold underline underline-offset-4' href='/info/content-licensing/'>content licensing policy</Link>,
          {' '}<Link className='font-semibold underline underline-offset-4' href='/info/affiliate-disclosure/'>affiliate disclosure</Link>,
          {' '}<Link className='font-semibold underline underline-offset-4' href='/info/privacy/'>Privacy Policy</Link>, or
          {' '}<Link className='font-semibold underline underline-offset-4' href='/info/corrections/'>corrections history</Link>.
          Contact the site about a policy question or correction through the{' '}
          <Link className='font-semibold underline underline-offset-4' href='/info/contact/'>contact page</Link>.
        </p>
      </section>
    </div>
  )
}
