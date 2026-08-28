#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  compareProtectedPageIdentity,
  identityFingerprint,
  normalizeCitationAssetUrl,
  normalizeUrlPath,
  outputHtmlPath,
  parseRedirectMap,
  parseRenderedPageIdentity,
} from '../seo/ai-citation-protected-assets.mjs'

const ROOT = process.cwd()
const argv = process.argv.slice(2)

function flag(name, fallback) {
  const hit = argv.find((arg) => arg === `--${name}` || arg.startsWith(`--${name}=`))
  if (!hit) return fallback
  const [, value] = hit.split('=')
  return value === undefined ? true : value
}

const OUT_DIR = path.resolve(ROOT, String(flag('out-dir', 'out')))
const LEDGER_PATH = path.resolve(ROOT, String(flag('ledger', 'config/ai-citation-protected-assets.json')))
const REDIRECTS_PATH = path.resolve(ROOT, String(flag('redirects', 'public/_redirects')))

function readyIdentityContractFailures(identity) {
  const failures = []
  if (!identity || identity.status !== 'ready') return ['identity status must be ready']
  if (!identity.routePath) failures.push('routePath is required')
  if (!String(identity.title ?? '').trim()) failures.push('title is required')
  if (!String(identity.h1 ?? '').trim()) failures.push('h1 is required')
  if (!String(identity.canonical ?? '').trim()) failures.push('canonical is required')
  if (typeof identity.indexable !== 'boolean') failures.push('indexable must be boolean')
  if (!/^[0-9a-f]{64}$/.test(String(identity.fingerprint ?? ''))) failures.push('fingerprint must be sha256')
  if (failures.length === 0 && identity.fingerprint !== identityFingerprint(identity)) {
    failures.push('fingerprint does not match identity fields')
  }
  return failures
}

function main() {
  if (!fs.existsSync(LEDGER_PATH)) {
    console.log('[ai-citation-assets] SKIPPED: no protected-asset ledger is committed')
    process.exit(0)
  }

  let ledger
  try {
    ledger = JSON.parse(fs.readFileSync(LEDGER_PATH, 'utf8'))
  } catch (error) {
    console.error(`[ai-citation-assets] invalid ledger JSON: ${error.message}`)
    process.exit(1)
  }

  if (ledger.schemaVersion !== 1 || !Array.isArray(ledger.assets)) {
    console.error('[ai-citation-assets] invalid ledger contract: expected schemaVersion=1 and assets[]')
    process.exit(1)
  }

  if (ledger.assets.length === 0) {
    console.error('[ai-citation-assets] invalid ledger contract: protected asset set is empty')
    process.exit(1)
  }

  const redirects = fs.existsSync(REDIRECTS_PATH)
    ? parseRedirectMap(fs.readFileSync(REDIRECTS_PATH, 'utf8'))
    : new Map()
  const failures = []
  const pending = []
  const seenUrls = new Set()
  let checked = 0
  let citationSum = 0

  for (const asset of ledger.assets) {
    const url = normalizeCitationAssetUrl(asset.url)
    if (!url) {
      failures.push(`${JSON.stringify(asset.url)}: protected asset URL is missing, malformed, or not first-party`)
      continue
    }
    if (seenUrls.has(url)) {
      failures.push(`${url}: duplicate protected asset URL`)
      continue
    }
    seenUrls.add(url)

    const citations = Number(asset.citations)
    if (!Number.isFinite(citations) || citations <= 0) {
      failures.push(`${url}: citations must be a finite number > 0`)
    } else citationSum += citations

    if (!asset.sourcePath || typeof asset.sourcePath !== 'string') {
      failures.push(`${url}: sourcePath is required for every protected asset`)
    } else if (!fs.existsSync(path.join(ROOT, asset.sourcePath))) {
      failures.push(`${url}: protected sourcePath disappeared: ${asset.sourcePath}`)
    }

    if (asset.routeSourcePath) {
      if (typeof asset.routeSourcePath !== 'string') {
        failures.push(`${url}: routeSourcePath must be a string when present`)
      } else if (!fs.existsSync(path.join(ROOT, asset.routeSourcePath))) {
        failures.push(`${url}: protected routeSourcePath disappeared: ${asset.routeSourcePath}`)
      }
    }

    if (asset.identity?.status === 'pending_render_fingerprint') {
      pending.push(url)
      continue
    }

    if (asset.identity?.status !== 'ready') {
      failures.push(`${url}: unknown or missing identity status ${JSON.stringify(asset.identity?.status)}`)
      continue
    }

    for (const problem of readyIdentityContractFailures(asset.identity)) {
      failures.push(`${url}: invalid ready identity: ${problem}`)
    }
    if (readyIdentityContractFailures(asset.identity).length > 0) continue

    if (normalizeUrlPath(asset.identity.routePath) !== url) {
      failures.push(`${url}: baseline routePath does not match protected URL: ${asset.identity.routePath}`)
      continue
    }

    const htmlPath = outputHtmlPath(OUT_DIR, url)
    if (!fs.existsSync(htmlPath)) {
      failures.push(`${url}: protected route no longer produced ${path.relative(ROOT, htmlPath)}`)
      continue
    }

    const actual = parseRenderedPageIdentity(fs.readFileSync(htmlPath, 'utf8'), url)
    actual.redirectTarget = redirects.get(url) ?? null
    actual.fingerprint = identityFingerprint(actual)
    const differences = compareProtectedPageIdentity(asset.identity, actual)
    for (const difference of differences) {
      failures.push(
        `${url}: ${difference.field} changed from ${JSON.stringify(difference.expected)} to ${JSON.stringify(difference.actual)}`,
      )
    }
    if (actual.fingerprint !== asset.identity.fingerprint) {
      failures.push(`${url}: rendered identity fingerprint changed from ${asset.identity.fingerprint} to ${actual.fingerprint}`)
    }
    checked += 1
  }

  if (Number.isFinite(Number(ledger.protectedCitations)) && citationSum !== Number(ledger.protectedCitations)) {
    failures.push(`ledger protectedCitations=${ledger.protectedCitations} does not equal asset citation sum=${citationSum}`)
  }

  if (pending.length > 0) {
    console.warn(
      `[ai-citation-assets] ${pending.length} protected asset(s) await a trusted rendered fingerprint; source ownership is enforced, rendered identity is not yet locked`,
    )
    for (const url of pending) console.warn(`  pending: ${url}`)
  }

  if (failures.length > 0) {
    console.error(`[ai-citation-assets] FAIL: ${failures.length} protected identity/ledger regression(s)`)
    for (const failure of failures) console.error(`  - ${failure}`)
    console.error(
      '[ai-citation-assets] If an identity migration is intentional, update the committed baseline only through the governed AI-citation asset refresh with a documented redirect/canonical/rollback plan.',
    )
    process.exit(1)
  }

  console.log(
    `[ai-citation-assets] PASS: ${ledger.assets.length} protected source owner(s) present; ${checked} rendered identity baseline(s) verified; ${pending.length} pending`,
  )
}

main()
