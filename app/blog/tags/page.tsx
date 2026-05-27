import type { Metadata } from 'next'
import { getBlogTags } from '@/lib/blog-taxonomy'

export const metadata: Metadata = {
  title: 'Blog Tags | The Hippie Scientist',
  description: 'Browse static blog tags to explore herb research notes by theme, mechanism, and safety context.',
  alternates: { canonical: 'https://www.thehippiescientist.net/blog/tags' },
}

export default function BlogTagsPage() {
  const tags = getBlogTags()
  return <main className="section-spacing pb-20"><h1>Blog tags</h1><ul className="mt-6 space-y-3">{tags.map(tag => <li key={tag.slug}>{tag.label} ({tag.count})</li>)}</ul></main>
}
