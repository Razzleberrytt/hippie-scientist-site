#!/usr/bin/env node
/**
 * Render collected Lighthouse runs as a trend table.
 *
 * The performance budgets are asserted as warnings rather than errors, because
 * on a shared runner they are not a reliable pass/fail signal — two runs of the
 * same commit reported total-blocking-time of 1992ms and 467ms on `/`. That
 * makes the numbers worth *watching* rather than worth *failing on*, and a
 * table of medians per URL is more useful than a red X.
 *
 * Reads the reports lhci leaves in `.lighthouseci-performance/` and writes a
 * markdown table to stdout (and to $GITHUB_STEP_SUMMARY when set).
 *
 * Usage: node scripts/ci/report-lighthouse-trend.mjs [--dir=.lighthouseci-performance]
 */

import fs from 'node:fs'
import path from 'node:path'

const args = process.argv.slice(2)
const dirArg = args.find((arg) => arg.startsWith('--dir='))
const DIR = path.resolve(process.cwd(), dirArg ? dirArg.split('=')[1] : '.lighthouseci-performance')

/** Budget, unit and direction for each metric we track. */
const METRICS = [
  { id: 'first-contentful-paint', label: 'FCP', budget: null, unit: 'ms' },
  { id: 'largest-contentful-paint', label: 'LCP', budget: 2500, unit: 'ms' },
  { id: 'total-blocking-time', label: 'TBT', budget: 300, unit: 'ms' },
  { id: 'cumulative-layout-shift', label: 'CLS', budget: 0.1, unit: '' },
  { id: 'speed-index', label: 'SI', budget: 3500, unit: 'ms' },
]

const median = (values) => {
  const sorted = [...values].sort((a, b) => a - b)
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

function main() {
  if (!fs.existsSync(DIR)) {
    console.log(`No Lighthouse reports at ${path.relative(process.cwd(), DIR)} — nothing to report.`)
    return
  }

  const byUrl = new Map()
  for (const file of fs.readdirSync(DIR)) {
    if (!file.endsWith('.json') || file.startsWith('assertion')) continue
    let report
    try {
      report = JSON.parse(fs.readFileSync(path.join(DIR, file), 'utf8'))
    } catch {
      continue
    }
    const url = report.finalDisplayedUrl || report.finalUrl || report.requestedUrl
    if (!url || !report.audits) continue
    if (!byUrl.has(url)) byUrl.set(url, [])
    byUrl.get(url).push(report)
  }

  if (byUrl.size === 0) {
    console.log('No parseable Lighthouse reports found — nothing to report.')
    return
  }

  const lines = []
  lines.push('## Lighthouse trend')
  lines.push('')
  lines.push('Performance budgets are tracked, not gated: on a shared runner these')
  lines.push('metrics vary too much between identical commits to red-light a build.')
  lines.push('Accessibility remains a hard gate.')
  lines.push('')
  lines.push(`| URL | runs | score | ${METRICS.map((m) => m.label).join(' | ')} |`)
  lines.push(`|---|---:|---:|${METRICS.map(() => '---:').join('|')}|`)

  for (const [url, reports] of [...byUrl.entries()].sort()) {
    const pathOnly = (() => {
      try {
        return new URL(url).pathname
      } catch {
        return url
      }
    })()
    const score = median(reports.map((r) => (r.categories?.performance?.score ?? 0) * 100))
    const cells = METRICS.map((metric) => {
      const values = reports
        .map((r) => r.audits?.[metric.id]?.numericValue)
        .filter((v) => typeof v === 'number')
      if (!values.length) return '—'
      const value = median(values)
      const shown = metric.unit === 'ms' ? Math.round(value).toString() : value.toFixed(3)
      // Mark the ones over budget so the table still communicates health.
      return metric.budget !== null && value > metric.budget ? `**${shown}**` : shown
    })
    lines.push(`| \`${pathOnly}\` | ${reports.length} | ${Math.round(score)} | ${cells.join(' | ')} |`)
  }

  lines.push('')
  lines.push(`Budgets: ${METRICS.filter((m) => m.budget !== null).map((m) => `${m.label} ≤ ${m.budget}${m.unit}`).join(', ')}. **Bold** is over budget.`)
  lines.push('')

  const out = lines.join('\n')
  console.log(out)
  if (process.env.GITHUB_STEP_SUMMARY) {
    fs.appendFileSync(process.env.GITHUB_STEP_SUMMARY, `${out}\n`, 'utf8')
  }
}

main()
