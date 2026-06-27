import type { Metadata } from 'next'
import Link from 'next/link'

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
import { buildPageMetadata, SITE_URL } from '@/lib/seo'
import { clampPositiveInt } from '@/lib/pagination'
import { focusAdhdArticleSummaries } from '@/lib/focus-adhd-articles'
import { getAllFocusClusterArticles } from '@/lib/focus-cluster-markdown'

export const metadata: Metadata = buildPageMetadata({
  title: 'Articles',
  description: 'Evidence-first articles on herbs, compounds, supplement safety, focus, sleep, and practical decision-making.',
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
  content?: string
  profile_status?: string
  sitemap_included?: boolean
}

function articleToPost(article: ArticleIndexRecord): BlogPost {
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
  }
}

const allPosts: BlogPost[] = [
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
  return group ? { label: group.title, href: group.href } : { label: 'Editorial note', href: '/articles' }
}

function BlogCard({ post }: { post: BlogPost }) {
  const cat = getPostCategory(post)
  const excerpt = truncateText(post.excerpt, 160)
  const href = `/articles/${post.slug}`

  return (
    <article className="flex h-full flex-col rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm transition hover:border-brand-700/20">
      <div className="flex flex-wrap items-center gap-x-2 gap-y-1 text-xs">
        <Link href={cat.href} className="rounded-full border border-brand-900/10 bg-white px-2 py-0.5 font-semibold text-brand-800">
          {cat.label}
        </Link>
        <time dateTime={post.date || ''} className="text-[#5f6f66]">{formatDate(post.date)}</time>
        {post.readingTime ? <span className="text-[#5f6f66]">{post.readingTime}</span> : null}
        <span className="text-[#5f6f66]">· The Hippie Scientist</span>
      </div>

      <h3 className="mt-3 text-lg font-semibold tracking-tight text-ink hover:text-brand-800">
        <Link href={href}>{post.title}</Link>
      </h3>

      <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#46574d]">{excerpt}</p>

      <Link href={href} className="mt-auto pt-3 text-sm font-semibold text-brand-800 hover:underline">
        Read article →
      </Link>
    </article>
  )
}

function LatestStrip({ posts }: { posts: BlogPost[] }) {
  if (!posts.length) return null
  return (
    <section className="space-y-3">
      <div className="flex items-end justify-between">
        <div>
          <p className="eyebrow-label">Latest</p>
          <h2 className="compact-heading">The three most recent articles.</h2>
        </div>
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
      <div>
        <p className="eyebrow-label">Focus &amp; ADHD</p>
        <h2 className="compact-heading">Supplement guides for attention, calm focus, and ADHD-adjacent support.</h2>
      </div>
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        {rootFocusClusterArticles.map((article) => (
          <Link
            key={article.slug}
            href={`/${article.slug}`}
            className="rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-4 shadow-sm transition hover:border-brand-700/20"
          >
            <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-brand-700">
              Focus &amp; ADHD
            </p>
            <h3 className="mt-2 text-lg font-semibold tracking-tight text-ink hover:text-brand-800">
              {article.title}
            </h3>
            <p className="mt-2 line-clamp-3 text-sm leading-6 text-[#46574d]">
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
        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${!active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
      >
        All articles
      </Link>
      {BLOG_STYLE_GROUPS.map((g) => {
        const href = `/articles?category=${g.slug}`
        const isActive = active === g.slug
        return (
          <Link
            key={g.slug}
            href={href}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${isActive ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
          >
            {g.title}
          </Link>
        )
      })}
    </div>
  )
}

function BlogItemListJsonLd({ posts }: { posts: BlogPost[] }) {
  const itemListId = `${SITE_URL}/articles/#item-list`
  const graph = {
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'CollectionPage',
        '@id': `${SITE_URL}/articles/#webpage`,
        name: 'Articles',
        headline: 'Guides & articles',
        description: 'Research notes on herbs, compounds, safety, preparation, mechanisms, and evidence maturity.',
        url: `${SITE_URL}/articles/`,
        mainEntity: { '@id': itemListId },
        isPartOf: { '@type': 'WebSite', name: 'The Hippie Scientist', url: SITE_URL },
      },
      {
        '@type': 'ItemList',
        '@id': itemListId,
        name: 'The Hippie Scientist articles',
        itemListElement: posts.slice(0, 200).map((post, index) => ({
          '@type': 'ListItem',
          position: index + 1,
          url: `${SITE_URL}/articles/${post.slug}`,
          name: post.title,
        })),
      },
    ],
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
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
    filtered = sorted.filter((p) => {
      const corpus = `${p.title} ${p.excerpt ?? ''} ${p.content ?? ''}`.toLowerCase()
      const g = BLOG_STYLE_GROUPS.find((gg) => gg.slug === category)
      if (!g) return true
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

  function buildBlogHref(p: number, cat: string) {
    const params = new URLSearchParams()
    if (cat) params.set('category', cat)
    if (p > 1) params.set('page', String(p))
    const qs = params.toString()
    return qs ? `/articles?${qs}` : '/articles'
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:py-8">
      <BlogItemListJsonLd posts={filtered} />

      {/* Hero */}
      <section className="hero-shell rounded-[0.95rem] border border-brand-900/10 p-4 shadow-sm sm:p-5">
          <p className="eyebrow-label">Articles</p>
          <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">Educational &amp; research articles</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#46574d]">
          Pharmacology, mechanisms, safety discussions, practical guides, and compound deep dives. Conservative, evidence-first context for supplement decisions.
        </p>
        <p className="mt-1 text-sm font-semibold text-[#46574d]">{count} articles available</p>
      </section>

      {/* Category filter (static links) */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66]">Filter by category</p>
        <CategoryFilterBar active={category} />
      </div>

      {/* Latest 3 prominently */}
      {!category && latestThree.length > 0 ? <LatestStrip posts={latestThree} /> : null}

      {!category ? <FocusAdhdRootSection /> : null}

      {/* Grid + pagination */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow-label">{category ? 'Matching articles' : 'Archive'}</p>
            <h2 className="compact-heading">{category ? 'Articles in this style.' : 'All articles.'}</h2>
          </div>
          <span className="hidden text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66] sm:inline">
            {totalForGrid} notes
          </span>
        </div>

        {pageItems.length === 0 ? (
          <div className="rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-6 text-sm text-[#46574d]">
            No articles in this filter. <Link href="/articles" className="font-semibold text-brand-800">View all</Link>.
          </div>
        ) : (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
            {pageItems.map((post) => (
              <BlogCard key={post.slug} post={post} />
            ))}
          </div>
        )}

        {/* Pagination (12 per page) */}
        {totalPages > 1 && (
          <nav className="flex flex-wrap items-center justify-between gap-3 rounded-[0.8rem] border border-brand-900/10 bg-white/80 p-3 text-sm" aria-label="Blog pagination">
            <div>
              Page {currentPage} of {totalPages} — showing {start + 1}–{Math.min(start + BLOG_PAGE_SIZE, totalForGrid)} of {totalForGrid}
            </div>
            <div className="flex gap-3">
              {currentPage > 1 ? (
                <Link rel="prev" href={buildBlogHref(currentPage - 1, category)} className="font-semibold text-brand-800">
                  ← Previous
                </Link>
              ) : null}
              {currentPage < totalPages ? (
                <Link rel="next" href={buildBlogHref(currentPage + 1, category)} className="font-semibold text-brand-800">
                  Next →
                </Link>
              ) : null}
            </div>
          </nav>
        )}
      </section>

      {/* Crawlable index */}
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
