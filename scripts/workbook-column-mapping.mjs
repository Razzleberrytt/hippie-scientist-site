const HEADER_NORMALIZATION_PATTERN = /[^a-z0-9]+/g
const WEAK_TEXT_VALUES = new Set(['nan', 'null', 'undefined', 'n/a', 'na', 'none', 'nil'])

const SHEET_HEADER_ALIASES = {
  'Herb Monographs': {
    reviewpriority: 'reviewPriority',
    scientificname: 'scientificName',
    latinname: 'scientificName',
    herbname: 'name',
    herbslug: 'slug',
    herbcanonicalname: 'name',
    herbcanonicalslug: 'slug',
    herbsummary: 'summary',
    herbdescription: 'description',
    moa: 'mechanism',
    evidencetier: 'evidenceLevel',
    evidenceleveltier: 'evidenceLevel',
    evidencetierv2: 'evidenceLevel',
    evidencetierv3: 'evidenceLevel',
    confidencelevel: 'confidenceLevel',
    confidence: 'confidenceLevel',
    topcompounds: 'topCompounds',
    activecompounds: 'activeCompounds',
    markercompounds: 'markerCompounds',
    mechanismtagsv2: 'mechanismTags',
    safetynotes: 'safetyNotes',
    safety: 'safetyNotes',
    interactionnotes: 'interactions',
    contraindicationnotes: 'contraindications',
    dose: 'dosage',
    dosageguidance: 'dosage',
    publishstatusv2: 'publishStatus',
    publishstatus: 'publishStatus',
    readystate: 'readinessFlag',
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
    evidencetierv3: 'evidenceTier',
    confidencelevel: 'confidenceLevel',
    compoundscore: 'score',
    score: 'score',
    scoretier: 'scoreTier',
  },
  'Herb Compound Map V3': {
    canonicalcompoundname: 'canonicalCompoundName',
    canonicalcompoundid: 'canonicalCompoundId',
    compoundname: 'canonicalCompoundName',
    herbcanonicalname: 'herbName',
    herbcanonicalslug: 'herbSlug',
    herbname: 'herbName',
    herbslug: 'herbSlug',
  },
  'Production Export V1': {},
}

function normalizeHeaderKey(value) {
  return String(value || '')
    .trim()
    .toLowerCase()
    .replace(HEADER_NORMALIZATION_PATTERN, '')
}

export function normalizeWorkbookCell(value) {
  if (value === null || value === undefined) return ''
  if (typeof value === 'number' && Number.isNaN(value)) return ''
  if (typeof value === 'string') {
    const text = value.trim()
    if (!text) return ''
    if (WEAK_TEXT_VALUES.has(text.toLowerCase())) return ''
    return text
  }
  return value
}

export function hasMeaningfulWorkbookValue(value) {
  const normalized = normalizeWorkbookCell(value)
  if (normalized === '') return false
  if (Array.isArray(normalized)) return normalized.length > 0
  return normalized !== null && normalized !== undefined
}

export function normalizeWorkbookMultiValue(value, splitPattern = /[;|]/) {
  if (Array.isArray(value)) {
    return [...new Set(value.map(item => normalizeWorkbookCell(item)).filter(Boolean))]
  }
  const text = normalizeWorkbookCell(value)
  if (typeof text !== 'string' || !text) return []
  return [...new Set(text.split(splitPattern).map(item => normalizeWorkbookCell(item)).filter(Boolean))]
}

export function canonicalizeWorkbookRow(row, sheetName) {
  const aliases = SHEET_HEADER_ALIASES[sheetName] || {}
  const out = {}

  for (const [rawKey, value] of Object.entries(row || {})) {
    const trimmedKey = String(rawKey || '').trim()
    if (!trimmedKey) continue

    const normalizedKey = normalizeHeaderKey(trimmedKey)
    const mappedKey = aliases[normalizedKey] || trimmedKey
    out[mappedKey] = normalizeWorkbookCell(value)
  }

  return out
}
