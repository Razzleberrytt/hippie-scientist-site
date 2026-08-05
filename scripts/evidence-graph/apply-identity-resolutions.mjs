#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeAliases } from '../../config/evidence-graph/identity-rules.mjs'
import { getRepoRoot } from '../workbook-source.mjs'

const DEFAULT_REGISTRY = 'data/graph/identity/substance-registry.json'
const DEFAULT_RESOLUTIONS = 'data/graph/identity/identity-resolutions.json'
const DEFAULT_REPORT = 'data/graph/identity/identity-resolution-report.json'

function readJson(filePath) {
  if (!fs.existsSync(filePath)) throw new Error(`Required file not found: ${filePath}`)
  return JSON.parse(fs.readFileSync(filePath, 'utf8'))
}

function writeJson(filePath, value) {
  fs.mkdirSync(path.dirname(filePath), { recursive: true })
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function removeCollisionFlags(record) {
  return (record.reviewFlags ?? []).filter((flag) => (
    flag !== 'identity-collision' && !flag.startsWith('collision:')
  ))
}

export function applyIdentityResolutions(registry, resolutionDocument) {
  const records = structuredClone(registry)
  const byId = new Map(records.map((record) => [record.id, record]))
  const applied = []
  const skipped = []

  for (const resolution of resolutionDocument?.resolutions ?? []) {
    if (resolution.status !== 'approved') {
      skipped.push({ ...resolution, skipReason: 'not-approved' })
      continue
    }
    if (resolution.action !== 'merge-alias') {
      skipped.push({ ...resolution, skipReason: 'unsupported-action' })
      continue
    }

    const canonical = byId.get(resolution.canonicalRecordId)
    const retired = (resolution.retiredRecordIds ?? []).map((id) => byId.get(id))
    if (!canonical || retired.some((record) => !record)) {
      throw new Error(`Resolution references missing identity: ${resolution.collisionKey}`)
    }
    if (retired.some((record) => record.entityType !== canonical.entityType)) {
      throw new Error(`merge-alias cannot cross entity types: ${resolution.collisionKey}`)
    }

    canonical.aliases = normalizeAliases([
      ...(canonical.aliases ?? []),
      ...retired.flatMap((record) => [
        record.canonicalName,
        record.canonicalSlug,
        ...(record.aliases ?? []),
        record.scientificName,
      ]),
    ]).filter((alias) => alias.toLowerCase() !== canonical.canonicalName.toLowerCase())
    canonical.reviewFlags = removeCollisionFlags(canonical)
    canonical.status = canonical.reviewFlags.length ? 'needs-review' : 'active'

    for (const record of retired) {
      record.parentEntityId = canonical.id
      record.status = 'deprecated'
      record.reviewFlags = normalizeAliases([
        ...removeCollisionFlags(record),
        'merged-into-canonical-identity',
      ])
    }

    applied.push({
      collisionKey: resolution.collisionKey,
      action: resolution.action,
      canonicalRecordId: canonical.id,
      retiredRecordIds: retired.map((record) => record.id),
    })
  }

  return {
    registry: records,
    report: {
      schemaVersion: resolutionDocument?.schemaVersion ?? null,
      generatedAt: new Date().toISOString(),
      summary: {
        approvedResolutions: (resolutionDocument?.resolutions ?? []).filter((item) => item.status === 'approved').length,
        appliedResolutions: applied.length,
        skippedResolutions: skipped.length,
        deprecatedRecords: records.filter((record) => record.status === 'deprecated').length,
      },
      applied,
      skipped,
    },
  }
}

export function run(options = {}) {
  const repoRoot = options.repoRoot ?? getRepoRoot()
  const registryPath = path.resolve(repoRoot, options.registryPath ?? DEFAULT_REGISTRY)
  const resolutionsPath = path.resolve(repoRoot, options.resolutionsPath ?? DEFAULT_RESOLUTIONS)
  const reportPath = path.resolve(repoRoot, options.reportPath ?? DEFAULT_REPORT)

  const registry = readJson(registryPath)
  const resolutions = readJson(resolutionsPath)
  const result = applyIdentityResolutions(registry, resolutions)

  writeJson(registryPath, result.registry)
  writeJson(reportPath, result.report)
  return { ...result, registryPath, reportPath }
}

function main() {
  const result = run()
  console.log(`[evidence-graph] Applied resolutions: ${result.report.summary.appliedResolutions}`)
  console.log(`[evidence-graph] Deprecated identities: ${result.report.summary.deprecatedRecords}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main()
  } catch (error) {
    console.error(`[evidence-graph] ${error.stack || error.message}`)
    process.exitCode = 1
  }
}
