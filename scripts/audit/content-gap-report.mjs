import fs from 'node:fs'
import { collectionHasMeaningfulText, hasMeaningfulText, isMissingLike } from '../../lib/data-quality.mjs'

const REPORT_DIR = 'reports'
const PROFILE_FIELDS = ['description', 'safety', 'evidence_level', 'mechanism', 'best_for', 'dosing', 'interactions']
const DESCRIPTION_PLACEHOLDERS = [
  /evidence-aware botanical profile with mechanism/i,
  /evidence-aware compound profile with mechanism/i,
]

function ensureReportDir() {
  fs.mkdirSync(REPORT_DIR, { recursive: true })
}

function checkDescription(value) {
  return hasMeaningfulText(value, DESCRIPTION_PLACEHOLDERS)
}

export function checkSafety(value) {
  return collectionHasMeaningfulText(value)
}

function checkEvidenceLevel(item) {
  return !isMissingLike(item.evidence_tier ?? item.evidence_grade ?? item.evidenceLevel ?? item.evidence_level)
}

function checkMechanism(item) {
  const value = item.mechanisms ?? item.canonical_mechanisms ?? item.mechanism
  return Array.isArray(value) ? value.length > 0 : !isMissingLike(value)
}

function checkBestFor(item) {
  return collectionHasMeaningfulText(item.effects ?? item.primary_effects ?? item.best_for ?? item.bestFor)
}

function checkDosing(item) {
  const value = item.dosage ?? item.typical_dosage ?? item.dosing ?? item.dosage_range
  return Array.isArray(value) ? value.length > 0 : !isMissingLike(value)
}

function checkInteractions(item, interactionEdgesMap) {
  if (collectionHasMeaningfulText(item.interactions)) return true
  const edges = interactionEdgesMap?.[item.slug]
  return Array.isArray(edges) && edges.length > 0
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
  const safetyFilled = checkSafety(item.contraindications)
  const safetyDocumentedException = !safetyFilled && documentedSafetyExceptions.has(item.slug)
  const state = {
    description: checkDescription(item.description),
    safety: safetyFilled || safetyDocumentedException,
    evidence_level: checkEvidenceLevel(item),
    mechanism: checkMechanism(item),
    best_for: checkBestFor(item),
    dosing: checkDosing(item),
    interactions: checkInteractions(item, interactionEdgesMap),
  }
  const missingFields = PROFILE_FIELDS.filter((field) => !state[field])

  return {
    name: item.name,
    slug: item.slug,
    type,
    completeness: (PROFILE_FIELDS.length - missingFields.length) / PROFILE_FIELDS.length,
    missingFields,
    details: Object.fromEntries(PROFILE_FIELDS.map((field) => [
      field,
      field === 'safety' && safetyDocumentedException ? 'DOCUMENTED_EXCEPTION' : state[field] ? 'FILLED' : 'EMPTY',
    ])),
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
  const priorities = priorityRows(profiles)

  const lines = [
    '# Content Gap Audit Report', '',
    `Generated on: ${new Date().toISOString()}`, '',
    '## Summary Statistics', '',
    `- **Total Profiles Evaluated**: ${total}`,
    `- **Safety Data Fill/Reviewed Rate**: ${pct(filled('safety'))}% (${filled('safety')} / ${total}); documented evidence-limited exceptions are treated as reviewed rather than missing`,
    `- **Description Fill Rate**: ${pct(filled('description'))}% (${filled('description')} / ${total})`,
    `- **Mechanism Fill Rate**: ${pct(filled('mechanism'))}% (${filled('mechanism')} / ${total})`,
    `- **Interactions Fill Rate**: ${pct(filled('interactions'))}% (${filled('interactions')} / ${total})`,
    `- **Documented Safety Exceptions Loaded**: ${documentedSafetyExceptions.size}`, '',
    '## High-Traffic Priority Slugs (Completeness)', '',
    '| Priority Slug | Matched Profile | Type | Completeness % | Missing Fields |',
    '| --- | --- | --- | --- | --- |',
  ]

  for (const { prioritySlug, profile } of priorities) {
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
