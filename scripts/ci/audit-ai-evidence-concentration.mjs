#!/usr/bin/env node
import { existsSync, readFileSync, readdirSync } from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const ENTITY_ROOT = path.join(ROOT, 'public', 'data', 'ai-entities')
const strict = process.argv.includes('--strict')

function filesUnder(dir, out = []) {
  if (!existsSync(dir)) return out
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) filesUnder(full, out)
    else if (entry.name.endsWith('.json') && entry.name !== 'manifest.json') out.push(full)
  }
  return out
}

function readJson(file) {
  try { return JSON.parse(readFileSync(file, 'utf8')) } catch { return null }
}

function nodes(doc) {
  if (Array.isArray(doc?.['@graph'])) return doc['@graph']
  if (Array.isArray(doc)) return doc
  return doc ? [doc] : []
}

function typeList(node) {
  const t = node?.['@type']
  return Array.isArray(t) ? t.map(String) : t ? [String(t)] : []
}

function strings(value, out = []) {
  if (value == null) return out
  if (typeof value === 'string' || typeof value === 'number') { out.push(String(value)); return out }
  if (Array.isArray(value)) { for (const item of value) strings(item, out); return out }
  if (typeof value === 'object') { for (const item of Object.values(value)) strings(item, out) }
  return out
}

function sourceIds(node) {
  const ids = []
  const candidates = [node?.citation, node?.citations, node?.source, node?.sources, node?.sourceIds, node?.sourceRefs, node?.primaryPmids, node?.pmids]
  for (const candidate of candidates) {
    for (const s of strings(candidate)) {
      const normalized = s.trim()
      if (normalized) ids.push(normalized)
    }
  }
  return [...new Set(ids)]
}

function isClaim(node) {
  const types = typeList(node).join(' ').toLowerCase()
  return /claim|statement|observation/.test(types) || /claim/i.test(String(node?.['@id'] || '')) || node?.evidenceGrade || node?.evidenceClass
}

function isSource(node) {
  const types = typeList(node).join(' ').toLowerCase()
  return /scholarlyarticle|medicalscholarlyarticle|article|creativework|report/.test(types) || node?.pmid || node?.doi || node?.studyType
}

function studyClass(node) {
  const blob = strings([node?.studyType, node?.evidenceClass, node?.name, node?.description]).join(' ').toLowerCase()
  if (/narrative review|review article|overview/.test(blob) && !/systematic|meta-analysis/.test(blob)) return 'narrative-review'
  if (/systematic review|meta-analysis|meta analysis/.test(blob)) return 'systematic-review'
  if (/randomi[sz]ed|controlled trial|clinical trial|cohort|case-control|cross-sectional|human study/.test(blob)) return 'primary-human'
  if (/animal|mouse|mice|rat|in vivo/.test(blob)) return 'animal'
  if (/in vitro|cell|assay/.test(blob)) return 'in-vitro'
  return 'other'
}

const findings = []
const stats = { profiles: 0, claims: 0, oneSourceClaims: 0, zeroSourceClaims: 0, narrativeDominated: 0, singleSourceDominated: 0 }

for (const file of filesUnder(ENTITY_ROOT)) {
  const doc = readJson(file)
  if (!doc) continue
  stats.profiles++
  const graph = nodes(doc)
  const claims = graph.filter(isClaim)
  const sources = graph.filter(isSource)
  stats.claims += claims.length

  const slug = path.basename(file, '.json')
  const sourceClassCounts = new Map()
  for (const source of sources) {
    const cls = studyClass(source)
    sourceClassCounts.set(cls, (sourceClassCounts.get(cls) || 0) + 1)
  }

  for (const claim of claims) {
    const ids = sourceIds(claim)
    if (ids.length === 0) {
      stats.zeroSourceClaims++
      findings.push({ severity: 'error', slug, issue: `claim has no source link: ${String(claim.name || claim.description || claim['@id'] || 'unnamed').slice(0, 120)}` })
    } else if (ids.length === 1) {
      stats.oneSourceClaims++
      findings.push({ severity: 'warn', slug, issue: `claim depends on one source: ${String(claim.name || claim.description || claim['@id'] || 'unnamed').slice(0, 120)}` })
    }
  }

  const narrative = sourceClassCounts.get('narrative-review') || 0
  const primaryHuman = sourceClassCounts.get('primary-human') || 0
  const systematic = sourceClassCounts.get('systematic-review') || 0
  const humanRelevant = narrative + primaryHuman + systematic
  if (humanRelevant >= 2 && narrative > primaryHuman + systematic) {
    stats.narrativeDominated++
    findings.push({ severity: 'warn', slug, issue: `source profile is narrative-review dominated (${narrative} narrative vs ${primaryHuman} primary-human + ${systematic} systematic)` })
  }

  const sourceFrequency = new Map()
  for (const claim of claims) {
    for (const id of sourceIds(claim)) sourceFrequency.set(id, (sourceFrequency.get(id) || 0) + 1)
  }
  const maxFrequency = Math.max(0, ...sourceFrequency.values())
  if (claims.length >= 3 && maxFrequency / claims.length >= 0.75) {
    stats.singleSourceDominated++
    findings.push({ severity: 'warn', slug, issue: `one source supports ${maxFrequency}/${claims.length} claim nodes (>=75% concentration)` })
  }
}

if (!existsSync(ENTITY_ROOT)) {
  findings.push({ severity: 'warn', slug: '-', issue: 'AI entity artifact directory missing; run the runtime/entity build before this audit' })
}

const errors = findings.filter((f) => f.severity === 'error')
const warnings = findings.filter((f) => f.severity === 'warn')
console.log(`[audit-ai-evidence-concentration] profiles=${stats.profiles} claims=${stats.claims}`)
console.log(`[audit-ai-evidence-concentration] zero-source=${stats.zeroSourceClaims} one-source=${stats.oneSourceClaims}`)
console.log(`[audit-ai-evidence-concentration] narrative-dominated=${stats.narrativeDominated} single-source-dominated=${stats.singleSourceDominated}`)
for (const finding of findings.slice(0, 200)) console.log(`${finding.severity.toUpperCase()} ${finding.slug}: ${finding.issue}`)
if (findings.length > 200) console.log(`[audit-ai-evidence-concentration] ${findings.length - 200} additional findings omitted`)
console.log(`[audit-ai-evidence-concentration] ${errors.length} error(s), ${warnings.length} warning(s)${strict ? ' (strict)' : ' (advisory)'}`)

if (errors.length > 0 || (strict && warnings.length > 0)) process.exit(1)
