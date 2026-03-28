import React from 'react'
import { Helmet } from 'react-helmet-async'
import { useLocation } from 'react-router-dom'
import { TWITTER_HANDLE, buildMeta } from '@/lib/seo'
import ogManifest from '@/data/og-manifest.json'
import type { PageType } from '@/lib/seo'

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
  canonicalQueryAllowlist?: string[]
}

export default function Meta({
  title,
  description,
  path,
  image = '/icon-512x512.png',
  jsonLd,
  pageType = 'website',
  noindex = false,
  og,
  canonicalQueryAllowlist = [],
}: MetaProps) {
  const location = useLocation()
  const resolvedPath = path ?? `${location.pathname}${location.search}`
  const normalizedPath = resolvedPath.startsWith('/') ? resolvedPath : `/${resolvedPath}`

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
  const providedImage = image && image !== '/icon-512x512.png' ? image : undefined
  const overrideImage = og?.image
  const resolveExistingOgImage = (candidate?: string) => {
    if (!candidate?.startsWith('/og/')) return candidate
    if (candidate === '/og/default.png') {
      return ogManifest.default ? candidate : '/icon-512x512.png'
    }
    const herbMatch = candidate.match(/^\/og\/herb\/([^/]+)\.png$/)
    if (herbMatch) {
      return ogManifest.herb.includes(herbMatch[1]) ? candidate : '/og/default.png'
    }
    const blogMatch = candidate.match(/^\/og\/blog\/([^/]+)\.png$/)
    if (blogMatch) {
      return ogManifest.blog.includes(blogMatch[1]) ? candidate : '/og/default.png'
    }
    return candidate
  }
  const preferredImage = resolveExistingOgImage(
    overrideImage ?? jsonLdImage ?? providedImage ?? '/icon-512x512.png'
  )

  const meta = buildMeta({
    title,
    description,
    path: resolvedPath,
    image: preferredImage,
    keepQueryParams: canonicalQueryAllowlist,
  })
  const shouldNoIndex = noindex || normalizedPath.startsWith('/search')
  const ogTitle = og?.title ?? meta.title
  const ogDescription = og?.description ?? meta.description
  const ogImage = meta.image
  const ogUrl = og?.url ? buildMeta({ title, description, path: og.url }).url : meta.url
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
      <meta name='twitter:site' content={TWITTER_HANDLE} />
      <meta name='twitter:title' content={ogTitle} />
      <meta name='twitter:description' content={ogDescription} />
      <meta name='twitter:image' content={ogImage} />
      {jsonLd != null && <script type='application/ld+json'>{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
