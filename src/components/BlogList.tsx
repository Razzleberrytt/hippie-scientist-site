import { Link } from 'react-router-dom'

interface PostPreview {
  slug: string
  title: string
  summary: string
}

export default function BlogList({ posts }: { posts: PostPreview[] }) {
  return (
    <section className='space-y-6'>
      {posts.map(post => (
        <article
          key={post.slug}
          className='rounded-xl border border-[rgb(var(--border))/0.5] bg-[color-mix(in_oklab,rgb(var(--card))_12%,transparent)] p-4 backdrop-blur'
        >
          <h3 className='text-xl font-semibold'>
            <Link
              to={`/blog/${post.slug}`}
              className='text-[rgb(var(--accent))] hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-[rgb(var(--accent))] focus-visible:ring-offset-2 focus-visible:ring-offset-[rgb(var(--bg))]'
            >
              {post.title}
            </Link>
          </h3>
          <p className='text-sub'>{post.summary}</p>
        </article>
      ))}
    </section>
  )
}
