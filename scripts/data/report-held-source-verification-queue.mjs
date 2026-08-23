#!/usr/bin/env node
/**
 * Report held profiles whose governed claims carry a source signal but whose slug
 * has not been human-registered as source-backed.
 *
 * This is intentionally read-only. It does not promote profiles, mutate the
 * workbook, normalize identifiers, or infer that an identifier is scientifically
 * relevant. Its job is to keep the verification backlog deterministic and auditable.
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const text = (value) => String(value ?? '').trim()

function normalizeDoi(value) {
  return text(value)
    .replace(/^https?:\/\/(?:dx\.)?doi\.org\//i, '')
    .replace(/^doi:\s*/i, '')
    .trim()
}

function isValidPmid(value) {
  return /^\d{1,9}$/.test(text(value))
}

function isValidDoi(value) {
  return /^10\.\d{4,9}\/\S+$/i.test(normalizeDoi(value))
}

function sourceUrlClass(value) {
  const raw = text(value)
  if (!raw) return null
  if (!/^https?:\/\//i.test(raw)) return 'placeholder_or_non_url'
  try {
    const url = new URL(raw)
    const host = url.hostname.toLowerCase().replace(/^www\./, '')
    if (
      host === 'consensus.app' ||
      host === 'elicit.com' ||
      host === 'scite.ai' ||
      host === 'perplexity.ai' ||
      host === 'chatgpt.com'
    ) return 'discovery_or_ai_tool'
    if (host === 'doi.org' || host === 'dx.doi.org') return 'doi_resolver'
    if (host === 'pubmed.ncbi.nlm.nih.gov' || host === 'ncbi.nlm.nih.gov') return 'pubmed_or_ncbi'
    return 'other_http_source'
  } catch {
    return 'malformed_url'
  }
}

function readJson(filePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

export function parseSourceBackedRegistry(overlayText) {
  const match = overlayText.match(/const SOURCE_BACKED_PROMOTION_SLUGS\s*=\s*new Set\(\[([\s\S]*?)\]\)/)
  if (!match) throw new Error('SOURCE_BACKED_PROMOTION_SLUGS block not found')
  return new Set([...match[1].matchAll(/^\s*'([^']+)',/gm)].map((row) => row[1]))
}

function claimSourceSignals(claim) {
  const pmid = text(claim?.pmid)
  const doi = text(claim?.doi)
  const sourceUrl = text(claim?.source_url)
  return { pmid, doi, sourceUrl }
}

function summarizeClaimSources(claims) {
  const pmids = new Set()
  const invalidPmids = new Set()
  const dois = new Set()
  const invalidDois = new Set()
  const sourceUrls = new Set()
  const sourceUrlClasses = new Set()

  for (const claim of claims) {
    const { pmid, doi, sourceUrl } = claimSourceSignals(claim)
    if (pmid) (isValidPmid(pmid) ? pmids : invalidPmids).add(pmid)
    if (doi) (isValidDoi(doi) ? dois : invalidDois).add(doi)
    if (sourceUrl) {
      sourceUrls.add(sourceUrl)
      sourceUrlClasses.add(sourceUrlClass(sourceUrl))
    }
  }

  return {
    validPmids: [...pmids].sort(),
    invalidPmidSignals: [...invalidPmids].sort(),
    validDois: [...dois].map(normalizeDoi).sort(),
    invalidDoiSignals: [...invalidDois].sort(),
    sourceUrls: [...sourceUrls].sort(),
    sourceUrlClasses: [...sourceUrlClasses].filter(Boolean).sort(),
  }
}

function heldProfileMap(dataDir) {
  const map = new Map()
  for (const [kind, file] of [['herb', 'herbs.json'], ['compound', 'compounds.json']]) {
    const rows = readJson(path.join(dataDir, file), [])
    for (const row of Array.isArray(rows) ? rows : []) {
      const reasons = Array.isArray(row?.indexability_reasons) ? row.indexability_reasons : []
      if (!reasons.includes('noindex-decision:hidden_until_grounded')) continue
      if (!row?.slug) continue
      map.set(String(row.slug), {
        entityType: kind,
        indexabilityStatus: text(row.indexability_status),
        profileStatus: text(row.profile_status),
        runtimeExportDecision: text(row.runtime_export_decision),
      })
    }
  }
  return map
}

export function reportHeldSourceVerificationQueue(root = process.cwd()) {
  const dataDir = path.join(root, 'public', 'data')
  const claims = readJson(path.join(dataDir, 'claims.json'), [])
  const overlayPath = path.join(root, 'scripts', 'data', 'apply-governance-overlay.mjs')
  const registry = parseSourceBackedRegistry(fs.readFileSync(overlayPath, 'utf8'))
  const held = heldProfileMap(dataDir)
  const bySlug = new Map()

  for (const claim of Array.isArray(claims) ? claims : []) {
    const slug = text(claim?.profile_slug)
    if (!slug || !held.has(slug)) continue
    const { pmid, doi, sourceUrl } = claimSourceSignals(claim)
    if (!pmid && !doi && !sourceUrl) continue
    const rows = bySlug.get(slug) ?? []
    rows.push(claim)
    bySlug.set(slug, rows)
  }

  const candidates = []
  const registeredWithSignals = []
  for (const [slug, rows] of [...bySlug.entries()].sort(([a], [b]) => a.localeCompare(b))) {
    const summary = summarizeClaimSources(rows)
    const entry = {
      slug,
      ...held.get(slug),
      claimCountWithSourceSignals: rows.length,
      ...summary,
    }
    if (registry.has(slug)) registeredWithSignals.push(entry)
    else candidates.push(entry)
  }

  return {
    modelVersion: 'held-source-verification-queue-v1',
    counts: {
      heldProfiles: held.size,
      heldProfilesWithClaimSourceSignals: bySlug.size,
      registeredWithClaimSourceSignals: registeredWithSignals.length,
      unregisteredCandidates: candidates.length,
      candidatesWithValidPmid: candidates.filter((row) => row.validPmids.length > 0).length,
      candidatesWithValidDoi: candidates.filter((row) => row.validDois.length > 0).length,
      candidatesWithDiscoveryOrAiUrl: candidates.filter((row) => row.sourceUrlClasses.includes('discovery_or_ai_tool')).length,
      candidatesWithPlaceholderSignals: candidates.filter((row) =>
        row.invalidPmidSignals.length > 0 ||
        row.invalidDoiSignals.length > 0 ||
        row.sourceUrlClasses.includes('placeholder_or_non_url') ||
        row.sourceUrlClasses.includes('malformed_url')
      ).length,
    },
    candidates,
    registeredWithSignals,
  }
}

function writeReport(root, report) {
  const outDir = path.join(root, 'ops', 'audit')
  fs.mkdirSync(outDir, { recursive: true })
  const jsonPath = path.join(outDir, 'held-source-verification-queue.json')
  const mdPath = path.join(outDir, 'held-source-verification-queue.md')
  fs.writeFileSync(jsonPath, `${JSON.stringify(report, null, 2)}\n`)

  const lines = [
    '# Held source-verification queue',
    '',
    `Model: \`${report.modelVersion}\``,
    '',
    `- Held profiles: **${report.counts.heldProfiles}**`,
    `- Held profiles with claim source signals: **${report.counts.heldProfilesWithClaimSourceSignals}**`,
    `- Already registered with claim source signals: **${report.counts.registeredWithClaimSourceSignals}**`,
    `- Unregistered verification candidates: **${report.counts.unregisteredCandidates}**`,
    '',
    '| Slug | Type | Valid PMID | Valid DOI | Source URL class |',
    '|---|---|---|---|---|',
    ...report.candidates.map((row) =>
      `| ${row.slug} | ${row.entityType} | ${row.validPmids.join(', ') || '—'} | ${row.validDois.join(', ') || '—'} | ${row.sourceUrlClasses.join(', ') || '—'} |`
    ),
    '',
    '> This report is an inventory, not a scientific verdict. Every candidate still requires source-level human review before registration.',
    '',
  ]
  fs.writeFileSync(mdPath, lines.join('\n'))
  return { jsonPath, mdPath }
}

const isMain = process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)
if (isMain) {
  const root = process.cwd()
  const report = reportHeldSourceVerificationQueue(root)
  if (process.argv.includes('--json-stdout')) {
    process.stdout.write(`${JSON.stringify(report)}\n`)
  } else {
    const { jsonPath, mdPath } = writeReport(root, report)
    console.log(`[held-source-verification] held profiles: ${report.counts.heldProfiles}`)
    console.log(`[held-source-verification] unregistered candidates: ${report.counts.unregisteredCandidates}`)
    console.log(`[held-source-verification] JSON: ${path.relative(root, jsonPath)}`)
    console.log(`[held-source-verification] Markdown: ${path.relative(root, mdPath)}`)
  }
}
