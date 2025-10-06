import React from 'react'
import { Helmet } from 'react-helmet-async'

type Props = {
  title: string
  description?: string
  canonical?: string
  ogImage?: string
}

export default function SEO({ title, description, canonical, ogImage = '/ogimage.jpg' }: Props) {
  return (
    <Helmet>
      <title>{title}</title>
      {description && <meta name='description' content={description} />}
      {canonical && <link rel='canonical' href={canonical} />}
      <meta property='og:title' content={title} />
      {description && <meta property='og:description' content={description} />}
      <meta property='og:type' content='website' />
      {canonical && <meta property='og:url' content={canonical} />}
      <meta property='og:image' content={ogImage} />
    </Helmet>
  )
}
