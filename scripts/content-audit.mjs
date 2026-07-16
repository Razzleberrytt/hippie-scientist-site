#!/usr/bin/env node
/**
 * content-audit.mjs
 *
 * Warning-only content audit for static page families:
 *   app/articles/*, app/guides/*, app/compare/*
 *
 * Skips workbook-driven routes (/herbs, /compounds, /goals, /stacks).
 * Always exits 0 — visibility only, never blocks the build.
 *
 * Usage:
 *   node scripts/content-audit.mjs
 *   npm run audit:content
 *
 * Outputs:
 *   ops/reports/content-audit.json
 *   ops/reports/site-health.json
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))
const ROOT = path.resolve(__dirname, '..')

// ─── Config ──────────────────────────────────────────────────────────────────

const CONTENT_FAMILIES = [
  { family: 'articles', dir: path.join(ROOT, 'app', 'articles') },
  { family: 'guides',   dir: path.join(ROOT, 'app', 'guides') },
  { family: 'compare',  dir: path.join(ROOT, 'app', 'compare') },
]

// Directories to skip within a family (dynamic catch-all and special dirs)
const SKIP_DIRS = new Set(['[slug]', '[goal]', 'dynamic', 'style'])

// Approved affiliate tag — anything else hardcoded is a finding
const APPROVED_TAG = 'razzleberry02-20'

// Thin page threshold (words)
const THIN_THRESHOLD = 500

// ─── Collect pages ────────────────────────────────────────────────────────────

function collectPages() {
  const pages = []
  for (const { family, dir } of CONTENT_FAMILIES) {
    if (!fs.existsSync(dir)) continue
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (SKIP_DIRS.has(entry.name)) continue
      const slug = entry.name
      const pagePath = path.join(dir, slug, 'page.tsx')
      if (!fs.existsSync(pagePath)) continue
      pages.push({ family, slug, pagePath, route: `/${family}/${slug}` })
    }
  }
  return pages
}

// ─── Word count ───────────────────────────────────────────────────────────────

// Object-literal keys that hold user-facing copy in data-driven hub/card
// components (e.g. GUIDES.map(...), DecisionRouter items, GuideCardGrid
// cards). Blanket-stripping every `{...}` block below would otherwise
// discard this prose entirely and make data-driven pages look thin even
// when the rendered page has substantial text.
const PROSE_KEY_NAMES = ['title', 'desc', 'description', 'problem', 'why', 'cta', 'body', 'caution', 'bestFor', 'fit', 'label', 'goal', 'role', 'summary', 'name', 'kind', 'sub', 'eyebrow', 'text', 'note', 'question', 'answer']
const PROSE_KEYS = new RegExp(`\\b(${PROSE_KEY_NAMES.join('|')})\\s*:\\s*(['"\`])((?:(?!\\2)[^\\\\]|\\\\.)*)\\2`, 'g')

function extractProseLiterals(source, keyPattern = PROSE_KEYS) {
  const withoutComments = source
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')
  let proseLiterals = ''
  let match
  keyPattern.lastIndex = 0
  while ((match = keyPattern.exec(withoutComments))) {
    proseLiterals += ' ' + match[3]
  }
  return proseLiterals
}

// Detects which PROSE_KEYS property names the page actually reads off a loop
// variable (e.g. `article.title`, `a.description` from `articles.map(article
// => ...)` or `.map(a => ...)`) so cross-file extraction below only pulls in
// the fields a hub genuinely renders, not an imported module's entire prose
// surface (e.g. full article body/FAQ text that never appears on the hub).
function detectAccessedProseKeys(source) {
  const pattern = new RegExp(`\\.\\s*(${PROSE_KEY_NAMES.join('|')})\\b`, 'g')
  const keys = new Set()
  let match
  while ((match = pattern.exec(source))) keys.add(match[1])
  return keys
}

// Resolves a page's own local (relative or `@/`-aliased) imports to on-disk
// files, so prose sourced from a companion data module (e.g. hub pages that
// `.map()` over an imported article list rather than inlining `title: '...'`
// literals) still counts toward the page's word total. Recurses a bounded
// depth to reach re-exported barrel files (e.g. `lib/foo.ts` spreading in
// arrays from `lib/foo/articles-a.ts`), capped and de-duped to stay cheap.
// Extraction from imported files is restricted to `accessedKeys` (the
// property names the page itself reads) so an imported registry's unrelated,
// unrendered prose (deep article sections, FAQ answers, etc.) can't inflate
// the word count and mask a genuinely thin hub.
const IMPORT_SPECIFIER = /from\s+['"]((?:\.{1,2}|@)\/[^'"]+)['"]/g
const MAX_IMPORT_DEPTH = 3

function resolveImportPath(specifier, fromDir) {
  const base = specifier.startsWith('@/') ? path.join(ROOT, specifier.slice(2)) : path.resolve(fromDir, specifier)
  for (const candidate of [base, `${base}.ts`, `${base}.tsx`, path.join(base, 'index.ts'), path.join(base, 'index.tsx')]) {
    if (fs.existsSync(candidate) && fs.statSync(candidate).isFile()) return candidate
  }
  return null
}

function collectImportedProse(source, fromFile, depth, visited, accessedKeyPattern) {
  if (depth > MAX_IMPORT_DEPTH) return ''
  let prose = ''
  const fromDir = path.dirname(fromFile)
  let match
  IMPORT_SPECIFIER.lastIndex = 0
  while ((match = IMPORT_SPECIFIER.exec(source))) {
    const resolved = resolveImportPath(match[1], fromDir)
    // Only follow imports into our own content/lib source — never node_modules,
    // generated public/data, or component directories (avoids pulling unrelated
    // UI copy into a page's word count).
    if (!resolved || visited.has(resolved)) continue
    if (!resolved.startsWith(path.join(ROOT, 'lib')) && !resolved.startsWith(path.join(ROOT, 'src', 'lib'))) continue
    visited.add(resolved)
    let importedSource
    try {
      importedSource = fs.readFileSync(resolved, 'utf-8')
    } catch {
      continue
    }
    prose += ' ' + extractProseLiterals(importedSource, accessedKeyPattern)
    prose += ' ' + collectImportedProse(importedSource, resolved, depth + 1, visited, accessedKeyPattern)
  }
  return prose
}

function countWords(source, filePath) {
  const withoutImports = source
    .replace(/import\s+.*?from\s+['"][^'"]+['"]/g, '')
    .replace(/\/\/.*$/gm, '')
    .replace(/\/\*[\s\S]*?\*\//g, '')

  let proseLiterals = extractProseLiterals(source)
  if (filePath) {
    const accessedKeys = detectAccessedProseKeys(source)
    if (accessedKeys.size > 0) {
      const accessedKeyPattern = new RegExp(`\\b(${[...accessedKeys].join('|')})\\s*:\\s*(['"\`])((?:(?!\\2)[^\\\\]|\\\\.)*)\\2`, 'g')
      proseLiterals += collectImportedProse(source, filePath, 1, new Set(), accessedKeyPattern)
    }
  }

  // Strip JSX/HTML tags and remaining braces (interpolation, non-prose objects)
  const jsxText = withoutImports
    .replace(/<[^>]+>/g, ' ')
    .replace(/\{[^}]*\}/g, ' ')

  const stripped = (jsxText + ' ' + proseLiterals)
    .replace(/[^a-zA-Z\s'-]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
  if (!stripped) return 0
  return stripped.split(/\s+/).filter(w => w.length > 2).length
}

// ─── Delegation detection ─────────────────────────────────────────────────────

/**
 * Returns true for thin wrapper files that delegate content to a shared component.
 * Pattern: file is short AND default export just renders one imported component.
 * e.g. `export default function Page() { return <FooPage slug={SLUG} /> }`
 */
function isDelegationWrapper(source) {
  const lines = source.split('\n').filter(l => l.trim())
  if (lines.length > 20) return false
  // Has a function call as metadata value: export const metadata = someFunc(...)
  const hasDelegatedMetadata = /export\s+const\s+metadata\s*=\s*\w+\s*\(/.test(source)
  // Default export returns a single JSX component
  const hasSingleRender = /export\s+default\s+function\s+\w+\s*\(\s*\)\s*\{\s*return\s+<\w/.test(source)
  return hasDelegatedMetadata || hasSingleRender
}

// ─── Metadata checks ──────────────────────────────────────────────────────────

function checkMetadata(source, route) {
  const issues = []

  // Delegation wrappers have valid metadata in the component they delegate to
  if (isDelegationWrapper(source)) return issues

  const hasBuildPageMetadata = /buildPageMetadata\s*\(/.test(source)
  const hasMetadataExport = /export\s+const\s+metadata/.test(source)
  const hasGenerateMetadata = /export\s+(async\s+)?function\s+generateMetadata/.test(source)

  if (!hasBuildPageMetadata && !hasMetadataExport && !hasGenerateMetadata) {
    issues.push({
      type: 'missing_metadata',
      severity: 'warning',
      route,
      detail: 'No metadata export found (buildPageMetadata, metadata, or generateMetadata)',
    })
    return issues
  }

  // Metadata supplied by a helper provides title + description for us.
  // Recognize both `buildPageMetadata({...})` and a spread of any `*Metadata()`
  // generator (e.g. `{ ...generateSeoEntryMetadata(route) }`). When present, the
  // literal title/description sub-checks below would false-positive, so skip them.
  const hasSpreadMetadataHelper = /\.\.\.\s*[A-Za-z_$][\w$]*[Mm]etadata\w*\s*\(/.test(source)
  if (hasBuildPageMetadata || hasSpreadMetadataHelper) return issues

  // For inline plain-object metadata, accept any non-empty value (quoted string,
  // template literal, or an identifier/variable like `title: articleTitle`).
  const titleMatch = /title\s*:\s*['"`A-Za-z_$]/.test(source)
  if (!titleMatch) {
    issues.push({
      type: 'missing_metadata',
      severity: 'warning',
      route,
      detail: 'Metadata title may be missing',
    })
  }

  const descMatch = /description\s*:\s*['"`A-Za-z_$]/.test(source)
  if (!descMatch) {
    issues.push({
      type: 'missing_metadata',
      severity: 'warning',
      route,
      detail: 'Metadata description may be missing',
    })
  }

  return issues
}

// ─── Thin page check ─────────────────────────────────────────────────────────

function checkThin(source, route, wordCount) {
  // Delegation wrappers are thin by design — content lives in the shared component
  if (isDelegationWrapper(source)) return []
  if (wordCount < THIN_THRESHOLD) {
    return [{
      type: 'thin_page',
      severity: 'warning',
      route,
      detail: `Estimated word count: ~${wordCount} (threshold: ${THIN_THRESHOLD})`,
    }]
  }
  return []
}

// ─── Affiliate tag check ─────────────────────────────────────────────────────

function checkAffiliateHardcoding(source, route) {
  const issues = []
  // Look for hardcoded affiliate tag strings (not via AFFILIATE_TAGS)
  // Pattern: tag= followed by a quoted string that isn't referencing a variable
  const hardcodedPattern = /tag=["']([^"']+)["']/g
  let m
  while ((m = hardcodedPattern.exec(source)) !== null) {
    const tag = m[1]
    if (tag !== APPROVED_TAG) {
      issues.push({
        type: 'hardcoded_affiliate_tag',
        severity: 'warning',
        route,
        detail: `Hardcoded affiliate tag: "${tag}" (approved: "${APPROVED_TAG}")`,
      })
    }
  }

  // Also catch patterns like amazon.com/...?tag= hardcoded in template literals without AFFILIATE_TAGS
  const inlineTagPattern = /`[^`]*tag=([a-z0-9-]{5,})[^`]*`/g
  while ((m = inlineTagPattern.exec(source)) !== null) {
    const tag = m[1]
    if (tag !== APPROVED_TAG && !source.includes('AFFILIATE_TAGS')) {
      issues.push({
        type: 'hardcoded_affiliate_tag',
        severity: 'warning',
        route,
        detail: `Possibly hardcoded affiliate tag in template literal: "${tag}"`,
      })
    }
  }

  return issues
}

// ─── Build route set ─────────────────────────────────────────────────────────

/**
 * Collect the actual built routes from a static-export `out/` directory.
 * Each `out/<path>/index.html` corresponds to the route `/<path>`.
 *
 * This is the authoritative source of truth for which routes exist, including
 * dynamically-generated `[slug]` routes (compare/guides/articles) that cannot be
 * enumerated from `app/**` source alone. It is additive and gated on `out/`
 * existing, so pre-build runs keep their previous (source-only) behavior.
 */
function collectBuiltRoutes() {
  const routes = new Set()
  const outDir = path.join(ROOT, 'out')
  if (!fs.existsSync(outDir)) return routes

  function walk(dir, prefix) {
    let entries
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name === '_next') continue
        walk(path.join(dir, entry.name), `${prefix}/${entry.name}`)
      } else if (entry.name === 'index.html') {
        routes.add(prefix || '/')
      }
    }
  }
  walk(outDir, '')
  return routes
}

function buildKnownRouteSet(pages) {
  // Static routes from app/ directory structure
  const routes = new Set()

  // Add our audited pages
  for (const p of pages) routes.add(p.route)

  // Union in real built routes (recognizes dynamic [slug] routes when out/ exists)
  for (const r of collectBuiltRoutes()) routes.add(r)

  // Scan all app/ directories for additional routes
  function walkApp(dir, prefix) {
    if (!fs.existsSync(dir)) return
    const entries = fs.readdirSync(dir, { withFileTypes: true })
    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (entry.name.startsWith('(')) continue // route groups
      if (entry.name.startsWith('[')) continue // dynamic routes — can't validate
      const route = `${prefix}/${entry.name}`
      routes.add(route)
      walkApp(path.join(dir, entry.name), route)
    }
  }
  walkApp(path.join(ROOT, 'app'), '')

  // Add known dynamic routes (workbook-driven — assume valid if well-formed)
  // We won't validate links to /herbs/:slug or /compounds/:slug here
  // since those are too numerous to enumerate without the full data pipeline

  return routes
}

// ─── Internal link check ─────────────────────────────────────────────────────

function checkBrokenInternalLinks(source, route, knownRoutes) {
  const issues = []

  // Match href="/path" patterns — skip anchors (#), external (https://), mailto:
  const hrefPattern = /href=["'](\/[^"'#\s]+)["']/g
  // Also match href={`/path`} template literal patterns
  const templateHrefPattern = /href=\{`(\/[^`#\s{]+)`\}/g

  const seen = new Set()

  const checkHref = (href) => {
    // Skip external-looking paths that start with //
    if (href.startsWith('//')) return
    // Normalize trailing slash
    const normalized = href.replace(/\/$/, '') || '/'
    // Skip if dynamic (contains template ${...})
    if (normalized.includes('${')) return
    // Skip query strings
    const pathOnly = normalized.split('?')[0]
    if (seen.has(pathOnly)) return
    seen.add(pathOnly)

    // Check if this exact path or a prefix exists in known routes
    if (!knownRoutes.has(pathOnly)) {
      // It might be a valid page we didn't enumerate (e.g. workbook-driven)
      // Only flag if it looks like our auditable families
      const auditablePrefixes = ['/articles/', '/guides/', '/compare/']
      if (auditablePrefixes.some(p => pathOnly.startsWith(p))) {
        issues.push({
          type: 'broken_internal_link',
          severity: 'warning',
          route,
          detail: `Link to "${pathOnly}" not found in known routes`,
        })
      }
    }
  }

  let m
  while ((m = hrefPattern.exec(source)) !== null) checkHref(m[1])
  while ((m = templateHrefPattern.exec(source)) !== null) checkHref(m[1])

  return issues
}

// ─── Orphan check ────────────────────────────────────────────────────────────

function buildBacklinkSet() {
  // Collect all internal links across .tsx, .ts, .md files in app/, components/, lib/, docs/
  const links = new Set()
  const searchDirs = ['app', 'components', 'lib', 'docs', 'data']

  function walkForLinks(dir) {
    if (!fs.existsSync(dir)) return
    let entries
    try { entries = fs.readdirSync(dir, { withFileTypes: true }) } catch { return }
    for (const entry of entries) {
      if (entry.isDirectory()) {
        if (entry.name === 'node_modules' || entry.name === '.next' || entry.name === 'out') continue
        walkForLinks(path.join(dir, entry.name))
        continue
      }
      const ext = path.extname(entry.name)
      if (!['.tsx', '.ts', '.js', '.mjs', '.md', '.mdx', '.json'].includes(ext)) continue
      const filePath = path.join(dir, entry.name)
      let src
      try { src = fs.readFileSync(filePath, 'utf-8') } catch { continue }

      // href="/..." JSX attribute patterns
      const hrefPattern = /href=["'](\/[^"'#\s?]+)["']/g
      let m
      while ((m = hrefPattern.exec(src)) !== null) {
        links.add(m[1].replace(/\/$/, '') || '/')
      }
      // href: '/...' object-property patterns (link data in arrays/config, e.g.
      // `{ href: '/guides/elderberry', title: '...' }`) — single or double quoted.
      const hrefPropPattern = /href\s*:\s*["'](\/[^"'#\s?]+)["']/g
      while ((m = hrefPropPattern.exec(src)) !== null) {
        links.add(m[1].replace(/\/$/, '') || '/')
      }
      // Markdown link patterns [text](/path)
      const mdPattern = /\]\((\/[^)#\s?]+)\)/g
      while ((m = mdPattern.exec(src)) !== null) {
        links.add(m[1].replace(/\/$/, '') || '/')
      }
      // Sitemap / JSON string references
      const strPattern = /"(\/(?:articles|guides|compare)\/[^"#\s?]+)"/g
      while ((m = strPattern.exec(src)) !== null) {
        links.add(m[1].replace(/\/$/, '') || '/')
      }
    }
  }

  for (const d of searchDirs) walkForLinks(path.join(ROOT, d))
  // Also check scripts/ for any route references
  walkForLinks(path.join(ROOT, 'scripts'))

  return links
}

function checkOrphaned(route, backlinkSet) {
  if (!backlinkSet.has(route)) {
    return [{
      type: 'orphaned_page',
      severity: 'warning',
      route,
      detail: `No inbound links found to "${route}" in .tsx/.ts/.md/.json files`,
    }]
  }
  return []
}

// ─── Duplicate slug check ────────────────────────────────────────────────────

function findDuplicateSlugs(pages) {
  const slugMap = new Map()
  for (const p of pages) {
    if (!slugMap.has(p.slug)) slugMap.set(p.slug, [])
    slugMap.get(p.slug).push(p.family)
  }
  const issues = []
  for (const [slug, families] of slugMap) {
    if (families.length > 1) {
      issues.push({
        type: 'duplicate_slug',
        severity: 'warning',
        route: `/${families[0]}/${slug}`,
        detail: `Slug "${slug}" exists in multiple families: ${families.join(', ')}`,
      })
    }
  }
  return issues
}

// ─── Main ────────────────────────────────────────────────────────────────────

function run() {
  const startTime = Date.now()
  console.log('\n── Content Audit: The Hippie Scientist ──\n')

  const pages = collectPages()
  console.log(`Collected ${pages.length} static pages to audit.`)

  // Build reference data
  const knownRoutes = buildKnownRouteSet(pages)
  console.log('Building backlink index...')
  const backlinkSet = buildBacklinkSet()

  const allIssues = []

  // Per-page checks
  for (const page of pages) {
    let source
    try {
      source = fs.readFileSync(page.pagePath, 'utf-8')
    } catch {
      allIssues.push({
        type: 'read_error',
        severity: 'warning',
        route: page.route,
        detail: `Could not read ${page.pagePath}`,
      })
      continue
    }

    const wordCount = countWords(source, page.pagePath)

    allIssues.push(
      ...checkMetadata(source, page.route),
      ...checkThin(source, page.route, wordCount),
      ...checkAffiliateHardcoding(source, page.route),
      ...checkBrokenInternalLinks(source, page.route, knownRoutes),
      ...checkOrphaned(page.route, backlinkSet),
    )
  }

  // Cross-page checks
  allIssues.push(...findDuplicateSlugs(pages))

  // Summarise
  const summary = {
    pagesAudited: pages.length,
    duplicateSlugs: allIssues.filter(i => i.type === 'duplicate_slug').length,
    missingMetadata: allIssues.filter(i => i.type === 'missing_metadata').length,
    thinPages: allIssues.filter(i => i.type === 'thin_page').length,
    orphanedPages: allIssues.filter(i => i.type === 'orphaned_page').length,
    brokenInternalLinks: allIssues.filter(i => i.type === 'broken_internal_link').length,
    hardcodedAffiliateTags: allIssues.filter(i => i.type === 'hardcoded_affiliate_tag').length,
  }

  const contentAudit = {
    generatedAt: new Date().toISOString(),
    summary,
    issues: allIssues,
  }

  const siteHealth = {
    generatedAt: new Date().toISOString(),
    summary,
    totalIssues: allIssues.length,
    issuesByType: Object.fromEntries(
      ['duplicate_slug', 'missing_metadata', 'thin_page', 'orphaned_page', 'broken_internal_link', 'hardcoded_affiliate_tag']
        .map(type => [type, allIssues.filter(i => i.type === type).length])
    ),
    issuesByFamily: Object.fromEntries(
      ['articles', 'guides', 'compare'].map(family => [
        family,
        allIssues.filter(i => i.route?.startsWith(`/${family}/`)).length,
      ])
    ),
    durationMs: Date.now() - startTime,
  }

  // Write reports
  const reportsDir = path.join(ROOT, 'ops', 'reports')
  fs.mkdirSync(reportsDir, { recursive: true })
  fs.writeFileSync(path.join(reportsDir, 'content-audit.json'), JSON.stringify(contentAudit, null, 2))
  fs.writeFileSync(path.join(reportsDir, 'site-health.json'), JSON.stringify(siteHealth, null, 2))

  // Console summary
  console.log('\n── Audit Summary ─────────────────────────────────────────')
  console.log(`  Pages audited:           ${summary.pagesAudited}`)
  console.log(`  Duplicate slugs:         ${summary.duplicateSlugs}`)
  console.log(`  Missing metadata:        ${summary.missingMetadata}`)
  console.log(`  Thin pages (<${THIN_THRESHOLD}w):     ${summary.thinPages}`)
  console.log(`  Orphaned pages:          ${summary.orphanedPages}`)
  console.log(`  Broken internal links:   ${summary.brokenInternalLinks}`)
  console.log(`  Hardcoded affiliate tags:${summary.hardcodedAffiliateTags}`)
  console.log(`  Total issues:            ${allIssues.length}`)
  console.log(`\n  Reports written to ops/reports/`)
  console.log('──────────────────────────────────────────────────────────\n')

  if (allIssues.length > 0) {
    console.log('Top issues (first 20):')
    for (const issue of allIssues.slice(0, 20)) {
      console.log(`  [${issue.type}] ${issue.route}: ${issue.detail}`)
    }
    if (allIssues.length > 20) {
      console.log(`  ... and ${allIssues.length - 20} more (see ops/reports/content-audit.json)`)
    }
    console.log()
  }

  // Always exit 0 — audit is warning-only
  process.exit(0)
}

function isMainModule(entryPath, moduleUrl = import.meta.url) {
  if (!entryPath) return false
  try {
    return fs.realpathSync(entryPath) === fs.realpathSync(fileURLToPath(moduleUrl))
  } catch {
    return false
  }
}

if (isMainModule(process.argv[1])) {
  run()
}

export { countWords, isMainModule }
