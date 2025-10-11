import React from 'react'
import { Helmet } from 'react-helmet-async'
import { buildMeta } from '../lib/seo'
import type { PageType } from '../lib/seo'

type OpenGraphOverrides = {
  title?: string
  description?: string
  image?: string
  url?: string
  type?: PageType
  articlePublishedTime?: string
}

type MetaProps = {
  title: string
  description: string
  path?: string
  image?: string
  jsonLd?: unknown
  pageType?: PageType
  noindex?: boolean
  og?: OpenGraphOverrides
}

export default function Meta({
  title,
  description,
  path = '/',
  image = '/og/default.png',
  jsonLd,
  pageType = 'website',
  noindex = false,
  og,
}: MetaProps) {
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const slug = normalizedPath
    .split('/')
    .filter(Boolean)
    .pop()
  const inferredOg =
    normalizedPath.startsWith('/blog/') && slug
      ? `/og/blog/${slug}.png`
      : normalizedPath.startsWith('/herb/') && slug
        ? `/og/herb/${slug}.png`
        : '/og/default.png'

  const extractJsonLdImage = (value: unknown): string | undefined => {
    if (!value) return undefined
    if (Array.isArray(value)) {
      for (const item of value) {
        const found = extractJsonLdImage(item)
        if (found) return found
      }
      return undefined
    }
    if (typeof value === 'object') {
      const record = value as Record<string, unknown>
      if (record.image) {
        return extractJsonLdImage(record.image)
      }
      if (record['@graph']) {
        return extractJsonLdImage(record['@graph'])
      }
      return undefined
    }
    if (typeof value === 'string') return value
    return undefined
  }

  const jsonLdImage = extractJsonLdImage(jsonLd)
  const providedImage = image && image !== '/og/default.png' ? image : undefined
  const overrideImage = og?.image
  const preferredImage = overrideImage ?? jsonLdImage ?? providedImage ?? inferredOg

  const meta = buildMeta({ title, description, path, image: preferredImage })
  const shouldNoIndex = noindex || normalizedPath.startsWith('/search')
  const ogTitle = og?.title ?? meta.title
  const ogDescription = og?.description ?? meta.description
  const ogImage = meta.image
  const ogUrl = og?.url ?? meta.url
  const ogType = og?.type ?? pageType
  const articlePublishedTime = og?.articlePublishedTime
    ? new Date(og.articlePublishedTime).toISOString()
    : undefined

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <link rel='canonical' href={meta.url} />
      {shouldNoIndex && <meta name='robots' content='noindex,nofollow' />}
      <meta name='description' content={meta.description} />
      <meta property='og:type' content={ogType} />
      <meta property='og:url' content={ogUrl} />
      <meta property='og:title' content={ogTitle} />
      <meta property='og:description' content={ogDescription} />
      <meta property='og:image' content={ogImage} />
      {articlePublishedTime && (
        <meta property='article:published_time' content={articlePublishedTime} />
      )}
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={ogTitle} />
      <meta name='twitter:description' content={ogDescription} />
      <meta name='twitter:image' content={ogImage} />
      {jsonLd && (
        <script type='application/ld+json'>{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
