import crypto from 'node:crypto'

export const EXPECTED_ELIGIBLE = 97
export const EXPECTED_TREATMENT = 20
export const EXPECTED_CONTROL = 20
export const EXPECTED_OBSERVATIONAL = 57
export const DEFAULT_SEED = 'ths-crawl-indexing-rct-v1'

export function normalizeExperimentPath(value) {
  if (typeof value !== 'string' || !value.trim()) throw new Error('Missing URL/path')
  const raw = value.trim()
  const pathname = /^https?:\/\//i.test(raw) ? new URL(raw).pathname : raw.split(/[?#]/, 1)[0]
  const normalized = `/${pathname.replace(/^\/+|\/+$/g, '')}/`.replace(/\/{2,}/g, '/')
  if (!/^\/herbs\/[a-z0-9][a-z0-9-]*\/$/.test(normalized)) {
    throw new Error(`Experiment URL must be a canonical herb route: ${value}`)
  }
  return normalized
}

export function stableHash(value) {
  return crypto.createHash('sha256').update(String(value)).digest('hex')
}

export function stableStringify(value) {
  const normalize = (input) => {
    if (Array.isArray(input)) return input.map(normalize)
    if (input && typeof input === 'object') {
      return Object.keys(input).sort().reduce((out, key) => {
        out[key] = normalize(input[key])
        return out
      }, {})
    }
    return input
  }
  return JSON.stringify(normalize(value))
}

export function assignArms(rows, seed = DEFAULT_SEED) {
  const normalized = rows.map((row) => ({ ...row, pathname: normalizeExperimentPath(row.pathname || row.url) }))
  const unique = new Set(normalized.map((row) => row.pathname))
  if (normalized.length !== EXPECTED_ELIGIBLE || unique.size !== EXPECTED_ELIGIBLE) {
    throw new Error(`Expected exactly ${EXPECTED_ELIGIBLE} unique eligible URLs; got ${normalized.length} rows / ${unique.size} unique`)
  }
  const ranked = normalized
    .map((row) => ({ ...row, randomization_key: stableHash(`${seed}\0${row.pathname}`) }))
    .sort((a, b) => a.randomization_key.localeCompare(b.randomization_key) || a.pathname.localeCompare(b.pathname))

  return ranked.map((row, index) => ({
    ...row,
    arm: index < EXPECTED_TREATMENT
      ? 'treatment'
      : index < EXPECTED_TREATMENT + EXPECTED_CONTROL
        ? 'control'
        : 'observational',
  }))
}

export function validateAssignedRows(rows) {
  if (!Array.isArray(rows) || rows.length !== EXPECTED_ELIGIBLE) throw new Error('Manifest must contain exactly 97 rows')
  const unique = new Set(rows.map((row) => normalizeExperimentPath(row.pathname)))
  if (unique.size !== EXPECTED_ELIGIBLE) throw new Error('Manifest contains duplicate paths')
  const counts = rows.reduce((out, row) => {
    out[row.arm] = (out[row.arm] || 0) + 1
    return out
  }, {})
  if (counts.treatment !== EXPECTED_TREATMENT || counts.control !== EXPECTED_CONTROL || counts.observational !== EXPECTED_OBSERVATIONAL) {
    throw new Error(`Invalid arm counts: ${JSON.stringify(counts)}`)
  }
  return counts
}

export function parseCsv(text) {
  const rows = []
  let row = [], field = '', quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const ch = text[i]
    if (quoted) {
      if (ch === '"' && text[i + 1] === '"') { field += '"'; i += 1 }
      else if (ch === '"') quoted = false
      else field += ch
    } else if (ch === '"') quoted = true
    else if (ch === ',') { row.push(field); field = '' }
    else if (ch === '\n') { row.push(field); rows.push(row); row = []; field = '' }
    else if (ch !== '\r') field += ch
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  const nonEmpty = rows.filter((r) => r.some((v) => v.trim()))
  if (!nonEmpty.length) return []
  const headers = nonEmpty[0].map((h) => h.trim())
  return nonEmpty.slice(1).map((cells) => Object.fromEntries(headers.map((h, i) => [h, (cells[i] || '').trim()])))
}

export function toCsv(rows, columns) {
  const esc = (value) => {
    const text = value == null ? '' : String(value)
    return /[",\n]/.test(text) ? `"${text.replaceAll('"', '""')}"` : text
  }
  return [columns.join(','), ...rows.map((row) => columns.map((column) => esc(row[column])).join(','))].join('\n') + '\n'
}

export function addDaysIso(dateValue, days) {
  const date = new Date(dateValue)
  if (Number.isNaN(date.valueOf())) throw new Error(`Invalid date: ${dateValue}`)
  date.setUTCDate(date.getUTCDate() + days)
  return date.toISOString()
}
