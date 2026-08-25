#!/usr/bin/env node
/**
 * Pull finalized Google Search Console performance data for the opportunity engine.
 *
 * Required environment:
 *   GSC_SERVICE_ACCOUNT_JSON  Service-account key JSON (raw JSON or base64-encoded JSON)
 * Optional:
 *   GSC_SITE_URL              Search Console property; defaults to sc-domain:thehippiescientist.net
 *   GSC_LOOKBACK_DAYS         Rolling window; defaults to 28
 *   GSC_LAG_DAYS              Finalization lag; defaults to 3
 *
 * The service-account email must be granted read access to the Search Console property.
 */

import { createSign } from 'node:crypto'
import { mkdirSync, writeFileSync } from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..')
const OUTPUT_DIR = path.join(ROOT, 'data-sources', 'search-console')
const TOKEN_URL = 'https://oauth2.googleapis.com/token'
const SCOPE = 'https://www.googleapis.com/auth/webmasters.readonly'
const ROW_LIMIT = 25_000
const MAX_ROWS = 50_000

function decodeServiceAccount(raw) {
  if (!raw?.trim()) throw new Error('GSC_SERVICE_ACCOUNT_JSON is required')
  const trimmed = raw.trim()
  const candidates = [trimmed]
  try {
    candidates.push(Buffer.from(trimmed, 'base64').toString('utf8'))
  } catch {
    // Raw JSON remains the primary parse path.
  }
  for (const candidate of candidates) {
    try {
      const parsed = JSON.parse(candidate)
      if (parsed?.client_email && parsed?.private_key) return parsed
    } catch {
      // Try the next representation.
    }
  }
  throw new Error('GSC_SERVICE_ACCOUNT_JSON must be raw or base64-encoded service-account JSON')
}

function base64url(value) {
  return Buffer.from(value).toString('base64url')
}

function createAssertion(credentials, now = Math.floor(Date.now() / 1000)) {
  const header = { alg: 'RS256', typ: 'JWT' }
  if (credentials.private_key_id) header.kid = credentials.private_key_id
  const claims = {
    iss: credentials.client_email,
    scope: SCOPE,
    aud: TOKEN_URL,
    iat: now,
    exp: now + 3600,
  }
  const unsigned = `${base64url(JSON.stringify(header))}.${base64url(JSON.stringify(claims))}`
  const signer = createSign('RSA-SHA256')
  signer.update(unsigned)
  signer.end()
  const signature = signer.sign(credentials.private_key).toString('base64url')
  return `${unsigned}.${signature}`
}

async function getAccessToken(credentials) {
  const body = new URLSearchParams({
    grant_type: 'urn:ietf:params:oauth:grant-type:jwt-bearer',
    assertion: createAssertion(credentials),
  })
  const response = await fetch(TOKEN_URL, {
    method: 'POST',
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    body,
  })
  const payload = await response.json().catch(() => ({}))
  if (!response.ok || !payload.access_token) {
    throw new Error(`Google OAuth token request failed (${response.status}): ${payload.error_description || payload.error || 'unknown error'}`)
  }
  return payload.access_token
}

function isoDate(date) {
  return date.toISOString().slice(0, 10)
}

function dateRange({ lookbackDays, lagDays }) {
  const end = new Date()
  end.setUTCHours(12, 0, 0, 0)
  end.setUTCDate(end.getUTCDate() - lagDays)
  const start = new Date(end)
  start.setUTCDate(start.getUTCDate() - (lookbackDays - 1))
  return { startDate: isoDate(start), endDate: isoDate(end) }
}

async function querySearchAnalytics({ accessToken, siteUrl, dimensions, startDate, endDate }) {
  const rows = []
  const endpoint = `https://www.googleapis.com/webmasters/v3/sites/${encodeURIComponent(siteUrl)}/searchAnalytics/query`

  for (let startRow = 0; startRow < MAX_ROWS; startRow += ROW_LIMIT) {
    const response = await fetch(endpoint, {
      method: 'POST',
      headers: {
        authorization: `Bearer ${accessToken}`,
        'content-type': 'application/json',
      },
      body: JSON.stringify({
        startDate,
        endDate,
        dimensions,
        type: 'web',
        dataState: 'final',
        rowLimit: ROW_LIMIT,
        startRow,
      }),
    })
    const payload = await response.json().catch(() => ({}))
    if (!response.ok) {
      throw new Error(`Search Console query failed (${response.status}): ${payload.error?.message || 'unknown error'}`)
    }
    const pageRows = Array.isArray(payload.rows) ? payload.rows : []
    rows.push(...pageRows)
    if (pageRows.length < ROW_LIMIT) break
  }

  return rows
}

function csvEscape(value) {
  const text = String(value ?? '')
  if (!/[",\r\n]/.test(text)) return text
  return `"${text.replaceAll('"', '""')}"`
}

function dimensionHeader(dimension) {
  if (dimension === 'query') return 'Query'
  if (dimension === 'page') return 'Page'
  if (dimension === 'date') return 'Date'
  return dimension
}

function rowsToCsv(rows, dimensions) {
  const headers = [
    ...dimensions.map(dimensionHeader),
    'Clicks',
    'Impressions',
    'CTR',
    'Position',
  ]
  const lines = [headers.map(csvEscape).join(',')]
  for (const row of rows) {
    const values = [
      ...(row.keys || []),
      Number(row.clicks || 0),
      Number(row.impressions || 0),
      `${(Number(row.ctr || 0) * 100).toFixed(4)}%`,
      Number(row.position || 0).toFixed(4),
    ]
    lines.push(values.map(csvEscape).join(','))
  }
  return `${lines.join('\n')}\n`
}

function positiveInteger(value, fallback) {
  const parsed = Number.parseInt(String(value ?? ''), 10)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

async function main() {
  const credentials = decodeServiceAccount(process.env.GSC_SERVICE_ACCOUNT_JSON)
  const siteUrl = process.env.GSC_SITE_URL?.trim() || 'sc-domain:thehippiescientist.net'
  const lookbackDays = positiveInteger(process.env.GSC_LOOKBACK_DAYS, 28)
  const lagDays = positiveInteger(process.env.GSC_LAG_DAYS, 3)
  const { startDate, endDate } = dateRange({ lookbackDays, lagDays })
  const accessToken = await getAccessToken(credentials)

  const datasets = [
    { filename: 'Queries.csv', dimensions: ['query'] },
    { filename: 'Pages.csv', dimensions: ['page'] },
    { filename: 'queries-by-page.csv', dimensions: ['query', 'page'] },
    // Daily page data is retained separately so algorithm-update analysis can
    // compare matched cohorts instead of guessing from a rolling aggregate.
    { filename: 'pages-by-date.csv', dimensions: ['date', 'page'] },
  ]

  mkdirSync(OUTPUT_DIR, { recursive: true })
  const summary = []
  for (const dataset of datasets) {
    const rows = await querySearchAnalytics({ accessToken, siteUrl, dimensions: dataset.dimensions, startDate, endDate })
    writeFileSync(path.join(OUTPUT_DIR, dataset.filename), rowsToCsv(rows, dataset.dimensions))
    summary.push(`${dataset.filename}=${rows.length}`)
  }

  writeFileSync(
    path.join(OUTPUT_DIR, 'fetch-metadata.json'),
    `${JSON.stringify({ siteUrl, startDate, endDate, lookbackDays, lagDays, fetchedAt: new Date().toISOString() }, null, 2)}\n`,
  )
  console.log(`[search-console] ${siteUrl} ${startDate}..${endDate} ${summary.join(' ')}`)
}

main().catch((error) => {
  console.error(`[search-console] ${error.message}`)
  process.exitCode = 1
})
