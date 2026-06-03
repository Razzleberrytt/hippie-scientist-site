type SchemaGraphScriptProps = {
  graph: Record<string, unknown>
}

export default function SchemaGraphScript({ graph }: SchemaGraphScriptProps) {
  if (!graph['@graph'] || !Array.isArray(graph['@graph']) || graph['@graph'].length === 0) {
    return null
  }

  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(graph) }}
    />
  )
}