type JsonLdPrimitive = string | number | boolean | null
export type JsonLdValue = JsonLdPrimitive | JsonLdObject | JsonLdValue[]
export type JsonLdObject = Record<string, JsonLdValue | undefined>

const INVALID_SCHEMA_PROPERTIES = new Set([
  'evidenceLevel',
  'knownUse',
  'safetyWarnings',
])

const NON_CREATIVE_ENTITY_TYPES = new Set([
  'ChemicalSubstance',
  'DietarySupplement',
  'Drug',
  'MedicalSubstance',
  'MedicalTherapy',
  'MolecularEntity',
  'Thing',
])

const ARTICLE_TYPES = new Set(['Article', 'BlogPosting', 'NewsArticle'])

function isObject(value: unknown): value is Record<string, unknown> {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function typeList(value: JsonLdValue | undefined): string[] {
  if (typeof value === 'string') return [value]
  if (Array.isArray(value)) {
    return value.filter((item): item is string => typeof item === 'string')
  }
  return []
}

function normalizedType(types: string[]): string | string[] {
  const cleaned = types.filter((type) => type !== 'DietarySupplement')
  if (!cleaned.length) return 'MedicalSubstance'
  return cleaned.length === 1 ? cleaned[0] : cleaned
}

function isArticleLike(types: string[]): boolean {
  return types.some((type) => ARTICLE_TYPES.has(type))
}

function isPureEntityNode(types: string[]): boolean {
  return types.length > 0 && types.every((type) => NON_CREATIVE_ENTITY_TYPES.has(type))
}

function sanitizeObject(input: Record<string, unknown>): JsonLdObject {
  const output: JsonLdObject = {}

  for (const [key, value] of Object.entries(input)) {
    if (INVALID_SCHEMA_PROPERTIES.has(key)) continue

    if (Array.isArray(value)) {
      output[key] = value.map((item) => sanitizeJsonLdValue(item)).filter((item): item is JsonLdValue => item !== undefined)
      continue
    }

    output[key] = sanitizeJsonLdValue(value)
  }

  const types = typeList(output['@type'])

  if (types.includes('DietarySupplement')) {
    output['@type'] = normalizedType(types)
  }

  const nextTypes = typeList(output['@type'])

  // Google reports `breadcrumb` as invalid on Article rich-result nodes. Keep the
  // standalone BreadcrumbList node in the @graph; do not attach it directly to Article.
  if (isArticleLike(nextTypes)) {
    delete output.breadcrumb
  }

  // Entity nodes such as MedicalSubstance / ChemicalSubstance are not CreativeWorks;
  // `isPartOf` is valid on WebPage/Article-style nodes, but creates rich-result
  // warnings when validators classify an entity as a product/snippet candidate.
  if (isPureEntityNode(nextTypes)) {
    delete output.isPartOf
  }

  // Carousel / ItemList validation requires each ListItem to expose either `item`
  // or `url`. Some internal comparison lists only had name/description.
  if (nextTypes.includes('ListItem') && !output.item && !output.url) {
    const name = typeof output.name === 'string' ? output.name : undefined
    const description = typeof output.description === 'string' ? output.description : undefined
    if (name || description) {
      output.item = {
        '@type': 'Thing',
        ...(name ? { name } : {}),
        ...(description ? { description } : {}),
      }
    }
  }

  return Object.fromEntries(
    Object.entries(output).filter(([, value]) => {
      if (value === undefined || value === null) return false
      if (Array.isArray(value)) return value.length > 0
      if (isObject(value)) return Object.keys(value).length > 0
      return true
    }),
  ) as JsonLdObject
}

export function sanitizeJsonLdValue(value: unknown): JsonLdValue | undefined {
  if (value === undefined) return undefined
  if (value === null || typeof value === 'string' || typeof value === 'number' || typeof value === 'boolean') {
    return value
  }
  if (Array.isArray(value)) {
    return value.map((item) => sanitizeJsonLdValue(item)).filter((item): item is JsonLdValue => item !== undefined)
  }
  if (isObject(value)) return sanitizeObject(value)
  return undefined
}

export function sanitizeJsonLdPayload(payload: unknown): JsonLdValue | undefined {
  return sanitizeJsonLdValue(payload)
}
