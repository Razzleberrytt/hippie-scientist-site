#!/usr/bin/env node

import fs from 'node:fs/promises'
import path from 'node:path'

const INDEXNOW_KEY = '3c4f9b2a7d1e6a8f0b5c9d3e7f2a1b6c'
const INDEXNOW_KEY_FILE = `${INDEXNOW_KEY}.txt`
const DEFAULT_SITE_URL = 'https://thehippiescientist.net'
const DEFAULT_ENDPOINT = 'https://api.indexnow.org/indexnow'
const MAX_URLS_PER_REQUEST = 10_000

const rawArgs = process.argv.slice(2)

function hasFlag(name) {
  return rawArgs.includes(`--${name}`)
}

function getArgValue(name, fallback = undefined) {
  const prefix = `--${name}=`
  const value = rawArgs.find((arg) => arg.startsWith(prefix))
  return value ? value.slice(prefix.length) : fallback
}

function getRepeatedArgValues(name) {
  const prefix = `--${name}=`

  return rawArgs
    .filter((arg) => arg.startsWith(prefix))
    .flatMap((arg) => arg.slice(prefix.length).split(','))
    .map((value) => value.trim())
    .filter(Boolean)
}

function normalizeBaseUrl(value) {
  const url = new URL(value || DEFAULT_SITE_URL)
  url.pathname = ''
  url.search = ''
  url.hash = ''

  return url.toString().replace(/\/$/, '')
}

function decodeXmlEntities(value) {
  return value
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
}

function extractSitemapUrls(xml) {
  const urls = []
  const locPattern = /<loc>([^<]+)<\/loc>/g
  let match

  while ((match = locPattern.exec(xml)) !== null) {
    const url = decodeXmlEntities(match[1]?.trim() || '')
    if (url) urls.push(url)
  }

  return urls
}

function normalizeSubmittedUrl(value, siteUrl) {
  const raw = String(value || '').trim()
  if (!raw) return ''

  if (raw.startsWith('/')) {
    return `${siteUrl}${raw}`
  }

  return raw
}

function uniqueOwnUrls(urls, host, siteUrl) {
  const seen = new Set()
  const output = []

  for (const candidate of urls) {
    const normalized = normalizeSubmittedUrl(candidate, siteUrl)
    if (!normalized) continue

    try {
      const parsed = new URL(normalized)
      if (parsed.host !== host) continue
      if (seen.has(parsed.href)) continue

      seen.add(parsed.href)
      output.push(parsed.href)
    } catch {
      // Ignore invalid URL candidates.
    }
  }

  return output
}

function chunk(values, size) {
  const output = []

  for (let index = 0; index < values.length; index += size) {
    output.push(values.slice(index, index + size))
  }

  return output
}

async function readUrlsFromFile(filePath) {
  const raw = await fs.readFile(filePath, 'utf8')

  return raw
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'))
}

async function assertLocalKeyFile(sitemapPath) {
  const explicitKeyFilePath = getArgValue('key-file-path')
  const candidates = [
    explicitKeyFilePath,
    path.join(path.dirname(sitemapPath), INDEXNOW_KEY_FILE),
    path.join('public', INDEXNOW_KEY_FILE),
  ].filter(Boolean)

  for (const candidate of candidates) {
    try {
      const raw = await fs.readFile(candidate, 'utf8')
      if (raw.trim() === INDEXNOW_KEY) {
        return candidate
      }
    } catch {
      // Try the next candidate.
    }
  }

  throw new Error(
    `Missing local IndexNow key file. Expected ${INDEXNOW_KEY_FILE} to contain ${INDEXNOW_KEY}.`,
  )
}

async function collectUrls(siteUrl) {
  const sitemapPath = getArgValue('sitemap', 'out/sitemap.xml')
  const cliUrls = getRepeatedArgValues('url')
  const urlFilePath = getArgValue('url-file')
  const urls = [...cliUrls]

  if (urlFilePath) {
    urls.push(...await readUrlsFromFile(urlFilePath))
  }

  if (urls.length === 0) {
    const sitemapXml = await fs.readFile(sitemapPath, 'utf8')
    urls.push(...extractSitemapUrls(sitemapXml))
  }

  const host = new URL(siteUrl).host
  const ownUrls = uniqueOwnUrls(urls, host, siteUrl)
  const limit = Number.parseInt(getArgValue('limit', String(ownUrls.length)), 10)

  return {
    sitemapPath,
    urls: Number.isFinite(limit) && limit > 0 ? ownUrls.slice(0, limit) : ownUrls,
  }
}

async function submitBatch({ endpoint, host, keyLocation, urls }) {
  const response = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'content-type': 'application/json; charset=utf-8',
    },
    body: JSON.stringify({
      host,
      key: INDEXNOW_KEY,
      keyLocation,
      urlList: urls,
    }),
  })

  const responseText = await response.text()
  const accepted = response.status === 200 || response.status === 202

  if (!accepted) {
    throw new Error(
      `IndexNow rejected ${urls.length} URL(s): HTTP ${response.status} ${response.statusText}${responseText ? ` — ${responseText}` : ''}`,
    )
  }

  return response.status
}

async function main() {
  const dryRun = hasFlag('dry-run')
  const siteUrl = normalizeBaseUrl(
    getArgValue('site-url', process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || DEFAULT_SITE_URL),
  )
  const host = new URL(siteUrl).host
  const endpoint = getArgValue('endpoint', process.env.INDEXNOW_ENDPOINT || DEFAULT_ENDPOINT)
  const keyLocation = `${siteUrl}/${INDEXNOW_KEY_FILE}`
  const { sitemapPath, urls } = await collectUrls(siteUrl)
  const keyFilePath = await assertLocalKeyFile(sitemapPath)

  if (urls.length === 0) {
    console.log('[indexnow] No eligible URLs found for submission.')
    return
  }

  console.log(`[indexnow] Host: ${host}`)
  console.log(`[indexnow] Key file: ${keyFilePath}`)
  console.log(`[indexnow] Key location: ${keyLocation}`)
  console.log(`[indexnow] URL count: ${urls.length}`)

  if (dryRun) {
    console.log('[indexnow] Dry run enabled; no request sent.')
    console.log(urls.slice(0, 20).map((url) => ` - ${url}`).join('\n'))
    if (urls.length > 20) {
      console.log(`[indexnow] ...and ${urls.length - 20} more URL(s).`)
    }
    return
  }

  const batches = chunk(urls, MAX_URLS_PER_REQUEST)
  let submitted = 0

  for (const [index, urlsBatch] of batches.entries()) {
    const status = await submitBatch({ endpoint, host, keyLocation, urls: urlsBatch })
    submitted += urlsBatch.length
    console.log(
      `[indexnow] Submitted batch ${index + 1}/${batches.length}: ${urlsBatch.length} URL(s), HTTP ${status}`,
    )
  }

  console.log(`[indexnow] Done. Submitted ${submitted} URL(s).`)
}

main().catch((error) => {
  console.error(`[indexnow] ${error?.message || error}`)
  process.exit(1)
})
