import Link from 'next/link'
import posts from '@/data/blog/posts.json'

export default function BlogPage() {
  return (
    <section className='container-page py-10'>
      <h1 className='text-3xl font-semibold text-white'>Blog</h1>
      <div className='mt-6 grid gap-3 sm:grid-cols-2'>
        {posts.map(post => (
          <article key={post.slug} className='ds-card'>
            <h2 className='text-lg font-semibold text-white'>{post.title}</h2>
            <p className='mt-2 text-sm text-white/70'>{post.excerpt}</p>
            <Link className='mt-3 inline-block text-emerald-300' href={`/blog/${post.slug}`}>
              Read post
            </Link>
          </article>
        ))}
      </div>
    </section>
  )
}
