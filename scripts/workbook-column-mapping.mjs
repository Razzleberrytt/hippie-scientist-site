const HEADER_NORMALIZATION_PATTERN = /[^a-z0-9]+/g

const SHEET_HEADER_ALIASES = {
  'Herb Monographs': {
    reviewpriority: 'reviewPriority',
    scientificname: 'scientificName',
    latinname: 'scientificName',
    herbname: 'name',
    herbslug: 'slug',
    evidencetier: 'evidenceLevel',
    evidenceleveltier: 'evidenceLevel',
    confidencelevel: 'confidenceLevel',
    topcompounds: 'topCompounds',
    publishstatusv2: 'publishStatus',
  },
  'Compound Master V3': {
    compound: 'compoundName',
    canonicalcompoundname: 'canonicalCompoundName',
    canonicalcompoundid: 'canonicalCompoundId',
    class: 'compoundClass',
    compoundclass: 'compoundClass',
    mechanism: 'mechanism',
    mechanismtags: 'mechanismTags',
    mechanismtagsv2: 'mechanismTags',
    pathwaytargets: 'pathwayTargets',
    knownaliases: 'aliases',
    sourceherb: 'sourceHerb',
    evidencetier: 'evidenceTier',
    evidencetierv2: 'evidenceTier',
    confidencelevel: 'confidenceLevel',
    scoretier: 'scoreTier',
  },
  'Herb Compound Map V3': {
    canonicalcompoundname: 'canonicalCompoundName',
    canonicalcompoundid: 'canonicalCompoundId',
    herbcanonicalname: 'herbName',
    herbcanonicalslug: 'herbSlug',
  },
  'Production Export V1': {},
}

function normalizeHeaderKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(HEADER_NORMALIZATION_PATTERN, '')
}

export function canonicalizeWorkbookRow(row, sheetName) {
  const aliases = SHEET_HEADER_ALIASES[sheetName] || {}
  const out = {}

  for (const [rawKey, value] of Object.entries(row || {})) {
    const trimmedKey = String(rawKey || '').trim()
    if (!trimmedKey) continue

    const normalizedKey = normalizeHeaderKey(trimmedKey)
    const mappedKey = aliases[normalizedKey] || trimmedKey
    out[mappedKey] = value
  }

  return out
}
