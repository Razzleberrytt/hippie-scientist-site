import { serializeJsonLd } from '@/src/lib/schema-injector'

export default function JsonLd({ schema }: { schema: unknown }) {
  if (!schema) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(schema) }}
    />
  )
}
