import type { Metadata } from 'next'
import Link from 'next/link'
import posts from '../../data/blog/posts.json'
import { ContentIdentityCard, SemanticBrowseModule } from '@/components/scientific-discovery'

export const dynamic = 'force-static'

const allPosts = posts as any[]

const getPostSortValue = (post: any): number => {
  if (!post.date) return 0
  const value = new Date(post.date).getTime()
  return Number.isNaN(value) ? 0 : value
}

const truncateText = (value: string | undefined, maxLength: number): string => {
  if (!value) return 'No summary yet.'
  if (value.length <= maxLength) return value
  return `${value.slice(0, maxLength - 1).trimEnd()}…`
}

const formatDate = (value: string | undefined): string => {
  if (!value) return 'Undated'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const inferArticleStyle = (post: any) => {
  const text = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase()
  if (text.includes('pharmacology')) return 'Pharmacology primer'
  if (text.includes('research digest')) return 'Research digest'
  if (text.includes('traditional')) return 'Traditional context'
  if (text.includes('safety')) return 'Safety note'
  if (text.includes('extraction')) return 'Preparation guide'
  return 'Editorial note'
}

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
  const sortedPosts = [...allPosts].sort((a, b) => getPostSortValue(b) - getPostSortValue(a))
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
              <span className="identity-meta">{formatDate(featuredPost.date)} • {featuredPost.readingTime}</span>
            </div>
            <h2 className="mt-2 max-w-3xl text-xl font-semibold tracking-tight text-ink group-hover:text-brand-800 sm:text-2xl">{featuredPost.title}</h2>
            <p className="mt-3 max-w-3xl text-sm leading-6 text-[#46574d]">{truncateText(featuredPost.excerpt, 140)}</p>
            <span className="mt-3 inline-flex text-sm font-semibold text-brand-800 transition group-hover:translate-x-0.5">Read note →</span>
          </Link>
        </section>
      ) : null}

      <SemanticBrowseModule
        eyebrow="Browse articles by research style"
        title="Choose the context you need."
        groups={[
          { title: 'Research digests', description: 'Evidence summaries with limitations and cautious interpretation.', href: '/blog', meta: 'Evidence' },
          { title: 'Pharmacology basics', description: 'Mechanism-first explainers for pathways, compounds, and receptor context.', href: '/blog', meta: 'Mechanism' },
          { title: 'Traditional use', description: 'Historical context kept separate from modern efficacy claims.', href: '/blog', meta: 'Tradition' },
          { title: 'Extraction & preparation', description: 'Form, solvent, dose visibility, and practical preparation notes.', href: '/blog', meta: 'Methods' },
          { title: 'Safety / set / setting', description: 'Conservative reading for uncertainty, cautions, and context of use.', href: '/blog', meta: 'Safety' },
          { title: 'Field notes', description: 'Editorial observations that help turn profiles into memorable learning.', href: '/blog', meta: 'Notes' },
        ]}
      />

      <section className="space-y-4">
        <div>
          <p className="eyebrow-label">Archive</p>
          <h2 className="mt-2 max-w-3xl">All research notes</h2>
        </div>
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
          {remainingPosts.map(post => (
            <ContentIdentityCard
              key={post.slug}
              item={{
                href: `/blog/${post.slug}`,
                title: post.title,
                description: truncateText(post.excerpt, 130),
                meta: `${inferArticleStyle(post)} • ${formatDate(post.date)}`,
                kind: 'article',
              }}
            />
          ))}
        </div>
      </section>
    </div>
  )
}
