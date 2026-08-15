#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SOURCE_DIR = path.join(ROOT, 'data-sources', 'profile-feedback')
const OUT_DIR = path.join(ROOT, 'ops', 'reports')

function parseCsv(text) {
  const lines = text.trim().split(/\r?\n/)
  if (lines.length < 2) return []
  const header = lines[0].split(',').map((value) => value.trim().toLowerCase().replace(/[^a-z0-9]+/g, '_'))
  const get = (cells, key) => cells[header.indexOf(key)]?.trim() || ''
  return lines.slice(1).map((line) => {
    const cells = line.split(',')
    return {
      profileSlug: get(cells, 'profile_slug'),
      profileType: get(cells, 'profile_type'),
      field: get(cells, 'feedback_field').toLowerCase(),
      value: get(cells, 'feedback_value').toLowerCase(),
      count: Number.parseFloat(get(cells, 'event_count') || '0') || 0,
    }
  }).filter((row) => row.profileSlug && row.count > 0)
}

function weight(field, value) {
  if (field === 'clarity' && value === 'no') return 4
  if (field === 'clarity' && value === 'partly') return 2
  if (field === 'found_answer' && value === 'no') return 4
  if (field === 'missing_information') return 3
  return 0
}

const rows = fs.existsSync(SOURCE_DIR)
  ? fs.readdirSync(SOURCE_DIR).filter((name) => name.endsWith('.csv')).flatMap((name) => parseCsv(fs.readFileSync(path.join(SOURCE_DIR, name), 'utf8')))
  : []
const grouped = new Map()
for (const row of rows) {
  const key = `${row.profileType}:${row.profileSlug}`
  const current = grouped.get(key) || { profileType: row.profileType, profileSlug: row.profileSlug, totalResponses: 0, priorityScore: 0, signals: {} }
  const signal = `${row.field}:${row.value}`
  current.totalResponses += row.count
  current.priorityScore += row.count * weight(row.field, row.value)
  current.signals[signal] = (current.signals[signal] || 0) + row.count
  grouped.set(key, current)
}
const items = [...grouped.values()].filter((item) => item.priorityScore > 0).sort((a, b) => b.priorityScore - a.priorityScore || b.totalResponses - a.totalResponses)
fs.mkdirSync(OUT_DIR, { recursive: true })
const report = { generatedAt: new Date().toISOString(), privacyContract: 'Structured aggregate dimensions only; no free text or personal health information.', rowsIngested: rows.length, items }
fs.writeFileSync(path.join(OUT_DIR, 'profile-feedback-backlog.json'), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(OUT_DIR, 'profile-feedback-backlog.md'), ['# Profile feedback improvement backlog', '', report.privacyContract, '', '| Rank | Priority | Profile | Responses |', '| ---: | ---: | --- | ---: |', ...items.map((item, index) => `| ${index + 1} | ${item.priorityScore} | ${item.profileType}:${item.profileSlug} | ${item.totalResponses} |`), ''].join('\n'))
console.log(`[profile-feedback] rows=${rows.length} prioritizedProfiles=${items.length}`)
