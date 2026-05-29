import type { Metadata } from 'next'
import { SITE_URL } from '@/lib/seo'
import { getBlogCategories } from '@/lib/blog-taxonomy'

export const metadata: Metadata = {
  title: 'Blog Categories | The Hippie Scientist',
  description: 'Browse static blog categories with canonical archive links and topic-specific article coverage.',
  alternates: { canonical: `${SITE_URL}/blog/categories` },
}

export default function BlogCategoriesPage() {
  const categories = getBlogCategories()
  return <div className="section-spacing pb-20"><h1>Blog categories</h1><ul className="mt-6 space-y-3">{categories.map(category => <li key={category.slug}><a href={`/blog?category=${category.slug}`} className="text-brand-800 hover:underline font-medium">{category.label}</a> <span className="text-muted">({category.count})</span></li>)}</ul></div>
}
