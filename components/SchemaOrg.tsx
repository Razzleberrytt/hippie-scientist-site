import type { SchemaNode } from '@/lib/schema'
import { sanitizeJsonLdPayload } from '@/lib/json-ld-sanitize'

type SchemaOrgProps = {
  graph?: Record<string, unknown> | null
  schema?: Record<string, unknown> | null
  node?: SchemaNode | null
  nodes?: Array<SchemaNode | null | undefined>
}

function hasGraphNodes(graph: Record<string, unknown>): boolean {
  return Array.isArray(graph['@graph']) && graph['@graph'].length > 0
}

function hasSchemaType(schema: Record<string, unknown>): boolean {
  return Boolean(schema['@type'])
}

function toPayload({
  graph,
  schema,
  node,
  nodes,
}: SchemaOrgProps): Record<string, unknown> | SchemaNode | null {
  if (graph) return hasGraphNodes(graph) ? graph : null
  if (schema) return hasSchemaType(schema) ? schema : null
  if (node) return node

  const graphNodes = (nodes ?? []).filter((item): item is SchemaNode => Boolean(item))
  if (!graphNodes.length) return null

  return {
    '@context': 'https://schema.org',
    '@graph': graphNodes.map(({ '@context': _context, ...item }) => item),
  }
}

function serializeJsonLd(payload: Record<string, unknown> | SchemaNode): string {
  return JSON.stringify(sanitizeJsonLdPayload(payload)).replace(/</g, '\\u003c')
}

export default function SchemaOrg(props: SchemaOrgProps) {
  const payload = toPayload(props)
  if (!payload) return null

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: serializeJsonLd(payload) }}
    />
  )
}
