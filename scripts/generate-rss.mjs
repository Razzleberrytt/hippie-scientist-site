import fs from 'node:fs'
import path from 'node:path'

const SITE = 'https://thehippiescientist.net'
const OUT = path.resolve('public/feed.xml')
const OUT2 = path.resolve('public/rss.xml')
const POSTS_PATH = path.resolve('src/data/blog/posts.json')

let posts = []
try {
  posts = JSON.parse(fs.readFileSync(POSTS_PATH, 'utf-8'))
} catch {
  console.warn('No blog posts found, skipping RSS feed.')
  process.exit(0)
}

const now = new Date().toUTCString()

const normalizedPosts = (Array.isArray(posts) ? posts : [])
  .map(post => {
    const slug = String(post?.slug || '').trim().replace(/^\/+|\/+$/g, '')
    if (!slug) return null

    const parsedDate = new Date(post?.date || 0)
    const date = Number.isNaN(parsedDate.getTime()) ? new Date(0) : parsedDate

    return {
      slug,
      title: post?.title || 'Untitled',
      description: post?.description || post?.summary || '',
      date,
    }
  })
  .filter(Boolean)
  .sort((a, b) => b.date.getTime() - a.date.getTime())
  .slice(0, 50)

const items = normalizedPosts
  .map(post => {
    const url = `${SITE}/blog/${post.slug}`
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
  <title>The Hippie Scientist Blog</title>
  <link>${SITE}/blog</link>
  <description>Psychoactive botany, safety, and DIY blend guides</description>
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
