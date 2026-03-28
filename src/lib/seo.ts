export const SITE_URL = 'https://thehippiescientist.net'
export const SITE_NAME = 'The Hippie Scientist'
export const TWITTER_HANDLE = '@thehippiescientist'

export type PageType = 'website' | 'article'

export type BuildMetaArgs = {
  title: string
  description: string
  path?: string
  image?: string
  keepQueryParams?: string[]
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

const NON_CANONICAL_PARAM_PATTERNS: RegExp[] = [
  /^utm_/i,
  /^fbclid$/i,
  /^gclid$/i,
  /^msclkid$/i,
  /^ref$/i,
  /^source$/i,
]

export function normalizeCanonicalPath(path: string, keepQueryParams: string[] = []): string {
  const url = new URL(withLeadingSlash(path), SITE_URL)
  const allowed = new Set(keepQueryParams.map(value => value.toLowerCase()))
  const nextSearch = new URLSearchParams()

  for (const [key, value] of url.searchParams.entries()) {
    const keyLc = key.toLowerCase()
    const isBlocked = NON_CANONICAL_PARAM_PATTERNS.some(pattern => pattern.test(keyLc))
    if (isBlocked) continue
    if (allowed.has(keyLc)) {
      nextSearch.append(key, value)
    }
  }

  const sorted = [...nextSearch.entries()].sort(([a], [b]) => a.localeCompare(b))
  const finalSearch = new URLSearchParams(sorted)
  const search = finalSearch.toString()
  return `${url.pathname}${search ? `?${search}` : ''}`
}

export function buildMeta({
  title,
  description,
  path = '/',
  image = '/icon-512x512.png',
  keepQueryParams = [],
}: BuildMetaArgs): NormalizedMeta {
  const canonicalPath = normalizeCanonicalPath(path, keepQueryParams)
  const url = new URL(canonicalPath, SITE_URL).toString()

  const fallbackImage = image || '/icon-512x512.png'
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

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    name: SITE_NAME,
    url: SITE_URL,
    potentialAction: {
      '@type': 'SearchAction',
      target: `${SITE_URL}/herbs?query={search_term_string}`,
      'query-input': 'required name=search_term_string',
    },
  }
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    name: SITE_NAME,
    url: SITE_URL,
    logo: `${SITE_URL}/logo.svg`,
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
      name: SITE_NAME,
      url: SITE_URL,
      logo: {
        '@type': 'ImageObject',
        url: new URL('/logo.svg', SITE_URL).toString(),
      },
    },
  }
}

export type HerbJsonLdArgs = {
  name: string
  slug: string
  description?: string
  latinName?: string
  image?: string
}

export function herbJsonLd(herb: HerbJsonLdArgs) {
  const url = `${SITE_URL}/herbs/${herb.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: herb.name,
    description: herb.description || `${herb.name} herb profile — effects, safety, and pharmacology.`,
    url,
    mainEntityOfPage: url,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
    ...(herb.image ? { image: herb.image } : {}),
    about: {
      '@type': 'Thing',
      name: herb.latinName || herb.name,
    },
  }
}

export type CompoundJsonLdArgs = {
  name: string
  slug: string
  description?: string
  category?: string
}

export function compoundJsonLd(compound: CompoundJsonLdArgs) {
  const url = `${SITE_URL}/compounds/${compound.slug}`
  return {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: compound.name,
    description: compound.description || `${compound.name} pharmacology, effects, and safety profile.`,
    url,
    mainEntityOfPage: url,
    publisher: {
      '@type': 'Organization',
      name: SITE_NAME,
      url: SITE_URL,
      logo: { '@type': 'ImageObject', url: `${SITE_URL}/logo.svg` },
    },
    about: {
      '@type': 'ChemicalSubstance',
      name: compound.name,
      ...(compound.category ? { description: compound.category } : {}),
    },
  }
}

export function breadcrumbJsonLd(crumbs: Array<{ name: string; url: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: crumbs.map((crumb, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: crumb.name,
      item: crumb.url,
    })),
  }
}
