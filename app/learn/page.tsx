import Link from 'next/link'
import { learnPosts } from './data'

export default function LearnPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">Learn</h1>
        <p className="text-muted mt-2">High-signal guides built from real data — no fluff.</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {learnPosts.map(post => (
          <Link key={post.slug} href={`/learn/${post.slug}`} className="rounded-2xl border p-5 hover:shadow-sm">
            <p className="text-xs uppercase text-muted">{post.category} • {post.readingTime}</p>
            <h2 className="text-xl font-semibold mt-1">{post.title}</h2>
            <p className="text-sm text-muted mt-2">{post.description}</p>
          </Link>
        ))}
      </div>
    </div>
  )
}
