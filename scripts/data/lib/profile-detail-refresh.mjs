const COMMON_WORKBOOK_OWNED_DETAIL_FIELDS = [
  'summary',
  'description',
]

const COMPOUND_WORKBOOK_OWNED_DETAIL_FIELDS = [
  'last_regulatory_check',
  'regulatory_changelog',
]

export function workbookOwnedDetailFields(kind) {
  if (kind === 'compound') {
    return [...COMMON_WORKBOOK_OWNED_DETAIL_FIELDS, ...COMPOUND_WORKBOOK_OWNED_DETAIL_FIELDS]
  }
  if (kind === 'herb') return [...COMMON_WORKBOOK_OWNED_DETAIL_FIELDS]
  throw new Error(`Unsupported profile kind: ${kind}`)
}

export function refreshWorkbookOwnedDetailFields(detailRecord, canonicalRecord, kind) {
  if (!detailRecord || typeof detailRecord !== 'object' || Array.isArray(detailRecord)) {
    throw new Error('detailRecord must be an object')
  }
  if (!canonicalRecord || typeof canonicalRecord !== 'object' || Array.isArray(canonicalRecord)) {
    throw new Error('canonicalRecord must be an object')
  }

  const changedFields = []
  for (const field of workbookOwnedDetailFields(kind)) {
    if (!Object.prototype.hasOwnProperty.call(canonicalRecord, field)) continue
    const before = JSON.stringify(detailRecord[field])
    const after = JSON.stringify(canonicalRecord[field])
    if (before === after) continue
    detailRecord[field] = canonicalRecord[field]
    changedFields.push(field)
  }
  return changedFields
}
