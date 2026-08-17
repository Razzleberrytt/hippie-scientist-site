import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allArticleMonographs, allBlogPosts } from '../../../.content-collections/generated'

import ArticleMdx from '@/components/articles/ArticleMdx'
import References from '@/components/References'
import JsonLd from '@/components/seo/JsonLd'
import ContentCards from '@/components/content/ContentCards'
import WhatEvidenceShows from '@/src/components/evidence/WhatEvidenceShows'
import { editorialReviewEvents } from '@/data/editorial/reviews'
import { latestReviewForPage } from '@/lib/editorial-provenance'
import {
  buildArticleReferenceSchema,
  buildCitationReadySummary,
  normalizeArticleReferences,
  normalizeCitationMetadata,
  resolveRelatedArticles,
} from '@/src/lib/article-citation-metadata'
import { SITE_URL, buildPageMetadata, compactMetaTitle } from '../../../src/lib/seo'
import { withRedirectSourceMetadata } from '@/src/lib/redirect-source-metadata'
import {
  AUTHOR_NAME,
  AUTHOR_SCHEMA_ID,
  AUTHOR_URL,
  ORGANIZATION_SCHEMA_ID,
} from '@/src/lib/schema-identities'

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

  // Some legacy article URLs are 301'd to a guide. Those pages still build, so
  // without this they would claim to be canonical for content that lives
  // elsewhere.
  return withRedirectSourceMetadata(
    buildPageMetadata({
      title: compactMetaTitle(page.title),
      description: page.description,
      path: `/articles/${page.slug}/`,
      keywords: page.tags,
      openGraphType: 'article',
    }),
    `/articles/${page.slug}/`,
  )
}

export default async function ArticleMonographPage({ params }: PageProps) {
  const { slug } = await params
  const page = articlePages.find((item) => item.slug === slug)
  if (!page) notFound()

  const pagePath = `/articles/${page.slug}/`
  const relatedPages = resolveRelatedArticles(page, articlePages)
  const { keyTakeaways, citationQuestions, canonicalConcepts } = normalizeCitationMetadata(page)
  const articleReferences = normalizeArticleReferences(page.references)
  const citationReadySummary = buildCitationReadySummary({
    description: page.description,
    keyTakeaways,
    sourceCount: articleReferences.length,
    evidenceGrade: page.evidenceGrade,
  })

  const sourceAuthor = 'author' in page && typeof page.author === 'string' ? page.author.trim() : ''
  const author = sourceAuthor || AUTHOR_NAME
  const reviewEvent = latestReviewForPage(editorialReviewEvents, pagePath)
  const lastReviewed = reviewEvent?.reviewedAt
  const reviewedBy = reviewEvent?.reviewerName
  const reviewerCredential = reviewEvent?.qualifications || reviewEvent?.reviewerRole
  const factualUpdated = page.factualUpdated || page.lastUpdated
  const templateUpdated = page.templateUpdated || undefined
  const reviewerLabel = reviewedBy
    ? `${reviewedBy}${reviewerCredential ? `, ${reviewerCredential}` : ''}`
    : undefined

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.description,
    abstract: citationReadySummary,
    dateModified: factualUpdated,
    datePublished: page.date ?? factualUpdated,
    mainEntityOfPage: `${SITE_URL}${pagePath}`,
    image: `${SITE_URL}/og-default.jpg`,
    keywords: page.tags,
    articleSection: page.category,
    ...(canonicalConcepts.length > 0 ? { about: canonicalConcepts } : {}),
    author: author === AUTHOR_NAME
      ? { '@type': 'Person', '@id': AUTHOR_SCHEMA_ID, name: AUTHOR_NAME, url: AUTHOR_URL }
      : { '@type': 'Person', name: author },
    publisher: { '@id': ORGANIZATION_SCHEMA_ID },
    citation: articleReferences.map(buildArticleReferenceSchema),
  }

  const takeawaySchema = keyTakeaways.length > 0
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

  const medicalPageSchema = lastReviewed || articleReferences.length > 0
    ? {
        '@context': 'https://schema.org',
        '@type': 'MedicalWebPage',
        url: `${SITE_URL}${pagePath}`,
        ...(lastReviewed ? { lastReviewed } : {}),
        ...(reviewerLabel
          ? {
              reviewedBy: {
                '@type': 'Person',
                name: reviewedBy,
                ...(reviewerCredential ? { honorificSuffix: reviewerCredential } : {}),
              },
            }
          : {}),
      }
    : null

  const hasResearchBrief = citationQuestions.length > 0 || keyTakeaways.length > 0

  return (
    <article className="mx-auto max-w-5xl px-4 pb-20 pt-3 sm:px-6 sm:pt-5 lg:px-8">
      <JsonLd schema={articleSchema} />
      {medicalPageSchema ? <JsonLd schema={medicalPageSchema} /> : null}
      {takeawaySchema ? <JsonLd schema={takeawaySchema} /> : null}

      <header className="hero-shell rounded-[2rem] border p-6 sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2.5">
          <span className="identity-kicker">{page.category}</span>
          {page.evidenceGrade ? <span className="identity-kicker">Evidence {page.evidenceGrade}</span> : null}
          {factualUpdated ? (
            <time dateTime={factualUpdated} className="identity-meta">Factual update {factualUpdated}</time>
          ) : null}
          {templateUpdated ? (
            <>
              <span aria-hidden="true" className="identity-meta">·</span>
              <time dateTime={templateUpdated} className="identity-meta">Template revision {templateUpdated}</time>
            </>
          ) : null}
          <span aria-hidden="true" className="identity-meta">·</span>
          <span className="identity-meta">
            {typeof page.readingTime === 'number' ? `${page.readingTime} min read` : page.readingTime}
          </span>
        </div>

        <h1 className="heading-premium mt-5 max-w-4xl">{page.title}</h1>

        <div className="mt-5 max-w-4xl">
          <WhatEvidenceShows
            id={`article-evidence-${page.slug}`}
            summary={citationReadySummary}
            evidenceGrade={page.evidenceGrade}
            sourceCount={articleReferences.length}
            referencesHref={articleReferences.length ? '#references' : undefined}
          />
        </div>

        <div className="mt-6 flex flex-wrap items-center gap-x-3 gap-y-2 border-t border-[color:var(--hs-hairline)] pt-4 text-xs text-[color:var(--hs-body)]">
          <span>
            Written by <span className="font-semibold text-[color:var(--hs-ink)]">{author}</span>
          </span>
          {reviewerLabel ? (
            <>
              <span aria-hidden="true">·</span>
              <span>Reviewed by <span className="font-semibold text-[color:var(--hs-ink)]">{reviewerLabel}</span></span>
            </>
          ) : null}
          {lastReviewed ? (
            <>
              <span aria-hidden="true">·</span>
              <span>Last reviewed <time dateTime={lastReviewed}>{lastReviewed}</time></span>
            </>
          ) : null}
          {articleReferences.length > 0 ? (
            <>
              <span aria-hidden="true">·</span>
              <a href="#references" className="font-semibold text-[color:var(--tone-ink)] hover:underline">
                {articleReferences.length} cited sources
              </a>
            </>
          ) : null}
          <span aria-hidden="true">·</span>
          <Link href="/info/methodology/" className="font-semibold text-[color:var(--tone-ink)] hover:underline">
            Evidence standards
          </Link>
        </div>
      </header>

      {hasResearchBrief ? (
        <section className="mt-8 border-y border-[color:var(--hs-hairline)] py-7 sm:py-9" aria-label="Research brief">
          <div className={`grid gap-8 ${citationQuestions.length > 0 && keyTakeaways.length > 0 ? 'lg:grid-cols-[0.88fr_1.12fr] lg:gap-12' : ''}`}>
            {citationQuestions.length > 0 ? (
              <div aria-labelledby="citation-questions-title">
                <p className="section-label">Research brief</p>
                <h2 id="citation-questions-title" className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hs-ink)]">
                  Questions this page answers
                </h2>
                <ul className="mt-5 divide-y divide-[color:var(--hs-hairline)] text-sm leading-6 text-[color:var(--hs-body)]">
                  {citationQuestions.map((question) => (
                    <li key={question} className="py-3 first:pt-0 last:pb-0">{question}</li>
                  ))}
                </ul>
              </div>
            ) : null}

            {keyTakeaways.length > 0 ? (
              <div aria-labelledby="metadata-takeaways-title" className={citationQuestions.length > 0 ? 'lg:border-l lg:border-[color:var(--hs-hairline)] lg:pl-10' : ''}>
                <p className="section-label">Signal</p>
                <h2 id="metadata-takeaways-title" className="mt-3 font-display text-2xl font-semibold tracking-[-0.03em] text-[color:var(--hs-ink)]">
                  Scientific takeaways
                </h2>
                <ol className="mt-5 space-y-4">
                  {keyTakeaways.map((takeaway, index) => (
                    <li key={takeaway} className="grid grid-cols-[2rem_minmax(0,1fr)] gap-3 text-sm leading-6 text-[color:var(--hs-body)]">
                      <span aria-hidden="true" className="pt-0.5 font-mono text-[0.65rem] font-bold tracking-[0.12em] text-[color:var(--hs-gold-ink)]">
                        {String(index + 1).padStart(2, '0')}
                      </span>
                      <span>{takeaway}</span>
                    </li>
                  ))}
                </ol>
              </div>
            ) : null}
          </div>
        </section>
      ) : null}

      <div className="mt-8">
        <ContentCards>
          <ArticleMdx code={page.body} />
        </ContentCards>
      </div>

      {articleReferences.length > 0 ? (
        <div className="mt-8">
          <References refs={articleReferences} />
        </div>
      ) : null}

      {relatedPages.length > 0 ? (
        <section className="mt-8 border-t border-[color:var(--hs-hairline)] py-8">
          <h2 className="text-lg font-bold text-ink">Related Articles</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPages.map((relatedPage) => (
              <Link
                key={relatedPage.slug}
                href={relatedPage.url}
                className="border-b border-[color:var(--hs-hairline)] py-3 text-sm font-semibold leading-6 text-[color:var(--tone-ink)] transition hover:border-[color:var(--hs-gold)] hover:text-[color:var(--hs-ink)]"
              >
                {relatedPage.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="mt-8 border-l-2 border-amber-600/50 bg-amber-50/50 px-4 py-3 text-sm leading-6 text-[#5b4a2c]">
        Educational disclaimer: this article is for evidence review and educational context only. It is not medical advice, legal advice, or a recommendation to use any substance discussed.
        <div className="mt-3 flex flex-wrap gap-4 font-semibold text-[color:var(--tone-ink)]">
          <Link href="/articles/" className="hover:underline">All articles</Link>
          <Link href="/safety-checker/" className="hover:underline">Safety checker</Link>
        </div>
      </footer>
    </article>
  )
}
