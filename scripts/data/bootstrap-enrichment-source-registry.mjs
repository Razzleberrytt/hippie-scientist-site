#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const SEED_PATH = path.join(ROOT, 'data-sources', 'enrichment-source-registry-baseline.json')
const REGISTRY_PATH = path.join(ROOT, 'public', 'data', 'source-registry.json')
const CHECK_ONLY = process.argv.includes('--check')
const UNIQUE_IDENTITY_FIELDS = ['pmid', 'doi', 'canonicalUrl', 'monographId']

function readJson(filePath) {
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function normalizeIdentityValue(field, value) {
  if (typeof value !== 'string' || value.trim().length === 0) return null
  const trimmed = value.trim()
  if (field === 'pmid') return trimmed
  if (field === 'doi') return trimmed.toLowerCase().replace(/^https?:\/\/(?:dx\.)?doi\.org\//u, '').replace(/^doi:\s*/u, '')
  if (field === 'canonicalUrl') {
    try {
      const url = new URL(trimmed)
      url.hash = ''
      if (url.pathname.length > 1) url.pathname = url.pathname.replace(/\/+$/u, '')
      return url.toString()
    } catch {
      return trimmed
    }
  }
  return trimmed.toLowerCase()
}

function identityAnchors(row) {
  return Object.fromEntries(UNIQUE_IDENTITY_FIELDS.map(field => [field, normalizeIdentityValue(field, row[field])]))
}

function sameIdentity(left, right) {
  return JSON.stringify(identityAnchors(left)) === JSON.stringify(identityAnchors(right))
}

function collectCrossIdIdentityConflicts(registryRows, seedRows) {
  const owners = new Map()
  const conflicts = []

  const register = (row, origin) => {
    for (const field of UNIQUE_IDENTITY_FIELDS) {
      const value = normalizeIdentityValue(field, row?.[field])
      if (!value) continue
      const key = `${field}:${value}`
      const prior = owners.get(key)
      if (prior && prior.sourceId !== row.sourceId) {
        conflicts.push(`${field}=${value} (${prior.sourceId} vs ${row.sourceId}; ${prior.origin} vs ${origin})`)
      } else if (!prior) {
        owners.set(key, { sourceId: row.sourceId, origin })
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
