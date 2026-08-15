#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import crypto from 'node:crypto'

const root = process.cwd()
const reportPath = path.resolve(process.argv[2] || 'reports/content-decay.json')
const outputPath = path.resolve(process.env.CONTENT_DECAY_ISSUES || 'reports/content-decay-issues.json')
const threshold = Number(process.env.CONTENT_DECAY_ISSUE_THRESHOLD || 50)
const limit = Math.max(1, Number(process.env.CONTENT_DECAY_ISSUE_LIMIT || 10))

if (!fs.existsSync(reportPath)) {
  console.log(`[decay-issues] SKIP: ${path.relative(root, reportPath)} not found`)
  process.exit(0)
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'))
const pages = Array.isArray(report.pages) ? report.pages : []

function marker(url) {
  return `content-decay:${crypto.createHash('sha1').update(url).digest('hex').slice(0, 12)}`
}
function fmtPct(value) {
  const n = Number(value)
  return Number.isFinite(n) ? `${(n * 100).toFixed(1)}%` : 'n/a'
}

const issues = pages
  .filter((page) => Number(page.updatePriority) >= threshold)
  .slice(0, limit)
  .map((page) => {
    const id = marker(page.url)
    const queries = Array.isArray(page.queryOpportunities) && page.queryOpportunities.length
      ? page.queryOpportunities.map((q) => `| ${q.query} | ${q.impressions} | ${q.position.toFixed?.(1) ?? q.position} | ${fmtPct(q.ctr)} |`).join('\n')
      : '| _No query opportunities supplied_ | — | — | — |'
    const body = `<!-- ${id} -->
## Why this page needs updating

**URL:** https://thehippiescientist.net${page.url}\n**Update priority:** ${page.updatePriority}/100  \n**Decay score:** ${page.decayScore}/100  \n**Recovery value:** ${page.recoveryValue}/40

${page.reasons.map((reason) => `- ${reason}`).join('\n')}

## Search Console context

- Impressions, last 28d: ${page.gsc.impressions28}
- Clicks, last 28d: ${page.gsc.clicks28}
- Clicks, prior 28d: ${page.gsc.clicksPrevious28}
- Average position: ${page.gsc.positionCurrent} (prior ${page.gsc.positionPrevious})
- CTR: ${fmtPct(page.gsc.ctrCurrent)} (prior ${fmtPct(page.gsc.ctrPrevious)})
- Revenue, last 28d: ${page.revenue28}

## Query opportunities

| Query | Impressions | Position | CTR |
|---|---:|---:|---:|
${queries}

## Scientific/content freshness

- New research signals: ${page.newResearchCount}
- Days since evidence search: ${page.daysSinceEvidenceSearch}
- Average citation age: ${Math.round(page.avgCitationAgeDays)} days
- Product information changed: ${page.productChanged ? 'yes' : 'no'}

## Acceptance criteria

- [ ] Re-run the evidence/source search where freshness or new-research signals justify it.
- [ ] Verify the page's major claims and citations against current canonical data.
- [ ] Address the highest-value query opportunities without changing the page's search intent.
- [ ] Re-check product/formulation information if product-change signals are present.
- [ ] Run production-content lint and the relevant build/test suite.
- [ ] Record what changed and the before/after metrics in the PR.
`
    return {
      marker: id,
      url: page.url,
      title: `[Content decay] Update ${page.url} (priority ${page.updatePriority})`,
      body,
      labels: ['content-decay', 'seo', 'research-update'],
      priority: page.updatePriority,
    }
  })

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify({ generatedAt: new Date().toISOString(), threshold, issues }, null, 2)}\n`)
console.log(`[decay-issues] generated ${issues.length} issue payload(s) at threshold ${threshold}`)
