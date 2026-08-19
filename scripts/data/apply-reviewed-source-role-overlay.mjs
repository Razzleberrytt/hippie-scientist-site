#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { evaluateRecord } from '../lib/production-content-invariants.mjs'
import {
  buildAppliedPatchSourceRoleMap,
  mergeReviewedSourceRoleNote,
  sourceRoleKey,
} from './canonical/source-role-provenance.mjs'

function readJson(filePath) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return null
  }
}

function writeJson(filePath, value) {
  fs.writeFileSync(filePath, `${JSON.stringify(value, null, 2)}\n`, 'utf8')
}

function isApproved(source) {
  return String(source?.reviewStatus || source?.review_status || '').trim().toLowerCase() === 'approved'
}

export function applyReviewedSourceRoleOverlay({ dataDir = 'public/data', roleMap = buildAppliedPatchSourceRoleMap() } = {}) {
  const root = path.resolve(process.cwd(), dataDir)
  const report = {
    dataDir: path.relative(process.cwd(), root),
    reviewedRoleRelationships: roleMap.size,
    scannedProfiles: 0,
    updatedProfiles: 0,
    updatedSources: 0,
    updatedByKind: { herbs: 0, compounds: 0 },
    candidateDiagnostics: [],
  }

  for (const [kind, directory] of [['herbs', 'herbs-detail'], ['compounds', 'compounds-detail']]) {
    const detailDir = path.join(root, directory)
    if (!fs.existsSync(detailDir)) continue

    for (const name of fs.readdirSync(detailDir).filter((entry) => entry.endsWith('.json')).sort()) {
      const filePath = path.join(detailDir, name)
      const record = readJson(filePath)
      if (!record || typeof record !== 'object' || Array.isArray(record)) continue
      report.scannedProfiles += 1

      const invariantKind = kind === 'herbs' ? 'herb' : 'compound'
      const slug = String(record.slug || path.basename(name, '.json')).trim().toLowerCase()
      const sources = Array.isArray(record.sources) ? record.sources : []
      let changed = false
      let changedSources = 0
      const nextSources = sources.map((source) => {
        if (!source || typeof source !== 'object' || !isApproved(source)) return source
        const key = sourceRoleKey(invariantKind, slug, source.id)
        const roles = key ? roleMap.get(key) : null
        if (!roles?.length) return source

        const previous = String(source.note || '').trim()
        const note = mergeReviewedSourceRoleNote(previous, roles)
        if (note === previous) return source

        changed = true
        changedSources += 1
        return { ...source, note }
      })

      if (!changed) continue
      record.sources = nextSources

      const remainingCodes = [...new Set(
        evaluateRecord(record, invariantKind)
          .filter((finding) => finding.blocking !== false)
          .map((finding) => finding.code),
      )].sort()

      writeJson(filePath, record)
      report.updatedProfiles += 1
      report.updatedSources += changedSources
      report.updatedByKind[kind] += 1
      report.candidateDiagnostics.push({
        kind: invariantKind,
        slug,
        updatedSources: changedSources,
        remainingCodes,
      })
    }
  }

  return report
}

const isCli = process.argv[1]
  ? path.resolve(process.argv[1]) === path.resolve(fileURLToPath(import.meta.url))
  : false

if (isCli) {
  const dataDirArg = process.argv.find((arg) => arg.startsWith('--data-dir='))
  const dataDir = dataDirArg ? dataDirArg.slice('--data-dir='.length) : 'public/data'
  const report = applyReviewedSourceRoleOverlay({ dataDir })
  console.log(
    `[reviewed-source-roles] applied patch roles to ${report.updatedSources} approved source(s) across ${report.updatedProfiles} profile(s) ` +
    `(herbs=${report.updatedByKind.herbs}, compounds=${report.updatedByKind.compounds}; mappedRelationships=${report.reviewedRoleRelationships})`,
  )
  for (const candidate of report.candidateDiagnostics) {
    console.log(
      `[reviewed-source-roles] candidate ${candidate.kind}:${candidate.slug} updatedSources=${candidate.updatedSources} ` +
      `remaining=${candidate.remainingCodes.length ? candidate.remainingCodes.join(',') : 'none'}`,
    )
  }
}
