#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveWorkbookPath } from './workbook-source.mjs'
import { readWorkbook, getSheet, sheetToRows } from './data/workbook-parser.mjs'
import { classifyContraindicationValue } from './audit-severity-token-contraindications.mjs'

export const ISSUE_CATEGORIES = [
  'Valid inheritance',
  'Cluster-specific override',
  'Evidence-limited exception',
  'Runtime defect',
  'Rendering defect',
  'Schema limitation',
  'Audit false positive',
  'Internal-only',
  'Not actionable',
]

const TARGET_DECISION = 'cluster_member_runtime'
const GENERIC_SAFETY = /^Generally well tolerated(?: for most users)?\.?$/i

function readJson(filePath, fallback = []) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function bySlug(rows) {
  return new Map((Array.isArray(rows) ? rows : []).map(row => [row?.slug, row]))
}

function text(value) {
  return String(value ?? '').trim()
}

function valuesEqual(left, right) {
  return JSON.stringify(left ?? null) === JSON.stringify(right ?? null)
}

function issue(id, category, message, slug = null) {
  if (!ISSUE_CATEGORIES.includes(category)) throw new Error(`Unknown issue category: ${category}`)
  return { id, category, ...(slug ? { slug } : {}), message }
}

function effectiveSafety(record) {
  return text(record?.safety || record?.runtime_safety || record?.safetyNotes || record?.safety_notes)
}

function hasSafetyEvidenceLabel(record) {
  return /^Safety evidence:/i.test(effectiveSafety(record))
}

function duplicateCount(values) {
  const counts = new Map()
  for (const value of values.map(text).filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1)
  return [...counts.values()].reduce((total, count) => total + Math.max(0, count - 1), 0)
}

function percent(value, total) {
  return total ? Number(((value / total) * 100).toFixed(1)) : 0
}

function mergeRuntimeRecord(base, legacySummary, summaryIndex, detail) {
  return { ...base, ...legacySummary, ...summaryIndex, ...detail }
}

export async function auditClusterMemberTrust(repoRoot = process.cwd()) {
  const publicData = path.join(repoRoot, 'public', 'data')
  const herbs = readJson(path.join(publicData, 'herbs.json'))
  const compounds = readJson(path.join(publicData, 'compounds.json'))
  const baseTargets = [
    ...herbs.filter(record => record.runtime_export_decision === TARGET_DECISION).map(record => ({ ...record, entityType: 'herb' })),
    ...compounds.filter(record => record.runtime_export_decision === TARGET_DECISION).map(record => ({ ...record, entityType: 'compound' })),
  ].sort((a, b) => text(a.slug).localeCompare(text(b.slug)))

  const legacyHerbs = bySlug(readJson(path.join(publicData, 'herbs-summary.json')))
  const legacyCompounds = bySlug(readJson(path.join(publicData, 'compounds-summary.json')))
  const indexedHerbs = bySlug(readJson(path.join(publicData, 'summary-indexes', 'herbs-summary.json')))
  const indexedCompounds = bySlug(readJson(path.join(publicData, 'summary-indexes', 'compounds-summary.json')))
  const search = bySlug(readJson(path.join(publicData, 'search-index.json')))

  const workbook = await readWorkbook(resolveWorkbookPath(repoRoot))
  const workbookRows = bySlug(sheetToRows(getSheet(workbook, 'Entity_Master')))
  const issues = [
    issue(
      'cluster-decision-has-no-parent-contract',
      'Schema limitation',
      'runtime_export_decision identifies cluster members but stores no canonical parent, inheritance mode, field provenance, or override boundary.',
    ),
  ]

  const profiles = baseTargets.map(base => {
    const slug = base.slug
    const kind = base.entityType === 'herb' ? 'herbs' : 'compounds'
    const legacy = (kind === 'herbs' ? legacyHerbs : legacyCompounds).get(slug) || {}
    const indexed = (kind === 'herbs' ? indexedHerbs : indexedCompounds).get(slug) || {}
    const detailPath = path.join(publicData, `${kind}-detail`, `${slug}.json`)
    const detail = readJson(detailPath, {})
    const merged = mergeRuntimeRecord(base, legacy, indexed, detail)
    const workbookRow = workbookRows.get(slug) || {}
    const contraClass = classifyContraindicationValue(workbookRow.contraindications_or_flags)
    const detailOverrides = Object.keys(detail).filter(key => key in base && !valuesEqual(detail[key], base[key]))
    const searchRecord = search.get(slug) || {}
    const workbookSafety = text(workbookRow.runtime_safety || workbookRow.safety_notes)
    const mergedSafety = effectiveSafety(merged)

    if (!hasSafetyEvidenceLabel(merged)) {
      issues.push(issue('missing-evidence-labelled-safety', 'Cluster-specific override', 'The effective runtime safety summary lacks the required "Safety evidence:" label.', slug))
    }
    if (contraClass !== 'PROSE') {
      issues.push(issue('non-prose-contraindications', 'Cluster-specific override', `contraindications_or_flags is ${contraClass}; no cluster-member evidence-limited exception registry exists.`, slug))
    }
    if (!Array.isArray(merged.side_effects) || merged.side_effects.length === 0) {
      issues.push(issue('missing-structured-adverse-effects', 'Cluster-specific override', 'No structured adverse-effects value reaches the effective runtime record.', slug))
    }
    if (GENERIC_SAFETY.test(mergedSafety) && workbookSafety && !GENERIC_SAFETY.test(workbookSafety)) {
      issues.push(issue('generic-detail-overrides-source-safety', 'Runtime defect', 'A generic detail safety note overrides a more specific workbook safety narrative.', slug))
    }
    if (detail.indexability_status && detail.indexability_status !== base.indexability_status) {
      issues.push(issue('list-detail-indexability-divergence', 'Runtime defect', `List status ${base.indexability_status} conflicts with detail status ${detail.indexability_status}.`, slug))
    }
    if (base.entityType === 'herb' && Array.isArray(merged.interactions) && valuesEqual(merged.interactions, merged.contraindications) && merged.interactions.length) {
      issues.push(issue('contraindications-copied-as-interactions', 'Runtime defect', 'The detail overlay duplicates contraindications into interactions, changing their meaning.', slug))
    }
    if (base.entityType === 'compound' && GENERIC_SAFETY.test(text(searchRecord.safety)) && /liver|hepato/i.test(workbookSafety)) {
      issues.push(issue('search-index-safety-contradiction', 'Runtime defect', 'Search labels the profile generally well tolerated while the workbook identifies liver-injury context.', slug))
    }
    if (GENERIC_SAFETY.test(text(merged.safetyNotes)) && workbookSafety && !GENERIC_SAFETY.test(workbookSafety)) {
      issues.push(issue('structured-data-generic-safety', 'Rendering defect', 'Profile FAQ/schema safety selects the generic detail safetyNotes value ahead of the specific source narrative.', slug))
    }
    if (workbookSafety && !text(workbookRow.runtime_safety)) {
      issues.push(issue('workbook-fill-rate-not-runtime-completeness', 'Audit false positive', 'The fill-rate audit counts safety_notes as coverage even though this field is not exported as runtime safety by the core builder.', slug))
    }

    return {
      slug,
      entityType: base.entityType,
      workbookSafety,
      effectiveSafety: mergedSafety,
      contraindicationClassification: contraClass,
      hasEvidenceLabel: hasSafetyEvidenceLabel(merged),
      hasDetailOverlay: fs.existsSync(detailPath),
      detailOverrideFields: detailOverrides.sort(),
      listIndexability: base.indexability_status || '',
      effectiveIndexability: merged.indexability_status || '',
      finalSummary: text(merged.summary || merged.description),
    }
  })

  const total = profiles.length
  const countsByCategory = Object.fromEntries(ISSUE_CATEGORIES.map(category => [category, issues.filter(item => item.category === category).length]))
  const affected = category => new Set(issues.filter(item => item.category === category && item.slug).map(item => item.slug)).size
  const evidenceLabelled = profiles.filter(profile => profile.hasEvidenceLabel).length
  const missingSummaries = profiles.filter(profile => !profile.finalSummary).length
  const inheritedProfiles = 0
  const overriddenProfiles = profiles.filter(profile => profile.hasDetailOverlay).length
  const structuredSafetyGaps = issues.filter(item => [
    'missing-evidence-labelled-safety',
    'non-prose-contraindications',
    'missing-structured-adverse-effects',
  ].includes(item.id)).length

  return {
    audit: 'cluster-member-runtime-trust',
    targetDecision: TARGET_DECISION,
    counts: {
      profiles: total,
      canonicalEntities: total,
      canonicalCompounds: profiles.filter(profile => profile.entityType === 'compound').length,
      inheritedProfiles,
      overriddenProfiles,
      duplicateSummaries: duplicateCount(profiles.map(profile => profile.finalSummary)),
      evidenceLabelledSummaries: evidenceLabelled,
      missingSummaries,
      structuredSafetyGaps,
      renderingIssues: countsByCategory['Rendering defect'],
      renderingIssueProfiles: affected('Rendering defect'),
      runtimeDefects: countsByCategory['Runtime defect'],
      runtimeDefectProfiles: affected('Runtime defect'),
      auditFalsePositives: countsByCategory['Audit false positive'],
      auditFalsePositiveProfiles: affected('Audit false positive'),
    },
    percentages: {
      canonicalCompounds: percent(profiles.filter(profile => profile.entityType === 'compound').length, total),
      inheritedProfiles: percent(inheritedProfiles, total),
      overriddenProfiles: percent(overriddenProfiles, total),
      evidenceLabelledSummaries: percent(evidenceLabelled, total),
      missingSummaries: percent(missingSummaries, total),
      runtimeDefectProfiles: percent(affected('Runtime defect'), total),
      renderingIssueProfiles: percent(affected('Rendering defect'), total),
      auditFalsePositiveProfiles: percent(affected('Audit false positive'), total),
    },
    countsByCategory,
    profiles,
    issues,
  }
}

function printHuman(report) {
  const c = report.counts
  console.log('CLUSTER MEMBER RUNTIME TRUST AUDIT')
  console.log('==================================')
  console.log(`Profiles: ${c.profiles}`)
  console.log(`Canonical compounds: ${c.canonicalCompounds}/${c.profiles} (${report.percentages.canonicalCompounds}%)`)
  console.log(`Inherited profiles: ${c.inheritedProfiles}/${c.profiles} (${report.percentages.inheritedProfiles}%)`)
  console.log(`Detail-overridden profiles: ${c.overriddenProfiles}/${c.profiles} (${report.percentages.overriddenProfiles}%)`)
  console.log(`Evidence-labelled safety summaries: ${c.evidenceLabelledSummaries}/${c.profiles} (${report.percentages.evidenceLabelledSummaries}%)`)
  console.log(`Missing user-visible summaries: ${c.missingSummaries}/${c.profiles} (${report.percentages.missingSummaries}%)`)
  console.log(`Duplicate user-visible summaries: ${c.duplicateSummaries}`)
  console.log(`Structured safety gaps: ${c.structuredSafetyGaps}`)
  console.log(`Runtime defects: ${c.runtimeDefects} across ${c.runtimeDefectProfiles} profiles`)
  console.log(`Rendering defects: ${c.renderingIssues} across ${c.renderingIssueProfiles} profiles`)
  console.log(`Audit false positives: ${c.auditFalsePositives} across ${c.auditFalsePositiveProfiles} profiles`)
  console.log('\nCLASSIFICATIONS')
  for (const category of ISSUE_CATEGORIES) console.log(`${category}: ${report.countsByCategory[category]}`)
  console.log('\nPROFILE FINDINGS')
  for (const item of report.issues) console.log(`- ${item.slug ? `${item.slug}: ` : ''}[${item.category}] ${item.message}`)
}

async function main() {
  const report = await auditClusterMemberTrust()
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else printHuman(report)
  if (process.argv.includes('--strict') && (report.counts.structuredSafetyGaps || report.counts.runtimeDefects || report.counts.renderingIssues)) process.exit(1)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
