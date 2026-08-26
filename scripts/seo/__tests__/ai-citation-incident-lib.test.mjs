import { expect, test } from 'vitest'

import {
  assessSearchConsoleStability,
  buildAiDailySeries,
  buildSearchConsoleDailySeries,
  classifyCitationIncident,
  detectAiCitationIncident,
} from '../ai-citation-incident-lib.mjs'

const corrupted = date => date >= '2026-08-13' && date <= '2026-08-17'

test('selects one dated Bing export instead of double-counting overlapping views', () => {
  const files = [
    {
      name: 'overview.csv',
      content: 'Date,Citations,Cited Pages\n2026-08-20,748,54\n2026-08-21,197,25\n',
    },
    {
      name: 'pages.csv',
      content: 'Date,URL,Citations\n2026-08-20,https://thehippiescientist.net/herbs/a/,400\n2026-08-20,https://thehippiescientist.net/herbs/b/,348\n2026-08-21,https://thehippiescientist.net/herbs/a/,197\n',
    },
  ]

  const selected = buildAiDailySeries(files)
  expect(selected.sourceFile).toBe('overview.csv')
  expect(selected.kind).toBe('overview')
  expect(selected.series).toEqual([
    { date: '2026-08-20', citations: 748, citedPages: 54, rowCount: 1 },
    { date: '2026-08-21', citations: 197, citedPages: 25, rowCount: 1 },
  ])
})

test('accepts Bing overview-style Total Citations headers and quoted thousands', () => {
  const selected = buildAiDailySeries([
    {
      name: 'AIPerformanceOverviewStats.csv',
      content: 'Date,Total Citations,Cited Pages\n2026-08-20,"1,248",54\n2026-08-21,197,25\n',
    },
  ])

  expect(selected.kind).toBe('overview')
  expect(selected.series[0]).toMatchObject({ date: '2026-08-20', citations: 1248, citedPages: 54 })
})

test('detects the synchronized Aug 21 citation and cited-page cliff after excluding corrupted dates', () => {
  const series = [
    { date: '2026-08-12', citations: 700, citedPages: 50 },
    { date: '2026-08-13', citations: 15, citedPages: 2 },
    { date: '2026-08-14', citations: 11, citedPages: 2 },
    { date: '2026-08-15', citations: 9, citedPages: 1 },
    { date: '2026-08-16', citations: 12, citedPages: 2 },
    { date: '2026-08-17', citations: 14, citedPages: 2 },
    { date: '2026-08-18', citations: 720, citedPages: 52 },
    { date: '2026-08-19', citations: 740, citedPages: 53 },
    { date: '2026-08-20', citations: 748, citedPages: 54 },
    { date: '2026-08-21', citations: 197, citedPages: 25 },
  ]

  const result = detectAiCitationIncident(series, {
    now: '2026-08-23',
    lagDays: 2,
    isExcludedDate: corrupted,
  })

  expect(result.status).toBe('incident')
  expect(result.severity).toBe('critical')
  expect(result.incidentDate).toBe('2026-08-21')
  expect(result.signals.citationTriggered).toBe(true)
  expect(result.signals.breadthTriggered).toBe(true)
  expect(result.changes.citationDropPct).toBeGreaterThan(70)
  expect(result.changes.breadthDropPct).toBeGreaterThan(50)
  expect(result.baseline.dates).not.toContain('2026-08-13')
})

test('does not call citation volatility a full incident when cited-page breadth holds', () => {
  const result = detectAiCitationIncident([
    { date: '2026-08-18', citations: 700, citedPages: 50 },
    { date: '2026-08-19', citations: 720, citedPages: 52 },
    { date: '2026-08-20', citations: 740, citedPages: 51 },
    { date: '2026-08-21', citations: 250, citedPages: 50 },
  ], {
    now: '2026-08-23',
    lagDays: 2,
  })

  expect(result.status).toBe('citation-drop-only')
  expect(result.signals.citationTriggered).toBe(true)
  expect(result.signals.breadthTriggered).toBe(false)
})

test('uses Search Console as an independent cross-check instead of treating Bing AI as traffic truth', () => {
  const csv = [
    'Date,Page,Clicks,Impressions',
    '2026-08-18,/a/,10,1000',
    '2026-08-19,/a/,11,1020',
    '2026-08-20,/a/,9,980',
    '2026-08-21,/a/,10,990',
  ].join('\n')

  const series = buildSearchConsoleDailySeries(csv)
  const result = assessSearchConsoleStability(series, '2026-08-21')
  expect(result.status).toBe('stable')
  expect(result.changes.impressionDropPct).toBeLessThan(5)
})

test('classifies synchronized AI collapse with stable search and healthy technical state as a probable Bing-side event', () => {
  const incident = { status: 'incident' }
  const diagnosis = classifyCitationIncident({
    incident,
    search: { status: 'stable' },
    technical: { healthy: true },
    changes: { sensitiveFileCount: 0 },
  })

  expect(diagnosis.classification).toBe('probable-bing-ai-reporting-or-grounding-event')
  expect(diagnosis.confidence).toBe('high')
  expect(diagnosis.action).toBe('observe-and-avoid-destructive-seo-changes')
})

test('escalates when ordinary search or technical health collapses too', () => {
  const diagnosis = classifyCitationIncident({
    incident: { status: 'incident' },
    search: { status: 'collapsed' },
    technical: { healthy: true },
    changes: { sensitiveFileCount: 0 },
  })

  expect(diagnosis.classification).toBe('possible-site-or-indexability-event')
  expect(diagnosis.action).toBe('investigate-site-before-resubmission')
})
