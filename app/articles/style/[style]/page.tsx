import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import posts from '@/data/blog/posts.json'
import articles from '@/data/articles/articles.json'
import { ContentIdentityCard } from '@/components/scientific-discovery'
import {
  BLOG_STYLE_GROUPS,
  formatDate,
  getBlogStyleGroup,
  getPostsForStyle,
  inferArticleStyle,
  truncateText,
  type BlogPost,
} from '@/lib/blog-index'
import { buildPageMetadata } from '@/lib/seo'

export const dynamic = 'force-static'

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

const allPosts: BlogPost[] = [
  ...(articles as ArticleIndexRecord[]).map((article) => ({
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
  })),
  ...(posts as BlogPost[]),
]
  .filter((post) => post && post.slug && post.title)
  .filter((post, index, source) => source.findIndex((candidate) => candidate.slug === post.slug) === index)

type BlogStyleRouteProps = {
  params: Promise<{ style: string }>
}

export function generateStaticParams() {
  return BLOG_STYLE_GROUPS.map((group) => ({ style: group.slug }))
}

export async function generateMetadata({ params }: BlogStyleRouteProps): Promise<Metadata> {
  const { style } = await params
  const group = getBlogStyleGroup(style)

  if (!group) return {}

  return buildPageMetadata({
    title: `${group.title} | Articles`,
    description: group.description,
    path: group.href || `/articles/style/${style}`,
    openGraphType: 'website',
  })
}

export default async function BlogStylePage({ params }: BlogStyleRouteProps) {
  const { style } = await params
  const group = getBlogStyleGroup(style)

  if (!group) return notFound()

  const stylePosts = getPostsForStyle(allPosts, style)

  return (
    <div className="section-spacing pb-10">
      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/articles" className="transition hover:text-ink">
          Research notes
        </Link>
        <span>/</span>
        <span className="text-ink">{group.title}</span>
      </nav>

      <section className="hero-shell rounded-[0.95rem] border border-brand-900/10 p-4 shadow-sm sm:p-5">
        <p className="eyebrow-label">{group.meta}</p>
        <h1 className="mt-2 heading-premium max-w-3xl">{group.title}</h1>
        <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-soft">{group.description}</p>
        <p className="mt-2 text-sm font-semibold text-[#46574d]">{stylePosts.length} matching notes</p>
      </section>

      <section className="space-y-4">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="eyebrow-label">Archive</p>
            <h2 className="mt-2 max-w-3xl">{group.title}</h2>
          </div>
          <Link href="/articles" className="text-sm font-semibold text-brand-800 transition hover:text-brand-900">
            View all notes
          </Link>
        </div>

        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {stylePosts.map((post) => (
            <ContentIdentityCard
              key={post.slug}
              item={{
                href: `/articles/${post.slug}`,
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
