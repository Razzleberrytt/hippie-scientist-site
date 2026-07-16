#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'
import { resolveWorkbookPath } from './workbook-source.mjs'
import { readWorkbook, getSheet, sheetToRows } from './data/workbook-parser.mjs'
import { classifyContraindicationValue } from './audit-severity-token-contraindications.mjs'
import {
  CLUSTER_MEMBER_INHERITANCE_MODE,
  CLUSTER_MEMBER_RUNTIME_DECISION,
  CLUSTER_MEMBER_RUNTIME_TRUST_RECORDS,
  getClusterMemberRuntimeTrustRecord,
} from '../config/cluster-member-runtime-trust.mjs'
import { resolveRuntimeRecordLayers } from '../lib/runtime-record-resolver.mjs'

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

const ACTIONABLE_CATEGORIES = new Set([
  'Cluster-specific override',
  'Runtime defect',
  'Rendering defect',
  'Schema limitation',
  'Audit false positive',
])
const GENERIC_SAFETY = /^Generally well tolerated(?: for most users)?\.?$/i

function readJson(filePath, fallback = []) {
  if (!fs.existsSync(filePath)) return fallback
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function bySlug(rows) {
  return new Map(rows.map(row => [String(row?.slug || row?.id || '').trim(), row]))
}

function text(value) {
  return typeof value === 'string' ? value.replace(/\s+/g, ' ').trim() : ''
}

function valuesEqual(left, right) {
  return JSON.stringify(left) === JSON.stringify(right)
}

function finding(id, category, message, slug = null) {
  if (!ISSUE_CATEGORIES.includes(category)) throw new Error(`Unknown issue category: ${category}`)
  return { id, category, ...(slug ? { slug } : {}), message }
}

function duplicateCount(values) {
  const counts = new Map()
  for (const value of values.map(text).filter(Boolean)) counts.set(value, (counts.get(value) || 0) + 1)
  return [...counts.values()].filter(count => count > 1).reduce((total, count) => total + count, 0)
}

function percent(value, total) {
  return total ? Math.round((value / total) * 100) : 0
}

export function evaluateClusterMemberProfile({ base, workbookRow, layers = [], searchRecord = {}, trustRecord, interactionEdges = [] }) {
  const slug = text(base?.slug)
  const findings = []

  if (!trustRecord || trustRecord.canonicalRuntimeSlug !== slug || trustRecord.inheritanceMode !== CLUSTER_MEMBER_INHERITANCE_MODE) {
    findings.push(finding(
      'missing-explicit-inheritance-contract',
      'Schema limitation',
      'The cluster member lacks an explicit canonical runtime slug or deterministic inheritance mode.',
      slug,
    ))
  }

  let resolved
  try {
    resolved = resolveRuntimeRecordLayers(base, layers)
  } catch (error) {
    findings.push(finding('invalid-inheritance-relationship', 'Runtime defect', error.message, slug))
    return { slug, resolved: null, findings }
  }

  const workbookSafety = text(workbookRow?.runtime_safety)
  const resolvedSafety = text(resolved.safety)
  const contraClass = classifyContraindicationValue(workbookRow?.contraindications_or_flags)

  if (!/^Safety evidence:/i.test(workbookSafety) || resolvedSafety !== workbookSafety) {
    findings.push(finding(
      'missing-evidence-labelled-safety',
      'Cluster-specific override',
      'The canonical runtime safety value must be evidence-labelled and survive inheritance unchanged.',
      slug,
    ))
  }
  if (contraClass !== 'PROSE') {
    findings.push(finding(
      'non-prose-contraindications',
      'Cluster-specific override',
      `contraindications_or_flags is ${contraClass} without an explicit evidence-limited exception.`,
      slug,
    ))
  }
  if (!Array.isArray(resolved.side_effects) || resolved.side_effects.length === 0) {
    findings.push(finding(
      'missing-structured-adverse-effects',
      'Cluster-specific override',
      'No source-backed structured adverse-effects value reaches the effective runtime record.',
      slug,
    ))
  }

  if (text(resolved.safety) !== text(base.safety) || !valuesEqual(resolved.contraindications, base.contraindications)) {
    findings.push(finding(
      'trust-field-precedence-divergence',
      'Runtime defect',
      'A non-canonical layer changed a core-owned safety field.',
      slug,
    ))
  }
  if (resolved.indexability_status !== base.indexability_status || resolved.robots !== base.robots || resolved.sitemap_included !== base.sitemap_included) {
    findings.push(finding(
      'list-detail-indexability-divergence',
      'Runtime defect',
      'A non-canonical layer changed core-owned visibility fields.',
      slug,
    ))
  }
  if (!valuesEqual(resolved.interactions, base.interactions)) {
    findings.push(finding(
      'interaction-semantic-drift',
      'Runtime defect',
      'A non-canonical layer changed the interaction collection.',
      slug,
    ))
  }

  const searchSafety = text(searchRecord.safety)
  const expectedContraFlag = Array.isArray(resolved.contraindications) && resolved.contraindications.length > 0
  // The flat `resolved.interactions` field is always empty — the workbook has
  // no `interactions` column — so the search index derives `hasInteractions`
  // from the real per-slug interaction_edges.json data instead (see
  // build-search-index.mjs). Compare against that same source here.
  const expectedInteractionFlag = Array.isArray(interactionEdges) && interactionEdges.length > 0
  if (!searchSafety || GENERIC_SAFETY.test(searchSafety) || searchRecord?.safetyFlags?.hasContraindications !== expectedContraFlag || searchRecord?.safetyFlags?.hasInteractions !== expectedInteractionFlag) {
    findings.push(finding(
      'search-index-safety-contradiction',
      'Runtime defect',
      'Search safety or flags disagree with the resolved runtime safety contract.',
      slug,
    ))
  }

  if ([resolved.safetyNotes, resolved.safety_notes, resolved.runtime_safety].some(value => text(value) !== resolvedSafety)) {
    findings.push(finding(
      'structured-data-safety-divergence',
      'Rendering defect',
      'A renderer-facing safety alias disagrees with the canonical resolved safety value.',
      slug,
    ))
  }
  if (text(workbookRow?.safety_notes) && !workbookSafety) {
    findings.push(finding(
      'workbook-fill-rate-not-runtime-completeness',
      'Audit false positive',
      'Source safety notes exist, but the runtime-owned safety field is empty.',
      slug,
    ))
  }

  if (!findings.some(item => ACTIONABLE_CATEGORIES.has(item.category))) {
    findings.push(finding(
      'canonical-trust-fields-inherited',
      'Valid inheritance',
      'Validated overlays inherit core safety, evidence, interaction, and visibility fields deterministically.',
      slug,
    ))
  }

  return {
    slug,
    resolved,
    findings,
    workbookSafety,
    contraindicationClassification: contraClass,
  }
}

export async function auditClusterMemberTrust(repoRoot = process.cwd()) {
  const publicData = path.join(repoRoot, 'public', 'data')
  const herbs = readJson(path.join(publicData, 'herbs.json'))
  const compounds = readJson(path.join(publicData, 'compounds.json'))
  const baseTargets = [
    ...herbs.map(record => ({ ...record, entityType: 'herb' })),
    ...compounds.map(record => ({ ...record, entityType: 'compound' })),
  ]
    .filter(record => record.runtime_export_decision === CLUSTER_MEMBER_RUNTIME_DECISION)
    .sort((left, right) => left.slug.localeCompare(right.slug))

  const legacyHerbs = bySlug(readJson(path.join(publicData, 'herbs-summary.json')))
  const legacyCompounds = bySlug(readJson(path.join(publicData, 'compounds-summary.json')))
  const indexedHerbs = bySlug(readJson(path.join(publicData, 'summary-indexes', 'herbs-summary.json')))
  const indexedCompounds = bySlug(readJson(path.join(publicData, 'summary-indexes', 'compounds-summary.json')))
  const search = bySlug(readJson(path.join(publicData, 'search-index.json')))
  const interactionEdgesBySlug = readJson(path.join(publicData, 'interaction_edges.json'), {})
  const routeContractText = [
    fs.readFileSync(path.join(repoRoot, 'public', '_redirects'), 'utf8'),
    fs.readFileSync(path.join(repoRoot, 'public', 'redirect-overrides', 'seo-csv-h1-2026-07-08.txt'), 'utf8'),
    fs.readFileSync(path.join(repoRoot, 'app', 'sitemap.ts'), 'utf8'),
    fs.readFileSync(path.join(repoRoot, 'app', 'compounds', '[slug]', 'page.tsx'), 'utf8'),
  ].join('\n')
  const workbook = await readWorkbook(resolveWorkbookPath(repoRoot))
  const workbookRows = bySlug(sheetToRows(getSheet(workbook, 'Entity_Master')))

  const profiles = baseTargets.map(base => {
    const slug = base.slug
    const kind = base.entityType === 'herb' ? 'herbs' : 'compounds'
    const detailPath = path.join(publicData, `${kind}-detail`, `${slug}.json`)
    const layers = [
      (kind === 'herbs' ? legacyHerbs : legacyCompounds).get(slug) || {},
      (kind === 'herbs' ? indexedHerbs : indexedCompounds).get(slug) || {},
      readJson(detailPath, {}),
    ]
    const evaluation = evaluateClusterMemberProfile({
      base,
      workbookRow: workbookRows.get(slug) || {},
      layers,
      searchRecord: search.get(slug) || {},
      trustRecord: getClusterMemberRuntimeTrustRecord(slug),
      interactionEdges: interactionEdgesBySlug[slug] || [],
    })
    const hasDeprecatedRouteContract = routeContractText.includes(`'${slug}'`)
      || routeContractText.includes(`/compounds/${slug} `)
      || routeContractText.includes(`/compounds/${slug}/ `)
    if (base.entityType === 'compound' && hasDeprecatedRouteContract) {
      evaluation.findings = evaluation.findings.filter(item => item.category !== 'Valid inheritance')
      evaluation.findings.push(finding(
        'active-profile-marked-deprecated',
        'Runtime defect',
        'The active cluster-member compound is still present in a redirect or deprecated-route contract.',
        slug,
      ))
    }
    const resolved = evaluation.resolved || {}
    return {
      slug,
      entityType: base.entityType,
      workbookSafety: evaluation.workbookSafety,
      effectiveSafety: text(resolved.safety),
      contraindicationClassification: evaluation.contraindicationClassification,
      hasEvidenceLabel: /^Safety evidence:/i.test(text(resolved.safety)),
      hasDetailOverlay: fs.existsSync(detailPath),
      inherited: evaluation.findings.some(item => item.category === 'Valid inheritance'),
      listIndexability: base.indexability_status || '',
      effectiveIndexability: resolved.indexability_status || '',
      finalSummary: text(resolved.summary || resolved.description),
      findings: evaluation.findings,
    }
  })

  const findings = profiles.flatMap(profile => profile.findings)
  const total = profiles.length
  const countsByCategory = Object.fromEntries(ISSUE_CATEGORIES.map(category => [category, findings.filter(item => item.category === category).length]))
  const actionableFindings = findings.filter(item => ACTIONABLE_CATEGORIES.has(item.category))
  const affected = category => new Set(findings.filter(item => item.category === category && item.slug).map(item => item.slug)).size
  const structuredSafetyGaps = findings.filter(item => [
    'missing-evidence-labelled-safety',
    'non-prose-contraindications',
    'missing-structured-adverse-effects',
  ].includes(item.id)).length

  return {
    audit: 'cluster-member-runtime-trust',
    targetDecision: CLUSTER_MEMBER_RUNTIME_DECISION,
    inheritanceMode: CLUSTER_MEMBER_INHERITANCE_MODE,
    counts: {
      profiles: total,
      canonicalEntities: total,
      canonicalCompounds: profiles.filter(profile => profile.entityType === 'compound').length,
      inheritedProfiles: profiles.filter(profile => profile.inherited).length,
      overriddenProfiles: profiles.filter(profile => profile.hasDetailOverlay).length,
      duplicateSummaries: duplicateCount(profiles.map(profile => profile.finalSummary)),
      evidenceLabelledSummaries: profiles.filter(profile => profile.hasEvidenceLabel).length,
      missingSummaries: profiles.filter(profile => !profile.finalSummary).length,
      structuredSafetyGaps,
      renderingIssues: countsByCategory['Rendering defect'],
      renderingIssueProfiles: affected('Rendering defect'),
      runtimeDefects: countsByCategory['Runtime defect'],
      runtimeDefectProfiles: affected('Runtime defect'),
      auditFalsePositives: countsByCategory['Audit false positive'],
      auditFalsePositiveProfiles: affected('Audit false positive'),
      actionableFindings: actionableFindings.length,
      configuredTrustRecords: CLUSTER_MEMBER_RUNTIME_TRUST_RECORDS.length,
    },
    percentages: {
      canonicalCompounds: percent(profiles.filter(profile => profile.entityType === 'compound').length, total),
      inheritedProfiles: percent(profiles.filter(profile => profile.inherited).length, total),
      overriddenProfiles: percent(profiles.filter(profile => profile.hasDetailOverlay).length, total),
      evidenceLabelledSummaries: percent(profiles.filter(profile => profile.hasEvidenceLabel).length, total),
      missingSummaries: percent(profiles.filter(profile => !profile.finalSummary).length, total),
      runtimeDefectProfiles: percent(affected('Runtime defect'), total),
      renderingIssueProfiles: percent(affected('Rendering defect'), total),
      auditFalsePositiveProfiles: percent(affected('Audit false positive'), total),
    },
    countsByCategory,
    profiles: profiles.map(({ findings: _findings, ...profile }) => profile),
    findings,
    issues: actionableFindings,
  }
}

export function strictExitCode(report) {
  return report?.counts?.actionableFindings > 0 ? 1 : 0
}

function printHuman(report) {
  const c = report.counts
  console.log('CLUSTER MEMBER RUNTIME TRUST AUDIT')
  console.log('==================================')
  console.log(`Profiles: ${c.profiles}`)
  console.log(`Canonical compounds: ${c.canonicalCompounds}/${c.profiles} (${report.percentages.canonicalCompounds}%)`)
  console.log(`Inherited profiles: ${c.inheritedProfiles}/${c.profiles} (${report.percentages.inheritedProfiles}%)`)
  console.log(`Detail-layer profiles: ${c.overriddenProfiles}/${c.profiles} (${report.percentages.overriddenProfiles}%)`)
  console.log(`Evidence-labelled safety summaries: ${c.evidenceLabelledSummaries}/${c.profiles} (${report.percentages.evidenceLabelledSummaries}%)`)
  console.log(`Missing user-visible summaries: ${c.missingSummaries}/${c.profiles} (${report.percentages.missingSummaries}%)`)
  console.log(`Duplicate user-visible summaries: ${c.duplicateSummaries}`)
  console.log(`Structured safety gaps: ${c.structuredSafetyGaps}`)
  console.log(`Runtime defects: ${c.runtimeDefects} across ${c.runtimeDefectProfiles} profiles`)
  console.log(`Rendering defects: ${c.renderingIssues} across ${c.renderingIssueProfiles} profiles`)
  console.log(`Audit false positives: ${c.auditFalsePositives} across ${c.auditFalsePositiveProfiles} profiles`)
  console.log(`Actionable findings: ${c.actionableFindings}`)
  console.log('\nCLASSIFICATIONS')
  for (const category of ISSUE_CATEGORIES) console.log(`${category}: ${report.countsByCategory[category]}`)
  console.log('\nPROFILE FINDINGS')
  for (const item of report.findings) console.log(`- ${item.slug ? `${item.slug}: ` : ''}[${item.category}] ${item.message}`)
}

async function main() {
  const report = await auditClusterMemberTrust()
  if (process.argv.includes('--json')) console.log(JSON.stringify(report, null, 2))
  else printHuman(report)
  if (process.argv.includes('--strict') && strictExitCode(report)) process.exit(1)
}

if (import.meta.url === pathToFileURL(process.argv[1]).href) {
  main().catch(error => {
    console.error(error)
    process.exit(1)
  })
}
