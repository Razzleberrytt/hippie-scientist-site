import { existsSync, readdirSync, readFileSync } from 'node:fs'
import path from 'node:path'

/**
 * What each static App Router page declares about its own indexability.
 *
 * The sitemap used to decide inclusion from hand-maintained literals, so it
 * drifted in both directions against what the pages actually render:
 *
 * - it advertised URLs whose pages render `noindex` or canonicalise elsewhere
 *   (`/articles/best-supplements-for-sleep/` canonicalises to the guides copy,
 *   `/guides/focus/best-supplements-for-focus/` to `best-nootropics-for-focus`);
 * - it omitted real pages that render `index, follow` and self-canonical, because
 *   nobody added them to the literal list when they shipped.
 *
 * Reading the declaration from the page source means a new page is advertised —
 * or excluded — on the same terms it publishes itself, without a second list to
 * maintain. Build/server only (`node:fs`); do not import from client code.
 *
 * The rendered HTML remains the final authority: `scripts/ci/validate-sitemap.mjs`
 * re-checks the built pages, so any canonical expressed in a way this scanner
 * cannot see is still caught before release.
 */
export type DeclaredRouteVisibility = {
  route: string
  pageFile: string
  /** False when the page declares noindex (directly or via force-dynamic). */
  indexable: boolean
  /** The canonical path the page declares as a literal, when it declares one. */
  canonicalPath: string | null
}

const SKIP_DIR_NAMES = new Set(['__tests__', 'api'])

/** Page-source signals that the route is not meant to be indexed. */
const NOINDEX_PATTERNS = [
  /robots\s*:\s*\{\s*index\s*:\s*false/,
  /robots\s*:\s*["'][^"']*noindex/i,
  /dynamic\s*=\s*["']force-dynamic["']/,
]

/**
 * SEO entry pages declare the URL they consolidate into as a `CANONICAL_PATH`
 * const (see `app/seo-entry-pages.tsx`). Most point at themselves; the ones that
 * do not are duplicates kept only for their inbound links.
 */
const CANONICAL_PATH_PATTERN = /^const CANONICAL_PATH\s*=\s*["']([^"']+)["']/m

/**
 * The standard Next metadata idiom. Only a string literal is read: a canonical
 * built from a template or a variable is left to the rendered-HTML validators
 * rather than guessed at here.
 */
const ALTERNATES_CANONICAL_PATTERN = /alternates\s*:\s*\{[^}]*?canonical\s*:\s*["']([^"'`]+)["']/

/**
 * A page whose whole body re-exports another route's page is that route's
 * duplicate and inherits its canonical, e.g.
 * `export { metadata, default } from '../../guides/sleep/best-supplements-for-sleep/page'`.
 */
const PAGE_REEXPORT_PATTERN = /^export\s*\{[^}]*\}\s*from\s*["']([^"']+)["']/m

export function normalizeVisibilityRoute(value: string): string {
  const pathOnly = (value.split(/[?#]/)[0] || '/').trim()
  const withSlash = pathOnly.startsWith('/') ? pathOnly : `/${pathOnly}`
  return withSlash.length > 1 ? withSlash.replace(/\/+$/, '') : '/'
}

function findPageFile(dirPath: string): string | null {
  for (const name of ['page.tsx', 'page.ts']) {
    const filePath = path.join(dirPath, name)
    if (existsSync(filePath)) return filePath
  }
  return null
}

/** Maps an absolute page file back to the route it serves, or null if it is outside app/. */
function routeForPageFile(pageFile: string, appDir: string): string | null {
  const relative = path.relative(appDir, path.dirname(pageFile))
  if (!relative || relative.startsWith('..')) return relative === '' ? '/' : null
  const segments = relative
    .split(path.sep)
    .filter((segment) => segment && !/^\(.*\)$/.test(segment))
  return segments.length > 0 ? `/${segments.join('/')}` : '/'
}

function declaredCanonicalPath(source: string, pageFile: string, appDir: string): string | null {
  const literal = source.match(CANONICAL_PATH_PATTERN)
  if (literal?.[1]) return normalizeVisibilityRoute(literal[1])

  const alternates = source.match(ALTERNATES_CANONICAL_PATTERN)
  if (alternates?.[1] && alternates[1].startsWith('/')) return normalizeVisibilityRoute(alternates[1])

  const reexport = source.match(PAGE_REEXPORT_PATTERN)
  if (reexport?.[1]?.startsWith('.')) {
    const targetPageFile = path.resolve(path.dirname(pageFile), `${reexport[1]}.tsx`)
    const targetRoute = routeForPageFile(targetPageFile, appDir)
    if (targetRoute) return targetRoute
  }

  return null
}

/**
 * Reads every static route under `app/` and what it declares about its own
 * indexability. Dynamic segments are skipped: their pages resolve visibility per
 * slug at build time and the sitemap already sources them from runtime records.
 */
export function collectDeclaredRouteVisibility(root: string = process.cwd()): DeclaredRouteVisibility[] {
  const appDir = path.join(root, 'app')
  const results: DeclaredRouteVisibility[] = []

  const walk = (dirPath: string, segments: string[]) => {
    let entries
    try {
      entries = readdirSync(dirPath, { withFileTypes: true })
    } catch {
      return
    }

    const pageFile = findPageFile(dirPath)
    if (pageFile) {
      const cleanSegments = segments.filter((segment) => !/^\(.*\)$/.test(segment))
      const route = cleanSegments.length > 0 ? `/${cleanSegments.join('/')}` : '/'
      let source = ''
      try {
        source = readFileSync(pageFile, 'utf8')
      } catch {
        source = ''
      }
      results.push({
        route,
        pageFile,
        indexable: !NOINDEX_PATTERNS.some((pattern) => pattern.test(source)),
        canonicalPath: declaredCanonicalPath(source, pageFile, appDir),
      })
    }

    for (const entry of entries) {
      if (!entry.isDirectory()) continue
      if (SKIP_DIR_NAMES.has(entry.name)) continue
      if (/^\[/.test(entry.name)) continue
      walk(path.join(dirPath, entry.name), [...segments, entry.name])
    }
  }

  walk(appDir, [])
  return results
}

export function buildRouteVisibilityIndex(root: string = process.cwd()): Map<string, DeclaredRouteVisibility> {
  return new Map(collectDeclaredRouteVisibility(root).map((entry) => [entry.route, entry]))
}

/**
 * True when the page at `route` declares itself indexable and canonical to itself.
 * Routes with no static page of their own (dynamic families, MDX-backed routes)
 * are not judged here and return false — callers own those separately.
 */
export function declaresSelfCanonicalIndexable(
  route: string,
  index: Map<string, DeclaredRouteVisibility>,
): boolean {
  const normalized = normalizeVisibilityRoute(route)
  const declared = index.get(normalized)
  if (!declared) return false
  if (!declared.indexable) return false
  return declared.canonicalPath === null || declared.canonicalPath === normalized
}

/**
 * True when the page at `route` explicitly disqualifies itself from the sitemap —
 * it declares noindex, or a canonical pointing at a different URL. Unknown routes
 * return false so this can filter entries the scanner does not own.
 */
export function declaresSitemapIneligible(
  route: string,
  index: Map<string, DeclaredRouteVisibility>,
): boolean {
  const normalized = normalizeVisibilityRoute(route)
  const declared = index.get(normalized)
  if (!declared) return false
  if (!declared.indexable) return true
  return declared.canonicalPath !== null && declared.canonicalPath !== normalized
}
