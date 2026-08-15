#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { eventCount, first, normalizePagePath, readAnalyticsExport } from './analytics-export-utils.mjs'

const DEFAULT_INPUT = 'data-sources/analytics/profile-feedback.json'
const DEFAULT_OUTPUT = 'ops/reports/feedback-improvement-backlog.json'

function normalizeRow(row) {
  const eventName = String(first(row, ['event_name', 'eventName', 'event']) ?? 'profile_feedback')
  if (eventName && eventName !== 'profile_feedback') return null
  const pagePath = normalizePagePath(first(row, ['page_path', 'pagePath', 'source_path']))
  const question = String(first(row, ['feedback_question', 'question']) ?? '')
  const answer = String(first(row, ['feedback_answer', 'answer']) ?? '')
  if (!pagePath || !question || !answer) return null
  return { pagePath, question, answer, count: eventCount(row) }
}

export function buildFeedbackBacklog(rows, metadata = {}) {
  const pages = new Map()
  const normalized = rows.map(normalizeRow).filter(Boolean)

  for (const row of normalized) {
    const current = pages.get(row.pagePath) ?? {
      pagePath: row.pagePath,
      clarityYes: 0,
      clarityNo: 0,
      foundYes: 0,
      foundNo: 0,
      missing: {},
    }
    if (row.question === 'evidence_clarity' && row.answer === 'yes') current.clarityYes += row.count
    if (row.question === 'evidence_clarity' && row.answer === 'no') current.clarityNo += row.count
    if (row.question === 'research_found' && row.answer === 'yes') current.foundYes += row.count
    if (row.question === 'research_found' && row.answer === 'no') current.foundNo += row.count
    if (row.question === 'missing_information') current.missing[row.answer] = (current.missing[row.answer] ?? 0) + row.count
    pages.set(row.pagePath, current)
  }

  const backlog = [...pages.values()].map((page) => {
    const clarityTotal = page.clarityYes + page.clarityNo
    const foundTotal = page.foundYes + page.foundNo
    const missingTotal = Object.values(page.missing).reduce((sum, value) => sum + value, 0)
    const score = page.clarityNo * 3 + page.foundNo * 4 + missingTotal * 2
    const topMissing = Object.entries(page.missing)
      .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
      .map(([category, count]) => ({ category, count }))

    return {
      ...page,
      clarityNegativeRate: clarityTotal ? Number((page.clarityNo / clarityTotal).toFixed(4)) : null,
      researchFailureRate: foundTotal ? Number((page.foundNo / foundTotal).toFixed(4)) : null,
      missingTotal,
      improvementScore: score,
      topMissing,
      suggestedAction: topMissing[0]
        ? `Improve ${topMissing[0].category.replaceAll('_', ' ')} coverage, then remeasure.`
        : page.foundNo > 0
          ? 'Inspect the page against its landing-query intent and add the missing decision answer.'
          : page.clarityNo > 0
            ? 'Rewrite the evidence summary for clarity without weakening caveats.'
            : 'No negative signal yet.',
    }
  }).filter((page) => page.improvementScore > 0)
    .sort((a, b) => b.improvementScore - a.improvementScore || b.foundNo - a.foundNo || a.pagePath.localeCompare(b.pagePath))

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourcePeriod: metadata.sourcePeriod ?? metadata.source_period ?? null,
    privacyModel: 'Only structured page-level feedback categories are expected. Free-text health information is not part of this event schema.',
    feedbackEvents: normalized.reduce((sum, row) => sum + row.count, 0),
    candidateCount: backlog.length,
    nextImprovement: backlog[0] ?? null,
    backlog,
  }
}

async function main() {
  const args = process.argv.slice(2)
  const arg = (name, fallback) => {
    const index = args.indexOf(name)
    return index >= 0 ? args[index + 1] ?? fallback : fallback
  }
  const input = arg('--input', DEFAULT_INPUT)
  const output = arg('--output', DEFAULT_OUTPUT)
  const { rows, metadata } = await readAnalyticsExport(input)
  const report = buildFeedbackBacklog(rows, metadata)
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Feedback backlog: ${report.candidateCount} page candidates from ${report.feedbackEvents} structured feedback events → ${output}`)
  if (metadata.missingInput) console.log(`No feedback export found at ${input}; wrote an empty, non-failing baseline.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 1
})
