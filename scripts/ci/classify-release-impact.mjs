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
 * changed file is documentation, an inert generated/internal report, or a
 * workbook patch proposal — and a proposal is inert by construction, since
 * `apply-workbook-patch.mjs` refuses to write while a patch is in `proposal`
 * status. Operational inputs under ops/ intentionally stay on the full path.
 *
 * @type {RegExp[]}
 */
export const DOCS_ONLY_PATTERNS = [
  /^docs\//,
  /^ops\/(?:reports?|audits?|snapshots?)\//,
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
export const VALIDATION_ONLY_PATTERNS = [
  /^docs\/(?:CURRENT_SPRINT|MASTER_BACKLOG|ROADMAP)\.md$/,
  /^docs\/ops\/project-control-reconciliation\.md$/,
  /^ops\/project-control\//,
  /^scripts\/ci\/(?:reconcile-project-control|validate-project-control-admission)(?:\.test)?\.mjs$/,
  /^scripts\/ci\/autonomous-merge-(?:controller|monitor|refresh-safety|authorization)(?:\.test)?\.mjs$/,
  /^scripts\/ci\/verify-deploy-authorization(?:\.test)?\.mjs$/,
  // Pure evidence-language policy and its focused regressions cannot inspect or
  // change built output. The runner stays off this allowlist because it contains
  // post-build out/ reporting that must remain production-build validated.
  /^scripts\/ci\/evidence-language-policy\.mjs$/,
  /^scripts\/ci\/__tests__\/evidence-language-negation\.test\.mjs$/,
  /^lib\/__tests__\/validate-evidence-language\.test\.ts$/,
  /^tests\/autonomous-merge-controller-contract\.test\.ts$/,
  /^tests\/deployment-handoff-contract\.test\.ts$/,
  /^\.github\/workflows\/autonomous-merge-controller\.yml$/,
  /^\.github\/workflows\/project-control-reconciliation\.yml$/,
  /^security\/audit-allowlist\.json$/,
  /^security\/audit-allowlist\.d\/[^/]+\.json$/,
  /^ops\/enrichment-governor\/(?:work-queue\.json|quarantine\.json|ledger\.jsonl)$/,
  /^ops\/enrichment-governor\/transactions\/[^/]+\.json$/,
]

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

export function isValidationOnlyPath(file) {
  const normalized = String(file || '').trim().replaceAll('\\', '/')
  return Boolean(normalized) && VALIDATION_ONLY_PATTERNS.some((pattern) => pattern.test(normalized))
}

export function isLeafPagePath(file) {
  const normalized = String(file || '').trim().replaceAll('\\', '/')
  if (!normalized || !LEAF_PAGE_PATTERNS.some((pattern) => pattern.test(normalized))) return false

  const routeSegments = normalized.split('/').slice(1, -1)
  const urlSegments = []

  for (const segment of routeSegments) {
    if (/^\([^/]+\)$/.test(segment)) continue
    if (segment.includes('[') || segment.includes(']')) return false
    if (segment.startsWith('@') || segment.startsWith('(') || segment.startsWith('_')) return false
    urlSegments.push(segment)
  }

  return urlSegments.length >= 2
}

export function classifyReleaseImpact(files) {
  const normalizedFiles = Array.from(new Set(
    files.map((file) => String(file || '').trim().replaceAll('\\', '/')).filter(Boolean),
  ))
  const sensitiveFiles = normalizedFiles.filter(isReleaseSensitivePath)
  const docsOnly = normalizedFiles.length > 0 && normalizedFiles.every(isDocsOnlyPath)
  const validationOnly = !docsOnly && normalizedFiles.length > 0 && normalizedFiles.every(
    (file) => isDocsOnlyPath(file) || isValidationOnlyPath(file),
  )
  const leafPageOnly = normalizedFiles.length > 0 && normalizedFiles.every(isLeafPagePath)
  return {
    releaseSensitive: sensitiveFiles.length > 0,
    sensitiveFiles,
    docsOnly,
    validationOnly,
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
  console.log(`[release-impact] validation_only=${result.validationOnly}`)
  console.log(`[release-impact] leaf_page_only=${result.leafPageOnly}`)

  if (outputArg) {
    const outputPath = outputArg.slice('--github-output='.length)
    if (!outputPath) throw new Error('--github-output requires a file path')
    fs.appendFileSync(outputPath, `release_sensitive=${result.releaseSensitive}\n`)
    fs.appendFileSync(outputPath, `docs_only=${result.docsOnly}\n`)
    fs.appendFileSync(outputPath, `validation_only=${result.validationOnly}\n`)
    fs.appendFileSync(outputPath, `leaf_page_only=${result.leafPageOnly}\n`)
  }
}

const entry = process.argv[1] ? pathToFileURL(path.resolve(process.argv[1])).href : ''
if (entry && import.meta.url === entry) main()
