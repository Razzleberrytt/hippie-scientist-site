import type { Metadata } from 'next'
import Link from 'next/link'
import {
  allArticleMonographs,
  allBlogPosts,
  allConceptPages,
} from '../../../.content-collections/generated'

import ArticleMdx from '@/components/articles/ArticleMdx'
import ContentCards from '@/components/content/ContentCards'
import JsonLd from '@/components/seo/JsonLd'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import {
  normalizeCitationMetadata,
  resolveRelatedArticles,
} from '@/src/lib/article-citation-metadata'
import { SITE_URL, buildTwitterMetadata, compactMetaTitle } from '@/src/lib/seo'

const page = allConceptPages.find((item) => item.slug === 'rhabdomyolysis')!
const canonicalUrl = `${SITE_URL}${page.url}/`

export const metadata: Metadata = {
  title: compactMetaTitle(page.title),
  description: page.description,
  keywords: page.tags,
  alternates: { canonical: canonicalUrl },
  openGraph: {
    title: compactMetaTitle(page.title),
    description: page.description,
    type: 'article',
    url: canonicalUrl,
    images: ['/og-default.jpg'],
  },
  twitter: buildTwitterMetadata({
    title: compactMetaTitle(page.title),
    description: page.description,
  }),
}

export default function RhabdomyolysisPage() {
  const relationshipPages = [
    ...allArticleMonographs,
    ...allBlogPosts,
    ...allConceptPages,
  ]
  const relatedPages = resolveRelatedArticles(page, relationshipPages)
  const { keyTakeaways, citationQuestions, canonicalConcepts } =
    normalizeCitationMetadata(page)

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    dateModified: page.lastUpdated,
    datePublished: page.date ?? page.lastUpdated,
    mainEntityOfPage: canonicalUrl,
    image: `${SITE_URL}/og-default.jpg`,
    keywords: page.tags,
    articleSection: page.category,
    ...(canonicalConcepts.length > 0 ? { about: canonicalConcepts } : {}),
    author: page.author
      ? { '@type': 'Person', name: page.author }
      : { '@type': 'Organization', name: 'The Hippie Scientist', url: SITE_URL },
    publisher: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: SITE_URL,
    },
    citation: page.references.map((reference) => ({
      '@type': 'ScholarlyArticle',
      headline: reference.title,
      author: reference.authors,
      datePublished: reference.year,
      identifier: reference.pmid ? `PMID:${reference.pmid}` : undefined,
      url:
        reference.url ||
        (reference.pmid
          ? `https://pubmed.ncbi.nlm.nih.gov/${reference.pmid}/`
          : undefined),
    })),
  }

  const takeawaySchema =
    keyTakeaways.length > 0
      ? {
          '@context': 'https://schema.org',
          '@type': 'ItemList',
          name: `${page.title}: Scientific Takeaways`,
          itemListElement: keyTakeaways.map((takeaway, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: takeaway,
          })),
        }
      : null

  return (
    <article className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleSchema} />
      {takeawaySchema ? <JsonLd schema={takeawaySchema} /> : null}

      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/learn/', label: 'Learn' },
          { label: page.title },
        ]}
      />

      <header className="mt-6 border-b border-brand-900/15 pb-8 pt-4 sm:pb-10 sm:pt-6">
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
          <span className="text-muted">{page.readingTime}</span>
        </div>

        <h1 className="mt-4 max-w-[22ch] font-display text-2xl font-bold leading-[1.08] text-ink sm:text-4xl lg:text-5xl">
          {page.title}
        </h1>
        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          {page.description}
        </p>

        <div className="mt-5 flex flex-wrap items-center gap-x-3 gap-y-1.5 border-t border-brand-900/10 pt-4 text-xs text-muted">
          {page.author ? (
            <span>
              Written by <span className="font-semibold text-ink">{page.author}</span>
            </span>
          ) : null}
          <span aria-hidden="true">·</span>
          <a href="#references" className="font-semibold text-brand-800 hover:underline">
            {page.references.length} cited sources
          </a>
          <span aria-hidden="true">·</span>
          <Link href="/info/methodology/" className="font-semibold text-brand-800 hover:underline">
            Evidence standards
          </Link>
        </div>
      </header>

      {citationQuestions.length > 0 ? (
        <section aria-labelledby="citation-questions-title" className="mt-6 rounded-2xl border border-brand-900/10 bg-white p-5">
          <h2 id="citation-questions-title" className="text-lg font-bold text-ink">
            Questions this page answers
          </h2>
          <ul className="mt-3 grid gap-2 text-sm leading-6 text-muted sm:grid-cols-2">
            {citationQuestions.map((question) => (
              <li key={question} className="border-l-2 border-brand-700/30 pl-3">
                {question}
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {keyTakeaways.length > 0 ? (
        <section aria-labelledby="metadata-takeaways-title" className="mt-6 rounded-2xl border border-brand-900/10 bg-brand-50/50 p-5">
          <h2 id="metadata-takeaways-title" className="text-lg font-bold text-ink">
            Scientific takeaways
          </h2>
          <ul className="mt-3 space-y-2 text-sm leading-6 text-muted">
            {keyTakeaways.map((takeaway) => (
              <li key={takeaway} className="flex gap-3">
                <span aria-hidden="true" className="font-bold text-brand-700">•</span>
                <span>{takeaway}</span>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      <div className="mt-6">
        <ContentCards>
          <ArticleMdx code={page.body} />
        </ContentCards>
      </div>

      <section id="references" className="mt-8 scroll-mt-24 border-t border-brand-900/15 py-8">
        <h2 className="text-lg font-bold text-ink">References</h2>
        <ol className="mt-4 list-decimal space-y-2 pl-5 text-sm leading-6 text-muted marker:font-semibold marker:text-brand-800">
          {page.references.map((reference, index) => (
            <li key={`${reference.title}-${index}`}>
              {reference.authors ? `${reference.authors} ` : ''}
              {reference.title}
              {reference.year ? ` (${reference.year})` : ''}
              {reference.url ? (
                <>
                  {' — '}
                  <a href={reference.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-800 hover:underline">
                    Source
                  </a>
                </>
              ) : null}
            </li>
          ))}
        </ol>
      </section>

      {relatedPages.length > 0 ? (
        <section className="mt-8 border-t border-brand-900/15 py-8">
          <h2 className="text-lg font-bold text-ink">Related Reading</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPages.map((relatedPage) => (
              <Link
                key={relatedPage.slug}
                href={relatedPage.url}
                className="border-b border-brand-900/10 py-3 text-sm font-semibold leading-6 text-brand-800 transition hover:border-brand-700/30 hover:text-brand-700"
              >
                {relatedPage.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="mt-8 border-l-2 border-amber-600/50 bg-amber-50/50 px-4 py-3 text-sm leading-6 text-[#5b4a2c]">
        Educational disclaimer: this page is for evidence review and educational context only. It is not medical advice or a substitute for urgent clinical assessment.
        <div className="mt-3 flex flex-wrap gap-4 font-semibold text-brand-800">
          <Link href="/learn/" className="hover:underline">All learn pages</Link>
          <Link href="/safety-checker/" className="hover:underline">Safety checker</Link>
        </div>
      </footer>
    </article>
  )
}
