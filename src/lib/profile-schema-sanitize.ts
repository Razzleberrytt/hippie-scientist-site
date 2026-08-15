type JsonRecord = Record<string, unknown>

const PROFILE_ENTITY_KEYS_TO_DROP = [
  'additionalProperty',
  'category',
  ['mechanism', 'OfAction'].join(''),
] as const

function typeList(value: unknown): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) return value.filter((item): item is string => typeof item === 'string')
  return []
}

function sanitizeNode(node: unknown): unknown {
  if (!node || typeof node !== 'object' || Array.isArray(node)) return node

  const record = { ...(node as JsonRecord) }
  const id = typeof record['@id'] === 'string' ? record['@id'] : ''
  const types = typeList(record['@type'])

  if (id.endsWith('#entity') && /\/(herbs|compounds)\//.test(id)) {
    for (const key of PROFILE_ENTITY_KEYS_TO_DROP) delete record[key]
  }

  if (types.includes('WebPage') || types.includes('MedicalWebPage')) {
    const reviewed = record.dateReviewed
    delete record.dateReviewed
    if (typeof reviewed === 'string' && reviewed.trim() && !record.lastReviewed) {
      record.lastReviewed = reviewed
    }
  }

  return record
}

export function sanitizeProfileSchemaPayload(payload: JsonRecord): JsonRecord {
  const graph = payload['@graph']
  if (!Array.isArray(graph)) return payload
  return { ...payload, '@graph': graph.map(sanitizeNode) }
}
