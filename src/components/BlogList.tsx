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
          className="rounded-xl border border-[color:color-mix(in_oklab,var(--border-c)_80%,transparent_20%)] bg-[color-mix(in_oklab,var(--surface-c)_90%,transparent_10%)] p-4 backdrop-blur"
        >
          <h3 className="text-xl font-semibold text-[color:var(--text-c)]">
            <Link
              to={`/blog/${post.slug}`}
              className="link text-[color:var(--accent)]"
            >
              {post.title}
            </Link>
          </h3>
          <p className="text-[color:var(--muted-c)]">{post.summary}</p>
        </article>
      ))}
    </section>
  )
}
