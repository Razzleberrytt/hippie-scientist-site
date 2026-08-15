#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildResearchRelationshipGraph } from './research-graph-lib.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const PUBLIC_DATA = path.join(ROOT, 'public', 'data')
const REPORTS = path.join(ROOT, 'ops', 'reports')
const OUTPUT_JSON = path.join(PUBLIC_DATA, 'research-relationship-graph.json')
const OUTPUT_MD = path.join(REPORTS, 'research-relationship-graph.md')

function readJson(filePath, fallback) {
  if (!existsSync(filePath)) return fallback
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function readFirstJson(paths, fallback) {
  for (const filePath of paths) {
    const value = readJson(filePath, undefined)
    if (value !== undefined && (!Array.isArray(value) || value.length > 0)) return value
  }
  return fallback
}

function readJsonl(filePath) {
  if (!existsSync(filePath)) return []
  return readFileSync(filePath, 'utf8')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .flatMap((line) => {
      try {
        return [JSON.parse(line)]
      } catch {
        return []
      }
    })
}

function renderMarkdown(graph) {
  const counts = Object.entries(graph.summary.edgeCounts).sort((a, b) => b[1] - a[1])
  const lines = [
    '# Research relationship graph',
    '',
    `Generated ${graph.generatedAt}.`,
    '',
    `- Nodes: **${graph.summary.nodes}**`,
    `- Edges: **${graph.summary.edges}**`,
    `- Differentiated comparison opportunities: **${graph.summary.comparisonOpportunities}**`,
    `- Isolated entities: **${graph.summary.isolatedEntities}**`,
    `- Suspiciously over-connected entities: **${graph.summary.overConnectedEntities}**`,
    '',
    '## Relationship coverage',
    '',
    '| Relationship | Edges |',
    '| --- | ---: |',
    ...counts.map(([rel, count]) => `| ${rel} | ${count} |`),
    '',
    '## Highest-moat comparison opportunities',
    '',
    '| Pair | Score | Differentiators |',
    '| --- | ---: | --- |',
    ...graph.comparisonOpportunities.slice(0, 50).map((row) => `| ${row.pair.map((item) => item.label).join(' vs ')} | ${row.moatScore} | ${row.types.join(', ')} |`),
    '',
    '## Guardrail',
    '',
    graph.semantics.pathway_associated_outcome,
    '',
  ]
  return `${lines.join('\n')}\n`
}

const herbs = readFirstJson([
  path.join(PUBLIC_DATA, 'summary-indexes', 'herbs-summary.json'),
  path.join(PUBLIC_DATA, 'herbs-summary.json'),
  path.join(PUBLIC_DATA, 'herbs.json'),
], [])
const compounds = readFirstJson([
  path.join(PUBLIC_DATA, 'summary-indexes', 'compounds-summary.json'),
  path.join(PUBLIC_DATA, 'compounds-summary.json'),
  path.join(PUBLIC_DATA, 'compounds.json'),
], [])
const herbCompoundMap = readJson(path.join(PUBLIC_DATA, 'herb-compound-map.json'), [])
const claims = readJsonl(path.join(ROOT, 'data', 'canonical', 'claims', 'claims.jsonl'))

const graph = buildResearchRelationshipGraph({ herbs, compounds, herbCompoundMap, claims })
mkdirSync(PUBLIC_DATA, { recursive: true })
mkdirSync(REPORTS, { recursive: true })
writeFileSync(OUTPUT_JSON, `${JSON.stringify(graph, null, 2)}\n`)
writeFileSync(OUTPUT_MD, renderMarkdown(graph))

console.log('\nResearch relationship graph')
console.log('='.repeat(64))
console.log(`Nodes                  ${graph.summary.nodes}`)
console.log(`Edges                  ${graph.summary.edges}`)
console.log(`Comparison candidates  ${graph.summary.comparisonOpportunities}`)
console.log(`Isolated               ${graph.summary.isolatedEntities}`)
console.log(`Over-connected         ${graph.summary.overConnectedEntities}`)
console.log('Output                 public/data/research-relationship-graph.json')
console.log('Report                 ops/reports/research-relationship-graph.md')
