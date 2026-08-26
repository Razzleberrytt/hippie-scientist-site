const DATE_ALIASES = ['date', 'day']
const CITATION_ALIASES = ['citations', 'ai citations', 'citation count', 'total citations', 'references', 'ai impressions', 'impressions']
const CITED_PAGE_ALIASES = ['cited pages', 'cited urls', 'pages cited', 'unique cited pages', 'unique cited urls', 'cited page count']
const URL_ALIASES = ['url', 'page', 'address', 'landing page', 'cited url']
const QUERY_ALIASES = ['query', 'grounding query', 'grounding queries', 'search query', 'keyword']
const CLICK_ALIASES = ['clicks', 'url clicks', 'ai clicks']
const SEARCH_IMPRESSION_ALIASES = ['impressions', 'search impressions']

export function parseCsv(content) {
  const rows = []
  let row = []
  let field = ''
  let quoted = false

  for (let i = 0; i < content.length; i += 1) {
    const char = content[i]
    if (quoted) {
      if (char === '"') {
        if (content[i + 1] === '"') {
          field += '"'
          i += 1
        } else quoted = false
      } else field += char
      continue
    }

    if (char === '"') quoted = true
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

  if (field.length || row.length) {
    row.push(field)
    rows.push(row)
  }
  if (rows.length && rows[0].length) rows[0][0] = rows[0][0].replace(/^\uFEFF/, '')
  return rows.filter(cells => cells.some(cell => String(cell).trim() !== ''))
}

export function normalizeDate(value) {
  const match = String(value ?? '').trim().match(/^(\d{4}-\d{2}-\d{2})(?:$|[T\s])/)
  return match?.[1] || ''
}

export function toNumber(value) {
  const parsed = Number.parseFloat(String(value ?? '').replace(/[,%\s]/g, ''))
  return Number.isFinite(parsed) ? parsed : 0
}

export function median(values) {
  const sorted = values.filter(Number.isFinite).sort((a, b) => a - b)
  if (!sorted.length) return null
  const mid = Math.floor(sorted.length / 2)
  return sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2
}

export function pctDrop(current, baseline) {
  if (!Number.isFinite(current) || !Number.isFinite(baseline) || baseline <= 0) return null
  return Number((((baseline - current) / baseline) * 100).toFixed(1))
}

function headerIndex(header, aliases) {
  const normalized = header.map(cell => String(cell).trim().toLowerCase())
  return normalized.findIndex(cell => aliases.includes(cell))
}

function normalizeUrl(value) {
  const raw = String(value ?? '').trim()
  if (!raw) return ''
  try {
    const parsed = raw.startsWith('http') ? new URL(raw) : new URL(raw, 'https://thehippiescientist.net')
    return `${parsed.pathname.replace(/\/+$/, '') || '/'}/`.replace('//', '/')
  } catch {
    return raw
  }
}

function aiCandidateFromFile(file) {
  const parsed = parseCsv(file.content)
  if (parsed.length < 2) return null
  const [header, ...dataRows] = parsed

  const dateIndex = headerIndex(header, DATE_ALIASES)
  const citationIndex = headerIndex(header, CITATION_ALIASES)
  if (dateIndex < 0 || citationIndex < 0) return null

  const citedPageIndex = headerIndex(header, CITED_PAGE_ALIASES)
  const urlIndex = headerIndex(header, URL_ALIASES)
  const queryIndex = headerIndex(header, QUERY_ALIASES)
  const byDate = new Map()

  for (const cells of dataRows) {
    const date = normalizeDate(cells[dateIndex])
    if (!date) continue
    if (!byDate.has(date)) {
      byDate.set(date, {
        date,
        citations: 0,
        reportedCitedPages: null,
        urls: new Set(),
        rows: 0,
      })
    }
    const entry = byDate.get(date)
    entry.citations += toNumber(cells[citationIndex])
    entry.rows += 1

    if (citedPageIndex >= 0) {
      const value = toNumber(cells[citedPageIndex])
      entry.reportedCitedPages = entry.reportedCitedPages === null
        ? value
        : Math.max(entry.reportedCitedPages, value)
    }
    if (urlIndex >= 0) {
      const url = normalizeUrl(cells[urlIndex])
      if (url) entry.urls.add(url)
    }
  }

  const series = [...byDate.values()]
    .map(entry => ({
      date: entry.date,
      citations: entry.citations,
      citedPages: entry.reportedCitedPages !== null
        ? entry.reportedCitedPages
        : (entry.urls.size ? entry.urls.size : null),
      rowCount: entry.rows,
    }))
    .sort((a, b) => a.date.localeCompare(b.date))

  if (!series.length) return null

  const kind = urlIndex >= 0 ? 'page' : queryIndex >= 0 ? 'query' : 'overview'
  let score = kind === 'overview' ? 90 : kind === 'page' ? 70 : 30
  if (citedPageIndex >= 0) score += 20
  if (series.some(row => Number.isFinite(row.citedPages))) score += 10
  score += Math.min(series.length, 30) / 10

  return {
    sourceFile: file.name,
    kind,
    score,
    series,
    hasReportedCitedPages: citedPageIndex >= 0,
  }
}

/**
 * Bing exports several views of the same AI Performance dataset. We deliberately
 * select one dated source instead of adding all CSVs together, which would
 * double-count the same citations. Overview-by-date wins; page-by-date is the
 * fallback because it can reconstruct unique cited-page breadth.
 */
export function buildAiDailySeries(files) {
  const candidates = files
    .map(aiCandidateFromFile)
    .filter(Boolean)
    .sort((a, b) => {
      if (b.score !== a.score) return b.score - a.score
      const latestA = a.series.at(-1)?.date || ''
      const latestB = b.series.at(-1)?.date || ''
      if (latestA !== latestB) return latestB.localeCompare(latestA)
      return b.series.length - a.series.length
    })

  return candidates[0] ?? null
}

export function matureAiSeries(series, { now = new Date(), lagDays = 2, isExcludedDate = () => false } = {}) {
  const nowDate = now instanceof Date ? now : new Date(`${now}T12:00:00Z`)
  const cutoff = new Date(Date.UTC(nowDate.getUTCFullYear(), nowDate.getUTCMonth(), nowDate.getUTCDate()))
  cutoff.setUTCDate(cutoff.getUTCDate() - Math.max(0, lagDays))
  const cutoffDate = cutoff.toISOString().slice(0, 10)

  return series.filter(row => row.date <= cutoffDate && !isExcludedDate(row.date))
}

export function detectAiCitationIncident(series, {
  now = new Date(),
  lagDays = 2,
  lookbackDays = 7,
  minBaselineDays = 3,
  citationDropThresholdPct = 50,
  breadthDropThresholdPct = 35,
  minBaselineCitations = 100,
  minBaselinePages = 10,
  isExcludedDate = () => false,
} = {}) {
  const mature = matureAiSeries(series, { now, lagDays, isExcludedDate })
  if (mature.length < minBaselineDays + 1) {
    return { status: 'insufficient-data', reason: 'not-enough-mature-clean-days', matureDays: mature.length }
  }

  const current = mature.at(-1)
  const baselineRows = mature.slice(Math.max(0, mature.length - 1 - lookbackDays), -1)
  if (baselineRows.length < minBaselineDays) {
    return { status: 'insufficient-data', reason: 'not-enough-baseline-days', matureDays: mature.length }
  }

  const baselineCitations = median(baselineRows.map(row => row.citations))
  const pageValues = baselineRows.map(row => row.citedPages).filter(Number.isFinite)
  const baselinePages = pageValues.length >= minBaselineDays ? median(pageValues) : null
  const citationDropPct = pctDrop(current.citations, baselineCitations)
  const breadthDropPct = Number.isFinite(current.citedPages) && Number.isFinite(baselinePages)
    ? pctDrop(current.citedPages, baselinePages)
    : null

  if ((baselineCitations ?? 0) < minBaselineCitations) {
    return {
      status: 'insufficient-data',
      reason: 'baseline-too-small',
      current,
      baseline: { citations: baselineCitations, citedPages: baselinePages, dates: baselineRows.map(row => row.date) },
    }
  }

  const citationTriggered = citationDropPct !== null && citationDropPct >= citationDropThresholdPct
  const breadthAvailable = breadthDropPct !== null && (baselinePages ?? 0) >= minBaselinePages
  const breadthTriggered = breadthAvailable && breadthDropPct >= breadthDropThresholdPct

  let status = 'healthy'
  if (citationTriggered && breadthTriggered) status = 'incident'
  else if (citationTriggered) status = 'citation-drop-only'

  const severity = status === 'incident'
    ? (citationDropPct >= 70 && breadthDropPct >= 50 ? 'critical' : 'high')
    : status === 'citation-drop-only' ? 'medium' : 'none'

  return {
    status,
    severity,
    incidentDate: current.date,
    current,
    baseline: {
      citations: baselineCitations,
      citedPages: baselinePages,
      dates: baselineRows.map(row => row.date),
      days: baselineRows.length,
    },
    changes: {
      citationDropPct,
      breadthDropPct,
    },
    thresholds: {
      citationDropThresholdPct,
      breadthDropThresholdPct,
      lagDays,
      lookbackDays,
    },
    signals: {
      citationTriggered,
      breadthAvailable,
      breadthTriggered,
    },
  }
}

export function buildSearchConsoleDailySeries(content) {
  if (!content) return []
  const parsed = parseCsv(content)
  if (parsed.length < 2) return []
  const [header, ...dataRows] = parsed
  const dateIndex = headerIndex(header, DATE_ALIASES)
  const clickIndex = headerIndex(header, CLICK_ALIASES)
  const impressionIndex = headerIndex(header, SEARCH_IMPRESSION_ALIASES)
  if (dateIndex < 0 || (clickIndex < 0 && impressionIndex < 0)) return []

  const byDate = new Map()
  for (const cells of dataRows) {
    const date = normalizeDate(cells[dateIndex])
    if (!date) continue
    if (!byDate.has(date)) byDate.set(date, { date, clicks: 0, impressions: 0 })
    const entry = byDate.get(date)
    if (clickIndex >= 0) entry.clicks += toNumber(cells[clickIndex])
    if (impressionIndex >= 0) entry.impressions += toNumber(cells[impressionIndex])
  }
  return [...byDate.values()].sort((a, b) => a.date.localeCompare(b.date))
}

export function assessSearchConsoleStability(series, incidentDate, { lookbackDays = 7, minBaselineDays = 3 } = {}) {
  if (!series.length || !incidentDate) return { status: 'unavailable', reason: 'missing-search-console-series' }

  const eligible = series.filter(row => row.date <= incidentDate)
  if (!eligible.length) return { status: 'unavailable', reason: 'no-search-data-by-incident-date' }
  const current = eligible.at(-1)
  const distanceDays = Math.round((Date.parse(`${incidentDate}T00:00:00Z`) - Date.parse(`${current.date}T00:00:00Z`)) / 86400000)
  if (distanceDays > 1) return { status: 'unavailable', reason: 'search-data-too-stale', currentDate: current.date, incidentDate }

  const baselineRows = eligible.slice(Math.max(0, eligible.length - 1 - lookbackDays), -1)
  if (baselineRows.length < minBaselineDays) return { status: 'unavailable', reason: 'not-enough-search-baseline-days' }

  const baselineImpressions = median(baselineRows.map(row => row.impressions))
  const baselineClicks = median(baselineRows.map(row => row.clicks))
  const impressionDropPct = pctDrop(current.impressions, baselineImpressions)
  const clickDropPct = pctDrop(current.clicks, baselineClicks)

  let status = 'stable'
  if (impressionDropPct !== null && impressionDropPct >= 50) status = 'collapsed'
  else if (impressionDropPct !== null && impressionDropPct >= 30) status = 'soft-drop'

  return {
    status,
    current,
    baseline: { impressions: baselineImpressions, clicks: baselineClicks, days: baselineRows.length },
    changes: { impressionDropPct, clickDropPct },
  }
}

export function classifyCitationIncident({ incident, search, technical, changes }) {
  if (!incident || incident.status === 'insufficient-data') {
    return { classification: 'insufficient-evidence', confidence: 'low', action: 'collect-more-data' }
  }
  if (incident.status === 'healthy') {
    return { classification: 'no-incident', confidence: 'high', action: 'continue-monitoring' }
  }
  if (incident.status === 'citation-drop-only') {
    return { classification: 'citation-volatility-without-breadth-collapse', confidence: 'medium', action: 'observe-before-changing-site' }
  }

  if (technical?.healthy === false || search?.status === 'collapsed') {
    return {
      classification: 'possible-site-or-indexability-event',
      confidence: 'high',
      action: 'investigate-site-before-resubmission',
    }
  }

  const sensitiveChanges = Number(changes?.sensitiveFileCount ?? 0)
  if (technical?.healthy === true && search?.status === 'stable') {
    return {
      classification: 'probable-bing-ai-reporting-or-grounding-event',
      confidence: sensitiveChanges === 0 ? 'high' : 'medium',
      action: sensitiveChanges === 0 ? 'observe-and-avoid-destructive-seo-changes' : 'review-sensitive-changes-then-observe',
    }
  }

  if (technical?.healthy === true && ['unavailable', 'soft-drop'].includes(search?.status)) {
    return {
      classification: 'bing-ai-event-suspected',
      confidence: 'medium',
      action: 'observe-and-cross-check-next-finalized-search-window',
    }
  }

  return { classification: 'inconclusive-incident', confidence: 'low', action: 'collect-more-cross-checks' }
}
