#!/usr/bin/env node

/**
 * Convert exported aggregate `profile_feedback` analytics rows into a ranked
 * content-improvement backlog. No free-text or personal health fields are
 * accepted; only the structured dimensions emitted by ProfileFeedbackControls.
 *
 * Expected CSV columns (case/spacing tolerant):
 * profile_slug, profile_type, feedback_field, feedback_value, event_count
 */

import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCE_DIR = path.join(ROOT, 'data-sources', 'profile-feedback')
const OUT_DIR = path.join(ROOT, 'ops', 'reports')
const JSON_PATH = path.join(OUT_DIR, 'profile-feedback-backlog.json')
const MD_PATH = path.join(OUT_DIR, 'profile-feedback-backlog.md')

function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let index = 0; index < content.length; index += 1) {
    const char = content[index]
    if (quoted) {
      if (char === '"' && content[index + 1] === '"') {
        field += '"'
        index += 1
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') field += char
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((cells) => cells.some((cell) => String(cell).trim()))
}

function normalizeHeader(value) {
  return String(value).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '')
}

function number(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/,/g, '').trim())
  return Number.isFinite(parsed) && parsed > 0 ? parsed : 0
}

function loadRows() {
  if (!fs.existsSync(SOURCE_DIR)) return []
  const files = fs.readdirSync(SOURCE_DIR).filter((name) => name.toLowerCase().endsWith('.csv'))
  return files.flatMap((name) => {
    const parsed = parseCsv(fs.readFileSync(path.join(SOURCE_DIR, name), 'utf8'))
    if (parsed.length < 2) return []
    const header = parsed[0].map(normalizeHeader)
    const indexOf = (...names) => names.map(normalizeHeader).map((candidate) => header.indexOf(candidate)).find((index) => index >= 0) ?? -1
    const indexes = {
      slug: indexOf('profile_slug', 'Profile slug'),
      type: indexOf('profile_type', 'Profile type'),
      field: indexOf('feedback_field', 'Feedback field'),
      value: indexOf('feedback_value', 'Feedback value'),
      count: indexOf('event_count', 'Event count', 'count'),
    }
    if (Object.values(indexes).some((index) => index < 0)) {
      throw new Error(`${name} must include profile_slug, profile_type, feedback_field, feedback_value, event_count`)
    }
    return parsed.slice(1).map((cells) => ({
      slug: String(cells[indexes.slug] || '').trim(),
      type: String(cells[indexes.type] || '').trim(),
      field: String(cells[indexes.field] || '').trim().toLowerCase(),
      value: String(cells[indexes.value] || '').trim().toLowerCase(),
      count: number(cells[indexes.count]),
      sourceFile: name,
    })).filter((row) => row.slug && row.count > 0)
  })
}

function weight(field, value) {
  if (field === 'clarity' && value === 'no') return 4
  if (field === 'clarity' && value === 'partly') return 2
  if (field === 'found_answer' && value === 'no') return 4
  if (field === 'missing_information') return 3
  return 0
}

function main() {
  const rows = loadRows()
  const grouped = new Map()

  for (const row of rows) {
    const key = `${row.type}:${row.slug}`
    const current = grouped.get(key) || {
      profileType: row.type,
      profileSlug: row.slug,
      signals: {},
      totalResponses: 0,
      priorityScore: 0,
    }
    const signalKey = `${row.field}:${row.value}`
    current.signals[signalKey] = (current.signals[signalKey] || 0) + row.count
    current.totalResponses += row.count
    current.priorityScore += row.count * weight(row.field, row.value)
    grouped.set(key, current)
  }

  const items = [...grouped.values()]
    .filter((item) => item.priorityScore > 0)
    .map((item) => ({
      ...item,
      dominantMissingCategory: Object.entries(item.signals)
        .filter(([key]) => key.startsWith('missing_information:'))
        .sort((a, b) => b[1] - a[1])[0]?.[0]?.split(':')[1] || null,
    }))
    .sort((a, b) => b.priorityScore - a.priorityScore || b.totalResponses - a.totalResponses || a.profileSlug.localeCompare(b.profileSlug))

  const report = {
    generatedAt: new Date().toISOString(),
    sourceDirectory: path.relative(ROOT, SOURCE_DIR),
    privacyContract: 'Structured aggregate dimensions only; no free text, symptoms, diagnoses, medications, or medical records.',
    rowsIngested: rows.length,
    items,
  }

  fs.mkdirSync(OUT_DIR, { recursive: true })
  fs.writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  fs.writeFileSync(MD_PATH, [
    '# Profile feedback improvement backlog',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    report.privacyContract,
    '',
    '| Rank | Priority | Profile | Responses | Dominant missing information |',
    '| ---: | ---: | --- | ---: | --- |',
    ...items.map((item, index) => `| ${index + 1} | ${item.priorityScore} | ${item.profileType}:${item.profileSlug} | ${item.totalResponses} | ${item.dominantMissingCategory || '—'} |`),
    '',
  ].join('\n'))

  console.log(`[profile-feedback] rows=${rows.length} prioritizedProfiles=${items.length}`)
}

try {
  main()
} catch (error) {
  console.error(`[profile-feedback] ${error.message}`)
  process.exitCode = 1
}
