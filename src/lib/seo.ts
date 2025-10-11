const SITE_URL = 'https://thehippiescientist.net'

export type PageType = 'website' | 'article'

export type BuildMetaArgs = {
  title: string
  description: string
  path?: string
  image?: string
}

type NormalizedMeta = {
  title: string
  description: string
  url: string
  image: string
}

const isAbsoluteUrl = (value: string) => /^https?:\/\//i.test(value)
const withLeadingSlash = (value: string) => {
  if (!value) return '/'
  return value.startsWith('/') || isAbsoluteUrl(value) ? value : `/${value}`
}

export function buildMeta({
  title,
  description,
  path = '/',
  image = '/og/default.png',
}: BuildMetaArgs): NormalizedMeta {
  const canonicalPath = withLeadingSlash(path)
  const url = new URL(canonicalPath, SITE_URL).toString()

  const fallbackImage = image || '/og/default.png'
  const imageUrl = isAbsoluteUrl(fallbackImage)
    ? fallbackImage
    : new URL(withLeadingSlash(fallbackImage), SITE_URL).toString()

  return {
    title,
    description,
    url,
    image: imageUrl,
  }
}

type BlogJsonLdPost = {
  title: string
  slug: string
  date: string
  updated?: string
  description?: string
  excerpt?: string
  image?: string
}

export function blogJsonLd(post: BlogJsonLdPost, path: string) {
  const canonicalPath = withLeadingSlash(path)
  const url = new URL(canonicalPath, SITE_URL).toString()

  const description = post.description || post.excerpt || ''
  const published = new Date(post.date).toISOString()
  const modified = post.updated ? new Date(post.updated).toISOString() : published

  const imageUrl = post.image
    ? isAbsoluteUrl(post.image)
      ? post.image
      : new URL(withLeadingSlash(post.image), SITE_URL).toString()
    : undefined

  return {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description,
    datePublished: published,
    dateModified: modified,
    mainEntityOfPage: url,
    url,
    image: imageUrl,
    publisher: {
      '@type': 'Organization',
      name: 'The Hippie Scientist',
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: new URL('/logo.svg', SITE_URL).toString(),
      },
    },
  }
}
