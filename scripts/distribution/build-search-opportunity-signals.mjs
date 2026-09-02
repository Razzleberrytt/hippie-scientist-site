#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { validateOpportunitySignals } from './opportunity-signal-contract.mjs'

const root = process.cwd()
const objectsPath = path.resolve(process.argv[2] || 'data/distribution/research-objects.json')
const reportPath = path.resolve(process.env.SEARCH_OPPORTUNITY_REPORT || 'ops/reports/search-opportunities.json')
const metadataPath = path.resolve(process.env.SEARCH_CONSOLE_METADATA || 'data-sources/search-console/fetch-metadata.json')
const outputPath = path.resolve(process.env.DISTRIBUTION_OPPORTUNITY_SIGNALS || 'data/distribution/opportunity-signals.json')

function readJson(file) {
  return JSON.parse(fs.readFileSync(file, 'utf8'))
}

function canonicalPath(value) {
  try {
    const url = new URL(String(value || ''), 'https://thehippiescientist.net')
    let pathname = url.pathname || '/'
    if (pathname !== '/' && !pathname.endsWith('/')) pathname += '/'
    return pathname
  } catch {
    return ''
  }
}

function clamp(value, min = 0, max = 1) {
  return Math.max(min, Math.min(max, value))
}

export function scoreSearchOpportunity(page) {
  const impressions = Math.max(0, Number(page?.impressions || 0))
  const upsideClicks = Math.max(0, Number(page?.totalUpsideClicks || 0))
  if (!impressions) return null
  // Fixed caps keep scores comparable between runs and candidates instead of
  // making the current candidate set define its own scale.
  const demand = clamp(Math.log10(impressions + 1) / Math.log10(10_001))
  const upside = clamp(Math.log10(upsideClicks + 1) / Math.log10(101))
  return Number((10 * (0.4 * demand + 0.6 * upside)).toFixed(2))
}

export function buildSearchOpportunitySignals({ objects, report, metadata }) {
  if (!Array.isArray(objects)) throw new Error('research objects input must be an array')
  if (!Array.isArray(report?.pages)) throw new Error('search opportunity report must contain pages[]')
  if (!/^\d{4}-\d{2}-\d{2}$/.test(String(metadata?.endDate || ''))) {
    throw new Error('Search Console metadata must provide the finalized endDate')
  }

  const pages = new Map(report.pages.map((page) => [canonicalPath(page.url), page]).filter(([key]) => key))
  const signals = {}
  for (const object of objects) {
    const id = String(object?.id || '').trim()
    const destination = canonicalPath(object?.sourceUrl)
    if (!id || !destination) continue
    const page = pages.get(destination)
    const score = scoreSearchOpportunity(page)
    if (score == null) continue
    const denominator = Math.round(Number(page.impressions))
    if (!Number.isInteger(denominator) || denominator <= 0) continue
    signals[id] = {
      searchOpportunity: score,
      provenance: {
        source: 'google-search-console',
        observedThrough: metadata.endDate,
        denominator,
        method: 'Finalized GSC page demand: 40% log-scaled impressions (10k cap) + 60% log-scaled modeled CTR/rank upside clicks (100 cap), normalized to 0-10.',
        fields: ['searchOpportunity'],
      },
    }
  }
  return signals
}

function main() {
  const objects = readJson(objectsPath)
  const report = readJson(reportPath)
  const metadata = readJson(metadataPath)
  const signals = buildSearchOpportunitySignals({ objects, report, metadata })
  const validation = validateOpportunitySignals(signals)
  if (!validation.valid) throw new Error(`generated opportunity signals are invalid:\n- ${validation.errors.join('\n- ')}`)
  fs.mkdirSync(path.dirname(outputPath), { recursive: true })
  fs.writeFileSync(outputPath, `${JSON.stringify(signals, null, 2)}\n`)
  console.log(`[distribution] GSC opportunity signals: ${Object.keys(signals).length}/${objects.length} governed candidate(s) matched`)
  console.log(`[distribution] observed through: ${metadata.endDate}`)
  console.log(`[distribution] output: ${path.relative(root, outputPath)}`)
}

if (process.argv[1] && path.resolve(process.argv[1]) === path.resolve(new URL(import.meta.url).pathname)) main()
