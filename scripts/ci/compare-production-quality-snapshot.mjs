#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const args = process.argv.slice(2)
const valueFor = flag => {
  const index = args.indexOf(flag)
  return index >= 0 ? args[index + 1] : ''
}
const currentPath = path.resolve(root, valueFor('--current') || 'public/data/reports/production-quality-snapshot.json')
const baselinePath = path.resolve(root, valueFor('--baseline') || '.quality-baseline/production-quality-snapshot.json')
const reportPath = path.resolve(root, valueFor('--report') || 'public/data/reports/production-quality-regression.json')

function read(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function pctChange(current, baseline) {
  if (!baseline) return current ? 100 : 0
  return ((current - baseline) / baseline) * 100
}

function changedRoutes(current, baseline, selector) {
  const changes = []
  for (const [route, currentRow] of Object.entries(current.routes || {})) {
    const baseRow = baseline.routes?.[route]
    if (!baseRow) continue
    const before = selector(baseRow)
    const after = selector(currentRow)
    if (JSON.stringify(before) !== JSON.stringify(after)) changes.push({ route, before, after })
  }
  return changes
}

function lostLinks(current, baseline) {
  const losses = []
  for (const [route, baseRow] of Object.entries(baseline.routes || {})) {
    const currentRow = current.routes?.[route]
    if (!currentRow) continue
    const currentLinks = new Set(currentRow.internalLinks || [])
    for (const href of baseRow.internalLinks || []) {
      if (!currentLinks.has(href)) losses.push({ route, href })
    }
  }
  return losses
}

function evidenceGradeChanges(current, baseline) {
  const grades = new Set([
    ...Object.keys(current.evidence?.gradeDistribution || {}),
    ...Object.keys(baseline.evidence?.gradeDistribution || {}),
  ])
  return [...grades].map(grade => {
    const before = Number(baseline.evidence?.gradeDistribution?.[grade] || 0)
    const after = Number(current.evidence?.gradeDistribution?.[grade] || 0)
    return { grade, before, after, delta: after - before }
  }).filter(row => row.delta !== 0)
}

function citationLosses(current, baseline) {
  const losses = []
  for (const [slug, beforeRaw] of Object.entries(baseline.evidence?.sourceCounts || {})) {
    if (!(slug in (current.evidence?.sourceCounts || {}))) continue
    const before = Number(beforeRaw || 0)
    const after = Number(current.evidence.sourceCounts[slug] || 0)
    if (after < before) losses.push({ slug, before, after, delta: after - before })
  }
  return losses.sort((a, b) => a.delta - b.delta || a.slug.localeCompare(b.slug))
}

function explanation() {
  const explicit = String(process.env.QUALITY_CHANGE_EXPLANATION || '').trim()
  if (explicit.length >= 20) return explicit
  const body = String(process.env.PULL_REQUEST_BODY || '')
  const match = body.match(/(?:^|\n)\s*Quality change explanation\s*:\s*([\s\S]+?)(?=\n\s*[A-Z][^\n]{0,60}:|$)/i)
  return String(match?.[1] || '').trim()
}

function markdown(report) {
  const m = report.metrics
  const lines = [
    '## Production build regression summary',
    '',
    `Status: **${report.passed ? 'PASS' : 'FAIL'}**`,
    '',
    `- Pages: ${m.pageCount.before} → ${m.pageCount.after} (${m.pageCount.delta >= 0 ? '+' : ''}${m.pageCount.delta})`,
    `- Indexable pages: ${m.indexableCount.before} → ${m.indexableCount.after} (${m.indexableCount.delta >= 0 ? '+' : ''}${m.indexableCount.delta})`,
    `- Internal link edges: ${m.internalLinkCount.before} → ${m.internalLinkCount.after} (${m.internalLinkCount.delta >= 0 ? '+' : ''}${m.internalLinkCount.delta})`,
    `- Structured source count: ${m.sourceCount.before} → ${m.sourceCount.after} (${m.sourceCount.delta >= 0 ? '+' : ''}${m.sourceCount.delta})`,
    `- Title changes: ${report.changes.titles.length}`,
    `- Indexability changes: ${report.changes.indexability.length}`,
    `- Lost internal links: ${report.changes.lostInternalLinks.length}`,
    `- Entity source-count decreases: ${report.changes.citationLosses.length}`,
    `- Evidence-grade buckets changed: ${report.changes.evidenceGrades.length}`,
  ]
  if (report.majorChanges.length) {
    lines.push('', '### Major changes requiring explanation')
    for (const item of report.majorChanges) lines.push(`- ${item}`)
    lines.push('', report.explanation ? `Explanation: ${report.explanation}` : '❌ Missing `Quality change explanation:` in the PR body (or `QUALITY_CHANGE_EXPLANATION`).')
  }
  return `${lines.join('\n')}\n`
}

function main() {
  if (!fs.existsSync(currentPath)) {
    console.error(`[quality-regression] missing current snapshot: ${currentPath}`)
    process.exit(2)
  }
  if (!fs.existsSync(baselinePath)) {
    console.log('[quality-regression] no baseline snapshot available; bootstrap run will publish the current snapshot for future comparisons.')
    process.exit(0)
  }

  const current = read(currentPath)
  const baseline = read(baselinePath)
  const pageBefore = Number(baseline.totals?.pages || 0)
  const pageAfter = Number(current.totals?.pages || 0)
  const indexBefore = Number(baseline.totals?.indexablePages || 0)
  const indexAfter = Number(current.totals?.indexablePages || 0)
  const linksBefore = Number(baseline.totals?.internalLinks || 0)
  const linksAfter = Number(current.totals?.internalLinks || 0)
  const sourcesBefore = Number(baseline.evidence?.totalSources || 0)
  const sourcesAfter = Number(current.evidence?.totalSources || 0)

  const titles = changedRoutes(current, baseline, row => row.title)
  const indexability = changedRoutes(current, baseline, row => row.indexable)
  const lostInternalLinks = lostLinks(current, baseline)
  const citationLossRows = citationLosses(current, baseline)
  const evidenceGrades = evidenceGradeChanges(current, baseline)

  const majorChanges = []
  const pageDelta = pageAfter - pageBefore
  const pagePct = pctChange(pageAfter, pageBefore)
  if (Math.abs(pageDelta) >= 25 || Math.abs(pagePct) >= 5) {
    majorChanges.push(`Built page count changed ${pageDelta >= 0 ? '+' : ''}${pageDelta} (${pagePct.toFixed(1)}%).`)
  }
  const indexDelta = indexAfter - indexBefore
  const indexPct = pctChange(indexAfter, indexBefore)
  if (Math.abs(indexDelta) >= 10 || Math.abs(indexPct) >= 2) {
    majorChanges.push(`Indexable page count changed ${indexDelta >= 0 ? '+' : ''}${indexDelta} (${indexPct.toFixed(1)}%).`)
  }
  if (titles.length >= Math.max(20, Math.ceil(pageBefore * 0.05))) {
    majorChanges.push(`${titles.length} existing routes changed title.`)
  }
  if (indexability.length >= Math.max(10, Math.ceil(pageBefore * 0.02))) {
    majorChanges.push(`${indexability.length} existing routes changed indexability.`)
  }
  if (lostInternalLinks.length >= Math.max(25, Math.ceil(Math.max(linksBefore, 1) * 0.05))) {
    majorChanges.push(`${lostInternalLinks.length} previously present internal-link edges were removed.`)
  }
  const sourceDelta = sourcesAfter - sourcesBefore
  if (sourceDelta < 0) majorChanges.push(`Aggregate structured source count decreased by ${Math.abs(sourceDelta)}.`)
  if (citationLossRows.length >= 10) majorChanges.push(`${citationLossRows.length} existing entities lost structured sources.`)
  const recordCount = Math.max(1, Number(baseline.evidence?.recordCount || 0))
  for (const row of evidenceGrades) {
    if (Math.abs(row.delta) >= Math.max(20, Math.ceil(recordCount * 0.05))) {
      majorChanges.push(`Evidence grade ${row.grade} changed by ${row.delta >= 0 ? '+' : ''}${row.delta} records.`)
    }
  }

  const why = explanation()
  const explanationRequired = majorChanges.length > 0 && process.env.REQUIRE_QUALITY_CHANGE_EXPLANATION !== 'false'
  const passed = !explanationRequired || why.length >= 20
  const report = {
    generatedAt: new Date().toISOString(),
    contract: 'production-quality-regression/v1',
    passed,
    baselineGeneratedAt: baseline.generatedAt,
    currentGeneratedAt: current.generatedAt,
    explanation: why,
    metrics: {
      pageCount: { before: pageBefore, after: pageAfter, delta: pageDelta },
      indexableCount: { before: indexBefore, after: indexAfter, delta: indexDelta },
      internalLinkCount: { before: linksBefore, after: linksAfter, delta: linksAfter - linksBefore },
      sourceCount: { before: sourcesBefore, after: sourcesAfter, delta: sourceDelta },
    },
    changes: { titles, indexability, lostInternalLinks, citationLosses: citationLossRows, evidenceGrades },
    majorChanges,
  }
  fs.mkdirSync(path.dirname(reportPath), { recursive: true })
  fs.writeFileSync(reportPath, `${JSON.stringify(report, null, 2)}\n`)
  const md = markdown(report)
  const mdPath = reportPath.replace(/\.json$/i, '.md')
  fs.writeFileSync(mdPath, md)
  if (process.env.GITHUB_STEP_SUMMARY) fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `\n${md}\n`)
  console.log(md)
  if (!passed) process.exit(1)
}

main()
