import { notFound } from 'next/navigation'
import Link from 'next/link'
import posts from '@/data/blog/posts.json'
import { getAllCompounds, getAllHerbs } from '@/lib/server/runtime-data'
import { ResearchContinuityBlock } from '@/components/scientific-discovery'
import { findArticleEntities, type EditorialEntity } from '@/lib/editorial-discovery'
import {
  formatDate,
  inferResearchStyle,
  shouldNoindexBlogPost,
  type BlogPost,
} from '@/lib/blog-index'
import { buildPageMetadata, blogJsonLd, breadcrumbJsonLd } from '@/lib/seo'
import LastUpdatedBadge from '@/components/editorial/LastUpdatedBadge'
import EmailCapture from '@/components/EmailCapture'
import NewsletterCtaBlock from '@/components/NewsletterCtaBlock'
import JsonLd from '@/components/seo/JsonLd'

const allPosts: BlogPost[] = posts

type BlogRouteParams = Promise<{ slug: string }>

export type BlogRouteProps = {
  params: BlogRouteParams
}

export function generateStaticParams() {
  return allPosts.map((post) => ({ slug: post.slug }))
}

export async function generateMetadata({ params }: BlogRouteProps) {
  const resolvedParams = await params
  const post = allPosts.find((candidate) => candidate.slug === resolvedParams.slug)

  if (!post) return {}

  const path = `/articles/${resolvedParams.slug}`
  const base = {
    title: post.title,
    description: post.excerpt || 'Research note with mechanisms, evidence, and safety context.',
    path,
    openGraphType: 'article' as const,
  }
  const meta = buildPageMetadata(base)

  return {
    ...meta,
    authors: [{ name: 'Will', url: 'https://thehippiescientist.net/about' }],
    alternates: { canonical: path },
    robots: shouldNoindexBlogPost(post) ? { index: false, follow: true } : undefined,
  }
}

const renderBlock = (line: string, index: number) => {
  if (line.startsWith('## ')) {
    return <h2 key={index} className="mt-8 max-w-2xl text-2xl font-semibold tracking-tight text-ink">{line.replace(/^##\s+/, '')}</h2>
  }

  if (line.startsWith('# ')) {
    return null
  }

  if (line.startsWith('- ')) {
    return (
      <li key={index} className="ml-5 list-disc text-sm leading-7 text-[#46574d]">
        {line.replace(/^[-]\s+/, '').replace(/_/g, '')}
      </li>
    )
  }

  return <p key={index} className="text-[1.02rem] leading-[1.86] text-[#46574d]">{line.replace(/_/g, '')}</p>
}

export default async function BlogPostPage({ params }: BlogRouteProps) {
  const resolvedParams = await params
  const post = allPosts.find((candidate) => candidate.slug === resolvedParams.slug)

  if (!post) return notFound()
  if (!post.date) return notFound()

  const lines = (post.content ?? '').split('\n').map((line) => line.trim()).filter(Boolean)
  const [herbs, compounds] = await Promise.all([
    getAllHerbs(),
    getAllCompounds(),
  ])
  const relatedHerbs = findArticleEntities(post, herbs as EditorialEntity[], 'herb', 3)
  const relatedCompounds = findArticleEntities(post, compounds as EditorialEntity[], 'compound', 3)
  const relatedItems = [...relatedHerbs, ...relatedCompounds]

  const pageBreadcrumb = breadcrumbJsonLd([
    { name: 'Articles', url: 'https://thehippiescientist.net/articles' },
    { name: post.title, url: `https://thehippiescientist.net/articles/${post.slug}` },
  ])
  const blogLd = blogJsonLd({
    title: post.title,
    slug: post.slug,
    date: post.date,
    updated: post.updatedAt || post.date || undefined,
    excerpt: post.excerpt,
  }, `/articles/${resolvedParams.slug}`)

  return (
    <article className="mx-auto max-w-5xl space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
      <JsonLd schema={blogLd} />
      <JsonLd schema={pageBreadcrumb} />

      <nav className="flex items-center gap-2 text-sm text-muted">
        <Link href="/articles" className="transition hover:text-ink">
          Articles
        </Link>

        <span>/</span>

        <span className="text-ink">{post.title}</span>
      </nav>

      {post.controlled_substance && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-5 text-sm text-red-900 shadow-sm leading-6">
          <p>
            <strong>Legal Notice & Disclaimer:</strong> The substance discussed in this article is a Schedule I controlled substance in the United States and is controlled or restricted in many other jurisdictions. The information on this page is for educational and harm-reduction purposes only. This site does not facilitate or encourage the purchase, possession, or use of controlled substances. Consult your local laws before proceeding.
          </p>
        </div>
      )}

      <Link href="/articles" className="text-sm font-bold text-brand-800">&lt;- Back to articles</Link>

      <section className="hero-shell rounded-[2rem] border border-brand-900/10 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="identity-kicker">Article</span>
          <span className="identity-kicker">{inferResearchStyle(post)}</span>
          <span className="identity-meta">{formatDate(post.date)} - {post.readingTime}</span>
        </div>
        <h1 className="mt-4 heading-premium max-w-4xl">{post.title}</h1>
        <p className="mt-3 text-sm text-muted">
          By{' '}
          <Link href="/about" rel="author" className="font-medium text-ink hover:underline">
            Will
          </Link>
        </p>
        <div className="mt-3">
          <LastUpdatedBadge date={post.updatedAt || post.date} label="Last updated" />
        </div>
        {post.excerpt ? <p className="mt-3 text-reading max-w-3xl text-muted-soft">{post.excerpt}</p> : null}
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="surface-depth card-spacing space-y-4">
          {lines.map(renderBlock)}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          {relatedItems.length > 0 ? (
            <div className="mobile-reading-card">
              <p className="eyebrow-label">Related profiles</p>
              <ul className="mt-4 space-y-3 text-sm leading-7 text-[#46574d]">
                {relatedItems.slice(0, 5).map((item) => (
                  <li key={item.href}>
                    <Link href={item.href} className="font-semibold text-brand-800 hover:underline">
                      {item.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ) : null}
        </aside>
      </section>

      {relatedItems.length > 0 ? (
        <section className="surface-depth card-spacing">
          <ResearchContinuityBlock
            title="Related profiles"
            items={relatedItems}
          />
        </section>
      ) : null}

      <EmailCapture
        headline="Get future research notes by email"
        description="Join for concise supplement safety, sourcing, and evidence updates tied to new articles."
        location={`blog-${post.slug}`}
      />

      <NewsletterCtaBlock
        title="Continue with the newsletter archive"
        description="Read short notes built for cautious supplement decisions."
        location={`blog-${post.slug}-newsletter`}
      />
    </article>
  )
}
