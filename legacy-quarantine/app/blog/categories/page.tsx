import type { Metadata } from 'next'
import { getBlogCategories } from '@/lib/blog-taxonomy'

export const metadata: Metadata = {
  title: 'Blog Categories',
  description: 'Browse article categories with canonical archive links and topic-specific coverage.',
  alternates: { canonical: 'https://thehippiescientist.net/articles' },
  robots: { index: false, follow: true },
}

export default function BlogCategoriesPage() {
  const categories = getBlogCategories()
  return <div className="section-spacing pb-20"><h1>Article categories</h1><ul className="mt-6 space-y-3">{categories.map(category => <li key={category.slug}><a href={`/articles?category=${category.slug}`} className="text-brand-800 hover:underline font-medium">{category.label}</a> <span className="text-muted">({category.count})</span></li>)}</ul></div>
}
