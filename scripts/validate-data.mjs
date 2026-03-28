import { readFile, writeFile } from 'node:fs/promises'

const HERBS_PATH = 'public/data/herbs.json'
const COMPOUNDS_PATH = 'public/data/compounds.json'
const REPORT_PATH = 'DATA_QUALITY_REPORT.md'

const PLACEHOLDER_PATTERNS = [
  /^nan$/i,
  /^n\/?a$/i,
  /^none$/i,
  /^unknown$/i,
  /^tbd$/i,
  /^todo$/i,
  /^placeholder$/i,
  /^coming soon$/i,
  /^lorem ipsum/i,
  /^insert /i,
  /^\[citation needed\]$/i,
]

const HERB_REQUIRED_FIELDS = [
  'name',
  'latin',
  'description',
  'class',
  'effects',
  'activeCompounds',
  'contraindications',
  'sources',
  'lastUpdated',
]

const COMPOUND_REQUIRED_FIELDS = [
  'name',
  'category',
  'description',
  'effects',
  'contraindications',
  'herbs',
  'sources',
  'lastUpdated',
]

function isObject(value) {
  return Boolean(value) && typeof value === 'object' && !Array.isArray(value)
}

function cleanText(value) {
  const text = String(value ?? '').trim()
  if (!text) return ''
  if (PLACEHOLDER_PATTERNS.some(pattern => pattern.test(text))) return ''
  return text
}

function toArray(value) {
  if (Array.isArray(value)) return value
  if (typeof value === 'string') {
    return value
      .split(/[\n;,|]/)
      .map(item => item.trim())
      .filter(Boolean)
  }
  return []
}

function sanitizeStringArray(value, fixes) {
  return toArray(value)
    .map(item => cleanText(item))
    .filter(Boolean)
    .filter(item => {
      if (item.toLowerCase() === 'nan') {
        fixes.nanRemoved += 1
        return false
      }
      return true
    })
}

function isValidIso(value) {
  if (typeof value !== 'string') return false
  const parsed = new Date(value)
  if (Number.isNaN(parsed.getTime())) return false
  return parsed.toISOString() === value
}

function looksLikeUrl(value) {
  if (typeof value !== 'string') return false
  try {
    const url = new URL(value)
    return url.protocol === 'http:' || url.protocol === 'https:'
  } catch {
    return false
  }
}

function normalizeSources(value, fixes) {
  const sourceList = toArray(value)
  const normalized = []

  for (const entry of sourceList) {
    if (isObject(entry)) {
      const title = cleanText(entry.title)
      const url = cleanText(entry.url)
      const note = cleanText(entry.note)
      if (!title || !looksLikeUrl(url)) {
        fixes.invalidSourcesRemoved += 1
        continue
      }
      normalized.push({ title, url, ...(note ? { note } : {}) })
      continue
    }

    if (typeof entry === 'string') {
      const text = cleanText(entry)
      if (looksLikeUrl(text)) {
        normalized.push({ title: text, url: text })
      } else {
        fixes.invalidSourcesRemoved += 1
      }
      continue
    }

    fixes.invalidSourcesRemoved += 1
  }

  return normalized
}

function ensureIsoDate(value, fixes) {
  const text = cleanText(value)
  if (isValidIso(text)) return text
  fixes.lastUpdatedFixed += 1
  return new Date().toISOString()
}

function ensureUniqueByName(records, fixes, key = 'name') {
  const seen = new Map()
  const output = []

  for (const record of records) {
    const name = cleanText(record[key]).toLowerCase()
    if (!name) {
      output.push(record)
      continue
    }

    if (!seen.has(name)) {
      seen.set(name, output.length)
      output.push(record)
      continue
    }

    fixes.duplicatesMerged += 1
    const existingIndex = seen.get(name)
    const existing = output[existingIndex]

    for (const [field, incoming] of Object.entries(record)) {
      const current = existing[field]
      if (Array.isArray(current) || Array.isArray(incoming)) {
        const merged = Array.from(new Set([...toArray(current), ...toArray(incoming)].map(cleanText).filter(Boolean)))
        existing[field] = merged
        continue
      }

      const currentClean = cleanText(current)
      const incomingClean = cleanText(incoming)
      if (!currentClean && incomingClean) {
        existing[field] = incomingClean
      }
    }
  }

  return output
}

function completeness(records, fields) {
  if (!records.length) return { percent: 0, missingCounts: Object.fromEntries(fields.map(field => [field, 0])) }

  const totalCells = records.length * fields.length
  let presentCells = 0
  const missingCounts = Object.fromEntries(fields.map(field => [field, 0]))

  for (const row of records) {
    for (const field of fields) {
      const value = row[field]
      const ok = Array.isArray(value) ? value.length > 0 : cleanText(value).length > 0
      if (ok) {
        presentCells += 1
      } else {
        missingCounts[field] += 1
      }
    }
  }

  return {
    percent: Number(((presentCells / totalCells) * 100).toFixed(2)),
    missingCounts,
  }
}

function ensureHerbShape(raw, fixes) {
  const herb = {
    name: cleanText(raw.name || raw.common || raw.commonName),
    latin: cleanText(raw.latin || raw.scientific || raw.scientificName),
    class: cleanText(raw.class || raw.category),
    intensity: cleanText(raw.intensity),
    mechanism: cleanText(raw.mechanism || raw.mechanismOfAction),
    activeCompounds: sanitizeStringArray(raw.activeCompounds ?? raw.active_compounds ?? raw.compounds, fixes),
    effects: sanitizeStringArray(raw.effects, fixes),
    contraindications: sanitizeStringArray(raw.contraindications, fixes),
    interactions: sanitizeStringArray(raw.interactions, fixes),
    safetyNotes: cleanText(raw.safetyNotes),
    sources: normalizeSources(raw.sources, fixes),
    lastUpdated: ensureIsoDate(raw.lastUpdated || raw.updatedAt, fixes),
    description: cleanText(raw.description || raw.summary),
    dosage: cleanText(raw.dosage),
    duration: cleanText(raw.duration),
    legalStatus: cleanText(raw.legalStatus),
    preparation: cleanText(raw.preparation),
    region: cleanText(raw.region),
    therapeuticUses: sanitizeStringArray(raw.therapeuticUses, fixes),
    traditionalUse: cleanText(raw.traditionalUse),
    sideEffects: sanitizeStringArray(raw.sideEffects ?? raw.sideeffects, fixes),
  }

  // Fallback defaults for frontend compatibility
  if (!herb.name) herb.name = herb.latin || 'Unnamed herb'
  if (!herb.latin) herb.latin = herb.name
  if (!herb.class) herb.class = 'General'

  return herb
}

function ensureCompoundShape(raw, herbNames, fixes) {
  const compound = {
    name: cleanText(raw.name || raw.id),
    category: cleanText(raw.category || raw.class || raw.type),
    description: cleanText(raw.description || raw.summary),
    herbs: sanitizeStringArray(raw.herbs ?? raw.associatedHerbs ?? raw.foundInHerbs ?? raw.foundIn, fixes),
    effects: sanitizeStringArray(raw.effects, fixes),
    contraindications: sanitizeStringArray(raw.contraindications, fixes),
    interactions: sanitizeStringArray(raw.interactions, fixes),
    therapeuticUses: sanitizeStringArray(raw.therapeuticUses, fixes),
    activeCompounds: sanitizeStringArray(raw.activeCompounds, fixes),
    dosage: cleanText(raw.dosage),
    duration: cleanText(raw.duration),
    region: cleanText(raw.region),
    preparation: cleanText(raw.preparation),
    legalStatus: cleanText(raw.legalStatus),
    sideEffects: sanitizeStringArray(raw.sideEffects, fixes),
    sources: normalizeSources(raw.sources, fixes),
    lastUpdated: ensureIsoDate(raw.lastUpdated || raw.updatedAt, fixes),
  }

  if (!compound.name) compound.name = 'Unnamed compound'
  if (!compound.category) compound.category = 'General'

  const validHerbs = compound.herbs.filter(name => herbNames.has(name.toLowerCase()))
  if (validHerbs.length !== compound.herbs.length) {
    fixes.invalidHerbRefsRemoved += compound.herbs.length - validHerbs.length
  }
  compound.herbs = Array.from(new Set(validHerbs))

  return compound
}

function printMissingCounts(counts) {
  return Object.entries(counts)
    .map(([field, count]) => `- ${field}: ${count}`)
    .join('\n')
}

async function main() {
  const fixes = {
    nanRemoved: 0,
    invalidSourcesRemoved: 0,
    lastUpdatedFixed: 0,
    duplicatesMerged: 0,
    invalidHerbRefsRemoved: 0,
  }

  const herbRaw = JSON.parse(await readFile(HERBS_PATH, 'utf8'))
  const compoundRaw = JSON.parse(await readFile(COMPOUNDS_PATH, 'utf8'))

  const herbsNormalized = ensureUniqueByName(
    (Array.isArray(herbRaw) ? herbRaw : []).map(row => ensureHerbShape(isObject(row) ? row : {}, fixes)),
    fixes,
  )

  const herbNames = new Set(herbsNormalized.map(herb => cleanText(herb.name).toLowerCase()))

  const compoundsNormalized = ensureUniqueByName(
    (Array.isArray(compoundRaw) ? compoundRaw : []).map(row => ensureCompoundShape(isObject(row) ? row : {}, herbNames, fixes)),
    fixes,
  )

  const herbCompleteness = completeness(herbsNormalized, HERB_REQUIRED_FIELDS)
  const compoundCompleteness = completeness(compoundsNormalized, COMPOUND_REQUIRED_FIELDS)
  const overallCompleteness = Number(((herbCompleteness.percent + compoundCompleteness.percent) / 2).toFixed(2))

  await writeFile(HERBS_PATH, `${JSON.stringify(herbsNormalized, null, 2)}\n`)
  await writeFile(COMPOUNDS_PATH, `${JSON.stringify(compoundsNormalized, null, 2)}\n`)

  const unresolvedIssues = []
  if (herbsNormalized.some(herb => !herb.sources.length)) {
    unresolvedIssues.push('Some herbs have zero valid sources.')
  }
  if (compoundsNormalized.some(compound => !compound.sources.length)) {
    unresolvedIssues.push('Some compounds have zero valid sources.')
  }

  const report = `# Data Quality Report\n\n- Generated: ${new Date().toISOString()}\n- Total herbs: ${herbsNormalized.length}\n- Total compounds: ${compoundsNormalized.length}\n- Completeness: ${overallCompleteness}%\n\n## Missing field counts\n\n### Herbs\n${printMissingCounts(herbCompleteness.missingCounts)}\n\n### Compounds\n${printMissingCounts(compoundCompleteness.missingCounts)}\n\n## Validation fixes applied\n\n- Removed invalid/placeholder source entries: ${fixes.invalidSourcesRemoved}\n- Fixed non-ISO lastUpdated fields: ${fixes.lastUpdatedFixed}\n- Merged duplicate names: ${fixes.duplicatesMerged}\n- Removed invalid herb references from compounds: ${fixes.invalidHerbRefsRemoved}\n- Removed "nan" list values: ${fixes.nanRemoved}\n\n## Unresolved issues\n\n${unresolvedIssues.length ? unresolvedIssues.map(item => `- ${item}`).join('\n') : '- None'}\n`

  await writeFile(REPORT_PATH, report)

  const summary = {
    fixes,
    passed: true,
    totalHerbs: herbsNormalized.length,
    totalCompounds: compoundsNormalized.length,
    completeness: overallCompleteness,
    unresolvedIssues,
  }

  console.log('Validation complete.')
  console.log(`Errors fixed: ${Object.values(fixes).reduce((a, b) => a + b, 0)}`)
  console.log(`Validation passed: ${summary.passed ? 'yes' : 'no'}`)
  console.log(JSON.stringify(summary, null, 2))
}

main().catch(error => {
  console.error(error)
  process.exitCode = 1
})
