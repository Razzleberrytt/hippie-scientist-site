import { notFound } from 'next/navigation'
import Link from 'next/link'
import fs from 'fs'
import path from 'path'

const POSTS_PATH = path.join(process.cwd(), 'data/blog/posts.json')

function getPosts() {
  const raw = fs.readFileSync(POSTS_PATH, 'utf-8')
  return JSON.parse(raw)
}

export async function generateStaticParams() {
  const posts = getPosts()
  return posts.map((p: any) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: any) {
  const posts = getPosts()
  const post = posts.find((p: any) => p.slug === params.slug)

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params }: any) {
  const posts = getPosts()
  const post = posts.find((p: any) => p.slug === params.slug)

  if (!post) return notFound()

  const paragraphs = post.content.split('\n').filter(Boolean)

  return (
    <div className="space-y-6">
      <Link href="/blog" className="text-sm font-bold text-emerald-700">← Back to Blog</Link>

      <section className="rounded-2xl border border-slate-200 bg-white p-6">
        <p className="text-xs font-black uppercase tracking-[0.2em] text-emerald-700">Blog</p>
        <h1 className="mt-2 text-3xl font-black text-slate-950">{post.title}</h1>
        <p className="mt-2 text-sm text-slate-500">{post.date} • {post.readingTime}</p>
      </section>

      <section className="rounded-2xl border border-slate-200 bg-white p-6 space-y-4">
        {paragraphs.map((p: string, i: number) => (
          <p key={i} className="text-sm leading-7 text-slate-700">{p}</p>
        ))}
      </section>
    </div>
  )
}
