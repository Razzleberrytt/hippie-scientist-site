#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

import { UNIQUE_SOURCE_IDENTITY_FIELDS, normalizeSourceIdentityValue, sourceIdentityTokens } from './source-identity.mjs'

const ROOT = process.cwd()
const SEED_PATH = path.join(ROOT, 'data-sources', 'enrichment-source-registry-baseline.json')
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const CHECK_ONLY = process.argv.includes('--check')

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function identityAnchors(row) {
  return Object.fromEntries(UNIQUE_SOURCE_IDENTITY_FIELDS.map(field => [field, normalizeSourceIdentityValue(field, row[field])]))
}

function sameIdentity(left, right) {
  return JSON.stringify(identityAnchors(left)) === JSON.stringify(identityAnchors(right))
}

function collectCrossIdIdentityConflicts(registryRows, seedRows) {
  const owners = new Map()
  const conflicts = []

  const register = (row, origin) => {
    for (const field of UNIQUE_SOURCE_IDENTITY_FIELDS) {
      for (const token of sourceIdentityTokens(field, row?.[field])) {
        const prior = owners.get(token)
        if (prior && prior.sourceId !== row.sourceId) {
          conflicts.push(`${token} (${prior.sourceId} vs ${row.sourceId}; ${prior.origin} vs ${origin})`)
        } else if (!prior) {
          owners.set(token, { sourceId: row.sourceId, origin })
        }
      }
    }
  }

  registryRows.forEach(row => register(row, 'registry'))
  seedRows.forEach(row => register(row, 'seed'))
  return [...new Set(conflicts)].sort()
}

const seed = readJson(SEED_PATH)
const registry = readJson(REGISTRY_PATH)

if (!Array.isArray(seed) || seed.length === 0) throw new Error('Baseline source seed must be a non-empty array.')
if (!Array.isArray(registry)) throw new Error('Source registry must be an array.')

const seedIds = new Set()
for (const row of seed) {
  if (!row?.sourceId) throw new Error('Every baseline source requires sourceId.')
  if (seedIds.has(row.sourceId)) throw new Error(`Duplicate baseline sourceId: ${row.sourceId}`)
  seedIds.add(row.sourceId)
}

const crossIdConflicts = collectCrossIdIdentityConflicts(registry, seed)
if (crossIdConflicts.length > 0) {
  throw new Error(`Baseline cross-ID source identity collision(s): ${crossIdConflicts.join('; ')}`)
}

const byId = new Map(registry.map(row => [row.sourceId, row]))
const conflicts = []
const missing = []
for (const row of seed) {
  const existing = byId.get(row.sourceId)
  if (!existing) {
    missing.push(row.sourceId)
    if (!CHECK_ONLY) byId.set(row.sourceId, row)
    continue
  }
  if (!sameIdentity(existing, row)) conflicts.push(row.sourceId)
}

if (conflicts.length > 0) throw new Error(`Baseline source identity conflict(s): ${conflicts.join(', ')}`)

if (CHECK_ONLY) {
  if (missing.length > 0) throw new Error(`Baseline source(s) missing from registry: ${missing.join(', ')}`)
  console.log(`[bootstrap-enrichment-source-registry] CHECK PASS seed=${seed.length} registry=${registry.length}`)
  process.exit(0)
}

const merged = [...byId.values()].sort((a, b) => a.sourceId.localeCompare(b.sourceId))
fs.writeFileSync(REGISTRY_PATH, `${JSON.stringify(merged, null, 2)}\n`, 'utf8')
console.log(`[bootstrap-enrichment-source-registry] WRITE PASS seed=${seed.length} added=${missing.length} registry=${merged.length}`)
