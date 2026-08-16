import fs from 'node:fs'
import { collectionHasMeaningfulText } from '../../lib/data-quality.mjs'
import { evaluateProfileCompleteness } from '../../lib/profile-completeness.mjs'

const REPORT_DIR = 'reports'

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true })
}

export function checkSafety(value) {
  return collectionHasMeaningfulText(value)
}

export function loadDocumentedSafetyExceptions() {
  const slugs = new Set()
  for (const ledgerPath of [
    'data-sources/safety-evidence-limited-exceptions.json',
    'data-sources/safety-evidence-limited-primary-runtime-exceptions.json',
  ]) {
    if (!fs.existsSync(ledgerPath)) continue
    const parsed = JSON.parse(fs.readFileSync(ledgerPath, 'utf8'))
    for (const entry of parsed.exceptions ?? []) if (entry.slug) slugs.add(entry.slug)
  }
  return slugs
}

function analyzeProfile(item, type, interactionEdgesMap, documentedSafetyExceptions) {
  return {
    name: item.name,
    slug: item.slug,
    type,
    ...evaluateProfileCompleteness(item, { interactionEdgesMap, documentedSafetyExceptions }),
  }
}

function priorityRows(profiles) {
  const prioritySlugs = [
    'ashwagandha', 'turmeric', 'lions-mane', 'bacopa-monnieri', 'rhodiola-rosea',
    'ginkgo-biloba', 'valerian-root', 'elderberry', 'echinacea', 'ginger', 'reishi',
    'cordyceps', 'holy-basil', 'passionflower', 'st-johns-wort', 'magnesium-glycinate',
    'l-theanine', 'creatine', 'omega-3', 'vitamin-d3',
  ]
  return prioritySlugs.map((prioritySlug) => ({
    prioritySlug,
    profile: profiles.find((profile) =>
      profile.slug === prioritySlug ||
      (prioritySlug === 'valerian-root' && profile.slug === 'valerian') ||
      profile.slug?.includes(prioritySlug) ||
      prioritySlug.includes(profile.slug),
    ) ?? null,
  }))
}

function renderMarkdown(profiles, documentedSafetyExceptions) {
  const total = profiles.length
  const filled = (field) => profiles.filter((profile) => profile.details[field] !== 'EMPTY').length
  const pct = (count) => total ? ((count / total) * 100).toFixed(1) : '0.0'
  const lines = [
    '# Content Gap Audit Report', '',
    `Generated on: ${new Date().toISOString()}`, '',
    '## Summary Statistics', '',
    `- **Total Profiles Evaluated**: ${total}`,
    `- **Safety Data Fill/Reviewed Rate**: ${pct(filled('safety'))}% (${filled('safety')} / ${total})`,
    `- **Description Fill Rate**: ${pct(filled('description'))}% (${filled('description')} / ${total})`,
    `- **Mechanism Fill Rate**: ${pct(filled('mechanism'))}% (${filled('mechanism')} / ${total})`,
    `- **Interactions Fill Rate**: ${pct(filled('interactions'))}% (${filled('interactions')} / ${total})`,
    `- **Documented Safety Exceptions Loaded**: ${documentedSafetyExceptions.size}`, '',
    '## High-Traffic Priority Slugs (Completeness)', '',
    '| Priority Slug | Matched Profile | Type | Completeness % | Missing Fields |',
    '| --- | --- | --- | --- | --- |',
  ]

  for (const { prioritySlug, profile } of priorityRows(profiles)) {
    if (!profile) {
      lines.push(`| \`${prioritySlug}\` | *No matching profile* | - | - | - |`)
      continue
    }
    lines.push(`| \`${prioritySlug}\` | **${profile.name}** (\`${profile.slug}\`) | ${profile.type} | ${(profile.completeness * 100).toFixed(0)}% | ${profile.missingFields.join(', ') || '*None (100% Complete)*'} |`)
  }

  lines.push('', '## Completeness Audit Table (Sorted Worst to Best)', '',
    '| Profile Name | Slug | Type | Completeness % | Missing Fields |',
    '| --- | --- | --- | --- | --- |')
  for (const profile of profiles) {
    lines.push(`| ${profile.name} | \`${profile.slug}\` | ${profile.type} | ${(profile.completeness * 100).toFixed(0)}% | ${profile.missingFields.join(', ') || '*None (100% Complete)*'} |`)
  }
  lines.push('')
  return lines.join('\n')
}

function runGapAnalysis() {
  const herbsPath = 'public/data/herbs.json'
  const compoundsPath = 'public/data/compounds.json'
  const interactionEdgesPath = 'public/data/interaction_edges.json'
  if (!fs.existsSync(herbsPath) || !fs.existsSync(compoundsPath)) {
    console.error('Error: Required JSON files public/data/herbs.json or compounds.json are missing.')
    process.exit(1)
  }

  const herbs = JSON.parse(fs.readFileSync(herbsPath, 'utf8'))
  const compounds = JSON.parse(fs.readFileSync(compoundsPath, 'utf8'))
  const interactionEdgesMap = fs.existsSync(interactionEdgesPath) ? JSON.parse(fs.readFileSync(interactionEdgesPath, 'utf8')) : {}
  const documentedSafetyExceptions = loadDocumentedSafetyExceptions()
  const profiles = [
    ...herbs.map((item) => analyzeProfile(item, 'herb', interactionEdgesMap, documentedSafetyExceptions)),
    ...compounds.map((item) => analyzeProfile(item, 'compound', interactionEdgesMap, documentedSafetyExceptions)),
  ].sort((a, b) => a.completeness - b.completeness || String(a.name).localeCompare(String(b.name)))

  ensureReportDir()
  fs.writeFileSync(`${REPORT_DIR}/content-gaps.json`, `${JSON.stringify(profiles, null, 2)}\n`)
  fs.writeFileSync(`${REPORT_DIR}/content-gaps.md`, renderMarkdown(profiles, documentedSafetyExceptions))
  console.log(`[content-gaps] Evaluated ${profiles.length} profiles; wrote reports/content-gaps.{json,md}`)
}

if (import.meta.url === `file://${process.argv[1]}`) runGapAnalysis()
