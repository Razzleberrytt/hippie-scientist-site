import fs from 'node:fs/promises'

export function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') {
        field += '"'
        i += 1
      } else quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(field)
      field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(field)
      field = ''
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
    } else field += char
  }

  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (rows.length < 2) return []

  const headers = rows[0].map((value) => value.trim())
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

export async function readAnalyticsExport(file) {
  try {
    const text = await fs.readFile(file, 'utf8')
    if (file.toLowerCase().endsWith('.csv')) return { rows: parseCsv(text), metadata: {} }
    const parsed = JSON.parse(text)
    if (Array.isArray(parsed)) return { rows: parsed, metadata: {} }
    return {
      rows: Array.isArray(parsed.events) ? parsed.events : Array.isArray(parsed.rows) ? parsed.rows : [],
      metadata: parsed,
    }
  } catch (error) {
    if (error?.code === 'ENOENT') return { rows: [], metadata: { missingInput: true } }
    throw error
  }
}

export function first(record, keys) {
  for (const key of keys) {
    if (record?.[key] !== undefined && record?.[key] !== null && record?.[key] !== '') return record[key]
  }
  return undefined
}

export function eventCount(record) {
  const value = Number(first(record, ['event_count', 'eventCount', 'count', 'clicks']) ?? 1)
  return Number.isFinite(value) && value > 0 ? value : 1
}

export function normalizePagePath(value) {
  if (!value) return null
  let path = String(value).trim()
  try {
    if (/^https?:\/\//i.test(path)) path = new URL(path).pathname
  } catch {}
  path = path.split(/[?#]/)[0]
  if (!path.startsWith('/')) path = `/${path}`
  if (path !== '/' && !path.endsWith('/')) path += '/'
  return path
}
