import { existsSync, readdirSync } from 'node:fs'
import path from 'node:path'

/**
 * The comparison pages that are ACTUALLY built as static routes — the single
 * source of truth for "does /guides/compare/<slug> exist".
 *
 * Under `output: 'export'`, a `/guides/compare/<slug>` page exists **iff**
 * `app/guides/compare/<slug>/page.tsx` exists. There is no `[slug]` dynamic route
 * and no `generateStaticParams`, so the config comparison lists
 * (`COMPARE_COMBINATIONS`, `generatedComparisons`, `supplementComparisons`) enumerate
 * *intended* comparisons that are NOT built as pages. Advertising those anywhere
 * crawlable (sitemap, internal links) produces hard 404s — the historical
 * `/guides/compare/*` "Not found (404)" cluster in Search Console.
 *
 * Scanning the filesystem here means callers can never drift from what the build
 * actually emits. Server/build-only (uses `node:fs`); do not import from client code.
 */
export function getBuiltCompareSlugs(root: string = process.cwd()): string[] {
  const dir = path.join(root, 'app/guides/compare')
  if (!existsSync(dir)) return []
  try {
    return readdirSync(dir, { withFileTypes: true })
      .filter((entry) => {
        if (!entry.isDirectory()) return false
        if (/^\[/.test(entry.name)) return false // dynamic [slug] route (none today)
        if (entry.name === 'dynamic') return false // client-side matrix, not a per-pair page
        return existsSync(path.join(dir, entry.name, 'page.tsx'))
      })
      .map((entry) => entry.name)
      .sort()
  } catch {
    return []
  }
}
