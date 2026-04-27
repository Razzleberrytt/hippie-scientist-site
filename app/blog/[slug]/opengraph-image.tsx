import { ImageResponse } from 'next/og'
import posts from '@/data/blog/posts.json'

export const alt = 'The Hippie Scientist blog post'
export const size = {
  width: 1200,
  height: 630,
}
export const contentType = 'image/png'

type Params = {
  params: Promise<{ slug: string }>
}

type BlogPost = {
  slug: string
  title: string
  excerpt?: string
  date?: string
  readingTime?: string
}

const allPosts = posts as BlogPost[]

const formatSlugLabel = (slug: string): string =>
  slug
    .split('-')
    .filter(Boolean)
    .map(part => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ')

const getPostBySlug = (slug: string): BlogPost | null =>
  allPosts.find(post => post.slug === slug) ?? null

const truncateText = (value: string, maxLength: number): string =>
  value.length <= maxLength ? value : `${value.slice(0, maxLength - 1).trimEnd()}…`

const formatDate = (value?: string): string => {
  if (!value) return ''

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return value

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  }).format(date)
}

export default async function Image({ params }: Params) {
  const { slug } = await params
  const post = getPostBySlug(slug)

  const title = truncateText(
    post?.title || formatSlugLabel(slug) || 'Blog Post',
    90,
  )

  const excerpt = truncateText(
    post?.excerpt || 'Science-first notes, explainers, and plain-English research context.',
    160,
  )

  const metaLine = [formatDate(post?.date), post?.readingTime].filter(Boolean).join(' • ')

  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          background: 'linear-gradient(135deg, #06111f 0%, #0f172a 52%, #1e293b 100%)',
          color: '#f8fafc',
          padding: '52px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            borderRadius: '28px',
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.04)',
            padding: '42px',
          }}
        >
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'center',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 22,
                letterSpacing: '0.22em',
                textTransform: 'uppercase',
                color: 'rgba(248,250,252,0.72)',
              }}
            >
              The Hippie Scientist
            </div>

            <div
              style={{
                display: 'flex',
                padding: '10px 18px',
                borderRadius: '999px',
                border: '1px solid rgba(255,255,255,0.14)',
                background: 'rgba(255,255,255,0.06)',
                fontSize: 20,
                color: 'rgba(248,250,252,0.88)',
              }}
            >
              Blog
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              gap: '18px',
              maxWidth: '980px',
            }}
          >
            {metaLine ? (
              <div
                style={{
                  display: 'flex',
                  fontSize: 22,
                  color: 'rgba(191,219,254,0.88)',
                }}
              >
                {metaLine}
              </div>
            ) : null}

            <div
              style={{
                display: 'flex',
                fontSize: 68,
                fontWeight: 700,
                lineHeight: 1.04,
                letterSpacing: '-0.04em',
              }}
            >
              {title}
            </div>

            <div
              style={{
                display: 'flex',
                fontSize: 28,
                lineHeight: 1.35,
                color: 'rgba(248,250,252,0.82)',
                maxWidth: '920px',
              }}
            >
              {excerpt}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              gap: '14px',
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            {['Herbs', 'Compounds', 'Research notes'].map(label => (
              <div
                key={label}
                style={{
                  display: 'flex',
                  padding: '10px 18px',
                  borderRadius: '999px',
                  border: '1px solid rgba(255,255,255,0.14)',
                  background: 'rgba(255,255,255,0.06)',
                  fontSize: 22,
                  color: 'rgba(248,250,252,0.88)',
                }}
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>
    ),
    size,
  )
}
