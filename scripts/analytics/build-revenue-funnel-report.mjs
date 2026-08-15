#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'

const root = process.cwd()
const inputPath = process.argv[2] || path.join(root, 'ops', 'analytics', 'revenue-funnel-input.json')
const outputPath = process.argv[3] || path.join(root, 'reports', 'revenue-funnel-report.json')

const readJson = (file) => fs.existsSync(file) ? JSON.parse(fs.readFileSync(file, 'utf8')) : {}
const input = readJson(inputPath)
const events = Array.isArray(input) ? input : Array.isArray(input.events) ? input.events : []
const pageMetrics = Array.isArray(input.pageMetrics) ? input.pageMetrics : []

const bucket = () => ({ impressions: 0, clicks: 0, revenueUsd: 0, emailSignups: 0, organicVisitors: 0 })
const add = (map, key, field, value = 1) => {
  if (!key) key = 'unknown'
  const current = map.get(key) || bucket()
  current[field] = (current[field] || 0) + value
  map.set(key, current)
}

const maps = {
  page: new Map(),
  modulePosition: new Map(),
  ingredient: new Map(),
  landingQueryClass: new Map(),
  routeFamily: new Map(),
  contentCluster: new Map(),
  country: new Map(),
  experiment: new Map(),
  ctaVariant: new Map(),
}

for (const event of events) {
  const isImpression = event.kind === 'recommendation_impression'
  const isClick = event.kind === 'affiliate_click' || event.kind === 'recommendation_click'
  const isSignup = event.kind === 'email_signup_success'
  const revenue = event.kind === 'revenue_attributed' ? Number(event.valueUsd || 0) : 0
  const targets = [
    [maps.page, event.pagePath],
    [maps.modulePosition, event.modulePosition],
    [maps.ingredient, event.productSlug],
    [maps.landingQueryClass, event.landingQueryClass],
    [maps.routeFamily, event.routeFamily],
    [maps.contentCluster, event.contentCluster],
    [maps.country, event.countryCode],
    [maps.experiment, event.experimentVariant],
    [maps.ctaVariant, event.ctaVariant],
  ]
  for (const [map, key] of targets) {
    if (isImpression) add(map, key, 'impressions')
    if (isClick) add(map, key, 'clicks')
    if (isSignup) add(map, key, 'emailSignups')
    if (revenue) add(map, key, 'revenueUsd', revenue)
  }
}

for (const metric of pageMetrics) {
  const pagePath = metric.pagePath || 'unknown'
  const organicVisitors = Number(metric.organicVisitors || 0)
  const emailSignups = Number(metric.emailSignups || 0)
  const revenueUsd = Number(metric.revenueUsd || 0)
  add(maps.page, pagePath, 'organicVisitors', organicVisitors)
  add(maps.page, pagePath, 'emailSignups', emailSignups)
  add(maps.page, pagePath, 'revenueUsd', revenueUsd)
  if (metric.contentCluster) {
    add(maps.contentCluster, metric.contentCluster, 'organicVisitors', organicVisitors)
    add(maps.contentCluster, metric.contentCluster, 'emailSignups', emailSignups)
    add(maps.contentCluster, metric.contentCluster, 'revenueUsd', revenueUsd)
  }
  if (metric.countryCode) {
    add(maps.country, metric.countryCode, 'organicVisitors', organicVisitors)
    add(maps.country, metric.countryCode, 'emailSignups', emailSignups)
    add(maps.country, metric.countryCode, 'revenueUsd', revenueUsd)
  }
}

const finalize = (map) => Array.from(map.entries()).map(([key, value]) => ({
  key,
  ...value,
  affiliateCtr: value.impressions ? value.clicks / value.impressions : null,
  revenuePer1000OrganicVisitors: value.organicVisitors ? (value.revenueUsd / value.organicVisitors) * 1000 : null,
  emailSignupRate: value.organicVisitors ? value.emailSignups / value.organicVisitors : null,
})).sort((a, b) => b.revenueUsd - a.revenueUsd || b.clicks - a.clicks || a.key.localeCompare(b.key))

const report = {
  generatedAt: new Date().toISOString(),
  inputPath,
  definitions: {
    affiliateCtr: 'affiliate/recommendation clicks divided by qualified affiliate/recommendation impressions',
    revenuePer1000OrganicVisitors: 'attributed revenue / organic visitors × 1,000; requires pageMetrics from analytics export',
    emailSignupRate: 'successful email signups / organic visitors; requires successful-signup events or pageMetrics',
    country: 'Use analytics-provider country dimension when available; client events do not infer physical location from locale.',
  },
  byPage: finalize(maps.page),
  byModulePosition: finalize(maps.modulePosition),
  byIngredient: finalize(maps.ingredient),
  byLandingQueryClass: finalize(maps.landingQueryClass),
  byRouteFamily: finalize(maps.routeFamily),
  byContentCluster: finalize(maps.contentCluster),
  byCountry: finalize(maps.country),
  byExperiment: finalize(maps.experiment),
  byCtaVariant: finalize(maps.ctaVariant),
}

fs.mkdirSync(path.dirname(outputPath), { recursive: true })
fs.writeFileSync(outputPath, `${JSON.stringify(report, null, 2)}\n`)
console.log(`Wrote revenue funnel report to ${outputPath}`)
