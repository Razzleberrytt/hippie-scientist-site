import type { Metadata } from 'next'
import Link from 'next/link'
import posts from '@/data/blog/posts.json'

type BlogPost = {
  slug: string
  title: string
  excerpt?: string
  date?: string
  readingTime?: string
}

const allPosts = posts as BlogPost[]

const getPostSortValue = (post: BlogPost): number => {
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

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export const metadata: Metadata = {
  title: 'Blog | The Hippie Scientist',
  description: 'Short articles, explainers, and research notes.',
}

export default function BlogPage() {
  const sortedPosts = [...allPosts].sort(
    (a, b) => getPostSortValue(b) - getPostSortValue(a),
  )

  const featuredPost = sortedPosts[0]
  const remainingPosts = sortedPosts.slice(1)

  return (
    <div className='space-y-8'>
      <section className='rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8'>
        <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
          Writing
        </p>

        <h1 className='mt-2 text-4xl font-bold tracking-tight'>Blog</h1>

        <p className='mt-4 max-w-3xl text-base leading-7 text-white/75'>
          Short explainers, practical notes, and research-minded articles.
        </p>

        <p className='mt-3 text-sm text-white/60'>
          {sortedPosts.length} posts available
        </p>
      </section>

      {featuredPost ? (
        <section>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Latest post
          </p>

          <Link
            href={`/blog/${featuredPost.slug}`}
            className='group mt-4 block rounded-3xl border border-white/10 bg-white/[0.03] p-6 transition hover:border-white/30 hover:bg-white/5 sm:p-8'
          >
            <div className='flex flex-wrap items-center gap-3 text-xs text-white/50'>
              <span>{formatDate(featuredPost.date)}</span>
              {featuredPost.readingTime ? <span>{featuredPost.readingTime}</span> : null}
            </div>

            <h2 className='mt-3 text-3xl font-semibold tracking-tight'>
              {featuredPost.title}
            </h2>

            <p className='mt-4 max-w-3xl text-sm leading-7 text-white/75 sm:text-base'>
              {truncateText(featuredPost.excerpt, 260)}
            </p>

            <span className='mt-5 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
              Read post →
            </span>
          </Link>
        </section>
      ) : null}

      <section className='space-y-4'>
        <div>
          <p className='text-sm font-medium uppercase tracking-[0.2em] text-white/50'>
            Archive
          </p>
          <h2 className='mt-2 text-3xl font-semibold'>All posts</h2>
        </div>

        <div className='grid gap-4'>
          {remainingPosts.map(post => (
            <Link
              key={post.slug}
              href={`/blog/${post.slug}`}
              className='group ds-card block transition hover:border-white/30 hover:bg-white/5'
            >
              <div className='flex flex-wrap items-center gap-3 text-xs text-white/50'>
                <span>{formatDate(post.date)}</span>
                {post.readingTime ? <span>{post.readingTime}</span> : null}
              </div>

              <h3 className='mt-3 text-2xl font-semibold'>{post.title}</h3>

              <p className='mt-3 text-sm leading-6 text-white/70'>
                {truncateText(post.excerpt, 220)}
              </p>

              <span className='mt-4 inline-flex text-sm font-medium text-blue-300 transition group-hover:translate-x-0.5'>
                Read post →
              </span>
            </Link>
          ))}

          {sortedPosts.length === 0 ? (
            <div className='ds-card'>
              <p className='text-sm leading-6 text-white/70'>
                No blog posts have been added yet.
              </p>
            </div>
          ) : null}
        </div>
      </section>
    </div>
  )
}
