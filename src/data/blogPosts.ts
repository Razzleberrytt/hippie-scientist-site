import { posts as mdPosts } from './mdPosts'

export interface BlogPostMeta {
  id: string
  title: string
  excerpt: string
  tags: string[]
  date: string
}

export const blogPosts: BlogPostMeta[] = mdPosts.map(p => ({
  id: p.slug,
  title: p.title,
  excerpt: p.excerpt,
  tags: p.tags,
  date: p.date,
}))

