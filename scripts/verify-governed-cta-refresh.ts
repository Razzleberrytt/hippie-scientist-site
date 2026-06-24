#!/usr/bin/env tsx
import assert from 'node:assert/strict'
import fs from 'node:fs'
import path from 'node:path'

const ROOT = process.cwd()
const REPORT_PATH = path.join(ROOT, 'ops', 'reports', 'governed-cta-refresh.json')

type ReportShape = {
  totals?: {
    evaluatedPages?: number
    changedPages?: number
    herbPagesChanged?: number
    compoundPagesChanged?: number
  }
  verification?: Record<string, boolean>
  changedRows?: Array<{
    route: string
    before?: { slotOrder?: string[] }
    after?: {
      slotOrder?: string[]
      copy?: {
        affiliateLeadIn?: string
      }
      usedSignals?: string[]
    }
  }>
}

assert.ok(fs.existsSync(REPORT_PATH), 'Missing governed CTA refresh report. Run report:governed-cta-refresh first.')
const report = JSON.parse(fs.readFileSync(REPORT_PATH, 'utf8')) as ReportShape

assert.ok((report.totals?.evaluatedPages || 0) > 0, 'Expected governed CTA report to evaluate at least one page.')
assert.ok((report.totals?.changedPages || 0) > 0, 'Expected at least one governed CTA page change.')
assert.ok(
  (report.totals?.herbPagesChanged || 0) + (report.totals?.compoundPagesChanged || 0) > 0,
  'Expected at least one herb/compound page type to receive governed CTA updates.',
)

for (const [key, value] of Object.entries(report.verification || {})) {
  assert.equal(value, true, `Verification flag failed: ${key}`)
}

for (const row of report.changedRows || []) {
  const slotOrder = row.after?.slotOrder || []
  const toolIndex = slotOrder.indexOf('tool')
  const affiliateIndex = slotOrder.indexOf('affiliate')
  if (toolIndex >= 0 && affiliateIndex >= 0) {
    assert.ok(toolIndex < affiliateIndex, `Tool CTA must appear before affiliate CTA for ${row.route}.`)
  }

  const afterSignals = row.after?.usedSignals || []
  if (afterSignals.includes('low_confidence_tier') || afterSignals.includes('sparse_sources')) {
    const leadIn = String(row.after?.copy?.affiliateLeadIn || '').toLowerCase()
    assert.ok(
      !/(best|buy now|top pick|must-have|guaranteed|strongest)/i.test(leadIn),
      `Weak/sparse page has aggressive affiliate copy for ${row.route}.`,
    )
  }
}

console.log(
  `[verify-governed-cta-refresh] PASS evaluated=${report.totals?.evaluatedPages || 0} changed=${report.totals?.changedPages || 0}`,
)
