import { ImageResponse } from 'next/og'
import posts from '@/data/blog/posts.json'

export const dynamic = 'force-static'

export const alt = 'The Hippie Scientist blog post preview'
export const size = {
  width: 1200,
  height: 600,
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

export function generateStaticParams() {
  return allPosts.map(post => ({ slug: post.slug }))
}

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
    78,
  )

  const excerpt = truncateText(
    post?.excerpt || 'Science-first notes, explainers, and plain-English research context.',
    120,
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
          padding: '40px',
          fontFamily:
            'Inter, ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, Segoe UI, sans-serif',
        }}
      >
        <div
          style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'stretch',
            borderRadius: '24px',
            border: '1px solid rgba(255,255,255,0.14)',
            background: 'rgba(255,255,255,0.04)',
            padding: '34px',
          }}
        >
          <div
            style={{
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              maxWidth: '800px',
            }}
          >
            <div
              style={{
                display: 'flex',
                fontSize: 20,
                letterSpacing: '0.2em',
                textTransform: 'uppercase',
                color: 'rgba(248,250,252,0.72)',
              }}
            >
              The Hippie Scientist
            </div>

            <div
              style={{
                display: 'flex',
                flexDirection: 'column',
                gap: '16px',
              }}
            >
              {metaLine ? (
                <div
                  style={{
                    display: 'flex',
                    fontSize: 20,
                    color: 'rgba(191,219,254,0.88)',
                  }}
                >
                  {metaLine}
                </div>
              ) : null}

              <div
                style={{
                  display: 'flex',
                  fontSize: 58,
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
                  fontSize: 26,
                  lineHeight: 1.35,
                  color: 'rgba(248,250,252,0.82)',
                }}
              >
                {excerpt}
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                gap: '12px',
                alignItems: 'center',
                flexWrap: 'wrap',
              }}
            >
              {['Blog', 'Herbs', 'Compounds'].map(label => (
                <div
                  key={label}
                  style={{
                    display: 'flex',
                    padding: '10px 16px',
                    borderRadius: '999px',
                    border: '1px solid rgba(255,255,255,0.14)',
                    background: 'rgba(255,255,255,0.06)',
                    fontSize: 20,
                    color: 'rgba(248,250,252,0.88)',
                  }}
                >
                  {label}
                </div>
              ))}
            </div>
          </div>

          <div
            style={{
              display: 'flex',
              width: '190px',
              height: '190px',
              alignSelf: 'center',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '999px',
              border: '1px solid rgba(255,255,255,0.14)',
              background:
                'radial-gradient(circle at 30% 30%, rgba(96,165,250,0.35), rgba(255,255,255,0.04))',
              fontSize: 28,
              fontWeight: 600,
              color: 'rgba(248,250,252,0.92)',
            }}
          >
            Blog
          </div>
        </div>
      </div>
    ),
    size,
  )
}
