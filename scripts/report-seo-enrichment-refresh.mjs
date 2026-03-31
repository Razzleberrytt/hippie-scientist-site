#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { getSharedRouteManifest } from './shared-route-manifest.mjs'

const ROOT = process.cwd()
const REPORT_JSON_PATH = path.join(ROOT, 'ops', 'reports', 'seo-enrichment-refresh.json')
const REPORT_MD_PATH = path.join(ROOT, 'ops', 'reports', 'seo-enrichment-refresh.md')

const readJson = relativePath => {
  const fullPath = path.join(ROOT, relativePath)
  if (!fs.existsSync(fullPath)) return []
  try {
    return JSON.parse(fs.readFileSync(fullPath, 'utf8'))
  } catch {
    return []
  }
}

const clip = (value, max = 155) => String(value || '').trim().slice(0, max)
const safeStr = value => String(value || '').trim()

function listBlockedEntities() {
  const submissions = readJson('ops/enrichment-submissions.json')
  if (!Array.isArray(submissions)) return new Set()
  const blockedStatuses = new Set([
    'blocked',
    'rejected',
    'revision_requested',
    'draft_submission',
    'ready_for_review',
    'needs_review',
    'in-review',
  ])
  return new Set(
    submissions
      .filter(
        row => blockedStatuses.has(safeStr(row?.reviewStatus)) || row?.active !== true,
      )
      .map(row => `${safeStr(row?.entityType)}:${safeStr(row?.entitySlug)}`)
      .filter(Boolean),
  )
}

function getCollectionBaselines() {
  const sourcePath = path.join(ROOT, 'src', 'data', 'seoCollections.ts')
  if (!fs.existsSync(sourcePath)) return new Map()
  const source = fs.readFileSync(sourcePath, 'utf8')
  const match = source.match(/export const SEO_COLLECTIONS:\s*SeoCollection\[\]\s*=\s*(\[[\s\S]*?\n\])/)
  if (!match?.[1]) return new Map()
  try {
    const parsed = Function(`"use strict"; return (${match[1]});`)()
    const rows = Array.isArray(parsed) ? parsed : []
    return new Map(
      rows.map(item => {
        const slug = safeStr(item?.slug)
        const title = item?.title
          ? `${safeStr(item.title)} Collection Guide`
          : 'Collection Guide | The Hippie Scientist'
        const description = clip(
          safeStr(item?.description) ||
            'Topic-focused collections for herb and compound exploration.',
        )
        return [slug, { title, description }]
      }),
    )
  } catch {
    return new Map()
  }
}

function run() {
  const now = new Date().toISOString()
  const publicationManifest = readJson('public/data/publication-manifest.json')
  const herbEntries = Array.isArray(publicationManifest?.entities?.herbs)
    ? publicationManifest.entities.herbs
    : []
  const compoundEntries = Array.isArray(publicationManifest?.entities?.compounds)
    ? publicationManifest.entities.compounds
    : []

  const baselineByRoute = new Map()
  for (const entry of [...herbEntries, ...compoundEntries]) {
    const route = safeStr(entry?.route)
    if (!route) continue
    baselineByRoute.set(route, {
      title: safeStr(entry?.title) || `${safeStr(entry?.name)} | The Hippie Scientist`,
      description: clip(safeStr(entry?.description) || `${safeStr(entry?.name)} reference profile.`),
    })
  }
  const collectionBaselines = getCollectionBaselines()
  for (const [slug, baseline] of collectionBaselines.entries()) {
    baselineByRoute.set(`/collections/${slug}`, baseline)
  }

  const { routeMeta, metadata } = getSharedRouteManifest()
  const refresh = metadata?.seoEnrichmentRefresh || { rows: [] }
  const rows = Array.isArray(refresh.rows) ? refresh.rows : []

  const improvements = []
  const unchanged = []
  const usedSignalCounts = {}
  const excludedSignalCounts = {}

  for (const row of rows) {
    const route = safeStr(row.route)
    const next = routeMeta.get(route) || { title: '', description: '' }
    const baseline = baselineByRoute.get(route) || { title: next.title, description: next.description }
    const changed = baseline.title !== next.title || baseline.description !== next.description

    for (const signal of row.usedSignals || []) {
      usedSignalCounts[signal] = (usedSignalCounts[signal] || 0) + 1
    }
    for (const signal of row.excludedSignals || []) {
      excludedSignalCounts[signal] = (excludedSignalCounts[signal] || 0) + 1
    }

    const entry = {
      route,
      pageType: row.pageType,
      entitySlug: row.entitySlug,
      changed,
      before: baseline,
      after: next,
      usedSignals: row.usedSignals || [],
      excludedSignals: row.excludedSignals || [],
      unchangedReason: row.unchangedReason || null,
    }

    if (changed) improvements.push(entry)
    else unchanged.push(entry)
  }

  const blockedEntities = listBlockedEntities()
  const blockedLeaks = improvements.filter(item => {
    if (item.pageType !== 'herb_detail' && item.pageType !== 'compound_detail') return false
    const entityType = item.pageType === 'herb_detail' ? 'herb' : 'compound'
    return blockedEntities.has(`${entityType}:${safeStr(item.entitySlug)}`)
  })

  const titleToRoutes = new Map()
  for (const [route, meta] of routeMeta.entries()) {
    const title = safeStr(meta?.title)
    if (!title) continue
    const list = titleToRoutes.get(title) || []
    list.push(route)
    titleToRoutes.set(title, list)
  }
  const duplicateTitles = [...titleToRoutes.entries()]
    .filter(([, routes]) => routes.length > 1)
    .map(([title, routes]) => ({ title, routes: routes.sort() }))

  const canonicalMetaSample = [...routeMeta.entries()].slice(0, 20).map(([route, meta]) => ({
    route,
    hasTitle: safeStr(meta?.title).length > 0,
    hasDescription: safeStr(meta?.description).length > 0,
  }))

  const verification = {
    approvedGovernedOnly: blockedLeaks.length === 0,
    duplicateTitlesPrevented: duplicateTitles.length === 0,
    canonicalDescriptionCoverage: canonicalMetaSample.every(
      row => row.hasTitle && row.hasDescription,
    ),
    blockedRejectedRevisionRequestedIgnored: blockedLeaks.length === 0,
  }

  const report = {
    generatedAt: now,
    deterministicModelVersion: refresh.modelVersion || 'seo-enrichment-refresh-v1',
    sources: {
      publicationManifest: 'public/data/publication-manifest.json',
      herbSummary: 'public/data/herbs-summary.json',
      compoundSummary: 'public/data/compounds-summary.json',
      governedArtifact: 'public/data/enrichment-governed.json',
      submissions: 'ops/enrichment-submissions.json',
    },
    totals: {
      evaluated: rows.length,
      improved: improvements.length,
      unchanged: unchanged.length,
    },
    improvedByPageType: improvements.reduce((acc, row) => {
      acc[row.pageType] = (acc[row.pageType] || 0) + 1
      return acc
    }, {}),
    usedSignalCounts,
    excludedSignalCounts,
    unchangedReasons: unchanged.reduce((acc, row) => {
      const reason = row.unchangedReason || 'unknown'
      acc[reason] = (acc[reason] || 0) + 1
      return acc
    }, {}),
    improvements,
    intentionallyUnchanged: unchanged,
    excludedCandidates: {
      blockedEntitiesCount: blockedEntities.size,
      blockedEntityLeaks: blockedLeaks,
    },
    verification,
    verificationDetails: {
      duplicateTitles,
      canonicalMetaSample,
    },
  }

  fs.mkdirSync(path.dirname(REPORT_JSON_PATH), { recursive: true })
  fs.writeFileSync(REPORT_JSON_PATH, JSON.stringify(report, null, 2) + '\n', 'utf8')

  const md = [
    '# SEO enrichment refresh report',
    '',
    `- Generated at: ${report.generatedAt}`,
    `- Deterministic model version: ${report.deterministicModelVersion}`,
    '',
    '## Totals',
    `- Evaluated routes: ${report.totals.evaluated}`,
    `- Improved routes: ${report.totals.improved}`,
    `- Intentionally unchanged routes: ${report.totals.unchanged}`,
    '',
    '## Improvements by page type',
    ...Object.entries(report.improvedByPageType).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Used governed signals',
    ...Object.entries(report.usedSignalCounts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Excluded candidate signals',
    ...Object.entries(report.excludedSignalCounts).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Intentionally unchanged reasons',
    ...Object.entries(report.unchangedReasons).map(([key, value]) => `- ${key}: ${value}`),
    '',
    '## Verification',
    `- approvedGovernedOnly: ${report.verification.approvedGovernedOnly}`,
    `- duplicateTitlesPrevented: ${report.verification.duplicateTitlesPrevented}`,
    `- canonicalDescriptionCoverage: ${report.verification.canonicalDescriptionCoverage}`,
    `- blockedRejectedRevisionRequestedIgnored: ${report.verification.blockedRejectedRevisionRequestedIgnored}`,
  ]

  fs.writeFileSync(REPORT_MD_PATH, md.join('\n') + '\n', 'utf8')

  console.log(`[report:seo-enrichment-refresh] improved=${improvements.length} unchanged=${unchanged.length}`)
  console.log(`[report:seo-enrichment-refresh] verification duplicateTitles=${duplicateTitles.length} blockedLeaks=${blockedLeaks.length}`)
}

run()
