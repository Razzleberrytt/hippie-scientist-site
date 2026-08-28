#!/usr/bin/env node

import fs from 'node:fs'
import path from 'node:path'
import {
  compareProtectedPageIdentity,
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
  let checked = 0

  for (const asset of ledger.assets) {
    const url = normalizeUrlPath(asset.url)

    for (const sourceField of ['sourcePath', 'routeSourcePath']) {
      const sourcePath = asset[sourceField]
      if (sourcePath && !fs.existsSync(path.join(ROOT, sourcePath))) {
        failures.push(`${url}: protected ${sourceField} disappeared: ${sourcePath}`)
      }
    }

    if (asset.identity?.status !== 'ready') {
      pending.push(url)
      continue
    }

    const htmlPath = outputHtmlPath(OUT_DIR, url)
    if (!fs.existsSync(htmlPath)) {
      failures.push(`${url}: protected route no longer produced ${path.relative(ROOT, htmlPath)}`)
      continue
    }

    const actual = parseRenderedPageIdentity(fs.readFileSync(htmlPath, 'utf8'), url)
    actual.redirectTarget = redirects.get(url) ?? null
    const differences = compareProtectedPageIdentity(asset.identity, actual)
    for (const difference of differences) {
      failures.push(
        `${url}: ${difference.field} changed from ${JSON.stringify(difference.expected)} to ${JSON.stringify(difference.actual)}`,
      )
    }
    checked += 1
  }

  if (pending.length > 0) {
    console.warn(
      `[ai-citation-assets] ${pending.length} protected asset(s) await a trusted rendered fingerprint; source ownership is enforced, rendered identity is not yet locked`,
    )
    for (const url of pending) console.warn(`  pending: ${url}`)
  }

  if (failures.length > 0) {
    console.error(`[ai-citation-assets] FAIL: ${failures.length} protected identity regression(s)`)
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
