#!/usr/bin/env node
/**
 * Rank pages that most need an editorial refresh by combining recent organic
 * performance deterioration with truthful scientific freshness metadata.
 *
 * Inputs are two Search Console `Pages.csv` exports representing adjacent
 * windows plus public/data/freshness-metadata.json. Template/build timestamps
 * are intentionally ignored: only explicit editorial/evidence/factual dates
 * are allowed to reduce scientific decay.
 */

import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const REPORTS_DIR = path.join(ROOT, 'ops', 'reports')
const argv = process.argv.slice(2)

function flag(name, fallback) {
  const hit = argv.find((arg) => arg.startsWith(`--${name}=`))
  return hit ? hit.slice(name.length + 3) : fallback
}

const CURRENT_DIR = path.resolve(ROOT, flag('current', 'data-sources/search-console-current'))
const PREVIOUS_DIR = path.resolve(ROOT, flag('previous', 'data-sources/search-console-previous'))
const FRESHNESS_PATH = path.resolve(ROOT, flag('freshness', 'public/data/freshness-metadata.json'))
const JSON_PATH = path.join(REPORTS_DIR, 'content-decay.json')
const MD_PATH = path.join(REPORTS_DIR, 'content-decay.md')

function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false
  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    if (quoted) {
      if (char === '"' && content[i + 1] === '"') {
        field += '"'
        i += 1
      } else if (char === '"') quoted = false
      else field += char
    } else if (char === '"') quoted = true
    else if (char === ',') {
      row.push(field)
      field = ''
    } else if (char === '\n') {
      row.push(field)
      rows.push(row)
      row = []
      field = ''
    } else if (char !== '\r') field += char
  }
  if (field || row.length) {
    row.push(field)
    rows.push(row)
  }
  return rows.filter((cells) => cells.some((cell) => String(cell).trim()))
}

function number(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[,%]/g, '').trim())
  return Number.isFinite(parsed) ? parsed : 0
}

function normalizeUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  try {
    const pathname = raw.startsWith('http') ? new URL(raw).pathname : raw
    if (pathname === '/') return '/'
    return pathname.endsWith('/') ? pathname : `${pathname}/`
  } catch {
    return raw
  }
}

function loadPages(dir) {
  const filePath = path.join(dir, 'Pages.csv')
  if (!existsSync(filePath)) throw new Error(`Missing ${path.relative(ROOT, filePath)}`)
  const rows = parseCsv(readFileSync(filePath, 'utf8'))
  if (rows.length < 2) return new Map()
  const header = rows[0].map((cell) => cell.trim().toLowerCase())
  const index = {
    page: header.findIndex((cell) => ['page', 'pages', 'url', 'landing page'].includes(cell)),
    clicks: header.indexOf('clicks'),
    impressions: header.indexOf('impressions'),
    ctr: header.indexOf('ctr'),
    position: header.findIndex((cell) => ['position', 'average position', 'avg position', 'avg. position'].includes(cell)),
  }
  if (index.page < 0 || index.impressions < 0) throw new Error(`Pages.csv lacks Page/Impressions columns in ${path.relative(ROOT, dir)}`)

  const result = new Map()
  for (const cells of rows.slice(1)) {
    const url = normalizeUrl(cells[index.page])
    if (!url) continue
    const impressions = number(cells[index.impressions])
    const ctrRaw = index.ctr >= 0 ? String(cells[index.ctr] ?? '') : ''
    const ctrNumber = number(ctrRaw)
    result.set(url, {
      clicks: index.clicks >= 0 ? number(cells[index.clicks]) : 0,
      impressions,
      ctr: ctrRaw.includes('%') || ctrNumber > 1 ? ctrNumber / 100 : ctrNumber,
      position: index.position >= 0 ? number(cells[index.position]) : 0,
    })
  }
  return result
}

function readJson(filePath, fallback = {}) {
  if (!existsSync(filePath)) return fallback
  return JSON.parse(readFileSync(filePath, 'utf8'))
}

function profileSlug(url) {
  const match = url.match(/^\/(?:herbs|compounds)\/([^/]+)\/$/)
  return match?.[1] || ''
}

function ageDays(value, now = Date.now()) {
  if (!value) return null
  const timestamp = Date.parse(value)
  if (!Number.isFinite(timestamp)) return null
  return Math.max(0, Math.floor((now - timestamp) / 86_400_000))
}

function scientificFreshness(profile) {
  if (!profile) return { scientificDate: '', ageDays: null, citationCount: null }
  const candidates = [profile.evidenceSearchDate, profile.lastReviewed, profile.factualUpdatedAt]
    .filter(Boolean)
    .sort((a, b) => Date.parse(b) - Date.parse(a))
  const scientificDate = candidates[0] || ''
  return {
    scientificDate,
    ageDays: ageDays(scientificDate),
    citationCount: Number.isFinite(Number(profile.citationCount)) ? Number(profile.citationCount) : null,
  }
}

function round(value, digits = 1) {
  return Number(Number(value || 0).toFixed(digits))
}

function scorePage(url, current, previous, freshnessProfile) {
  const reasons = []
  let score = 0
  const currentImpressions = current?.impressions || 0
  const previousImpressions = previous?.impressions || 0
  const positionDelta = current?.position && previous?.position ? current.position - previous.position : 0
  const impressionDelta = currentImpressions - previousImpressions
  const impressionDeltaPct = previousImpressions > 0 ? impressionDelta / previousImpressions : 0

  if (positionDelta >= 2 && previousImpressions >= 25) {
    const points = Math.min(35, Math.round(positionDelta * 4))
    score += points
    reasons.push(`average position fell ${round(positionDelta)} places`)
  }

  if (impressionDeltaPct <= -0.25 && previousImpressions >= 50) {
    const points = Math.min(25, Math.round(Math.abs(impressionDeltaPct) * 25))
    score += points
    reasons.push(`impressions fell ${Math.round(Math.abs(impressionDeltaPct) * 100)}%`)
  }

  if (!current && previousImpressions >= 100) {
    score += 25
    reasons.push('previously visible URL has no impressions in the current window')
  }

  const freshness = scientificFreshness(freshnessProfile)
  if (freshnessProfile) {
    if (freshness.ageDays === null) {
      score += 10
      reasons.push('no explicit evidence review/factual update date')
    } else if (freshness.ageDays >= 1095) {
      score += 30
      reasons.push(`scientific review/update is ${Math.floor(freshness.ageDays / 365)}+ years old`)
    } else if (freshness.ageDays >= 730) {
      score += 25
      reasons.push('scientific review/update is 2+ years old')
    } else if (freshness.ageDays >= 365) {
      score += 15
      reasons.push('scientific review/update is 1+ year old')
    }

    if (freshness.citationCount === 0) {
      score += 15
      reasons.push('profile has zero compiled citations')
    } else if (freshness.citationCount !== null && freshness.citationCount <= 2) {
      score += 8
      reasons.push(`profile has only ${freshness.citationCount} compiled citation${freshness.citationCount === 1 ? '' : 's'}`)
    }
  }

  score = Math.min(100, score)
  const trafficWeight = 1 + Math.log10(10 + Math.max(currentImpressions, previousImpressions)) / 2
  const recoveryPriority = round(score * trafficWeight, 2)

  return {
    url,
    decayScore: score,
    recoveryPriority,
    current: current ? {
      clicks: round(current.clicks, 0),
      impressions: round(current.impressions, 0),
      ctrPct: round(current.ctr * 100, 2),
      position: round(current.position),
    } : null,
    previous: previous ? {
      clicks: round(previous.clicks, 0),
      impressions: round(previous.impressions, 0),
      ctrPct: round(previous.ctr * 100, 2),
      position: round(previous.position),
    } : null,
    deltas: {
      impressions: round(impressionDelta, 0),
      impressionsPct: previousImpressions ? round(impressionDeltaPct * 100) : null,
      position: current?.position && previous?.position ? round(positionDelta) : null,
    },
    freshness,
    reasons,
  }
}

function renderMarkdown(report) {
  const rows = report.pages.slice(0, 50)
  return [
    '# Monthly content decay report',
    '',
    `Generated: ${report.generatedAt}`,
    '',
    `Pages evaluated: ${report.summary.pagesEvaluated}. Pages with decay signals: ${report.summary.pagesWithDecaySignals}.`,
    '',
    'Decay is prioritized by measured performance deterioration plus truthful editorial/evidence freshness and citation completeness. Build/template timestamps do not count as scientific freshness.',
    '',
    '| Priority | Score | URL | Impressions now | Δ impressions | Position now | Δ position | Why |',
    '| ---: | ---: | --- | ---: | ---: | ---: | ---: | --- |',
    ...rows.map((page) => `| ${page.recoveryPriority} | ${page.decayScore} | ${page.url} | ${page.current?.impressions ?? 0} | ${page.deltas.impressionsPct == null ? '—' : `${page.deltas.impressionsPct}%`} | ${page.current?.position ?? '—'} | ${page.deltas.position ?? '—'} | ${page.reasons.join('; ') || 'no material decay signal'} |`),
    '',
  ].join('\n')
}

function main() {
  const current = loadPages(CURRENT_DIR)
  const previous = loadPages(PREVIOUS_DIR)
  const freshness = readJson(FRESHNESS_PATH, {})
  const urls = new Set([...current.keys(), ...previous.keys()])
  const pages = [...urls].map((url) => {
    const slug = profileSlug(url)
    return scorePage(url, current.get(url), previous.get(url), slug ? freshness.profiles?.[slug] : null)
  })
    .filter((page) => page.decayScore > 0)
    .sort((a, b) => b.recoveryPriority - a.recoveryPriority || b.decayScore - a.decayScore)

  const report = {
    generatedAt: new Date().toISOString(),
    inputs: {
      current: path.relative(ROOT, CURRENT_DIR),
      previous: path.relative(ROOT, PREVIOUS_DIR),
      freshness: path.relative(ROOT, FRESHNESS_PATH),
    },
    summary: {
      pagesEvaluated: urls.size,
      pagesWithDecaySignals: pages.length,
      highDecayPages: pages.filter((page) => page.decayScore >= 50).length,
    },
    pages,
  }

  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))
  console.log(`[content-decay] evaluated=${urls.size} flagged=${pages.length} high=${report.summary.highDecayPages}`)
  console.log(`[content-decay] wrote ${path.relative(ROOT, JSON_PATH)} and ${path.relative(ROOT, MD_PATH)}`)
}

try {
  main()
} catch (error) {
  console.error(`[content-decay] ${error.message}`)
  process.exitCode = 1
}
