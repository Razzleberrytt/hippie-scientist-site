import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

import { buildClaimSourceGraph, buildCoverageHeatmap, contract } from './governor.mjs'

const here = path.dirname(fileURLToPath(import.meta.url))
const repoRoot = path.resolve(here, '..', '..')

function parseJsonl(file) {
  if (!fs.existsSync(file)) return []
  return fs.readFileSync(file, 'utf8').split(/\r?\n/).map(line => line.trim()).filter(Boolean).map(line => JSON.parse(line))
}

function loadJson(file, fallback = []) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}

export function verifyCanaries(entries, sourceRegistry = []) {
  const heatmap = buildCoverageHeatmap(entries)
  const graph = buildClaimSourceGraph(entries, sourceRegistry)
  const grouped = new Map()
  for (const entry of entries) {
    const key = `${entry.entityType}:${entry.entitySlug}`
    if (!grouped.has(key)) grouped.set(key, [])
    grouped.get(key).push(entry)
  }

  const fixed = contract.canaries.fixedAnchors.map(slug => {
    const matches = [...grouped.entries()].filter(([key]) => key.endsWith(`:${slug}`))
    const rows = matches.flatMap(([, values]) => values)
    const sourceIds = [...new Set(rows.map(row => row.sourceId).filter(Boolean))]
    const unresolved = sourceIds.filter(id => !graph.nodes.sources[id]?.resolvedInRegistry)
    return {
      slug,
      present: rows.length > 0,
      claimCount: rows.length,
      sourceLinkage: rows.length > 0 && rows.every(row => Boolean(row.sourceId)),
      evidenceClass: rows.length > 0 && rows.every(row => Boolean(row.evidenceClass)),
      nullVisibility: rows.some(row => row.claimType === 'efficacy_null_or_mixed' || row.claimType === 'evidence_conflict' || row.claimType === 'research_gap'),
      safetyVisibility: rows.some(row => row.claimType === 'safety_risk' || /adverse|caution|pregnancy|interaction/.test(row.topicType || '')),
      unresolvedSourceIds: unresolved,
    }
  })

  const dynamic = heatmap.rows
    .slice(0, contract.canaries.dynamicTopRiskCount)
    .map(row => ({ entity: row.entity, coverageScore: row.coverageScore, negativeEvidenceGap: row.negativeEvidenceGap, diversityFlags: row.sourceDiversity.flags }))

  const blockers = []
  for (const row of fixed) {
    if (!row.present) blockers.push(`${row.slug}:missing_canary`)
    if (row.present && !row.sourceLinkage) blockers.push(`${row.slug}:missing_source_linkage`)
    if (row.present && !row.evidenceClass) blockers.push(`${row.slug}:missing_evidence_class`)
  }

  return {
    generatedAt: new Date().toISOString(),
    fixed,
    dynamic,
    blockers,
    warnings: fixed.flatMap(row => [
      ...(row.present && !row.nullVisibility ? [`${row.slug}:no_null_or_conflict_canary`] : []),
      ...(row.present && !row.safetyVisibility ? [`${row.slug}:no_safety_canary`] : []),
      ...row.unresolvedSourceIds.map(id => `${row.slug}:unresolved_source:${id}`),
    ]),
    pass: blockers.length === 0,
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  const entries = parseJsonl(path.join(repoRoot, 'public', 'data', 'enrichment-normalized.jsonl'))
  const registry = loadJson(path.join(repoRoot, 'public', 'data', 'source-registry.json'), [])
  process.stdout.write(`${JSON.stringify(verifyCanaries(entries, registry), null, 2)}\n`)
}
