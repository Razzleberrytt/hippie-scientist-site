import React from 'react'
import { sanitizeJsonLdPayload } from '@/lib/json-ld-sanitize'

export default function JsonLd({ schema }: { schema: any }) {
  if (!schema) return null

  // Safely serialize and escape HTML tags (like '<') to prevent XSS injection.
  // Also normalize known schema.org validation traps before JSON-LD reaches the page.
  const escapedJson = JSON.stringify(sanitizeJsonLdPayload(schema) ?? {}).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapedJson }}
    />
  )
}
