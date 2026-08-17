import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { buildPageMetadata } from '../../src/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'About, Methodology & Site Policies',
  description:
    'Explore The Hippie Scientist methodology, editorial standards, corrections policy, safety guidance, privacy, disclosures, free resources, and ways to contact the project.',
  path: '/info/',
})

const sections = [
  {
    eyebrow: 'How the project works',
    title: 'Methods, authorship, and editorial standards',
    description: 'Understand how evidence is handled, who is responsible for the project, how corrections work, and what the research roadmap prioritizes.',
    links: [
      { href: '/info/about/', title: 'About the project', body: 'What The Hippie Scientist is trying to do — and what it is not.' },
      { href: '/info/author/', title: 'Author', body: 'Authorship, project ownership, and responsibility for published material.' },
      { href: '/info/methodology/', title: 'Methodology', body: 'How evidence strength, uncertainty, safety context, and source quality are evaluated.' },
      { href: '/info/editorial-policy/', title: 'Editorial policy', body: 'Standards for claims, sourcing, independence, updates, and publication decisions.' },
      { href: '/info/corrections/', title: 'Corrections policy', body: 'How readers can report errors and how material corrections are handled.' },
      { href: '/info/research-roadmap/', title: 'Research roadmap', body: 'The areas and evidence gaps the project is working through next.' },
    ],
  },
  {
    eyebrow: 'Use the site carefully',
    title: 'Safety, limitations, and reader guidance',
    description: 'The site is educational. These pages explain the limits of public research summaries and the checks worth making before acting on supplement information.',
    links: [
      { href: '/info/disclaimer/', title: 'Educational disclaimer', body: 'Why the site is research context rather than personal diagnosis or treatment advice.' },
      { href: '/info/supplement-safety-checklist/', title: 'Supplement safety checklist', body: 'A practical pre-purchase and pre-stack safety review.' },
      { href: '/info/dosing/', title: 'Dosing context', body: 'How to think about studied doses, forms, labels, and the limits of dose comparisons.' },
      { href: '/info/faq/', title: 'Frequently asked questions', body: 'Common questions about evidence, safety, site scope, and how to use the library.' },
    ],
  },
  {
    eyebrow: 'Transparency',
    title: 'Privacy, monetization, and reuse policies',
    description: 'See how the project handles visitor data, affiliate relationships, content reuse, and the separation between evidence language and monetization.',
    links: [
      { href: '/info/privacy/', title: 'Privacy policy', body: 'Plain-English information about analytics, email, contact messages, and third-party services.' },
      { href: '/info/affiliate-disclosure/', title: 'Affiliate disclosure', body: 'How product links may support the site without changing evidence grades or safety language.' },
      { href: '/info/content-licensing/', title: 'Content licensing', body: 'Guidance for attribution, reuse, syndication, and responsible republication.' },
    ],
  },
  {
    eyebrow: 'Free resources & participation',
    title: 'Learn, share, and help improve the library',
    description: 'Use the free education resources, follow research updates, or send a correction, source, or useful idea back to the project.',
    links: [
      { href: '/info/free-guide/', title: 'Free decision guide', body: 'A practical evidence, safety, product-quality, and stacking checklist.' },
      { href: '/info/infographics/', title: 'Infographics', body: 'Free evidence-aware visuals with attribution and links back to the source guides.' },
      { href: '/info/newsletter/', title: 'Newsletter', body: 'Evidence-first research notes, safety reminders, and major site updates.' },
      { href: '/info/research-resources-for-writers/', title: 'Resources for writers', body: 'Source and research tools for people covering supplements and evidence.' },
      { href: '/info/contact/', title: 'Contact', body: 'Send corrections, broken-page reports, research notes, and thoughtful feedback.' },
    ],
  },
] as const

export default function InfoHubPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-10 px-4 pb-24 pt-4 sm:pt-6">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { label: 'Info' },
        ]}
      />

      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8 lg:p-10">
        <p className="eyebrow-label">About &amp; policies</p>
        <h1 className="heading-premium mt-5 max-w-4xl">How the site works — and where its boundaries are.</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Methodology, editorial standards, corrections, safety guidance, privacy, disclosures, free resources,
          and ways to help improve the research library. This is the parent directory for the site&apos;s trust and policy pages.
        </p>
      </header>

      {sections.map((section) => (
        <section key={section.title} aria-labelledby={`info-${section.eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}>
          <div className="max-w-3xl">
            <p className="eyebrow-label">{section.eyebrow}</p>
            <h2
              id={`info-${section.eyebrow.toLowerCase().replace(/[^a-z0-9]+/g, '-')}`}
              className="compact-heading mt-3"
            >
              {section.title}
            </h2>
            <p className="mt-3 text-sm leading-7 text-[color:var(--hs-body)] sm:text-base">{section.description}</p>
          </div>

          <div className="mt-5 grid gap-4 md:grid-cols-2 lg:gap-5">
            {section.links.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="card-premium group flex min-h-[10rem] flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2 sm:p-6"
              >
                <h3 className="text-lg font-semibold tracking-tight text-[color:var(--hs-ink)]">{item.title}</h3>
                <p className="mt-2 text-sm leading-6 text-[color:var(--hs-body)]">{item.body}</p>
                <span className="mt-auto inline-flex items-center gap-2 pt-4 text-sm font-bold text-[color:var(--hs-gold-ink)]">
                  Open page
                  <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
                </span>
              </Link>
            ))}
          </div>
        </section>
      ))}
    </div>
  )
}
