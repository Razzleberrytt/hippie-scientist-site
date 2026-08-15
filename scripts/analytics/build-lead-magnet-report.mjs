#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const inputPath = process.argv[2] || path.join(root, 'ops', 'analytics', 'lead-magnet-events.json')
const outputPath = process.argv[3] || path.join(root, 'reports', 'lead-magnet-conversion.json')

const raw = fs.existsSync(inputPath) ? JSON.parse(fs.readFileSync(inputPath, 'utf8')) : []
const events = Array.isArray(raw) ? raw : Array.isArray(raw.events) ? raw.events : []
const byOffer = new Map()

for (const event of events) {
  const name = String(event.name || event.event || '')
  if (!['lead_magnet_impression', 'lead_magnet_signup_attempt', 'lead_magnet_signup_success'].includes(name)) continue
  const payload = event.payload || event
  const slug = String(payload.lead_magnet_slug || payload.slug || '').trim()
  if (!slug) continue
  const row = byOffer.get(slug) || { slug, impressions: 0, attempts: 0, successes: 0, placements: {}, sourcePaths: {} }
  if (name === 'lead_magnet_impression') row.impressions += 1
  if (name === 'lead_magnet_signup_attempt') row.attempts += 1
  if (name === 'lead_magnet_signup_success') row.successes += 1
  const placement = String(payload.placement || 'unknown')
  const sourcePath = String(payload.source_path || 'unknown')
  row.placements[placement] = (row.placements[placement] || 0) + 1
  row.sourcePaths[sourcePath] = (row.sourcePaths[sourcePath] || 0) + 1
  byOffer.set(slug, row)
}

const offers = Array.from(byOffer.values()).map((row) => ({
  ...row,
  submitRate: row.impressions ? row.attempts / row.impressions : null,
  confirmedSuccessRate: row.impressions ? row.successes / row.impressions : null,
  completionRateAfterSubmit: row.attempts ? row.successes / row.attempts : null,
})).sort((a, b) => (b.confirmedSuccessRate ?? -1) - (a.confirmedSuccessRate ?? -1) || b.impressions - a.impressions)

const report = {
  generatedAt: new Date().toISOString(),
  inputPath,
  definitions: {
    submitRate: 'signup attempts / qualified offer impressions',
    confirmedSuccessRate: 'successful subscribe responses / qualified offer impressions',
    completionRateAfterSubmit: 'successful subscribe responses / signup attempts',
  },
  offers,
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Wrote lead magnet conversion report for ${offers.length} offer(s) to ${outputPath}`)
