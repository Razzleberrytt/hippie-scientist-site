/**
 * SchemaOrg — flexible JSON-LD <script> renderer.
 *
 * Accepts either:
 *  - `graph`  — a pre-built @graph object (from buildProfileSchemaGraph etc.)
 *  - `schema` — a flat JSON-LD object (from herbJsonLd, faqPageJsonLd etc.)
 *
 * Both render as <script type="application/ld+json"> in the document.
 * Null-safe: renders nothing when the schema is empty or malformed.
 *
 * Relationship to existing components:
 *  - components/seo/SchemaGraphScript.tsx handles @graph objects only.
 *  - This component is a superset: use it when you need to render either kind
 *    or want a named, stable import path.
 */

type SchemaOrgProps = {
  /** Pre-built @graph object (e.g. from buildProfileSchemaGraph). */
  graph?: Record<string, unknown> | null
  /** Flat JSON-LD object (e.g. from faqPageJsonLd, herbJsonLd). */
  schema?: Record<string, unknown> | null
}

export default function SchemaOrg({ graph, schema }: SchemaOrgProps) {
  if (graph) {
    const graphArray = graph['@graph']
    const hasNodes =
      Array.isArray(graphArray) && graphArray.length > 0
    if (!hasNodes) return null

    return (
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
      />
    )
  }

  if (schema) {
    const type = schema['@type']
    if (!type) return null

    return (
      <script
        type='application/ld+json'
        dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }}
      />
    )
  }

  return null
}
