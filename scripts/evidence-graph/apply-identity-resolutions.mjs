#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { normalizeAliases } from '../../config/evidence-graph/identity-rules.mjs'
import { getRepoRoot } from '../workbook-source.mjs'

function writeJson(target, value) {
  fs.mkdirSync(path.dirname(target), { recursive: true })
  fs.writeFileSync(target, `${JSON.stringify(value, null, 2)}\n`)
}

export function applyIdentityResolutions(options = {}) {
  const repoRoot = options.repoRoot || getRepoRoot()
  const registryPath = path.resolve(repoRoot, options.registryPath || 'data/graph/identity/substance-registry.json')
  const resolutionsPath = path.resolve(repoRoot, options.resolutionsPath || 'data/graph/identity/identity-resolutions.json')
  const reportPath = path.resolve(repoRoot, options.reportPath || 'data/graph/identity/identity-resolution-report.json')
  const registry = JSON.parse(fs.readFileSync(registryPath, 'utf8'))
  const ledger = JSON.parse(fs.readFileSync(resolutionsPath, 'utf8'))
  const byId = new Map(registry.map((record) => [record.id, record]))
  let applied = 0
  let skipped = 0

  for (const resolution of ledger.resolutions.filter((item) => item.status === 'approved')) {
    const canonical = byId.get(resolution.canonicalRecordId)
    if (!canonical) { skipped += 1; continue }

    if (resolution.action === 'merge-alias') {
      const retired = (resolution.retiredRecordIds || []).map((id) => byId.get(id)).filter(Boolean)
      if (!retired.length) { skipped += 1; continue }
      canonical.aliases = normalizeAliases([...canonical.aliases, ...retired.flatMap((record) => [record.canonicalName, record.canonicalSlug, ...record.aliases])])
      for (const record of retired) {
        record.status = 'deprecated'
        record.parentEntityId = canonical.id
        record.reviewFlags = [...new Set([...record.reviewFlags.filter((flag) => flag !== 'identity-collision'), 'merged-as-alias'])]
      }
      canonical.status = 'active'
      canonical.reviewFlags = canonical.reviewFlags.filter((flag) => flag !== 'identity-collision')
      applied += 1
      continue
    }

    if (resolution.action === 'establish-form') {
      const forms = (resolution.formRecordIds || []).map((id) => byId.get(id)).filter(Boolean)
      if (!forms.length) { skipped += 1; continue }
      for (const form of forms) {
        form.parentEntityId = canonical.id
        form.canonicalName = resolution.formCanonicalNames?.[form.id] || form.canonicalName
        form.aliases = normalizeAliases([...form.aliases, ...(resolution.formAliases?.[form.id] || [])])
        form.status = 'active'
        form.reviewFlags = [...new Set([...form.reviewFlags.filter((flag) => flag !== 'identity-collision'), 'form-of-parent-identity'])]
      }
      canonical.status = 'active'
      canonical.reviewFlags = canonical.reviewFlags.filter((flag) => flag !== 'identity-collision')
      applied += 1
      continue
    }

    skipped += 1
  }

  writeJson(registryPath, registry)
  const report = {
    schemaVersion: ledger.schemaVersion,
    generatedAt: new Date().toISOString(),
    summary: {
      approvedResolutions: ledger.resolutions.filter((item) => item.status === 'approved').length,
      appliedResolutions: applied,
      skippedResolutions: skipped,
      deprecatedRecords: registry.filter((record) => record.status === 'deprecated').length,
      formRecords: registry.filter((record) => record.reviewFlags?.includes('form-of-parent-identity')).length,
    },
  }
  writeJson(reportPath, report)
  return { registry, report }
}

if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  try {
    const { report } = applyIdentityResolutions()
    console.log(`[evidence-graph] Applied ${report.summary.appliedResolutions} identity resolutions`)
  } catch (error) {
    console.error(error)
    process.exitCode = 1
  }
}
