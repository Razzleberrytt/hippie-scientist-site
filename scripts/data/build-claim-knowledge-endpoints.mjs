#!/usr/bin/env node

import { existsSync, mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { contentHash, stableStringify } from './canonical/ids.mjs'
import { buildClaimKnowledgeBase } from './claim-knowledge-lib.mjs'
import { remapClaimKnowledgeToStableSubstanceIds } from './claim-knowledge-identity.mjs'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const PUBLIC_DATA = path.join(ROOT, 'public', 'data')
const ENDPOINT_DIR = path.join(PUBLIC_DATA, 'ingredients')
const REPORT_DIR = path.join(ROOT, 'ops', 'reports')

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
  const rows = []
  for (const [index, line] of readFileSync(filePath, 'utf8').split(/\r?\n/).entries()) {
    const text = line.trim()
    if (!text) continue
    try {
      rows.push(JSON.parse(text))
    } catch (error) {
      throw new Error(`Invalid JSONL at ${path.relative(ROOT, filePath)}:${index + 1}: ${error.message}`)
    }
  }
  return rows
}

function assertUniqueClaims(claims) {
  const seen = new Map()
  for (const claim of claims) {
    const id = String(claim?.id || '').trim()
    if (!id) continue
    const fingerprint = contentHash(stableStringify(claim))
    const prior = seen.get(id)
    if (prior && prior !== fingerprint) {
      throw new Error(`Claim ID ${id} appears with conflicting payloads; refusing to generate drift-prone endpoints.`)
    }
    seen.set(id, fingerprint)
  }
}

function renderMarkdown(knowledge) {
  const lines = [
    '# Claim knowledge endpoint report',
    '',
    `Generated ${knowledge.generatedAt}.`,
    '',
    `- Runtime profiles represented: **${knowledge.summary.profiles}**`,
    `- Canonical claims attached: **${knowledge.summary.claims}**`,
    `- Machine-readable ingredient endpoints: **${knowledge.summary.endpoints}**`,
    `- Canonical source records available: **${knowledge.summary.sourceRecords}**`,
    `- Orphan claims not attached to a public herb/compound profile: **${knowledge.summary.orphanClaims}**`,
    `- Integrity hash: \`${knowledge.integrityHash}\``,
    '',
    '## Identity contract',
    '',
    `- Public substance IDs: **${knowledge.identityContract?.publicSubstanceIds || 'legacy'}**`,
    `- Legacy claim join IDs: **${knowledge.identityContract?.legacyClaimJoinIds || 'n/a'}**`,
    '',
    '## Contract',
    '',
    '- Stable claim IDs are the identity key; duplicate IDs with conflicting payloads fail generation.',
    '- `supportingSourceIds`, `contradictingSourceIds`, and `mixedSourceIds` are populated only when claim direction explicitly supports that classification.',
    '- A claim `updated_at` is not called a review date unless the claim is approved or carries an explicit review timestamp.',
    '- Migration/editorial notes are never exported as public claim wording unless an explicit `public_statement`/`claim_text` qualifier exists.',
    '- Human-readable ingredient pages remain the canonical destinations; JSON files are structured companion data.',
    '',
  ]

  if (knowledge.diagnostics.orphanClaims.length) {
    lines.push('## Orphan claims requiring mapping review', '')
    for (const row of knowledge.diagnostics.orphanClaims.slice(0, 100)) {
      lines.push(`- \`${row.claimId}\` → \`${row.subjectId}\`: ${row.reason}`)
    }
    lines.push('')
  }

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
const claims = readJsonl(path.join(ROOT, 'data', 'canonical', 'claims', 'claims.jsonl'))
const sources = readJsonl(path.join(ROOT, 'data', 'canonical', 'sources', 'sources.jsonl'))

assertUniqueClaims(claims)
const derivedKnowledge = buildClaimKnowledgeBase({ herbs, compounds, claims, sources })
const knowledge = remapClaimKnowledgeToStableSubstanceIds(derivedKnowledge, { herbs, compounds })

mkdirSync(PUBLIC_DATA, { recursive: true })
mkdirSync(REPORT_DIR, { recursive: true })
rmSync(ENDPOINT_DIR, { recursive: true, force: true })
mkdirSync(ENDPOINT_DIR, { recursive: true })

for (const endpoint of knowledge.endpoints) {
  writeFileSync(path.join(ENDPOINT_DIR, `${endpoint.entity.slug}.json`), `${JSON.stringify(endpoint, null, 2)}\n`)
}

const aggregate = {
  version: knowledge.version,
  generatedAt: knowledge.generatedAt,
  identityContract: knowledge.identityContract,
  summary: knowledge.summary,
  claims: knowledge.claims,
  dependencies: knowledge.dependencies,
  endpointIndex: knowledge.endpointIndex,
  diagnostics: knowledge.diagnostics,
  integrityHash: knowledge.integrityHash,
}

writeFileSync(path.join(PUBLIC_DATA, 'claim-knowledge-graph.json'), `${JSON.stringify(aggregate, null, 2)}\n`)
writeFileSync(path.join(PUBLIC_DATA, 'claim-page-dependencies.json'), `${JSON.stringify(knowledge.dependencies, null, 2)}\n`)
writeFileSync(path.join(REPORT_DIR, 'claim-knowledge-endpoints.md'), renderMarkdown(knowledge))

console.log('\nClaim knowledge endpoints')
console.log('='.repeat(64))
console.log(`Profiles      ${knowledge.summary.profiles}`)
console.log(`Claims        ${knowledge.summary.claims}`)
console.log(`Endpoints     ${knowledge.summary.endpoints}`)
console.log(`Orphan claims ${knowledge.summary.orphanClaims}`)
console.log(`Integrity     ${knowledge.integrityHash.slice(0, 16)}…`)
console.log('Identity      stable evidence-graph substance IDs')
console.log('Aggregate     public/data/claim-knowledge-graph.json')
console.log('Dependencies  public/data/claim-page-dependencies.json')
console.log('Endpoints     public/data/ingredients/<slug>.json')
