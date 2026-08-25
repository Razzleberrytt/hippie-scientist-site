import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { allArticleMonographs, allBlogPosts } from '../../.content-collections/generated'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { SITE_URL, buildTwitterMetadata } from '../../src/lib/seo'

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
  twitter: buildTwitterMetadata({
    title: 'Articles — Research Notes & Evidence Reviews',
    description: 'Research notes, evidence reviews, regulatory updates, and editorial deep dives on herbs, compounds, and emerging psychoactive substances.',
  }),
}

export default function ArticlesIndexPage() {
  return (
    <div className="mx-auto max-w-6xl space-y-6 px-4 py-4 sm:py-6">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { label: 'Articles' },
        ]}
      />

      <header className="hero-shell rounded-[2rem] border px-5 py-6 sm:p-8">
        <p className="eyebrow-label">Research &amp; evidence reviews</p>
        <h1 className="heading-premium mt-5 max-w-4xl">Articles</h1>
        <p className="text-reading mt-4 max-w-3xl">
          Research notes, evidence reviews, regulatory updates, and editorial deep dives. Browse {articlePages.length} published pieces with the same evidence-first, safety-aware approach used across the profile library.
        </p>
      </header>

      <section className="grid gap-4 sm:grid-cols-2 lg:gap-5" aria-label="Articles">
        {articlePages.map((page) => (
          <Link
            key={page.slug}
            href={page.url}
            className="card-premium group flex min-h-[13rem] flex-col p-5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[color:var(--hs-gold)] focus-visible:ring-offset-2 sm:p-6"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              <span className="rounded-full border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] px-2.5 py-1 font-semibold uppercase tracking-[0.08em] text-[color:var(--hs-body)]">
                {page.category}
              </span>
              {page.evidenceGrade ? (
                <span className="rounded-full border border-[color:var(--hs-hairline)] bg-[color:var(--surface-subtle)] px-2.5 py-1 font-semibold text-[color:var(--hs-body)]">
                  Evidence: {page.evidenceGrade}
                </span>
              ) : null}
              <time dateTime={page.lastUpdated} className="text-[color:var(--hs-body)]">
                {page.lastUpdated}
              </time>
            </div>

            <h2 className="mt-4 text-xl font-semibold leading-snug tracking-tight text-[color:var(--hs-ink)] sm:text-[1.35rem]">
              {page.title}
            </h2>
            <p className="mt-3 line-clamp-3 text-sm leading-6 text-[color:var(--hs-body)]">{page.description}</p>

            <span className="mt-auto inline-flex items-center gap-2 pt-5 text-sm font-bold text-[color:var(--hs-gold-ink)]">
              Read article
              <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" aria-hidden="true" />
            </span>
          </Link>
        ))}
      </section>
    </div>
  )
}
