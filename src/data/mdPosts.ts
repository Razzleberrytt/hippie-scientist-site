import matter from 'gray-matter'

export interface MdPost {
  slug: string
  title: string
  author: string
  date: string
  tags: string[]
  excerpt: string
  readingTime: string
  content: string
}

const modules = import.meta.glob('../blog/*.md', { as: 'raw', eager: true })

export const posts: MdPost[] = Object.entries(modules).map(([path, raw]) => {
  const { data, content } = matter(raw as string)
  const words = content.split(/\s+/).length
  const readingTime = `${Math.ceil(words / 200)} min read`
  const slug = path.split('/').pop()!.replace('.md', '')
  return {
    slug,
    content,
    readingTime,
    title: data.title as string,
    author: data.author as string,
    date: data.date as string,
    tags: data.tags as string[],
    excerpt: data.excerpt as string,
  }
})
