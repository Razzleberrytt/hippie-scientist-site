#!/usr/bin/env node
import fs from 'node:fs/promises'
import path from 'node:path'

const DEFAULT_INPUT = 'data-sources/analytics/navigation-clicks.json'
const DEFAULT_OUTPUT = 'ops/reports/navigation-clicks.json'
const NAV_SOURCE = 'lib/primary-navigation.ts'

async function readText(file) {
  try { return await fs.readFile(file, 'utf8') } catch (error) {
    if (error?.code === 'ENOENT') return null
    throw error
  }
}

function parseCsv(text) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < text.length; i += 1) {
    const char = text[i]
    if (char === '"') {
      if (quoted && text[i + 1] === '"') { field += '"'; i += 1 }
      else quoted = !quoted
    } else if (char === ',' && !quoted) {
      row.push(field); field = ''
    } else if ((char === '\n' || char === '\r') && !quoted) {
      if (char === '\r' && text[i + 1] === '\n') i += 1
      row.push(field); field = ''
      if (row.some((value) => value.trim())) rows.push(row)
      row = []
    } else field += char
  }
  if (field || row.length) { row.push(field); rows.push(row) }
  if (rows.length < 2) return []
  const headers = rows[0].map((value) => value.trim())
  return rows.slice(1).map((values) => Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ''])))
}

function normalizeDestination(value) {
  if (!value) return null
  try {
    if (/^https?:\/\//i.test(value)) value = new URL(value).pathname
  } catch {}
  const clean = String(value).split(/[?#]/)[0].trim()
  if (!clean.startsWith('/')) return null
  if (clean === '/') return '/'
  return clean.endsWith('/') ? clean.slice(0, -1) : clean
}

function first(record, keys) {
  for (const key of keys) if (record?.[key] !== undefined && record?.[key] !== '') return record[key]
  return undefined
}

function normalizeEvents(raw) {
  const rows = Array.isArray(raw) ? raw : raw?.events ?? raw?.rows ?? []
  return rows.map((row) => ({
    destination: normalizeDestination(first(row, ['navigation_destination', 'destination', 'href', 'pagePath', 'page_path'])),
    label: String(first(row, ['navigation_label', 'label', 'linkText', 'link_text']) ?? '').trim(),
    location: String(first(row, ['navigation_location', 'location']) ?? 'unknown').trim(),
    clicks: Math.max(0, Number(first(row, ['clicks', 'eventCount', 'event_count', 'count']) ?? 1) || 0),
  })).filter((row) => row.destination)
}

function readNavigationInventory(source) {
  const destinations = new Map()
  for (const match of source.matchAll(/label:\s*['"]([^'"]+)['"][\s\S]{0,160}?href:\s*['"](\/[^'"]*)['"]/g)) {
    const label = match[1]
    const destination = normalizeDestination(match[2])
    if (destination && !destinations.has(destination)) destinations.set(destination, label)
  }
  return destinations
}

export function buildNavigationClickReport(raw, navSource) {
  const events = normalizeEvents(raw)
  const inventory = readNavigationInventory(navSource)
  const aggregate = new Map()
  for (const event of events) {
    const current = aggregate.get(event.destination) ?? { destination: event.destination, clicks: 0, labels: new Set(), locations: new Set() }
    current.clicks += event.clicks
    if (event.label) current.labels.add(event.label)
    if (event.location) current.locations.add(event.location)
    aggregate.set(event.destination, current)
  }

  const ranked = [...new Set([...inventory.keys(), ...aggregate.keys()])].map((destination) => {
    const observed = aggregate.get(destination)
    return {
      destination,
      navigationLabel: inventory.get(destination) ?? [...(observed?.labels ?? [])][0] ?? null,
      clicks: observed?.clicks ?? 0,
      observedLabels: [...(observed?.labels ?? [])].sort(),
      observedLocations: [...(observed?.locations ?? [])].sort(),
      inCurrentNavigation: inventory.has(destination),
    }
  }).sort((a, b) => b.clicks - a.clicks || a.destination.localeCompare(b.destination))

  const totalClicks = ranked.reduce((sum, row) => sum + row.clicks, 0)
  const observationDays = Math.max(0, Number(raw?.observationDays ?? raw?.observation_days ?? 0) || 0)
  const enoughForDemotion = observationDays >= 28 && totalClicks >= 100
  const observedPositive = ranked.filter((row) => row.clicks > 0)
  const promoteThreshold = observedPositive.length
    ? observedPositive[Math.max(0, Math.floor(observedPositive.length * 0.25) - 1)]?.clicks ?? 1
    : Infinity

  return {
    schemaVersion: 1,
    generatedAt: new Date().toISOString(),
    sourcePeriod: raw?.sourcePeriod ?? raw?.source_period ?? null,
    observationDays,
    totalClicks,
    sampleAdequacy: {
      enoughForPromotion: totalClicks >= 30,
      enoughForDemotion,
      demotionRule: 'At least 28 observation days and 100 primary-navigation clicks are required before a zero-click destination is labeled a demotion candidate.',
    },
    rankedDestinations: ranked,
    promoteCandidates: totalClicks >= 30
      ? ranked.filter((row) => row.inCurrentNavigation && row.clicks >= promoteThreshold && row.clicks > 0).slice(0, 5)
      : [],
    demoteCandidates: enoughForDemotion
      ? ranked.filter((row) => row.inCurrentNavigation && row.clicks === 0)
      : [],
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
  const rawText = await readText(input)
  const navSource = await fs.readFile(NAV_SOURCE, 'utf8')

  let raw = { events: [], observationDays: 0 }
  if (rawText) {
    if (input.toLowerCase().endsWith('.csv')) raw = { events: parseCsv(rawText), observationDays: Number(arg('--observation-days', 0)) || 0 }
    else raw = JSON.parse(rawText)
  }

  const report = buildNavigationClickReport(raw, navSource)
  await fs.mkdir(path.dirname(output), { recursive: true })
  await fs.writeFile(output, `${JSON.stringify(report, null, 2)}\n`)
  console.log(`Navigation click report: ${report.totalClicks} clicks across ${report.rankedDestinations.length} destinations → ${output}`)
  if (!rawText) console.log(`No click export found at ${input}; wrote a zero-observation baseline without promotion/demotion recommendations.`)
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack : error)
  process.exitCode = 1
})
