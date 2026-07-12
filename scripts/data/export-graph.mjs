#!/usr/bin/env node
// data:export-graph — export the semantic graph in portable formats:
//   data/generated/graph/nodes.jsonl
//   data/generated/graph/edges.jsonl   (explicit + derived + suggested, tagged)
//   data/generated/graph/graph.graphml (standard interchange)
//
// Edges are separated by origin so inferred connections are never presented as
// fact: `explicit` (sourced/asserted), `derived` (deterministic), `suggested`
// (inferred — each carries an explanation and requires review).

import fs from 'node:fs'
import path from 'node:path'
import { loadEntities, loadEdges } from './canonical/store.mjs'
import { openDb, suggestSharedCompoundEdges } from './canonical/graph.mjs'
import { writeJsonl, ensureDir } from './canonical/jsonl.mjs'
import { generatedDir } from './canonical/paths.mjs'

function toGraphml(nodes, edges) {
  const esc = (s) => String(s ?? '').replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;')
  const lines = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<graphml xmlns="http://graphml.graphdrawing.org/xmlns">',
    '  <key id="label" for="node" attr.name="label" attr.type="string"/>',
    '  <key id="type" for="node" attr.name="type" attr.type="string"/>',
    '  <key id="rel" for="edge" attr.name="rel" attr.type="string"/>',
    '  <key id="origin" for="edge" attr.name="origin" attr.type="string"/>',
    '  <graph edgedefault="directed">',
  ]
  for (const n of nodes) lines.push(`    <node id="${esc(n.id)}"><data key="label">${esc(n.label)}</data><data key="type">${esc(n.type)}</data></node>`)
  edges.forEach((e, i) => {
    lines.push(`    <edge id="e${i}" source="${esc(e.from_id)}" target="${esc(e.to_id)}"><data key="rel">${esc(e.rel_type)}</data><data key="origin">${esc(e.origin)}</data></edge>`)
  })
  lines.push('  </graph>', '</graphml>')
  return `${lines.join('\n')}\n`
}

async function main() {
  const outDir = path.join(generatedDir, 'graph')
  ensureDir(outDir)

  const entities = loadEntities()
  const nodes = entities
    .map((e) => ({ id: e.id, label: e.canonical_name, slug: e.slug, type: e.entity_type }))
    .sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  const explicitEdges = loadEdges().map((e) => ({
    id: e.id, from_id: e.from_id, to_id: e.to_id, rel_type: e.rel_type,
    origin: e.origin || 'explicit', weight: e.weight, explanation: e.explanation,
  }))

  // Suggested (inferred) edges — never written into canonical, exported tagged.
  const db = await openDb()
  let suggested = []
  try {
    suggested = suggestSharedCompoundEdges(db, { threshold: 3 }).map((s, i) => ({
      id: `sug_${i}`, from_id: s.from_id, to_id: s.to_id, rel_type: s.rel_type,
      origin: 'suggested', explanation: s.explanation, shared_count: s.shared_count,
    }))
  } finally {
    db.close()
  }

  const allEdges = [...explicitEdges, ...suggested].sort((a, b) => (a.id < b.id ? -1 : a.id > b.id ? 1 : 0))

  writeJsonl(path.join(outDir, 'nodes.jsonl'), nodes)
  writeJsonl(path.join(outDir, 'edges.jsonl'), allEdges)
  fs.writeFileSync(path.join(outDir, 'graph.graphml'), toGraphml(nodes, allEdges), 'utf8')

  const byOrigin = {}
  for (const e of allEdges) byOrigin[e.origin] = (byOrigin[e.origin] || 0) + 1
  console.log(`✓ graph exported to data/generated/graph/`)
  console.log(`  nodes: ${nodes.length}`)
  console.log(`  edges: ${allEdges.length} (${Object.entries(byOrigin).map(([k, v]) => `${k}=${v}`).join(', ')})`)
  console.log('  formats: nodes.jsonl, edges.jsonl, graph.graphml')
}

main().catch((error) => { console.error(error); process.exit(1) })
