import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://thehippiescientist.net'
const OUT = path.resolve('public/feed.xml')
const OUT2 = path.resolve('public/rss.xml')
const BLOG_PATH = path.resolve('data/blog/posts.json')
const ARTICLES_PATH = path.resolve('data/articles/articles.json')

const posts = []

// Load blog posts
try {
  const blogData = JSON.parse(fs.readFileSync(BLOG_PATH, 'utf-8'))
  const blogPosts = Array.isArray(blogData) ? blogData : []
  posts.push(...blogPosts.map(p => ({ ...p, source: 'blog' })))
} catch {
  console.warn('No blog posts found.')
}

// Load articles
try {
  const articleData = JSON.parse(fs.readFileSync(ARTICLES_PATH, 'utf-8'))
  const articles = Array.isArray(articleData) ? articleData : (articleData.articles || [])
  posts.push(...articles.map(a => ({ ...a, source: 'article' })))
} catch {
  console.warn('No articles found.')
}

if (!posts.length) {
  console.warn('No content found, skipping RSS feed.')
  process.exit(0)
}

const now = new Date().toUTCString()

const normalizedPosts = (Array.isArray(posts) ? posts : [])
  .map(post => {
    const slug = String(post?.slug || '').trim().replace(/^\/+|\/+$/g, '')
    if (!slug) return null

    const parsedDate = new Date(post?.date || post?.updatedAt || 0)
    const date = Number.isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate

    return {
      slug,
      title: post?.title || 'Untitled',
      description: post?.description || post?.excerpt || post?.summary || '',
      date,
    }
  })
  .filter(Boolean)
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 50)

const items = normalizedPosts
  .map(post => {
    const url = `${SITE}/articles/${post.slug}`
    return `
    <item>
      <title><![CDATA[${post.title}]]></title>
      <link>${url}</link>
      <guid>${url}</guid>
      <pubDate>${post.date.toUTCString()}</pubDate>
      <description><![CDATA[${post.description}]]></description>
    </item>`
  })
  .join('\n')

const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>The Hippie Scientist</title>
  <link>${SITE}/articles</link>
  <description>Evidence-based herbal supplement research, safety, and practical guides</description>
  <language>en</language>
  <lastBuildDate>${now}</lastBuildDate>
  ${items}
</channel>
</rss>`

fs.writeFileSync(OUT, xml)
try {
  fs.writeFileSync(OUT2, xml)
} catch (error) {
  console.warn('Unable to mirror RSS feed to', OUT2, error)
}

console.log('RSS feed written to', OUT, 'with', normalizedPosts.length)
