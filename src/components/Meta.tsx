import React from 'react'
import { Helmet } from 'react-helmet-async'
import { buildMeta } from '../lib/seo'
import type { PageType } from '../lib/seo'

type MetaProps = {
  title: string
  description: string
  path?: string
  image?: string
  jsonLd?: unknown
  pageType?: PageType
  noindex?: boolean
}

export default function Meta({
  title,
  description,
  path = '/',
  image = '/og/default.png',
  jsonLd,
  pageType = 'website',
  noindex = false,
}: MetaProps) {
  const meta = buildMeta({ title, description, path, image })

  return (
    <Helmet prioritizeSeoTags>
      <title>{meta.title}</title>
      <link rel='canonical' href={meta.url} />
      {noindex && <meta name='robots' content='noindex,nofollow' />}
      <meta name='description' content={meta.description} />
      <meta property='og:type' content={pageType} />
      <meta property='og:url' content={meta.url} />
      <meta property='og:title' content={meta.title} />
      <meta property='og:description' content={meta.description} />
      <meta property='og:image' content={meta.image} />
      <meta name='twitter:card' content='summary_large_image' />
      <meta name='twitter:title' content={meta.title} />
      <meta name='twitter:description' content={meta.description} />
      <meta name='twitter:image' content={meta.image} />
      {jsonLd && (
        <script type='application/ld+json'>{JSON.stringify(jsonLd)}</script>
      )}
    </Helmet>
  )
}
