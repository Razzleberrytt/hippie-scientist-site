import fs from 'fs'
import { hasMeaningfulText, normalizeStructuredText } from '../../lib/data-quality.mjs'

const DESCRIPTION_PLACEHOLDERS = [
  /evidence-aware botanical profile/i,
  /evidence-aware compound profile/i,
]

const DESCRIPTION_LEAK_PATTERNS = [
  { regex: /\bTODO\b/i, name: 'TODO' },
  { regex: /\bFIXME\b/i, name: 'FIXME' },
  { regex: /\blorem\b/i, name: 'Lorem Ipsum' },
  { regex: /\btest\b/i, name: 'Test String' },
  { regex: /lean bulk/i, name: 'Leaked "Lean bulk"' },
  { regex: /ingestion row/i, name: 'Leaked "ingestion row"' },
  { regex: /batch import/i, name: 'Leaked "batch import"' },
  { regex: /workbook row/i, name: 'Leaked "workbook row"' },
]

function issueFor(item, issue, value, severity) {
  return { slug: item.slug, name: item.name, type: item.type, issue, value, severity }
}

function run() {
  const herbsPath = 'public/data/herbs.json'
  const compoundsPath = 'public/data/compounds.json'
  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.')
    process.exit(1)
  }

  const allItems = [
    ...JSON.parse(fs.readFileSync(herbsPath, 'utf8')).map((item) => ({ ...item, type: 'herb' })),
    ...JSON.parse(fs.readFileSync(compoundsPath, 'utf8')).map((item) => ({ ...item, type: 'compound' })),
  ]

  const issues = []
  const descriptionMap = new Map()

  for (const item of allItems) {
    const description = normalizeStructuredText(item.description)

    // Completeness is owned by content-gap-report/profile-completeness. This
    // audit only records the bad description once, then focuses on qualities
    // unique to prose: length, leaks, and duplicate text.
    if (!hasMeaningfulText(description, DESCRIPTION_PLACEHOLDERS)) {
      issues.push(issueFor(item, 'Missing or placeholder description', description, 'HIGH'))
      continue
    }

    const normalized = description.toLowerCase()
    const group = descriptionMap.get(normalized) ?? []
    group.push(item)
    descriptionMap.set(normalized, group)

    if (description.length < 40) {
      issues.push(issueFor(item, `Short Description (${description.length} chars)`, description, 'MEDIUM'))
    }

    for (const pattern of DESCRIPTION_LEAK_PATTERNS) {
      if (!pattern.regex.test(description)) continue
      issues.push(issueFor(
        item,
        `Flagged Pattern: "${pattern.name}"`,
        description,
        pattern.name.startsWith('Leaked') ? 'CRITICAL' : 'HIGH',
      ))
    }
  }

  const duplicatesList = []
  for (const items of descriptionMap.values()) {
    if (items.length <= 1) continue
    const description = normalizeStructuredText(items[0].description)
    duplicatesList.push({
      description,
      count: items.length,
      items: items.map((item) => ({ name: item.name, slug: item.slug, type: item.type })),
    })
    for (const item of items) {
      issues.push(issueFor(
        item,
        `Duplicate Description (shared with ${items.length - 1} other profiles)`,
        description,
        'HIGH',
      ))
    }
  }

  fs.mkdirSync('reports', { recursive: true })
  const criticalIssues = issues.filter((issue) => issue.severity === 'CRITICAL')
  const otherIssues = issues
    .filter((issue) => issue.severity !== 'CRITICAL')
    .sort((a, b) => ({ HIGH: 1, MEDIUM: 2 }[a.severity] - { HIGH: 1, MEDIUM: 2 }[b.severity]) || String(a.name).localeCompare(String(b.name)))
  duplicatesList.sort((a, b) => b.count - a.count)

  const lines = [
    '# Description Quality Audit Report', '',
    `Generated on: ${new Date().toISOString()}`, '',
    'This audit intentionally does not independently score overall profile completeness. Missing/template description state is canonicalized by `lib/profile-completeness.mjs`; this report owns description-specific prose quality.', '',
    '## Summary Statistics', '',
    `- **Total Profiles Scanned**: ${allItems.length}`,
    `- **Total Description Quality Issues Flagged**: ${issues.length}`,
    `- **Critical Issues (Leaked Labels)**: ${criticalIssues.length}`,
    `- **High Severity (Missing/template/leaks/duplicates)**: ${issues.filter((issue) => issue.severity === 'HIGH').length}`,
    `- **Medium Severity (Short descriptions)**: ${issues.filter((issue) => issue.severity === 'MEDIUM').length}`,
    `- **Unique Duplicate Description Clusters**: ${duplicatesList.length}`, '',
    '## Critical Leaks & Pipeline Warnings', '',
    '| Profile Name | Slug | Type | Identified Leak / Issue | Description Text |',
    '| --- | --- | --- | --- | --- |',
  ]

  if (criticalIssues.length) {
    for (const issue of criticalIssues) lines.push(`| **${issue.name}** | \`${issue.slug}\` | ${issue.type} | ${issue.issue} | \`${issue.value}\` |`)
  } else {
    lines.push('| *None* | *None* | *None* | *No critical pipeline leaks detected!* | - |')
  }

  lines.push('', '## Duplicate Description Clusters', '',
    '| Duplicate Count | Shared Profiles | Shared Description Text |',
    '| --- | --- | --- |')
  if (duplicatesList.length) {
    for (const duplicate of duplicatesList) {
      const profiles = duplicate.items.map((item) => `**${item.name}** (\`${item.slug}\` - ${item.type})`).join('<br>')
      lines.push(`| ${duplicate.count} | ${profiles} | \`${duplicate.description}\` |`)
    }
  } else {
    lines.push('| *None* | *No duplicate description clusters found!* | - |')
  }

  lines.push('', '## Worst Offenders List', '',
    '| Profile Name | Slug | Type | Severity | Identified Quality Issue | Description Value |',
    '| --- | --- | --- | --- | --- | --- |')
  for (const issue of otherIssues.slice(0, 30)) {
    lines.push(`| **${issue.name}** | \`${issue.slug}\` | ${issue.type} | **${issue.severity}** | ${issue.issue} | \`${issue.value || '*empty*'}\` |`)
  }
  lines.push('')

  fs.writeFileSync('reports/description-quality.md', lines.join('\n'))
  console.log(`[description-quality] Scanned ${allItems.length} profiles; wrote reports/description-quality.md`)
}

run()
