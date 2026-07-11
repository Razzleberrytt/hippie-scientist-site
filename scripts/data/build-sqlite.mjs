#!/usr/bin/env node
// data:build-db — rebuild data/db/canonical.sqlite entirely from the canonical
// JSONL files. The database is a disposable analytics/query artifact; the JSONL
// files remain the only source of truth. Uses the built-in node:sqlite module
// (no native dependency, no hosted service).

import fs from 'node:fs'
import { DatabaseSync } from 'node:sqlite'
import { loadDataset } from './canonical/store.mjs'
import { sqliteDbPath, dbDir } from './canonical/paths.mjs'
import { stableStringify } from './canonical/ids.mjs'

function j(value) {
  return value == null ? null : stableStringify(value)
}

export function buildDatabase({ dbPath = sqliteDbPath } = {}) {
  fs.mkdirSync(dbDir, { recursive: true })
  // Rebuild from scratch every time — never incrementally mutate.
  if (fs.existsSync(dbPath)) fs.rmSync(dbPath)

  const { entities, claims, edges, sources } = loadDataset()
  const db = new DatabaseSync(dbPath)

  db.exec(`
    PRAGMA journal_mode = WAL;
    CREATE TABLE entities (
      id TEXT PRIMARY KEY,
      entity_type TEXT NOT NULL,
      canonical_name TEXT NOT NULL,
      slug TEXT NOT NULL,
      description TEXT,
      review_status TEXT,
      created_at TEXT,
      updated_at TEXT,
      aliases_json TEXT,
      data_json TEXT,
      legacy_json TEXT,
      provenance_json TEXT
    );
    CREATE TABLE entity_aliases (
      entity_id TEXT NOT NULL,
      alias TEXT NOT NULL
    );
    CREATE TABLE claims (
      id TEXT PRIMARY KEY,
      subject_id TEXT NOT NULL,
      predicate TEXT NOT NULL,
      object_id TEXT,
      object_literal_json TEXT,
      evidence_level TEXT,
      confidence REAL,
      review_status TEXT,
      qualifiers_json TEXT,
      source_ids_json TEXT,
      notes TEXT,
      created_at TEXT,
      updated_at TEXT
    );
    CREATE TABLE claim_sources (
      claim_id TEXT NOT NULL,
      source_id TEXT NOT NULL
    );
    CREATE TABLE edges (
      id TEXT PRIMARY KEY,
      from_id TEXT NOT NULL,
      rel_type TEXT NOT NULL,
      to_id TEXT NOT NULL,
      direction TEXT,
      weight REAL,
      confidence REAL,
      evidence_level TEXT,
      origin TEXT,
      explanation TEXT,
      review_status TEXT
    );
    CREATE TABLE sources (
      id TEXT PRIMARY KEY,
      pmid TEXT,
      doi TEXT,
      url TEXT,
      title TEXT,
      author_or_label TEXT,
      year TEXT,
      journal TEXT,
      used_for TEXT,
      citation TEXT,
      review_status TEXT
    );
  `)

  const insertEntity = db.prepare(`INSERT INTO entities
    (id, entity_type, canonical_name, slug, description, review_status, created_at, updated_at, aliases_json, data_json, legacy_json, provenance_json)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`)
  const insertAlias = db.prepare('INSERT INTO entity_aliases (entity_id, alias) VALUES (?,?)')
  const insertClaim = db.prepare(`INSERT INTO claims
    (id, subject_id, predicate, object_id, object_literal_json, evidence_level, confidence, review_status, qualifiers_json, source_ids_json, notes, created_at, updated_at)
    VALUES (?,?,?,?,?,?,?,?,?,?,?,?,?)`)
  const insertClaimSource = db.prepare('INSERT INTO claim_sources (claim_id, source_id) VALUES (?,?)')
  const insertEdge = db.prepare(`INSERT INTO edges
    (id, from_id, rel_type, to_id, direction, weight, confidence, evidence_level, origin, explanation, review_status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)
  const insertSource = db.prepare(`INSERT INTO sources
    (id, pmid, doi, url, title, author_or_label, year, journal, used_for, citation, review_status)
    VALUES (?,?,?,?,?,?,?,?,?,?,?)`)

  db.exec('BEGIN')
  try {
    for (const e of entities) {
      insertEntity.run(e.id, e.entity_type, e.canonical_name, e.slug, e.description ?? '', e.review_status ?? '', e.created_at ?? '', e.updated_at ?? '', j(e.aliases ?? []), j(e.data ?? {}), j(e.legacy ?? {}), j(e.provenance ?? []))
      for (const alias of e.aliases ?? []) insertAlias.run(e.id, String(alias))
    }
    for (const c of claims) {
      insertClaim.run(c.id, c.subject_id, c.predicate, c.object_id ?? null, j(c.object_literal), c.evidence_level ?? 'none', c.confidence ?? null, c.review_status ?? '', j(c.qualifiers ?? {}), j(c.source_ids ?? []), c.notes ?? '', c.created_at ?? '', c.updated_at ?? '')
      for (const sid of c.source_ids ?? []) insertClaimSource.run(c.id, sid)
    }
    for (const ed of edges) {
      insertEdge.run(ed.id, ed.from_id, ed.rel_type, ed.to_id, ed.direction ?? 'directed', ed.weight ?? null, ed.confidence ?? null, ed.evidence_level ?? 'none', ed.origin ?? 'explicit', ed.explanation ?? null, ed.review_status ?? '')
    }
    for (const s of sources) {
      insertSource.run(s.id, s.pmid ?? null, s.doi ?? null, s.url ?? null, s.title ?? '', s.author_or_label ?? '', s.year != null ? String(s.year) : null, s.journal ?? '', s.used_for ?? '', s.citation ?? '', s.review_status ?? '')
    }
    db.exec('COMMIT')
  } catch (error) {
    db.exec('ROLLBACK')
    throw error
  }

  // Indexes for common lookups + graph traversal.
  db.exec(`
    CREATE INDEX idx_entities_type ON entities(entity_type);
    CREATE INDEX idx_entities_slug ON entities(slug);
    CREATE INDEX idx_aliases_alias ON entity_aliases(alias);
    CREATE INDEX idx_claims_subject ON claims(subject_id);
    CREATE INDEX idx_claims_object ON claims(object_id);
    CREATE INDEX idx_claims_predicate ON claims(predicate);
    CREATE INDEX idx_edges_from ON edges(from_id);
    CREATE INDEX idx_edges_to ON edges(to_id);
    CREATE INDEX idx_edges_type ON edges(rel_type);
    CREATE INDEX idx_claim_sources_source ON claim_sources(source_id);
  `)

  const counts = {
    entities: entities.length,
    claims: claims.length,
    edges: edges.length,
    sources: sources.length,
  }
  db.close()
  return { dbPath, counts }
}

// Run directly (not when imported).
if (import.meta.url === `file://${process.argv[1]}`) {
  const { dbPath, counts } = buildDatabase()
  console.log(`✓ built ${dbPath}`)
  console.log(`  entities=${counts.entities} claims=${counts.claims} edges=${counts.edges} sources=${counts.sources}`)
}
