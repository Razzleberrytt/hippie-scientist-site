#!/usr/bin/env node
/**
 * Rank content decay by scientific freshness + organic/revenue recovery value.
 * Input is a joined signal export so Search Console, product, citation and
 * research-intake data can all contribute without hard-coupling this script to
 * one provider.
 */
import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const inputPath = path.resolve(process.argv[2] || 'data/maintenance/content-decay-signals.json')
const outPath = path.resolve(process.env.CONTENT_DECAY_REPORT || 'reports/content-decay.json')

function readJson(file, fallback) {
  try { return JSON.parse(fs.readFileSync(file, 'utf8')) } catch { return fallback }
}
function n(value, fallback = 0) {
  const valueNumber = Number(value)
  return Number.isFinite(valueNumber) ? valueNumber : fallback
}
function clamp(value, min = 0, max = 100) { return Math.max(min, Math.min(max, value)) }
function normalizeUrl(value) {
  try {
    const url = new URL(String(value), 'https://thehippiescientist.net')
    if (url.hostname !== 'thehippiescientist.net') return ''
    const pathname = url.pathname.replace(/\/+/g, '/')
    return pathname === '/' || pathname.endsWith('/') ? pathname : `${pathname}/`
  } catch { return '' }
}
function scoreRow(raw) {
  const url = normalizeUrl(raw.url)
  const newResearch = clamp(n(raw.newResearchCount) * 8, 0, 24)
  const evidenceAge = clamp(n(raw.daysSinceEvidenceSearch) / 365 * 12, 0, 18)
  const citationAge = clamp(Math.max(0, n(raw.avgCitationAgeDays) - 730) / 365 * 6, 0, 15)

  const currentPosition = n(raw.positionCurrent, 100)
  const previousPosition = n(raw.positionPrevious, currentPosition)
  const rankLoss = clamp(Math.max(0, currentPosition - previousPosition) * 2.5, 0, 25)

  const currentClicks = n(raw.clicks28)
  const previousClicks = n(raw.clicksPrevious28, currentClicks)
  const clickLossPct = previousClicks > 0 ? Math.max(0, (previousClicks - currentClicks) / previousClicks) : 0
  const clickLoss = clamp(clickLossPct * 18, 0, 18)

  const impressions = n(raw.impressions28)
  const nearPageOne = currentPosition >= 4 && currentPosition <= 20 ? 1 : currentPosition > 20 && currentPosition <= 40 ? 0.5 : 0.2
  const organicRecovery = clamp(Math.log10(Math.max(1, impressions)) * 5 * nearPageOne, 0, 20)
  const revenueRecovery = clamp(Math.log10(Math.max(1, n(raw.revenue28) + 1)) * 5, 0, 10)
  const productChange = raw.productChanged === true ? 10 : 0
  const priorityBoost = clamp(n(raw.priorityBoost), 0, 10)

  const decayScore = clamp(
    newResearch + evidenceAge + citationAge + rankLoss + clickLoss + productChange,
    0,
    100,
  )
  const recoveryValue = clamp(organicRecovery + revenueRecovery + priorityBoost, 0, 40)
  const updatePriority = Number(clamp(decayScore * 0.7 + recoveryValue * 0.75, 0, 100).toFixed(1))

  const reasons = []
  if (n(raw.newResearchCount) > 0) reasons.push(`${n(raw.newResearchCount)} new research signal(s)`)
  if (n(raw.daysSinceEvidenceSearch) >= 365) reasons.push(`${Math.round(n(raw.daysSinceEvidenceSearch))} days since evidence search`)
  if (n(raw.avgCitationAgeDays) >= 1095) reasons.push(`older citation set (~${Math.round(n(raw.avgCitationAgeDays) / 365)} years average)`)
  if (currentPosition - previousPosition >= 2) reasons.push(`average position fell ${Number((currentPosition - previousPosition).toFixed(1))}`)
  if (clickLossPct >= 0.2) reasons.push(`clicks down ${Math.round(clickLossPct * 100)}% vs prior 28 days`)
  if (raw.productChanged === true) reasons.push('linked/reviewed product information changed')
  if (!reasons.length) reasons.push('routine decay review')

  return {
    url,
    updatePriority,
    decayScore: Number(decayScore.toFixed(1)),
    recoveryValue: Number(recoveryValue.toFixed(1)),
    reasons,
    gsc: {
      impressions28: impressions,
      clicks28: currentClicks,
      clicksPrevious28: previousClicks,
      positionCurrent: currentPosition,
      positionPrevious: previousPosition,
      ctrCurrent: n(raw.ctrCurrent),
      ctrPrevious: n(raw.ctrPrevious),
    },
    revenue28: n(raw.revenue28),
    newResearchCount: n(raw.newResearchCount),
    daysSinceEvidenceSearch: n(raw.daysSinceEvidenceSearch),
    avgCitationAgeDays: n(raw.avgCitationAgeDays),
    productChanged: raw.productChanged === true,
    queryOpportunities: Array.isArray(raw.queryOpportunities)
      ? raw.queryOpportunities
          .map((q) => ({ query: String(q.query || '').trim(), impressions: n(q.impressions), position: n(q.position), ctr: n(q.ctr) }))
          .filter((q) => q.query)
          .sort((a, b) => b.impressions - a.impressions)
          .slice(0, 10)
      : [],
  }
}

const input = readJson(inputPath, { rows: [] })
if (!Array.isArray(input.rows)) throw new Error('content decay input must contain rows[]')
const rows = input.rows.map(scoreRow).filter((row) => row.url).sort((a, b) => b.updatePriority - a.updatePriority)
const report = {
  generatedAt: new Date().toISOString(),
  sourceGeneratedAt: input.generatedAt || null,
  pageCount: rows.length,
  urgent: rows.filter((row) => row.updatePriority >= 70).length,
  high: rows.filter((row) => row.updatePriority >= 50 && row.updatePriority < 70).length,
  methodology: {
    decaySignals: ['new research', 'time since evidence search', 'citation age', 'ranking loss', 'click loss', 'product change'],
    recoverySignals: ['Search Console impressions', 'near-page-one position', 'revenue', 'explicit priority boost'],
    priorityFormula: '0.70 × decayScore + 0.75 × recoveryValue, capped at 100',
  },
  pages: rows,
}
fs.mkdirSync(path.dirname(outPath), { recursive: true })
fs.writeFileSync(outPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`[content-decay] ranked ${rows.length} URLs; urgent=${report.urgent}, high=${report.high}`)
if (rows[0]) console.log(`[content-decay] next update: ${rows[0].url} (${rows[0].updatePriority}) — ${rows[0].reasons.join('; ')}`)
console.log(`[content-decay] report: ${path.relative(root, outPath)}`)
