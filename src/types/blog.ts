export type BlogSource = {
  title: string
  url: string
}

export type BlogPost = {
  slug: string
  title: string
  date: string // ISO
  excerpt: string
  tags: string[]
  description?: string
  summary?: string
  readingTime?: string
  cover?: string
  author?: string
  sources?: BlogSource[]
  lastUpdated?: string
}

export type BlogStore = {
  version: string
  count: number
  posts: BlogPost[]
}
