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
  const meta = buildMeta({ title, description, path, image })
  const normalizedPath = path.startsWith('/') ? path : `/${path}`
  const shouldNoIndex = noindex || normalizedPath.startsWith('/search')
  const ogTitle = og?.title ?? meta.title
  const ogDescription = og?.description ?? meta.description
  const ogImage = og?.image ?? meta.image
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
