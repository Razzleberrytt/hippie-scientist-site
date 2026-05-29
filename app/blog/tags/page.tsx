import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { getBlogTags } from '@/lib/blog-taxonomy'

export const metadata: Metadata = {
  title: 'Blog Tags | The Hippie Scientist',
  description: 'Browse static blog tags to explore herb research notes by theme, mechanism, and safety context.',
  alternates: { canonical: `${SITE_URL}/blog/tags` },
}

export default function BlogTagsPage() {
  const tags = getBlogTags()
  return <div className="section-spacing pb-20"><h1>Blog tags</h1><ul className="mt-6 space-y-3">{tags.map(tag => <li key={tag.slug}><a href={`/blog?tag=${tag.slug}`} className="text-brand-800 hover:underline font-medium">{tag.label}</a> <span className="text-muted">({tag.count})</span></li>)}</ul></div>
}
