import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allArticleMonographs, allBlogPosts } from '../../../.content-collections/generated'

import ArticleMdx from '@/components/articles/ArticleMdx'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import ContentCards from '@/components/content/ContentCards'
import { SITE_URL, compactMetaTitle } from '../../../src/lib/seo'

const articlePages = [...allArticleMonographs, ...allBlogPosts]

type PageProps = {
  params: Promise<{ slug: string }>
}

export function generateStaticParams() {
  return articlePages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = articlePages.find((item) => item.slug === slug)
  if (!page) return { title: 'Page Not Found', robots: { index: false, follow: true } }

  const metaTitle = compactMetaTitle(page.title)

  return {
    title: metaTitle,
    description: page.description,
    keywords: page.tags,
    alternates: { canonical: `${SITE_URL}/articles/${page.slug}/` },
    openGraph: {
      title: metaTitle,
      description: page.description,
      type: 'article',
      url: `${SITE_URL}/articles/${page.slug}/`,
      images: ['/og-default.jpg'],
    },
  }
}

export default async function ArticleMonographPage({ params }: PageProps) {
  const { slug } = await params
  const page = articlePages.find((item) => item.slug === slug)
  if (!page) notFound()

  const relatedPages = articlePages.filter((item) => item.slug !== page.slug && item.category === page.category)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    dateModified: page.lastUpdated,
    datePublished: page.date ?? page.lastUpdated,
    mainEntityOfPage: `${SITE_URL}/articles/${page.slug}/`,
    keywords: page.tags,
    articleSection: page.category,
    additionalProperty: page.evidenceGrade
      ? [{ '@type': 'PropertyValue', name: 'evidenceGrade', value: page.evidenceGrade }]
      : undefined,
    citation: page.references.map((ref) => ({
      '@type': 'ScholarlyArticle',
      headline: ref.title,
      author: ref.authors,
      datePublished: ref.year,
      identifier: ref.pmid ? `PMID:${ref.pmid}` : undefined,
      url: ref.url || (ref.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/` : undefined),
    })),
  }

  return (
    <article className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleSchema} />

      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/articles', label: 'Articles' },
          { label: page.title },
        ]}
      />

      <header className="mt-6 rounded-[1rem] border-2 border-brand-900/15 bg-white p-6 shadow-md ring-1 ring-brand-900/5 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-700/20 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            {page.category}
          </span>
          {page.evidenceGrade ? (
            <span className="rounded-full border border-brand-700/20 bg-brand-50 px-2.5 py-0.5 font-semibold text-brand-700">
              Evidence: {page.evidenceGrade}
            </span>
          ) : null}
          <time dateTime={page.lastUpdated} className="text-muted">
            Updated {page.lastUpdated}
          </time>
          <span className="text-muted">·</span>
          <span className="text-muted">{typeof page.readingTime === 'number' ? `${page.readingTime} min read` : page.readingTime}</span>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {page.title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          {page.description}
        </p>
      </header>

      <div className="mt-6">
        <ContentCards>
          <ArticleMdx code={page.body} />
        </ContentCards>
      </div>

      {page.references.length > 0 ? (
        <section className="mt-8 rounded-[0.9rem] border-2 border-brand-900/15 bg-white p-5 shadow-md ring-1 ring-brand-900/5">
          <h2 className="text-lg font-bold text-ink">References</h2>
          <ol className="mt-4 space-y-2 text-sm leading-6 text-muted">
            {page.references.map((ref, index) => (
              <li key={`${ref.title}-${index}`}>
                {ref.authors ? `${ref.authors} ` : ''}
                {ref.title}
                {ref.year ? ` (${ref.year})` : ''}
                {ref.url ? (
                  <>
                    {' — '}
                    <a href={ref.url} target="_blank" rel="noopener noreferrer nofollow" className="font-semibold text-brand-800 hover:underline">
                      Source
                    </a>
                  </>
                ) : null}
              </li>
            ))}
          </ol>
        </section>
      ) : null}

      {relatedPages.length > 0 ? (
        <section className="mt-8 rounded-[0.9rem] border-2 border-brand-900/15 bg-white p-5 shadow-md ring-1 ring-brand-900/5">
          <h2 className="text-lg font-bold text-ink">Related Articles</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPages.map((relatedPage) => (
              <Link
                key={relatedPage.slug}
                href={relatedPage.url}
                className="rounded-[0.75rem] border-2 border-brand-700/15 bg-brand-50/60 p-4 text-sm font-semibold leading-6 text-brand-800 shadow-sm hover:border-brand-700/30 hover:bg-brand-50 hover:shadow-md transition-all"
              >
                {relatedPage.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="mt-8 rounded-[0.9rem] border-2 border-amber-600/30 bg-amber-50 p-4 shadow-sm text-sm leading-6 text-[#5b4a2c]">
        Educational disclaimer: this article is for evidence review and educational context only. It is not medical advice, legal advice, or a recommendation to use any substance discussed.
        <div className="mt-3 flex flex-wrap gap-4 font-semibold text-brand-800">
          <Link href="/articles/" className="hover:underline">All articles</Link>
          <Link href="/safety-checker/" className="hover:underline">Safety checker</Link>
        </div>
      </footer>
    </article>
  )
}
