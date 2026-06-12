import SchemaOrg from '@/components/SchemaOrg'

type SchemaGraphScriptProps = {
  graph: Record<string, unknown>
}

export default function SchemaGraphScript({ graph }: SchemaGraphScriptProps) {
  return <SchemaOrg graph={graph} />
}
