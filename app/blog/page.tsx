import type { Metadata } from 'next'
import Link from 'next/link'

import rawPosts from '@/data/blog/posts.json'
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

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Notes',
  description: '75+ research notes on herbs, compounds, safety, and preparation. Mechanisms, evidence, and practical context for evidence-driven readers.',
  path: '/research-notes',
  openGraphType: 'website',
})

export const dynamic = 'force-static'

const BLOG_PAGE_SIZE = 12

const allPosts: BlogPost[] = (rawPosts as BlogPost[]).filter((p) => p && p.slug && p.title)

function getPostCategory(post: BlogPost): { label: string; href: string } {
  const style = inferArticleStyle(post)
  const group = BLOG_STYLE_GROUPS.find((g) =>
    style.toLowerCase().includes(g.slug.split('-')[0]) ||
    (g.slug === 'research-digests' && style.toLowerCase().includes('digest')) ||
    (g.slug === 'extraction-preparation' && (style.toLowerCase().includes('preparation') || style.toLowerCase().includes('extraction'))) ||
    (g.slug === 'safety-set-setting' && style.toLowerCase().includes('safety'))
  )
  return group ? { label: group.title, href: group.href } : { label: 'Editorial note', href: '/research-notes' }
}

function BlogCard({ post }: { post: BlogPost }) {
  const cat = getPostCategory(post)
  const excerpt = truncateText(post.excerpt, 160)
  const href = `/research-notes/${post.slug}`

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
        Read note →
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
          <h2 className="compact-heading">The three most recent notes.</h2>
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

function CategoryFilterBar({ active }: { active: string }) {
  return (
    <div className="flex flex-wrap gap-2" role="tablist" aria-label="Filter by category">
      <Link
        href="/research-notes"
        className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${!active ? 'border-brand-700/25 bg-brand-50 text-brand-900' : 'border-brand-900/10 bg-white/80 text-[#33443a] hover:border-brand-700/20'}`}
      >
        All notes
      </Link>
      {BLOG_STYLE_GROUPS.map((g) => {
        const href = `/research-notes?category=${g.slug}`
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
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'The Hippie Scientist research notes',
    itemListElement: posts.slice(0, 200).map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/research-notes/${post.slug}`,
      name: post.title,
    })),
  }
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(itemList) }}
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
    return qs ? `/research-notes?${qs}` : '/research-notes'
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 px-4 py-6 sm:py-8">
      <BlogItemListJsonLd posts={filtered} />

      {/* Hero */}
      <section className="hero-shell rounded-[0.95rem] border border-brand-900/10 p-4 shadow-sm sm:p-5">
        <p className="eyebrow-label">Research notes</p>
        <h1 className="mt-2 max-w-3xl font-display text-3xl font-semibold tracking-tight text-ink sm:text-5xl">Research notes</h1>
        <p className="mt-2 max-w-2xl text-sm leading-6 text-[#46574d]">
          Mechanisms, preparations, safety limits, and evidence maturity for fast scanning.
        </p>
        <p className="mt-1 text-sm font-semibold text-[#46574d]">{count} research notes available</p>
      </section>

      {/* Category filter (static links) */}
      <div>
        <p className="mb-2 text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66]">Filter by style</p>
        <CategoryFilterBar active={category} />
      </div>

      {/* Latest 3 prominently */}
      {!category && latestThree.length > 0 ? <LatestStrip posts={latestThree} /> : null}

      {/* Grid + pagination */}
      <section className="space-y-4">
        <div className="flex items-end justify-between">
          <div>
            <p className="eyebrow-label">{category ? 'Matching notes' : 'Archive'}</p>
            <h2 className="compact-heading">{category ? 'Notes in this style.' : 'All research notes.'}</h2>
          </div>
          <span className="hidden text-xs font-bold uppercase tracking-[0.12em] text-[#5f6f66] sm:inline">
            {totalForGrid} notes
          </span>
        </div>

        {pageItems.length === 0 ? (
          <div className="rounded-[0.85rem] border border-brand-900/10 bg-white/80 p-6 text-sm text-[#46574d]">
            No notes in this filter. <Link href="/research-notes" className="font-semibold text-brand-800">View all</Link>.
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
      <nav aria-label="All research notes index" className="sr-only">
        <ul>
          {filtered.map((post) => (
            <li key={post.slug}>
              <Link href={`/research-notes/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
