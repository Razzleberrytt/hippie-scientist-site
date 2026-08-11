#!/usr/bin/env node
/**
 * Source-level audit: every static App Router page under app/learn/<segments>/page.tsx
 * must declare a canonical that resolves to its own /learn route.
 *
 * Dynamic routes are skipped because they typically use generateMetadata.
 * Explicit noindex pages may omit a canonical.
 *
 * Usage: node scripts/audit/check-learn-canonicals.mjs
 */
import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = process.cwd()
const TARGET_DIR = path.join(ROOT, 'app', 'learn')
const ROUTE_ROOT = '/learn'

export function walkStaticPages(dir) {
  const out = []
  if (!fs.existsSync(dir)) return out

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, entry.name)
    if (entry.isDirectory()) {
      if (/^\[.+\]$/.test(entry.name)) continue
      if (entry.name.startsWith('_')) continue
      out.push(...walkStaticPages(full))
    } else if (entry.isFile() && entry.name === 'page.tsx') {
      out.push(full)
    }
  }

  return out
}

export function normalizeCanonical(value) {
  if (!value) return null
  let normalized = value.trim()
  normalized = normalized.replace(/^https?:\/\/(?:www\.)?thehippiescientist\.net/i, '')
  if (!normalized.startsWith('/')) return normalized
  normalized = normalized.replace(/\/+$/, '')
  return normalized === '' ? '/' : `${normalized}/`
}

function resolveCanonicalIdentifier(src, identifier, expectedCanonical) {
  const escaped = identifier.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')

  const literal = src.match(new RegExp(`(?:const|let)\\s+${escaped}\\s*=\\s*['\"]([^'\"]+)['\"]`))
  if (literal) return normalizeCanonical(literal[1])

  const siteUrlTemplate = src.match(
    new RegExp(`(?:const|let)\\s+${escaped}\\s*=\\s*\`\\$\\{SITE_URL\\}([^\`$]+)\``),
  )
  if (siteUrlTemplate) return normalizeCanonical(siteUrlTemplate[1])

  const collectionUrl = src.match(
    new RegExp(`(?:const|let)\\s+${escaped}\\s*=\\s*\`\\$\\{SITE_URL\\}\\$\\{([A-Za-z_$][\\w$]*)\\.url\\}/?\``),
  )
  if (collectionUrl) {
    const pageVar = collectionUrl[1]
    const escapedPageVar = pageVar.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
    const slugMatch = src.match(
      new RegExp(
        `(?:const|let)\\s+${escapedPageVar}\\s*=[\\s\\S]*?\\.find\\([\\s\\S]*?slug\\s*===\\s*['\"]([^'\"]+)['\"]`,
      ),
    )
    if (slugMatch) {
      const inferred = normalizeCanonical(`${ROUTE_ROOT}/${slugMatch[1]}/`)
      if (inferred === expectedCanonical) return inferred
    }
  }

  return null
}

export function extractCanonical(src, expectedCanonical = null) {
  const literalMatch = src.match(
    /alternates\s*:\s*\{[^}]*canonical\s*:\s*['"]([^'"]+)['"]/,
  )
  if (literalMatch) return normalizeCanonical(literalMatch[1])

  const templateMatch = src.match(
    /alternates\s*:\s*\{[^}]*canonical\s*:\s*`\$\{SITE_URL\}([^`$]+)`/,
  )
  if (templateMatch) return normalizeCanonical(templateMatch[1])

  const buildMetaMatch = src.match(
    /buildPageMetadata\s*\(\s*\{[\s\S]*?path\s*:\s*['"]([^'"]+)['"]/,
  )
  if (buildMetaMatch) return normalizeCanonical(buildMetaMatch[1])

  const pathwayMatch = src.match(/generatePathwayMetadata\s*\(\s*['"]([^'"]+)['"]\s*\)/)
  if (pathwayMatch) return normalizeCanonical(`${ROUTE_ROOT}/${pathwayMatch[1]}/`)

  const identifierMatch = src.match(
    /alternates\s*:\s*\{[^}]*canonical\s*:\s*([A-Za-z_$][\w$]*)/,
  )
  if (identifierMatch && expectedCanonical) {
    return resolveCanonicalIdentifier(src, identifierMatch[1], expectedCanonical)
  }

  return null
}

export function isExplicitlyNoindex(src) {
  return /index\s*:\s*false/.test(src) || /noindex\s*:/.test(src)
}

export function expectedRouteFromPath(filePath, targetDir = TARGET_DIR) {
  const rel = path.relative(targetDir, filePath).replace(/\\/g, '/')
  const parts = rel
    .split('/')
    .filter((part) => part && part !== 'page.tsx' && !/^\(.+\)$/.test(part))
  return normalizeCanonical('/' + [ROUTE_ROOT.slice(1), ...parts].join('/'))
}

export function auditLearnCanonicals({ root = ROOT, targetDir = TARGET_DIR, logger = console.log } = {}) {
  const files = walkStaticPages(targetDir)
  const failures = []

  for (const file of files) {
    const src = fs.readFileSync(file, 'utf8')
    const expectedCanonical = expectedRouteFromPath(file, targetDir)
    const actual = extractCanonical(src, expectedCanonical)
    const noindex = isExplicitlyNoindex(src)

    let status = 'OK'
    let detail = actual ?? '(none)'

    if (!actual && noindex) {
      detail = 'noindex page, no canonical required'
    } else if (!actual) {
      status = 'FAIL'
      detail = 'no canonical declared or statically resolvable'
      failures.push({ file, expectedCanonical, actual: null, detail })
    } else if (actual !== expectedCanonical) {
      status = 'FAIL'
      detail = `canonical mismatch: actual=${actual}, expected=${expectedCanonical}`
      failures.push({ file, expectedCanonical, actual, detail })
    }

    const rel = path.relative(root, file)
    logger(`${status === 'OK' ? '✅' : '❌'} ${rel} → ${detail}`)
  }

  logger(`\n[check-learn-canonicals] ${files.length} files, ${failures.length} problems`)
  return { files, failures }
}

export function isMainModule(argv1 = process.argv[1]) {
  if (!argv1) return false
  return path.resolve(argv1) === fileURLToPath(import.meta.url)
}

if (isMainModule()) {
  const { failures } = auditLearnCanonicals()
  process.exit(failures.length > 0 ? 1 : 0)
}
