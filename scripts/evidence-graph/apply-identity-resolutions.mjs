#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeAliases } from '../../config/evidence-graph/identity-rules.mjs'
import { getRepoRoot } from '../workbook-source.mjs'

const DEFAULT_REGISTRY = 'data/graph/identity/substance-registry.json'
const DEFAULT_RESOLUTIONS = 'data/graph/identity/identity-resolutions.json'
const DEFAULT_REPORT = 'data/graph/identity/identity-resolution-report.json'
const SUPPORTED_ACTIONS = new Set(['merge-alias', 'establish-form'])

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

function assertSameEntityType(parent, children, resolution) {
  if (children.some((record) => record.entityType !== parent.entityType)) {
    throw new Error(`${resolution.action} cannot cross entity types: ${resolution.collisionKey}`)
  }
}

function applyMergeAlias({ resolution, canonical, retired }) {
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

  return {
    canonicalRecordId: canonical.id,
    retiredRecordIds: retired.map((record) => record.id),
  }
}

function applyEstablishForm({ resolution, parent, forms }) {
  parent.reviewFlags = removeCollisionFlags(parent)
  parent.status = parent.reviewFlags.length ? 'needs-review' : 'active'

  for (const form of forms) {
    const previousName = form.canonicalName
    form.parentEntityId = parent.id
    form.canonicalName = resolution.formCanonicalNames?.[form.id] || form.canonicalName
    form.aliases = normalizeAliases([
      ...(form.aliases ?? []),
      previousName,
      form.canonicalSlug,
      ...(resolution.formAliases?.[form.id] ?? []),
    ]).filter((alias) => alias.toLowerCase() !== form.canonicalName.toLowerCase())
    form.reviewFlags = normalizeAliases([
      ...removeCollisionFlags(form),
      'form-of-parent-identity',
    ])
    form.status = 'active'
  }

  return {
    canonicalRecordId: parent.id,
    formRecordIds: forms.map((record) => record.id),
  }
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
    if (!SUPPORTED_ACTIONS.has(resolution.action)) {
      skipped.push({ ...resolution, skipReason: 'unsupported-action' })
      continue
    }

    const canonical = byId.get(resolution.canonicalRecordId)
    if (!canonical) {
      throw new Error(`Resolution references missing canonical identity: ${resolution.collisionKey}`)
    }

    if (resolution.action === 'merge-alias') {
      const retired = (resolution.retiredRecordIds ?? []).map((id) => byId.get(id))
      if (retired.length === 0 || retired.some((record) => !record)) {
        throw new Error(`Resolution references missing retired identity: ${resolution.collisionKey}`)
      }
      assertSameEntityType(canonical, retired, resolution)
      applied.push({
        collisionKey: resolution.collisionKey,
        action: resolution.action,
        ...applyMergeAlias({ resolution, canonical, retired }),
      })
      continue
    }

    const forms = (resolution.formRecordIds ?? []).map((id) => byId.get(id))
    if (forms.length === 0 || forms.some((record) => !record)) {
      throw new Error(`Resolution references missing form identity: ${resolution.collisionKey}`)
    }
    if (forms.some((record) => record.id === canonical.id)) {
      throw new Error(`Parent identity cannot also be its own form: ${resolution.collisionKey}`)
    }
    assertSameEntityType(canonical, forms, resolution)
    applied.push({
      collisionKey: resolution.collisionKey,
      action: resolution.action,
      ...applyEstablishForm({ resolution, parent: canonical, forms }),
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
        formRecords: records.filter((record) => record.reviewFlags?.includes('form-of-parent-identity')).length,
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
  console.log(`[evidence-graph] Parent-linked forms: ${result.report.summary.formRecords}`)
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    main()
  } catch (error) {
    console.error(`[evidence-graph] ${error.stack || error.message}`)
    process.exitCode = 1
  }
}
