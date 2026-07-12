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

  // Graph query views. These make the common traversals one SELECT away without
  // any hosted graph database.
  db.exec(`
    -- Herb → contained compound.
    CREATE VIEW v_herb_compounds AS
      SELECT h.id AS herb_id, h.slug AS herb_slug, h.canonical_name AS herb_name,
             c.id AS compound_id, c.slug AS compound_slug, c.canonical_name AS compound_name,
             e.weight, e.review_status
      FROM edges e
      JOIN entities h ON h.id = e.from_id AND h.entity_type = 'herb'
      JOIN entities c ON c.id = e.to_id AND c.entity_type = 'compound'
      WHERE e.rel_type = 'contains_compound';

    -- Entity → effect (via supports_outcome claims).
    CREATE VIEW v_entity_effects AS
      SELECT s.id AS subject_id, s.slug AS subject_slug, s.entity_type,
             o.id AS effect_id, o.slug AS effect_slug, o.canonical_name AS effect_name,
             cl.evidence_level, cl.confidence, cl.review_status
      FROM claims cl
      JOIN entities s ON s.id = cl.subject_id
      JOIN entities o ON o.id = cl.object_id AND o.entity_type = 'effect'
      WHERE cl.predicate = 'supports_outcome';

    -- Herbs sharing a compound (undirected pair, a<b to dedupe).
    CREATE VIEW v_herbs_sharing_compound AS
      SELECT a.herb_id AS herb_a, a.herb_name AS herb_a_name,
             b.herb_id AS herb_b, b.herb_name AS herb_b_name,
             a.compound_id, a.compound_name
      FROM v_herb_compounds a
      JOIN v_herb_compounds b ON a.compound_id = b.compound_id AND a.herb_id < b.herb_id;

    -- Entities sharing a mechanism/pathway overlap edge.
    CREATE VIEW v_shared_mechanism AS
      SELECT f.id AS a_id, f.canonical_name AS a_name, t.id AS b_id, t.canonical_name AS b_name, e.rel_type
      FROM edges e
      JOIN entities f ON f.id = e.from_id
      JOIN entities t ON t.id = e.to_id
      WHERE e.rel_type IN ('pathway_overlap', 'mechanism_overlap', 'shares_mechanism');

    -- Degree (connectivity) per entity.
    CREATE VIEW v_entity_degree AS
      SELECT e.id, e.entity_type, e.slug, e.canonical_name,
             (SELECT COUNT(*) FROM edges WHERE from_id = e.id) +
             (SELECT COUNT(*) FROM edges WHERE to_id = e.id) AS degree,
             (SELECT COUNT(*) FROM claims WHERE subject_id = e.id) AS claim_count
      FROM entities e;

    -- Isolated entities: no edges at all.
    CREATE VIEW v_isolated_entities AS
      SELECT id, entity_type, slug, canonical_name FROM v_entity_degree WHERE degree = 0;

    -- Highly connected entities.
    CREATE VIEW v_highly_connected AS
      SELECT id, entity_type, slug, canonical_name, degree FROM v_entity_degree ORDER BY degree DESC;

    -- Weakly sourced claims: no linked source or weak evidence.
    CREATE VIEW v_weak_claims AS
      SELECT cl.id, cl.subject_id, s.slug AS subject_slug, cl.predicate,
             TRIM(cl.object_literal_json, '"') AS object_literal,
             cl.evidence_level, cl.review_status,
             (SELECT COUNT(*) FROM claim_sources WHERE claim_id = cl.id) AS source_count
      FROM claims cl JOIN entities s ON s.id = cl.subject_id
      WHERE (SELECT COUNT(*) FROM claim_sources WHERE claim_id = cl.id) = 0
         OR cl.evidence_level IN ('none', 'anecdotal', 'traditional');

    -- Safety warnings shared across multiple entities (same warning text).
    CREATE VIEW v_shared_safety AS
      SELECT LOWER(TRIM(object_literal_json, '"')) AS warning, COUNT(DISTINCT subject_id) AS entity_count,
             GROUP_CONCAT(DISTINCT subject_id) AS entity_ids
      FROM claims WHERE predicate = 'has_safety_warning' AND TRIM(object_literal_json, '"') <> ''
      GROUP BY LOWER(TRIM(object_literal_json, '"')) HAVING entity_count > 1;

    -- Conflicting claims: same subject + predicate, differing object literal.
    CREATE VIEW v_conflicting_claims AS
      SELECT a.subject_id, a.predicate, a.id AS claim_a, TRIM(a.object_literal_json, '"') AS object_a,
             b.id AS claim_b, TRIM(b.object_literal_json, '"') AS object_b
      FROM claims a JOIN claims b
        ON a.subject_id = b.subject_id AND a.predicate = b.predicate
       AND a.id < b.id
       AND TRIM(a.object_literal_json, '"') <> '' AND TRIM(b.object_literal_json, '"') <> ''
       AND LOWER(TRIM(a.object_literal_json, '"')) <> LOWER(TRIM(b.object_literal_json, '"'))
      WHERE a.predicate IN ('has_dosage', 'has_safety_warning', 'contraindicated_in');

    -- Potential duplicate entities: same canonical name, different id.
    CREATE VIEW v_duplicate_candidates AS
      SELECT a.id AS id_a, b.id AS id_b, a.canonical_name, a.entity_type
      FROM entities a JOIN entities b
        ON LOWER(a.canonical_name) = LOWER(b.canonical_name) AND a.id < b.id;

    -- Compounds connected to multiple effects (potential multi-goal actives).
    CREATE VIEW v_multi_effect_compounds AS
      SELECT subject_id, subject_slug, COUNT(DISTINCT effect_id) AS effect_count
      FROM v_entity_effects WHERE entity_type = 'compound'
      GROUP BY subject_id HAVING effect_count > 1;
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
