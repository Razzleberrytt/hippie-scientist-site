import React from 'react'

export default function JsonLd({ schema }: { schema: any }) {
  if (!schema) return null

  // Safely serialize and escape HTML tags (like '<') to prevent XSS injection
  const escapedJson = JSON.stringify(schema).replace(/</g, '\\u003c')

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: escapedJson }}
    />
  )
}
