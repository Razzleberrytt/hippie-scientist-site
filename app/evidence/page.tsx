import type { Metadata } from 'next'
import Link from 'next/link'
import { buildPageMetadata } from '@/lib/seo'

export const metadata: Metadata = buildPageMetadata({
  title: 'Evidence Tools & Reports | The Hippie Scientist',
  description:
    'Search ingredients by evidence grade, read the annual state-of-the-evidence report, and see which research questions are being explored most.',
  path: '/evidence/',
})

/**
 * Every /evidence/* page carries a breadcrumb back to /evidence/, and until now
 * that link 404'd — the directory had four pages and no index. Fifteen pages
 * pointed at it, so this was a dead breadcrumb on live, indexable content and a
 * broken BreadcrumbList target for search engines.
 *
 * evidence-digest is deliberately excluded: it is built `noindex` while its
 * sources are re-verified, and a hub that is itself indexable should not spend
 * crawl budget pointing at a page that has asked not to be indexed.
 */
const evidencePages = [
  {
    href: '/evidence/evidence-checker/',
    title: 'Evidence Checker',
    description:
      'Search herbs and compounds by evidence grade, from human clinical support down to mechanism-only data, so preliminary findings never read like settled ones.',
  },
  {
    href: '/evidence/evidence-report/',
    title: 'State of Supplement Evidence 2026',
    description:
      'The site-wide picture as original aggregate research: what is well supported, what stays preliminary, and where the evidence mix has shifted.',
  },
  {
    href: '/evidence/research-trends/',
    title: 'Research Trends',
    description:
      'Privacy-preserving aggregate trends from research activity on the site — which supplements and questions are being explored, month over month.',
  },
]

export default function EvidenceIndexPage() {
  return (
    <main className='container-page space-y-8 py-10'>
      <section className='hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10'>
        <p className='eyebrow-label'>Evidence</p>
        <h1 className='mt-3 text-4xl font-semibold tracking-tight text-ink sm:text-5xl'>
          What the research actually supports
        </h1>
        <p className='mt-5 max-w-3xl text-lg leading-8 text-muted'>
          Evidence grades are only useful if you can see how they were assigned and how strong the underlying
          research is. These three views let you search by grade, read the aggregate picture, and see what is
          being asked about most.
        </p>
      </section>

      <section aria-labelledby='evidence-page-list' className='space-y-4'>
        <div>
          <p className='eyebrow-label'>Three views</p>
          <h2 id='evidence-page-list' className='mt-1 text-2xl font-semibold text-ink'>
            Search it, read it, or watch it change
          </h2>
        </div>
        <div className='grid gap-5 sm:grid-cols-2 lg:grid-cols-3'>
          {evidencePages.map((page) => (
            <article key={page.href} className='card-premium flex h-full flex-col p-6'>
              <h3 className='text-xl font-semibold text-ink'>
                <Link href={page.href} className='hover:text-brand-800'>
                  {page.title}
                </Link>
              </h3>
              <p className='mt-3 flex-1 text-sm leading-7 text-muted'>{page.description}</p>
              <div className='mt-5'>
                <Link
                  href={page.href}
                  className='inline-flex min-h-10 items-center rounded-full border border-brand-900/15 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50'
                >
                  Open {page.title}
                </Link>
              </div>
            </article>
          ))}
        </div>
      </section>

      <section aria-labelledby='evidence-method' className='space-y-3'>
        <h2 id='evidence-method' className='text-2xl font-semibold text-ink'>
          How grades are assigned
        </h2>
        <p className='max-w-3xl text-base leading-7 text-muted'>
          Grades come from study design, replication, and whether the research was done in humans — not from how
          promising a mechanism sounds. Where the evidence cannot carry a grade, none is shown.
        </p>
        <div className='flex flex-wrap gap-2'>
          <Link
            href='/info/methodology/'
            className='inline-flex min-h-10 items-center rounded-full bg-brand-800 px-4 py-2 text-sm font-semibold text-white hover:bg-brand-900'
          >
            Read the grading methodology →
          </Link>
          <Link
            href='/info/editorial-policy/'
            className='inline-flex min-h-10 items-center rounded-full border border-brand-900/15 px-4 py-2 text-sm font-semibold text-brand-800 hover:bg-brand-50'
          >
            Editorial &amp; evidence policy
          </Link>
        </div>
      </section>
    </main>
  )
}
