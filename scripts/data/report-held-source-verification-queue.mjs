#!/usr/bin/env node
/**
 * Report held profiles whose claims or detail records carry a source signal but
 * whose slug has not been human-registered as source-backed.
 *
 * This is intentionally read-only. It does not promote profiles, mutate the
 * workbook, normalize identifiers, or infer that an identifier is scientifically
 * relevant. Claim-level evidence and detail-record source metadata are kept as
 * separate lanes because a generated `sources[]` entry is not itself governed
 * claim evidence.
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

function summarizeSignals(rows) {
  const pmids = new Set()
  const invalidPmids = new Set()
  const dois = new Set()
  const invalidDois = new Set()
  const sourceUrls = new Set()
  const sourceUrlClasses = new Set()
  const notes = new Set()

  for (const row of rows) {
    const pmid = text(row?.pmid ?? row?.pubmedId)
    const doi = text(row?.doi)
    const sourceUrl = text(row?.source_url ?? row?.url)
    const citation = text(row?.citation)

    if (pmid) (isValidPmid(pmid) ? pmids : invalidPmids).add(pmid)
    if (doi) (isValidDoi(doi) ? dois : invalidDois).add(doi)
    if (sourceUrl) {
      sourceUrls.add(sourceUrl)
      sourceUrlClasses.add(sourceUrlClass(sourceUrl))
    }
    if (citation && !pmid && !doi && !sourceUrl) notes.add(citation)
  }

  return {
    validPmids: [...pmids].sort(),
    invalidPmidSignals: [...invalidPmids].sort(),
    validDois: [...dois].map(normalizeDoi).sort(),
    invalidDoiSignals: [...invalidDois].sort(),
    sourceUrls: [...sourceUrls].sort(),
    sourceUrlClasses: [...sourceUrlClasses].filter(Boolean).sort(),
    citationOnlyNotes: [...notes].sort(),
  }
}

function hasAnySignal(summary) {
  return (
    summary.validPmids.length > 0 ||
    summary.invalidPmidSignals.length > 0 ||
    summary.validDois.length > 0 ||
    summary.invalidDoiSignals.length > 0 ||
    summary.sourceUrls.length > 0 ||
    summary.citationOnlyNotes.length > 0
  )
}

function heldProfileMap(dataDir) {
  const map = new Map()
  for (const [kind, file, detailDir] of [
    ['herb', 'herbs.json', 'herbs-detail'],
    ['compound', 'compounds.json', 'compounds-detail'],
  ]) {
    const rows = readJson(path.join(dataDir, file), [])
    for (const row of Array.isArray(rows) ? rows : []) {
      const reasons = Array.isArray(row?.indexability_reasons) ? row.indexability_reasons : []
      if (!reasons.includes('noindex-decision:hidden_until_grounded')) continue
      if (!row?.slug) continue
      map.set(String(row.slug), {
        entityType: kind,
        detailDir,
        indexabilityStatus: text(row.indexability_status),
        profileStatus: text(row.profile_status),
        runtimeExportDecision: text(row.runtime_export_decision),
      })
    }
  }
  return map
}

function detailSourcesForHeld(dataDir, held) {
  const bySlug = new Map()
  for (const [slug, meta] of held.entries()) {
    const detail = readJson(path.join(dataDir, meta.detailDir, `${slug}.json`), null)
    const record = detail?.record && typeof detail.record === 'object' ? detail.record : detail
    const sources = Array.isArray(record?.sources) ? record.sources : []
    if (sources.length) bySlug.set(slug, sources)
  }
  return bySlug
}

export function reportHeldSourceVerificationQueue(root = process.cwd()) {
  const dataDir = path.join(root, 'public', 'data')
  const claims = readJson(path.join(dataDir, 'claims.json'), [])
  const overlayPath = path.join(root, 'scripts', 'data', 'apply-governance-overlay.mjs')
  const registry = parseSourceBackedRegistry(fs.readFileSync(overlayPath, 'utf8'))
  const held = heldProfileMap(dataDir)
  const claimRowsBySlug = new Map()

  for (const claim of Array.isArray(claims) ? claims : []) {
    const slug = text(claim?.profile_slug)
    if (!slug || !held.has(slug)) continue
    const summary = summarizeSignals([claim])
    if (!hasAnySignal(summary)) continue
    const rows = claimRowsBySlug.get(slug) ?? []
    rows.push(claim)
    claimRowsBySlug.set(slug, rows)
  }

  const detailRowsBySlug = detailSourcesForHeld(dataDir, held)
  const signalSlugs = new Set([...claimRowsBySlug.keys(), ...detailRowsBySlug.keys()])
  const candidates = []
  const registeredWithSignals = []

  for (const slug of [...signalSlugs].sort()) {
    const claimSummary = summarizeSignals(claimRowsBySlug.get(slug) ?? [])
    const detailSummary = summarizeSignals(detailRowsBySlug.get(slug) ?? [])
    const entry = {
      slug,
      ...held.get(slug),
      claimCountWithSourceSignals: (claimRowsBySlug.get(slug) ?? []).length,
      detailSourceCount: (detailRowsBySlug.get(slug) ?? []).length,
      claimSignals: claimSummary,
      detailSignals: detailSummary,
      provenanceLanes: [
        ...(hasAnySignal(claimSummary) ? ['claim'] : []),
        ...(hasAnySignal(detailSummary) ? ['detail'] : []),
      ],
    }
    if (registry.has(slug)) registeredWithSignals.push(entry)
    else candidates.push(entry)
  }

  const candidateHasClass = (row, klass) =>
    row.claimSignals.sourceUrlClasses.includes(klass) || row.detailSignals.sourceUrlClasses.includes(klass)
  const candidateHasPlaceholder = (row) =>
    row.claimSignals.invalidPmidSignals.length > 0 ||
    row.claimSignals.invalidDoiSignals.length > 0 ||
    row.claimSignals.citationOnlyNotes.length > 0 ||
    row.detailSignals.invalidPmidSignals.length > 0 ||
    row.detailSignals.invalidDoiSignals.length > 0 ||
    row.detailSignals.citationOnlyNotes.length > 0 ||
    candidateHasClass(row, 'placeholder_or_non_url') ||
    candidateHasClass(row, 'malformed_url')

  return {
    modelVersion: 'held-source-verification-queue-v2',
    counts: {
      heldProfiles: held.size,
      heldProfilesWithAnySourceSignals: signalSlugs.size,
      registeredWithAnySourceSignals: registeredWithSignals.length,
      unregisteredCandidates: candidates.length,
      claimLaneCandidates: candidates.filter((row) => row.provenanceLanes.includes('claim')).length,
      detailLaneCandidates: candidates.filter((row) => row.provenanceLanes.includes('detail')).length,
      detailOnlyCandidates: candidates.filter((row) => row.provenanceLanes.length === 1 && row.provenanceLanes[0] === 'detail').length,
      candidatesWithValidPmid: candidates.filter((row) => row.claimSignals.validPmids.length > 0 || row.detailSignals.validPmids.length > 0).length,
      candidatesWithValidDoi: candidates.filter((row) => row.claimSignals.validDois.length > 0 || row.detailSignals.validDois.length > 0).length,
      candidatesWithDiscoveryOrAiUrl: candidates.filter((row) => candidateHasClass(row, 'discovery_or_ai_tool')).length,
      candidatesWithPlaceholderSignals: candidates.filter(candidateHasPlaceholder).length,
    },
    candidates,
    registeredWithSignals,
  }
}

function compactIds(summary) {
  return [...new Set([...summary.validPmids.map((id) => `PMID ${id}`), ...summary.validDois.map((id) => `DOI ${id}`)])].join(', ') || '—'
}

function compactClasses(summary) {
  const classes = [...summary.sourceUrlClasses]
  if (summary.citationOnlyNotes.length) classes.push('citation_only_note')
  if (summary.invalidPmidSignals.length || summary.invalidDoiSignals.length) classes.push('invalid_identifier')
  return [...new Set(classes)].join(', ') || '—'
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
    `- Held profiles with any source signals: **${report.counts.heldProfilesWithAnySourceSignals}**`,
    `- Already registered with source signals: **${report.counts.registeredWithAnySourceSignals}**`,
    `- Unregistered verification candidates: **${report.counts.unregisteredCandidates}**`,
    `- Detail-only candidates: **${report.counts.detailOnlyCandidates}**`,
    '',
    '| Slug | Type | Lane | Claim IDs | Detail IDs | Claim URL class | Detail URL class |',
    '|---|---|---|---|---|---|---|',
    ...report.candidates.map((row) =>
      `| ${row.slug} | ${row.entityType} | ${row.provenanceLanes.join('+')} | ${compactIds(row.claimSignals)} | ${compactIds(row.detailSignals)} | ${compactClasses(row.claimSignals)} | ${compactClasses(row.detailSignals)} |`
    ),
    '',
    '> Claim and detail source lanes are intentionally separate. A generated detail `sources[]` entry is not, by itself, governed claim evidence.',
    '> This report is an inventory, not a scientific verdict. Every candidate still requires source-level review before registration.',
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
    console.log(`[held-source-verification] detail-only candidates: ${report.counts.detailOnlyCandidates}`)
    console.log(`[held-source-verification] JSON: ${path.relative(root, jsonPath)}`)
    console.log(`[held-source-verification] Markdown: ${path.relative(root, mdPath)}`)
  }
}
