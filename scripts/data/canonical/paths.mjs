// Canonical data system — filesystem layout.
//
// Single source for every path the canonical pipeline reads or writes. Keeping
// this here means scripts never hard-code directory strings and the layout can
// be relocated in one place.

import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

export const repoRoot = path.resolve(__dirname, '../../..')

export const dataRoot = path.join(repoRoot, 'data')

export const canonicalDir = path.join(dataRoot, 'canonical')
export const entitiesDir = path.join(canonicalDir, 'entities')
export const claimsDir = path.join(canonicalDir, 'claims')
export const relationshipsDir = path.join(canonicalDir, 'relationships')
export const sourcesDir = path.join(canonicalDir, 'sources')

export const patchesDir = path.join(dataRoot, 'patches')
export const patchInboxDir = path.join(patchesDir, 'inbox')
export const patchNormalizedDir = path.join(patchesDir, 'normalized')
export const patchAppliedDir = path.join(patchesDir, 'applied')
export const patchRejectedDir = path.join(patchesDir, 'rejected')

export const generatedDir = path.join(dataRoot, 'generated')
export const stagingDir = path.join(dataRoot, 'staging')
export const schemaMirrorDir = path.join(dataRoot, 'schema')
export const auditDir = path.join(dataRoot, 'audit')
export const snapshotsDir = path.join(dataRoot, 'snapshots')
export const dbDir = path.join(dataRoot, 'db')

export const sqliteDbPath = path.join(dbDir, 'canonical.sqlite')

export const claimsFile = path.join(claimsDir, 'claims.jsonl')
export const edgesFile = path.join(relationshipsDir, 'edges.jsonl')
export const sourcesFile = path.join(sourcesDir, 'sources.jsonl')

// The entity types that each get their own <type>.jsonl file.
export const ENTITY_TYPES = [
  'herb',
  'compound',
  'effect',
  'condition',
  'mechanism',
  'study',
  'source',
  'safety_issue',
  'drug_interaction',
  'preparation',
]

export function entityFileFor(entityType) {
  return path.join(entitiesDir, `${entityType}.jsonl`)
}

export const fieldAliasConfigPath = path.join(repoRoot, 'config', 'field-aliases.json')
export const auditLogFile = path.join(auditDir, 'audit-log.jsonl')
