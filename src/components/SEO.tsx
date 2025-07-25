import React from 'react'
import { Helmet } from 'react-helmet-async'

interface SEOProps {
  title: string
  description: string
  keywords?: string[]
  jsonLd?: Record<string, unknown>
}

/**
 * Reusable component for injecting SEO meta tags and structured data.
 */
export default function SEO({ title, description, keywords = [], jsonLd }: SEOProps) {
  return (
    <Helmet>
      <title>{title}</title>
      <meta name='description' content={description} />
      {keywords.length > 0 && <meta name='keywords' content={keywords.join(', ')} />}
      {jsonLd && <script type='application/ld+json'>{JSON.stringify(jsonLd)}</script>}
    </Helmet>
  )
}
