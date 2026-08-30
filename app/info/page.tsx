import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Site Information & Policies | The Hippie Scientist',
  description:
    'Who writes this site, how evidence is graded, how corrections and affiliate links are handled, and the free research resources available.',
  path: '/info/',
})

/**
 * Every /info/* page carries a breadcrumb back to /info/, and until now that
 * link 404'd — nineteen pages sat in the directory with no index above them.
 * That made it a dead breadcrumb on live, indexable content and a broken
 * BreadcrumbList target for search engines.
 *
 * Grouped rather than listed flat: nineteen links in one column is a wall, and
 * the groups map to the three reasons someone lands here — deciding whether to
 * trust the site, checking a specific policy, or looking for something usable.
 */
const groups = [
  {
    heading: 'Who writes this',
    blurb: 'Provenance, accountability, and how to reach a person.',
    pages: [
      { href: '/info/about/', title: 'About', description: 'What this site is for and how it is built.' },
      { href: '/info/author/', title: 'The author', description: 'Who is responsible, and what they do not claim.' },
      { href: '/info/contact/', title: 'Contact', description: 'Corrections, broken pages, and research notes.' },
      { href: '/info/reviews/', title: 'Editorial review history', description: 'Append-only record of page review events.' },
      { href: '/info/corrections/', title: 'Corrections history', description: 'Every material scientific or safety correction, kept public.' },
    ],
  },
  {
    heading: 'How the research is handled',
    blurb: 'The rules the content is held to, written down.',
    pages: [
      { href: '/info/methodology/', title: 'Evidence grading methodology', description: 'How mechanism is separated from outcome, and how uncertainty is shown.' },
      { href: '/info/editorial-policy/', title: 'Editorial & automation policy', description: 'Source inclusion, conflict resolution, and where automation is used.' },
      { href: '/info/disclaimer/', title: 'Educational disclaimer', description: 'The limits of what this research content can tell you.' },
      { href: '/info/affiliate-disclosure/', title: 'Affiliate disclosure', description: 'How product links work and what they do not influence.' },
      { href: '/info/privacy/', title: 'Privacy policy', description: 'Analytics, cookies, email, and contact data in plain English.' },
      { href: '/info/content-licensing/', title: 'Licensing & attribution', description: 'How to cite or reuse the structured research data.' },
    ],
  },
  {
    heading: 'Things you can use',
    blurb: 'Practical resources, most of them free to download or embed.',
    pages: [
      { href: '/info/supplement-safety-checklist/', title: 'Supplement safety checklist', description: 'Medication, dose, stacking, and quality checks before you buy.' },
      { href: '/info/dosing/', title: 'Dose & active-marker calculator', description: 'Turn label standardization percentages into actual active amounts.' },
      { href: '/info/faq/', title: 'Research FAQ', description: 'Common questions about using the site and reading the evidence.' },
      { href: '/info/free-guide/', title: 'Free decision guide', description: 'Evidence-aware guidance for sleep, stress, focus, and fatigue.' },
      { href: '/info/infographics/', title: 'Infographics', description: 'Free visual research resources to download or embed.' },
      { href: '/info/newsletter/', title: 'Newsletter', description: 'Evidence notes, safety checklists, and product-quality reminders.' },
      { href: '/info/research-resources-for-writers/', title: 'For writers & journalists', description: 'Report data, citation guidance, graphics, and contact routes.' },
      { href: '/info/research-roadmap/', title: 'Research roadmap', description: 'What is being improved next, and how to suggest a topic.' },
    ],
  },
]

export default function InfoIndexPage() {
  return (
    <main className='container-page space-y-8 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Site information</p>
        <h1 className='mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>
          How this site works, and who stands behind it
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          A supplement reference is only worth as much as its method and its willingness to be corrected. Every
          policy that governs the content is here, along with the correction history and the resources you can
          take away.
        </p>
      </section>

      {groups.map((group) => (
        <section key={group.heading} aria-labelledby={`info-${group.heading.replace(/\s+/g, '-').toLowerCase()}`} className='space-y-4'>
          <div>
            <p className='eyebrow-label'>{group.blurb}</p>
            <h2
              id={`info-${group.heading.replace(/\s+/g, '-').toLowerCase()}`}
              className='mt-1 text-2xl font-semibold text-ink'
            >
              {group.heading}
            </h2>
          </div>
          <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
            {group.pages.map((page) => (
              <article key={page.href} className='card-premium flex h-full flex-col p-6'>
                <h3 className='text-lg font-semibold text-ink'>
                  <Link href={page.href} className='hover:text-brand-800'>
                    {page.title}
                  </Link>
                </h3>
                <p className='mt-3 flex-1 text-sm leading-7 text-muted'>{page.description}</p>
              </article>
            ))}
          </div>
        </section>
      ))}
    </main>
  )
}
