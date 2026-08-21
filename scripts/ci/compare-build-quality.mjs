#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'

const ROOT = process.cwd()
const REPORT_DIR = path.join(ROOT, 'public', 'data', 'reports')
const argv = process.argv.slice(2)
const flagValue = (name) => argv.find((arg) => arg.startsWith(`--${name}=`))?.split('=').slice(1).join('=')
const REQUIRE_BASE = argv.includes('--require-base')
const EXPLICIT_BASE = flagValue('base')
const CHANGE_REASON = flagValue('reason') || process.env.QUALITY_CHANGE_REASON || ''

const FILES = {
  routeManifest: 'public/data/runtime-manifests/route-manifest.json',
  herbsSummary: ['public/data/summary-indexes/herbs-summary.json', 'public/data/herbs-summary.json'],
  compoundsSummary: ['public/data/summary-indexes/compounds-summary.json', 'public/data/compounds-summary.json'],
  internalLinks: 'public/data/runtime-maps/internal-link-map.json',
  claims: 'public/data/claims.json',
}

function pct(delta, before) {
  if (!before) return delta === 0 ? 0 : null
  return delta / before
}

function readJson(relativePath, fallback) {
  try {
    return JSON.parse(fs.readFileSync(path.join(ROOT, relativePath), 'utf8'))
  } catch {
    return fallback
  }
}

function readFirstJson(paths, fallback) {
  for (const relativePath of paths) {
    const value = readJson(relativePath, undefined)
    if (value !== undefined) return value
  }
  return fallback
}

function baseCandidates() {
  const values = []
  if (EXPLICIT_BASE) values.push(EXPLICIT_BASE)
  if (process.env.GITHUB_BASE_REF) values.push(`origin/${process.env.GITHUB_BASE_REF}`)
  values.push('HEAD^')
  return [...new Set(values.filter(Boolean))]
}

function gitShowJson(ref, relativePath) {
  try {
    const raw = execFileSync('git', ['show', `${ref}:${relativePath}`], {
      cwd: ROOT,
      encoding: 'utf8',
      stdio: ['ignore', 'pipe', 'ignore'],
      maxBuffer: 25 * 1024 * 1024,
    })
    return JSON.parse(raw)
  } catch {
    return undefined
  }
}

function readBaseFirst(ref, paths, fallback) {
  const choices = Array.isArray(paths) ? paths : [paths]
  for (const relativePath of choices) {
    const value = gitShowJson(ref, relativePath)
    if (value !== undefined) return value
  }
  return fallback
}

function normalizeRoute(route) {
  const value = String(route ?? '').trim()
  if (!value) return ''
  const pathOnly = value.split(/[?#]/)[0]
  const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

function firstText(record, keys) {
  for (const key of keys) {
    const value = record?.[key]
    if (value !== undefined && value !== null && String(value).trim()) return String(value).trim()
  }
  return ''
}

function gradeOf(record) {
  return firstText(record, [
    'evidence_grade',
    'evidenceGrade',
    'grade',
    'evidence_tier',
    'evidenceTier',
    'tier',
    'evidence_level',
    'evidenceLevel',
  ]) || 'unknown'
}

function statusOf(record) {
  const status = firstText(record, ['indexability_status', 'indexabilityStatus']) || 'unknown'
  const robots = firstText(record, ['robots']) || 'unknown'
  const sitemap = record?.sitemap_included ?? record?.sitemapIncluded
  return `${status}|${robots}|${sitemap === undefined ? 'unknown' : String(Boolean(sitemap))}`
}

function isPublished(status) {
  const [indexability, robots, sitemap] = status.split('|')
  return indexability.toUpperCase() === 'PUBLISH' || (robots.toLowerCase().includes('index') && !robots.toLowerCase().includes('noindex') && sitemap === 'true')
}

function buildEntityState(herbs, compounds) {
  const grades = new Map()
  const indexability = new Map()
  const add = (rows, kind) => {
    for (const row of Array.isArray(rows) ? rows : []) {
      const slug = firstText(row, ['slug'])
      if (!slug) continue
      const route = `/${kind}/${slug}`
      const grade = gradeOf(row)
      grades.set(grade, (grades.get(grade) ?? 0) + 1)
      indexability.set(route, statusOf(row))
    }
  }
  add(herbs, 'herbs')
  add(compounds, 'compounds')
  return {
    gradeDistribution: Object.fromEntries([...grades.entries()].sort(([a], [b]) => a.localeCompare(b))),
    indexability: Object.fromEntries([...indexability.entries()].sort(([a], [b]) => a.localeCompare(b))),
  }
}

function buildSnapshot({ routes, herbs, compounds, internalLinks, claims }) {
  const routeRows = Array.isArray(routes) ? routes : []
  const titles = {}
  for (const row of routeRows) {
    const route = normalizeRoute(row?.route || row?.path)
    if (!route) continue
    titles[route] = firstText(row, ['meta_title', 'title'])
  }

  const entityState = buildEntityState(herbs, compounds)
  const linkRows = internalLinks && typeof internalLinks === 'object' ? Object.values(internalLinks) : []
  const linkCounts = {}
  let totalInternalLinks = 0
  for (const row of linkRows) {
    const route = normalizeRoute(row?.route || row?.href)
    if (!route) continue
    const totalLinks = Number(row?.totalLinks ?? row?.total_links ?? row?.links?.length ?? 0) || 0
    linkCounts[route] = totalLinks
    totalInternalLinks += totalLinks
  }

  let citationReferences = 0
  const citationIds = new Set()
  for (const claim of Array.isArray(claims) ? claims : []) {
    const ids = Array.isArray(claim?.source_ids) ? claim.source_ids.filter(Boolean) : []
    citationReferences += ids.length
    ids.forEach((id) => citationIds.add(String(id)))
  }

  return {
    routeCount: routeRows.length,
    titles,
    gradeDistribution: entityState.gradeDistribution,
    indexability: entityState.indexability,
    internalLinks: {
      total: totalInternalLinks,
      byRoute: linkCounts,
    },
    citations: {
      claimSourceReferences: citationReferences,
      uniqueSourceIds: citationIds.size,
    },
  }
}

function currentSnapshot() {
  return buildSnapshot({
    routes: readJson(FILES.routeManifest, []),
    herbs: readFirstJson(FILES.herbsSummary, []),
    compounds: readFirstJson(FILES.compoundsSummary, []),
    internalLinks: readJson(FILES.internalLinks, {}),
    claims: readJson(FILES.claims, []),
  })
}

function baseSnapshot(ref) {
  return buildSnapshot({
    routes: readBaseFirst(ref, FILES.routeManifest, []),
    herbs: readBaseFirst(ref, FILES.herbsSummary, []),
    compounds: readBaseFirst(ref, FILES.compoundsSummary, []),
    internalLinks: readBaseFirst(ref, FILES.internalLinks, {}),
    claims: readBaseFirst(ref, FILES.claims, []),
  })
}

function compareMaps(before, after) {
  const changed = []
  const keys = new Set([...Object.keys(before), ...Object.keys(after)])
  for (const key of [...keys].sort()) {
    if ((before[key] ?? null) !== (after[key] ?? null)) {
      changed.push({ key, before: before[key] ?? null, after: after[key] ?? null })
    }
  }
  return changed
}

function compareSnapshots(before, after) {
  const routeDelta = after.routeCount - before.routeCount
  const titleChanges = compareMaps(before.titles, after.titles).filter((row) => row.before !== null && row.after !== null)
  const indexabilityChanges = compareMaps(before.indexability, after.indexability)
  const publishToNonIndex = indexabilityChanges.filter((row) => row.before && row.after && isPublished(row.before) && !isPublished(row.after))

  const gradeKeys = new Set([...Object.keys(before.gradeDistribution), ...Object.keys(after.gradeDistribution)])
  const beforeEntityCount = Object.values(before.gradeDistribution).reduce((sum, value) => sum + Number(value || 0), 0)
  const afterEntityCount = Object.values(after.gradeDistribution).reduce((sum, value) => sum + Number(value || 0), 0)
  const gradeChanges = [...gradeKeys].sort().map((grade) => {
    const beforeCount = Number(before.gradeDistribution[grade] ?? 0)
    const afterCount = Number(after.gradeDistribution[grade] ?? 0)
    const beforeShare = beforeEntityCount ? beforeCount / beforeEntityCount : 0
    const afterShare = afterEntityCount ? afterCount / afterEntityCount : 0
    return {
      grade,
      before: beforeCount,
      after: afterCount,
      delta: afterCount - beforeCount,
      shareDelta: afterShare - beforeShare,
    }
  })

  const lostInternalLinks = []
  const reducedInternalLinks = []
  for (const [route, beforeCount] of Object.entries(before.internalLinks.byRoute)) {
    const afterCount = Number(after.internalLinks.byRoute[route] ?? 0)
    if (beforeCount > 0 && afterCount === 0) lostInternalLinks.push({ route, before: beforeCount, after: afterCount })
    else if (afterCount < beforeCount) reducedInternalLinks.push({ route, before: beforeCount, after: afterCount })
  }

  const citationDelta = after.citations.claimSourceReferences - before.citations.claimSourceReferences
  const internalLinkDelta = after.internalLinks.total - before.internalLinks.total
  const major = []

  const routePct = pct(routeDelta, before.routeCount)
  if (routePct !== null && Math.abs(routePct) >= 0.1 && Math.abs(routeDelta) >= 20) {
    major.push(`${routeDelta > 0 ? 'page-count explosion' : 'page-count drop'}: ${before.routeCount} → ${after.routeCount}`)
  }

  for (const change of gradeChanges) {
    if (Math.abs(change.shareDelta) >= 0.1 && Math.abs(change.delta) >= 20) {
      major.push(`evidence-grade distribution shift for ${change.grade}: ${change.before} → ${change.after}`)
    }
  }

  const citationPct = pct(citationDelta, before.citations.claimSourceReferences)
  if (citationPct !== null && citationPct <= -0.1 && citationDelta <= -25) {
    major.push(`citation-count decrease: ${before.citations.claimSourceReferences} → ${after.citations.claimSourceReferences}`)
  }

  const linkPct = pct(internalLinkDelta, before.internalLinks.total)
  if ((linkPct !== null && linkPct <= -0.1 && internalLinkDelta <= -50) || lostInternalLinks.length >= 10) {
    major.push(`internal-link regression: ${before.internalLinks.total} → ${after.internalLinks.total}; ${lostInternalLinks.length} routes lost all links`)
  }

  const titleChangeLimit = Math.max(25, Math.ceil(before.routeCount * 0.05))
  if (titleChanges.length > titleChangeLimit) {
    major.push(`unexpected title churn: ${titleChanges.length} existing routes changed titles`)
  }

  const indexabilityLimit = Math.max(10, Math.ceil(Object.keys(before.indexability).length * 0.02))
  if (publishToNonIndex.length > indexabilityLimit) {
    major.push(`unexpected indexability change: ${publishToNonIndex.length} published entity routes became non-indexable`)
  }

  return {
    routeCount: { before: before.routeCount, after: after.routeCount, delta: routeDelta, pct: routePct },
    evidenceGrades: gradeChanges,
    citations: {
      before: before.citations,
      after: after.citations,
      referenceDelta: citationDelta,
      referencePct: citationPct,
    },
    internalLinks: {
      before: before.internalLinks.total,
      after: after.internalLinks.total,
      delta: internalLinkDelta,
      pct: linkPct,
      lostRoutes: lostInternalLinks,
      reducedRoutes: reducedInternalLinks.slice(0, 200),
    },
    titles: {
      changedCount: titleChanges.length,
      changes: titleChanges.slice(0, 200),
    },
    indexability: {
      changedCount: indexabilityChanges.length,
      publishToNonIndexCount: publishToNonIndex.length,
      changes: indexabilityChanges.slice(0, 200),
      publishToNonIndex: publishToNonIndex.slice(0, 200),
    },
    majorChanges: major,
  }
}

function renderMarkdown(report) {
  const c = report.comparison
  const lines = [
    '# Build quality comparison',
    '',
    `Base: \`${report.baseRef}\``,
    '',
    '| Signal | Previous | Current | Delta |',
    '| --- | ---: | ---: | ---: |',
    `| Indexable route manifest | ${c.routeCount.before} | ${c.routeCount.after} | ${c.routeCount.delta >= 0 ? '+' : ''}${c.routeCount.delta} |`,
    `| Claim→source citation references | ${c.citations.before.claimSourceReferences} | ${c.citations.after.claimSourceReferences} | ${c.citations.referenceDelta >= 0 ? '+' : ''}${c.citations.referenceDelta} |`,
    `| Unique citation source IDs | ${c.citations.before.uniqueSourceIds} | ${c.citations.after.uniqueSourceIds} | ${c.citations.after.uniqueSourceIds - c.citations.before.uniqueSourceIds} |`,
    `| Internal links | ${c.internalLinks.before} | ${c.internalLinks.after} | ${c.internalLinks.delta >= 0 ? '+' : ''}${c.internalLinks.delta} |`,
    `| Existing titles changed | — | ${c.titles.changedCount} | — |`,
    `| Indexability records changed | — | ${c.indexability.changedCount} | — |`,
    `| Published → non-indexable | — | ${c.indexability.publishToNonIndexCount} | — |`,
    '',
    '## Evidence-grade distribution',
    '',
    '| Grade | Previous | Current | Delta | Share Δ |',
    '| --- | ---: | ---: | ---: | ---: |',
    ...c.evidenceGrades.map((row) => `| ${row.grade} | ${row.before} | ${row.after} | ${row.delta >= 0 ? '+' : ''}${row.delta} | ${(row.shareDelta * 100).toFixed(1)} pp |`),
    '',
  ]

  if (c.majorChanges.length) {
    lines.push('## Major automated changes', '')
    for (const change of c.majorChanges) lines.push(`- ${change}`)
    lines.push('', `Explanation: ${report.changeReason || '**MISSING — merge gate should fail**'}`, '')
  } else {
    lines.push('## Major automated changes', '', 'None detected.', '')
  }

  if (c.internalLinks.lostRoutes.length) {
    lines.push('## Routes that lost all internal links', '')
    for (const row of c.internalLinks.lostRoutes.slice(0, 100)) lines.push(`- \`${row.route}\`: ${row.before} → ${row.after}`)
    lines.push('')
  }

  return `${lines.join('\n')}\n`
}

function printSummary(report) {
  const c = report.comparison
  console.log('\nBuild quality comparison')
  console.log('='.repeat(72))
  console.log(`Base ref             ${report.baseRef}`)
  console.log(`Routes               ${c.routeCount.before} → ${c.routeCount.after} (${c.routeCount.delta >= 0 ? '+' : ''}${c.routeCount.delta})`)
  console.log(`Citation references  ${c.citations.before.claimSourceReferences} → ${c.citations.after.claimSourceReferences} (${c.citations.referenceDelta >= 0 ? '+' : ''}${c.citations.referenceDelta})`)
  console.log(`Internal links        ${c.internalLinks.before} → ${c.internalLinks.after} (${c.internalLinks.delta >= 0 ? '+' : ''}${c.internalLinks.delta})`)
  console.log(`Title changes         ${c.titles.changedCount}`)
  console.log(`Indexability changes  ${c.indexability.changedCount}`)
  console.log(`Publish → nonindex    ${c.indexability.publishToNonIndexCount}`)
  console.log(`Major changes         ${c.majorChanges.length}`)
  if (c.majorChanges.length) {
    c.majorChanges.forEach((change) => console.log(`  - ${change}`))
    console.log(`Change explanation    ${report.changeReason || 'MISSING'}`)
  }
  console.log('Report                public/data/reports/build-quality-diff.md')
}

function selfTest() {
  const before = {
    routeCount: 100,
    titles: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`/r${i}`, `Title ${i}`])),
    gradeDistribution: { A: 50, B: 50 },
    indexability: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`/r${i}`, 'PUBLISH|index,follow|true'])),
    internalLinks: { total: 1000, byRoute: Object.fromEntries(Array.from({ length: 100 }, (_, i) => [`/r${i}`, 10])) },
    citations: { claimSourceReferences: 500, uniqueSourceIds: 200 },
  }
  const after = structuredClone(before)
  after.routeCount = 70
  after.citations.claimSourceReferences = 400
  after.internalLinks.total = 800
  for (let i = 0; i < 30; i += 1) after.titles[`/r${i}`] = `Changed ${i}`
  for (let i = 0; i < 15; i += 1) after.indexability[`/r${i}`] = 'NOINDEX|noindex,follow|false'
  const result = compareSnapshots(before, after)
  if (result.majorChanges.length < 4) throw new Error('self-test failed to detect expected major regressions')
  console.log('[build-quality] self-test passed')
}

if (argv.includes('--self-test')) {
  selfTest()
  process.exit(0)
}

const current = currentSnapshot()
let selectedBase = ''
let previous
for (const candidate of baseCandidates()) {
  const candidateSnapshot = baseSnapshot(candidate)
  if (candidateSnapshot.routeCount > 0 || Object.keys(candidateSnapshot.indexability).length > 0) {
    selectedBase = candidate
    previous = candidateSnapshot
    break
  }
}

if (!previous) {
  const message = '[build-quality] unable to load a previous generated-data state from Git'
  if (REQUIRE_BASE) {
    console.error(`${message}; pass --base=<ref> or fetch the base ref before running`)
    process.exit(1)
  }
  console.log(`${message}; skipping comparison`)
  process.exit(0)
}

const comparison = compareSnapshots(previous, current)
const report = {
  generatedAt: new Date().toISOString(),
  baseRef: selectedBase,
  changeReason: CHANGE_REASON,
  comparison,
}

fs.mkdirSync(REPORT_DIR, { recursive: true })
fs.writeFileSync(path.join(REPORT_DIR, 'build-quality-diff.json'), `${JSON.stringify(report, null, 2)}\n`)
fs.writeFileSync(path.join(REPORT_DIR, 'build-quality-diff.md'), renderMarkdown(report))
printSummary(report)

if (comparison.majorChanges.length && !CHANGE_REASON) {
  console.error('\nMajor automated changes require an explanation before merge.')
  console.error('Re-run with --reason="..." or set QUALITY_CHANGE_REASON.')
  process.exit(1)
}
