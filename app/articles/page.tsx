import type { Metadata } from 'next'
import Link from 'next/link'
import { allArticleMonographs, allBlogPosts } from '../../.content-collections/generated'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { SITE_URL } from '../../src/lib/seo'

const articlePages = [...allArticleMonographs, ...allBlogPosts].sort((a, b) =>
  b.lastUpdated.localeCompare(a.lastUpdated)
)

export const metadata: Metadata = {
  title: 'Articles — Research Notes & Evidence Reviews',
  description:
    'Research notes, evidence reviews, regulatory updates, and editorial deep dives on herbs, compounds, and emerging psychoactive substances.',
  alternates: { canonical: `${SITE_URL}/articles/` },
  openGraph: {
    title: 'Articles — Research Notes & Evidence Reviews',
    description:
      'Research notes, evidence reviews, regulatory updates, and editorial deep dives on herbs, compounds, and emerging psychoactive substances.',
    type: 'website',
    url: `${SITE_URL}/articles/`,
    images: ['/og-default.jpg'],
  },
}

export default function ArticlesIndexPage() {
  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { label: 'Articles' },
        ]}
      />

      <header className="mt-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-800">Research &amp; evidence reviews</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          Articles
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          Research notes, evidence reviews, regulatory updates, and editorial deep dives on herbs, compounds, and emerging psychoactive substances.
        </p>
      </header>

      <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Articles">
        {articlePages.map((page) => (
          <Link
            key={page.slug}
            href={page.url}
            className="rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/30 hover:bg-brand-50/40"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold uppercase tracking-wider text-muted">
                {page.category}
              </span>
              {page.evidenceGrade ? (
                <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">
                  Evidence: {page.evidenceGrade}
                </span>
              ) : null}
              <time dateTime={page.lastUpdated} className="text-muted">
                {page.lastUpdated}
              </time>
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug text-ink">{page.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{page.description}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
