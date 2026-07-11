// Graph query helpers over the generated SQLite database.
//
// Read-only. Rebuilds the DB from canonical JSONL if it is missing so queries
// always reflect current data.

import fs from 'node:fs'
import { sqliteDbPath } from './paths.mjs'

// node:sqlite is imported lazily so this module's pure helpers
// (isReadOnlySelect, suggestSharedCompoundEdges) can be unit-tested under Vite's
// jsdom environment, which cannot bundle the native built-in.
export async function openDb() {
  // Specifiers are built from variables + @vite-ignore so Vite's dependency
  // scanner (used when the pure helpers are unit-tested under jsdom) does not
  // try to bundle these node-only modules.
  const sqliteSpecifier = ['node', 'sqlite'].join(':')
  const { DatabaseSync } = await import(/* @vite-ignore */ sqliteSpecifier)
  if (!fs.existsSync(sqliteDbPath)) {
    const builderSpecifier = '../build-sqlite.mjs'
    const { buildDatabase } = await import(/* @vite-ignore */ builderSpecifier)
    buildDatabase()
  }
  return new DatabaseSync(sqliteDbPath, { readOnly: true })
}

// Named, parameterized queries exposed by the `data:query` CLI.
export const NAMED_QUERIES = {
  'herbs-with-compound': {
    description: 'Herbs containing a compound (param: compound slug)',
    sql: 'SELECT herb_slug, herb_name FROM v_herb_compounds WHERE compound_slug = ? ORDER BY herb_slug',
    params: ['compound_slug'],
  },
  'compounds-in-herb': {
    description: 'Compounds contained in a herb (param: herb slug)',
    sql: 'SELECT compound_slug, compound_name FROM v_herb_compounds WHERE herb_slug = ? ORDER BY compound_slug',
    params: ['herb_slug'],
  },
  'effects-of': {
    description: 'Effects an entity supports (param: entity slug)',
    sql: 'SELECT effect_slug, effect_name, evidence_level FROM v_entity_effects WHERE subject_slug = ? ORDER BY effect_slug',
    params: ['entity_slug'],
  },
  'herbs-sharing-compounds': {
    description: 'Herb pairs sharing a compound',
    sql: 'SELECT herb_a_name, herb_b_name, compound_name FROM v_herbs_sharing_compound ORDER BY herb_a_name LIMIT 200',
    params: [],
  },
  'shared-mechanisms': {
    description: 'Entity pairs linked by a shared mechanism/pathway',
    sql: 'SELECT a_name, b_name, rel_type FROM v_shared_mechanism LIMIT 200',
    params: [],
  },
  'multi-effect-compounds': {
    description: 'Compounds connected to multiple effects',
    sql: 'SELECT subject_slug, effect_count FROM v_multi_effect_compounds ORDER BY effect_count DESC',
    params: [],
  },
  'shared-safety': {
    description: 'Safety warnings shared across multiple entities',
    sql: 'SELECT warning, entity_count FROM v_shared_safety ORDER BY entity_count DESC',
    params: [],
  },
  'highly-connected': {
    description: 'Most connected entities',
    sql: 'SELECT entity_type, slug, canonical_name, degree FROM v_highly_connected WHERE degree > 0 LIMIT 50',
    params: [],
  },
  'isolated': {
    description: 'Entities with no relationships',
    sql: 'SELECT entity_type, slug, canonical_name FROM v_isolated_entities ORDER BY entity_type, slug LIMIT 500',
    params: [],
  },
  'weak-claims': {
    description: 'Weakly sourced / low-evidence claims',
    sql: 'SELECT subject_slug, predicate, object_literal, evidence_level, source_count FROM v_weak_claims LIMIT 500',
    params: [],
  },
  'conflicting-claims': {
    description: 'Conflicting claims on the same subject/predicate',
    sql: 'SELECT subject_id, predicate, object_a, object_b FROM v_conflicting_claims LIMIT 200',
    params: [],
  },
  'duplicate-candidates': {
    description: 'Entities with identical canonical names',
    sql: 'SELECT canonical_name, entity_type, id_a, id_b FROM v_duplicate_candidates ORDER BY canonical_name',
    params: [],
  },
}

// Suggested edges: herbs that share >= threshold compounds but have NO direct
// edge between them. These are INFERRED, require review, and each carries an
// explanation — never treated as fact.
export function suggestSharedCompoundEdges(db, { threshold = 3 } = {}) {
  const rows = db.prepare(`
    SELECT herb_a, herb_a_name, herb_b, herb_b_name, COUNT(*) AS shared
    FROM v_herbs_sharing_compound
    GROUP BY herb_a, herb_b
    HAVING shared >= ?
  `).all(threshold)

  const suggestions = []
  for (const row of rows) {
    const existing = db.prepare(
      'SELECT COUNT(*) AS n FROM edges WHERE (from_id = ? AND to_id = ?) OR (from_id = ? AND to_id = ?)'
    ).get(row.herb_a, row.herb_b, row.herb_b, row.herb_a).n
    if (existing > 0) continue
    suggestions.push({
      from_id: row.herb_a,
      to_id: row.herb_b,
      rel_type: 'shares_compound',
      origin: 'suggested',
      explanation: `${row.herb_a_name} and ${row.herb_b_name} share ${row.shared} compounds but have no direct edge`,
      shared_count: row.shared,
    })
  }
  return suggestions
}

export function isReadOnlySelect(sql) {
  const trimmed = sql.trim().replace(/;+\s*$/, '')
  if (/;/.test(trimmed)) return false // no multiple statements
  return /^select\b/i.test(trimmed) || /^with\b/i.test(trimmed)
}
