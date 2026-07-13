import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import React from 'react'

import JsonLd from '@/components/seo/JsonLd'
import LastUpdatedBadge from '@/src/components/editorial/LastUpdatedBadge'
import {
  getMentalHealthArticle,
  mentalHealthArticles,
  type CitedText,
  type MentalHealthArticle,
} from '@/lib/mental-health-articles'
import {
  blogJsonLd,
  breadcrumbJsonLd,
  buildPageMetadata,
  canonicalUrl,
  DEFAULT_OG_IMAGE,
  SITE_NAME,
  SITE_URL,
} from '@/src/lib/seo'

const BASE_PATH = '/guides/mental-health'
const AUTHOR_NAME = 'Will Thomas'
const AUTHOR_URL = `${SITE_URL}/info/about/`

function citationNumbers(article: MentalHealthArticle): Map<string, number> {
  return new Map(article.references.map((reference, index) => [reference.id, index + 1]))
}

function sectionAnchor(title: string): string {
  return title
    .toLowerCase()
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function articleKeywords(article: MentalHealthArticle): string[] {
  return [
    article.title,
    article.seoTitle,
    article.slug.replace(/-/g, ' '),
    article.category,
    article.cluster ?? 'mental health',
    `${article.category} symptoms`,
    `${article.category} diagnosis`,
    `${article.category} treatment`,
    'evidence-based mental health guide',
  ]
}

function CitedPassage({ passage, article, as = 'p' }: {
  passage: CitedText
  article: MentalHealthArticle
  as?: 'p' | 'li'
}) {
  const numbers = citationNumbers(article)
  const Tag = as
  const refs = [...new Set(passage.refs)]
    .map((id) => ({ id, number: numbers.get(id) }))
    .filter((item): item is { id: string; number: number } => typeof item.number === 'number')

  return (
    <Tag className={as === 'li' ? 'leading-7 text-muted' : 'text-[1.01rem] leading-[1.85] text-muted'}>
      {passage.text}{' '}
      {refs.length > 0 && (
        <sup className="ml-0.5 whitespace-nowrap text-[0.72em] font-bold text-brand-700" aria-label="Citations">
          {refs.map((ref, index) => (
            <React.Fragment key={ref.id}>
              {index > 0 && ','}
              <a
                href={`#ref-${ref.id}`}
                className="rounded-sm px-0.5 hover:bg-brand-50 hover:text-brand-900"
                aria-label={`Reference ${ref.number}`}
              >
                {ref.number}
              </a>
            </React.Fragment>
          ))}
        </sup>
      )}
    </Tag>
  )
}

function relatedArticles(article: MentalHealthArticle): MentalHealthArticle[] {
  const preferredSlugs = article.slug === 'obsessive-compulsive-disorder'
    ? ['obsessive-compulsive-personality-disorder', 'personality-disorders-overview', 'borderline-personality-disorder']
    : article.slug === 'obsessive-compulsive-personality-disorder'
      ? ['obsessive-compulsive-disorder', 'personality-disorders-overview', 'avoidant-personality-disorder']
      : article.slug === 'personality-disorders-overview'
        ? ['borderline-personality-disorder', 'avoidant-personality-disorder', 'narcissistic-personality-disorder']
        : ['personality-disorders-overview', 'obsessive-compulsive-disorder', 'borderline-personality-disorder']

  const related = [
    ...mentalHealthArticles.filter((candidate) => candidate.cluster === article.cluster && candidate.slug !== article.slug),
    ...preferredSlugs
      .map((slug) => getMentalHealthArticle(slug))
      .filter((candidate): candidate is MentalHealthArticle => candidate !== undefined && candidate.slug !== article.slug),
  ]

  return [...new Map(related.map((candidate) => [candidate.slug, candidate])).values()].slice(0, 6)
}

export function mentalHealthMetadata(slug: string): Metadata {
  const article = getMentalHealthArticle(slug)
  if (!article) return { title: 'Page Not Found', robots: { index: false, follow: true } }

  const metadata = buildPageMetadata({
    title: article.seoTitle,
    description: article.description,
    path: `${BASE_PATH}/${article.slug}`,
    image: DEFAULT_OG_IMAGE,
    openGraphType: 'article',
    keywords: articleKeywords(article),
  })

  return {
    ...metadata,
    authors: [{ name: AUTHOR_NAME, url: AUTHOR_URL }],
    creator: AUTHOR_NAME,
    publisher: SITE_NAME,
    category: article.category,
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-image-preview': 'large',
        'max-snippet': -1,
        'max-video-preview': -1,
      },
    },
  }
}

export default function MentalHealthArticlePage({ slug }: { slug: string }) {
  const article = getMentalHealthArticle(slug)
  if (!article) notFound()

  const articlePath = `${BASE_PATH}/${article.slug}`
  const articleUrl = canonicalUrl(articlePath)
  const breadcrumbId = `${articleUrl}#breadcrumb`
  const collectionId = `${canonicalUrl(BASE_PATH)}#collection`
  const keywords = articleKeywords(article)
  const related = relatedArticles(article)
  const articleLd = {
    ...blogJsonLd({
      title: article.title,
      slug: article.slug,
      date: article.datePublished,
      updated: article.dateReviewed,
      excerpt: article.description,
      image: DEFAULT_OG_IMAGE,
    }, `${articlePath}/`),
    '@id': `${articleUrl}#article`,
    url: articleUrl,
    mainEntityOfPage: articleUrl,
    image: {
      '@type': 'ImageObject',
      url: canonicalUrl(DEFAULT_OG_IMAGE),
      width: 1200,
      height: 630,
    },
    articleSection: article.category,
    keywords: keywords.join(', '),
    inLanguage: 'en-US',
    isPartOf: {
      '@type': 'CollectionPage',
      '@id': collectionId,
      name: 'Mental Health Guides',
      url: canonicalUrl(BASE_PATH),
    },
    breadcrumb: { '@id': breadcrumbId },
  }
  const breadcrumbLd = breadcrumbJsonLd([
    { name: 'Guides', url: canonicalUrl('/guides') },
    { name: 'Mental Health', url: canonicalUrl(BASE_PATH) },
    { name: article.title, url: articleUrl },
  ], { id: breadcrumbId })
  const faqLd = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    '@id': `${articleUrl}#faq`,
    url: articleUrl,
    isPartOf: { '@id': `${articleUrl}#article` },
    mainEntity: article.faq.map((faq) => ({
      '@type': 'Question',
      name: faq.question,
      acceptedAnswer: {
        '@type': 'Answer',
        text: faq.answer,
      },
    })),
  }

  return (
    <article className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleLd} />
      <JsonLd schema={breadcrumbLd} />
      <JsonLd schema={faqLd} />

      <nav className="mb-6 flex flex-wrap items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/guides/" className="transition hover:text-ink">Guides</Link>
        <span aria-hidden="true">/</span>
        <Link href={`${BASE_PATH}/`} className="transition hover:text-ink">Mental Health</Link>
        <span aria-hidden="true">/</span>
        <span className="line-clamp-1 text-ink">{article.title}</span>
      </nav>

      <header className="border-b border-brand-900/15 pb-9 pt-4 sm:pb-11 sm:pt-6">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            {article.category}
          </span>
          {article.cluster && (
            <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">
              {article.cluster}
            </span>
          )}
          <span className="text-muted">{article.readingTime}</span>
        </div>
        <h1 className="mt-4 max-w-[24ch] font-display text-3xl font-bold leading-[1.08] text-ink sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>
        <div className="mt-3">
          <LastUpdatedBadge date={article.dateReviewed} label="Evidence reviewed" />
        </div>
        <p className="mt-5 max-w-3xl text-lg leading-8 text-muted">{article.deck}</p>
      </header>

      <section className="mt-6 rounded-2xl border border-amber-700/20 bg-amber-50/70 p-5" aria-labelledby="education-note">
        <h2 id="education-note" className="text-base font-bold text-ink">Educational information—not a diagnosis</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          These guides summarize diagnostic frameworks and treatment research. They cannot determine whether you or another person has a disorder. Diagnosis requires a qualified clinician, longitudinal context, and careful consideration of other explanations.
        </p>
      </section>

      <section className="mt-6 rounded-2xl border border-brand-900/10 bg-brand-50/60 p-5 sm:p-6" aria-labelledby="source-standard">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <h2 id="source-standard" className="text-lg font-bold text-ink">Source and verification standard</h2>
            <p className="mt-1 max-w-3xl text-sm leading-6 text-muted">
              Claims are linked to official guidance, government health sources, diagnostic manuals, systematic reviews, meta-analyses, randomized trials, and peer-reviewed clinical reviews. Evidence last reviewed July 13, 2026.
            </p>
          </div>
          <a href="#references" className="text-sm font-bold text-brand-700 hover:text-brand-900">Jump to {article.references.length} references ↓</a>
        </div>
      </section>

      <nav className="mt-6 rounded-2xl border border-brand-900/10 bg-white p-5 sm:p-6" aria-labelledby="on-this-page">
        <h2 id="on-this-page" className="text-lg font-bold text-ink">On this page</h2>
        <ol className="mt-3 grid gap-x-6 gap-y-2 text-sm sm:grid-cols-2">
          {article.sections.map((section) => (
            <li key={section.title}>
              <a href={`#${sectionAnchor(section.title)}`} className="font-medium text-brand-700 hover:text-brand-900 hover:underline">
                {section.title}
              </a>
            </li>
          ))}
          <li><a href="#faq" className="font-medium text-brand-700 hover:text-brand-900 hover:underline">Frequently asked questions</a></li>
          <li><a href="#references" className="font-medium text-brand-700 hover:text-brand-900 hover:underline">References</a></li>
        </ol>
      </nav>

      <section className="mt-6 rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm sm:p-7" aria-labelledby="key-points">
        <h2 id="key-points" className="text-xl font-bold tracking-tight text-ink">Key points</h2>
        <ul className="mt-4 ml-5 list-disc space-y-3">
          {article.keyPoints.map((point) => (
            <CitedPassage key={point.text} passage={point} article={article} as="li" />
          ))}
        </ul>
      </section>

      <div className="mt-7 space-y-7">
        {article.sections.map((section) => {
          const id = sectionAnchor(section.title)
          return (
            <section key={section.title} className="rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm sm:p-8" aria-labelledby={id}>
              <h2 id={id} className="scroll-mt-24 text-2xl font-semibold tracking-tight text-ink">{section.title}</h2>
              <div className="mt-4 space-y-4">
                {section.paragraphs.map((paragraph) => (
                  <CitedPassage key={paragraph.text} passage={paragraph} article={article} />
                ))}
              </div>
              {section.bullets && section.bullets.length > 0 && (
                <ul className="mt-4 ml-5 list-disc space-y-2">
                  {section.bullets.map((bullet) => (
                    <CitedPassage key={bullet.text} passage={bullet} article={article} as="li" />
                  ))}
                </ul>
              )}
            </section>
          )
        })}
      </div>

      <section className="mt-7 rounded-2xl border border-brand-900/10 bg-white p-5 shadow-sm sm:p-8" aria-labelledby="faq">
        <h2 id="faq" className="scroll-mt-24 text-2xl font-semibold tracking-tight text-ink">Frequently asked questions</h2>
        <div className="mt-5 divide-y divide-brand-900/10">
          {article.faq.map((faq) => (
            <div key={faq.question} className="py-5 first:pt-0 last:pb-0">
              <h3 className="text-lg font-semibold text-ink">{faq.question}</h3>
              <CitedPassage passage={{ text: faq.answer, refs: faq.refs }} article={article} />
            </div>
          ))}
        </div>
      </section>

      <section id="references" className="mt-7 scroll-mt-24 rounded-2xl border border-brand-900/10 bg-brand-50/40 p-5 sm:p-8" aria-labelledby="references-heading">
        <h2 id="references-heading" className="text-2xl font-semibold tracking-tight text-ink">References</h2>
        <p className="mt-2 text-sm leading-6 text-muted">
          Reference links point to the publisher, DOI, government agency, or official guideline page. A source tier describes the kind of evidence; it is not a guarantee that every conclusion is certain or applies to every person.
        </p>
        <ol className="mt-5 space-y-4">
          {article.references.map((reference, index) => (
            <li key={reference.id} id={`ref-${reference.id}`} className="scroll-mt-24 rounded-xl border border-brand-900/10 bg-white p-4 text-sm leading-6 text-muted">
              <div className="flex items-start gap-3">
                <span className="inline-flex min-w-7 justify-center rounded-full bg-brand-100 px-2 py-0.5 font-bold text-brand-900">{index + 1}</span>
                <div>
                  <a href={reference.url} target="_blank" rel="noopener noreferrer" className="font-semibold text-brand-800 hover:underline">
                    {reference.citation}
                  </a>
                  <div className="mt-2 flex flex-wrap gap-2">
                    <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2 py-0.5 text-[0.7rem] font-bold uppercase tracking-wide text-brand-800">
                      {reference.tier}
                    </span>
                    {reference.note && <span className="text-xs text-muted">{reference.note}</span>}
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ol>
      </section>

      <section className="mt-7 rounded-2xl border border-brand-900/10 bg-white p-5 sm:p-7" aria-labelledby="related-guides">
        <h2 id="related-guides" className="text-xl font-bold text-ink">Related mental health guides</h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          {related.map((candidate) => (
            <Link key={candidate.slug} href={`${BASE_PATH}/${candidate.slug}/`} className="rounded-xl border border-brand-900/10 bg-brand-50/30 p-4 transition hover:border-brand-700/30 hover:bg-white">
              <span className="text-[0.68rem] font-bold uppercase tracking-wider text-muted">{candidate.cluster ?? candidate.category}</span>
              <span className="mt-1 block font-semibold leading-6 text-brand-800">{candidate.title}</span>
            </Link>
          ))}
        </div>
      </section>

      <div className="mt-8">
        <Link href={`${BASE_PATH}/`} className="text-sm font-semibold text-brand-700 hover:text-brand-900">← Back to Mental Health Guides</Link>
      </div>
    </article>
  )
}
