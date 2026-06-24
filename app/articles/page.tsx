import type { Metadata } from 'next'
import Link from 'next/link'
import { allArticleMonographs } from '../../.content-collections/generated'
import rawPosts from '@/data/blog/posts.json'
import rawArticles from '@/data/articles/articles.json'
import {
  BLOG_STYLE_GROUPS,
  formatDate,
  inferArticleStyle,
  sortPostsNewestFirst,
  truncateText,
  type BlogPost,
} from '@/lib/blog-index'
import { buildPageMetadata, SITE_URL } from '../../src/lib/seo'
import { clampPositiveInt } from '@/lib/pagination'
import { focusAdhdArticleSummaries } from '@/lib/focus-adhd-articles'
import { getAllFocusClusterArticles } from '@/lib/focus-cluster-markdown'
import JsonLd from '@/components/seo/JsonLd'

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Archive & Educational Articles',
  description:
    'Research notes, mechanisms, safety discussions, and educational deep-dives on herbs, compounds, sleep, stress, anxiety, and focus.',
  path: '/articles',
  openGraphType: 'website',
})

export const dynamic = 'force-static'

const BLOG_PAGE_SIZE = 12
const rootFocusClusterArticles = getAllFocusClusterArticles()

type ArticleIndexRecord = {
  slug?: string
  title?: string
  description?: string
  date?: string
  updatedAt?: string | null
  tags?: string[]
  category?: string
  readingTime?: string
  evidenceGrade?: string
  evidence_grade?: string
  content?: string
  profile_status?: string
  sitemap_included?: boolean
}

type ArticleCardPost = BlogPost & {
  evidenceGrade?: string
}

function articleToPost(article: ArticleIndexRecord): ArticleCardPost {
  return {
    slug: article.slug || '',
    title: article.title || '',
    excerpt: article.description || '',
    date: article.date || '',
    updatedAt: article.updatedAt || undefined,
    tags: article.tags || [],
    categories: article.category ? [article.category] : [],
    readingTime: article.readingTime || '',
    content: article.content || '',
    profile_status: article.profile_status,
    sitemap_included: article.sitemap_included,
    evidenceGrade: article.evidenceGrade || article.evidence_grade || '',
  }
}

const contentCollectionArticles: ArticleCardPost[] = allArticleMonographs.map((article) => ({
  slug: article.slug,
  title: article.title,
  excerpt: article.description,
  date: article.lastUpdated,
  updatedAt: article.lastUpdated,
  tags: article.tags,
  categories: [article.category],
  readingTime: article.readingTime,
  content: article.content,
  evidenceGrade: article.evidenceGrade,
  profile_status: 'published',
  sitemap_included: true,
}))

const allPosts: ArticleCardPost[] = [
  ...contentCollectionArticles,
  ...focusAdhdArticleSummaries.map(articleToPost),
  ...(rawArticles as ArticleIndexRecord[]).map(articleToPost),
  ...(rawPosts as BlogPost[]),
]
  .filter((p) => p && p.slug && p.title)
  .filter((post, index, posts) => posts.findIndex((candidate) => candidate.slug === post.slug) === index)

function getPostCategory(post: BlogPost): { label: string; href: string } {
  const style = inferArticleStyle(post)
  if (post.tags?.some((tag) => ['ADHD', 'Focus', 'Supplement Evidence'].includes(tag))) {
    return { label: post.categories?.[0] || 'Focus', href: '/articles?category=nootropics' }
  }
  const group = BLOG_STYLE_GROUPS.find((g) =>
    style.toLowerCase().includes(g.slug.split('-')[0]) ||
    (g.slug === 'research-digests' && style.toLowerCase().includes('digest')) ||
    (g.slug === 'extraction-preparation' && (style.toLowerCase().includes('preparation') || style.toLowerCase().includes('extraction'))) ||
    (g.slug === 'safety-set-setting' && style.toLowerCase().includes('safety'))
  )
  return group ? { label: group.title, href: group.href } : { label: 'Research note', href: '/articles' }
}

function BlogCard({ post }: { post: ArticleCardPost }) {
  const cat = getPostCategory(post)
  const excerpt = truncateText(post.excerpt, 160)
  const href = `/articles/${post.slug}`

  return (
    <article className="library-content-card card-premium flex h-full flex-col p-4">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <Link href={cat.href} className="rounded-full border border-brand-900/10 bg-white/70 px-2 py-0.5 font-semibold text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-100">
          {cat.label}
        </Link>
        <time dateTime={post.date || ''} className="text-muted">{formatDate(post.date)}</time>
        {post.readingTime ? <span className="text-muted">{post.readingTime}</span> : null}
        {post.evidenceGrade ? (
          <span className="rounded-full border border-brand-900/10 bg-brand-50 px-2 py-0.5 font-semibold text-brand-800 dark:border-white/10 dark:bg-white/5 dark:text-brand-100">
            {post.evidenceGrade}
          </span>
        ) : null}
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink hover:text-brand-800">
        <Link href={href}>{post.title}</Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">{excerpt}</p>

      <Link href={href} className="mt-auto pt-3 text-sm font-semibold text-brand-800 hover:underline dark:text-brand-100">
        Read note →
      </Link>
    </article>
  )
}

function LatestStrip({ posts }: { posts: ArticleCardPost[] }) {
  if (!posts.length) return null
  return (
    <section className="space-y-3">
      <div className="library-section-header">
        <p className="eyebrow-label">Latest</p>
        <h2 className="compact-heading">Latest research notes.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
          Newest education-heavy pieces from the archive. Use guides when you need a practical choosing path.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-3">
        {posts.map((post) => (
          <BlogCard key={post.slug} post={post} />
        ))}
      </div>
    </section>
  )
}

function FocusAdhdRootSection() {
  if (rootFocusClusterArticles.length === 0) return null

  return (
    <section className="space-y-3">
      <div className="library-section-header">
        <p className="eyebrow-label">Focus &amp; ADHD</p>
        <h2 className="compact-heading">Focus and ADHD evidence archive.</h2>
        <p className="mt-2 max-w-3xl text-sm leading-7 text-muted">
          Background education for attention, calm focus, and ADHD-adjacent supplement context.
        </p>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rootFocusClusterArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/${article.slug}`}
            className="library-content-card card-premium block p-4"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700 dark:text-brand-200">
              Focus &amp; ADHD
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink hover:text-brand-800">
              {article.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-muted">
              {article.metaDescription}
            </p>
          </Link>
        ))}
      </div>
    </section>
  )
}

function CategoryFilterBar({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
      <Link
        href="/articles"
        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${!active ? 'border-brand-700/25 bg-brand-50 text-brand-900 dark:border-white/15 dark:bg-white/10 dark:text-brand-50' : 'border-brand-900/10 bg-white/80 text-muted hover:border-brand-700/20 dark:border-white/10 dark:bg-white/5 dark:text-brand-100'}`}
      >
        All notes
      </Link>
      {BLOG_STYLE_GROUPS.map((group) => {
        const href = `/articles?category=${group.slug}`
        const isActive = active === group.slug
        return (
          <Link
            key={group.slug}
            href={href}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${isActive ? 'border-brand-700/25 bg-brand-50 text-brand-900 dark:border-white/15 dark:bg-white/10 dark:text-brand-50' : 'border-brand-900/10 bg-white/80 text-muted hover:border-brand-700/20 dark:border-white/10 dark:bg-white/5 dark:text-brand-100'}`}
          >
            {group.title}
          </Link>
        )
      })}
    </div>
  )
}

function BlogItemListJsonLd({ posts }: { posts: ArticleCardPost[] }) {
  const itemListId = `${SITE_URL}/articles/#item-list`
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/articles/#webpage`,
        name: 'Research Archive',
        headline: 'Research archive and educational articles',
        description: 'Research notes on herbs, compounds, safety, preparation, mechanisms, and evidence maturity.',
        url: `${SITE_URL}/articles/`,
        mainEntity: { '@id': itemListId },
        isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
      },
      {
        '@type': 'ItemList',
        '@id': itemListId,
        name: 'The Hippie Scientist research archive',
        itemListElement: posts.slice(0, 200).map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}/articles/${post.slug}`,
          name: post.title,
        })),
      },
    ],
  }
  return <JsonLd schema={graph} />
}

export default async function BlogPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const sp = await searchParams
  const category = (Array.isArray(sp.category) ? sp.category[0] : sp.category) || ''
  const page = clampPositiveInt(Array.isArray(sp.page) ? sp.page[0] : sp.page, 1)

  const sorted = sortPostsNewestFirst(allPosts)

  let filtered = sorted
  if (category) {
    filtered = sorted.filter((post) => {
      const corpus = `${post.title} ${post.excerpt ?? ''} ${post.content ?? ''}`.toLowerCase()
      const group = BLOG_STYLE_GROUPS.find((candidate) => candidate.slug === category)
      if (!group) return true
      if (category === 'research-digests') return corpus.includes('research digest')
      if (category === 'pharmacology-basics') return corpus.includes('pharmacology')
      if (category === 'traditional-use') return corpus.includes('traditional')
      if (category === 'extraction-preparation') return corpus.includes('extraction') || corpus.includes('preparation') || corpus.includes('formulation')
      if (category === 'safety-set-setting') return corpus.includes('safety') || corpus.includes('set setting')
      if (category === 'nootropics') return corpus.includes('nootropic') || corpus.includes('cognitive') || corpus.includes('brain') || corpus.includes('focus')
      if (category === 'field-notes') return corpus.includes('field note') || corpus.includes('bioassay')
      return true
    })
  }

  const latestThree = filtered.slice(0, 3)
  const rest = filtered.slice(3)

  const totalForGrid = rest.length
  const totalPages = Math.max(1, Math.ceil(totalForGrid / BLOG_PAGE_SIZE))
  const currentPage = Math.min(Math.max(1, page), totalPages)
  const start = (currentPage - 1) * BLOG_PAGE_SIZE
  const pageItems = rest.slice(start, start + BLOG_PAGE_SIZE)

  const count = filtered.length

  function buildBlogHref(nextPage: number, activeCategory: string) {
    const params = new URLSearchParams()
    if (activeCategory) params.set('category', activeCategory)
    if (nextPage > 1) params.set('page', String(nextPage))
    const qs = params.toString()
    return qs ? `/articles?${qs}` : '/articles'
  }

  return (
    <div className="library-index-page mx-auto max-w-6xl space-y-8 px-4 py-6 sm:px-6 sm:py-10 lg:px-8">
      <BlogItemListJsonLd posts={filtered} />

      <section className="hero-shell rounded-[1.25rem] border border-brand-900/10 p-5 shadow-sm sm:rounded-[2rem] sm:p-8 dark:border-white/10">
        <p className="eyebrow-label">Research archive</p>
        <h1 className="mt-3 max-w-4xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">
          Educational articles, research notes, and deep-dives.
        </h1>
        <p className="mt-4 max-w-3xl text-sm leading-7 text-muted sm:text-base">
          This is the archive for mechanisms, safety discussions, research context, and individual deep-dives. For practical supplement choices, start with the guide library.
        </p>
        <p className="mt-2 text-sm font-semibold text-muted">{count} archive items available</p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link
            href="/guides"
            className="inline-flex min-h-11 items-center rounded-full bg-brand-950 px-5 py-2.5 text-sm font-bold text-white shadow-sm hover:bg-brand-900 dark:bg-brand-200 dark:text-brand-950 dark:hover:bg-brand-100"
          >
            Use practical guides
          </Link>
          <Link
            href="/goals"
            className="inline-flex min-h-11 items-center rounded-full border border-brand-900/15 bg-white/80 px-5 py-2.5 text-sm font-bold text-brand-900 shadow-sm hover:bg-white dark:border-white/15 dark:bg-white/5 dark:text-brand-50 dark:hover:bg-white/10"
          >
            Browse goals
          </Link>
        </div>
      </section>

      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-muted">Archive filters</p>
        <CategoryFilterBar active={category} />
      </div>

      {!category && latestThree.length > 0 ? <LatestStrip posts={latestThree} /> : null}

      {!category ? <FocusAdhdRootSection /> : null}

      <section className="space-y-4">
        <div className="flex items-end justify-between gap-4">
          <div className="library-section-header">
            <p className="eyebrow-label">{category ? 'Filtered archive' : 'Archive'}</p>
            <h2 className="compact-heading">{category ? 'Matching research notes.' : 'All research notes.'}</h2>
          </div>
          <span className="hidden text-xs font-bold uppercase tracking-[0.12em] text-muted sm:inline">
            {totalForGrid} items
          </span>
        </div>

        {pageItems.length === 0 ? (
          <div className="card-premium p-6 text-sm text-muted">
            No archive items in this filter. <Link href="/articles" className="font-semibold text-brand-800 dark:text-brand-100">View all</Link>.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {totalPages > 1 && (
          <nav className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-brand-900/10 bg-white/80 p-3 text-sm text-muted dark:border-white/10 dark:bg-white/5" aria-label="Article pagination">
            <div>
              Page {currentPage} of {totalPages} — showing {start + 1}–{Math.min(start + BLOG_PAGE_SIZE, totalForGrid)} of {totalForGrid}
            </div>
            <div className="flex gap-3">
              {currentPage > 1 ? (
                <Link rel="prev" href={buildBlogHref(currentPage - 1, category)} className="font-semibold text-brand-800 dark:text-brand-100">
                  ← Previous
                </Link>
              ) : null}
              {currentPage < totalPages ? (
                <Link rel="next" href={buildBlogHref(currentPage + 1, category)} className="font-semibold text-brand-800 dark:text-brand-100">
                  Next →
                </Link>
              ) : null}
            </div>
          </nav>
        )}
      </section>

      <nav aria-label="All articles index" className="sr-only">
        <ul>
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link href={`/articles/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
