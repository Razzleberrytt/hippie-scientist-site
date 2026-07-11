#!/usr/bin/env node
// data:migrate-workbook — migrate the herb/compound workbook into canonical
// staging. Never modifies the workbook. Idempotent (deterministic IDs). Emits a
// timestamped migration report plus duplicate / missing-data / relationship
// reports. Dry-run by default for inspection; --write stages to data/staging/;
// --promote copies staging → data/canonical/.
//
// Usage:
//   node scripts/data/migrate-workbook.mjs --file path/to.xlsx --dry-run
//   node scripts/data/migrate-workbook.mjs --write
//   node scripts/data/migrate-workbook.mjs --write --promote

import fs from 'node:fs'
import path from 'node:path'
import { readWorkbook } from './workbook-parser.mjs'
import { resolveWorkbookPath, assertWorkbookExists, getRepoRoot } from '../workbook-source.mjs'
import { mapWorkbook } from './canonical/workbook-map.mjs'
import { writeJsonl, writeJson, ensureDir } from './canonical/jsonl.mjs'
import { cleanString } from './canonical/normalize.mjs'
import {
  stagingDir,
  entitiesDir,
  claimsFile,
  edgesFile,
  sourcesFile,
  entityFileFor,
  ENTITY_TYPES,
} from './canonical/paths.mjs'
import { partitionEntities } from './canonical/store.mjs'

function parseArgs(argv) {
  const args = { dryRun: true, write: false, promote: false, file: null }
  for (let i = 2; i < argv.length; i += 1) {
    const a = argv[i]
    if (a === '--dry-run') args.dryRun = true
    else if (a === '--write') { args.write = true; args.dryRun = false }
    else if (a === '--promote') { args.promote = true; args.write = true; args.dryRun = false }
    else if (a === '--file') { args.file = argv[i + 1]; i += 1 }
    else if (a.startsWith('--file=')) args.file = a.slice('--file='.length)
  }
  return args
}

function timestamp() {
  return new Date().toISOString().replace(/[:.]/g, '-')
}

// Duplicate-candidate detection (no silent merging — report only).
function buildDuplicateReport(entities) {
  const bySlug = new Map()
  const byName = new Map()
  const byAlias = new Map()
  const exactDuplicates = []
  const similarNames = []
  const aliasCollisions = []
  const conflictingSlugs = []

  for (const e of entities) {
    const slugKey = `${e.entity_type}:${e.slug.toLowerCase()}`
    if (bySlug.has(slugKey)) exactDuplicates.push({ slug: e.slug, entity_type: e.entity_type, ids: [bySlug.get(slugKey), e.id] })
    else bySlug.set(slugKey, e.id)

    const nameKey = e.canonical_name.toLowerCase()
    if (!byName.has(nameKey)) byName.set(nameKey, [])
    byName.get(nameKey).push({ id: e.id, type: e.entity_type, slug: e.slug })

    for (const alias of e.aliases || []) {
      const ak = alias.toLowerCase()
      if (!byAlias.has(ak)) byAlias.set(ak, [])
      byAlias.get(ak).push({ id: e.id, slug: e.slug })
    }
  }

  // Same normalized name across different slugs → similar-name candidate.
  for (const [name, group] of byName) {
    if (group.length > 1) similarNames.push({ name, members: group })
  }
  // One alias pointing at multiple entities → alias collision.
  for (const [alias, group] of byAlias) {
    const distinct = [...new Set(group.map((g) => g.id))]
    if (distinct.length > 1) aliasCollisions.push({ alias, members: group })
  }
  // Same slug used by both a herb and a compound → conflicting slug.
  const slugTypes = new Map()
  for (const e of entities) {
    const s = e.slug.toLowerCase()
    if (!slugTypes.has(s)) slugTypes.set(s, new Set())
    slugTypes.get(s).add(e.entity_type)
  }
  for (const [slug, types] of slugTypes) {
    if (types.size > 1) conflictingSlugs.push({ slug, types: [...types] })
  }

  return { exactDuplicates, similarNames, aliasCollisions, conflictingSlugs }
}

// Missing-data report for important fields.
function buildMissingReport(entities) {
  const important = {
    herb: ['description', 'data.primary_effects', 'data.mechanism_summary', 'data.safety_notes', 'data.evidence_grade'],
    compound: ['description', 'data.mechanism_summary', 'data.evidence_grade'],
  }
  const get = (obj, dotted) => dotted.split('.').reduce((acc, k) => (acc == null ? acc : acc[k]), obj)
  const missingByField = {}
  let totalMissing = 0
  for (const e of entities) {
    const fields = important[e.entity_type]
    if (!fields) continue
    for (const field of fields) {
      const value = get(e, field)
      if (value == null || cleanString(value) === '') {
        missingByField[field] = missingByField[field] || []
        missingByField[field].push(e.slug)
        totalMissing += 1
      }
    }
  }
  return { totalMissing, missingByField: Object.fromEntries(Object.entries(missingByField).map(([k, v]) => [k, { count: v.length, sample: v.slice(0, 15) }])) }
}

function buildRelationshipReport(edges) {
  const byType = {}
  for (const edge of edges) byType[edge.rel_type] = (byType[edge.rel_type] || 0) + 1
  return { total: edges.length, byType }
}

function main() {
  const args = parseArgs(process.argv)
  const repoRoot = getRepoRoot()
  const workbookPath = resolveWorkbookPath(repoRoot, args.file ? { envPath: args.file } : {})
  assertWorkbookExists(workbookPath)

  console.log(`▶ migrating workbook: ${workbookPath}`)
  console.log(`  mode: ${args.dryRun ? 'DRY RUN' : args.promote ? 'WRITE + PROMOTE' : 'WRITE (staging only)'}`)

  return run(args, workbookPath, repoRoot)
}

async function run(args, workbookPath, repoRoot) {
  const workbook = await readWorkbook(workbookPath)
  const mapped = mapWorkbook(workbook)
  const { entities, claims, edges, sources } = mapped

  // Workbook source counts for reconciliation.
  const em = workbook.Sheets?.Entity_Master || []
  const wbHerbs = em.filter((r) => cleanString(r.entity_type).toLowerCase() === 'herb').length
  const wbCompounds = em.filter((r) => cleanString(r.entity_type).toLowerCase() === 'compound').length
  const wbEvidence = (workbook.Sheets?.Evidence_Register || []).length
  const wbRelationships = (workbook.Sheets?.Entity_Relationships || []).length
  const wbSources = (workbook.Sheets?.Source_Register || []).length

  const duplicateReport = buildDuplicateReport(entities)
  const missingReport = buildMissingReport(entities)
  const relationshipReport = buildRelationshipReport(edges)

  const migrationReport = {
    migrated_at: new Date().toISOString(),
    workbook: path.relative(repoRoot, workbookPath),
    mode: args.dryRun ? 'dry-run' : args.promote ? 'write+promote' : 'write',
    reconciliation: {
      entity_master: { workbook_herbs: wbHerbs, canonical_herbs: mapped.reports.counts.herbs, workbook_compounds: wbCompounds, canonical_compounds: mapped.reports.counts.compounds },
      evidence_register: { workbook_rows: wbEvidence, canonical_claims: claims.length, unmatched_subjects: mapped.reports.unmatched.claims.length },
      entity_relationships: { workbook_rows: wbRelationships, canonical_edges: edges.length, unmatched: mapped.reports.unmatched.edges.length },
      source_register: { workbook_rows: wbSources, canonical_sources_total: sources.length },
      derived_effects: mapped.reports.counts.effects,
      derived_studies: mapped.reports.counts.studies,
    },
    totals: { entities: entities.length, claims: claims.length, edges: edges.length, sources: sources.length },
    unmatched: mapped.reports.unmatched,
    discrepancy_explanations: [
      `Herbs and compounds are preserved 1:1 (no governance filtering at migration time; filtering happens later in the export adapter).`,
      `Evidence_Register: ${wbEvidence} rows → ${mapped.reports.unmatched.claims.length} rows have subject slugs absent from Entity_Master (unmatched, listed below); the remaining ${wbEvidence - mapped.reports.unmatched.claims.length} collapse to ${claims.length} distinct claims because multiple rows assert the same subject+effect+qualifier (deterministic claim-ID dedup).`,
      `Entity_Relationships: ${wbRelationships} rows → ${edges.length} distinct edges; ${wbRelationships - edges.length} rows are duplicate (from,rel_type,to) triples collapsed by deterministic edge-ID dedup. 0 unmatched.`,
      `Sources: ${wbSources} Source_Register rows contain duplicate citations (same PMID/DOI/URL) which dedupe by source-ID; inline citations discovered in Evidence_Register are added when not already registered, yielding ${sources.length} distinct canonical sources.`,
      `Derived entities (${mapped.reports.counts.effects} effects, ${mapped.reports.counts.studies} studies) have no 1:1 workbook row count — effects are distinct effect_or_condition values; studies are distinct Evidence_Register record_ids.`,
    ],
  }

  // Reports always written (even in dry-run) to docs/canonical-data-system/reports/.
  const reportsDir = path.join(repoRoot, 'docs', 'canonical-data-system', 'reports')
  ensureDir(reportsDir)
  const ts = timestamp()
  writeJson(path.join(reportsDir, `migration-${ts}.json`), migrationReport)
  writeJson(path.join(reportsDir, `duplicates-${ts}.json`), duplicateReport)
  writeJson(path.join(reportsDir, `missing-data-${ts}.json`), missingReport)
  writeJson(path.join(reportsDir, `relationships-${ts}.json`), relationshipReport)
  // Also write stable "latest" copies for easy diffing/CI.
  writeJson(path.join(reportsDir, 'migration-latest.json'), migrationReport)
  writeJson(path.join(reportsDir, 'duplicates-latest.json'), duplicateReport)
  writeJson(path.join(reportsDir, 'missing-data-latest.json'), missingReport)
  writeJson(path.join(reportsDir, 'relationships-latest.json'), relationshipReport)

  // Print summary
  console.log('\n  reconciliation:')
  console.log(`    herbs:      workbook ${wbHerbs} → canonical ${mapped.reports.counts.herbs}`)
  console.log(`    compounds:  workbook ${wbCompounds} → canonical ${mapped.reports.counts.compounds}`)
  console.log(`    evidence:   workbook ${wbEvidence} rows → ${claims.length} claims (${mapped.reports.unmatched.claims.length} unmatched subjects)`)
  console.log(`    relations:  workbook ${wbRelationships} rows → ${edges.length} edges (${mapped.reports.unmatched.edges.length} unmatched)`)
  console.log(`    sources:    workbook ${wbSources} rows → ${sources.length} canonical sources (incl. inline from evidence)`)
  console.log(`    derived:    ${mapped.reports.counts.effects} effect entities, ${mapped.reports.counts.studies} study entities`)
  console.log('\n  duplicate candidates:')
  console.log(`    exact=${duplicateReport.exactDuplicates.length} similar-name=${duplicateReport.similarNames.length} alias-collision=${duplicateReport.aliasCollisions.length} conflicting-slug=${duplicateReport.conflictingSlugs.length}`)
  console.log(`  missing important fields: ${missingReport.totalMissing} gaps`)
  console.log(`  reports → docs/canonical-data-system/reports/*-${ts}.json`)

  if (args.dryRun) {
    console.log('\n✓ dry run complete — no files written to staging or canonical')
    return
  }

  // Write to staging (partitioned entity files + claims/edges/sources).
  const stagingEntitiesDir = path.join(stagingDir, 'canonical', 'entities')
  const stagingClaims = path.join(stagingDir, 'canonical', 'claims', 'claims.jsonl')
  const stagingEdges = path.join(stagingDir, 'canonical', 'relationships', 'edges.jsonl')
  const stagingSources = path.join(stagingDir, 'canonical', 'sources', 'sources.jsonl')

  const partitioned = partitionEntities(entities)
  for (const [type, records] of partitioned) {
    writeJsonl(path.join(stagingEntitiesDir, `${type}.jsonl`), records)
  }
  writeJsonl(stagingClaims, claims)
  writeJsonl(stagingEdges, edges)
  writeJsonl(stagingSources, sources)
  console.log(`\n✓ staged to ${path.relative(repoRoot, path.join(stagingDir, 'canonical'))}`)

  if (args.promote) {
    for (const type of ENTITY_TYPES) {
      const src = path.join(stagingEntitiesDir, `${type}.jsonl`)
      const dest = entityFileFor(type)
      if (fs.existsSync(src)) {
        ensureDir(path.dirname(dest))
        fs.copyFileSync(src, dest)
      }
    }
    ensureDir(path.dirname(claimsFile))
    fs.copyFileSync(stagingClaims, claimsFile)
    fs.copyFileSync(stagingEdges, edgesFile)
    fs.copyFileSync(stagingSources, sourcesFile)
    console.log(`✓ promoted staging → data/canonical/`)
  } else {
    console.log('  (staging only — pass --promote to copy into data/canonical/)')
  }
}

main().catch((error) => {
  console.error(`✗ migration failed: ${error.message}`)
  console.error(error.stack)
  process.exit(1)
})
