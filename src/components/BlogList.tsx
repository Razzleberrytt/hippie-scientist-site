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
        <article key={post.slug} className='rounded-md bg-white/5 p-4 backdrop-blur'>
          <h3 className='text-xl font-semibold'>
            <Link
              to={`/blog/${post.slug}`}
              className='text-cosmic-purple hover:underline focus:outline-none focus-visible:ring-2 focus-visible:ring-cosmic-purple'
            >
              {post.title}
            </Link>
          </h3>
          <p className='text-sand'>{post.summary}</p>
        </article>
      ))}
    </section>
  )
}
