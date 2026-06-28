import Link from 'next/link'
import Image from 'next/image'
import { notFound } from 'next/navigation'
import { allArticleMonographs } from '../../../.content-collections/generated'
import rawArticles from '../../../data/articles/articles.json'
import BlogPostPage, {
  generateMetadata as generateBlogMetadata,
  generateStaticParams as generateBlogStaticParams,
} from '@/components/blog/BlogPostPage'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd, faqPageJsonLd, SITE_URL, compactMetaTitle } from '../../../src/lib/seo'
import { formatDate } from '@/lib/blog-index'
import LastUpdatedBadge from '../../../src/components/editorial/LastUpdatedBadge'
import ResponsiveTable from '@/components/ui/ResponsiveTable'
import ArticleMdx from '@/components/articles/ArticleMdx'
import TableOfContents from '@/components/articles/TableOfContents'
import type { Heading } from '@/components/articles'

export type ArticleReference = {
  title: string
  authors: string
  year: string
  pmid: string
  url: string
}

export type ArticleFaq = {
  question: string
  answer: string
}

export type Article = {
  slug: string
  title: string
  description: string
  date: string
  updatedAt: string | null
  author: string
  keywords: string[]
  featuredImage: string
  category?: string
  evidence_grade?: string
  herb?: string
  scientific_name?: string
  tags: string[]
  readingTime: string
  content: string
  references: ArticleReference[]
  faqs?: ArticleFaq[]
  profile_status: string
  sitemap_included?: boolean
  ai_assisted: boolean
}

const allArticles = rawArticles as Article[]
const mdxArticles = allArticleMonographs

type ArticleRouteParams = Promise<{ slug: string }>

export function generateStaticParams() {
  const seen = new Set<string>()
  return [
    ...mdxArticles.map((a) => ({ slug: a.slug })),
    ...allArticles.map((a) => ({ slug: a.slug })),
    ...generateBlogStaticParams(),
  ].filter((param) => {
    if (!param.slug || seen.has(param.slug)) return false
    seen.add(param.slug)
    return true
  })
}

export async function generateMetadata({ params }: { params: ArticleRouteParams }) {
  const { slug } = await params
  const mdxArticle = mdxArticles.find((a) => a.slug === slug)
  if (mdxArticle) {
    const rawTitle = (mdxArticle as any).seoTitle || (mdxArticle as any).metaTitle || mdxArticle.title
    const description = (mdxArticle as any).seoDescription || (mdxArticle as any).metaDescription || mdxArticle.description
    return buildPageMetadata({
      title: compactMetaTitle(rawTitle),
      description,
      path: `/articles/${slug}/`,
      openGraphType: 'article',
    })
  }

  const article = allArticles.find((a) => a.slug === slug)
  if (!article) return generateBlogMetadata({ params: Promise.resolve({ slug }) })

  const rawTitle = (article as any).seoTitle || (article as any).metaTitle || article.title
  const description = (article as any).seoDescription || (article as any).metaDescription || article.description

  return buildPageMetadata({
    title: compactMetaTitle(rawTitle),
    description,
    path: `/articles/${slug}/`,
    openGraphType: 'article',
  })
}

function MdxArticlePage({ article }: { article: (typeof mdxArticles)[number] }) {
  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Articles', url: `${SITE_URL}/articles/` },
    { name: article.title, url: `${SITE_URL}/articles/${article.slug}/` },
  ])

  const articleLd = blogJsonLd({
    title: article.title,
    slug: article.slug,
    date: article.date || article.lastUpdated,
    updated: article.lastUpdated,
    excerpt: article.description,
  }, `/articles/${article.slug}`)
  const enrichedArticleLd = {
    ...articleLd,
    keywords: article.tags,
    articleSection: article.category,
    additionalProperty: [
      { '@type': 'PropertyValue', name: 'evidenceGrade', value: article.evidenceGrade },
    ],
    citation: article.references.map((ref: ArticleReference) => ({
      '@type': 'ScholarlyArticle',
      headline: ref.title,
      author: ref.authors,
      datePublished: ref.year,
      identifier: ref.pmid ? `PMID:${ref.pmid}` : undefined,
      url: ref.url || (ref.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/` : undefined),
    })),
  }

  return (
    <article className="mx-auto max-w-5xl px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(enrichedArticleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />

      <nav className="mb-6 flex items-center gap-2 text-sm text-muted" aria-label="Breadcrumb">
        <Link href="/articles/" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="line-clamp-1 text-ink">{article.title}</span>
      </nav>

      <header className="hero-shell rounded-[1rem] border border-brand-900/10 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            {article.category}
          </span>
          <span className="rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-2.5 py-0.5 font-semibold text-muted">
            Evidence: {article.evidenceGrade}
          </span>
          <time dateTime={article.lastUpdated} className="text-muted">
            Updated {formatDate(article.lastUpdated)}
          </time>
          <span className="text-muted">·</span>
          <span className="text-muted">{article.readingTime}</span>
        </div>

        <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.12] tracking-normal text-ink sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        <p className="mt-4 max-w-3xl text-base leading-7 text-[#46574d]">
          {article.description}
        </p>

        {article.tags.length > 0 ? (
          <div className="mt-5 flex flex-wrap gap-2">
            {article.tags.map((tag) => (
              <span key={tag} className="chip-readable capitalize">
                {tag}
              </span>
            ))}
          </div>
        ) : null}
      </header>

      <div className="mt-6 rounded-[1rem] border border-brand-900/10 bg-[var(--surface-card)] p-6 shadow-sm sm:p-8">
        <div className="content-prose max-w-none [&>*]:max-w-reading [&_blockquote]:max-w-reading [&_blockquote]:rounded-r-lg [&_blockquote]:border-l-4 [&_blockquote]:border-brand-700/40 [&_blockquote]:bg-brand-50/60 [&_blockquote]:py-3 [&_blockquote]:pl-5 [&_blockquote]:pr-4 [&_h2]:mt-10 [&_h2]:text-2xl [&_h3]:mt-7 [&_h3]:text-xl [&_ol]:list-decimal [&_table]:w-full [&_table]:text-sm [&_td]:border-t [&_td]:border-brand-900/10 [&_td]:py-3 [&_td]:pr-4 [&_th]:border-b [&_th]:border-brand-900/10 [&_th]:pb-2 [&_th]:pr-4 [&_th]:text-left [&_ul]:list-disc">
          <ArticleMdx code={article.body} />
        </div>
      </div>
      <ReferencesTable refs={article.references} />

      <footer className="mt-8 rounded-[0.9rem] border border-amber-700/20 bg-amber-50/80 p-4 text-sm leading-6 text-amber-900">
        Educational disclaimer: this monograph is for research literacy and harm-reduction context only. It is not medical advice, diagnosis, or a recommendation to use any substance. Talk with a licensed clinician about personal risks, medications, dependence, withdrawal, or urgent symptoms.
        <div className="mt-3 flex flex-wrap gap-4 font-semibold text-brand-800">
          <Link href="/articles/" className="hover:underline">All articles</Link>
          <Link href="/safety-checker/" className="hover:underline">Safety checker</Link>
        </div>
      </footer>
    </article>
  )
}

// ─── Markdown body renderer ──────────────────────────────────────────────────

type Block =
  | { type: 'h2'; text: string }
  | { type: 'h3'; text: string }
  | { type: 'h4'; text: string }
  | { type: 'blockquote'; text: string }
  | { type: 'hr' }
  | { type: 'ul'; items: string[] }
  | { type: 'table'; headers: string[]; rows: string[][] }
  | { type: 'p'; text: string }

function parseBlocks(raw: string): Block[] {
  const lines = raw.split('\n').map((l) => l.trim()).filter((l) => l !== '')
  const blocks: Block[] = []
  let i = 0

  while (i < lines.length) {
    const line = lines[i]

    if (line.startsWith('# ')) { i++; continue }
    if (line.startsWith('#### ')) { blocks.push({ type: 'h4', text: line.slice(5) }); i++; continue }
    if (line.startsWith('### ')) { blocks.push({ type: 'h3', text: line.slice(4) }); i++; continue }
    if (line.startsWith('## ')) { blocks.push({ type: 'h2', text: line.slice(3) }); i++; continue }
    if (line.startsWith('> ')) { blocks.push({ type: 'blockquote', text: line.slice(2) }); i++; continue }
    if (line === '---') { blocks.push({ type: 'hr' }); i++; continue }

    if (
      line.startsWith('|') &&
      line.endsWith('|') &&
      i + 1 < lines.length &&
      /^\|?\s*:?-{3,}:?\s*(\|\s*:?-{3,}:?\s*)+\|?$/.test(lines[i + 1])
    ) {
      const splitRow = (value: string) =>
        value
          .replace(/^\|/, '')
          .replace(/\|$/, '')
          .split('|')
          .map(cell => cell.trim())

      const headers = splitRow(line)
      const rows: string[][] = []
      i += 2
      while (i < lines.length && lines[i].startsWith('|') && lines[i].endsWith('|')) {
        rows.push(splitRow(lines[i]))
        i++
      }
      blocks.push({ type: 'table', headers, rows })
      continue
    }

    if (line.startsWith('- ') || line.startsWith('* ')) {
      const items: string[] = []
      while (i < lines.length && (lines[i].startsWith('- ') || lines[i].startsWith('* '))) {
        items.push(lines[i].slice(2))
        i++
      }
      blocks.push({ type: 'ul', items })
      continue
    }

    blocks.push({ type: 'p', text: line })
    i++
  }

  return blocks
}

function inlineFormat(text: string): string {
  return text
    .replace(/\[([^\]]+)]\(([^)]+)\)/g, (_match, label: string, href: string) => {
      const isExternal = /^https?:\/\//i.test(href)
      const attrs = isExternal ? ' target="_blank" rel="noopener noreferrer"' : ''
      return `<a href="${href}"${attrs} class="font-semibold text-brand-700 hover:text-brand-800 hover:underline">${label}</a>`
    })
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*(.+?)\*/g, '<em>$1</em>')
    .replace(/_(.+?)_/g, '<em>$1</em>')
    .replace(/`(.+?)`/g, '<code class="rounded bg-brand-50 px-1 py-0.5 font-mono text-sm text-brand-800">$1</code>')
}

function slugifyHeading(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

function buildHeadingIds(blocks: Block[]): Map<number, string> {
  const seen = new Map<string, number>()
  const ids = new Map<number, string>()

  blocks.forEach((block, index) => {
    if (block.type !== 'h2' && block.type !== 'h3') return

    const base = slugifyHeading(block.text) || 'section'
    const count = (seen.get(base) ?? 0) + 1
    seen.set(base, count)
    ids.set(index, count === 1 ? base : `${base}-${count}`)
  })

  return ids
}

function articleHeadings(content: string): Heading[] {
  const blocks = parseBlocks(content)
  const headingIds = buildHeadingIds(blocks)

  return blocks.flatMap((block, index) => {
    if (block.type !== 'h2' && block.type !== 'h3') return []
    return [{
      id: headingIds.get(index) ?? (slugifyHeading(block.text) || 'section'),
      text: block.text,
      level: block.type === 'h2' ? 2 : 3,
    }]
  })
}

function ArticleBody({ content }: { content: string }) {
  const blocks = parseBlocks(content)
  const headingIds = buildHeadingIds(blocks)

  return (
    <div className="space-y-4">
      {blocks.map((block, i) => {
        if (block.type === 'h2') {
          return (
            <h2
              key={i}
              id={headingIds.get(i)}
              className="mt-10 mb-2 max-w-2xl text-2xl font-semibold tracking-tight text-ink first:mt-0"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        }
        if (block.type === 'h3') {
          return (
            <h3
              key={i}
              id={headingIds.get(i)}
              className="mt-6 mb-1 text-xl font-semibold tracking-tight text-ink"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        }
        if (block.type === 'h4') {
          return (
            <h4
              key={i}
              className="mt-4 mb-1 text-base font-semibold text-ink"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        }
        if (block.type === 'blockquote') {
          return (
            <blockquote
              key={i}
              className="my-4 border-l-4 border-brand-700/40 bg-brand-50/60 py-3 pl-5 pr-4 text-sm leading-7 text-brand-900/80 italic rounded-r-lg"
              dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
            />
          )
        }
        if (block.type === 'hr') {
          return <hr key={i} className="my-6 border-brand-900/10" />
        }
        if (block.type === 'ul') {
          return (
            <ul key={i} className="ml-5 space-y-1.5 list-disc">
              {block.items.map((item, j) => (
                <li
                  key={j}
                  className="text-[1.01rem] leading-7 text-muted"
                  dangerouslySetInnerHTML={{ __html: inlineFormat(item) }}
                />
              ))}
            </ul>
          )
        }
        if (block.type === 'table') {
          return (
            <div key={i} className="my-6">
              <ResponsiveTable label="Article comparison table" className="article-table">
                <table className="min-w-[680px] w-full text-sm">
                  <thead>
                    <tr className="border-b border-brand-900/10">
                      {block.headers.map((header, j) => (
                        <th
                          key={j}
                          className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted"
                          dangerouslySetInnerHTML={{ __html: inlineFormat(header) }}
                        />
                      ))}
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-brand-900/5">
                    {block.rows.map((row, rowIndex) => (
                      <tr key={rowIndex} className="align-top">
                        {row.map((cell, cellIndex) => (
                          <td
                            key={cellIndex}
                            className="py-3 pr-4 leading-6 text-muted"
                            dangerouslySetInnerHTML={{ __html: inlineFormat(cell) }}
                          />
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </ResponsiveTable>
            </div>
          )
        }
        return (
          <p
            key={i}
            className="text-[1.01rem] leading-[1.85] text-muted"
            dangerouslySetInnerHTML={{ __html: inlineFormat(block.text) }}
          />
        )
      })}
    </div>
  )
}

// ─── References table ────────────────────────────────────────────────────────

function ReferencesTable({ refs }: { refs: ArticleReference[] }) {
  if (!refs.length) return null

  return (
    <section className="mt-10 rounded-[1rem] border border-brand-900/10 bg-[var(--surface-card)] p-5 shadow-sm sm:p-6">
      <h2 className="mb-4 text-lg font-semibold tracking-tight text-ink">References</h2>
      <ResponsiveTable label="Article references table" className="article-table">
        <table className="min-w-[760px] w-full text-sm">
          <caption className="sr-only">References cited in this article</caption>
          <thead>
            <tr className="border-b border-brand-900/10">
              <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">#</th>
              <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Study</th>
              <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Authors</th>
              <th className="pb-2 pr-4 text-left text-xs font-bold uppercase tracking-wider text-muted">Year</th>
              <th className="pb-2 text-left text-xs font-bold uppercase tracking-wider text-muted">Link</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-brand-900/5">
            {refs.map((ref, i) => (
              <tr key={i} className="align-top">
                <td className="py-3 pr-4 text-muted">{i + 1}</td>
                <td className="py-3 pr-4 leading-6 text-ink">{ref.title}</td>
                <td className="py-3 pr-4 text-muted">{ref.authors}</td>
                <td className="py-3 pr-4 text-muted">{ref.year}</td>
                <td className="py-3">
                  {ref.url ? (
                    <a
                      href={ref.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      {ref.pmid ? `PMID ${ref.pmid}` : 'View'}
                    </a>
                  ) : ref.pmid ? (
                    <a
                      href={`https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="font-semibold text-brand-700 hover:text-brand-800 hover:underline"
                    >
                      PMID {ref.pmid}
                    </a>
                  ) : (
                    <span className="text-muted">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </ResponsiveTable>
    </section>
  )
}

// ─── Page ────────────────────────────────────────────────────────────────────

export default async function ArticlePage({ params }: { params: ArticleRouteParams }) {
  const { slug } = await params
  const mdxArticle = mdxArticles.find((a) => a.slug === slug)
  if (mdxArticle) return <MdxArticlePage article={mdxArticle} />

  const article = allArticles.find((a) => a.slug === slug)
  if (!article) return <BlogPostPage params={Promise.resolve({ slug })} />
  if (!article.date) return notFound()

  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Articles', url: 'https://thehippiescientist.net/articles' },
    { name: article.title, url: `https://thehippiescientist.net/articles/${article.slug}` },
  ])

  const articleLd = blogJsonLd({
    title: article.title,
    slug: article.slug,
    date: article.date,
    updated: article.updatedAt || article.date || undefined,
    excerpt: article.description,
  }, `/articles/${article.slug}`)
  const enrichedArticleLd = {
    ...articleLd,
    keywords: article.keywords,
    articleSection: article.category || undefined,
    about: [
      ...article.tags.map(tag => ({ '@type': 'Thing', name: tag })),
      article.herb ? { '@type': 'Thing', name: article.herb } : null,
      article.scientific_name ? { '@type': 'Thing', name: article.scientific_name } : null,
    ].filter(Boolean),
    additionalProperty: [
      article.evidence_grade
        ? { '@type': 'PropertyValue', name: 'evidence_grade', value: article.evidence_grade }
        : null,
      article.herb ? { '@type': 'PropertyValue', name: 'herb', value: article.herb } : null,
      article.scientific_name
        ? { '@type': 'PropertyValue', name: 'scientific_name', value: article.scientific_name }
        : null,
    ].filter(Boolean),
    citation: article.references.map(ref => ({
      '@type': 'ScholarlyArticle',
      headline: ref.title,
      author: ref.authors,
      datePublished: ref.year,
      identifier: ref.pmid ? `PMID:${ref.pmid}` : undefined,
      url: ref.url || (ref.pmid ? `https://pubmed.ncbi.nlm.nih.gov/${ref.pmid}/` : undefined),
    })),
  }
  const faqLd = article.faqs?.length
    ? faqPageJsonLd({
        pagePath: `/articles/${article.slug}`,
        questions: article.faqs,
      })
    : null
  const headings = articleHeadings(article.content)

  return (
    <article className="mx-auto max-w-5xl space-y-0 px-4 pb-28 pt-6 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(enrichedArticleLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(pageBreadcrumb) }}
      />
      {faqLd && (
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(faqLd) }}
        />
      )}

      {/* Breadcrumb */}
      <nav className="mb-6 flex items-center gap-2 text-sm text-muted">
        <Link href="/articles/" className="transition hover:text-ink">Articles</Link>
        <span>/</span>
        <span className="text-ink line-clamp-1">{article.title}</span>
      </nav>

      {/* Hero */}
      <section className="hero-shell rounded-[1.5rem] border border-brand-900/10 p-6 shadow-sm sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-2 text-xs">
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2.5 py-0.5 font-bold uppercase tracking-wider text-brand-800">
            Deep Dive
          </span>
          {article.tags.slice(0, 3).map((tag) => (
            <span key={tag} className="rounded-full border border-brand-900/10 bg-[var(--surface-card)] px-2.5 py-0.5 font-semibold text-muted capitalize">
              {tag}
            </span>
          ))}
          <span className="text-muted">{formatDate(article.date ?? undefined)}</span>
          <span className="text-muted">·</span>
          <span className="text-muted">{article.readingTime}</span>
        </div>

        <h1 className="mt-4 font-display text-[2rem] font-bold leading-[1.12] tracking-normal text-ink sm:text-4xl lg:text-5xl">
          {article.title}
        </h1>

        <p className="mt-2 text-sm text-muted">
          By{' '}
          <Link href="/about/" rel="author" className="font-medium text-ink hover:underline">
            {article.author}
          </Link>
        </p>
        <div className="mt-3">
          <LastUpdatedBadge date={article.updatedAt || article.date} label="Last updated" />
        </div>

        {article.description && (
          <p className="mt-4 max-w-3xl text-base leading-7 text-muted">
            {article.description}
          </p>
        )}

        {article.featuredImage && (
          <div className="mt-6 overflow-hidden rounded-xl border border-brand-900/10">
            <Image
              src={article.featuredImage}
              alt={article.title}
              width={1200}
              height={630}
              className="w-full object-cover"
              priority
            />
          </div>
        )}
      </section>

      {headings.length > 0 && (
        <div className="mt-6 lg:hidden">
          <TableOfContents headings={headings} />
        </div>
      )}

      {/* Body + sidebar */}
      <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1fr)_240px]">
        <section className="rounded-[1rem] border border-brand-900/10 bg-[var(--surface-card)] p-6 shadow-sm sm:p-8">
          <ArticleBody content={article.content} />
          <ReferencesTable refs={article.references} />
        </section>

        {/* Sidebar */}
        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {headings.length > 0 && (
            <div className="hidden rounded-[1rem] border border-brand-900/10 bg-[var(--surface-card)] p-4 shadow-sm lg:block">
              <TableOfContents headings={headings} />
            </div>
          )}

          {article.references.length > 0 && (
            <div className="rounded-[1rem] border border-brand-900/10 bg-[var(--surface-card)] p-4 shadow-sm">
              <p className="text-[10px] font-bold uppercase tracking-wider text-muted">
                {article.references.length} reference{article.references.length !== 1 ? 's' : ''}
              </p>
              <ul className="mt-3 space-y-2">
                {article.references.map((ref, i) => (
                  <li key={i} className="text-xs leading-5">
                    <span className="mr-1.5 font-bold text-brand-700">{i + 1}.</span>
                    {ref.url ? (
                      <a
                        href={ref.url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-muted hover:text-brand-700 hover:underline"
                      >
                        {ref.title.length > 60 ? `${ref.title.slice(0, 60)}…` : ref.title}
                      </a>
                    ) : (
                      <span className="text-muted">{ref.title.length > 60 ? `${ref.title.slice(0, 60)}…` : ref.title}</span>
                    )}
                    {ref.year && <span className="ml-1 text-muted">({ref.year})</span>}
                  </li>
                ))}
              </ul>
            </div>
          )}

          <div className="rounded-[1rem] border border-brand-900/10 bg-[var(--surface-card)] p-4 shadow-sm">
            <p className="text-[10px] font-bold uppercase tracking-wider text-muted">Explore more</p>
            <div className="mt-3 space-y-2">
              <Link href="/safety-checker/" className="block text-sm font-medium text-brand-700 hover:text-brand-800">
                Safety Checker →
              </Link>
              <Link href="/goals/" className="block text-sm font-medium text-brand-700 hover:text-brand-800">
                Evidence Reviews →
              </Link>
              <Link href="/herbs/" className="block text-sm font-medium text-brand-700 hover:text-brand-800">
                Herb Profiles →
              </Link>
              <Link href="/articles/" className="block text-sm font-medium text-brand-700 hover:text-brand-800">
                Articles →
              </Link>
            </div>
          </div>
        </aside>
      </div>

      {/* Back link */}
      <div className="mt-8">
        <Link href="/articles/" className="text-sm font-semibold text-brand-700 hover:text-brand-800">
          ← Back to Articles
        </Link>
        <Link href="/safety-checker/" className="ml-4 text-sm font-semibold text-brand-700 hover:text-brand-800">
          Safety Checker →
        </Link>
      </div>
    </article>
  )
}
