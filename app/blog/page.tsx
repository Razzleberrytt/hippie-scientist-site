import type { Metadata } from 'next'
import Link from 'next/link'
import posts from '../../data/blog/posts.json'
import { SemanticBrowseModule } from '@/components/scientific-discovery'
import {
  BLOG_STYLE_GROUPS,
  formatDate,
  inferArticleStyle,
  sortPostsNewestFirst,
  truncateText,
  type BlogPost,
} from '@/lib/blog-index'
import { buildPageMetadata, SITE_URL } from '@/lib/seo'

export const dynamic = 'force-static'

const allPosts: BlogPost[] = posts

export const metadata: Metadata = buildPageMetadata({
  title: 'Research Notes',
  description: '75+ research notes on herbs, compounds, safety, and preparation. Mechanisms, evidence, and practical context for evidence-driven readers.',
  path: '/blog',
  openGraphType: 'website',
})

function ArticleCard({ post }: { post: BlogPost }) {
  const style = inferArticleStyle(post)
  const styleGroup = getStyleGroupForPost(post)
  const href = `/blog/${post.slug}`

  return (
    <article className="identity-article scientific-card group">
      <div className="flex flex-wrap items-center gap-2">
        <Link href={styleGroup.href} className="identity-kicker">
          {style}
        </Link>
        <time dateTime={post.date || ''} className="identity-meta">
          {formatDate(post.date)}
        </time>
        {post.readingTime ? <span className="identity-meta">{post.readingTime}</span> : null}
      </div>

      <h3 className="mt-4 text-xl font-semibold tracking-tight text-ink group-hover:text-brand-800">
        <Link href={href}>{post.title}</Link>
      </h3>
      <p className="mt-3 text-sm leading-7 text-[#46574d]">{truncateText(post.excerpt, 130)}</p>
      <Link href={href} className="mt-3 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5">
        Read note -&gt;
      </Link>
    </article>
  )
}

function getStyleGroupForPost(post: BlogPost) {
  const corpus = `${post.title} ${post.excerpt ?? ''} ${post.content ?? ''}`.toLowerCase()
  if (corpus.includes('research digest')) return BLOG_STYLE_GROUPS[0]
  if (corpus.includes('pharmacology')) return BLOG_STYLE_GROUPS[1]
  if (corpus.includes('traditional')) return BLOG_STYLE_GROUPS[2]
  if (corpus.includes('extraction') || corpus.includes('preparation') || corpus.includes('formulation')) return BLOG_STYLE_GROUPS[3]
  if (corpus.includes('safety') || corpus.includes('set setting') || corpus.includes('set / setting')) return BLOG_STYLE_GROUPS[4]
  return BLOG_STYLE_GROUPS[5]
}

function BlogItemListJsonLd({ posts }: { posts: BlogPost[] }) {
  const itemList = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'The Hippie Scientist research notes',
    itemListElement: posts.map((post, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `${SITE_URL}/blog/${post.slug}`,
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

export default function BlogPage() {
  const sortedPosts = sortPostsNewestFirst(allPosts)
  const featuredPost = sortedPosts[0]
  const remainingPosts = sortedPosts.slice(1)

  return (
    <div className="section-spacing pb-10">
      <BlogItemListJsonLd posts={sortedPosts} />

      <section className="hero-shell rounded-[0.95rem] border border-brand-900/10 p-4 shadow-sm sm:p-5">
        <p className="eyebrow-label">Research notes</p>
        <h1 className="mt-2 heading-premium max-w-3xl">Research notes</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-soft">
          Mechanisms, preparations, safety limits, and evidence maturity for fast scanning.
        </p>
        <p className="mt-2 text-sm font-semibold text-[#46574d]">{sortedPosts.length} research notes available</p>
      </section>

      {featuredPost ? (
        <section className="surface-depth card-spacing">
          <p className="eyebrow-label">Latest research note</p>
          <Link href={`/blog/${featuredPost.slug}`} className="identity-article scientific-card mt-3 group">
            <div className="flex flex-wrap items-center gap-2">
              <span className="identity-kicker">{inferArticleStyle(featuredPost)}</span>
              <time dateTime={featuredPost.date || ''} className="identity-meta">{formatDate(featuredPost.date)}</time>
              {featuredPost.readingTime ? <span className="identity-meta">{featuredPost.readingTime}</span> : null}
            </div>
            <h2 className="mt-2 max-w-3xl text-xl font-semibold tracking-tight text-ink group-hover:text-brand-800 sm:text-2xl">
              {featuredPost.title}
            </h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#46574d]">{truncateText(featuredPost.excerpt, 140)}</p>
            <span className="mt-3 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5">Read note -&gt;</span>
          </Link>
        </section>
      ) : null}

      <SemanticBrowseModule
        eyebrow="Browse articles by research style"
        title="Choose the context you need."
        groups={BLOG_STYLE_GROUPS}
      />

      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Archive</p>
          <h2 className="mt-2 max-w-3xl">All research notes</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {remainingPosts.map((post) => (
            <ArticleCard key={post.slug} post={post} />
          ))}
        </div>
      </section>

      {/* Server-rendered plain link index for crawler visibility (progressive enhancement only; cards above are the visual layer) */}
      <nav aria-label="All research notes index" className="sr-only">
        <ul>
          {sortedPosts.map((post: BlogPost) => (
            <li key={post.slug}>
              <Link href={`/blog/${post.slug}`}>{post.title}</Link>
            </li>
          ))}
        </ul>
      </nav>
    </div>
  )
}
