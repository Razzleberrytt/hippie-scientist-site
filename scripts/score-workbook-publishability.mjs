import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const INPUT_PATH = path.join(ROOT, 'public', 'data', 'workbook-herbs.json')
const OUTPUT_JSON = path.join(ROOT, 'ops', 'reports', 'workbook-herbs-publishability.json')
const OUTPUT_MD = path.join(ROOT, 'ops', 'reports', 'workbook-herbs-publishability.md')

const rows = JSON.parse(fs.readFileSync(INPUT_PATH, 'utf8'))

function splitValues(value) {
  if (Array.isArray(value)) return value.map(v => String(v || '').trim()).filter(Boolean)
  return String(value || '')
    .split(/[|,;]/)
    .map(v => v.trim())
    .filter(Boolean)
}

function hasPlaceholder(text) {
  return /(unspecified|unknown|tbd|n\/?a|placeholder|lorem)/i.test(text)
}

function scoreRow(row) {
  const issues = []
  let severe = 0
  let moderate = 0
  let minor = 0

  const slug = String(row.slug || '').trim()
  const name = String(row.name || '').trim()
  if (!slug || !name) {
    return { score: 0, issues: ['missing identity fields'] }
  }

  const description = String(row.description || '').trim()
  if (!description) {
    severe += 1
    issues.push('missing description')
  } else {
    if (description.length < 140) {
      moderate += 1
      issues.push('description too short')
    }
    if (hasPlaceholder(description)) {
      moderate += 1
      issues.push('description contains placeholder language')
    }
  }

  const safetyNotes = String(row.safetyNotes || '').trim()
  if (!safetyNotes) {
    severe += 1
    issues.push('missing safety notes')
  } else if (safetyNotes.length < 40) {
    minor += 1
    issues.push('safety notes too brief')
  }

  for (const field of ['interactions', 'preparation']) {
    const value = String(row[field] || '').trim()
    if (!value) {
      moderate += 1
      issues.push(`missing ${field}`)
      continue
    }
    if (value.length < 40) {
      minor += 1
      issues.push(`${field} too brief`)
    }
    if (hasPlaceholder(value)) {
      moderate += 1
      issues.push(`${field} contains placeholder language`)
    }
  }

  const primaryActions = splitValues(row.primaryActions)
  const mechanisms = splitValues(row.mechanisms)
  const activeCompounds = splitValues(row.activeCompounds)

  if (primaryActions.length === 0) {
    moderate += 1
    issues.push('missing primary actions')
  } else if (primaryActions.length < 2) {
    minor += 1
    issues.push('primary actions too thin')
  }

  if (mechanisms.length === 0) {
    moderate += 1
    issues.push('missing mechanisms')
  } else if (mechanisms.length < 2) {
    minor += 1
    issues.push('mechanisms too thin')
  }

  if (activeCompounds.length === 0) {
    severe += 1
    issues.push('missing active compounds')
  } else if (activeCompounds.length < 2) {
    minor += 1
    issues.push('active compounds too thin')
  }

  let score = 5
  if (severe >= 3) score = 1
  else if (severe >= 1 && (severe >= 2 || moderate >= 2)) score = 2
  else if (severe >= 1) score = 3
  else if (moderate >= 4) score = 2
  else if (moderate >= 2) score = 3
  else if (moderate === 1 || minor >= 2) score = 4

  return { score, issues }
}

const scoredRows = rows.map(row => {
  const result = scoreRow(row)
  return {
    slug: row.slug,
    name: row.name,
    score: result.score,
    issues: result.issues,
  }
})

const counts = { 0: 0, 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 }
for (const row of scoredRows) counts[row.score] += 1

function issueFrequency(filteredRows) {
  const map = new Map()
  for (const row of filteredRows) {
    for (const issue of row.issues) {
      map.set(issue, (map.get(issue) || 0) + 1)
    }
  }
  return [...map.entries()]
    .map(([issue, count]) => ({ issue, count }))
    .sort((a, b) => b.count - a.count || a.issue.localeCompare(b.issue))
}

const byScore = {
  four: scoredRows.filter(row => row.score === 4),
  three: scoredRows.filter(row => row.score === 3),
}

const report = {
  generatedAt: new Date().toISOString(),
  source: path.relative(ROOT, INPUT_PATH),
  totalRows: scoredRows.length,
  scoreCounts: counts,
  score4Rows: byScore.four,
  score3Rows: byScore.three,
  commonIssuesByTier: {
    0: issueFrequency(scoredRows.filter(row => row.score === 0)),
    1: issueFrequency(scoredRows.filter(row => row.score === 1)),
    2: issueFrequency(scoredRows.filter(row => row.score === 2)),
    3: issueFrequency(byScore.three),
    4: issueFrequency(byScore.four),
    5: issueFrequency(scoredRows.filter(row => row.score === 5)),
  },
}

fs.mkdirSync(path.dirname(OUTPUT_JSON), { recursive: true })
fs.writeFileSync(OUTPUT_JSON, JSON.stringify(report, null, 2) + '\n', 'utf8')

const top4 = byScore.four.slice(0, 10)
const top3 = byScore.three.slice(0, 10)

const lines = [
  '# Workbook Herbs Publishability Report',
  '',
  `Generated: ${report.generatedAt}`,
  '',
  '## Score counts',
  '',
  `- 5: ${counts[5]}`,
  `- 4: ${counts[4]}`,
  `- 3: ${counts[3]}`,
  `- 2: ${counts[2]}`,
  `- 1: ${counts[1]}`,
  `- 0: ${counts[0]}`,
  '',
  '## Score 4 rows (fast wins)',
  '',
  ...top4.map(row => `- ${row.slug} (${row.name}) — ${row.issues.join('; ') || 'no issues flagged'}`),
  '',
  '## Score 3 rows (next priority)',
  '',
  ...top3.map(row => `- ${row.slug} (${row.name}) — ${row.issues.join('; ') || 'no issues flagged'}`),
  '',
  '## Common issues by tier',
  '',
]

for (const tier of [5, 4, 3, 2, 1, 0]) {
  lines.push(`### Score ${tier}`)
  const issues = report.commonIssuesByTier[tier]
  if (!issues.length) {
    lines.push('- none')
  } else {
    for (const item of issues.slice(0, 10)) {
      lines.push(`- ${item.issue}: ${item.count}`)
    }
  }
  lines.push('')
}

fs.writeFileSync(OUTPUT_MD, lines.join('\n'), 'utf8')

console.log(`Wrote ${path.relative(ROOT, OUTPUT_JSON)}`)
console.log(`Wrote ${path.relative(ROOT, OUTPUT_MD)}`)
