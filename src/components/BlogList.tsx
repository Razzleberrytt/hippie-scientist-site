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
          className="rounded-xl p-4 backdrop-blur"
          style={{
            border: "1px solid color-mix(in oklab, var(--border-c) 80%, transparent 20%)",
            background: "color-mix(in oklab, var(--surface-c) 90%, transparent 10%)",
          }}
        >
          <h3 className="text-xl font-semibold" style={{ color: "var(--text-c)" }}>
            <Link
              to={`/blog/${post.slug}`}
              className="link"
              style={{ color: "var(--accent)" }}
            >
              {post.title}
            </Link>
          </h3>
          <p style={{ color: "var(--muted-c)" }}>{post.summary}</p>
        </article>
      ))}
    </section>
  )
}
