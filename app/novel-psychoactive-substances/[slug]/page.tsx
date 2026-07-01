import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { allNovelPsychoactiveSubstancePages } from '../../../.content-collections/generated'

import ArticleMdx from '@/components/articles/ArticleMdx'
import Breadcrumbs from '@/components/ui/Breadcrumbs'
import JsonLd from '@/components/seo/JsonLd'
import { SITE_URL, compactMetaTitle } from '../../../src/lib/seo'

type PageProps = {
  params: Promise<{ slug: string }>
}

const articlePages = allNovelPsychoactiveSubstancePages.filter((page) => page.slug !== 'index')

export function generateStaticParams() {
  return articlePages.map((page) => ({ slug: page.slug }))
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params
  const page = articlePages.find((item) => item.slug === slug)
  if (!page) return { title: 'Page Not Found', robots: { index: false, follow: true } }

  const metaTitle = (page as { metaTitle?: string }).metaTitle ?? compactMetaTitle(page.title)

  return {
    title: metaTitle,
    description: page.metaDescription,
    keywords: page.keywords,
    alternates: { canonical: `${SITE_URL}/novel-psychoactive-substances/${page.slug}/` },
    openGraph: {
      title: metaTitle,
      description: page.metaDescription,
      type: 'article',
      url: `${SITE_URL}/novel-psychoactive-substances/${page.slug}/`,
      images: ['/og-default.jpg'],
    },
  }
}

export default async function NovelPsychoactiveSubstanceArticlePage({ params }: PageProps) {
  const { slug } = await params
  const page = articlePages.find((item) => item.slug === slug)
  if (!page) notFound()

  const relatedPages = page.relatedSlugs
    .map((relatedSlug) => articlePages.find((item) => item.slug === relatedSlug))
    .filter((item): item is (typeof articlePages)[number] => Boolean(item))

  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: page.title,
    description: page.metaDescription,
    dateModified: page.lastUpdated,
    datePublished: page.lastUpdated,
    mainEntityOfPage: `${SITE_URL}/novel-psychoactive-substances/${page.slug}/`,
    keywords: page.keywords,
    articleSection: 'Novel Psychoactive Substances',
    additionalProperty: page.evidenceGrade
      ? [{ '@type': 'PropertyValue', name: 'evidenceGrade', value: page.evidenceGrade }]
      : undefined,
  }

  return (
    <article className="mx-auto max-w-5xl px-4 pb-20 pt-6 sm:px-6 lg:px-8">
      <JsonLd schema={articleSchema} />

      <Breadcrumbs
        items={[
          { href: '/', label: 'Home' },
          { href: '/novel-psychoactive-substances', label: 'Novel Psychoactive Substances' },
          { label: page.title },
        ]}
      />

      <header className="mt-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-red-700/20 bg-red-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-red-900">
            Harm reduction
          </span>
          {page.evidenceGrade ? (
            <span className="rounded-full border border-brand-900/10 bg-white px-2.5 py-0.5 font-semibold text-muted">
              Evidence: {page.evidenceGrade}
            </span>
          ) : null}
          <time dateTime={page.lastUpdated} className="text-muted">
            Updated {page.lastUpdated}
          </time>
        </div>

        <h1 className="mt-4 font-display text-3xl font-bold leading-tight tracking-tight text-ink sm:text-4xl lg:text-5xl">
          {page.title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
          {page.metaDescription}
        </p>
      </header>

      <div className="mt-6 rounded-[1rem] border border-brand-900/10 bg-white/90 p-6 shadow-sm sm:p-8">
        <div className="content-prose max-w-none [&>*]:max-w-reading [&_a]:font-semibold [&_a]:text-brand-800 [&_a:hover]:underline [&_blockquote]:max-w-reading [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-red-700/40 [&_blockquote]:bg-red-50/60 [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_code]:break-all [&_h2]:mt-10 [&_h2]:text-2xl [&_h3]:mt-7 [&_h3]:text-xl [&_ol]:list-decimal [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-brand-900/10 [&_td]:py-3 [&_td]:pr-4 [&_td]:align-top [&_td]:break-words [&_th]:border-b [&_th]:border-brand-900/10 [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_ul]:list-disc">
          <ArticleMdx code={page.body} />
        </div>
      </div>

      {relatedPages.length > 0 ? (
        <section className="mt-8 rounded-[0.9rem] border border-brand-900/10 bg-white/90 p-5 shadow-sm">
          <h2 className="text-lg font-bold text-ink">Related NPS Articles</h2>
          <div className="mt-4 grid gap-3 sm:grid-cols-2">
            {relatedPages.map((relatedPage) => (
              <Link
                key={relatedPage.slug}
                href={relatedPage.url}
                className="rounded-[0.75rem] border border-brand-900/10 bg-brand-50/30 p-4 text-sm font-semibold leading-6 text-brand-800 hover:bg-brand-50"
              >
                {relatedPage.title}
              </Link>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="mt-8 rounded-[0.9rem] border border-amber-700/20 bg-amber-50/80 p-4 text-sm leading-6 text-[#5b4a2c]">
        Educational disclaimer: this page is for evidence review and harm-reduction context only. It is not medical advice, legal advice, sourcing guidance, dosing guidance, or a recommendation to use any novel psychoactive substance.
        <div className="mt-3 flex flex-wrap gap-4 font-semibold text-brand-800">
          <Link href="/novel-psychoactive-substances/" className="hover:underline">NPS section</Link>
          <Link href="/safety-checker/" className="hover:underline">Safety checker</Link>
        </div>
      </footer>
    </article>
  )
}
