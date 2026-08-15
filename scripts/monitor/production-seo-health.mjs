#!/usr/bin/env node

import { CANONICAL_ORIGIN, evaluateHostNormalization } from './production-seo-health-lib.mjs'

const MAX_REDIRECTS = 6
const SAMPLE_LIMIT = Number(process.argv.find((arg) => arg.startsWith('--sample='))?.split('=')[1] || 40)
const errors = []
const warnings = []

async function fetchWithChain(input, options = {}) {
  let url = input
  const chain = []
  for (let hop = 0; hop <= MAX_REDIRECTS; hop += 1) {
    const response = await fetch(url, { ...options, redirect: 'manual', headers: { 'user-agent': 'TheHippieScientist-SEO-Monitor/1.0', ...(options.headers || {}) } })
    chain.push({ url, status: response.status, location: response.headers.get('location') || '' })
    if (response.status < 300 || response.status >= 400 || !response.headers.get('location')) return { response, finalUrl: url, chain }
    url = new URL(response.headers.get('location'), url).toString()
  }
  return { response: null, finalUrl: url, chain }
}

function canonicalFromHtml(html) {
  return html.match(/<link\b[^>]*rel=["']canonical["'][^>]*href=["']([^"']+)["']/i)?.[1]
    || html.match(/<link\b[^>]*href=["']([^"']+)["'][^>]*rel=["']canonical["'][^>]*>/i)?.[1]
    || ''
}

function soft404(html) {
  const text = html.replace(/<script\b[^>]*>[\s\S]*?<\/script>/gi, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').toLowerCase()
  return [/\bpage not found\b/, /\bcontent not found\b/, /\bdoes not exist\b/, /\bwe couldn't find\b/].some((pattern) => pattern.test(text))
}

async function verifyHostNormalization(url, label) {
  const result = await fetchWithChain(url, { method: 'GET' })
  errors.push(...evaluateHostNormalization({ inputUrl: url, result, label }))
}

const hostNormalizationPath = '/goals/'
await verifyHostNormalization(`http://thehippiescientist.net${hostNormalizationPath}`, 'http-apex')
await verifyHostNormalization(`http://www.thehippiescientist.net${hostNormalizationPath}`, 'http-www')
await verifyHostNormalization(`https://www.thehippiescientist.net${hostNormalizationPath}`, 'https-www')

const missingPath = `/__seo-monitor-definitely-gone-${Date.now()}/`
const missing = await fetch(`${CANONICAL_ORIGIN}${missingPath}`, { redirect: 'manual', headers: { 'user-agent': 'TheHippieScientist-SEO-Monitor/1.0' } })
if (missing.status !== 404 && missing.status !== 410) errors.push({ type: 'missing-content-does-not-return-404-or-410', status: missing.status, path: missingPath })

const sitemapResponse = await fetch(`${CANONICAL_ORIGIN}/sitemap.xml`, { headers: { 'user-agent': 'TheHippieScientist-SEO-Monitor/1.0' } })
if (!sitemapResponse.ok) errors.push({ type: 'live-sitemap-unavailable', status: sitemapResponse.status })
const sitemapXml = sitemapResponse.ok ? await sitemapResponse.text() : ''
const urls = Array.from(sitemapXml.matchAll(/<loc>([^<]+)<\/loc>/gi), (match) => match[1].trim())
if (!urls.length) errors.push({ type: 'live-sitemap-empty' })

for (const url of urls.slice(0, Math.max(1, SAMPLE_LIMIT))) {
  let parsed
  try {
    parsed = new URL(url)
  } catch {
    errors.push({ type: 'live-sitemap-malformed-url', url })
    continue
  }
  if (parsed.origin !== CANONICAL_ORIGIN) {
    errors.push({ type: 'live-sitemap-wrong-origin', url })
    continue
  }

  const result = await fetchWithChain(url, { method: 'GET' })
  if (!result.response) {
    errors.push({ type: 'live-url-redirect-overflow', url })
    continue
  }
  if (result.chain.length > 1) errors.push({ type: 'redirected-url-in-live-sitemap', url, chain: result.chain })
  if (result.response.status !== 200) {
    errors.push({ type: 'live-sitemap-url-non-200', url, status: result.response.status })
    continue
  }
  const html = await result.response.text()
  if (soft404(html)) errors.push({ type: 'live-soft-404', url })
  const canonical = canonicalFromHtml(html)
  if (!canonical) errors.push({ type: 'live-missing-canonical', url })
  else {
    const canonicalUrl = new URL(canonical, CANONICAL_ORIGIN)
    if (canonicalUrl.origin !== CANONICAL_ORIGIN) errors.push({ type: 'live-canonical-wrong-origin', url, canonical })
    if (canonicalUrl.pathname !== parsed.pathname) errors.push({ type: 'live-canonical-path-mismatch', url, canonical })
  }

  if (parsed.pathname !== '/' && parsed.pathname.endsWith('/')) {
    const withoutSlash = `${parsed.origin}${parsed.pathname.replace(/\/$/, '')}`
    const slashResult = await fetchWithChain(withoutSlash, { method: 'GET' })
    const finalPath = new URL(slashResult.finalUrl).pathname
    if (finalPath !== parsed.pathname) errors.push({ type: 'trailing-slash-not-canonicalized', source: withoutSlash, final: slashResult.finalUrl })
    if (slashResult.chain.length > 3) errors.push({ type: 'trailing-slash-chain-too-long', source: withoutSlash, chain: slashResult.chain })
  }
}

const summary = { sampledSitemapUrls: Math.min(urls.length, SAMPLE_LIMIT), errors: errors.length, warnings: warnings.length }
console.log(JSON.stringify({ generatedAt: new Date().toISOString(), summary, errors, warnings }, null, 2))
if (errors.length) process.exitCode = 1
