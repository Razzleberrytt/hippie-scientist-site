import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allNovelPsychoactiveSubstancePages } from '../../.content-collections/generated'

import ArticleMdx from '@/components/articles/ArticleMdx'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import { SITE_URL } from '../../src/lib/seo'

const sectionPage = allNovelPsychoactiveSubstancePages.find((page) => page.slug === 'index')
const articlePages = allNovelPsychoactiveSubstancePages.filter((page) => page.slug !== 'index')

export const metadata: Metadata = sectionPage
  ? {
      title: sectionPage.title,
      description: sectionPage.metaDescription,
      keywords: sectionPage.keywords,
      alternates: { canonical: `${SITE_URL}/novel-psychoactive-substances/` },
      openGraph: {
        title: sectionPage.title,
        description: sectionPage.metaDescription,
        type: 'website',
        url: `${SITE_URL}/novel-psychoactive-substances/`,
      },
    }
  : {}

export default function NovelPsychoactiveSubstancesIndexPage() {
  if (!sectionPage) notFound()

  return (
    <div className="mx-auto max-w-5xl px-4 pb-20 pt-8 sm:px-6 lg:px-8">
      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { label: 'Novel Psychoactive Substances' },
        ]}
      />

      <header className="mt-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <p className="text-xs font-bold uppercase tracking-wider text-red-800">Evidence and harm reduction</p>
        <h1 className="mt-3 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {sectionPage.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          {sectionPage.metaDescription}
        </p>
        <time dateTime={sectionPage.lastUpdated} className="mt-4 block text-sm text-muted">
          Updated {sectionPage.lastUpdated}
        </time>
      </header>

      <div className="mt-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="content-prose max-w-none [&>*]:max-w-reading [&_a]:font-semibold [&_a]:text-brand-800 [&_a:hover]:underline [&_h2]:mt-10 [&_h2]:text-2xl [&_ul]:list-disc">
          <ArticleMdx code={sectionPage.body} />
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2" aria-label="Novel psychoactive substances articles">
        {articlePages.map((page) => (
          <Link
            key={page.slug}
            href={page.url}
            className="rounded-[0.75rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm transition hover:border-brand-700/30 hover:bg-brand-50/40"
          >
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {page.evidenceGrade ? (
                <span className="rounded-full border border-red-700/20 bg-red-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-red-900">
                  Evidence: {page.evidenceGrade}
                </span>
              ) : null}
              <time dateTime={page.lastUpdated} className="text-muted">
                {page.lastUpdated}
              </time>
            </div>
            <h2 className="mt-3 text-lg font-bold leading-snug text-ink">{page.title}</h2>
            <p className="mt-2 text-sm leading-6 text-muted">{page.metaDescription}</p>
          </Link>
        ))}
      </section>
    </div>
  )
}
