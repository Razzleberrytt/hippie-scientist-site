#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'
import { eventCount, first, readAnalyticsExport } from './analytics-export-utils.mjs'

const DEFAULT_INPUT = 'data-sources/analytics/research-suggestions.json'
const DEFAULT_OUTPUT = 'ops/reports/research-suggestion-demand.json'
const ALLOWED_TYPES = new Set(['ingredient', 'comparison', 'missing_study'])

function normalizeValue(type, value) {
  const clean = String(value ?? '').trim().toLowerCase().replace(/\s+/g, ' ')
  if (!clean) return null
  if (type === 'comparison') {
    const parts = clean.split(/\s+vs\s+/i).map((part) => part.trim()).filter(Boolean)
    return parts.length === 2 ? parts.sort().join(' vs ') : clean
  }
  return clean
}

function normalizeRow(row) {
  const eventName = String(first(row, ['event_name', 'eventName', 'event']) ?? 'research_suggestion')
  if (eventName && eventName !== 'research_suggestion') return null
  const type = String(first(row, ['suggestion_type', 'suggestionType', 'type']) ?? '')
  if (!ALLOWED_TYPES.has(type)) return null
  const value = normalizeValue(type, first(row, ['suggestion_value', 'suggestionValue', 'value']))
  if (!value) return null
  return { type, value, count: eventCount(row) }
}

export function buildSuggestionDemandReport(rows, metadata = {}) {
  const normalized = rows.map(normalizeRow).filter(Boolean)
  const aggregate = new Map()

  for (const row of normalized) {
    const key = `${row.type}\u0000${row.value}`
    const current = aggregate.get(key) ?? { suggestionType: row.type, suggestionValue: row.value, demandCount: 0 }
    current.demandCount += row.count
    aggregate.set(key, current)
  }

  const ranked = [...aggregate.values()]
    .map((item) => ({
      ...item,
      demandScore: item.demandCount,
      queueInstruction: item.suggestionType === 'missing_study'
        ? `Review study identifier ${item.suggestionValue} for canonical entity/outcome matching before changing any conclusion.`
        : `Evaluate “${item.suggestionValue}” against search demand, evidence availability, safety requirements, uniqueness, and ROI before publication.`,
    }))
    .sort((a, b) => b.demandScore - a.demandScore || a.suggestionType.localeCompare(b.suggestionType) || a.suggestionValue.localeCompare(b.suggestionValue))

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourcePeriod: metadata.sourcePeriod ?? metadata.source_period ?? null,
    policy: 'Demand ranks suggestions within this reader-suggestion signal only. It does not bypass evidence, safety, usefulness, or ROI gates.',
    totalSuggestionEvents: normalized.reduce((sum, row) => sum + row.count, 0),
    uniqueSuggestions: ranked.length,
    topSuggestion: ranked[0] ?? null,
    suggestions: ranked,
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
  const report = buildSuggestionDemandReport(rows, metadata)
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Research suggestion demand: ${report.uniqueSuggestions} unique suggestions from ${report.totalSuggestionEvents} events → ${output}`)
  if (metadata.missingInput) console.log(`No suggestion export found at ${input}; wrote an empty, non-failing baseline.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 1
})
