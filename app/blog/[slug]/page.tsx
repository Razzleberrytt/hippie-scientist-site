import { notFound } from 'next/navigation'
import Link from 'next/link'
import posts from '../../../data/blog/posts.json'
import herbs from '../../../public/data/herbs.json'
import compounds from '../../../public/data/compounds.json'
import { ResearchContinuityBlock } from '@/components/scientific-discovery'
import { findArticleEntities } from '@/lib/editorial-discovery'

const allPosts = posts as any[]

export async function generateStaticParams() {
  return allPosts.map((p: any) => ({ slug: p.slug }))
}

export async function generateMetadata({ params }: any) {
  const resolvedParams = await params
  const post = allPosts.find((p: any) => p.slug === resolvedParams.slug)

  if (!post) return {}

  return {
    title: post.title,
    description: post.excerpt,
  }
}

const formatDate = (value: string | undefined): string => {
  if (!value) return 'Undated'
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value
  return new Intl.DateTimeFormat('en-US', { month: 'short', day: 'numeric', year: 'numeric' }).format(date)
}

const inferResearchStyle = (post: any) => {
  const value = `${post.title} ${post.excerpt} ${post.content}`.toLowerCase()
  if (value.includes('research digest')) return 'Evidence synthesis'
  if (value.includes('pharmacology')) return 'Mechanism-led'
  if (value.includes('traditional')) return 'Traditional-use led'
  if (value.includes('safety')) return 'Safety-first'
  if (value.includes('extraction')) return 'Methods / preparation'
  return 'Editorial field note'
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

export default async function BlogPostPage({ params }: any) {
  const resolvedParams = await params
  const post = allPosts.find((p: any) => p.slug === resolvedParams.slug)

  if (!post) return notFound()

  const lines = post.content.split('\n').map((line: string) => line.trim()).filter(Boolean)
  const relatedHerbs = findArticleEntities(post, herbs as any[], 'herb', 3)
  const relatedCompounds = findArticleEntities(post, compounds as any[], 'compound', 3)
  const relatedItems = [...relatedHerbs, ...relatedCompounds]

  return (
    <main className="mx-auto max-w-5xl space-y-8 px-4 pb-20 sm:px-6 lg:px-8">
      <Link href="/blog" className="text-sm font-bold text-brand-800">← Back to research notes</Link>

      <section className="hero-shell rounded-[2rem] border border-white/50 p-6 shadow-card sm:p-8 lg:p-10">
        <div className="flex flex-wrap items-center gap-3">
          <span className="identity-kicker">Article</span>
          <span className="identity-kicker">{inferResearchStyle(post)}</span>
          <span className="identity-meta">{formatDate(post.date)} • {post.readingTime}</span>
        </div>
        <h1 className="mt-4 heading-premium max-w-4xl">{post.title}</h1>
        <p className="mt-5 text-reading max-w-3xl text-muted-soft">{post.excerpt}</p>
      </section>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_280px]">
        <article className="surface-depth card-spacing space-y-4">
          <div className="pull-quote-science mb-6">
            This note is part of the scientific graph: use it as context, then follow the related profiles for structured evidence, safety, and mechanism details.
          </div>
          {lines.map(renderBlock)}
        </article>

        <aside className="space-y-4 lg:sticky lg:top-24 lg:self-start">
          <div className="mobile-reading-card">
            <p className="eyebrow-label">How to read this</p>
            <ul className="mt-4 space-y-3 text-sm leading-7 text-[#46574d]">
              <li>• Treat mechanisms as context, not proof.</li>
              <li>• Look for safety constraints before practical use.</li>
              <li>• Continue into profiles for structured comparison.</li>
            </ul>
          </div>
        </aside>
      </section>

      <section className="surface-depth card-spacing">
        <ResearchContinuityBlock
          title="Related herbs and compounds"
          description="These links are selected from overlap between article language, entity names, effects, and mechanism terms."
          items={relatedItems}
        />
      </section>
    </main>
  )
}
