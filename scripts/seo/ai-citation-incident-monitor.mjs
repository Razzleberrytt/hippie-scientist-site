#!/usr/bin/env node

import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import path from 'node:path'

import { REPORTS_DIR, ROOT } from '../lib/profile-corpus.mjs'
import { isCorruptedAiVisibilityDate } from './ai-visibility-anomaly.mjs'
import {
  assessSearchConsoleStability,
  buildAiDailySeries,
  buildSearchConsoleDailySeries,
  classifyCitationIncident,
  detectAiCitationIncidents,
} from './ai-citation-incident-lib.mjs'

const argv = process.argv.slice(2)
const flag = (name, fallback) => {
  const hit = argv.find(arg => arg === `--${name}` || arg.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const AI_INPUT_DIR = path.resolve(ROOT, String(flag('dir', 'data-sources/ai-performance')))
const SEARCH_CONSOLE_PATH = path.resolve(ROOT, String(flag('search-console', 'data-sources/search-console/pages-by-date.csv')))
const JSON_PATH = path.join(REPORTS_DIR, 'ai-citation-incident.json')
const MD_PATH = path.join(REPORTS_DIR, 'ai-citation-incident.md')
const INCIDENT_DIR = path.join(ROOT, 'ops', 'ai-citations', 'incidents')
const LAG_DAYS = Number(flag('lag-days', 2))
const LOOKBACK_DAYS = Number(flag('lookback-days', 7))
const NOW = String(flag('now', new Date().toISOString().slice(0, 10)))

function readJson(filePath, fallback = null) {
  if (!existsSync(filePath)) return fallback
  try {
    return JSON.parse(readFileSync(filePath, 'utf8'))
  } catch {
    return fallback
  }
}

function extractArray(value) {
  if (Array.isArray(value)) return value
  if (!value || typeof value !== 'object') return []
  return Object.values(value).find(Array.isArray) ?? []
}

function loadAiFiles() {
  if (!existsSync(AI_INPUT_DIR)) return []
  return readdirSync(AI_INPUT_DIR)
    .filter(file => /\.csv$/i.test(file))
    .sort()
    .map(name => ({ name, content: readFileSync(path.join(AI_INPUT_DIR, name), 'utf8') }))
}

function countPublishedProfiles() {
  const files = [
    path.join(ROOT, 'public', 'data', 'summary-indexes', 'herbs-summary.json'),
    path.join(ROOT, 'public', 'data', 'summary-indexes', 'compounds-summary.json'),
  ]
  const records = files.flatMap(file => extractArray(readJson(file, [])))
  const published = records.filter(record => String(record?.indexability_status ?? '').toUpperCase() === 'PUBLISH')
  return { totalProfiles: records.length, publishedProfiles: published.length }
}

function collectTechnicalHealth() {
  const profiles = countPublishedProfiles()
  const routeManifestPath = path.join(ROOT, 'public', 'data', 'runtime-manifests', 'route-manifest.json')
  const routeManifest = extractArray(readJson(routeManifestPath, []))
  const redirectsPath = path.join(ROOT, 'public', '_redirects')
  const redirectRules = existsSync(redirectsPath)
    ? readFileSync(redirectsPath, 'utf8').split(/\r?\n/).filter(line => line.trim() && !line.trim().startsWith('#')).length
    : 0

  const checks = {
    corpusPresent: profiles.totalProfiles >= 400,
    publishedPopulationPresent: profiles.publishedProfiles >= 200,
    routeManifestPresent: routeManifest.length >= 250,
    redirectSurfacePresent: redirectRules >= 20,
  }
  const failedChecks = Object.entries(checks).filter(([, pass]) => !pass).map(([name]) => name)

  return {
    healthy: failedChecks.length === 0,
    ...profiles,
    routeCount: routeManifest.length,
    redirectRules,
    checks,
    failedChecks,
    note: 'These are catastrophic-regression sanity checks, not proof that every URL is healthy.',
  }
}

const SENSITIVE_PATH_RE = /^(?:app\/(?:sitemap|robots)\.|public\/(?:_redirects|robots\.txt)|lib\/deprecated-|scripts\/seo\/(?:indexnow|search-index|index-quality)|public\/data\/(?:summary-indexes|runtime-manifests)\/)/

function collectChangeSignals(startDate, endDate) {
  if (!startDate || !endDate) return { available: false, reason: 'missing-date-window', sensitiveFileCount: 0, sensitiveFiles: [] }
  try {
    const count = Number(execFileSync('git', ['rev-list', '--count', 'HEAD'], { cwd: ROOT, encoding: 'utf8' }).trim())
    const output = execFileSync(
      'git',
      ['log', '--format=', '--name-only', `--since=${startDate}T00:00:00Z`, `--until=${endDate}T23:59:59Z`, 'HEAD'],
      { cwd: ROOT, encoding: 'utf8' },
    )
    const files = [...new Set(output.split(/\r?\n/).map(line => line.trim()).filter(Boolean))].sort()
    const sensitiveFiles = files.filter(file => SENSITIVE_PATH_RE.test(file))
    const shallowPath = path.join(ROOT, '.git', 'shallow')
    return {
      available: true,
      historyCommitsVisible: count,
      historyLikelyShallow: existsSync(shallowPath),
      changedFileCount: files.length,
      sensitiveFileCount: sensitiveFiles.length,
      sensitiveFiles: sensitiveFiles.slice(0, 50),
    }
  } catch (error) {
    return { available: false, reason: error.message, sensitiveFileCount: 0, sensitiveFiles: [] }
  }
}

function temperDiagnosisForHistory(diagnosis, changes) {
  if (
    diagnosis?.classification === 'probable-bing-ai-reporting-or-grounding-event'
    && diagnosis.confidence === 'high'
    && (changes?.historyLikelyShallow || changes?.available === false)
  ) {
    return {
      ...diagnosis,
      confidence: 'medium',
      confidenceNote: changes?.historyLikelyShallow
        ? 'Repository history is shallow, so the no-sensitive-change cross-check is incomplete.'
        : 'Repository change history was unavailable, so the no-sensitive-change cross-check is incomplete.',
    }
  }
  return diagnosis
}

function writeReports(report) {
  mkdirSync(REPORTS_DIR, { recursive: true })
  writeFileSync(JSON_PATH, `${JSON.stringify(report, null, 2)}\n`)
  writeFileSync(MD_PATH, renderMarkdown(report))

  if (report.incident?.status === 'incident' && report.incident.incidentDate) {
    mkdirSync(INCIDENT_DIR, { recursive: true })
    const incidentPath = path.join(INCIDENT_DIR, `${report.incident.incidentDate}.json`)
    writeFileSync(incidentPath, `${JSON.stringify(report, null, 2)}\n`)
  }
}

function renderPct(value) {
  return Number.isFinite(value) ? `${value.toFixed(1)}%` : '—'
}

function renderMarkdown(report) {
  const lines = [
    '# Bing AI citation incident monitor',
    '',
    `Generated ${report.generatedAt}.`,
    '',
  ]

  if (!report.dataFeed?.available) {
    lines.push(
      '## Status: waiting for Bing AI Performance data',
      '',
      `No usable dated AI Performance series was found in \`${report.inputDir}/\`.`,
      'Export Bing Webmaster Tools → AI Performance CSVs into that directory; the monitor will select one dated source without double-counting overlapping exports.',
      '',
      'Technical sanity checks still ran:',
      `- Published profiles: ${report.technical.publishedProfiles}/${report.technical.totalProfiles}`,
      `- Route manifest entries: ${report.technical.routeCount}`,
      `- Redirect rules: ${report.technical.redirectRules}`,
      '',
    )
    return `${lines.join('\n')}\n`
  }

  const incident = report.incident
  lines.push(
    `**Classification:** ${report.diagnosis.classification} (${report.diagnosis.confidence} confidence)`,
    '',
    `AI source: \`${report.dataFeed.sourceFile}\` (${report.dataFeed.kind}) · ${report.dataFeed.days} dated rows · ${report.dataFeed.cleanMatureDays} mature clean days.`,
    `Scanned mature dates: ${report.scan?.evaluatedDays ?? 0}; detected full incidents: ${report.scan?.incidentCount ?? 0}.`,
    '',
  )

  if (report.diagnosis.confidenceNote) {
    lines.push(`> Confidence note: ${report.diagnosis.confidenceNote}`, '')
  }

  if (incident?.current) {
    lines.push(
      '## AI signal',
      '',
      `- Evaluated date: **${incident.incidentDate}** (within the mature dates older than the ${report.policy.processingLagDays}-day processing guard).`,
      `- Citations: ${incident.current.citations} vs trailing median ${incident.baseline?.citations ?? '—'} → **${renderPct(incident.changes?.citationDropPct)} drop**.`,
      `- Cited-page breadth: ${incident.current.citedPages ?? '—'} vs trailing median ${incident.baseline?.citedPages ?? '—'} → **${renderPct(incident.changes?.breadthDropPct)} drop**.`,
      `- Detector state: **${incident.status}**${incident.severity && incident.severity !== 'none' ? ` / ${incident.severity}` : ''}.`,
      '',
    )
  } else {
    lines.push('## AI signal', '', `Detector state: **${incident?.status ?? 'unknown'}** (${incident?.reason ?? 'no reason supplied'}).`, '')
  }

  lines.push(
    '## Cross-checks',
    '',
    `- Google Search Console: **${report.searchConsole.status}**${report.searchConsole.changes ? ` · impressions ${renderPct(report.searchConsole.changes.impressionDropPct)} drop · clicks ${renderPct(report.searchConsole.changes.clickDropPct)} drop` : ''}.`,
    `- Repository technical sanity: **${report.technical.healthy ? 'healthy' : 'attention required'}** · ${report.technical.publishedProfiles} published profiles · ${report.technical.routeCount} manifest routes · ${report.technical.redirectRules} redirect rules.`,
    `- SEO-sensitive files changed in the diagnostic window: **${report.repositoryChanges.sensitiveFileCount ?? 0}**${report.repositoryChanges.historyLikelyShallow ? ' (git history is shallow, so treat this as incomplete)' : ''}.`,
    '',
  )

  if (report.repositoryChanges.sensitiveFiles?.length) {
    lines.push('Sensitive files touched:', ...report.repositoryChanges.sensitiveFiles.slice(0, 12).map(file => `- \`${file}\``), '')
  }

  lines.push(
    '## Response policy',
    '',
    `**Recommended action:** ${report.diagnosis.action}.`,
    '',
    '- Do **not** mass-resubmit the whole site to IndexNow merely because AI citations fell.',
    '- If technical/indexability checks fail, fix the underlying site issue first; normal deploy-time IndexNow will notify only changed URLs.',
    '- If search visibility and technical health remain stable while AI citations and cited-page breadth collapse together, preserve the site and observe the next finalized Bing reporting window before making broad SEO changes.',
    '- Known corrupted AI reporting dates are excluded before the detector computes baselines.',
    '- The monitor scans multiple mature dates so a cliff that recovers before the next operator run is still surfaced.',
    '',
  )

  return `${lines.join('\n')}\n`
}

function main() {
  const aiFiles = loadAiFiles()
  const selected = buildAiDailySeries(aiFiles)
  const technical = collectTechnicalHealth()

  if (!selected) {
    const report = {
      generatedAt: new Date().toISOString(),
      inputDir: path.relative(ROOT, AI_INPUT_DIR),
      dataFeed: { available: false, csvFilesFound: aiFiles.length },
      incident: { status: 'insufficient-data', reason: aiFiles.length ? 'no-usable-dated-ai-series' : 'no-ai-csv-files' },
      scan: { evaluatedDays: 0, incidentCount: 0 },
      searchConsole: { status: 'unavailable', reason: 'no-ai-incident-date' },
      technical,
      repositoryChanges: { available: false, reason: 'no-ai-incident-date', sensitiveFileCount: 0, sensitiveFiles: [] },
      diagnosis: { classification: 'insufficient-evidence', confidence: 'low', action: 'collect-more-data' },
      policy: {
        processingLagDays: LAG_DAYS,
        lookbackDays: LOOKBACK_DAYS,
        citationDropThresholdPct: 50,
        citedPageDropThresholdPct: 35,
        indexNow: 'selective-changed-urls-only; never mass-resubmit solely because the AI dashboard dipped',
      },
    }
    writeReports(report)
    console.log('[ai-incident] no usable dated Bing AI Performance series; wrote a waiting-state report')
    return
  }

  const scan = detectAiCitationIncidents(selected.series, {
    now: NOW,
    lagDays: LAG_DAYS,
    lookbackDays: LOOKBACK_DAYS,
    isExcludedDate: isCorruptedAiVisibilityDate,
  })
  const incident = scan.mostRecentIncident ?? scan.latest ?? {
    status: scan.status,
    reason: scan.reason ?? 'no-evaluable-mature-date',
  }

  const searchSeries = existsSync(SEARCH_CONSOLE_PATH)
    ? buildSearchConsoleDailySeries(readFileSync(SEARCH_CONSOLE_PATH, 'utf8'))
    : []
  const searchConsole = assessSearchConsoleStability(searchSeries, incident.incidentDate, { lookbackDays: LOOKBACK_DAYS })
  const baselineStart = incident.baseline?.dates?.[0] ?? incident.incidentDate
  const repositoryChanges = collectChangeSignals(baselineStart, incident.incidentDate)
  const baseDiagnosis = classifyCitationIncident({ incident, search: searchConsole, technical, changes: repositoryChanges })
  const diagnosis = temperDiagnosisForHistory(baseDiagnosis, repositoryChanges)

  const cleanMatureDays = incident.incidentDate
    ? selected.series.filter(row => row.date <= incident.incidentDate && !isCorruptedAiVisibilityDate(row.date)).length
    : 0
  const report = {
    generatedAt: new Date().toISOString(),
    inputDir: path.relative(ROOT, AI_INPUT_DIR),
    dataFeed: {
      available: true,
      sourceFile: selected.sourceFile,
      kind: selected.kind,
      days: selected.series.length,
      cleanMatureDays,
      alternativesIgnoredToPreventDoubleCounting: Math.max(0, aiFiles.length - 1),
    },
    scan: {
      status: scan.status,
      evaluatedDays: scan.evaluatedDays ?? scan.evaluations?.length ?? 0,
      incidentCount: scan.incidents?.length ?? 0,
      citationDropCount: scan.citationDrops?.length ?? 0,
      mostRecentIncidentDate: scan.mostRecentIncident?.incidentDate ?? null,
      latestEvaluatedDate: scan.latest?.incidentDate ?? null,
    },
    incident,
    searchConsole,
    technical,
    repositoryChanges,
    diagnosis,
    dailySeries: selected.series,
    policy: {
      processingLagDays: LAG_DAYS,
      lookbackDays: LOOKBACK_DAYS,
      citationDropThresholdPct: 50,
      citedPageDropThresholdPct: 35,
      minimumBaselineCitations: 100,
      minimumBaselineCitedPages: 10,
      knownReportingAnomaliesExcluded: ['2026-08-13..2026-08-17'],
      indexNow: 'selective-changed-urls-only; never mass-resubmit solely because the AI dashboard dipped',
    },
  }

  writeReports(report)

  const message = `[ai-incident] ${diagnosis.classification}: ${incident.status}${incident.incidentDate ? ` on ${incident.incidentDate}` : ''}`
  if (incident.status === 'incident') console.log(`::warning::${message}`)
  else console.log(message)
}

main()
