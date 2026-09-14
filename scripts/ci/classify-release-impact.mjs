#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import { pathToFileURL } from 'node:url'

export const RELEASE_SENSITIVE_PATTERNS = [
  /^scripts\/(?:data|build|pipeline|ci)\//,
  /^scripts\/(?:build|orchestrate|profile-build|generate-|create-content)/,
  /^app\/(?:.+\/)?(?:page|layout|template|default|error|global-error|not-found|loading)\.[^/]+$/,
  /^app\/(?:.+\/)?route\.[^/]+$/,
  /^app\/(?:.+\/)?(?:sitemap|robots|manifest|feed|favicon|icon\d*|apple-icon\d*|opengraph-image|twitter-image)\.[^/]+$/,
  /^app\/(?:.+\/)?generateStaticParams(?:\.[^/]+)?$/,
  /^(?:src\/)?lib\/(?:[^/]*-)?(?:content|data|seo|schema|routes?|taxonomy)(?:[-./]|$)/,
  /^public\/data\//,
  /^public\/(?:_redirects|_headers)$/,
  /^next\.config\./,
  /^package(?:-lock)?\.json$/,
]

/**
 * Files that cannot change a byte of built output.
 *
 * Every heavy workflow — Site Health, quality-gate, production-content-lint —
 * runs its own full `build:deploy`, so a pull request touching nothing but
 * prose paid for three separate production builds. `release_sensitive` is not
 * the right signal to skip those: it is deliberately narrow, so a change to
 * `components/` is not release-sensitive but must still run lint and tests.
 *
 * `docs_only` is the conservative complement. It is true only when *every*
 * changed file is documentation, an internal report, or a workbook patch
 * proposal — and a proposal is inert by construction, since
 * `apply-workbook-patch.mjs` refuses to write while a patch is in `proposal`
 * status.
 *
 * @type {RegExp[]}
 */
export const DOCS_ONLY_PATTERNS = [
  /^docs\//,
  /^ops\//,
  /^data-sources\/workbook-patches\/[^/]+\.json$/,
  /^data-sources\/workbook-patches\/README\.md$/,
  /^\.github\/ISSUE_TEMPLATE\//,
  /^\.github\/pull_request_template\.md$/,
  /^[^/]+\.md$/,
  /^LICENSE$/,
]

/**
 * Candidate syntax for ordinary hand-authored App Router page files. Structural
 * route checks in `isLeafPagePath` narrow this further so shared/dynamic route
 * implementations cannot accidentally enter the fast path.
 */
export const LEAF_PAGE_PATTERNS = [
  /^app\/.+\/page\.(?:tsx|ts|jsx|js|mdx)$/,
]

/**
 * @param {string} file
 * @returns {boolean}
 */
export function isDocsOnlyPath(file) {
  const normalized = String(file || '').trim().replaceAll('\\', '/')
  return Boolean(normalized) && DOCS_ONLY_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function isReleaseSensitivePath(file) {
  const normalized = String(file || '').trim().replaceAll('\\', '/')
  return Boolean(normalized) && RELEASE_SENSITIVE_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function isLeafPagePath(file) {
  const normalized = String(file || '').trim().replaceAll('\\', '/')
  if (!normalized || !LEAF_PAGE_PATTERNS.some((pattern) => pattern.test(normalized))) return false

  const routeSegments = normalized.split('/').slice(1, -1)
  const urlSegments = []

  for (const segment of routeSegments) {
    // Pure route groups do not add a URL segment. They are safe only when the
    // page still has at least two concrete URL segments below app/; this keeps
    // app/(marketing)/page.tsx (the root route) out of the fast path.
    if (/^\([^/]+\)$/.test(segment)) continue

    // Dynamic/catch-all segments can render many URLs from one page file.
    // Parallel, intercepting, and private folders can also have non-leaf
    // routing semantics. Fail closed for every one of those shapes.
    if (segment.includes('[') || segment.includes(']')) return false
    if (segment.startsWith('@') || segment.startsWith('(') || segment.startsWith('_')) return false

    urlSegments.push(segment)
  }

  // Keep category/index hubs (for example app/guides/page.tsx) on the full
  // path. The optimization is intentionally for deep, static editorial leaves.
  return urlSegments.length >= 2
}

export function classifyReleaseImpact(files) {
  const normalizedFiles = Array.from(new Set(
    files.map((file) => String(file || '').trim().replaceAll('\\', '/')).filter(Boolean),
  ))
  const sensitiveFiles = normalizedFiles.filter(isReleaseSensitivePath)
  // Empty diffs never take a fast path: with nothing to inspect, fail closed
  // and run the exhaustive suite.
  const docsOnly = normalizedFiles.length > 0 && normalizedFiles.every(isDocsOnlyPath)
  const leafPageOnly = normalizedFiles.length > 0 && normalizedFiles.every(isLeafPagePath)
  return {
    releaseSensitive: sensitiveFiles.length > 0,
    sensitiveFiles,
    docsOnly,
    leafPageOnly,
    files: normalizedFiles,
  }
}

function main() {
  const args = process.argv.slice(2)
  const outputArg = args.find((arg) => arg.startsWith('--github-output='))
  const fileArgs = args.filter((arg) => !arg.startsWith('--github-output='))
  const input = fileArgs.length ? fileArgs : fs.readFileSync(0, 'utf8').split(/\r?\n/)
  const result = classifyReleaseImpact(input)

  for (const file of result.sensitiveFiles) console.log(`[release-impact] sensitive: ${file}`)
  console.log(`[release-impact] release_sensitive=${result.releaseSensitive}`)
  console.log(`[release-impact] docs_only=${result.docsOnly}`)
  console.log(`[release-impact] leaf_page_only=${result.leafPageOnly}`)

  if (outputArg) {
    const outputPath = outputArg.slice('--github-output='.length)
    if (!outputPath) throw new Error('--github-output requires a file path')
    fs.appendFileSync(outputPath, `release_sensitive=${result.releaseSensitive}\n`)
    fs.appendFileSync(outputPath, `docs_only=${result.docsOnly}\n`)
    fs.appendFileSync(outputPath, `leaf_page_only=${result.leafPageOnly}\n`)
  }
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''
if (entry && import.meta.url === entry) main()
