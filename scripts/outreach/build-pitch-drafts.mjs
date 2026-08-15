#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const reportFile = process.argv[2] || path.join(root, 'reports/outreach-opportunities.json')
const output = path.join(root, 'artifacts/outreach/pitch-drafts.md')

if (!fs.existsSync(reportFile)) {
  console.log(`[pitch-drafts] SKIP: ${path.relative(root, reportFile)} not found; run build-opportunity-report first`)
  process.exit(0)
}

const report = JSON.parse(fs.readFileSync(reportFile, 'utf8'))
const candidates = (report.actionable || []).filter((row) => row.targetUrl && row.sourceUrl).slice(0, 50)

function angle(row) {
  if (row.type === 'unlinked-brand-mention') return 'Thanks for mentioning The Hippie Scientist. I noticed the reference is not linked; here is the exact source page if it would help readers verify the underlying data.'
  if (row.type === 'broken-link-replacement') return 'I noticed the cited resource is no longer available. We maintain a current source-backed research resource that may be useful as a replacement if it genuinely improves the page.'
  if (row.type === 'outdated-statistic') return 'Your article cites an older supplement statistic. We now publish a dated, reproducible aggregate from our current evidence dataset; it may be useful if you are refreshing the piece.'
  if (row.type === 'evidence-change-pitch') return 'A material evidence conclusion changed after new research/review. The source page documents the updated conclusion and supporting evidence trail.'
  return 'We publish an original research/data resource that appears directly relevant to the point your article is making. I am sending the source because it may save you research time, not as a generic backlink request.'
}

const body = candidates.map((row, index) => `## ${index + 1}. ${row.domain}\n\n**Opportunity:** ${row.type} · score ${row.opportunityScore}\n\n**Source article/page:** ${row.sourceUrl}\n\n**Research asset:** ${row.targetUrl}\n\n**Draft**\n\nSubject: Possible source update for your supplement research page\n\nHello,\n\n${angle(row)}\n\nResearch asset: ${row.targetUrl}\n\n${row.notes ? `Context I flagged: ${row.notes}\n\n` : ''}If you use it, please verify that it fits your editorial standards and wording. The methodology and caveats are linked from the resource itself. No reply is needed if it is not useful.\n\n— The Hippie Scientist research team\n`).join('\n---\n\n')

fs.mkdirSync(path.dirname(output), { recursive: true })
fs.writeFileSync(output, `# Source-first outreach drafts\n\nGenerated ${new Date().toISOString()}. These are drafts only; verify recipient, article context, data freshness, and source claims before any outreach.\n\n${body || '_No actionable candidates yet._'}\n`)
console.log(`[pitch-drafts] generated ${candidates.length} review-only pitch drafts`)
