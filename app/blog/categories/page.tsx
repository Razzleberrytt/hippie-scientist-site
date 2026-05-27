import type { Metadata } from 'next'
import { getBlogCategories } from '@/lib/blog-taxonomy'

export const metadata: Metadata = {
  title: 'Blog Categories | The Hippie Scientist',
  description: 'Browse static blog categories with canonical archive links and topic-specific article coverage.',
  alternates: { canonical: 'https://www.thehippiescientist.net/blog/categories' },
}

export default function BlogCategoriesPage() {
  const categories = getBlogCategories()
  return <main className="section-spacing pb-20"><h1>Blog categories</h1><ul className="mt-6 space-y-3">{categories.map(category => <li key={category.slug}><span>{category.label}</span> <span>({category.count})</span></li>)}</ul></main>
}
