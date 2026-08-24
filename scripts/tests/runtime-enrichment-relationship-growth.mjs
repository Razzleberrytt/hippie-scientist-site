function clean(value) {
  if (value === null || value === undefined) return ''
  return String(value).replace(/\s+/g, ' ').trim()
}

function slug(value) {
  return clean(value)
    .toLowerCase()
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/&/g, ' and ')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-+|-+$/g, '')
}

function first(row, keys) {
  for (const key of keys) {
    const value = row?.[key]
    if (clean(value)) return value
  }
  return ''
}

function relationshipKey(row) {
  const source = slug(first(row, ['source_slug', 'herb_slug', 'herb slug', 'herb', 'herb_name']))
  const target = slug(first(row, ['target_slug', 'compound_slug', 'compound slug', 'compound', 'compound_name']))
  return source && target ? `${source}|${target}` : ''
}

// The Aug 23 ledger is immutable provenance, but whether one of its relationship
// candidates is eligible to become live depends on the current canonical
// Entity_Master taxonomy. Keep the test expectation independent from the parser
// implementation while applying the same published contract: only net-new
// herb -> compound pairs are materialized.
export function countEligibleNewRuntimeRelationships(
  entityRows,
  existingRelationshipRows,
  ledgerRelationships,
) {
  const entityTypes = new Map()
  for (const row of entityRows) {
    const entitySlug = slug(first(row, ['slug', 'entity_slug', 'name']))
    const entityType = clean(first(row, ['entity_type', 'type'])).toLowerCase()
    if (entitySlug) entityTypes.set(entitySlug, entityType)
  }

  const existingKeys = new Set(existingRelationshipRows.map(relationshipKey).filter(Boolean))
  let additions = 0

  for (const row of ledgerRelationships) {
    const sourceSlug = slug(row.source_slug)
    const targetSlug = slug(row.target_slug)
    const key = relationshipKey(row)
    if (!key || existingKeys.has(key)) continue
    if (entityTypes.get(sourceSlug) !== 'herb' || entityTypes.get(targetSlug) !== 'compound') continue

    existingKeys.add(key)
    additions += 1
  }

  return additions
}
