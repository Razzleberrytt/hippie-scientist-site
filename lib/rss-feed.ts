import blogPosts from '@/data/blog/posts.json'
import articles from '@/data/articles/articles.json'

const SITE = 'https://thehippiescientist.net'

type FeedRecord = {
  slug?: string
  title?: string
  description?: string
  excerpt?: string
  summary?: string
  category?: string
  date?: string | null
  updatedAt?: string | null
}

function safeCdata(value: unknown): string {
  return String(value ?? '').replace(/]]>/g, ']]]]><![CDATA[>')
}

function parseDate(value?: string | null): Date {
  const parsed = new Date(value || 0)
  return Number.isNaN(parsed.getTime()) ? new Date(0) : parsed
}

export function buildRssFeed(): string {
  const posts = [
    ...(blogPosts as FeedRecord[]),
    ...(articles as FeedRecord[]),
  ]

  const normalized = posts
    .map((post) => {
      const slug = String(post.slug || '').trim().replace(/^\/+|\/+$/g, '')
      if (!slug) return null

      return {
        slug,
        title: post.title || 'Untitled',
        description: post.description || post.excerpt || post.summary || '',
        category: post.category || '',
        publishedDate: parseDate(post.date || post.updatedAt),
        sortDate: parseDate(post.updatedAt || post.date),
      }
    })
    .filter((post): post is NonNullable<typeof post> => Boolean(post))
    .sort((a, b) => b.sortDate.getTime() - a.sortDate.getTime())
    .slice(0, 50)

  const lastBuildDate = (normalized[0]?.sortDate || new Date(0)).toUTCString()
  const items = normalized
    .map((post) => {
      const url = `${SITE}/articles/${post.slug}/`
      const category = post.category
        ? `\n      <category><![CDATA[${safeCdata(post.category)}]]></category>`
        : ''

      return `
    <item>
      <title><![CDATA[${safeCdata(post.title)}]]></title>
      <link>${url}</link>
      <guid isPermaLink="true">${url}</guid>
      <pubDate>${post.publishedDate.toUTCString()}</pubDate>${category}
      <description><![CDATA[${safeCdata(post.description)}]]></description>
    </item>`
    })
    .join('\n')

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title>The Hippie Scientist</title>
  <link>${SITE}/articles/</link>
  <atom:link href="${SITE}/rss.xml" rel="self" type="application/rss+xml" />
  <description>Evidence-first research updates from The Hippie Scientist.</description>
  <language>en</language>
  <lastBuildDate>${lastBuildDate}</lastBuildDate>
  ${items}
</channel>
</rss>
`
}
