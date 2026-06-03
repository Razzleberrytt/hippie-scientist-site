import type { Metadata } from 'next'
import Link from 'next/link'
import posts from '../../data/blog/posts.json'
import { ContentIdentityCard, SemanticBrowseModule } from '@/components/scientific-discovery'
import {
  BLOG_STYLE_GROUPS,
  formatDate,
  inferArticleStyle,
  sortPostsNewestFirst,
  truncateText,
  type BlogPost,
} from '@/lib/blog-index'

export const dynamic = 'force-static'

const allPosts: BlogPost[] = posts

export const metadata: Metadata = {
  title: 'Research Notes',
  description: '75+ research notes on herbs, compounds, safety, and preparation.',
  alternates: { canonical: '/blog' },
  openGraph: {
    title: 'Research Notes',
    description: '75+ research notes on herbs, compounds, safety, and preparation.',
    url: '/blog',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Research Notes',
    description: '75+ research notes on herbs, compounds, mechanisms, safety, and preparation.',
  },
}

export default function BlogPage() {
  const sortedPosts = sortPostsNewestFirst(allPosts)
  const featuredPost = sortedPosts[0]
  const remainingPosts = sortedPosts.slice(1)

  return (
    <div className="section-spacing pb-10">
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
              <span className="identity-meta">{formatDate(featuredPost.date)} - {featuredPost.readingTime}</span>
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
            <ContentIdentityCard
              key={post.slug}
              item={{
                href: `/blog/${post.slug}`,
                title: post.title,
                description: truncateText(post.excerpt, 130),
                meta: `${inferArticleStyle(post)} - ${formatDate(post.date)}`,
                kind: 'article',
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
